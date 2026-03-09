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
 * @param {string} isbn - ISBN番号
 * @param {string} userId - ユーザーID
 * @param {string} loanDate - 貸出日
 * @param {string|null} returnDate - 返却日
 * @returns {Promise<object>} - 作成結果
 */
async function createLoan(isbn, userId, loanDate, returnDate = null) {
  try {
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

    return {
      success: true,
      data: { loanId },
      message: "ローンが正常に作成されました",
    };
  } catch (error) {
    throw error;
  }
}

/**
 * 指定ISBNのアクティブなローンを取得する関数
 * @param {string} isbn - ISBN番号
 * @param {string|null} userId - ユーザーID（オプション）
 * @returns {Promise<object|null>} - アクティブローンデータ
 */
async function findActiveLoan(isbn, userId = null) {
  try {
    const loansResult = await getUserLoans(userId);
    if (!loansResult.success) {
      throw new Error(loansResult.message);
    }

    const loans = loansResult.data;
    const activeLoan =
      loans.find((loan) => loan.bookId === isbn && !loan.returnDate) ?? null;

    return activeLoan;
  } catch (error) {
    throw error;
  }
}

/**
 * ローンを更新する関数
 * @param {string} loanId - ローンID
 * @param {object} updateData - 更新データ
 * @returns {Promise<object>} - 更新結果
 */
async function updateLoan(loanId, updateData) {
  try {
    await loanModelInstance.update(loanId, updateData);
    return {
      success: true,
      data: null,
      message: "ローンが正常に更新されました",
    };
  } catch (error) {
    throw error;
  }
}

/**
 * ユーザーの全ローンを取得する関数
 * @param {string|null} userId - ユーザーID（nullの場合は全ローン）
 * @returns {Promise<object>} - ローンデータ
 */
async function getUserLoans(userId = null) {
  try {
    let loans;
    if (userId) {
      loans = await loanModelInstance.findByUserId(userId);
    } else {
      loans = await loanModelInstance.findByUserId();
    }

    return {
      success: true,
      data: loans,
      message: "ローンが正常に取得されました",
    };
  } catch (error) {
    throw error;
  }
}

/**
 * 指定ISBNの本が現在貸出中かどうかを確認する。
 * @param {string} isbn - ISBN番号
 * @returns {Promise<boolean>} - 貸出中かどうか
 */
async function isBookCurrentlyLoaned(isbn) {
  try {
    const loansResult = await getUserLoans();
    if (!loansResult.success) {
      throw new Error(loansResult.message);
    }

    const loans = loansResult.data;
    const activeLoans = loans.filter(
      (loan) => loan.bookId === isbn && !loan.returnDate,
    );
    return activeLoans.length > 0;
  } catch (error) {
    throw error;
  }
}

/**
 * 指定ISBNのアクティブな貸出を取得する関数
 * @param {string} isbn - ISBN番号
 * @returns {Promise<object>} - 貸出データ
 */
async function getActiveLoans(isbn) {
  try {
    const loansResult = await getUserLoans();
    if (!loansResult.success) {
      throw new Error(loansResult.message);
    }

    const loans = loansResult.data;
    const activeLoans = loans.filter(
      (loan) => loan.bookId === isbn && !loan.returnDate,
    );

    return {
      success: true,
      data: activeLoans,
      message: "アクティブな貸出が正常に取得されました",
    };
  } catch (error) {
    throw error;
  }
}

/**
 * 期限切れの書籍を取得する関数
 * @returns {Promise<object>} - 期限切れ書籍データ
 */
async function getOverdueBooks() {
  try {
    const loansResult = await getUserLoans();
    if (!loansResult.success) {
      throw new Error(loansResult.message);
    }

    const loans = loansResult.data;
    const today = new Date();

    const overdueLoans = loans.filter((loan) => {
      if (!loan.returnDate && loan.loanDate) {
        const loanDate = new Date(loan.loanDate);
        const dueDate = new Date(loan.loanDate);
        dueDate.setDate(dueDate.getDate() + 14); // 14日後が期限
        return today > dueDate;
      }
      return false;
    });

    return {
      success: true,
      data: overdueLoans,
      message: "期限切れ書籍が正常に取得されました",
    };
  } catch (error) {
    throw error;
  }
}

/**
 * ユーザーの貸出履歴を取得する関数
 * @param {string} userId - ユーザーID
 * @returns {Promise<object>} - 貸出履歴データ
 */
async function getLoanHistory(userId) {
  try {
    const loansResult = await getUserLoans(userId);
    if (!loansResult.success) {
      throw new Error(loansResult.message);
    }

    const loans = loansResult.data;
    const loanHistory = loans.map((loan) => ({
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

    return {
      success: true,
      data: loanHistory,
      message: "貸出履歴が正常に取得されました",
    };
  } catch (error) {
    throw error;
  }
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
