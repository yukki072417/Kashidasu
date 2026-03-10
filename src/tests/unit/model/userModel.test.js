/**
 * Userモデルの単体テスト
 */

const { createUser, getUserByID, getUserByName, updateUser, deleteUser } = require("../../../model/userModel");

// モックの設定
jest.mock("../../../db/models/user");
jest.mock("../../../services/crypto");

const UserModel = require("../../../db/models/user");
const crypto = require("../../../services/crypto");

const mockUserModel = new UserModel();

describe("User Model Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createUser", () => {
    test("有効なユーザー情報でユーザー作成が成功する", async () => {
      const userId = "testuser123";
      const password = "testpass123";
      
      // モックの設定
      crypto.hash.mockReturnValue("hashedpassword");
      mockUserModel.create.mockResolvedValue();
      
      const result = await createUser(userId, password);
      
      expect(result.success).toBe(true);
      expect(result.message).toBe("ユーザーが正常に作成されました");
      expect(result.data).toBeNull();
      
      expect(crypto.hash).toHaveBeenCalledWith(password);
      expect(mockUserModel.create).toHaveBeenCalledWith(userId, "hashedpassword");
    });

    test("空のuserIdでエラーが発生する", async () => {
      const userId = "";
      const password = "testpass123";
      
      await expect(createUser(userId, password)).rejects.toThrow("Cannot empty userId and password.");
      
      expect(crypto.hash).not.toHaveBeenCalled();
      expect(mockUserModel.create).not.toHaveBeenCalled();
    });

    test("nullのuserIdでエラーが発生する", async () => {
      const userId = null;
      const password = "testpass123";
      
      await expect(createUser(userId, password)).rejects.toThrow("Cannot empty userId and password.");
      
      expect(crypto.hash).not.toHaveBeenCalled();
      expect(mockUserModel.create).not.toHaveBeenCalled();
    });

    test("空のpasswordでエラーが発生する", async () => {
      const userId = "testuser123";
      const password = "";
      
      await expect(createUser(userId, password)).rejects.toThrow("Cannot empty userId and password.");
      
      expect(crypto.hash).not.toHaveBeenCalled();
      expect(mockUserModel.create).not.toHaveBeenCalled();
    });

    test("nullのpasswordでエラーが発生する", async () => {
      const userId = "testuser123";
      const password = null;
      
      await expect(createUser(userId, password)).rejects.toThrow("Cannot empty userId and password.");
      
      expect(crypto.hash).not.toHaveBeenCalled();
      expect(mockUserModel.create).not.toHaveBeenCalled();
    });

    test("データベースエラーを適切に処理する", async () => {
      const userId = "testuser123";
      const password = "testpass123";
      
      // モックの設定
      crypto.hash.mockReturnValue("hashedpassword");
      mockUserModel.create.mockRejectedValue(new Error("Database error"));
      
      await expect(createUser(userId, password)).rejects.toThrow("Database error");
      
      expect(crypto.hash).toHaveBeenCalledWith(password);
      expect(mockUserModel.create).toHaveBeenCalledWith(userId, "hashedpassword");
    });
  });

  describe("getUserByID", () => {
    test("存在するユーザーIDでユーザー情報を取得できる", async () => {
      const userId = "testuser123";
      const mockUser = { userId: "testuser123", password: "hashedpass" };
      
      // モックの設定
      mockUserModel.findOne.mockResolvedValue(mockUser);
      
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
      expect(result.data).toBeNull();
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
      mockUserModel.findOne.mockResolvedValue(mockUser);
      
      const result = await getUserByID(userId);
      
      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.message).toBe("ユーザーが見つかりません");
    });
  });

  describe("getUserByName", () => {
    test("存在するユーザー名でユーザー情報を取得できる", async () => {
      const userId = "testuser123";
      const mockUser = { userId: "testuser123", password: "hashedpass" };
      
      // モックの設定
      mockUserModel.findOne.mockResolvedValue(mockUser);
      
      const result = await getUserByName(userId);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUser);
      expect(result.message).toBe("ユーザーが正常に取得されました");
      
      expect(mockUserModel.findOne).toHaveBeenCalledWith(userId);
    });

    test("存在しないユーザー名で失敗する", async () => {
      const userId = "nonexistent";
      
      // モックの設定
      mockUserModel.findOne.mockResolvedValue(null);
      
      const result = await getUserByName(userId);
      
      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.message).toBe("ユーザーが見つかりません");
      
      expect(mockUserModel.findOne).toHaveBeenCalledWith(userId);
    });

    test("空のuserIdでエラーが発生する", async () => {
      const userId = "";
      
      await expect(getUserByName(userId)).rejects.toThrow("Cannot empty user_id.");
      
      expect(mockUserModel.findOne).not.toHaveBeenCalled();
    });

    test("nullのuserIdでエラーが発生する", async () => {
      const userId = null;
      
      await expect(getUserByName(userId)).rejects.toThrow("Cannot empty user_id.");
      
      expect(mockUserModel.findOne).not.toHaveBeenCalled();
    });

    test("データベースエラーを適切に処理する", async () => {
      const userId = "testuser123";
      
      // モックの設定
      mockUserModel.findOne.mockRejectedValue(new Error("Database error"));
      
      await expect(getUserByName(userId)).rejects.toThrow("Database error");
      
      expect(mockUserModel.findOne).toHaveBeenCalledWith(userId);
    });
  });

  describe("updateUser", () => {
    test("有効なユーザー情報で更新が成功する", async () => {
      const userId = "testuser123";
      const password = "newpass123";
      
      // モックの設定
      crypto.hash.mockReturnValue("newhashedpass");
      mockUserModel.update.mockResolvedValue();
      
      const result = await updateUser(userId, password);
      
      expect(result.success).toBe(true);
      expect(result.message).toBe("ユーザーが正常に更新されました");
      expect(result.data).toBeNull();
      
      expect(crypto.hash).toHaveBeenCalledWith(password);
      expect(mockUserModel.update).toHaveBeenCalledWith(userId, { password: "newhashedpass" });
    });

    test("空のuserIdでエラーが発生する", async () => {
      const userId = "";
      const password = "newpass123";
      
      await expect(updateUser(userId, password)).rejects.toThrow("Cannot empty userId and password.");
      
      expect(crypto.hash).not.toHaveBeenCalled();
      expect(mockUserModel.update).not.toHaveBeenCalled();
    });

    test("nullのuserIdでエラーが発生する", async () => {
      const userId = null;
      const password = "newpass123";
      
      await expect(updateUser(userId, password)).rejects.toThrow("Cannot empty userId and password.");
      
      expect(crypto.hash).not.toHaveBeenCalled();
      expect(mockUserModel.update).not.toHaveBeenCalled();
    });

    test("空のpasswordでエラーが発生する", async () => {
      const userId = "testuser123";
      const password = "";
      
      await expect(updateUser(userId, password)).rejects.toThrow("Cannot empty userId and password.");
      
      expect(crypto.hash).not.toHaveBeenCalled();
      expect(mockUserModel.update).not.toHaveBeenCalled();
    });

    test("nullのpasswordでエラーが発生する", async () => {
      const userId = "testuser123";
      const password = null;
      
      await expect(updateUser(userId, password)).rejects.toThrow("Cannot empty userId and password.");
      
      expect(crypto.hash).not.toHaveBeenCalled();
      expect(mockUserModel.update).not.toHaveBeenCalled();
    });

    test("データベースエラーを適切に処理する", async () => {
      const userId = "testuser123";
      const password = "newpass123";
      
      // モックの設定
      crypto.hash.mockReturnValue("newhashedpass");
      mockUserModel.update.mockRejectedValue(new Error("Database error"));
      
      await expect(updateUser(userId, password)).rejects.toThrow("Database error");
      
      expect(crypto.hash).toHaveBeenCalledWith(password);
      expect(mockUserModel.update).toHaveBeenCalledWith(userId, { password: "newhashedpass" });
    });
  });

  describe("deleteUser", () => {
    test("有効なユーザーIDで削除が成功する", async () => {
      const userId = "testuser123";
      
      // モックの設定
      mockUserModel.delete.mockResolvedValue();
      
      const result = await deleteUser(userId);
      
      expect(result.success).toBe(true);
      expect(result.message).toBe("ユーザーが正常に削除されました");
      expect(result.data).toBeNull();
      
      expect(mockUserModel.delete).toHaveBeenCalledWith(userId);
    });

    test("空のuser_idでエラーが発生する", async () => {
      const userId = "";
      
      await expect(deleteUser(userId)).rejects.toThrow("Cannot empty user_id.");
      
      expect(mockUserModel.delete).not.toHaveBeenCalled();
    });

    test("nullのuser_idでエラーが発生する", async () => {
      const userId = null;
      
      await expect(deleteUser(userId)).rejects.toThrow("Cannot empty user_id.");
      
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
      mockUserModel.create.mockResolvedValue();
      
      const createResult = await createUser(userId, password);
      expect(createResult.success).toBe(true);
      
      // 2. ユーザー取得
      const mockUser = { userId, password: "hashedpass" };
      mockUserModel.findOne.mockResolvedValue(mockUser);
      
      const getResult = await getUserByID(userId);
      expect(getResult.success).toBe(true);
      expect(getResult.data.userId).toBe(userId);
      
      // 3. ユーザー更新
      crypto.hash.mockReturnValue("newhashedpass");
      mockUserModel.update.mockResolvedValue();
      
      const updateResult = await updateUser(userId, newPassword);
      expect(updateResult.success).toBe(true);
      
      // 4. ユーザー削除
      mockUserModel.delete.mockResolvedValue();
      
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
      mockUserModel.create.mockResolvedValue();
      await createUser(userId, password);
      expect(crypto.hash).toHaveBeenCalledWith(password);
      
      jest.clearAllMocks();
      
      // 更新時
      crypto.hash.mockReturnValue("newhashedpass");
      mockUserModel.update.mockResolvedValue();
      await updateUser(userId, password);
      expect(crypto.hash).toHaveBeenCalledWith(password);
    });

    test("エラーメッセージの一貫性を確認", async () => {
      const userId = "testuser";
      
      // 各種エラーメッセージの確認
      expect(async () => await createUser("", "pass")).rejects.toThrow("Cannot empty userId and password.");
      expect(async () => await createUser(null, "pass")).rejects.toThrow("Cannot empty userId and password.");
      expect(async () => await createUser("user", "")).rejects.toThrow("Cannot empty userId and password.");
      expect(async () => await createUser("user", null)).rejects.toThrow("Cannot empty userId and password.");
      
      expect(async () => await getUserByID("")).rejects.toThrow("Cannot empty userId.");
      expect(async () => await getUserByID(null)).rejects.toThrow("Cannot empty userId.");
      
      expect(async () => await getUserByName("")).rejects.toThrow("Cannot empty user_id.");
      expect(async () => await getUserByName(null)).rejects.toThrow("Cannot empty user_id.");
      
      expect(async () => await updateUser("", "pass")).rejects.toThrow("Cannot empty userId and password.");
      expect(async () => await updateUser(null, "pass")).rejects.toThrow("Cannot empty userId and password.");
      expect(async () => await updateUser("user", "")).rejects.toThrow("Cannot empty userId and password.");
      expect(async () => await updateUser("user", null)).rejects.toThrow("Cannot empty userId and password.");
      
      expect(async () => await deleteUser("")).rejects.toThrow("Cannot empty user_id.");
      expect(async () => await deleteUser(null)).rejects.toThrow("Cannot empty user_id.");
    });
  });
});
