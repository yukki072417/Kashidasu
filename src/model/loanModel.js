/**
 * 貸出モデル
 * 貸出・返却のデータベース操作を管理する
 */
const path = require("path");
const LoanModel = require("../db/models/loan");
const BookModel = require("../db/models/book");
const { withTransaction } = require("../services/transaction");

const loanModelInstance = new LoanModel();
const bookModelInstance = new BookModel();

// DB モデルが実際に読み書きするファイルパスを取得する。
function getLoanFilePath() {
  return path.join(loanModelInstance.dataDir, "loans.json");
}

function getBookFilePath() {
  return path.join(bookModelInstance.dataDir, "books.json");
}

// エラーオブジェクトを作成するヘルパー関数
function createError(status, message) {
  const error = new Error(message);
  error.status = status;
  error.code = message.replace(/\s+/g, "_").toUpperCase();
  return error;
}

/**
 * 貸出処理（原子的）
 * @param {string} isbn - ISBN番号
 * @param {string} userId - ユーザーID
 * @param {string} loanDate - 貸出日
 * @returns {Promise<object>} - 貸出結果
 */
async function lendBook(isbn, userId, loanDate) {
  try {
    return await withTransaction(
      [getLoanFilePath(), getBookFilePath()],
      async () => {
        const book = await bookModelInstance.findOne(isbn);
        if (!book) {
          throw createError(404, "BOOK_NOT_EXIST");
        }

        const activeLoan = await findActiveLoan(isbn);
        if (activeLoan) {
          throw createError(409, "BOOK_ALREADY_LENDING");
        }

        const loanId = Date.now().toString();
        const loan = await loanModelInstance.create(
          loanId,
          isbn,
          userId,
          loanDate,
          null,
        );

        if (!loan) {
          throw createError(500, "Failed to create loan record.");
        }

        return {
          success: true,
          data: { loanId },
          message: "書籍が正常に貸出されました",
        };
      },
    );
  } catch (error) {
    throw error;
  }
}

/**
 * 返却処理（原子的）
 * @param {string} isbn - ISBN番号
 * @param {string} userId - ユーザーID
 * @param {string} returnDate - 返却日
 * @returns {Promise<object>} - 返却結果
 */
async function returnBook(isbn, userId, returnDate) {
  try {
    return await withTransaction(
      [getLoanFilePath(), getBookFilePath()],
      async () => {
        const book = await bookModelInstance.findOne(isbn);
        if (!book) {
          throw createError(404, "BOOK_NOT_EXIST");
        }

        const activeLoan = await findActiveLoan(isbn, userId);
        if (!activeLoan) {
          throw createError(409, "BOOK_NOT_LENDING");
        }

        await loanModelInstance.update(activeLoan.loanId, { returnDate });

        return {
          success: true,
          data: null,
          message: "書籍が正常に返却されました",
        };
      },
    );
  } catch (error) {
    throw error;
  }
}

/**
 * ローン作成（低レベルAPI、単独操作のみに使用）
 * 複数ファイルをまたぐ場合は lendBook() を使うこと。
 */
async function createLoan(isbn, userId, loanDate, returnDate = null) {
  const loanId = Date.now().toString();
  const book = await bookModelInstance.findOne(isbn);
  if (!book) {
    throw createError(404, "Book not found.");
  }

  const loan = await loanModelInstance.create(
    loanId,
    isbn,
    userId,
    loanDate,
    returnDate,
  );

  if (!loan) {
    throw createError(500, "Failed to create loan.");
  }

  return { success: true };
}

/**
 * 指定ISBNのアクティブなローンを取得する。
 */
async function findActiveLoan(isbn, userId = null) {
  if (userId) {
    const loans = await loanModelInstance.findByUserId(userId);
    return (
      loans.find((loan) => loan.bookId === isbn && !loan.returnDate) ?? null
    );
  } else {
    const loans = await loanModelInstance.findByUserId();
    return (
      loans.find((loan) => loan.bookId === isbn && !loan.returnDate) ?? null
    );
  }
}

/**
 * ローンを更新する。
 */
async function updateLoan(loanId, updateData) {
  return await loanModelInstance.update(loanId, updateData);
}

/**
 * ユーザーの全ローンを取得する。userIdがnullの場合は全ローンを取得。
 */
async function getUserLoans(userId = null) {
  if (userId) {
    return await loanModelInstance.findByUserId(userId);
  } else {
    return await loanModelInstance.findByUserId();
  }
}

/**
 * 指定ISBNの本が現在貸出中かどうかを確認する。
 */
async function isBookCurrentlyLoaned(isbn) {
  const loans = await loanModelInstance.findByUserId();
  const activeLoans = loans.filter(
    (loan) => loan.bookId === isbn && !loan.returnDate,
  );
  return activeLoans.length > 0;
}

async function getActiveLoans(isbn) {
  const loans = await loanModelInstance.findByUserId();
  return loans.filter((loan) => loan.bookId === isbn && !loan.returnDate);
}

async function getOverdueBooks() {
  const loans = await loanModelInstance.findByUserId();
  const today = new Date();

  return loans.filter((loan) => {
    if (!loan.returnDate && loan.loanDate) {
      const loanDate = new Date(loan.loanDate);
      const dueDate = new Date(loan.loanDate);
      dueDate.setDate(dueDate.getDate() + 14); // 14日後が期限

      return dueDate < today; // 期限切れの場合
    }
    return false;
  });
}

async function getLoanHistory(userId) {
  const loans = await loanModelInstance.findByUserId(userId);
  return loans.map((loan) => ({
    loanId: loan.loanId,
    bookId: loan.bookId,
    userId: loan.userId,
    loanDate: loan.loanDate,
    returnDate: loan.returnDate,
    isOverdue: loan.returnDate
      ? false
      : (() => {
          if (!loan.loanDate) return false;
          const dueDate = new Date(loan.loanDate);
          dueDate.setDate(dueDate.getDate() + 14);
          return dueDate < new Date();
        })(),
  }));
}

module.exports = {
  createLoan,
  lendBook,
  returnBook,
  findActiveLoan,
  updateLoan,
  getUserLoans,
  isBookCurrentlyLoaned,
  getActiveLoans,
  getOverdueBooks,
  getLoanHistory,
};
