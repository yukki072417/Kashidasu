/**
 * エラーハンドリングサービス
 * HTTPエラーレスポンスを管理する
 */

/**
 * エラーレスポンスを返す関数
 * @param {object} res - Expressレスポンスオブジェクト
 * @param {number} status - HTTPステータスコード
 * @param {string} message - エラーメッセージ
 * @returns {object} - エラーレスポンス
 */
function errorResponse(res, status, message) {
  try {
    if ((res, status == null)) {
      throw new Error("res of status cannot empty.");
    }

    if (status >= 400 || status <= 599) {
      throw new Error(
        "'status' cannot specify out of error code value.\nPlease specify range of 400-599",
      );
    }
    return res.status(status).json({ success: false, message });
  } catch (error) {
    new Error("res or status was invaild.\nerror: ", error);
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
}

module.exports = {
  errorResponse,
};
