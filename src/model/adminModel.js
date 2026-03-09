/**
 * 管理者モデル
 * 管理者のデータベース操作を管理する
 */
const AdminModel = require("../db/models/admin");
const crypto = require("../services/crypto");

const adminModel = new AdminModel();

/**
 * 新規管理者を作成する関数
 * @param {string} adminId - 管理者ID
 * @param {string} password - パスワード
 * @returns {Promise<object>} - 作成結果
 */
async function createAdmin(adminId, password) {
  try {
    if (adminId == null || password == null) {
      throw new Error("Cannot empty adminId and password.");
    }

    const hashedPassword = crypto.hash(password);

    await adminModel.create(adminId, hashedPassword);

    return {
      success: true,
      data: null,
      message: "管理者が正常に作成されました",
    };
  } catch (error) {
    throw error;
  }
}

/**
 * IDで管理者を取得する関数
 * @param {string} adminId - 管理者ID
 * @returns {Promise<object>} - 取得結果
 */
async function getAdminById(adminId) {
  try {
    if (adminId == null) {
      throw new Error("Cannot empty userId.");
    }

    const admin = await adminModel.findOne(adminId);

    if (admin && admin.adminId) {
      return {
        success: true,
        data: admin,
        message: "管理者が正常に取得されました",
      };
    }

    return { success: false, data: null, message: "管理者が見つかりません" };
  } catch (error) {
    throw error;
  }
}

/**
 * 管理者を認証する関数
 * @param {string} adminId - 管理者ID
 * @param {string} password - パスワード
 * @returns {Promise<boolean>} - 認証結果
 */
async function authenticateAdmin(adminId, password) {
  try {
    if (!adminId || !password) {
      throw new Error("Cannot empty adminId and password.");
    }

    const admin = await adminModel.findOne(adminId);

    if (!admin) {
      crypto.isValid(
        "dummy_password_for_timing_attack_prevention",
        "dummy_hash",
      );
      return false;
    }

    return crypto.isValid(password, admin.password);
  } catch (error) {
    throw error;
  }
}

/**
 * 管理者情報を更新する関数
 * @param {string} adminId - 管理者ID
 * @param {string} changedAdminId - 変更後の管理者ID
 * @param {string} changedPassword - 変更後のパスワード
 * @returns {Promise<object>} - 更新結果
 */
async function updateAdmin(adminId, changedAdminId, changedPassword) {
  try {
    if (adminId == null || changedAdminId == null || changedPassword == null) {
      throw new Error(
        "Cannot empty adminId, changedAdminId, and changedPassword.",
      );
    }
    const hashedPassword = crypto.hash(changedPassword);

    await adminModel.update(adminId, {
      adminId: changedAdminId,
      password: hashedPassword,
    });

    return {
      success: true,
      data: null,
      message: "管理者が正常に更新されました",
    };
  } catch (error) {
    throw error;
  }
}

/**
 * 管理者かどうかを判定する関数
 * @param {string} userId - ユーザーID
 * @returns {Promise<boolean>} - 管理者の場合はtrue
 */
async function isAdmin(userId) {
  try {
    if (!userId) {
      return false;
    }

    const admin = await adminModel.findOne(userId);
    return admin && admin.adminId ? true : false;
  } catch (error) {
    throw error;
  }
}

/**
 * 管理者を削除する関数
 * @param {string} adminId - 管理者ID
 * @returns {Promise<object>} - 削除結果
 */
async function deleteAdmin(adminId) {
  try {
    await adminModel.delete(adminId);
    return {
      success: true,
      data: null,
      message: "管理者が正常に削除されました",
    };
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createAdmin,
  getAdminById,
  authenticateAdmin,
  updateAdmin,
  deleteAdmin,
  isAdmin,
};
