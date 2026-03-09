const express = require("express");
const router = express.Router();
const bookController = require("../controller/bookController");

// 本のエンティティ操作
router.post("/register", bookController.createBook);
router.get("/get", bookController.getBook);
router.get("/get/all", bookController.getAllBooks);
router.put("/update", bookController.updateBook);
router.delete("/delete", bookController.deleteBook);
router.post("/search", bookController.search);

// 本の貸出情報取得（クエリパラメータで分岐）
router.get("/get/loan", bookController.getLoanByIsbn);
router.get("/get/loan/all", bookController.getAllLoans);

// 貸出・返却操作
router.post("/lend", bookController.lend);
router.post("/return", bookController.returnBook);

module.exports = router;
