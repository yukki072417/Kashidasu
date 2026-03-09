/**
 * APIルーター
 * カード関連のAPIエンドポイントを定義する
 */
const express = require("express");
const router = express.Router();
const cardController = require("../controller/cardController");
const { apiAuth } = require("../services/auth");

// すべてのカードエンドポイントは管理者用（セッション認証）
router.post("/card/generate", apiAuth, cardController.generateCard);
router.get("/card/status", apiAuth, cardController.getCardStatus);

module.exports = router;
