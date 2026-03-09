/**
 * 管理者ルーター
 * 管理者関連のAPIエンドポイントを定義する
 */
const express = require("express");
const router = express.Router();
const adminController = require("../controller/adminController");
const { apiAuth, login, logout } = require("../services/auth");

// 公開用エンドポイント（認証不要）
router.post("/login", login);
router.get("/logout", logout);

// 管理者用エンドポイント（セッション認証）
router.post("/", apiAuth, adminController.createAdmin);
router.get("/one", apiAuth, adminController.getAdmin);
router.put("/", apiAuth, adminController.updateAdmin);
router.delete("/", apiAuth, adminController.deleteAdmin);

module.exports = router;
