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
      // ページング処理を考慮した findAll の呼び出し (簡易実装)
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

// 貸出機能（ReadCode.jsから呼び出される）
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
  updateBook,
  deleteBook,
  lend,
  returnBook,
  search,
};
