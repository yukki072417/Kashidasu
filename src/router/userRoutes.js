/**
 * ユーザールーター
 * ユーザー関連のAPIエンドポイントを定義する
 */
const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");

router.post("/", userController.createUser);
router.get("/one", userController.getUser);
router.put("/", userController.updateUser);
router.delete("/", userController.deleteUser);

module.exports = router;
