const UserModel = require("../db/models/user");
const crypto = require("../services/crypto");

const userModel = new UserModel();

async function createUser(userId, password) {
  if (userId == null || password == null) {
    throw new Error("Cannot empty userId and password.");
  }

  const hashedPassword = crypto.hash(password);

  await userModel.create(userId, hashedPassword);

  return { success: true };
}

async function getUserByID(userId) {
  if (userId == null) {
    throw new Error("Cannot empty userId.");
  }

  const user = await userModel.findOne(userId);

  if (user && user.userId) {
    return { success: true, user: user };
  }

  return { success: false, user: null };
}

async function getUserByName(userId) {
  if (userId == null) {
    throw new Error("Cannot empty user_id.");
  }

  const user = await userModel.findOne(userId);

  if (user && user.userId) {
    return { success: true, user: user };
  }

  return { success: false, user: null };
}

async function updateUser(userId, password) {
  if (userId == null || password == null) {
    throw new Error("Cannot empty userId and password.");
  }

  const hashedPassword = crypto.hash(password);

  await userModel.update(userId, { password: hashedPassword });

  return { success: true };
}

async function deleteUser(user_id) {
  if (user_id == null) {
    throw new Error("Cannot empty user_id.");
  }

  await userModel.delete(user_id);

  return { success: true };
}

module.exports = {
  createUser,
  getUserByID,
  getUserByName,
  updateUser,
  deleteUser,
};
