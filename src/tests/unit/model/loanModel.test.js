/**
 * Loanモデルの単体テスト
 */

const {
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
  checkIfOverdue
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

describe("Loan Model Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("lendBook", () => {
    test("有効な情報で書籍貸出が成功する", async () => {
      const isbn = "9784167158057";
      const userId = "testuser";
      const loanDate = "2026-03-10";
      
      // モックの設定
      withTransaction.mockImplementation((files, callback) => callback());
      mockBookModel.findOne.mockResolvedValue({ isbn, title: "テスト書籍" });
      mockLoanModel.create.mockResolvedValue({ loanId: "123456789" });
      isAdmin.mockResolvedValue(false);
      
      const result = await lendBook(isbn, userId, loanDate);
      
      expect(result.success).toBe(true);
      expect(result.message).toBe("書籍が正常に貸出されました");
      expect(result.data).toHaveProperty("loanId");
      expect(result.data).toHaveProperty("dueDate");
      
      expect(withTransaction).toHaveBeenCalled();
      expect(mockBookModel.findOne).toHaveBeenCalledWith(isbn);
      expect(mockLoanModel.create).toHaveBeenCalled();
    });

    test("存在しない書籍の場合にエラーが発生する", async () => {
      const isbn = "nonexistent";
      const userId = "testuser";
      const loanDate = "2026-03-10";
      
      // モックの設定
      withTransaction.mockImplementation((files, callback) => callback());
      mockBookModel.findOne.mockResolvedValue(null);
      
      await expect(lendBook(isbn, userId, loanDate)).rejects.toThrow("BOOK_NOT_EXIST");
      
      expect(withTransaction).toHaveBeenCalled();
      expect(mockBookModel.findOne).toHaveBeenCalledWith(isbn);
    });

    test("既に貸出中の書籍の場合にエラーが発生する", async () => {
      const isbn = "9784167158057";
      const userId = "testuser";
      const loanDate = "2026-03-10";
      
      // モックの設定
      withTransaction.mockImplementation((files, callback) => callback());
      mockBookModel.findOne.mockResolvedValue({ isbn, title: "テスト書籍" });
      // findActiveLoanが存在する貸出を返す
      jest.spyOn(require("../../../model/loanModel"), "findActiveLoan").mockResolvedValue({ loanId: "123" });
      
      await expect(lendBook(isbn, userId, loanDate)).rejects.toThrow("BOOK_ALREADY_LENDING");
      
      expect(withTransaction).toHaveBeenCalled();
      expect(mockBookModel.findOne).toHaveBeenCalledWith(isbn);
    });

    test("管理者ユーザーの貸出期限が14日後になる", async () => {
      const isbn = "9784167158057";
      const userId = "admin";
      const loanDate = "2026-03-10";
      
      // モックの設定
      withTransaction.mockImplementation((files, callback) => callback());
      mockBookModel.findOne.mockResolvedValue({ isbn, title: "テスト書籍" });
      mockLoanModel.create.mockResolvedValue({ loanId: "123456789" });
      isAdmin.mockResolvedValue(true);
      
      const result = await lendBook(isbn, userId, loanDate);
      
      expect(result.success).toBe(true);
      expect(result.data.dueDate).toBe("2026-03-24"); // 14日後
    });

    test("一般ユーザーの貸出期限が7日後になる", async () => {
      const isbn = "9784167158057";
      const userId = "user";
      const loanDate = "2026-03-10";
      
      // モックの設定
      withTransaction.mockImplementation((files, callback) => callback());
      mockBookModel.findOne.mockResolvedValue({ isbn, title: "テスト書籍" });
      mockLoanModel.create.mockResolvedValue({ loanId: "123456789" });
      isAdmin.mockResolvedValue(false);
      
      const result = await lendBook(isbn, userId, loanDate);
      
      expect(result.success).toBe(true);
      expect(result.data.dueDate).toBe("2026-03-17"); // 7日後
    });
  });

  describe("returnBook", () => {
    test("有効な情報で書籍返却が成功する", async () => {
      const isbn = "9784167158057";
      const userId = "testuser";
      const returnDate = "2026-03-17";
      
      // モックの設定
      withTransaction.mockImplementation((files, callback) => callback());
      mockBookModel.findOne.mockResolvedValue({ isbn, title: "テスト書籍" });
      jest.spyOn(require("../../../model/loanModel"), "findActiveLoan").mockResolvedValue({ loanId: "123" });
      mockLoanModel.update.mockResolvedValue();
      
      const result = await returnBook(isbn, userId, returnDate);
      
      expect(result.success).toBe(true);
      expect(result.message).toBe("書籍が正常に返却されました");
      expect(result.data).toBeNull();
      
      expect(withTransaction).toHaveBeenCalled();
      expect(mockBookModel.findOne).toHaveBeenCalledWith(isbn);
      expect(mockLoanModel.update).toHaveBeenCalledWith("123", { returnDate });
    });

    test("存在しない書籍の場合にエラーが発生する", async () => {
      const isbn = "nonexistent";
      const userId = "testuser";
      const returnDate = "2026-03-17";
      
      // モックの設定
      withTransaction.mockImplementation((files, callback) => callback());
      mockBookModel.findOne.mockResolvedValue(null);
      
      await expect(returnBook(isbn, userId, returnDate)).rejects.toThrow("BOOK_NOT_EXIST");
      
      expect(withTransaction).toHaveBeenCalled();
      expect(mockBookModel.findOne).toHaveBeenCalledWith(isbn);
    });

    test("貸出されていない書籍の場合にエラーが発生する", async () => {
      const isbn = "9784167158057";
      const userId = "testuser";
      const returnDate = "2026-03-17";
      
      // モックの設定
      withTransaction.mockImplementation((files, callback) => callback());
      mockBookModel.findOne.mockResolvedValue({ isbn, title: "テスト書籍" });
      jest.spyOn(require("../../../model/loanModel"), "findActiveLoan").mockResolvedValue(null);
      
      await expect(returnBook(isbn, userId, returnDate)).rejects.toThrow("BOOK_NOT_LENDING");
      
      expect(withTransaction).toHaveBeenCalled();
      expect(mockBookModel.findOne).toHaveBeenCalledWith(isbn);
    });
  });

  describe("createLoan", () => {
    test("有効な情報でローン作成が成功する", async () => {
      const isbn = "9784167158057";
      const userId = "testuser";
      const loanDate = "2026-03-10";
      const returnDate = null;
      
      // モックの設定
      mockBookModel.findOne.mockResolvedValue({ isbn, title: "テスト書籍" });
      mockLoanModel.create.mockResolvedValue({ loanId: "123456789" });
      
      const result = await createLoan(isbn, userId, loanDate, returnDate);
      
      expect(result.success).toBe(true);
      expect(result.message).toBe("ローンが正常に作成されました");
      expect(result.data.loanId).toBe("123456789");
      
      expect(mockBookModel.findOne).toHaveBeenCalledWith(isbn);
      expect(mockLoanModel.create).toHaveBeenCalled();
    });

    test("存在しない書籍の場合にエラーが発生する", async () => {
      const isbn = "nonexistent";
      const userId = "testuser";
      const loanDate = "2026-03-10";
      
      // モックの設定
      mockBookModel.findOne.mockResolvedValue(null);
      
      await expect(createLoan(isbn, userId, loanDate)).rejects.toThrow("Book not found.");
      
      expect(mockBookModel.findOne).toHaveBeenCalledWith(isbn);
    });

    test("返却日付きでローン作成が成功する", async () => {
      const isbn = "9784167158057";
      const userId = "testuser";
      const loanDate = "2026-03-10";
      const returnDate = "2026-03-17";
      
      // モックの設定
      mockBookModel.findOne.mockResolvedValue({ isbn, title: "テスト書籍" });
      mockLoanModel.create.mockResolvedValue({ loanId: "123456789" });
      
      const result = await createLoan(isbn, userId, loanDate, returnDate);
      
      expect(result.success).toBe(true);
      expect(result.data.loanId).toBe("123456789");
      
      expect(mockLoanModel.create).toHaveBeenCalledWith(
        expect.any(String), // loanId
        isbn,
        userId,
        loanDate,
        returnDate
      );
    });
  });

  describe("findActiveLoan", () => {
    test("アクティブなローンが見つかる", async () => {
      const isbn = "9784167158057";
      const userId = "testuser";
      const mockLoans = [
        { loanId: "1", bookId: isbn, userId, returnDate: null },
        { loanId: "2", bookId: "other", userId, returnDate: null }
      ];
      
      // モックの設定
      jest.spyOn(require("../../../model/loanModel"), "getUserLoans").mockResolvedValue({
        success: true,
        data: mockLoans
      });
      
      const result = await findActiveLoan(isbn, userId);
      
      expect(result).toEqual(mockLoans[0]);
      expect(result.bookId).toBe(isbn);
      expect(result.returnDate).toBeNull();
    });

    test("アクティブなローンが見つからない", async () => {
      const isbn = "9784167158057";
      const userId = "testuser";
      const mockLoans = [
        { loanId: "1", bookId: "other", userId, returnDate: null },
        { loanId: "2", bookId: isbn, userId, returnDate: "2026-03-17" }
      ];
      
      // モックの設定
      jest.spyOn(require("../../../model/loanModel"), "getUserLoans").mockResolvedValue({
        success: true,
        data: mockLoans
      });
      
      const result = await findActiveLoan(isbn, userId);
      
      expect(result).toBeNull();
    });

    test("userIdなしで検索", async () => {
      const isbn = "9784167158057";
      const mockLoans = [
        { loanId: "1", bookId: isbn, userId: "user1", returnDate: null },
        { loanId: "2", bookId: isbn, userId: "user2", returnDate: null }
      ];
      
      // モックの設定
      jest.spyOn(require("../../../model/loanModel"), "getUserLoans").mockResolvedValue({
        success: true,
        data: mockLoans
      });
      
      const result = await findActiveLoan(isbn);
      
      expect(result).toEqual(mockLoans[0]); // 最初に見つかったもの
    });
  });

  describe("updateLoan", () => {
    test("ローン更新が成功する", async () => {
      const loanId = "123456789";
      const updateData = { returnDate: "2026-03-17" };
      
      // モックの設定
      mockLoanModel.update.mockResolvedValue();
      
      const result = await updateLoan(loanId, updateData);
      
      expect(result.success).toBe(true);
      expect(result.message).toBe("ローンが正常に更新されました");
      expect(result.data).toBeNull();
      
      expect(mockLoanModel.update).toHaveBeenCalledWith(loanId, updateData);
    });

    test("データベースエラーを適切に処理する", async () => {
      const loanId = "123456789";
      const updateData = { returnDate: "2026-03-17" };
      
      // モックの設定
      mockLoanModel.update.mockRejectedValue(new Error("Database error"));
      
      await expect(updateLoan(loanId, updateData)).rejects.toThrow("Database error");
      
      expect(mockLoanModel.update).toHaveBeenCalledWith(loanId, updateData);
    });
  });

  describe("getUserLoans", () => {
    test("特定ユーザーのローンを取得できる", async () => {
      const userId = "testuser";
      const mockLoans = [
        { loanId: "1", userId, bookId: "isbn1" },
        { loanId: "2", userId, bookId: "isbn2" }
      ];
      
      // モックの設定
      mockLoanModel.findByUserId.mockResolvedValue(mockLoans);
      
      const result = await getUserLoans(userId);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockLoans);
      expect(result.data).toHaveLength(2);
      expect(result.message).toBe("ローンが正常に取得されました");
      
      expect(mockLoanModel.findByUserId).toHaveBeenCalledWith(userId);
    });

    test("全ユーザーのローンを取得できる", async () => {
      const mockLoans = [
        { loanId: "1", userId: "user1", bookId: "isbn1" },
        { loanId: "2", userId: "user2", bookId: "isbn2" }
      ];
      
      // モックの設定
      mockLoanModel.findByUserId.mockResolvedValue(mockLoans);
      
      const result = await getUserLoans();
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockLoans);
      expect(result.data).toHaveLength(2);
      
      expect(mockLoanModel.findByUserId).toHaveBeenCalledWith();
    });

    test("データベースエラーを適切に処理する", async () => {
      const userId = "testuser";
      
      // モックの設定
      mockLoanModel.findByUserId.mockRejectedValue(new Error("Database error"));
      
      await expect(getUserLoans(userId)).rejects.toThrow("Database error");
      
      expect(mockLoanModel.findByUserId).toHaveBeenCalledWith(userId);
    });
  });

  describe("isBookCurrentlyLoaned", () => {
    test("貸出中の書籍の場合にtrueを返す", async () => {
      const isbn = "9784167158057";
      const mockLoans = [
        { loanId: "1", bookId: isbn, userId: "user1", returnDate: null },
        { loanId: "2", bookId: "other", userId: "user2", returnDate: null }
      ];
      
      // モックの設定
      jest.spyOn(require("../../../model/loanModel"), "getUserLoans").mockResolvedValue({
        success: true,
        data: mockLoans
      });
      
      const result = await isBookCurrentlyLoaned(isbn);
      
      expect(result).toBe(true);
    });

    test("貸出中でない書籍の場合にfalseを返す", async () => {
      const isbn = "9784167158057";
      const mockLoans = [
        { loanId: "1", bookId: isbn, userId: "user1", returnDate: "2026-03-17" },
        { loanId: "2", bookId: "other", userId: "user2", returnDate: null }
      ];
      
      // モックの設定
      jest.spyOn(require("../../../model/loanModel"), "getUserLoans").mockResolvedValue({
        success: true,
        data: mockLoans
      });
      
      const result = await isBookCurrentlyLoaned(isbn);
      
      expect(result).toBe(false);
    });

    test("該当書籍がない場合にfalseを返す", async () => {
      const isbn = "nonexistent";
      const mockLoans = [
        { loanId: "1", bookId: "other1", userId: "user1", returnDate: null },
        { loanId: "2", bookId: "other2", userId: "user2", returnDate: null }
      ];
      
      // モックの設定
      jest.spyOn(require("../../../model/loanModel"), "getUserLoans").mockResolvedValue({
        success: true,
        data: mockLoans
      });
      
      const result = await isBookCurrentlyLoaned(isbn);
      
      expect(result).toBe(false);
    });
  });

  describe("getActiveLoans", () => {
    test("アクティブな貸出を取得できる", async () => {
      const isbn = "9784167158057";
      const mockLoans = [
        { loanId: "1", bookId: isbn, userId: "user1", returnDate: null },
        { loanId: "2", bookId: isbn, userId: "user2", returnDate: "2026-03-17" },
        { loanId: "3", bookId: "other", userId: "user3", returnDate: null }
      ];
      
      // モックの設定
      jest.spyOn(require("../../../model/loanModel"), "getUserLoans").mockResolvedValue({
        success: true,
        data: mockLoans
      });
      
      const result = await getActiveLoans(isbn);
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].bookId).toBe(isbn);
      expect(result.data[0].returnDate).toBeNull();
      expect(result.message).toBe("アクティブな貸出が正常に取得されました");
    });

    test("アクティブな貸出がない場合に空配列を返す", async () => {
      const isbn = "9784167158057";
      const mockLoans = [
        { loanId: "1", bookId: isbn, userId: "user1", returnDate: "2026-03-17" },
        { loanId: "2", bookId: "other", userId: "user2", returnDate: null }
      ];
      
      // モックの設定
      jest.spyOn(require("../../../model/loanModel"), "getUserLoans").mockResolvedValue({
        success: true,
        data: mockLoans
      });
      
      const result = await getActiveLoans(isbn);
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(0);
    });
  });

  describe("getOverdueBooks", () => {
    test("期限切れの書籍を取得できる", async () => {
      const today = new Date("2026-03-20");
      const mockLoans = [
        { 
          loanId: "1", 
          bookId: "isbn1", 
          userId: "user1", 
          loanDate: "2026-03-10", 
          dueDate: "2026-03-17", 
          returnDate: null 
        },
        { 
          loanId: "2", 
          bookId: "isbn2", 
          userId: "user2", 
          loanDate: "2026-03-15", 
          dueDate: "2026-03-22", 
          returnDate: null 
        },
        { 
          loanId: "3", 
          bookId: "isbn3", 
          userId: "user3", 
          loanDate: "2026-03-05", 
          returnDate: "2026-03-18" 
        }
      ];
      
      // モックの設定
      jest.spyOn(require("../../../model/loanModel"), "getUserLoans").mockResolvedValue({
        success: true,
        data: mockLoans
      });
      
      // Dateをモック
      const originalDate = global.Date;
      global.Date = jest.fn(() => today);
      global.Date.prototype = originalDate.prototype;
      
      const result = await getOverdueBooks();
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].bookId).toBe("isbn1");
      expect(result.message).toBe("期限切れ書籍が正常に取得されました");
      
      // Dateを元に戻す
      global.Date = originalDate;
    });

    test("dueDateがない場合に計算して期限切れを判定する", async () => {
      const today = new Date("2026-03-20");
      const mockLoans = [
        { 
          loanId: "1", 
          bookId: "isbn1", 
          userId: "user1", 
          loanDate: "2026-03-01", 
          returnDate: null 
          // dueDateなし
        }
      ];
      
      // モックの設定
      jest.spyOn(require("../../../model/loanModel"), "getUserLoans").mockResolvedValue({
        success: true,
        data: mockLoans
      });
      
      // Dateをモック
      const originalDate = global.Date;
      global.Date = jest.fn(() => today);
      global.Date.prototype = originalDate.prototype;
      
      const result = await getOverdueBooks();
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1); // 14日後を超えているので期限切れ
      
      // Dateを元に戻す
      global.Date = originalDate;
    });

    test("期限切れの書籍がない場合に空配列を返す", async () => {
      const today = new Date("2026-03-15");
      const mockLoans = [
        { 
          loanId: "1", 
          bookId: "isbn1", 
          userId: "user1", 
          loanDate: "2026-03-10", 
          dueDate: "2026-03-17", 
          returnDate: null 
        }
      ];
      
      // モックの設定
      jest.spyOn(require("../../../model/loanModel"), "getUserLoans").mockResolvedValue({
        success: true,
        data: mockLoans
      });
      
      // Dateをモック
      const originalDate = global.Date;
      global.Date = jest.fn(() => today);
      global.Date.prototype = originalDate.prototype;
      
      const result = await getOverdueBooks();
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(0);
      
      // Dateを元に戻す
      global.Date = originalDate;
    });
  });

  describe("getLoanHistory", () => {
    test("ユーザーの貸出履歴を取得できる", async () => {
      const userId = "testuser";
      const today = new Date("2026-03-20");
      const mockLoans = [
        { 
          loanId: "1", 
          bookId: "isbn1", 
          userId, 
          loanDate: "2026-03-10", 
          dueDate: "2026-03-17", 
          returnDate: "2026-03-16" 
        },
        { 
          loanId: "2", 
          bookId: "isbn2", 
          userId, 
          loanDate: "2026-03-15", 
          dueDate: "2026-03-22", 
          returnDate: null 
        },
        { 
          loanId: "3", 
          bookId: "isbn3", 
          userId, 
          loanDate: "2026-03-01", 
          dueDate: "2026-03-08", 
          returnDate: null 
        }
      ];
      
      // モックの設定
      jest.spyOn(require("../../../model/loanModel"), "getUserLoans").mockResolvedValue({
        success: true,
        data: mockLoans
      });
      
      // Dateをモック
      const originalDate = global.Date;
      global.Date = jest.fn(() => today);
      global.Date.prototype = originalDate.prototype;
      
      const result = await getLoanHistory(userId);
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(3);
      
      // 返却済みの書籍
      expect(result.data[0].isOverdue).toBe(false);
      expect(result.data[0].returnDate).toBe("2026-03-16");
      
      // 期限内の書籍
      expect(result.data[1].isOverdue).toBe(false);
      expect(result.data[1].returnDate).toBeNull();
      
      // 期限切れの書籍
      expect(result.data[2].isOverdue).toBe(true);
      expect(result.data[2].returnDate).toBeNull();
      
      expect(result.message).toBe("貸出履歴が正常に取得されました");
      
      // Dateを元に戻す
      global.Date = originalDate;
    });

    test("dueDateがない場合に計算してisOverdueを判定する", async () => {
      const userId = "testuser";
      const today = new Date("2026-03-20");
      const mockLoans = [
        { 
          loanId: "1", 
          bookId: "isbn1", 
          userId, 
          loanDate: "2026-03-01", 
          returnDate: null 
          // dueDateなし
        }
      ];
      
      // モックの設定
      jest.spyOn(require("../../../model/loanModel"), "getUserLoans").mockResolvedValue({
        success: true,
        data: mockLoans
      });
      
      // Dateをモック
      const originalDate = global.Date;
      global.Date = jest.fn(() => today);
      global.Date.prototype = originalDate.prototype;
      
      const result = await getLoanHistory(userId);
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].isOverdue).toBe(true); // 14日後を超えている
      
      // Dateを元に戻す
      global.Date = originalDate;
    });
  });

  describe("checkIfOverdue", () => {
    test("保存されているdueDateで期限切れを判定する", async () => {
      const userId = "testuser";
      const loanDate = "2026-03-10";
      const dueDate = "2026-03-17";
      const today = new Date("2026-03-20");
      
      // Dateをモック
      const originalDate = global.Date;
      global.Date = jest.fn(() => today);
      global.Date.prototype = originalDate.prototype;
      
      const result = await checkIfOverdue(userId, loanDate, dueDate);
      
      expect(result).toBe(true); // 期限切れ
      
      // Dateを元に戻す
      global.Date = originalDate;
    });

    test("dueDateがない場合に計算して期限切れを判定する", async () => {
      const userId = "testuser";
      const loanDate = "2026-03-10";
      const today = new Date("2026-03-20");
      
      // モックの設定
      isAdmin.mockResolvedValue(false);
      
      // Dateをモック
      const originalDate = global.Date;
      global.Date = jest.fn(() => today);
      global.Date.prototype = originalDate.prototype;
      
      const result = await checkIfOverdue(userId, loanDate);
      
      expect(result).toBe(true); // 7日後を超えているので期限切れ
      
      // Dateを元に戻す
      global.Date = originalDate;
    });

    test("期限内の場合にfalseを返す", async () => {
      const userId = "testuser";
      const loanDate = "2026-03-10";
      const dueDate = "2026-03-17";
      const today = new Date("2026-03-15");
      
      // Dateをモック
      const originalDate = global.Date;
      global.Date = jest.fn(() => today);
      global.Date.prototype = originalDate.prototype;
      
      const result = await checkIfOverdue(userId, loanDate, dueDate);
      
      expect(result).toBe(false); // 期限内
      
      // Dateを元に戻す
      global.Date = originalDate;
    });
  });

  describe("統合テスト", () => {
    test("貸出から返却までのライフサイクルが正しく動作する", async () => {
      const isbn = "9784167158057";
      const userId = "testuser";
      const loanDate = "2026-03-10";
      const returnDate = "2026-03-17";
      
      // 1. 貸出
      withTransaction.mockImplementation((files, callback) => callback());
      mockBookModel.findOne.mockResolvedValue({ isbn, title: "テスト書籍" });
      mockLoanModel.create.mockResolvedValue({ loanId: "123456789" });
      isAdmin.mockResolvedValue(false);
      
      const lendResult = await lendBook(isbn, userId, loanDate);
      expect(lendResult.success).toBe(true);
      
      // 2. アクティブローン確認
      jest.spyOn(require("../../../model/loanModel"), "findActiveLoan").mockResolvedValue({ 
        loanId: "123456789", 
        bookId: isbn, 
        userId, 
        returnDate: null 
      });
      
      const activeLoan = await findActiveLoan(isbn, userId);
      expect(activeLoan.loanId).toBe("123456789");
      
      // 3. 貸出中確認
      jest.spyOn(require("../../../model/loanModel"), "getUserLoans").mockResolvedValue({
        success: true,
        data: [{ loanId: "123456789", bookId: isbn, userId, returnDate: null }]
      });
      
      const isLoaned = await isBookCurrentlyLoaned(isbn);
      expect(isLoaned).toBe(true);
      
      // 4. 返却
      mockLoanModel.update.mockResolvedValue();
      
      const returnResult = await returnBook(isbn, userId, returnDate);
      expect(returnResult.success).toBe(true);
      
      // 5. 返却後の確認
      jest.spyOn(require("../../../model/loanModel"), "findActiveLoan").mockResolvedValue(null);
      
      const finalActiveLoan = await findActiveLoan(isbn, userId);
      expect(finalActiveLoan).toBeNull();
    });

    test("管理者と一般ユーザーの貸出期限が異なる", async () => {
      const isbn = "9784167158057";
      const loanDate = "2026-03-10";
      
      withTransaction.mockImplementation((files, callback) => callback());
      mockBookModel.findOne.mockResolvedValue({ isbn, title: "テスト書籍" });
      mockLoanModel.create.mockResolvedValue({ loanId: "123456789" });
      
      // 管理者の場合
      isAdmin.mockResolvedValue(true);
      
      const adminResult = await lendBook(isbn, "admin", loanDate);
      expect(adminResult.data.dueDate).toBe("2026-03-24"); // 14日後
      
      jest.clearAllMocks();
      
      // 一般ユーザーの場合
      withTransaction.mockImplementation((files, callback) => callback());
      mockBookModel.findOne.mockResolvedValue({ isbn, title: "テスト書籍" });
      mockLoanModel.create.mockResolvedValue({ loanId: "123456789" });
      isAdmin.mockResolvedValue(false);
      
      const userResult = await lendBook(isbn, "user", loanDate);
      expect(userResult.data.dueDate).toBe("2026-03-17"); // 7日後
    });
  });
});
