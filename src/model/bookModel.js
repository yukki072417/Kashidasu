/**
 * 書籍モデル
 * 書籍のデータベース操作を管理する
 */
const BookModel = require("../db/models/book");

// デフォルトのDBモデルインスタンス
let bookModelInstance = new BookModel();

/**
 * DBモデルインスタンスを設定する関数（テスト用）
 * @param {object} instance - DBモデルインスタンス
 */
function setBookModelInstance(instance) {
  bookModelInstance = instance;
}

/**
 * DBモデルインスタンスを取得する関数
 * @returns {object} - DBモデルインスタンス
 */
function getBookModelInstance() {
  return bookModelInstance;
}

/**
 * 新規書籍を作成する関数
 * @param {string} isbn - ISBN番号
 * @param {string} title - 書籍タイトル
 * @param {string} author - 著者名
 * @returns {Promise<object>} - 作成結果
 */
async function createBook(isbn, title, author) {
  try {
    if (
      isbn == null ||
      title == null ||
      author == null ||
      isbn === "" ||
      title === "" ||
      author === ""
    ) {
      throw new Error("Cannot empty isbn, title, and author.");
    }

    const result = await bookModelInstance.create(title, author, isbn);
    if (!result.success) {
      return { success: false, message: result.message };
    }

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
    if (isbn == null || isbn === "") {
      throw new Error("Cannot empty isbn.");
    }

    const result = await bookModelInstance.findOne(isbn);
    if (!result.success) {
      return { success: false, data: null, message: "書籍が見つかりません" };
    }

    // データ整合性チェック - ISBNフィールドの存在確認
    if (!result.data || !result.data.isbn) {
      return { success: false, data: null, message: "書籍データが不正です" };
    }

    return {
      success: true,
      data: result.data,
      message: "書籍が正常に取得されました",
    };
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
    if (title == null || title === "") {
      throw new Error("Cannot empty title.");
    }

    const result = await bookModelInstance.findAll();
    if (!result.success) {
      return { success: false, data: null, message: "書籍が見つかりません" };
    }

    const books = result.data;
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
    if (author == null || author === "") {
      throw new Error("Cannot empty author.");
    }

    const result = await bookModelInstance.findAll();
    if (!result.success) {
      return { success: false, data: null, message: "書籍が見つかりません" };
    }

    const books = result.data;
    const foundBooks = books.filter((b) => b.author === author && b.isbn);

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
    if (
      isbn == null ||
      title == null ||
      author == null ||
      isbn === "" ||
      title === "" ||
      author === ""
    ) {
      throw new Error("Cannot empty isbn, title, and author.");
    }

    const result = await bookModelInstance.update(isbn, { title, author });
    if (!result.success) {
      return { success: false, message: result.message };
    }

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
    if (isbn == null || isbn === "") {
      throw new Error("Cannot empty isbn.");
    }

    const result = await bookModelInstance.delete(isbn);
    if (!result.success) {
      return { success: false, message: result.message };
    }

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
    const result = await bookModelInstance.deleteAll();
    if (!result.success) {
      return { success: false, message: result.message };
    }

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
    const result = await bookModelInstance.findAll();
    if (!result.success) {
      return { success: false, message: result.message };
    }

    return {
      success: true,
      data: result.data,
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
  setBookModelInstance,
  getBookModelInstance,
};
