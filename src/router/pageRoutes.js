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
router.get("/", (req, res) => res.render("Login"));
router.get("/login", (req, res) => res.render("Login"));

/**
 * 書籍編集ページ
 */
router.get("/edit", (req, res) => {
  res.render("EditBook");
});

/**
 * 書籍登録ページ（認証必須）
 */
router.get("/register", auth.adminAuth, (req, res) => {
  res.render("Register");
});

/**
 * メインページ（認証必須）
 */
router.get("/main", auth.adminAuth, auth.renderMainPage);

/**
 * バーコード読み取りページ
 */
router.get("/read-code", (req, res) => {
  res.render("ReadCode");
});

/**
 * カード生成ページ（認証必須）
 */
router.get("/generate-card", auth.adminAuth, (req, res) => {
  res.render("GenerateCard");
});

/**
 * 書籍一覧ページ
 */
router.get("/book-list", (req, res) => {
  res.render("BookList");
});

/**
 * スキャン登録ページ（認証必須）
 */
router.get("/scanning-registration", auth.adminAuth, (req, res) => {
  res.render("Registers/ScanningRegister", { apiKey: apiKey });
});

/**
 * 一括登録ページ（認証必須）
 */
router.get("/collective-registration", auth.adminAuth, (req, res) => {
  res.render("Registers/CollectiveRegister");
});

/**
 * 設定ページ
 */
router.get("/settings", (req, res) => res.render("Settings"));

/**
 * ログアウト処理
 */
router.get("/logout", auth.logout);

module.exports = router;
