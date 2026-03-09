/**
 * 貸出DBモデル
 * 貸出データのファイルベースのCRUD操作を管理する
 */
const path = require("path");
const { writeJsonFile, readJsonFile } = require("../operation");

const repositoryPath = path.join(__dirname, "../../../repository");

class LoanModel {
  /**
   * コンストラクタ
   */
  constructor() {
    this.dataDir = repositoryPath;
  }

  /**
   * 新規貸出を作成する関数
   * @param {string} loanId - 貸出ID
   * @param {string} bookId - 書籍ID
   * @param {string} userId - ユーザーID
   * @param {string} loanDate - 貸出日
   * @param {string|null} returnDate - 返却日
   * @param {string|null} dueDate - 貸出期限
   * @returns {object} - 貸出データ
   */
  async create(
    loanId,
    bookId,
    userId,
    loanDate,
    returnDate = null,
    dueDate = null,
  ) {
    const loans = await readJsonFile(repositoryPath, "loan.json");
    if (loans.find((loan) => loan.loanId === loanId)) {
      throw new Error("Loan with this ID already exists.");
    }
    const newLoan = { loanId, bookId, userId, loanDate, returnDate, dueDate };
    loans.push(newLoan);
    await writeJsonFile(repositoryPath, "loan.json", loans);
    return newLoan;
  }

  /**
   * IDで貸出を検索する関数
   * @param {string} loanId - 貸出ID
   * @returns {object} - 貸出データ
   */
  async findOne(loanId) {
    const loans = await readJsonFile(repositoryPath, "loan.json");
    return loans.find((loan) => loan.loanId === loanId);
  }

  /**
   * 書籍IDで貸出を検索する関数
   * @param {string} bookId - 書籍ID
   * @returns {array} - 貸出データ配列
   */
  async findByBookId(bookId) {
    const loans = await readJsonFile(repositoryPath, "loan.json");
    return loans.filter((loan) => loan.bookId === bookId);
  }

  /**
   * ユーザーIDで貸出を検索する関数
   * @param {string|null} userId - ユーザーID（未指定の場合は全貸出）
   * @returns {array} - 貸出データ配列
   */
  async findByUserId(userId) {
    const loans = await readJsonFile(repositoryPath, "loan.json");
    if (userId) {
      return loans.filter((loan) => loan.userId === userId);
    } else {
      return loans; // userIdが未指定の場合は全ローンを返す
    }
  }

  /**
   * 書籍が現在貸出中か確認する関数
   * @param {string} isbn - ISBN番号
   * @returns {boolean} - 貸出中かどうか
   */
  async isBookCurrentlyLoaned(isbn) {
    const loans = await readJsonFile(repositoryPath, "loan.json");
    // 返却日がnull（未返却）のレコードが存在するかチェック
    const activeLoans = loans.filter(
      (loan) => loan.bookId === isbn && !loan.returnDate,
    );
    return activeLoans.length > 0;
  }

  /**
   * 全貸出を取得する関数
   * @returns {array} - 全貸出データ
   */
  async findAll() {
    const loans = await readJsonFile(repositoryPath, "loan.json");
    return loans;
  }

  /**
   * 貸出情報を更新する関数
   * @param {string} loanId - 貸出ID
   * @param {object} newData - 更新データ
   */
  async update(loanId, newData) {
    const loans = await readJsonFile(repositoryPath, "loan.json");
    const index = loans.findIndex((loan) => loan.loanId === loanId);
    if (index === -1) {
      throw new Error("Loan not found.");
    }
    loans[index] = { ...loans[index], ...newData };
    await writeJsonFile(repositoryPath, "loan.json", loans);
  }
}

module.exports = LoanModel;
