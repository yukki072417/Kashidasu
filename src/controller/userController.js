const userModel = require("../model/userModel");

async function createUser(req, res, next) {
  const { userId, password } = req.body;
  try {
    await userModel.createUser(userId, password);
    res.json({ result: "SUCCESS" });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ result: "FAILED", message: error.message });
  }
}

async function getUser(req, res, next) {
  const { userId } = req.body;
  try {
    const { success, user } = await userModel.getUserByID(userId);
    if (success) {
      res.json(user);
    } else {
      res.status(404).json({ result: "FAILED", message: "User not found." });
    }
  } catch (error) {
    console.error("Error getting user:", error);
    res.status(500).json({ result: "FAILED", message: error.message });
  }
}

async function updateUser(req, res, next) {
  const { user_id, user_password } = req.body; // フロントエンドからのリクエストに合わせて user_id, user_password を使用
  try {
    await userModel.updateUser(user_id, user_password);
    res.json({ result: "SUCCESS" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ result: "FAILED", message: error.message });
  }
}

async function deleteUser(req, res, next) {
  const { user_id } = req.body;
  try {
    await userModel.deleteUser(user_id);
    res.json({ result: "SUCCESS" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ result: "FAILED", message: error.message });
  }
}

module.exports = {
  createUser,
  getUser,
  updateUser,
  deleteUser,
};
