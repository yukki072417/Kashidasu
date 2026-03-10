/**
 * ユーザーモデル
 * ユーザーのデータベース操作を管理する
 */
const UserModel = require("../db/models/user");
const crypto = require("../services/crypto");

let userModelInstance = new UserModel();

// 依存性注入用の関数
function setUserModelInstance(instance) {
  userModelInstance = instance;
}

function getUserModelInstance() {
  return userModelInstance;
}

/**
 * 新規ユーザーを作成する関数
 * @param {string} userId - ユーザーID
 * @param {string} password - パスワード
 * @returns {Promise<object>} - 作成結果
 */
async function createUser(userId, password) {
  try {
    if (!userId || !password) {
      throw new Error("Cannot empty userId and password.");
    }

    const hashedPassword = crypto.hash(password);

    const result = await userModelInstance.create(userId, hashedPassword);
    if (!result.success) {
      return { success: false, message: result.message };
    }

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
    if (!userId) {
      throw new Error("Cannot empty userId.");
    }

    const result = await userModelInstance.findOne(userId);
    if (!result || !result.success) {
      return { success: false, message: "ユーザーが見つかりません" };
    }

    return {
      success: true,
      data: result.data,
      message: "ユーザーが正常に取得されました",
    };
  } catch (error) {
    throw error;
  }
}

/**
 * 名前でユーザーを取得する関数
 * @param {string} userName - ユーザー名
 * @returns {Promise<object>} - 取得結果
 */
async function getUserByName(userName) {
  try {
    if (!userName) {
      throw new Error("Cannot empty userName.");
    }

    const result = await userModelInstance.findAll();
    if (!result || !result.success) {
      return { success: false, message: "ユーザーが見つかりません" };
    }

    const users = result.data;
    const user = users.find((user) => user.userId === userName);

    if (user && user.userId) {
      return {
        success: true,
        data: user,
        message: "ユーザーが正常に取得されました",
      };
    }

    return { success: false, message: "ユーザーが見つかりません" };
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
    if (!userId || !password) {
      throw new Error("Cannot empty userId and password.");
    }

    const hashedPassword = crypto.hash(password);

    const result = await userModelInstance.update(userId, {
      password: hashedPassword,
    });
    if (!result || !result.success) {
      return { success: false, message: result.message };
    }

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
 * @param {string} userId - ユーザーID
 * @returns {Promise<object>} - 削除結果
 */
async function deleteUser(userId) {
  try {
    if (!userId) {
      throw new Error("Cannot empty userId.");
    }

    const result = await userModelInstance.delete(userId);
    if (!result || !result.success) {
      return { success: false, message: result.message };
    }

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
  setUserModelInstance,
  getUserModelInstance,
};
