/**
 * 書籍ルーター
 * 書籍関連のAPIエンドポイントを定義する
 */
const express = require("express");
const router = express.Router();
const bookController = require("../controller/bookController");
const { apiAuth } = require("../services/auth");

// すべての書籍エンドポイントは管理者用（セッション認証）
router.post("/", apiAuth, bookController.createBook);
router.get("/one", apiAuth, bookController.getBook);
router.get("/all", apiAuth, bookController.getAllBooks);
router.put("/", apiAuth, bookController.updateBook);
router.delete("/", apiAuth, bookController.deleteBook);
router.post("/search", apiAuth, bookController.search);

// 貸出情報取得（セッション認証）
router.get("/loan", apiAuth, bookController.getLoanByIsbn);
router.get("/loan/all", apiAuth, bookController.getAllLoans);

// 貸出・返却操作（セッション認証）
router.post("/lend", apiAuth, bookController.lend);
router.post("/return", apiAuth, bookController.returnBook);

module.exports = router;
