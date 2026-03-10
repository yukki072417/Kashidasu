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
   * @returns {Promise<object>} - 作成結果
   */
  async create(
    loanId,
    bookId,
    userId,
    loanDate,
    returnDate = null,
    dueDate = null,
  ) {
    try {
      const loans = await readJsonFile(repositoryPath, "loan.json");
      if (loans.find((loan) => loan.loanId === loanId)) {
        return { success: false, message: "Loan with this ID already exists." };
      }
      const newLoan = { loanId, bookId, userId, loanDate, returnDate, dueDate };
      loans.push(newLoan);
      await writeJsonFile(repositoryPath, "loan.json", loans);
      return { success: true, data: newLoan };
    } catch (error) {
      throw error;
    }
  }

  /**
   * IDで貸出を検索する関数
   * @param {string} loanId - 貸出ID
   * @returns {Promise<object>} - 検索結果
   */
  async findOne(loanId) {
    try {
      const loans = await readJsonFile(repositoryPath, "loan.json");
      const loan = loans.find((loan) => loan.loanId === loanId);
      if (loan) {
        return { success: true, data: loan };
      }
      return { success: false, message: "Loan not found." };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 書籍IDで貸出を検索する関数
   * @param {string} bookId - 書籍ID
   * @returns {Promise<object>} - 検索結果
   */
  async findByBookId(bookId) {
    try {
      const loans = await readJsonFile(repositoryPath, "loan.json");
      const bookLoans = loans.filter((loan) => loan.bookId === bookId);
      return { success: true, data: bookLoans };
    } catch (error) {
      throw error;
    }
  }

  /**
   * ユーザーIDで貸出を検索する関数
   * @param {string|null} userId - ユーザーID（未指定の場合は全貸出）
   * @returns {Promise<object>} - 検索結果
   */
  async findByUserId(userId) {
    try {
      const loans = await readJsonFile(repositoryPath, "loan.json");
      let userLoans;
      if (userId) {
        userLoans = loans.filter((loan) => loan.userId === userId);
      } else {
        userLoans = loans; // userIdが未指定の場合は全ローンを返す
      }
      return { success: true, data: userLoans };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 書籍が現在貸出中か確認する関数
   * @param {string} isbn - ISBN番号
   * @returns {Promise<object>} - 確認結果
   */
  async isBookCurrentlyLoaned(isbn) {
    try {
      const loans = await readJsonFile(repositoryPath, "loan.json");
      // 返却日がnull（未返却）のレコードが存在するかチェック
      const activeLoans = loans.filter(
        (loan) => loan.bookId === isbn && !loan.returnDate,
      );
      return { success: true, data: activeLoans.length > 0 };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 全貸出を取得する関数
   * @returns {Promise<object>} - 取得結果
   */
  async findAll() {
    try {
      const loans = await readJsonFile(repositoryPath, "loan.json");
      return { success: true, data: loans };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 貸出情報を更新する関数
   * @param {string} loanId - 貸出ID
   * @param {object} newData - 更新データ
   * @returns {Promise<object>} - 更新結果
   */
  async update(loanId, newData) {
    try {
      const loans = await readJsonFile(repositoryPath, "loan.json");
      const index = loans.findIndex((loan) => loan.loanId === loanId);
      if (index === -1) {
        return { success: false, message: "Loan not found." };
      }
      loans[index] = { ...loans[index], ...newData };
      await writeJsonFile(repositoryPath, "loan.json", loans);
      return { success: true, data: loans[index] };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = LoanModel;
