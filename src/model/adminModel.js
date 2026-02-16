const AdminModel = require("../db/models/admin");
const crypto = require("../services/crypto");

const adminModel = new AdminModel();

async function createAdmin(adminId, password) {
  if (adminId == null || password == null) {
    throw new Error("Cannot empty adminId and password.");
  }

  const hashedPassword = crypto.hash(password);

  await adminModel.create(adminId, hashedPassword);

  return { success: true };
}

async function getAdminById(adminId) {
  if (adminId == null) {
    throw new Error("Cannot empty userId.");
  }

  const admin = await adminModel.findOne(adminId);

  if (admin && admin.adminId) {
    return { success: true, admin: admin };
  }

  return { success: false, admin: null };
}

async function authenticateAdmin(adminId, password) {
  if (!adminId || !password) {
    throw new Error("Cannot empty adminId and password.");
  }

  const admin = await adminModel.findOne(adminId);

  if (!admin) {
    crypto.isValid("dummy_password_for_timing_attack_prevention", "dummy_hash");
    return false;
  }

  return crypto.isValid(password, admin.password);
}

async function updateAdmin(adminId, changedAdminId, changedPassword) {
  if (adminId == null || changedAdminId == null || changedPassword == null) {
    throw new Error(
      "Cannot empty adminId, changedAdminId, and changedPassword.",
    );
  }
  const hashedPassword = crypto.hash(changedPassword);

  await adminModel.update(adminId, {
    adminId: changedAdminId,
    password: hashedPassword,
  });

  return { success: true };
}

async function deleteAdmin(adminId) {
  await adminModel.delete(adminId);
  return { success: true };
}

module.exports = {
  createAdmin,
  getAdminById,
  authenticateAdmin,
  updateAdmin,
  deleteAdmin,
};
