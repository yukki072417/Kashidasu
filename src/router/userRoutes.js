const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");

router.post("/register", userController.createUser);
router.get("/get", userController.getUser);
router.put("/update", userController.updateUser);
router.delete("/delete", userController.deleteUser);
// router.post("/settings", userController.applySettings); // 設定適用ルートを追加

module.exports = router;
