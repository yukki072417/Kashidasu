/**
 * 公開ルーター
 * 公開APIエンドポイントを定義する
 */
const express = require("express");
const router = express.Router();
const { apiKeyAuth } = require("../services/auth");

// 公開用エンドポイント（APIキー認証）
// 外部システムが利用する読み取り専用API

/**
 * 公開書籍情報取得エンドポイント
 * APIキー認証が必要
 */
router.get("/books", apiKeyAuth, (req, res) => {
  res.json({
    success: true,
    message: "公開書籍情報API",
    data: {
      endpoints: [
        "GET /public/books - 書籍一覧",
        "GET /public/books/:isbn - 書籍詳細",
        "GET /public/loans - 貸出情報",
      ],
    },
  });
});

/**
 * 公開貸出情報取得エンドポイント
 * APIキー認証が必要
 */
router.get("/loans", apiKeyAuth, (req, res) => {
  res.json({
    success: true,
    message: "公開貸出情報API",
    data: {
      description: "貸出状況に関する公開情報",
    },
  });
});

module.exports = router;
