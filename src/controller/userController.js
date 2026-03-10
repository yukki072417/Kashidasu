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
  try {
    const { userId, password } = req.body;

    // ビジネスロジック: バリデーション
    if (!userId || !password) {
      return res.status(400).json({
        success: false,
        message: "ユーザーIDとパスワードは必須です",
      });
    }

    // モデル層の呼び出し
    const result = await userModel.createUser(userId, password);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(201).json({
      success: true,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    throw error;
  }
}

/**
 * ユーザー情報を取得する関数
 * @param {object} req - リクエストオブジェクト
 * @param {object} res - レスポンスオブジェクト
 * @param {function} next - ミドルウェア関数
 */
async function getUser(req, res, next) {
  try {
    const { userId } = req.params;

    // ビジネスロジック: パラメータ検証
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "ユーザーIDは必須です",
      });
    }

    // モデル層の呼び出し
    const result = await userModel.getUserByID(userId);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(200).json({
      success: true,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    throw error;
  }
}

/**
 * ユーザー情報を更新する関数
 * @param {object} req - リクエストオブジェクト
 * @param {object} res - レスポンスオブジェクト
 * @param {function} next - ミドルウェア関数
 */
async function updateUser(req, res, next) {
  try {
    const { userId } = req.params;
    const { password } = req.body;

    // ビジネスロジック: バリデーション
    if (!userId || !password) {
      return res.status(400).json({
        success: false,
        message: "ユーザーIDとパスワードは必須です",
      });
    }

    // モデル層の呼び出し
    const result = await userModel.updateUser(userId, password);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(200).json({
      success: true,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    throw error;
  }
}

/**
 * ユーザーを削除する関数
 * @param {object} req - リクエストオブジェクト
 * @param {object} res - レスポンスオブジェクト
 * @param {function} next - ミドルウェア関数
 */
async function deleteUser(req, res, next) {
  try {
    const { userId } = req.params;

    // ビジネスロジック: パラメータ検証
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "ユーザーIDは必須です",
      });
    }

    // モデル層の呼び出し
    const result = await userModel.deleteUser(userId);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(200).json({
      success: true,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createUser,
  getUser,
  updateUser,
  deleteUser,
};
