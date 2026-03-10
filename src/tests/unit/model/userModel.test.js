/**
 * Userモデルの単体テスト
 */

const {
  createUser,
  getUserByID,
  getUserByName,
  updateUser,
  deleteUser,
  setUserModelInstance,
} = require("../../../model/userModel");

// モックの設定
jest.mock("../../../db/models/user", () => {
  return jest.fn().mockImplementation(() => ({
    create: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }));
});

jest.mock("../../../services/crypto", () => ({
  hash: jest.fn(),
}));

const UserModel = require("../../../db/models/user");
const crypto = require("../../../services/crypto");

// グローバルモックインスタンス
const mockUserModel = new UserModel();
const mockCrypto = crypto;

describe("User Model Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // モックの実装を明示的に設定
    mockUserModel.create = jest.fn().mockResolvedValue({
      success: true,
      data: { userId: "testuser" },
    });
    mockUserModel.findOne = jest.fn().mockResolvedValue({
      success: true,
      data: { userId: "testuser", userName: "Test User" },
    });
    mockUserModel.findAll = jest
      .fn()
      .mockResolvedValue({ success: true, data: [] });
    mockUserModel.update = jest
      .fn()
      .mockResolvedValue({ success: true, data: null });
    mockUserModel.delete = jest
      .fn()
      .mockResolvedValue({ success: true, data: null });
    mockCrypto.hash = jest.fn().mockReturnValue("hashedpassword");

    // 依存性注入
    setUserModelInstance(mockUserModel);
  });

  describe("createUser", () => {
    test("有効なユーザー情報でユーザー作成が成功する", async () => {
      const userId = "testuser123";
      const password = "testpass123";

      // モックの設定
      mockCrypto.hash.mockReturnValue("hashedpassword");
      mockUserModel.create.mockResolvedValue({
        success: true,
        data: { userId: "testuser" },
      });

      const result = await createUser(userId, password);

      expect(result.success).toBe(true);
      expect(result.message).toBe("ユーザーが正常に作成されました");
      expect(result.data).toBeNull();

      expect(mockCrypto.hash).toHaveBeenCalledWith(password);
      expect(mockUserModel.create).toHaveBeenCalledWith(
        userId,
        "hashedpassword",
      );
    });

    test("空のuserIdでエラーが発生する", async () => {
      const userId = "";
      const password = "testpass123";

      await expect(createUser(userId, password)).rejects.toThrow(
        "Cannot empty userId and password.",
      );

      expect(mockCrypto.hash).not.toHaveBeenCalled();
      expect(mockUserModel.create).not.toHaveBeenCalled();
    });

    test("nullのuserIdでエラーが発生する", async () => {
      const userId = null;
      const password = "testpass123";

      await expect(createUser(userId, password)).rejects.toThrow(
        "Cannot empty userId and password.",
      );

      expect(mockCrypto.hash).not.toHaveBeenCalled();
      expect(mockUserModel.create).not.toHaveBeenCalled();
    });

    test("空のpasswordでエラーが発生する", async () => {
      const userId = "testuser123";
      const password = "";

      await expect(createUser(userId, password)).rejects.toThrow(
        "Cannot empty userId and password.",
      );

      expect(mockCrypto.hash).not.toHaveBeenCalled();
      expect(mockUserModel.create).not.toHaveBeenCalled();
    });

    test("nullのpasswordでエラーが発生する", async () => {
      const userId = "testuser123";
      const password = null;

      await expect(createUser(userId, password)).rejects.toThrow(
        "Cannot empty userId and password.",
      );

      expect(mockCrypto.hash).not.toHaveBeenCalled();
      expect(mockUserModel.create).not.toHaveBeenCalled();
    });

    test("データベースエラーを適切に処理する", async () => {
      const userId = "testuser123";
      const password = "testpass123";

      // モックの設定
      mockCrypto.hash.mockReturnValue("hashedpassword");
      mockUserModel.create.mockRejectedValue(new Error("Database error"));

      await expect(createUser(userId, password)).rejects.toThrow(
        "Database error",
      );

      expect(mockCrypto.hash).toHaveBeenCalledWith(password);
      expect(mockUserModel.create).toHaveBeenCalledWith(
        userId,
        "hashedpassword",
      );
    });
  });

  describe("getUserByID", () => {
    test("存在するユーザーIDでユーザー情報を取得できる", async () => {
      const userId = "testuser123";
      const mockUser = { userId: "testuser123", userName: "Test User" };

      // モックの設定
      mockUserModel.findOne.mockResolvedValue({
        success: true,
        data: mockUser,
      });

      const result = await getUserByID(userId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUser);
      expect(result.message).toBe("ユーザーが正常に取得されました");

      expect(mockUserModel.findOne).toHaveBeenCalledWith(userId);
    });

    test("存在しないユーザーIDで失敗する", async () => {
      const userId = "nonexistent";

      // モックの設定
      mockUserModel.findOne.mockResolvedValue(null);

      const result = await getUserByID(userId);

      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.message).toBe("ユーザーが見つかりません");

      expect(mockUserModel.findOne).toHaveBeenCalledWith(userId);
    });

    test("空のuserIdでエラーが発生する", async () => {
      const userId = "";

      await expect(getUserByID(userId)).rejects.toThrow("Cannot empty userId.");

      expect(mockUserModel.findOne).not.toHaveBeenCalled();
    });

    test("nullのuserIdでエラーが発生する", async () => {
      const userId = null;

      await expect(getUserByID(userId)).rejects.toThrow("Cannot empty userId.");

      expect(mockUserModel.findOne).not.toHaveBeenCalled();
    });

    test("データベースエラーを適切に処理する", async () => {
      const userId = "testuser123";

      // モックの設定
      mockUserModel.findOne.mockRejectedValue(new Error("Database error"));

      await expect(getUserByID(userId)).rejects.toThrow("Database error");

      expect(mockUserModel.findOne).toHaveBeenCalledWith(userId);
    });

    test("userIdフィールドがないユーザーを適切に処理する", async () => {
      const userId = "testuser123";
      const mockUser = { password: "hashedpass" }; // userIdフィールドなし

      // モックの設定
      mockUserModel.findOne.mockResolvedValue({
        success: true,
        data: mockUser,
      });

      const result = await getUserByID(userId);

      expect(result.success).toBe(true); // userModel.jsはuserIdフィールドをチェックしない
      expect(result.data).toEqual(mockUser);
      expect(result.message).toBe("ユーザーが正常に取得されました");
    });
  });

  describe("getUserByName", () => {
    test("存在するユーザー名でユーザー情報を取得できる", async () => {
      const userId = "testuser123";
      const mockUser = { userId: "testuser123", password: "hashedpass" };

      // モックの設定
      mockUserModel.findAll.mockResolvedValue({
        success: true,
        data: [mockUser],
      });

      const result = await getUserByName(userId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUser);
      expect(result.message).toBe("ユーザーが正常に取得されました");

      expect(mockUserModel.findAll).toHaveBeenCalled();
    });

    test("存在しないユーザー名で失敗する", async () => {
      const userId = "nonexistent";

      // モックの設定
      mockUserModel.findAll.mockResolvedValue({
        success: true,
        data: [],
      });

      const result = await getUserByName(userId);

      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.message).toBe("ユーザーが見つかりません");

      expect(mockUserModel.findAll).toHaveBeenCalled();
    });

    test("空のuserIdでエラーが発生する", async () => {
      const userId = "";

      await expect(getUserByName(userId)).rejects.toThrow(
        "Cannot empty userName.",
      );

      expect(mockUserModel.findOne).not.toHaveBeenCalled();
    });

    test("nullのuserIdでエラーが発生する", async () => {
      const userId = null;

      await expect(getUserByName(userId)).rejects.toThrow(
        "Cannot empty userName.",
      );

      expect(mockUserModel.findOne).not.toHaveBeenCalled();
    });

    test("データベースエラーを適切に処理する", async () => {
      const userId = "testuser123";

      // モックの設定
      mockUserModel.findAll.mockRejectedValue(new Error("Database error"));

      await expect(getUserByName(userId)).rejects.toThrow("Database error");

      expect(mockUserModel.findAll).toHaveBeenCalled();
    });
  });

  describe("updateUser", () => {
    test("有効なユーザー情報で更新が成功する", async () => {
      const userId = "testuser123";
      const password = "newpass123";

      // モックの設定
      crypto.hash.mockReturnValue("newhashedpass");
      mockUserModel.update.mockResolvedValue({
        success: true,
        data: null,
      });

      const result = await updateUser(userId, password);

      expect(result.success).toBe(true);
      expect(result.message).toBe("ユーザーが正常に更新されました");
      expect(result.data).toBeNull();

      expect(crypto.hash).toHaveBeenCalledWith(password);
      expect(mockUserModel.update).toHaveBeenCalledWith(userId, {
        password: "newhashedpass",
      });
    });

    test("空のuserIdでエラーが発生する", async () => {
      const userId = "";
      const password = "newpass123";

      await expect(updateUser(userId, password)).rejects.toThrow(
        "Cannot empty userId and password.",
      );

      expect(crypto.hash).not.toHaveBeenCalled();
      expect(mockUserModel.update).not.toHaveBeenCalled();
    });

    test("nullのuserIdでエラーが発生する", async () => {
      const userId = null;
      const password = "newpass123";

      await expect(updateUser(userId, password)).rejects.toThrow(
        "Cannot empty userId and password.",
      );

      expect(crypto.hash).not.toHaveBeenCalled();
      expect(mockUserModel.update).not.toHaveBeenCalled();
    });

    test("空のpasswordでエラーが発生する", async () => {
      const userId = "testuser123";
      const password = "";

      await expect(updateUser(userId, password)).rejects.toThrow(
        "Cannot empty userId and password.",
      );

      expect(crypto.hash).not.toHaveBeenCalled();
      expect(mockUserModel.update).not.toHaveBeenCalled();
    });

    test("nullのpasswordでエラーが発生する", async () => {
      const userId = "testuser123";
      const password = null;

      await expect(updateUser(userId, password)).rejects.toThrow(
        "Cannot empty userId and password.",
      );

      expect(crypto.hash).not.toHaveBeenCalled();
      expect(mockUserModel.update).not.toHaveBeenCalled();
    });

    test("データベースエラーを適切に処理する", async () => {
      const userId = "testuser123";
      const password = "newpass123";

      // モックの設定
      crypto.hash.mockReturnValue("newhashedpass");
      mockUserModel.update.mockRejectedValue(new Error("Database error"));

      await expect(updateUser(userId, password)).rejects.toThrow(
        "Database error",
      );

      expect(crypto.hash).toHaveBeenCalledWith(password);
      expect(mockUserModel.update).toHaveBeenCalledWith(userId, {
        password: "newhashedpass",
      });
    });
  });

  describe("deleteUser", () => {
    test("有効なユーザーIDで削除が成功する", async () => {
      const userId = "testuser123";

      // モックの設定
      mockUserModel.delete.mockResolvedValue({
        success: true,
        data: null,
      });

      const result = await deleteUser(userId);

      expect(result.success).toBe(true);
      expect(result.message).toBe("ユーザーが正常に削除されました");
      expect(result.data).toBeNull();

      expect(mockUserModel.delete).toHaveBeenCalledWith(userId);
    });

    test("空のuser_idでエラーが発生する", async () => {
      const userId = "";

      await expect(deleteUser(userId)).rejects.toThrow("Cannot empty userId.");

      expect(mockUserModel.delete).not.toHaveBeenCalled();
    });

    test("nullのuser_idでエラーが発生する", async () => {
      const userId = null;

      await expect(deleteUser(userId)).rejects.toThrow("Cannot empty userId.");

      expect(mockUserModel.delete).not.toHaveBeenCalled();
    });

    test("データベースエラーを適切に処理する", async () => {
      const userId = "testuser123";

      // モックの設定
      mockUserModel.delete.mockRejectedValue(new Error("Database error"));

      await expect(deleteUser(userId)).rejects.toThrow("Database error");

      expect(mockUserModel.delete).toHaveBeenCalledWith(userId);
    });
  });

  describe("統合テスト", () => {
    test("ユーザーのライフサイクル全体が正しく動作する", async () => {
      const userId = "lifecycleuser";
      const password = "testpass123";
      const newPassword = "newpass456";

      // 1. ユーザー作成
      crypto.hash.mockReturnValue("hashedpass");
      mockUserModel.create.mockResolvedValue({
        success: true,
        data: { userId },
      });

      const createResult = await createUser(userId, password);
      expect(createResult.success).toBe(true);

      // 2. ユーザー取得
      const mockUser = { userId, password: "hashedpass" };
      mockUserModel.findOne.mockResolvedValue({
        success: true,
        data: mockUser,
      });

      const getResult = await getUserByID(userId);
      expect(getResult.success).toBe(true);
      expect(getResult.data.userId).toBe(userId);

      // 3. ユーザー更新
      crypto.hash.mockReturnValue("newhashedpass");
      mockUserModel.update.mockResolvedValue({
        success: true,
        data: null,
      });

      const updateResult = await updateUser(userId, newPassword);
      expect(updateResult.success).toBe(true);

      // 4. ユーザー削除
      mockUserModel.delete.mockResolvedValue({
        success: true,
        data: null,
      });

      const deleteResult = await deleteUser(userId);
      expect(deleteResult.success).toBe(true);

      // 5. 削除後の取得確認
      mockUserModel.findOne.mockResolvedValue(null);

      const finalGetResult = await getUserByID(userId);
      expect(finalGetResult.success).toBe(false);
      expect(finalGetResult.message).toBe("ユーザーが見つかりません");
    });

    test("パスワードハッシュ化が常に呼び出される", async () => {
      const userId = "testuser";
      const password = "testpass";

      // 作成時
      crypto.hash.mockReturnValue("hashedpass");
      mockUserModel.create.mockResolvedValue({
        success: true,
        data: { userId },
      });
      await createUser(userId, password);
      expect(crypto.hash).toHaveBeenCalledWith(password);

      jest.clearAllMocks();

      // 更新時
      crypto.hash.mockReturnValue("newhashedpass");
      mockUserModel.update.mockResolvedValue({
        success: true,
        data: null,
      });
      await updateUser(userId, password);
      expect(crypto.hash).toHaveBeenCalledWith(password);
    });

    test("エラーメッセージの一貫性を確認", async () => {
      const userId = "testuser";

      // 各種エラーメッセージの確認
      await expect(createUser("", "pass")).rejects.toThrow(
        "Cannot empty userId and password.",
      );
      await expect(createUser(null, "pass")).rejects.toThrow(
        "Cannot empty userId and password.",
      );
      await expect(createUser("user", "")).rejects.toThrow(
        "Cannot empty userId and password.",
      );
      await expect(createUser("user", null)).rejects.toThrow(
        "Cannot empty userId and password.",
      );

      await expect(getUserByID("")).rejects.toThrow("Cannot empty userId.");
      await expect(getUserByID(null)).rejects.toThrow("Cannot empty userId.");

      await expect(getUserByName("")).rejects.toThrow("Cannot empty userName.");
      await expect(getUserByName(null)).rejects.toThrow(
        "Cannot empty userName.",
      );

      await expect(updateUser("", "pass")).rejects.toThrow(
        "Cannot empty userId and password.",
      );
      await expect(updateUser(null, "pass")).rejects.toThrow(
        "Cannot empty userId and password.",
      );
      await expect(updateUser("user", "")).rejects.toThrow(
        "Cannot empty userId and password.",
      );
      await expect(updateUser("user", null)).rejects.toThrow(
        "Cannot empty userId and password.",
      );

      await expect(deleteUser("")).rejects.toThrow("Cannot empty userId.");
      await expect(deleteUser(null)).rejects.toThrow("Cannot empty userId.");
    });
  });
});
