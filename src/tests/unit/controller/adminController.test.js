/**
 * Adminコントローラーの単体テスト
 */

const { createAdmin, getAdmin, updateAdmin, deleteAdmin } = require("../../../controller/adminController");

// モックの設定
jest.mock("../../../model/adminModel");
jest.mock("../../../services/errorHandling");

const adminModel = require("../../../model/adminModel");
const { errorResponse } = require("../../../services/errorHandling");

describe("Admin Controller Tests", () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockReq = {
      body: {},
      params: {},
      query: {}
    };
    
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };
    
    mockNext = jest.fn();
  });

  describe("createAdmin", () => {
    test("有効な管理者データで作成が成功する", async () => {
      const adminData = {
        id: "testadmin",
        password: "testpass123"
      };
      
      mockReq.body = adminData;
      
      // モックの設定
      adminModel.createAdmin.mockResolvedValue({
        success: true,
        message: "管理者が正常に作成されました"
      });
      
      await createAdmin(mockReq, mockRes, mockNext);
      
      expect(adminModel.createAdmin).toHaveBeenCalledWith("testadmin", "testpass123");
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "管理者が正常に作成されました"
      });
    });

    test("idがない場合にエラーレスポンスを返す", async () => {
      const adminData = {
        password: "testpass123"
      };
      
      mockReq.body = adminData;
      
      // モックの設定
      errorResponse.mockImplementation((res, statusCode) => {
        res.status(statusCode).json({ success: false });
      });
      
      await createAdmin(mockReq, mockRes, mockNext);
      
      expect(errorResponse).toHaveBeenCalledWith(mockRes, 200);
      expect(adminModel.createAdmin).not.toHaveBeenCalled();
    });

    test("passwordがない場合にエラーレスポンスを返す", async () => {
      const adminData = {
        id: "testadmin"
      };
      
      mockReq.body = adminData;
      
      // モックの設定
      errorResponse.mockImplementation((res, statusCode) => {
        res.status(statusCode).json({ success: false });
      });
      
      await createAdmin(mockReq, mockRes, mockNext);
      
      expect(errorResponse).toHaveBeenCalledWith(mockRes, 200);
      expect(adminModel.createAdmin).not.toHaveBeenCalled();
    });

    test("両方のフィールドが空の場合にエラーレスポンスを返す", async () => {
      const adminData = {
        id: "",
        password: ""
      };
      
      mockReq.body = adminData;
      
      // モックの設定
      errorResponse.mockImplementation((res, statusCode) => {
        res.status(statusCode).json({ success: false });
      });
      
      await createAdmin(mockReq, mockRes, mockNext);
      
      expect(errorResponse).toHaveBeenCalledWith(mockRes, 200);
      expect(adminModel.createAdmin).not.toHaveBeenCalled();
    });

    test("モデルが失敗を返した場合にエラーレスポンスを返す", async () => {
      const adminData = {
        id: "testadmin",
        password: "testpass123"
      };
      
      mockReq.body = adminData;
      
      // モックの設定
      adminModel.createAdmin.mockResolvedValue({
        success: false,
        message: "管理者作成に失敗しました"
      });
      errorResponse.mockImplementation((res, statusCode) => {
        res.status(statusCode).json({ success: false });
      });
      
      await createAdmin(mockReq, mockRes, mockNext);
      
      expect(adminModel.createAdmin).toHaveBeenCalledWith("testadmin", "testpass123");
      expect(errorResponse).toHaveBeenCalledWith(mockRes, 500);
    });

    test("モデルで例外が発生した場合にエラーレスポンスを返す", async () => {
      const adminData = {
        id: "testadmin",
        password: "testpass123"
      };
      
      mockReq.body = adminData;
      
      // モックの設定
      adminModel.createAdmin.mockRejectedValue(new Error("データベースエラー"));
      errorResponse.mockImplementation((res, statusCode) => {
        res.status(statusCode).json({ success: false });
      });
      
      await createAdmin(mockReq, mockRes, mockNext);
      
      expect(adminModel.createAdmin).toHaveBeenCalledWith("testadmin", "testpass123");
      expect(errorResponse).toHaveBeenCalledWith(mockRes, 500);
    });
  });

  describe("getAdmin", () => {
    test("管理者情報取得が成功する", () => {
      getAdmin(mockReq, mockRes, mockNext);
      
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "管理者情報が正常に取得されました",
        data: null
      });
    });

    test("常に同じレスポンス形式を返す", () => {
      getAdmin(mockReq, mockRes, mockNext);
      
      const response = mockRes.json.mock.calls[0][0];
      
      expect(response).toHaveProperty("success", true);
      expect(response).toHaveProperty("message", "管理者情報が正常に取得されました");
      expect(response).toHaveProperty("data", null);
    });
  });

  describe("updateAdmin", () => {
    test("管理者情報更新が成功する", () => {
      updateAdmin(mockReq, mockRes, mockNext);
      
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "管理者情報が正常に更新されました",
        data: null
      });
    });

    test("常に同じレスポンス形式を返す", () => {
      updateAdmin(mockReq, mockRes, mockNext);
      
      const response = mockRes.json.mock.calls[0][0];
      
      expect(response).toHaveProperty("success", true);
      expect(response).toHaveProperty("message", "管理者情報が正常に更新されました");
      expect(response).toHaveProperty("data", null);
    });
  });

  describe("deleteAdmin", () => {
    test("管理者削除が成功する", () => {
      deleteAdmin(mockReq, mockRes, mockNext);
      
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "管理者が正常に削除されました",
        data: null
      });
    });

    test("常に同じレスポンス形式を返す", () => {
      deleteAdmin(mockReq, mockRes, mockNext);
      
      const response = mockRes.json.mock.calls[0][0];
      
      expect(response).toHaveProperty("success", true);
      expect(response).toHaveProperty("message", "管理者が正常に削除されました");
      expect(response).toHaveProperty("data", null);
    });
  });

  describe("レスポンス形式の一貫性", () => {
    test("成功時のレスポンス形式が統一されている", () => {
      // getAdmin
      getAdmin(mockReq, mockRes, mockNext);
      const getResponse = mockRes.json.mock.calls[0][0];
      
      jest.clearAllMocks();
      
      // updateAdmin
      updateAdmin(mockReq, mockRes, mockNext);
      const updateResponse = mockRes.json.mock.calls[0][0];
      
      jest.clearAllMocks();
      
      // deleteAdmin
      deleteAdmin(mockReq, mockRes, mockNext);
      const deleteResponse = mockRes.json.mock.calls[0][0];
      
      // すべてのレスポンスが同じ構造を持つ
      expect(getResponse).toHaveProperty("success");
      expect(getResponse).toHaveProperty("message");
      expect(getResponse).toHaveProperty("data");
      
      expect(updateResponse).toHaveProperty("success");
      expect(updateResponse).toHaveProperty("message");
      expect(updateResponse).toHaveProperty("data");
      
      expect(deleteResponse).toHaveProperty("success");
      expect(deleteResponse).toHaveProperty("message");
      expect(deleteResponse).toHaveProperty("data");
    });

    test("成功時のステータスコードが正しい", async () => {
      const adminData = {
        id: "testadmin",
        password: "testpass123"
      };
      
      mockReq.body = adminData;
      adminModel.createAdmin.mockResolvedValue({
        success: true,
        message: "管理者が正常に作成されました"
      });
      
      await createAdmin(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe("バリデーション", () => {
    test("undefined値のチェックが正しく動作する", async () => {
      const testCases = [
        { id: undefined, password: "pass" },
        { id: "admin", password: undefined },
        { id: undefined, password: undefined },
        { id: null, password: "pass" },
        { id: "admin", password: null },
        { id: null, password: null }
      ];
      
      errorResponse.mockImplementation((res, statusCode) => {
        res.status(statusCode).json({ success: false });
      });
      
      for (const testCase of testCases) {
        jest.clearAllMocks();
        mockReq.body = testCase;
        
        await createAdmin(mockReq, mockRes, mockNext);
        
        expect(errorResponse).toHaveBeenCalledWith(mockRes, 200);
        expect(adminModel.createAdmin).not.toHaveBeenCalled();
      }
    });

    test("空文字列は有効な値として扱われる", async () => {
      const adminData = {
        id: "",
        password: ""
      };
      
      mockReq.body = adminData;
      
      // 空文字列はundefinedではないのでバリデーションを通過するはず
      adminModel.createAdmin.mockResolvedValue({
        success: true,
        message: "管理者が正常に作成されました"
      });
      
      await createAdmin(mockReq, mockRes, mockNext);
      
      expect(adminModel.createAdmin).toHaveBeenCalledWith("", "");
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe("エラーハンドリング", () => {
    test("errorResponseが正しく呼び出される", async () => {
      const adminData = {
        id: "testadmin",
        password: "testpass123"
      };
      
      mockReq.body = adminData;
      
      adminModel.createAdmin.mockResolvedValue({
        success: false,
        message: "作成失敗"
      });
      
      errorResponse.mockImplementation((res, statusCode) => {
        res.status(statusCode).json({ success: false, error: "作成失敗" });
      });
      
      await createAdmin(mockReq, mockRes, mockNext);
      
      expect(errorResponse).toHaveBeenCalledWith(mockRes, 500);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: "作成失敗"
      });
    });
  });

  describe("統合テスト", () => {
    test("管理者操作の全フローが正しく動作する", async () => {
      // 1. 作成成功
      const adminData = {
        id: "testadmin",
        password: "testpass123"
      };
      
      mockReq.body = adminData;
      adminModel.createAdmin.mockResolvedValue({
        success: true,
        message: "管理者が正常に作成されました"
      });
      
      await createAdmin(mockReq, mockRes, mockNext);
      
      const createResponse = mockRes.json.mock.calls[0][0];
      expect(createResponse.success).toBe(true);
      expect(createResponse.message).toBe("管理者が正常に作成されました");
      
      // 2. 情報取得
      jest.clearAllMocks();
      getAdmin(mockReq, mockRes, mockNext);
      
      const getResponse = mockRes.json.mock.calls[0][0];
      expect(getResponse.success).toBe(true);
      expect(getResponse.message).toBe("管理者情報が正常に取得されました");
      
      // 3. 情報更新
      jest.clearAllMocks();
      updateAdmin(mockReq, mockRes, mockNext);
      
      const updateResponse = mockRes.json.mock.calls[0][0];
      expect(updateResponse.success).toBe(true);
      expect(updateResponse.message).toBe("管理者情報が正常に更新されました");
      
      // 4. 削除
      jest.clearAllMocks();
      deleteAdmin(mockReq, mockRes, mockNext);
      
      const deleteResponse = mockRes.json.mock.calls[0][0];
      expect(deleteResponse.success).toBe(true);
      expect(deleteResponse.message).toBe("管理者が正常に削除されました");
    });

    test("エラーケースでの一貫した動作", async () => {
      const adminData = {
        id: "testadmin",
        password: "testpass123"
      };
      
      mockReq.body = adminData;
      
      // モデル失敗
      adminModel.createAdmin.mockResolvedValue({ success: false });
      errorResponse.mockImplementation((res, statusCode) => {
        res.status(statusCode).json({ success: false, error: "model error" });
      });
      
      await createAdmin(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: "model error"
      });
      
      // モデル例外
      jest.clearAllMocks();
      adminModel.createAdmin.mockRejectedValue(new Error("exception"));
      errorResponse.mockImplementation((res, statusCode) => {
        res.status(statusCode).json({ success: false, error: "exception" });
      });
      
      await createAdmin(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: "exception"
      });
    });
  });
});
