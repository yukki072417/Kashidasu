const bookModel = require("../model/bookModel");

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

module.exports = {
  createBook,
  getBook,
  updateBook,
  deleteBook,
};
