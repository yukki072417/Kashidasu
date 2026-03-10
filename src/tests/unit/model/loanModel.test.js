/**
 * Loanモデルの単体テスト
 */

const {
  createLoan,
  lendBook,
  returnBook,
  updateLoan,
  getUserLoans,
} = require("../../../model/loanModel");

// モックの設定
jest.mock("../../../db/models/loan");
jest.mock("../../../db/models/book");
jest.mock("../../../services/transaction");
jest.mock("../../../model/adminModel");

const LoanModel = require("../../../db/models/loan");
const BookModel = require("../../../db/models/book");
const { withTransaction } = require("../../../services/transaction");
const { isAdmin } = require("../../../model/adminModel");

const mockLoanModel = new LoanModel();
const mockBookModel = new BookModel();

// dataDirモックを追加
mockLoanModel.dataDir = "./test-data";
mockBookModel.dataDir = "./test-data";

describe("Loan Model Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // デフォルトのモックを設定
    mockLoanModel.create.mockResolvedValue({
      success: true,
      data: { loanId: "123" },
    });
    mockLoanModel.findOne.mockResolvedValue({
      success: true,
      data: { loanId: "123", bookId: "isbn1", userId: "user1" },
    });
    mockLoanModel.findAll.mockResolvedValue({ success: true, data: [] });
    mockLoanModel.update.mockResolvedValue({ success: true, data: null });
    mockBookModel.findOne.mockResolvedValue({
      success: true,
      data: { isbn: "9784167158057", title: "テスト書籍" },
    });
    mockBookModel.findAll.mockResolvedValue({ success: true, data: [] });
    withTransaction.mockImplementation((files, callback) => callback());
    isAdmin.mockResolvedValue(false);
  });

  describe("lendBook", () => {
    test("有効な情報で書籍貸出が成功する", async () => {
      const isbn = "9784167158057";
      const userId = "testuser";
      const loanDate = "2026-03-10";

      // モックの設定
      withTransaction.mockImplementation((files, callback) => callback());
      mockBookModel.findOne.mockResolvedValue({
        success: true,
        data: { isbn, title: "テスト書籍" },
      });
      mockLoanModel.create.mockResolvedValue({
        success: true,
        data: { loanId: "123456789" },
      });
      isAdmin.mockResolvedValue(false);

      const result = await lendBook(isbn, userId, loanDate);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty("loanId");
      expect(result.data).toHaveProperty("dueDate");
      expect(result.message).toBe("書籍が正常に貸出されました");
    });

    test("書籍が存在しない場合にエラーを返す", async () => {
      const isbn = "9784167158057";
      const userId = "testuser";
      const loanDate = "2026-03-10";

      withTransaction.mockImplementation((files, callback) => callback());
      mockBookModel.findOne.mockResolvedValue({
        success: false,
        message: "書籍が見つかりません",
      });

      await expect(lendBook(isbn, userId, loanDate)).rejects.toThrow(
        "BOOK_NOT_EXIST",
      );
    });

    test("書籍が既に貸出中の場合にエラーを返す", async () => {
      const isbn = "9784167158057";
      const userId = "testuser";
      const loanDate = "2026-03-10";

      // 既存の貸出情報をモック
      const mockLoans = [
        { bookId: isbn, userId: "otheruser", returnDate: null },
      ];

      withTransaction.mockImplementation((files, callback) => callback());
      mockBookModel.findOne.mockResolvedValue({
        success: true,
        data: { isbn, title: "テスト書籍" },
      });
      mockLoanModel.findAll.mockResolvedValue({
        success: true,
        data: mockLoans,
      });

      await expect(lendBook(isbn, userId, loanDate)).rejects.toThrow(
        "BOOK_ALREADY_LENDING",
      );
    });
  });

  describe("returnBook", () => {
    test("有効な情報で書籍返却が成功する", async () => {
      const isbn = "9784167158057";
      const userId = "testuser";
      const returnDate = "2026-03-17";

      // 貸出情報をモック
      const mockLoans = [
        { loanId: "123", bookId: isbn, userId, returnDate: null },
      ];

      withTransaction.mockImplementation((files, callback) => callback());
      mockBookModel.findOne.mockResolvedValue({
        success: true,
        data: { isbn, title: "テスト書籍" },
      });
      mockLoanModel.findAll.mockResolvedValue({
        success: true,
        data: mockLoans,
      });
      mockLoanModel.update.mockResolvedValue({ success: true, data: null });

      const result = await returnBook(isbn, userId, returnDate);

      expect(result.success).toBe(true);
      expect(result.message).toBe("書籍が正常に返却されました");
    });

    test("書籍が存在しない場合にエラーを返す", async () => {
      const isbn = "9784167158057";
      const userId = "testuser";
      const returnDate = "2026-03-17";

      withTransaction.mockImplementation((files, callback) => callback());
      mockBookModel.findOne.mockResolvedValue({
        success: false,
        message: "書籍が見つかりません",
      });

      await expect(returnBook(isbn, userId, returnDate)).rejects.toThrow(
        "BOOK_NOT_EXIST",
      );
    });

    test("貸出情報がない場合にエラーを返す", async () => {
      const isbn = "9784167158057";
      const userId = "testuser";
      const returnDate = "2026-03-17";

      // 貸出情報なし
      withTransaction.mockImplementation((files, callback) => callback());
      mockBookModel.findOne.mockResolvedValue({
        success: true,
        data: { isbn, title: "テスト書籍" },
      });
      mockLoanModel.findAll.mockResolvedValue({ success: true, data: [] });

      await expect(returnBook(isbn, userId, returnDate)).rejects.toThrow(
        "BOOK_NOT_LENDING",
      );
    });
  });

  describe("getUserLoans", () => {
    test("ユーザーの貸出情報取得が成功する", async () => {
      const userId = "testuser";
      const mockLoans = [
        {
          loanId: "1",
          bookId: "isbn1",
          userId,
          loanDate: "2026-03-10",
          returnDate: null,
        },
        {
          loanId: "2",
          bookId: "isbn2",
          userId,
          loanDate: "2026-03-11",
          returnDate: "2026-03-15",
        },
      ];

      mockLoanModel.findAll.mockResolvedValue({
        success: true,
        data: mockLoans,
      });

      const result = await getUserLoans();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.message).toBe("ローンが正常に取得されました");
    });

    test("貸出情報がない場合に空配列を返す", async () => {
      mockLoanModel.findAll.mockResolvedValue({ success: true, data: [] });

      const result = await getUserLoans();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(0);
    });

    test("データベースエラーの場合にエラーを返す", async () => {
      mockLoanModel.findAll.mockResolvedValue({
        success: false,
        message: "データベースエラー",
      });

      const result = await getUserLoans();

      expect(result.success).toBe(false);
      expect(result.message).toBe("データベースエラー");
    });
  });

  describe("createLoan", () => {
    test("有効な情報で貸出レコード作成が成功する", async () => {
      const isbn = "9784167158057";
      const userId = "testuser";
      const loanDate = "2026-03-10";

      mockBookModel.findOne.mockResolvedValue({
        success: true,
        data: { isbn, title: "テスト書籍" },
      });
      mockLoanModel.create.mockResolvedValue({
        success: true,
        data: { loanId: "123" },
      });

      const result = await createLoan(isbn, userId, loanDate);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty("loanId");
      expect(result.message).toBe("貸出レコードが正常に作成されました");
    });

    test("書籍が存在しない場合にエラーを返す", async () => {
      const isbn = "9784167158057";
      const userId = "testuser";
      const loanDate = "2026-03-10";

      mockBookModel.findOne.mockResolvedValue({
        success: false,
        message: "書籍が見つかりません",
      });

      const result = await createLoan(isbn, userId, loanDate);

      expect(result.success).toBe(false);
      expect(result.message).toBe("Book not found.");
    });
  });

  describe("updateLoan", () => {
    test("有効な情報で貸出レコード更新が成功する", async () => {
      const loanId = "123";
      const updateData = { returnDate: "2026-03-17" };

      mockLoanModel.update.mockResolvedValue({ success: true, data: null });

      const result = await updateLoan(loanId, updateData);

      expect(result.success).toBe(true);
      expect(result.message).toBe("貸出レコードが正常に更新されました");
    });

    test("レコードが存在しない場合にエラーを返す", async () => {
      const loanId = "999";
      const updateData = { returnDate: "2026-03-17" };

      mockLoanModel.update.mockResolvedValue({
        success: false,
        message: "レコードが見つかりません",
      });

      const result = await updateLoan(loanId, updateData);

      expect(result.success).toBe(false);
      expect(result.message).toBe("レコードが見つかりません");
    });
  });

  describe("統合テスト", () => {
    test("貸出から返却までのライフサイクルが正しく動作する", async () => {
      const isbn = "9784167158057";
      const userId = "testuser";
      const loanDate = "2026-03-10";
      const returnDate = "2026-03-17";

      // 貸出処理のモック
      withTransaction.mockImplementation((files, callback) => callback());
      mockBookModel.findOne.mockResolvedValue({
        success: true,
        data: { isbn, title: "テスト書籍" },
      });
      mockLoanModel.create.mockResolvedValue({
        success: true,
        data: { loanId: "123" },
      });
      isAdmin.mockResolvedValue(false);

      // 貸出実行
      const lendResult = await lendBook(isbn, userId, loanDate);
      expect(lendResult.success).toBe(true);

      // 返却処理のモック
      const mockLoans = [
        { loanId: "123", bookId: isbn, userId, returnDate: null },
      ];
      mockLoanModel.findAll.mockResolvedValue({
        success: true,
        data: mockLoans,
      });
      mockLoanModel.update.mockResolvedValue({ success: true, data: null });

      // 返却実行
      const returnResult = await returnBook(isbn, userId, returnDate);
      expect(returnResult.success).toBe(true);
    });
  });
});
