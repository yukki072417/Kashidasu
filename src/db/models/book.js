/**
 * 書籍DBモデル
 * 書籍データのファイルベースのCRUD操作を管理する
 */
const path = require("path");
const { writeJsonFile, readJsonFile } = require("../operation");

const repositoryPath = path.join(__dirname, "../../../repository");

class BookModel {
  /**
   * コンストラクタ
   */
  constructor() {
    this.dataDir = repositoryPath;
  }

  /**
   * 新規書籍を作成する関数
   * @param {string} title - 書籍タイトル
   * @param {string} author - 著者名
   * @param {string} isbn - ISBN番号
   * @returns {Promise<object>} - 作成結果
   */
  async create(title, author, isbn) {
    try {
      const books = await readJsonFile(repositoryPath, "book.json");
      if (books.find((book) => book.isbn === isbn)) {
        return {
          success: false,
          message: "Book with this ISBN already exists.",
        };
      }
      books.push({ title, author, isbn });
      await writeJsonFile(repositoryPath, "book.json", books);
      return { success: true, data: { title, author, isbn } };
    } catch (error) {
      throw error;
    }
  }

  /**
   * ISBNで書籍を検索する関数
   * @param {string} isbn - ISBN番号
   * @returns {Promise<object>} - 検索結果
   */
  async findOne(isbn) {
    try {
      const books = await readJsonFile(repositoryPath, "book.json");
      const book = books.find((book) => book.isbn === isbn);
      if (book) {
        return { success: true, data: book };
      }
      return { success: false, message: "Book not found." };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 全書籍を取得する関数
   * @returns {Promise<object>} - 取得結果
   */
  async findAll() {
    try {
      const books = await readJsonFile(repositoryPath, "book.json");
      return { success: true, data: books };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 書籍情報を更新する関数
   * @param {string} isbn - ISBN番号
   * @param {object} newData - 更新データ
   * @returns {Promise<object>} - 更新結果
   */
  async update(isbn, newData) {
    try {
      const books = await readJsonFile(repositoryPath, "book.json");
      const index = books.findIndex((book) => book.isbn === isbn);
      if (index === -1) {
        return { success: false, message: "Book not found." };
      }
      books[index] = { ...books[index], ...newData };
      await writeJsonFile(repositoryPath, "book.json", books);
      return { success: true, data: books[index] };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 書籍を削除する関数
   * @param {string} isbn - ISBN番号
   * @returns {Promise<object>} - 削除結果
   */
  async delete(isbn) {
    try {
      let books = await readJsonFile(repositoryPath, "book.json");
      const initialLength = books.length;
      books = books.filter((book) => book.isbn !== isbn);
      if (books.length === initialLength) {
        return { success: false, message: "Book not found." };
      }
      await writeJsonFile(repositoryPath, "book.json", books);
      return { success: true, data: null };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 全書籍を削除する関数
   * @returns {Promise<object>} - 削除結果
   */
  async deleteAll() {
    try {
      await writeJsonFile(repositoryPath, "book.json", []);
      return { success: true, data: null };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = BookModel;
