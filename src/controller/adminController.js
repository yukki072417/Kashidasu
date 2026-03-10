/**
 * 管理者コントローラー
 * 管理者のCRUD操作を管理する
 */
const adminModel = require("../model/adminModel");

/**
 * 新規管理者を作成する関数
 * @param {object} req - リクエストオブジェクト
 * @param {object} res - レスポンスオブジェクト
 * @param {function} next - ミドルウェア関数
 */
async function createAdmin(req, res, next) {
  try {
    const adminData = req.body;

    // ビジネスロジック: バリデーション
    if (!adminData.id || !adminData.password) {
      return res.status(400).json({
        success: false,
        message: "IDとパスワードは必須です",
      });
    }

    // モデル層の呼び出し
    const result = await adminModel.createAdmin(
      adminData.id,
      adminData.password,
    );

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
    next(error);
  }
}

/**
 * 管理者情報を取得する関数
 * @param {object} req - リクエストオブジェクト
 * @param {object} res - レスポンスオブジェクト
 * @param {function} next - ミドルウェア関数
 */
async function getAdmin(req, res, next) {
  try {
    const { adminId } = req.params;

    // ビジネスロジック: パラメータ検証
    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: "管理者IDは必須です",
      });
    }

    // モデル層の呼び出し
    const result = await adminModel.getAdminById(adminId);

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
    next(error);
  }
}

/**
 * 管理者情報を更新する関数
 * @param {object} req - リクエストオブジェクト
 * @param {object} res - レスポンスオブジェクト
 * @param {function} next - ミドルウェア関数
 */
async function updateAdmin(req, res, next) {
  try {
    const { adminId } = req.params;
    const { id: changedAdminId, password: changedPassword } = req.body;

    // ビジネスロジック: バリデーション
    if (!adminId || !changedAdminId || !changedPassword) {
      return res.status(400).json({
        success: false,
        message: "すべてのフィールドは必須です",
      });
    }

    // モデル層の呼び出し
    const result = await adminModel.updateAdmin(
      adminId,
      changedAdminId,
      changedPassword,
    );

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
    next(error);
  }
}

/**
 * 管理者を削除する関数
 * @param {object} req - リクエストオブジェクト
 * @param {object} res - レスポンスオブジェクト
 * @param {function} next - ミドルウェア関数
 */
async function deleteAdmin(req, res, next) {
  try {
    const { adminId } = req.params;

    // ビジネスロジック: パラメータ検証
    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: "管理者IDは必須です",
      });
    }

    // モデル層の呼び出し
    const result = await adminModel.deleteAdmin(adminId);

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
    next(error);
  }
}

module.exports = {
  createAdmin,
  getAdmin,
  updateAdmin,
  deleteAdmin,
};
