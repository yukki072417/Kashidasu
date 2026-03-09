/**
 * 管理者ルーター
 * 管理者関連のAPIエンドポイントを定義する
 */
const express = require("express");
const router = express.Router();
const adminController = require("../controller/adminController");
const auth = require("../services/auth");

router.post("/", adminController.createAdmin);
router.get("/one", adminController.getAdmin);
router.put("/", adminController.updateAdmin);
router.delete("/", adminController.deleteAdmin);
router.post("/login", auth.login);
router.get("/logout", auth.logout);

module.exports = router;
