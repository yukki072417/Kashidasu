const express = require("express");
const router = express.Router();
const adminController = require("../controller/adminController");
const auth = require("../services/auth");

router.post("/signin", adminController.createAdmin);
router.get("/get", adminController.getAdmin);
router.put("/update", adminController.updateAdmin);
router.delete("/delete", adminController.deleteAdmin);
router.post("/login", auth.login); // ログインルートを追加
router.post("/logout", auth.logout);

module.exports = router;
