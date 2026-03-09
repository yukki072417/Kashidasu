const bookModel = require("../model/bookModel");
const loanModel = require("../model/loanModel");

async function createBook(req, res, next) {
  const { isbn, title, author } = req.body;
  try {
    await bookModel.createBook(isbn, title, author);
    res.json({ result: "SUCCESS" });
  } catch (error) {
    console.error("Error creating book:", error);
    res.status(500).json({ result: "FAILED", message: error.message });
  }
}

async function getBook(req, res, next) {
  console.log("getBook function called with query:", req.query);
  const { isbn, manual_search_mode } = req.query;
  try {
    if (manual_search_mode) {
      // 特定の書籍を取得
      const { success, book } = await bookModel.getBookByIsbn(isbn);
      if (success) {
        res.json(book);
      } else {
        res.status(404).json({ result: "FAILED", message: "Book not found." });
      }
    } else {
      // 全書籍取得の場合
      console.log("Getting all books");
      const allBooks = await bookModel.getAllBooks();
      const count = allBooks.length;

      // ページングパラメータ
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 30;
      const offset = (page - 1) * limit;

      // ページング処理
      const paginatedBooks = allBooks.slice(offset, offset + limit);

      console.log("Returning", paginatedBooks.length, "books");
      res.json([{ "COUNT(isbn)": count }, ...paginatedBooks]);
    }
  } catch (error) {
    console.error("Error getting book:", error);
    res.status(500).json({ result: "FAILED", message: error.message });
  }
}

async function getAllBooks(req, res, next) {
  try {
    const allBooks = await bookModel.getAllBooks();
    const count = allBooks.length;

    // ページングパラメータ
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const offset = (page - 1) * limit;

    // ページング処理
    const paginatedBooks = allBooks.slice(offset, offset + limit);

    // レスポンス形式
    res.json([{ "COUNT(isbn)": count }, ...paginatedBooks]);
  } catch (error) {
    console.error("Error getting all books:", error);
    res.status(500).json({ result: "FAILED", message: error.message });
  }
}

async function getLoanByIsbn(req, res, next) {
  try {
    const { isbn } = req.query; // クエリパラメータから取得

    if (!isbn) {
      return res.status(400).json({
        success: false,
        message: "isbn is required",
      });
    }

    const activeLoans = await loanModel.getActiveLoans(isbn);

    if (activeLoans.length === 0) {
      return res.json({
        success: true,
        data: null,
        message: "No active loans found for this ISBN",
      });
    }

    // 書籍情報を取得して貸出情報を付加
    const loanWithBookInfo = await Promise.all(
      activeLoans.map(async (loan) => {
        const book = await bookModel.getBookByIsbn(loan.bookId);
        const loanDate = new Date(loan.loanDate);
        const daysBorrowed = loan.loanDate
          ? Math.floor(
              (new Date() - new Date(loan.loanDate)) / (1000 * 60 * 60 * 24),
            )
          : 0;

        return {
          loanId: loan.loanId,
          bookId: loan.bookId,
          userId: loan.userId,
          loanDate: loan.loanDate,
          returnDate: loan.returnDate,
          daysBorrowed: daysBorrowed,
          bookInfo: book.success ? book.book : null,
        };
      }),
    );

    res.json({
      success: true,
      data: loanWithBookInfo,
    });
  } catch (error) {
    console.error("Error getting loan by ISBN:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function getAllLoans(req, res, next) {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const allLoans = await loanModel.getUserLoans();

    // アクティブな貸出のみをフィルタ
    const activeLoans = allLoans.filter((loan) => !loan.returnDate);

    // 書籍情報を取得して貸出情報を付加
    const loansWithBookInfo = await Promise.all(
      activeLoans.map(async (loan) => {
        const book = await bookModel.getBookByIsbn(loan.bookId);
        const loanDate = new Date(loan.loanDate);
        const daysBorrowed = loan.loanDate
          ? Math.floor(
              (new Date() - new Date(loan.loanDate)) / (1000 * 60 * 60 * 24),
            )
          : 0;

        return {
          loanId: loan.loanId,
          bookId: loan.bookId,
          userId: loan.userId,
          loanDate: loan.loanDate,
          returnDate: loan.returnDate,
          daysBorrowed: daysBorrowed,
          bookInfo: book.success ? book.book : null,
        };
      }),
    );

    // 指定された件数に制限
    const limitedLoans = loansWithBookInfo.slice(0, limit);

    res.json({
      success: true,
      data: limitedLoans,
      count: limitedLoans.length,
      totalActive: activeLoans.length,
    });
  } catch (error) {
    console.error("Error getting all loans:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function updateBook(req, res, next) {
  const { before_isbn, isbn, title, author } = req.body;
  try {
    // bookModel.updateBook は before_isbn を使わないので、isbn が変更された場合は
    // 削除＆新規作成が必要になるが、ここでは単純な更新として扱う
    await bookModel.updateBook(isbn, title, author);
    res.json({ result: "SUCCESS" });
  } catch (error) {
    console.error("Error updating book:", error);
    res.status(500).json({ result: "FAILED", message: error.message });
  }
}

async function deleteBook(req, res, next) {
  const { isbn, all_delete } = req.body;
  try {
    if (all_delete) {
      await bookModel.deleteAllBooks();
      res.json({ result: "SUCCESS", message: "All books deleted." });
    } else {
      await bookModel.deleteBook(isbn);
      res.json({ result: "SUCCESS", message: "Book deleted." });
    }
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({ result: "FAILED", message: error.message });
  }
}

async function lend(req, res, next) {
  const { user_id, isbn } = req.body;
  console.log("Lend request:", { user_id, isbn });

  try {
    // loanModelのトランザクション機能を使用して貸出処理
    const loanDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD形式
    const result = await loanModel.lendBook(isbn, user_id, loanDate);

    console.log("Loan result:", result);
    res.json({ success: true, message: "本が正常に貸出されました" });
  } catch (error) {
    console.error("Error lending book:", error);

    // エラーメッセージの処理
    let errorMessage = error.message;
    if (error.message === "BOOK_NOT_EXIST") {
      errorMessage = "指定された本が見つかりません";
    } else if (error.message === "BOOK_ALREADY_LENDING") {
      errorMessage = "この本はすでに貸出中です";
    }

    res.status(500).json({ success: false, message: errorMessage });
  }
}

// 返却機能（ReadCode.jsから呼び出される）
async function returnBook(req, res, next) {
  const { user_id, isbn } = req.body;
  console.log("Return request:", { user_id, isbn });

  try {
    // loanModelのトランザクション機能を使用して返却処理
    const returnDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD形式
    const result = await loanModel.returnBook(isbn, user_id, returnDate);

    console.log("Return result:", result);
    res.json({ success: true, message: "本が正常に返却されました" });
  } catch (error) {
    console.error("Error returning book:", error);

    // エラーメッセージの処理
    let errorMessage = error.message;
    if (error.message === "BOOK_NOT_EXIST") {
      errorMessage = "指定された本が見つかりません";
    } else if (error.message === "BOOK_NOT_LENDING") {
      errorMessage = "この本は貸出されていません";
    }

    res.status(500).json({ success: false, message: errorMessage });
  }
}

// 検索機能
async function search(req, res, next) {
  const { query, searchType } = req.body; // searchType: 'title', 'author', 'isbn'
  try {
    let result;

    switch (searchType) {
      case "isbn":
        result = await bookModel.getBookByIsbn(query);
        break;
      case "title":
        result = await bookModel.getBookByName(query);
        break;
      case "author":
        result = await bookModel.getBookByAuthor(query);
        break;
      default:
        return res
          .status(400)
          .json({ result: "FAILED", message: "Invalid search type." });
    }

    if (result.success) {
      res.json({ result: "SUCCESS", data: result.book });
    } else {
      res.json({ result: "SUCCESS", data: [] }); // 検索結果がない場合は空配列
    }
  } catch (error) {
    console.error("Error searching book:", error);
    res.status(500).json({ result: "FAILED", message: error.message });
  }
}

module.exports = {
  // 本のエンティティ操作
  createBook,
  getBook,
  getAllBooks,
  updateBook,
  deleteBook,
  search,

  // 貸出情報取得（別APIエンドポイント）
  getLoanByIsbn,
  getAllLoans,

  // 貸出・返却操作（loanModel経由）
  lend,
  returnBook,
};
