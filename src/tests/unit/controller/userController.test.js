/**
 * Userコントローラーの単体テスト
 */

const {
  createUser,
  getUser,
  updateUser,
  deleteUser,
} = require("../../../controller/userController");

// モックの設定
jest.mock("../../../model/userModel");

const userModel = require("../../../model/userModel");

describe("User Controller Tests", () => {
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

  describe("createUser", () => {
    test("有効なユーザーデータで作成が成功する", async () => {
      const userData = {
        userId: "testuser",
        password: "testpass123",
      };

      mockReq.body = userData;

      // モックの設定
      userModel.createUser.mockResolvedValue({
        success: true,
        data: null,
        message: "ユーザーが正常に作成されました",
      });

      await createUser(mockReq, mockRes, mockNext);

      expect(userModel.createUser).toHaveBeenCalledWith(
        "testuser",
        "testpass123",
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: null,
        message: "ユーザーが正常に作成されました",
      });
    });

    test("userIdがない場合に400エラーを返す", async () => {
      const userData = {
        password: "testpass123",
      };

      mockReq.body = userData;

      await createUser(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "ユーザーIDとパスワードは必須です",
      });
      expect(userModel.createUser).not.toHaveBeenCalled();
    });

    test("passwordがない場合に400エラーを返す", async () => {
      const userData = {
        userId: "testuser",
      };

      mockReq.body = userData;

      await createUser(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "ユーザーIDとパスワードは必須です",
      });
      expect(userModel.createUser).not.toHaveBeenCalled();
    });

    test("両方のフィールドが空の場合に400エラーを返す", async () => {
      const userData = {
        userId: "",
        password: "",
      };

      mockReq.body = userData;

      await createUser(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "ユーザーIDとパスワードは必須です",
      });
      expect(userModel.createUser).not.toHaveBeenCalled();
    });

    test("モデルが失敗を返した場合に400エラーを返す", async () => {
      const userData = {
        userId: "testuser",
        password: "testpass123",
      };

      mockReq.body = userData;

      // モックの設定
      userModel.createUser.mockResolvedValue({
        success: false,
        message: "ユーザー作成に失敗しました",
      });

      await createUser(mockReq, mockRes, mockNext);

      expect(userModel.createUser).toHaveBeenCalledWith(
        "testuser",
        "testpass123",
      );
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "ユーザー作成に失敗しました",
      });
    });

    test("モデルで例外が発生した場合にエラーをthrowする", async () => {
      const userData = {
        userId: "testuser",
        password: "testpass123",
      };

      mockReq.body = userData;

      // モックの設定
      userModel.createUser.mockRejectedValue(new Error("データベースエラー"));

      // コントローラー関数を実行
      await createUser(mockReq, mockRes, mockNext);

      expect(userModel.createUser).toHaveBeenCalledWith(
        "testuser",
        "testpass123",
      );
      expect(mockNext).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe("getUser", () => {
    test("ユーザー情報取得が成功する", async () => {
      const userId = "testuser";
      mockReq.params.userId = userId;

      userModel.getUserByID.mockResolvedValue({
        success: true,
        data: { userId, password: "hashed" },
        message: "ユーザーが正常に取得されました",
      });

      await getUser(mockReq, mockRes, mockNext);

      expect(userModel.getUserByID).toHaveBeenCalledWith(userId);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { userId, password: "hashed" },
        message: "ユーザーが正常に取得されました",
      });
    });

    test("userIdがない場合に400エラーを返す", async () => {
      await getUser(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "ユーザーIDは必須です",
      });
      expect(userModel.getUserByID).not.toHaveBeenCalled();
    });

    test("モデルが失敗を返した場合に404エラーを返す", async () => {
      const userId = "nonexistent";
      mockReq.params.userId = userId;

      userModel.getUserByID.mockResolvedValue({
        success: false,
        message: "ユーザーが見つかりません",
      });

      await getUser(mockReq, mockRes, mockNext);

      expect(userModel.getUserByID).toHaveBeenCalledWith(userId);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "ユーザーが見つかりません",
      });
    });

    test("モデルで例外が発生した場合にエラーをthrowする", async () => {
      const userId = "testuser";
      mockReq.params.userId = userId;

      userModel.getUserByID.mockRejectedValue(new Error("データベースエラー"));

      // コントローラー関数を実行
      await getUser(mockReq, mockRes, mockNext);

      expect(userModel.getUserByID).toHaveBeenCalledWith(userId);
      expect(mockNext).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe("updateUser", () => {
    test("ユーザー情報更新が成功する", async () => {
      const userId = "testuser";
      const updateData = {
        password: "newpass123",
      };

      mockReq.params.userId = userId;
      mockReq.body = updateData;

      userModel.updateUser.mockResolvedValue({
        success: true,
        data: null,
        message: "ユーザーが正常に更新されました",
      });

      await updateUser(mockReq, mockRes, mockNext);

      expect(userModel.updateUser).toHaveBeenCalledWith(userId, "newpass123");
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: null,
        message: "ユーザーが正常に更新されました",
      });
    });

    test("userIdがない場合に400エラーを返す", async () => {
      const updateData = { password: "newpass123" };
      mockReq.body = updateData;

      await updateUser(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "ユーザーIDとパスワードは必須です",
      });
      expect(userModel.updateUser).not.toHaveBeenCalled();
    });

    test("更新データがない場合に400エラーを返す", async () => {
      const userId = "testuser";
      mockReq.params.userId = userId;

      await updateUser(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "ユーザーIDとパスワードは必須です",
      });
      expect(userModel.updateUser).not.toHaveBeenCalled();
    });

    test("モデルが失敗を返した場合に400エラーを返す", async () => {
      const userId = "nonexistent";
      const updateData = { password: "newpass123" };

      mockReq.params.userId = userId;
      mockReq.body = updateData;

      userModel.updateUser.mockResolvedValue({
        success: false,
        message: "ユーザーが見つかりません",
      });

      await updateUser(mockReq, mockRes, mockNext);

      expect(userModel.updateUser).toHaveBeenCalledWith(userId, "newpass123");
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "ユーザーが見つかりません",
      });
    });

    test("モデルで例外が発生した場合にエラーをthrowする", async () => {
      const userId = "testuser";
      const updateData = { password: "newpass123" };

      mockReq.params.userId = userId;
      mockReq.body = updateData;

      userModel.updateUser.mockRejectedValue(new Error("データベースエラー"));

      // コントローラー関数を実行
      await updateUser(mockReq, mockRes, mockNext);

      expect(userModel.updateUser).toHaveBeenCalledWith(userId, "newpass123");
      expect(mockNext).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe("deleteUser", () => {
    test("ユーザー削除が成功する", async () => {
      const userId = "testuser";
      mockReq.params.userId = userId;

      userModel.deleteUser.mockResolvedValue({
        success: true,
        data: null,
        message: "ユーザーが正常に削除されました",
      });

      await deleteUser(mockReq, mockRes, mockNext);

      expect(userModel.deleteUser).toHaveBeenCalledWith(userId);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: null,
        message: "ユーザーが正常に削除されました",
      });
    });

    test("userIdがない場合に400エラーを返す", async () => {
      await deleteUser(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "ユーザーIDは必須です",
      });
      expect(userModel.deleteUser).not.toHaveBeenCalled();
    });

    test("モデルが失敗を返した場合に404エラーを返す", async () => {
      const userId = "nonexistent";
      mockReq.params.userId = userId;

      userModel.deleteUser.mockResolvedValue({
        success: false,
        message: "ユーザーが見つかりません",
      });

      await deleteUser(mockReq, mockRes, mockNext);

      expect(userModel.deleteUser).toHaveBeenCalledWith(userId);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "ユーザーが見つかりません",
      });
    });

    test("モデルで例外が発生した場合にエラーをthrowする", async () => {
      const userId = "testuser";
      mockReq.params.userId = userId;

      userModel.deleteUser.mockRejectedValue(new Error("データベースエラー"));

      // コントローラー関数を実行
      await deleteUser(mockReq, mockRes, mockNext);

      expect(userModel.deleteUser).toHaveBeenCalledWith(userId);
      expect(mockNext).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe("レスポンス形式の一貫性", () => {
    test("成功時のレスポンス形式が統一されている", async () => {
      // createUser
      const userData = { userId: "testuser", password: "testpass123" };
      mockReq.body = userData;
      userModel.createUser.mockResolvedValue({
        success: true,
        data: null,
        message: "ユーザーが正常に作成されました",
      });

      await createUser(mockReq, mockRes, mockNext);
      const createResponse = mockRes.json.mock.calls[0][0];

      jest.clearAllMocks();

      // getUser
      mockReq.params.userId = "testuser";
      userModel.getUserByID.mockResolvedValue({
        success: true,
        data: { userId: "testuser" },
        message: "ユーザーが正常に取得されました",
      });

      await getUser(mockReq, mockRes, mockNext);
      const getResponse = mockRes.json.mock.calls[0][0];

      jest.clearAllMocks();

      // updateUser
      mockReq.params.userId = "testuser";
      mockReq.body = { password: "newpass123" };
      userModel.updateUser.mockResolvedValue({
        success: true,
        data: null,
        message: "ユーザーが正常に更新されました",
      });

      await updateUser(mockReq, mockRes, mockNext);
      const updateResponse = mockRes.json.mock.calls[0][0];

      jest.clearAllMocks();

      // deleteUser
      mockReq.params.userId = "testuser";
      userModel.deleteUser.mockResolvedValue({
        success: true,
        data: null,
        message: "ユーザーが正常に削除されました",
      });

      await deleteUser(mockReq, mockRes, mockNext);
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
      // createUser - 201
      const userData = { userId: "testuser", password: "testpass123" };
      mockReq.body = userData;
      userModel.createUser.mockResolvedValue({
        success: true,
        data: null,
        message: "ユーザーが正常に作成されました",
      });

      await createUser(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(201);

      jest.clearAllMocks();

      // getUser - 200
      mockReq.params.userId = "testuser";
      userModel.getUserByID.mockResolvedValue({
        success: true,
        data: { userId: "testuser" },
        message: "ユーザーが正常に取得されました",
      });

      await getUser(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(200);

      jest.clearAllMocks();

      // updateUser - 200
      mockReq.params.userId = "testuser";
      mockReq.body = { password: "newpass123" };
      userModel.updateUser.mockResolvedValue({
        success: true,
        data: null,
        message: "ユーザーが正常に更新されました",
      });

      await updateUser(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(200);

      jest.clearAllMocks();

      // deleteUser - 200
      mockReq.params.userId = "testuser";
      userModel.deleteUser.mockResolvedValue({
        success: true,
        data: null,
        message: "ユーザーが正常に削除されました",
      });

      await deleteUser(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe("統合テスト", () => {
    test("ユーザー操作の全フローが正しく動作する", async () => {
      // 1. 作成成功
      const userData = {
        userId: "testuser",
        password: "testpass123",
      };

      mockReq.body = userData;
      userModel.createUser.mockResolvedValue({
        success: true,
        data: null,
        message: "ユーザーが正常に作成されました",
      });

      await createUser(mockReq, mockRes, mockNext);

      const createResponse = mockRes.json.mock.calls[0][0];
      expect(createResponse.success).toBe(true);
      expect(createResponse.message).toBe("ユーザーが正常に作成されました");
      expect(mockRes.status).toHaveBeenCalledWith(201);

      // 2. 情報取得
      jest.clearAllMocks();
      mockReq.params.userId = "testuser";
      userModel.getUserByID.mockResolvedValue({
        success: true,
        data: { userId: "testuser" },
        message: "ユーザーが正常に取得されました",
      });

      await getUser(mockReq, mockRes, mockNext);

      const getResponse = mockRes.json.mock.calls[0][0];
      expect(getResponse.success).toBe(true);
      expect(getResponse.message).toBe("ユーザーが正常に取得されました");
      expect(mockRes.status).toHaveBeenCalledWith(200);

      // 3. 情報更新
      jest.clearAllMocks();
      mockReq.params.userId = "testuser";
      mockReq.body = { password: "newpass123" };
      userModel.updateUser.mockResolvedValue({
        success: true,
        data: null,
        message: "ユーザーが正常に更新されました",
      });

      await updateUser(mockReq, mockRes, mockNext);

      const updateResponse = mockRes.json.mock.calls[0][0];
      expect(updateResponse.success).toBe(true);
      expect(updateResponse.message).toBe("ユーザーが正常に更新されました");
      expect(mockRes.status).toHaveBeenCalledWith(200);

      // 4. 削除
      jest.clearAllMocks();
      mockReq.params.userId = "testuser";
      userModel.deleteUser.mockResolvedValue({
        success: true,
        data: null,
        message: "ユーザーが正常に削除されました",
      });

      await deleteUser(mockReq, mockRes, mockNext);

      const deleteResponse = mockRes.json.mock.calls[0][0];
      expect(deleteResponse.success).toBe(true);
      expect(deleteResponse.message).toBe("ユーザーが正常に削除されました");
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });
});
