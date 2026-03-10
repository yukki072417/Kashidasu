/**
 * Adminモデルの単体テスト
 */

const {
  createAdmin,
  getAdminById,
  authenticateAdmin,
  updateAdmin,
  isAdmin,
  deleteAdmin,
  setAdminModelInstance,
} = require("../../../model/adminModel");

// モックの設定
jest.mock("../../../db/models/admin", () => {
  return jest.fn().mockImplementation(() => ({
    create: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }));
});

jest.mock("../../../services/crypto", () => ({
  hashPassword: jest.fn(),
  hash: jest.fn(),
  isValid: jest.fn(),
}));

const AdminModel = require("../../../db/models/admin");
const crypto = require("../../../services/crypto");

// グローバルモックインスタンス
const mockAdminModel = new AdminModel();

describe("Admin Model Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // モックの実装を明示的に設定
    mockAdminModel.create = jest.fn().mockResolvedValue({
      success: true,
      data: { adminId: "testadmin" },
    });
    mockAdminModel.findOne = jest.fn().mockResolvedValue({
      success: true,
      data: { adminId: "testadmin", password: "hashed" },
    });
    mockAdminModel.findAll = jest
      .fn()
      .mockResolvedValue({ success: true, data: [] });
    mockAdminModel.update = jest
      .fn()
      .mockResolvedValue({ success: true, data: null });
    mockAdminModel.delete = jest
      .fn()
      .mockResolvedValue({ success: true, data: null });
    crypto.hashPassword = jest.fn().mockResolvedValue("hashedpassword");
    crypto.hash = jest.fn().mockReturnValue("hashedpassword");
    crypto.isValid = jest.fn().mockReturnValue(true);

    // 依存性注入
    setAdminModelInstance(mockAdminModel);
  });

  describe("createAdmin", () => {
    test("有効な管理者情報で管理者作成が成功する", async () => {
      const adminId = "testadmin";
      const password = "testpass123";

      // モックの設定
      crypto.hash.mockReturnValue("hashedpassword");
      mockAdminModel.create.mockResolvedValue({
        success: true,
        data: { adminId: "testadmin" },
      });

      const result = await createAdmin(adminId, password);

      expect(result.success).toBe(true);
      expect(result.message).toBe("管理者が正常に作成されました");
      expect(result.data).toBeNull();

      expect(crypto.hash).toHaveBeenCalledWith(password);
      expect(mockAdminModel.create).toHaveBeenCalledWith(
        adminId,
        "hashedpassword",
      );
    });

    test("空のadminIdでエラーが発生する", async () => {
      const adminId = "";
      const password = "testpass123";

      await expect(createAdmin(adminId, password)).rejects.toThrow(
        "Cannot empty adminId and password.",
      );

      expect(crypto.hash).not.toHaveBeenCalled();
    });

    test("nullのadminIdでエラーが発生する", async () => {
      const adminId = null;
      const password = "testpass123";

      await expect(createAdmin(adminId, password)).rejects.toThrow(
        "Cannot empty adminId and password.",
      );

      expect(crypto.hash).not.toHaveBeenCalled();
    });

    test("空のpasswordでエラーが発生する", async () => {
      const adminId = "testadmin";
      const password = "";

      await expect(createAdmin(adminId, password)).rejects.toThrow(
        "Cannot empty adminId and password.",
      );

      expect(crypto.hash).not.toHaveBeenCalled();
    });

    test("nullのpasswordでエラーが発生する", async () => {
      const adminId = "testadmin";
      const password = null;

      await expect(createAdmin(adminId, password)).rejects.toThrow(
        "Cannot empty adminId and password.",
      );

      expect(crypto.hash).not.toHaveBeenCalled();
    });

    test("データベースエラーを適切に処理する", async () => {
      const adminId = "testadmin";
      const password = "testpass123";

      // モックの設定
      crypto.hash.mockReturnValue("hashedpassword");
      mockAdminModel.create.mockRejectedValue(new Error("Database error"));

      await expect(createAdmin(adminId, password)).rejects.toThrow(
        "Database error",
      );

      expect(crypto.hash).toHaveBeenCalledWith(password);
      expect(mockAdminModel.create).toHaveBeenCalledWith(
        adminId,
        "hashedpassword",
      );
    });
  });

  describe("getAdminById", () => {
    test("存在する管理者IDで管理者情報を取得できる", async () => {
      const adminId = "testadmin";
      const mockAdmin = { adminId: "testadmin", password: "hashedpass" };

      // モックの設定
      mockAdminModel.findOne.mockResolvedValue({
        success: true,
        data: mockAdmin,
      });

      const result = await getAdminById(adminId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAdmin);
      expect(result.message).toBe("管理者が正常に取得されました");

      expect(mockAdminModel.findOne).toHaveBeenCalledWith(adminId);
    });

    test("存在しない管理者IDで失敗する", async () => {
      const adminId = "nonexistent";

      // モックの設定
      mockAdminModel.findOne.mockResolvedValue(null);

      const result = await getAdminById(adminId);

      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.message).toBe("管理者が見つかりません");

      expect(mockAdminModel.findOne).toHaveBeenCalledWith(adminId);
    });

    test("空のadminIdでエラーが発生する", async () => {
      const adminId = "";

      await expect(getAdminById(adminId)).rejects.toThrow(
        "Cannot empty userId.",
      );

      expect(mockAdminModel.findOne).not.toHaveBeenCalled();
    });

    test("nullのadminIdでエラーが発生する", async () => {
      const adminId = null;

      await expect(getAdminById(adminId)).rejects.toThrow(
        "Cannot empty userId.",
      );

      expect(mockAdminModel.findOne).not.toHaveBeenCalled();
    });

    test("データベースエラーを適切に処理する", async () => {
      const adminId = "testadmin";

      // モックの設定
      mockAdminModel.findOne.mockRejectedValue(new Error("Database error"));

      await expect(getAdminById(adminId)).rejects.toThrow("Database error");

      expect(mockAdminModel.findOne).toHaveBeenCalledWith(adminId);
    });

    test("adminIdフィールドがない管理者を適切に処理する", async () => {
      const adminId = "testadmin";
      const mockAdmin = { password: "hashedpass" }; // adminIdフィールドなし

      // モックの設定
      mockAdminModel.findOne.mockResolvedValue({
        success: true,
        data: mockAdmin,
      });

      const result = await getAdminById(adminId);

      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.message).toBe("管理者が見つかりません");
    });
  });

  describe("authenticateAdmin", () => {
    test("有効な認証情報で認証が成功する", async () => {
      const adminId = "testadmin";
      const password = "testpass123";
      const mockAdmin = { adminId: "testadmin", password: "hashedpass" };

      // モックの設定
      mockAdminModel.findOne.mockResolvedValue({
        success: true,
        data: mockAdmin,
      });
      crypto.isValid.mockReturnValue(true);

      const result = await authenticateAdmin(adminId, password);

      expect(result).toBe(true);
      expect(mockAdminModel.findOne).toHaveBeenCalledWith(adminId);
      expect(crypto.isValid).toHaveBeenCalledWith(password, "hashedpass");
    });

    test("間違ったパスワードで認証が失敗する", async () => {
      const adminId = "testadmin";
      const password = "wrongpass";
      const mockAdmin = { adminId: "testadmin", password: "hashedpass" };

      // モックの設定
      mockAdminModel.findOne.mockResolvedValue({
        success: true,
        data: mockAdmin,
      });
      crypto.isValid.mockReturnValue(false);

      const result = await authenticateAdmin(adminId, password);

      expect(result).toBe(false);
      expect(mockAdminModel.findOne).toHaveBeenCalledWith(adminId);
      expect(crypto.isValid).toHaveBeenCalledWith(password, "hashedpass");
    });

    test("存在しない管理者IDで認証が失敗する", async () => {
      const adminId = "nonexistent";
      const password = "testpass123";

      // モックの設定
      mockAdminModel.findOne.mockResolvedValue(null);
      crypto.isValid.mockReturnValue(false);

      const result = await authenticateAdmin(adminId, password);

      expect(result).toBe(false);
      expect(mockAdminModel.findOne).toHaveBeenCalledWith(adminId);
      expect(crypto.isValid).toHaveBeenCalledWith(
        "dummy_password_for_timing_attack_prevention",
        "dummy_hash",
      );
    });

    test("空のadminIdでエラーが発生する", async () => {
      const adminId = "";
      const password = "testpass123";

      await expect(authenticateAdmin(adminId, password)).rejects.toThrow(
        "Cannot empty adminId and password.",
      );

      expect(mockAdminModel.findOne).not.toHaveBeenCalled();
      expect(crypto.isValid).not.toHaveBeenCalled();
    });

    test("空のpasswordでエラーが発生する", async () => {
      const adminId = "testadmin";
      const password = "";

      await expect(authenticateAdmin(adminId, password)).rejects.toThrow(
        "Cannot empty adminId and password.",
      );

      expect(mockAdminModel.findOne).not.toHaveBeenCalled();
      expect(crypto.isValid).not.toHaveBeenCalled();
    });

    test("データベースエラーを適切に処理する", async () => {
      const adminId = "testadmin";
      const password = "testpass123";

      // モックの設定
      mockAdminModel.findOne.mockRejectedValue(new Error("Database error"));

      await expect(authenticateAdmin(adminId, password)).rejects.toThrow(
        "Database error",
      );

      expect(mockAdminModel.findOne).toHaveBeenCalledWith(adminId);
    });
  });

  describe("updateAdmin", () => {
    test("有効な管理者情報で更新が成功する", async () => {
      const adminId = "testadmin";
      const changedAdminId = "newadmin";
      const changedPassword = "newpass123";

      // モックの設定
      crypto.hash.mockReturnValue("newhashedpass");
      mockAdminModel.update.mockResolvedValue({
        success: true,
        data: null,
      });

      const result = await updateAdmin(
        adminId,
        changedAdminId,
        changedPassword,
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe("管理者が正常に更新されました");
      expect(result.data).toBeNull();

      expect(crypto.hash).toHaveBeenCalledWith(changedPassword);
      expect(mockAdminModel.update).toHaveBeenCalledWith(adminId, {
        adminId: changedAdminId,
        password: "newhashedpass",
      });
    });

    test("空のadminIdでエラーが発生する", async () => {
      const adminId = "";
      const changedAdminId = "newadmin";
      const changedPassword = "newpass123";

      await expect(
        updateAdmin(adminId, changedAdminId, changedPassword),
      ).rejects.toThrow(
        "Cannot empty adminId, changedAdminId, and changedPassword.",
      );

      expect(crypto.hash).not.toHaveBeenCalled();
      expect(mockAdminModel.update).not.toHaveBeenCalled();
    });

    test("nullのchangedAdminIdでエラーが発生する", async () => {
      const adminId = "testadmin";
      const changedAdminId = null;
      const changedPassword = "newpass123";

      await expect(
        updateAdmin(adminId, changedAdminId, changedPassword),
      ).rejects.toThrow(
        "Cannot empty adminId, changedAdminId, and changedPassword.",
      );

      expect(crypto.hash).not.toHaveBeenCalled();
      expect(mockAdminModel.update).not.toHaveBeenCalled();
    });

    test("空のchangedPasswordでエラーが発生する", async () => {
      const adminId = "testadmin";
      const changedAdminId = "newadmin";
      const changedPassword = "";

      await expect(
        updateAdmin(adminId, changedAdminId, changedPassword),
      ).rejects.toThrow(
        "Cannot empty adminId, changedAdminId, and changedPassword.",
      );

      expect(crypto.hash).not.toHaveBeenCalled();
      expect(mockAdminModel.update).not.toHaveBeenCalled();
    });

    test("データベースエラーを適切に処理する", async () => {
      const adminId = "testadmin";
      const changedAdminId = "newadmin";
      const changedPassword = "newpass123";

      // モックの設定
      crypto.hash.mockReturnValue("newhashedpass");
      mockAdminModel.update.mockRejectedValue(new Error("Database error"));

      await expect(
        updateAdmin(adminId, changedAdminId, changedPassword),
      ).rejects.toThrow("Database error");

      expect(crypto.hash).toHaveBeenCalledWith(changedPassword);
      expect(mockAdminModel.update).toHaveBeenCalledWith(adminId, {
        adminId: changedAdminId,
        password: "newhashedpass",
      });
    });
  });

  describe("isAdmin", () => {
    test("管理者の場合にtrueを返す", async () => {
      const userId = "testadmin";
      const mockAdmin = { adminId: "testadmin", password: "hashedpass" };

      // モックの設定
      mockAdminModel.findOne.mockResolvedValue({
        success: true,
        data: mockAdmin,
      });

      const result = await isAdmin(userId);

      expect(result).toBe(true);
      expect(mockAdminModel.findOne).toHaveBeenCalledWith(userId);
    });

    test("管理者でない場合にfalseを返す", async () => {
      const userId = "testuser";

      // モックの設定
      mockAdminModel.findOne.mockResolvedValue(null);

      const result = await isAdmin(userId);

      expect(result).toBe(false);
      expect(mockAdminModel.findOne).toHaveBeenCalledWith(userId);
    });

    test("adminIdフィールドがない場合にfalseを返す", async () => {
      const userId = "testuser";
      const mockAdmin = { password: "hashedpass" }; // adminIdフィールドなし

      // モックの設定
      mockAdminModel.findOne.mockResolvedValue({
        success: true,
        data: mockAdmin,
      });

      const result = await isAdmin(userId);

      expect(result).toBe(false);
      expect(mockAdminModel.findOne).toHaveBeenCalledWith(userId);
    });

    test("空のuserIdでfalseを返す", async () => {
      const userId = "";

      const result = await isAdmin(userId);

      expect(result).toBe(false);
      expect(mockAdminModel.findOne).not.toHaveBeenCalled();
    });

    test("データベースエラーを適切に処理する", async () => {
      const userId = "testadmin";

      // モックの設定
      mockAdminModel.findOne.mockRejectedValue(new Error("Database error"));

      await expect(isAdmin(userId)).rejects.toThrow("Database error");

      expect(mockAdminModel.findOne).toHaveBeenCalledWith(userId);
    });
  });

  describe("deleteAdmin", () => {
    test("有効な管理者IDで削除が成功する", async () => {
      const adminId = "testadmin";

      // モックの設定
      mockAdminModel.delete.mockResolvedValue({
        success: true,
        data: null,
      });

      const result = await deleteAdmin(adminId);

      expect(result.success).toBe(true);
      expect(result.message).toBe("管理者が正常に削除されました");
      expect(result.data).toBeNull();

      expect(mockAdminModel.delete).toHaveBeenCalledWith(adminId);
    });

    test("データベースエラーを適切に処理する", async () => {
      const adminId = "testadmin";

      // モックの設定
      mockAdminModel.delete.mockRejectedValue(new Error("Database error"));

      await expect(deleteAdmin(adminId)).rejects.toThrow("Database error");

      expect(mockAdminModel.delete).toHaveBeenCalledWith(adminId);
    });
  });

  describe("統合テスト", () => {
    test("管理者のライフサイクル全体が正しく動作する", async () => {
      const adminId = "lifecycleadmin";
      const password = "testpass123";
      const newAdminId = "updatedadmin";
      const newPassword = "newpass456";

      // 1. 管理者作成
      crypto.hash.mockReturnValue("hashedpass");
      mockAdminModel.create.mockResolvedValue({
        success: true,
        data: { adminId },
      });

      const createResult = await createAdmin(adminId, password);
      expect(createResult.success).toBe(true);

      // 2. 管理者取得
      const mockAdmin = { adminId, password: "hashedpass" };
      mockAdminModel.findOne.mockResolvedValue({
        success: true,
        data: mockAdmin,
      });

      const getResult = await getAdminById(adminId);
      expect(getResult.success).toBe(true);
      expect(getResult.data.adminId).toBe(adminId);

      // 3. 認証確認
      crypto.isValid.mockReturnValue(true);

      const authResult = await authenticateAdmin(adminId, password);
      expect(authResult).toBe(true);

      // 4. 管理者権限確認
      const adminCheckResult = await isAdmin(adminId);
      expect(adminCheckResult).toBe(true);

      // 5. 管理者更新
      crypto.hash.mockReturnValue("newhashedpass");
      mockAdminModel.update.mockResolvedValue({
        success: true,
        data: null,
      });

      const updateResult = await updateAdmin(adminId, newAdminId, newPassword);
      expect(updateResult.success).toBe(true);

      // 6. 管理者削除
      mockAdminModel.delete.mockResolvedValue({
        success: true,
        data: null,
      });

      const deleteResult = await deleteAdmin(newAdminId);
      expect(deleteResult.success).toBe(true);

      // 7. 削除後の確認
      mockAdminModel.findOne.mockResolvedValue(null);

      const finalGetResult = await getAdminById(newAdminId);
      expect(finalGetResult.success).toBe(false);
      expect(finalGetResult.message).toBe("管理者が見つかりません");

      const finalAdminCheckResult = await isAdmin(newAdminId);
      expect(finalAdminCheckResult).toBe(false);
    });
  });
});
