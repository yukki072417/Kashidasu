/**
 * ユーザールーター
 * ユーザー関連のAPIエンドポイントを定義する
 */
const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const { apiAuth } = require("../services/auth");

// すべてのユーザーエンドポイントは管理者用（セッション認証）
router.post("/", apiAuth, userController.createUser);
router.get("/one", apiAuth, userController.getUser);
router.put("/", apiAuth, userController.updateUser);
router.delete("/", apiAuth, userController.deleteUser);

module.exports = router;
