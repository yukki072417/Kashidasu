/**
 * 管理者コントローラー
 * 管理者のCRUD操作を管理する
 */
const adminModel = require("../model/adminModel");
const { errorResponse } = require("../services/errorHandling");

/**
 * 新規管理者を作成する関数
 * @param {object} req - リクエストオブジェクト
 * @param {object} res - レスポンスオブジェクト
 * @param {function} next - ミドルウェア関数
 */
async function createAdmin(req, res, next) {
  const adminData = req.body;
  if (adminData.id == undefined || adminData.password == undefined) {
    return errorResponse(res, 200);
  }

  const result = await adminModel.createAdmin(adminData.id, adminData.password);
  if (result.success == false) {
    return errorResponse(res, 500);
  }

  return res
    .status(200)
    .json({ success: true, message: "管理者が正常に作成されました" });
}

/**
 * 管理者情報を取得する関数
 * @param {object} req - リクエストオブジェクト
 * @param {object} res - レスポンスオブジェクト
 * @param {function} next - ミドルウェア関数
 */
function getAdmin(req, res, next) {
  res.json({
    success: true,
    message: "管理者情報が正常に取得されました",
    data: null,
  });
}

/**
 * 管理者情報を更新する関数
 * @param {object} req - リクエストオブジェクト
 * @param {object} res - レスポンスオブジェクト
 * @param {function} next - ミドルウェア関数
 */
function updateAdmin(req, res, next) {
  res.json({
    success: true,
    message: "管理者情報が正常に更新されました",
    data: null,
  });
}

/**
 * 管理者を削除する関数
 * @param {object} req - リクエストオブジェクト
 * @param {object} res - レスポンスオブジェクト
 * @param {function} next - ミドルウェア関数
 */
function deleteAdmin(req, res, next) {
  res.json({
    success: true,
    message: "管理者が正常に削除されました",
    data: null,
  });
}

module.exports = {
  createAdmin,
  getAdmin,
  updateAdmin,
  deleteAdmin,
};
