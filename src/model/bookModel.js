/**
 * 書籍モデル
 * 書籍のデータベース操作を管理する
 */
const BookModel = require("../db/models/book");

const bookModel = new BookModel();

/**
 * 新規書籍を作成する関数
 * @param {string} isbn - ISBN番号
 * @param {string} title - 書籍タイトル
 * @param {string} author - 著者名
 * @returns {Promise<object>} - 作成結果
 */
async function createBook(isbn, title, author) {
  try {
    if (isbn == null || title == null || author == null) {
      throw new Error("Cannot empty isbn, title, and author.");
    }

    await bookModel.create(title, author, isbn);

    return { success: true, data: null, message: "書籍が正常に作成されました" };
  } catch (error) {
    throw error;
  }
}

/**
 * ISBNで書籍を取得する関数
 * @param {string} isbn - ISBN番号
 * @returns {Promise<object>} - 取得結果
 */
async function getBookByIsbn(isbn) {
  try {
    if (isbn == null) {
      throw new Error("Cannot empty isbn.");
    }

    const book = await bookModel.findOne(isbn);

    if (book && book.isbn) {
      return {
        success: true,
        data: book,
        message: "書籍が正常に取得されました",
      };
    }

    return { success: false, data: null, message: "書籍が見つかりません" };
  } catch (error) {
    throw error;
  }
}

/**
 * タイトルで書籍を取得する関数
 * @param {string} title - 書籍タイトル
 * @returns {Promise<object>} - 取得結果
 */
async function getBookByName(title) {
  try {
    if (title == null) {
      throw new Error("Cannot empty title.");
    }

    const books = await bookModel.findAll();
    const book = books.find((b) => b.title === title);

    if (book && book.isbn) {
      return {
        success: true,
        data: book,
        message: "書籍が正常に取得されました",
      };
    }

    return { success: false, data: null, message: "書籍が見つかりません" };
  } catch (error) {
    throw error;
  }
}

/**
 * 著者で書籍を取得する関数
 * @param {string} author - 著者名
 * @returns {Promise<object>} - 取得結果
 */
async function getBookByAuthor(author) {
  try {
    if (author == null) {
      throw new Error("Cannot empty author.");
    }

    const books = await bookModel.findAll();
    const foundBooks = books.filter((b) => b.author === author);

    if (foundBooks.length > 0) {
      return {
        success: true,
        data: foundBooks,
        message: "書籍が正常に取得されました",
      };
    }

    return { success: false, data: null, message: "書籍が見つかりません" };
  } catch (error) {
    throw error;
  }
}

/**
 * 書籍情報を更新する関数
 * @param {string} isbn - ISBN番号
 * @param {string} title - 書籍タイトル
 * @param {string} author - 著者名
 * @returns {Promise<object>} - 更新結果
 */
async function updateBook(isbn, title, author) {
  try {
    if (isbn == null || title == null || author == null) {
      throw new Error("Cannot empty isbn, title, and author.");
    }

    await bookModel.update(isbn, { title, author });

    return { success: true, data: null, message: "書籍が正常に更新されました" };
  } catch (error) {
    throw error;
  }
}

/**
 * 書籍を削除する関数
 * @param {string} isbn - ISBN番号
 * @returns {Promise<object>} - 削除結果
 */
async function deleteBook(isbn) {
  try {
    if (isbn == null) {
      throw new Error("Cannot empty isbn.");
    }

    await bookModel.delete(isbn);

    return { success: true, data: null, message: "書籍が正常に削除されました" };
  } catch (error) {
    throw error;
  }
}

/**
 * 全書籍を削除する関数
 * @returns {Promise<object>} - 削除結果
 */
async function deleteAllBooks() {
  try {
    await bookModel.deleteAll();
    return {
      success: true,
      data: null,
      message: "全書籍が正常に削除されました",
    };
  } catch (error) {
    throw error;
  }
}

/**
 * 全書籍を取得する関数
 * @returns {Promise<object>} - 取得結果
 */
async function getAllBooks() {
  try {
    const books = await bookModel.findAll();
    return {
      success: true,
      data: books,
      message: "全書籍が正常に取得されました",
    };
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createBook,
  getBookByIsbn,
  getBookByName,
  getBookByAuthor,
  updateBook,
  deleteBook,
  deleteAllBooks,
  getAllBooks,
};
