/**
 * ページルーター
 * ページ表示関連のルートを定義する
 */
const express = require("express");
const router = express.Router();
const auth = require("../services/auth");
const apiKey = process.env.BOOKS_API_KEY;

/**
 * ログインページ
 */
router.get("/", (req, res) => res.render("login"));
router.get("/login", (req, res) => res.render("login"));

/**
 * 書籍編集ページ
 */
router.get("/edit", (req, res) => {
  res.render("editBook");
});

/**
 * 書籍登録ページ（認証必須）
 */
router.get("/register", auth.adminAuth, (req, res) => {
  res.render("register");
});

/**
 * メインページ（認証必須）
 */
router.get("/main", auth.adminAuth, auth.renderMainPage);

/**
 * バーコード読み取りページ
 */
router.get("/read-code", (req, res) => {
  res.render("readCode");
});

/**
 * カード生成ページ（認証必須）
 */
router.get("/generate-card", auth.adminAuth, (req, res) => {
  res.render("generateCard");
});

/**
 * 書籍一覧ページ
 */
router.get("/book-list", (req, res) => {
  res.render("bookList");
});

/**
 * スキャン登録ページ（認証必須）
 */
router.get("/scanning-registration", auth.adminAuth, (req, res) => {
  res.render("Registers/scanningRegister", { apiKey: apiKey });
});

/**
 * 一括登録ページ（認証必須）
 */
router.get("/collective-registration", auth.adminAuth, (req, res) => {
  res.render("Registers/collectiveRegister");
});

/**
 * 設定ページ
 */
router.get("/settings", (req, res) => res.render("settings"));

/**
 * ログアウト処理
 */
router.get("/logout", auth.logout);

module.exports = router;
