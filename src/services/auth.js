/**
 * 認証サービス
 * 管理者の認証とセッション管理を管理する
 */
const { getAdminById, authenticateAdmin } = require("../model/adminModel");

/**
 * 管理者認証ミドルウェア
 * @param {object} req - リクエストオブジェクト
 * @param {object} res - レスポンスオブジェクト
 * @param {function} next - ミドルウェア関数
 */
async function adminAuth(req, res, next) {
  if (req.session.admin == null) {
    // req.session が直接 true になることはないため、admin プロパティを確認
    res.redirect("/login");
    return;
  }

  const isExist = (await getAdminById(req.session.admin)).success;
  if (isExist === true) {
    // 厳密な比較に変更
    next();
  } else {
    res.redirect("/login"); // 管理者が存在しない場合もログインページへ
  }
}

/**
 * メインページをレンダリングする関数
 * @param {object} req - リクエストオブジェクト
 * @param {object} res - レスポンスオブジェクト
 */
function renderMainPage(req, res) {
  res.render("Main", { adminId: req.session.admin }); // Main.ejs に adminId を渡す
}

/**
 * ログイン処理を行う関数
 * @param {object} req - リクエストオブジェクト
 * @param {object} res - レスポンスオブジェクト
 */
async function login(req, res) {
  const { admin_id, admin_password } = req.body;

  try {
    const isAuthenticated = await authenticateAdmin(admin_id, admin_password);

    if (isAuthenticated) {
      req.session.admin = admin_id; // セッションに管理者IDを保存
      res.redirect("/main"); // メインページへリダイレクト
    } else {
      // 認証失敗
      // エラーメッセージをクエリパラメータとして渡すか、フラッシュメッセージを使用するなど
      res.redirect("/login?error=Invalid credentials"); // エラーメッセージ付きでログインページへ
    }
  } catch (error) {
    console.error("Login error:", error);
    res.redirect("/login?error=Server error during login"); // サーバーエラーの場合
  }
}

/**
 * ログアウト処理を行う関数
 * @param {object} req - リクエストオブジェクト
 * @param {object} res - レスポンスオブジェクト
 */
async function logout(req, res) {
  req.session.destroy();
  res.redirect("/login");
}

module.exports = {
  adminAuth,
  renderMainPage,
  login,
  logout,
};
