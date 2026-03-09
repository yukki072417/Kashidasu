/**
 * APIルーター
 * カード関連のAPIエンドポイントを定義する
 */
const express = require("express");
const router = express.Router();
const cardController = require("../controller/cardController");

router.post("/card/generate", cardController.generateCard);
router.get("/card/status", cardController.getCardStatus);

module.exports = router;
