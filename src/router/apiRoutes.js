const express = require("express");
const router = express.Router();
const cardController = require("../controller/cardController");

router.post("/generating", cardController.generateCard);
router.get("/card/status", cardController.getCardStatus);

module.exports = router;
