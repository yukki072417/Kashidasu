/**
 * ユーザーモデル
 * ユーザーのデータベース操作を管理する
 */
const UserModel = require("../db/models/user");
const crypto = require("../services/crypto");

const userModel = new UserModel();

/**
 * 新規ユーザーを作成する関数
 * @param {string} userId - ユーザーID
 * @param {string} password - パスワード
 * @returns {Promise<object>} - 作成結果
 */
async function createUser(userId, password) {
  try {
    if (userId == null || password == null) {
      throw new Error("Cannot empty userId and password.");
    }

    const hashedPassword = crypto.hash(password);

    await userModel.create(userId, hashedPassword);

    return {
      success: true,
      data: null,
      message: "ユーザーが正常に作成されました",
    };
  } catch (error) {
    throw error;
  }
}

/**
 * IDでユーザーを取得する関数
 * @param {string} userId - ユーザーID
 * @returns {Promise<object>} - 取得結果
 */
async function getUserByID(userId) {
  try {
    if (userId == null) {
      throw new Error("Cannot empty userId.");
    }

    const user = await userModel.findOne(userId);

    if (user && user.userId) {
      return {
        success: true,
        data: user,
        message: "ユーザーが正常に取得されました",
      };
    }

    return { success: false, data: null, message: "ユーザーが見つかりません" };
  } catch (error) {
    throw error;
  }
}

/**
 * 名前でユーザーを取得する関数
 * @param {string} userId - ユーザーID
 * @returns {Promise<object>} - 取得結果
 */
async function getUserByName(userId) {
  try {
    if (userId == null) {
      throw new Error("Cannot empty user_id.");
    }

    const user = await userModel.findOne(userId);

    if (user && user.userId) {
      return {
        success: true,
        data: user,
        message: "ユーザーが正常に取得されました",
      };
    }

    return { success: false, data: null, message: "ユーザーが見つかりません" };
  } catch (error) {
    throw error;
  }
}

/**
 * ユーザー情報を更新する関数
 * @param {string} userId - ユーザーID
 * @param {string} password - パスワード
 * @returns {Promise<object>} - 更新結果
 */
async function updateUser(userId, password) {
  try {
    if (userId == null || password == null) {
      throw new Error("Cannot empty userId and password.");
    }

    const hashedPassword = crypto.hash(password);

    await userModel.update(userId, { password: hashedPassword });

    return {
      success: true,
      data: null,
      message: "ユーザーが正常に更新されました",
    };
  } catch (error) {
    throw error;
  }
}

/**
 * ユーザーを削除する関数
 * @param {string} user_id - ユーザーID
 * @returns {Promise<object>} - 削除結果
 */
async function deleteUser(user_id) {
  try {
    if (user_id == null) {
      throw new Error("Cannot empty user_id.");
    }

    await userModel.delete(user_id);

    return {
      success: true,
      data: null,
      message: "ユーザーが正常に削除されました",
    };
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createUser,
  getUserByID,
  getUserByName,
  updateUser,
  deleteUser,
};
