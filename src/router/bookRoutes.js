/**
 * 書籍ルーター
 * 書籍関連のAPIエンドポイントを定義する
 */
const express = require("express");
const router = express.Router();
const bookController = require("../controller/bookController");

// 書籍のエンティティ操作
router.post("/", bookController.createBook);
router.get("/one", bookController.getBook);
router.get("/all", bookController.getAllBooks);
router.put("/", bookController.updateBook);
router.delete("/", bookController.deleteBook);
router.post("/search", bookController.search);

// 書籍の貸出情報取得（クエリパラメータで分岐）
router.get("/loan", bookController.getLoanByIsbn);
router.get("/loan/all", bookController.getAllLoans);

// 貸出・返却操作
router.post("/lend", bookController.lend);
router.post("/return", bookController.returnBook);

module.exports = router;
