/**
 * 貸出モデル
 * 貸出・返却のデータベース操作を管理する
 */
const path = require("path");
const LoanModel = require("../db/models/loan");
const BookModel = require("../db/models/book");
const { withTransaction } = require("../services/transaction");

let loanModelInstance;
let bookModelInstance;

// モデルインスタンスを初期化する関数
function initializeModels() {
  if (!loanModelInstance) {
    const LoanModel = require("../db/models/loan");
    loanModelInstance = new LoanModel();
  }
  if (!bookModelInstance) {
    const BookModel = require("../db/models/book");
    bookModelInstance = new BookModel();
  }
}

// DB モデルが実際に読み書きするファイルパスを取得する。
function getLoanFilePath() {
  initializeModels();
  return path.join(loanModelInstance.dataDir, "loans.json");
}

function getBookFilePath() {
  initializeModels();
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
 * 貸出期限日を計算する関数
 * @param {string} userId - ユーザーID
 * @param {string} loanDate - 貸出日
 * @returns {Promise<string>} - 貸出期限日（YYYY-MM-DD形式）
 */
async function calculateDueDate(userId, loanDate) {
  try {
    // 貸出期間を2週間（14日）とする
    const loanPeriodDays = 14;
    const loanDateObj = new Date(loanDate);

    // 貸出日から14日後を計算
    const dueDate = new Date(loanDateObj);
    dueDate.setDate(dueDate.getDate() + loanPeriodDays);

    // YYYY-MM-DD形式に変換
    const dueDateStr = dueDate.toISOString().split("T")[0];

    return dueDateStr;
  } catch (error) {
    throw createError(500, "Failed to calculate due date.");
  }
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
        const bookResult = await bookModelInstance.findOne(isbn);
        if (!bookResult.success) {
          throw createError(404, "BOOK_NOT_EXIST");
        }

        const allLoansResult = await getUserLoans();
        if (!allLoansResult.success) {
          throw createError(500, "Failed to get loan records.");
        }

        const activeLoan = allLoansResult.data.find(
          (loan) => loan.bookId === isbn && !loan.returnDate,
        );
        if (activeLoan) {
          throw createError(409, "BOOK_ALREADY_LENDING");
        }

        const loanId = Date.now().toString();
        const dueDate = await calculateDueDate(userId, loanDate);
        const loanResult = await loanModelInstance.create(
          loanId,
          isbn,
          userId,
          loanDate,
          null, // returnDateは貸出時はnull
          dueDate, // dueDateを保存
        );

        if (!loanResult.success) {
          throw createError(500, "Failed to create loan record.");
        }

        return {
          success: true,
          data: {
            loanId,
            dueDate: await calculateDueDate(userId, loanDate),
          },
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
        const bookResult = await bookModelInstance.findOne(isbn);
        if (!bookResult.success) {
          throw createError(404, "BOOK_NOT_EXIST");
        }

        const allLoansResult = await getUserLoans();
        if (!allLoansResult.success) {
          throw createError(500, "Failed to get loan records.");
        }

        const activeLoan = allLoansResult.data.find(
          (loan) =>
            loan.bookId === isbn && loan.userId === userId && !loan.returnDate,
        );

        if (!activeLoan) {
          throw createError(409, "BOOK_NOT_LENDING");
        }

        const updateResult = await loanModelInstance.update(activeLoan.loanId, {
          returnDate,
        });
        if (!updateResult.success) {
          throw createError(500, "Failed to update loan record.");
        }

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
  initializeModels();

  try {
    const loanId = Date.now().toString();
    const bookResult = await bookModelInstance.findOne(isbn);
    if (!bookResult.success) {
      throw createError(404, "Book not found.");
    }

    const loanResult = await loanModelInstance.create(
      loanId,
      isbn,
      userId,
      loanDate,
      returnDate,
    );

    if (!loanResult.success) {
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
 * ローンを更新する関数
 * @param {string} loanId - ローンID
 * @param {object} updateData - 更新データ
 * @returns {Promise<object>} - 更新結果
 */
async function updateLoan(loanId, updateData) {
  initializeModels();

  try {
    const result = await loanModelInstance.update(loanId, updateData);
    if (!result.success) {
      return { success: false, message: result.message };
    }
    return { success: true, message: "貸出レコードが正常に更新されました" };
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
    let loansResult;
    if (userId) {
      loansResult = await loanModelInstance.findByUserId(userId);
    } else {
      loansResult = await loanModelInstance.findAll();
    }

    if (!loansResult.success) {
      return { success: false, message: loansResult.message };
    }

    return {
      success: true,
      data: loansResult.data,
      message: "ローンが正常に取得されました",
    };
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createLoan,
  lendBook,
  returnBook,
  updateLoan,
  getUserLoans,
};
