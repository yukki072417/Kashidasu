/**
 * @param {res} はexpress routerのres
 * @param {number} はhttpステータスコード
 * @param {string} はエラーメッセージ
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
    return res.status(status).json({ message });
  } catch (error) {
    new Error("res or status was invaild.\nerror: ", error);
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = {
  errorResponse,
};
