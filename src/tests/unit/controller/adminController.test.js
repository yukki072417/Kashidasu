/**
 * Adminコントローラーの単体テスト
 */

const {
  createAdmin,
  getAdmin,
  updateAdmin,
  deleteAdmin,
} = require("../../../controller/adminController");

// モックの設定
jest.mock("../../../model/adminModel");

const adminModel = require("../../../model/adminModel");

describe("Admin Controller Tests", () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      body: {},
      params: {},
      query: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };

    mockNext = jest.fn();
  });

  describe("createAdmin", () => {
    test("有効な管理者データで作成が成功する", async () => {
      const adminData = {
        id: "testadmin",
        password: "testpass123",
      };

      mockReq.body = adminData;

      // モックの設定
      adminModel.createAdmin.mockResolvedValue({
        success: true,
        data: null,
        message: "管理者が正常に作成されました",
      });

      await createAdmin(mockReq, mockRes, mockNext);

      expect(adminModel.createAdmin).toHaveBeenCalledWith(
        "testadmin",
        "testpass123",
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: null,
        message: "管理者が正常に作成されました",
      });
    });

    test("idがない場合に400エラーを返す", async () => {
      const adminData = {
        password: "testpass123",
      };

      mockReq.body = adminData;

      await createAdmin(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "IDとパスワードは必須です",
      });
      expect(adminModel.createAdmin).not.toHaveBeenCalled();
    });

    test("passwordがない場合に400エラーを返す", async () => {
      const adminData = {
        id: "testadmin",
      };

      mockReq.body = adminData;

      await createAdmin(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "IDとパスワードは必須です",
      });
      expect(adminModel.createAdmin).not.toHaveBeenCalled();
    });

    test("両方のフィールドが空の場合に400エラーを返す", async () => {
      const adminData = {
        id: "",
        password: "",
      };

      mockReq.body = adminData;

      await createAdmin(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "IDとパスワードは必須です",
      });
      expect(adminModel.createAdmin).not.toHaveBeenCalled();
    });

    test("モデルが失敗を返した場合に400エラーを返す", async () => {
      const adminData = {
        id: "testadmin",
        password: "testpass123",
      };

      mockReq.body = adminData;

      // モックの設定
      adminModel.createAdmin.mockResolvedValue({
        success: false,
        message: "管理者作成に失敗しました",
      });

      await createAdmin(mockReq, mockRes, mockNext);

      expect(adminModel.createAdmin).toHaveBeenCalledWith(
        "testadmin",
        "testpass123",
      );
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "管理者作成に失敗しました",
      });
    });

    test("モデルで例外が発生した場合にエラーをthrowする", async () => {
      const adminData = {
        id: "testadmin",
        password: "testpass123",
      };

      mockReq.body = adminData;

      // モックの設定
      adminModel.createAdmin.mockRejectedValue(new Error("データベースエラー"));

      // コントローラー関数を実行
      await createAdmin(mockReq, mockRes, mockNext);

      expect(adminModel.createAdmin).toHaveBeenCalledWith(
        "testadmin",
        "testpass123",
      );
      expect(mockNext).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe("getAdmin", () => {
    test("管理者情報取得が成功する", async () => {
      const adminId = "testadmin";
      mockReq.params.adminId = adminId;

      adminModel.getAdminById.mockResolvedValue({
        success: true,
        data: { adminId, password: "hashed" },
        message: "管理者が正常に取得されました",
      });

      await getAdmin(mockReq, mockRes, mockNext);

      expect(adminModel.getAdminById).toHaveBeenCalledWith(adminId);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { adminId, password: "hashed" },
        message: "管理者が正常に取得されました",
      });
    });

    test("adminIdがない場合に400エラーを返す", async () => {
      await getAdmin(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "管理者IDは必須です",
      });
      expect(adminModel.getAdminById).not.toHaveBeenCalled();
    });

    test("モデルが失敗を返した場合に404エラーを返す", async () => {
      const adminId = "nonexistent";
      mockReq.params.adminId = adminId;

      adminModel.getAdminById.mockResolvedValue({
        success: false,
        message: "管理者が見つかりません",
      });

      await getAdmin(mockReq, mockRes, mockNext);

      expect(adminModel.getAdminById).toHaveBeenCalledWith(adminId);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "管理者が見つかりません",
      });
    });

    test("モデルで例外が発生した場合にエラーをthrowする", async () => {
      const adminId = "testadmin";
      mockReq.params.adminId = adminId;

      adminModel.getAdminById.mockRejectedValue(
        new Error("データベースエラー"),
      );

      // コントローラー関数を実行
      await getAdmin(mockReq, mockRes, mockNext);

      expect(adminModel.getAdminById).toHaveBeenCalledWith(adminId);
      expect(mockNext).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe("updateAdmin", () => {
    test("管理者情報更新が成功する", async () => {
      const adminId = "testadmin";
      const updateData = {
        id: "newadmin",
        password: "newpass123",
      };

      mockReq.params.adminId = adminId;
      mockReq.body = updateData;

      adminModel.updateAdmin.mockResolvedValue({
        success: true,
        data: null,
        message: "管理者が正常に更新されました",
      });

      await updateAdmin(mockReq, mockRes, mockNext);

      expect(adminModel.updateAdmin).toHaveBeenCalledWith(
        adminId,
        "newadmin",
        "newpass123",
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: null,
        message: "管理者が正常に更新されました",
      });
    });

    test("adminIdがない場合に400エラーを返す", async () => {
      const updateData = { id: "newadmin", password: "newpass123" };
      mockReq.body = updateData;

      await updateAdmin(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "すべてのフィールドは必須です",
      });
      expect(adminModel.updateAdmin).not.toHaveBeenCalled();
    });

    test("更新データがない場合に400エラーを返す", async () => {
      const adminId = "testadmin";
      mockReq.params.adminId = adminId;

      await updateAdmin(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "すべてのフィールドは必須です",
      });
      expect(adminModel.updateAdmin).not.toHaveBeenCalled();
    });

    test("モデルが失敗を返した場合に400エラーを返す", async () => {
      const adminId = "nonexistent";
      const updateData = { id: "newadmin", password: "newpass123" };

      mockReq.params.adminId = adminId;
      mockReq.body = updateData;

      adminModel.updateAdmin.mockResolvedValue({
        success: false,
        message: "管理者が見つかりません",
      });

      await updateAdmin(mockReq, mockRes, mockNext);

      expect(adminModel.updateAdmin).toHaveBeenCalledWith(
        adminId,
        "newadmin",
        "newpass123",
      );
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "管理者が見つかりません",
      });
    });

    test("モデルで例外が発生した場合にエラーをthrowする", async () => {
      const adminId = "testadmin";
      const updateData = { id: "newadmin", password: "newpass123" };

      mockReq.params.adminId = adminId;
      mockReq.body = updateData;

      adminModel.updateAdmin.mockRejectedValue(new Error("データベースエラー"));

      // コントローラー関数を実行
      await updateAdmin(mockReq, mockRes, mockNext);

      expect(adminModel.updateAdmin).toHaveBeenCalledWith(
        adminId,
        "newadmin",
        "newpass123",
      );
      expect(mockNext).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe("deleteAdmin", () => {
    test("管理者削除が成功する", async () => {
      const adminId = "testadmin";
      mockReq.params.adminId = adminId;

      adminModel.deleteAdmin.mockResolvedValue({
        success: true,
        data: null,
        message: "管理者が正常に削除されました",
      });

      await deleteAdmin(mockReq, mockRes, mockNext);

      expect(adminModel.deleteAdmin).toHaveBeenCalledWith(adminId);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: null,
        message: "管理者が正常に削除されました",
      });
    });

    test("adminIdがない場合に400エラーを返す", async () => {
      await deleteAdmin(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "管理者IDは必須です",
      });
      expect(adminModel.deleteAdmin).not.toHaveBeenCalled();
    });

    test("モデルが失敗を返した場合に404エラーを返す", async () => {
      const adminId = "nonexistent";
      mockReq.params.adminId = adminId;

      adminModel.deleteAdmin.mockResolvedValue({
        success: false,
        message: "管理者が見つかりません",
      });

      await deleteAdmin(mockReq, mockRes, mockNext);

      expect(adminModel.deleteAdmin).toHaveBeenCalledWith(adminId);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "管理者が見つかりません",
      });
    });

    test("モデルで例外が発生した場合にエラーをthrowする", async () => {
      const adminId = "testadmin";
      mockReq.params.adminId = adminId;

      adminModel.deleteAdmin.mockRejectedValue(new Error("データベースエラー"));

      // コントローラー関数を実行
      await deleteAdmin(mockReq, mockRes, mockNext);

      expect(adminModel.deleteAdmin).toHaveBeenCalledWith(adminId);
      expect(mockNext).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe("レスポンス形式の一貫性", () => {
    test("成功時のレスポンス形式が統一されている", async () => {
      // createAdmin
      const adminData = { id: "testadmin", password: "testpass123" };
      mockReq.body = adminData;
      adminModel.createAdmin.mockResolvedValue({
        success: true,
        data: null,
        message: "管理者が正常に作成されました",
      });

      await createAdmin(mockReq, mockRes, mockNext);
      const createResponse = mockRes.json.mock.calls[0][0];

      jest.clearAllMocks();

      // getAdmin
      mockReq.params.adminId = "testadmin";
      adminModel.getAdminById.mockResolvedValue({
        success: true,
        data: { adminId: "testadmin" },
        message: "管理者が正常に取得されました",
      });

      await getAdmin(mockReq, mockRes, mockNext);
      const getResponse = mockRes.json.mock.calls[0][0];

      jest.clearAllMocks();

      // updateAdmin
      mockReq.params.adminId = "testadmin";
      mockReq.body = { id: "newadmin", password: "newpass123" };
      adminModel.updateAdmin.mockResolvedValue({
        success: true,
        data: null,
        message: "管理者が正常に更新されました",
      });

      await updateAdmin(mockReq, mockRes, mockNext);
      const updateResponse = mockRes.json.mock.calls[0][0];

      jest.clearAllMocks();

      // deleteAdmin
      mockReq.params.adminId = "testadmin";
      adminModel.deleteAdmin.mockResolvedValue({
        success: true,
        data: null,
        message: "管理者が正常に削除されました",
      });

      await deleteAdmin(mockReq, mockRes, mockNext);
      const deleteResponse = mockRes.json.mock.calls[0][0];

      // すべてのレスポンスが同じ構造を持つ
      expect(createResponse).toHaveProperty("success");
      expect(createResponse).toHaveProperty("message");
      expect(createResponse).toHaveProperty("data");

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
      // createAdmin - 201
      const adminData = { id: "testadmin", password: "testpass123" };
      mockReq.body = adminData;
      adminModel.createAdmin.mockResolvedValue({
        success: true,
        data: null,
        message: "管理者が正常に作成されました",
      });

      await createAdmin(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(201);

      jest.clearAllMocks();

      // getAdmin - 200
      mockReq.params.adminId = "testadmin";
      adminModel.getAdminById.mockResolvedValue({
        success: true,
        data: { adminId: "testadmin" },
        message: "管理者が正常に取得されました",
      });

      await getAdmin(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(200);

      jest.clearAllMocks();

      // updateAdmin - 200
      mockReq.params.adminId = "testadmin";
      mockReq.body = { id: "newadmin", password: "newpass123" };
      adminModel.updateAdmin.mockResolvedValue({
        success: true,
        data: null,
        message: "管理者が正常に更新されました",
      });

      await updateAdmin(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(200);

      jest.clearAllMocks();

      // deleteAdmin - 200
      mockReq.params.adminId = "testadmin";
      adminModel.deleteAdmin.mockResolvedValue({
        success: true,
        data: null,
        message: "管理者が正常に削除されました",
      });

      await deleteAdmin(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe("統合テスト", () => {
    test("管理者操作の全フローが正しく動作する", async () => {
      // 1. 作成成功
      const adminData = {
        id: "testadmin",
        password: "testpass123",
      };

      mockReq.body = adminData;
      adminModel.createAdmin.mockResolvedValue({
        success: true,
        data: null,
        message: "管理者が正常に作成されました",
      });

      await createAdmin(mockReq, mockRes, mockNext);

      const createResponse = mockRes.json.mock.calls[0][0];
      expect(createResponse.success).toBe(true);
      expect(createResponse.message).toBe("管理者が正常に作成されました");
      expect(mockRes.status).toHaveBeenCalledWith(201);

      // 2. 情報取得
      jest.clearAllMocks();
      mockReq.params.adminId = "testadmin";
      adminModel.getAdminById.mockResolvedValue({
        success: true,
        data: { adminId: "testadmin" },
        message: "管理者が正常に取得されました",
      });

      await getAdmin(mockReq, mockRes, mockNext);

      const getResponse = mockRes.json.mock.calls[0][0];
      expect(getResponse.success).toBe(true);
      expect(getResponse.message).toBe("管理者が正常に取得されました");
      expect(mockRes.status).toHaveBeenCalledWith(200);

      // 3. 情報更新
      jest.clearAllMocks();
      mockReq.params.adminId = "testadmin";
      mockReq.body = { id: "newadmin", password: "newpass123" };
      adminModel.updateAdmin.mockResolvedValue({
        success: true,
        data: null,
        message: "管理者が正常に更新されました",
      });

      await updateAdmin(mockReq, mockRes, mockNext);

      const updateResponse = mockRes.json.mock.calls[0][0];
      expect(updateResponse.success).toBe(true);
      expect(updateResponse.message).toBe("管理者が正常に更新されました");
      expect(mockRes.status).toHaveBeenCalledWith(200);

      // 4. 削除
      jest.clearAllMocks();
      mockReq.params.adminId = "testadmin";
      adminModel.deleteAdmin.mockResolvedValue({
        success: true,
        data: null,
        message: "管理者が正常に削除されました",
      });

      await deleteAdmin(mockReq, mockRes, mockNext);

      const deleteResponse = mockRes.json.mock.calls[0][0];
      expect(deleteResponse.success).toBe(true);
      expect(deleteResponse.message).toBe("管理者が正常に削除されました");
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });
});
