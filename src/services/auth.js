const { getAdminById, authenticateAdmin } = require("../model/adminModel");

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

function renderMainPage(req, res) {
  res.render("Main", { adminId: req.session.admin }); // Main.ejs に adminId を渡す
}

async function Login(req, res) {
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

module.exports = {
  adminAuth,
  renderMainPage,
  Login, // Login 関数をエクスポートに追加
};
