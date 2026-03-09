/**
 * ユーザーコントローラー
 * ユーザーのCRUD操作を管理する
 */
const userModel = require("../model/userModel");

/**
 * 新規ユーザーを作成する関数
 * @param {object} req - リクエストオブジェクト
 * @param {object} res - レスポンスオブジェクト
 * @param {function} next - ミドルウェア関数
 */
async function createUser(req, res, next) {
  const { userId, password } = req.body;
  try {
    await userModel.createUser(userId, password);
    res.json({ success: true, message: "ユーザーが正常に作成されました" });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * ユーザー情報を取得する関数
 * @param {object} req - リクエストオブジェクト
 * @param {object} res - レスポンスオブジェクト
 * @param {function} next - ミドルウェア関数
 */
async function getUser(req, res, next) {
  const { userId } = req.body;
  try {
    const { success, user } = await userModel.getUserByID(userId);
    if (success) {
      res.json({
        success: true,
        data: user,
        message: "ユーザーが正常に取得されました",
      });
    } else {
      res.status(404).json({ success: false, message: "User not found." });
    }
  } catch (error) {
    console.error("Error getting user:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * ユーザー情報を更新する関数
 * @param {object} req - リクエストオブジェクト
 * @param {object} res - レスポンスオブジェクト
 * @param {function} next - ミドルウェア関数
 */
async function updateUser(req, res, next) {
  const { user_id, user_password } = req.body;
  try {
    await userModel.updateUser(user_id, user_password);
    res.json({ success: true, message: "ユーザーが正常に更新されました" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * ユーザーを削除する関数
 * @param {object} req - リクエストオブジェクト
 * @param {object} res - レスポンスオブジェクト
 * @param {function} next - ミドルウェア関数
 */
async function deleteUser(req, res, next) {
  const { user_id } = req.body;
  try {
    await userModel.deleteUser(user_id);
    res.json({ success: true, message: "ユーザーが正常に削除されました" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  createUser,
  getUser,
  updateUser,
  deleteUser,
};
