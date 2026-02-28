const express = require("express");
const router = express.Router();
const bookController = require("../controller/bookController");

router.post("/register", bookController.createBook);
router.get("/get", bookController.getBook);
router.put("/update", bookController.updateBook);
router.delete("/delete", bookController.deleteBook);
// router.post("/lend", bookController.lend); // 貸出ルートを追加
// router.post("/return", bookController.return); // 返却ルートを追加
// router.post("/search", bookController.search); // 検索ルートを追加

module.exports = router;
