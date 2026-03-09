const path = require("path");
const { writeJsonFile, readJsonFile } = require("../operation");

const repositoryPath = path.join(__dirname, "../../../repository");

class LoanModel {
  constructor() {
    this.dataDir = repositoryPath;
  }

  async create(loanId, bookId, userId, loanDate, returnDate = null) {
    const loans = await readJsonFile(repositoryPath, "loan.json");
    if (loans.find((loan) => loan.loanId === loanId)) {
      throw new Error("Loan with this ID already exists.");
    }
    const newLoan = { loanId, bookId, userId, loanDate, returnDate };
    loans.push(newLoan);
    await writeJsonFile(repositoryPath, "loan.json", loans);
    return newLoan;
  }

  async findOne(loanId) {
    const loans = await readJsonFile(repositoryPath, "loan.json");
    return loans.find((loan) => loan.loanId === loanId);
  }

  async findByBookId(bookId) {
    const loans = await readJsonFile(repositoryPath, "loan.json");
    return loans.filter((loan) => loan.bookId === bookId);
  }

  async findByUserId(userId) {
    const loans = await readJsonFile(repositoryPath, "loan.json");
    if (userId) {
      return loans.filter((loan) => loan.userId === userId);
    } else {
      return loans; // userIdが未指定の場合は全ローンを返す
    }
  }

  async isBookCurrentlyLoaned(isbn) {
    const loans = await readJsonFile(repositoryPath, "loan.json");
    // 返却日がnull（未返却）のレコードが存在するかチェック
    const activeLoans = loans.filter(
      (loan) => loan.bookId === isbn && !loan.returnDate,
    );
    return activeLoans.length > 0;
  }

  async findAll() {
    const loans = await readJsonFile(repositoryPath, "loan.json");
    return loans;
  }

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
