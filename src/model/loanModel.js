/**
 * loanModel.js
 *
 * 貸出・返却操作はローンレコードと本の isBorrowed フラグの
 * 2ファイルをまたぐため、トランザクションで原子性を保証する。
 *
 * 失敗時の挙動:
 *   - ローン作成後に本の状態更新が失敗 → ローンレコードも巻き戻す
 *   - 返却処理中にどちらかが失敗         → 両方巻き戻す
 */

const path = require("path");
const LoanModel = require("../db/models/loan");
const BookModel = require("../db/models/book");
const { withTransaction } = require("../services/transaction");
const { errorResponse } = require("../services/errorHandling");

const loanModelInstance = new LoanModel();
const bookModelInstance = new BookModel();

// DB モデルが実際に読み書きするファイルパスを取得する。
// ※ LoanModel / BookModel が dataDir を公開している前提。
//    公開していない場合は各モデルに getFilePath() を追加するか、
//    パスを定数として定義する。
function getLoanFilePath() {
  return path.join(loanModelInstance.dataDir, "loans.json");
}

function getBookFilePath() {
  return path.join(bookModelInstance.dataDir, "books.json");
}

/**
 * 貸出処理（原子的）
 *
 * 1. 本の存在確認
 * 2. 本が貸出中でないことを確認
 * 3. ローンレコード作成
 * 4. 本の isBorrowed を true に更新
 *
 * 3 or 4 が失敗した場合、両方をロールバックする。
 */
async function lendBook(isbn, userId, loanDate) {
  return withTransaction([getLoanFilePath(), getBookFilePath()], async () => {
    const book = await bookModelInstance.findOne(isbn);
    if (!book) {
      throw errorResponse(404, "BOOK_NOT_EXIST");
    }
    if (book.isBorrowed) {
      throw errorResponse(409, "BOOK_ALREADY_LENDING");
    }

    const loanId = Date.now().toString();
    const loan = await loanModelInstance.create(
      loanId,
      isbn,
      userId,
      loanDate,
      null, // returnDate
    );
    if (!loan) {
      throw errorResponse(500, "Failed to create loan record.");
    }

    await bookModelInstance.update(isbn, { isBorrowed: true });

    return { success: true, loanId };
  });
}

/**
 * 返却処理（原子的）
 *
 * 1. アクティブなローンを検索
 * 2. ローンの returnDate を更新
 * 3. 本の isBorrowed を false に更新
 *
 * 2 or 3 が失敗した場合、両方をロールバックする。
 */
async function returnBook(isbn, userId, returnDate) {
  return withTransaction([getLoanFilePath(), getBookFilePath()], async () => {
    const book = await bookModelInstance.findOne(isbn);
    if (!book) {
      throw errorResponse(404, "BOOK_NOT_EXIST");
    }

    const activeLoan = await findActiveLoan(isbn, userId);
    if (!activeLoan) {
      throw errorResponse(409, "BOOK_NOT_LENDING");
    }

    await loanModelInstance.update(activeLoan.loanId, { returnDate });
    await bookModelInstance.update(isbn, { isBorrowed: false });

    return { success: true };
  });
}

/**
 * ローン作成（低レベルAPI、単独操作のみに使用）
 * 複数ファイルをまたぐ場合は lendBook() を使うこと。
 */
async function createLoan(isbn, userId, loanDate, returnDate = null) {
  const loanId = Date.now().toString();
  const book = await bookModelInstance.findOne(isbn);
  if (!book) {
    throw errorResponse(404, "Book not found.");
  }

  const loan = await loanModelInstance.create(
    loanId,
    isbn,
    userId,
    loanDate,
    returnDate,
  );

  if (!loan) {
    throw { success: false, message: "Failed to create loan." };
  }

  return { success: true };
}

/**
 * 指定ユーザーのアクティブなローンを取得する。
 */
async function findActiveLoan(isbn, userId) {
  const loans = await loanModelInstance.findByUserId(userId);
  return loans.find((loan) => loan.bookId === isbn && !loan.returnDate) ?? null;
}

/**
 * ローンを更新する。
 */
async function updateLoan(loanId, updateData) {
  return await loanModelInstance.update(loanId, updateData);
}

/**
 * ユーザーの全ローンを取得する。
 */
async function getUserLoans(userId) {
  return await loanModelInstance.findByUserId(userId);
}

/**
 * 指定ISBNの本が現在貸出中かどうかを確認する。
 *
 * 修正: 元のコードは findByUserId() を引数なしで呼び出していた（全件取得と思われる）。
 * 意図を尊重しつつ findAll が存在する場合はそちらを使うように修正。
 */
async function isBookCurrentlyLoaned(isbn) {
  const allLoans = await (loanModelInstance.findAll
    ? loanModelInstance.findAll()
    : loanModelInstance.findByUserId()); // fallback
  return allLoans.some((loan) => loan.bookId === isbn && !loan.returnDate);
}

module.exports = {
  lendBook,
  returnBook,
  createLoan,
  findActiveLoan,
  updateLoan,
  getUserLoans,
  isBookCurrentlyLoaned,
};
