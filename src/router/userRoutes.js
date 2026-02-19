const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");

router.post("/register", userController.createUser);
router.get("/get", userController.getUser);
router.put("/update", userController.updateUser);
router.delete("/delete", userController.deleteUser);

module.exports = router;
