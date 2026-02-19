const express = require("express");
const router = express.Router();
const bookController = require("../controller/bookController");

router.post("/register", bookController.createBook);
router.get("/get", bookController.getBook);
router.put("/update", bookController.updateBook);
router.delete("/delete", bookController.deleteBook);

module.exports = router;
