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
  const { isbn, manual_search_mode } = req.body; // book_id -> isbn
  try {
    if (manual_search_mode) {
      const { success, book } = await bookModel.getBookByIsbn(isbn);
      if (success) {
        res.json(book);
      } else {
        res.status(404).json({ result: "FAILED", message: "Book not found." });
      }
    } else {
      const allBooks = await bookModel.getAllBooks(); // getAllBooks は後で定義する
      const count = allBooks.length;
      // 実際には book_num を使ってスライスする
      const books = allBooks.slice(0, 30); // 仮で最初の30件
      res.json([{ "COUNT(isbn)": count }, ...books]);
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

async function getBooksWithLoanInfo(req, res, next) {
  try {
    const allBooks = await bookModel.getAllBooks();
    const allLoans = await loanModel.getUserLoans(); // すべての貸出情報を取得

    // 各書籍に貸出情報を付加
    const booksWithLoanInfo = allBooks.map((book) => {
      const activeLoan = allLoans.find(
        (loan) => loan.bookId === book.isbn && !loan.returnDate,
      );

      return {
        ...book,
        isBorrowed: activeLoan ? true : false,
        userId: activeLoan ? activeLoan.userId : null,
        loanDate: activeLoan ? activeLoan.loanDate : null,
        returnDate: activeLoan ? activeLoan.returnDate : null,
      };
    });

    const count = booksWithLoanInfo.length;

    // ページング処理
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const offset = (page - 1) * limit;
    const paginatedBooks = booksWithLoanInfo.slice(offset, offset + limit);

    res.json([{ "COUNT(isbn)": count }, ...paginatedBooks]);
  } catch (error) {
    console.error("Error getting books with loan info:", error);
    res.status(500).json({ result: "FAILED", message: error.message });
  }
}

async function getOverdueBooks(req, res, next) {
  try {
    const overdueBooks = await loanModel.getOverdueBooks();

    // 期限切れ本の書籍情報を取得
    const booksWithOverdueInfo = await Promise.all(
      overdueBooks.map(async (loan) => {
        const book = await bookModel.getBookByIsbn(loan.bookId);
        const loanDate = new Date(loan.loanDate);
        const dueDate = new Date(loan.loanDate);
        dueDate.setDate(dueDate.getDate() + 14);
        const daysOverdue = Math.floor(
          (new Date() - dueDate) / (1000 * 60 * 60 * 24),
        );

        return {
          ...book,
          loanId: loan.loanId,
          userId: loan.userId,
          loanDate: loan.loanDate,
          returnDate: loan.returnDate,
          daysOverdue: daysOverdue,
        };
      }),
    );

    const count = booksWithOverdueInfo.length;

    // ページング処理
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const offset = (page - 1) * limit;
    const paginatedBooks = booksWithOverdueInfo.slice(offset, offset + limit);

    res.json([{ "COUNT(isbn)": count }, ...paginatedBooks]);
  } catch (error) {
    console.error("Error getting overdue books:", error);
    res.status(500).json({ result: "FAILED", message: error.message });
  }
}

async function getLoanByIsbn(req, res, next) {
  try {
    const { isbn } = req.params;

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
    // 書籍が存在するか確認
    const { success, book } = await bookModel.getBookByIsbn(isbn);
    console.log("Book lookup result:", { success, book });

    if (!success) {
      return res.json({ success: false, message: "BOOK_NOT_EXIST" });
    }

    // loanデータベースで貸出状態を確認
    const isCurrentlyLoaned = await loanModel.isBookCurrentlyLoaned(isbn);
    console.log("Book loan status from loan DB:", isCurrentlyLoaned);

    if (isCurrentlyLoaned) {
      return res.json({ success: false, message: "BOOK_ALREADY_LENDING" });
    }

    // 書籍を貸出中に更新
    console.log("Updating book status...");
    await bookModel.updateBook(isbn, book.title, book.author, true);

    // 貸出記録を作成
    const loanId = `loan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const loanDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD形式
    console.log("Creating loan record:", { loanId, isbn, user_id, loanDate });

    await loanModel.createLoan(isbn, user_id, loanDate);

    res.json({ success: true, message: "本が正常に貸出されました" });
  } catch (error) {
    console.error("Error lending book:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

// 返却機能（ReadCode.jsから呼び出される）
async function returnBook(req, res, next) {
  const { user_id, isbn } = req.body;
  console.log("Return request:", { user_id, isbn });

  try {
    // 書籍が存在するか確認
    const { success, book } = await bookModel.getBookByIsbn(isbn);
    console.log("Book lookup result:", { success, book });

    if (!success) {
      return res.json({ success: false, message: "BOOK_NOT_EXIST" });
    }

    // loanデータベースで貸出状態を確認
    const isCurrentlyLoaned = await loanModel.isBookCurrentlyLoaned(isbn);
    console.log("Book loan status from loan DB:", isCurrentlyLoaned);

    if (!isCurrentlyLoaned) {
      return res.json({ success: false, message: "BOOK_NOT_LENDING" });
    }

    // 書籍を利用可能に更新
    console.log("Updating book status to available...");
    await bookModel.updateBook(isbn, book.title, book.author, false);

    // 貸出記録を更新（返却日を設定）
    console.log("Finding active loan...");
    const activeLoan = await loanModel.findActiveLoan(isbn, user_id);
    console.log("Active loan found:", activeLoan);

    if (activeLoan) {
      const returnDate = new Date().toISOString().split("T")[0];
      console.log("Updating loan with return date:", returnDate);
      await loanModel.updateLoan(activeLoan.loanId, { returnDate });
    }

    res.json({ success: true, message: "本が正常に返却されました" });
  } catch (error) {
    console.error("Error returning book:", error);
    res.status(500).json({ success: false, message: error.message });
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
  createBook,
  getBook,
  getAllBooks,
  getOverdueBooks,
  getLoanByIsbn,
  getAllLoans,
  updateBook,
  deleteBook,
  lend,
  returnBook,
  search,
};
