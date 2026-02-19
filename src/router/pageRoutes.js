const express = require("express");
const router = express.Router();
const auth = require("../services/auth");

router.get("/login", (req, res) => res.render("Login"));
router.get("/edit", (req, res) => {
  res.render("EditBook");
});
router.get("/register", auth.adminAuth, (req, res) => {
  res.render("Register");
});
router.post("/main", auth.Login);
router.get("/main", auth.adminAuth, auth.renderMainPage);
router.get("/read-code", (req, res) => {
  res.render("ReadCode");
});
router.get("/generate-card", auth.adminAuth, (req, res) => {
  res.render("GenerateCard");
});
router.get("/book-list", (req, res) => {
  res.render("BookList");
});
router.get("/scanning-registration", auth.adminAuth, (req, res) => {
  res.render("Registers/ScanningRegister");
});
router.get("/collective-registration", auth.adminAuth, (req, res) => {
  res.render("Registers/CollectiveRegister");
});
router.get("/settings", (req, res) => res.render("Settings"));

module.exports = router;
