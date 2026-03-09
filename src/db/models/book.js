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
   */
  async create(title, author, isbn) {
    const books = await readJsonFile(repositoryPath, "book.json");
    if (books.find((book) => book.isbn === isbn)) {
      throw new Error("Book with this ISBN already exists.");
    }
    books.push({ title, author, isbn });
    await writeJsonFile(repositoryPath, "book.json", books);
  }

  /**
   * ISBNで書籍を検索する関数
   * @param {string} isbn - ISBN番号
   * @returns {object} - 書籍データ
   */
  async findOne(isbn) {
    const books = await readJsonFile(repositoryPath, "book.json");
    return books.find((book) => book.isbn === isbn);
  }

  /**
   * 全書籍を取得する関数
   * @returns {array} - 全書籍データ
   */
  async findAll() {
    const books = await readJsonFile(repositoryPath, "book.json");
    return books;
  }

  /**
   * 書籍情報を更新する関数
   * @param {string} isbn - ISBN番号
   * @param {object} newData - 更新データ
   */
  async update(isbn, newData) {
    const books = await readJsonFile(repositoryPath, "book.json");
    const index = books.findIndex((book) => book.isbn === isbn);
    if (index === -1) {
      throw new Error("Book not found.");
    }
    books[index] = { ...books[index], ...newData };
    await writeJsonFile(repositoryPath, "book.json", books);
  }

  /**
   * 書籍を削除する関数
   * @param {string} isbn - ISBN番号
   */
  async delete(isbn) {
    let books = await readJsonFile(repositoryPath, "book.json");
    const initialLength = books.length;
    books = books.filter((book) => book.isbn !== isbn);
    if (books.length === initialLength) {
      throw new Error("Book not found.");
    }
    await writeJsonFile(repositoryPath, "book.json", books);
  }

  /**
   * 全書籍を削除する関数
   */
  async deleteAll() {
    await writeJsonFile(repositoryPath, "book.json", []);
  }
}

module.exports = BookModel;
