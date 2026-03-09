const express = require("express");
const router = express.Router();
const bookController = require("../controller/bookController");

router.post("/register", bookController.createBook);
router.get("/get", bookController.getBook);
router.get("/get/all", bookController.getAllBooks);
router.get("/get/loan/one/:isbn", bookController.getLoanByIsbn);
router.get("/get/loan/all", bookController.getAllLoans);
router.put("/update", bookController.updateBook);
router.delete("/delete", bookController.deleteBook);
router.post("/lend", bookController.lend);
router.post("/return", bookController.returnBook);
router.post("/search", bookController.search);

module.exports = router;
