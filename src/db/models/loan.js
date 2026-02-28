const path = require("path");
const { writeJsonFile, readJsonFile } = require("../operation");

const repositoryPath = path.join(__dirname, "../../../repository");

class LoanModel {
  async create(loanId, bookId, userId, loanDate, returnDate = null) {
    const loans = await readJsonFile(repositoryPath, "loans.json");
    if (loans.find(loan => loan.loanId === loanId)) {
      throw new Error("Loan with this ID already exists.");
    }
    loans.push({ loanId, bookId, userId, loanDate, returnDate });
    await writeJsonFile(repositoryPath, "loans.json", loans);
  }

  async findOne(loanId) {
    const loans = await readJsonFile(repositoryPath, "loans.json");
    return loans.find((loan) => loan.loanId === loanId);
  }

  async findByBookId(bookId) {
    const loans = await readJsonFile(repositoryPath, "loans.json");
    return loans.filter((loan) => loan.bookId === bookId);
  }

  async findByUserId(userId) {
    const loans = await readJsonFile(repositoryPath, "loans.json");
    return loans.filter((loan) => loan.userId === userId);
  }

  async findAll() {
    const loans = await readJsonFile(repositoryPath, "loans.json");
    return loans;
  }

  async update(loanId, newData) {
    const loans = await readJsonFile(repositoryPath, "loans.json");
    const index = loans.findIndex(loan => loan.loanId === loanId);
    if (index === -1) {
      throw new Error("Loan not found.");
    }
    loans[index] = { ...loans[index], ...newData };
    await writeJsonFile(repositoryPath, "loans.json", loans);
  }
}

module.exports = LoanModel;