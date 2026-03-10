/**
 * 統合テスト用Expressアプリケーション
 */

const express = require("express");
const session = require("express-session");
const path = require("path");
const fs = require("fs");

// データベース初期化
const initDb = require("../../db/init");

// ルーターインポート
const adminRoutes = require("../../router/adminRoutes");
const apiRoutes = require("../../router/apiRoutes");
const bookRoutes = require("../../router/bookRoutes");
const userRoutes = require("../../router/userRoutes");

const app = express();

// ミドルウェア設定
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// セッション設定（テスト用）
app.use(
  session({
    secret: "test-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // テストではHTTPSを無効化
      maxAge: 24 * 60 * 60 * 1000, // 24時間
    },
  }),
);

// ルーター設定
app.use("/api/admin", adminRoutes);
app.use("/api", apiRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/users", userRoutes);

// エラーハンドリングミドルウェア
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "サーバーエラーが発生しました",
  });
});

// 404ハンドリング
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "エンドポイントが見つかりません",
  });
});

module.exports = app;
