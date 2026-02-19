const express = require("express");
const router = express.Router();
const adminController = require("../controller/adminController");
const auth = require("../services/auth"); // authモジュールをインポート

router.post("/signin", adminController.createAdmin);
router.get("/get", adminController.getAdmin);
router.put("/update", adminController.updateAdmin);
router.delete("/delete", adminController.deleteAdmin);
router.post("/login", auth.Login); // ログインルートを追加
// router.get("/auth-check", adminController.authCheck); // 権限チェックルートを追加

module.exports = router;
