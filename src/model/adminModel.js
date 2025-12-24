const sequelize = require('../db/sequelize');
const Admin = require('../db/models/admin');
const crypto = require('../services/crypto');

async function createAdmin(adminId, password) {
  if (!adminId || !password) {
    throw new Error('Cannot empty adminId and password.');
  }

  const hashedPassword = crypto.hash(password);

  const newAdmin = await sequelize.transaction(async (t) => {
    return Admin.create({
      admin_id: adminId,
      password: hashedPassword
    }, { transaction: t });
  });

  return newAdmin;
}

async function getAdmin(adminId) {
  if (!adminId) {
    throw new Error('Cannot empty adminId.');
  }
  const admin = await Admin.findOne({
    where: {
      admin_id: adminId
    }
  });

  if (!admin) {
    throw new Error('Admin not found.');
  }

  const result = {
    admin_id: admin.admin_id,
  }

  return result;
}

async function authenticateAdmin(adminId, password) {
  if (!adminId || !password) {
    throw new Error('Cannot empty adminId and password.');
  }

  const admin = await Admin.findOne({
    where: {
      admin_id: adminId
    }
  });

  if (!admin) {
    crypto.isValid('', '');
    return false;
  }

  return crypto.isValid(password, admin.password);
}

async function updateAdmin(adminId, changedAdminId, changedPassword) {
  if (!adminId || !changedAdminId || !changedPassword) {
    throw new Error('Cannot empty adminId and password.');
  }

  const hashedPassword = crypto.hash(changedPassword);

  const [affectedRows] = await sequelize.transaction(async (t) => {
    return Admin.update({
      admin_id: changedAdminId,
      password: hashedPassword
    }, {
      where: {
        admin_id: adminId
      },
      transaction: t
    });
  });

  return affectedRows;
}

async function deleteAdmin(adminId) {
  if (!adminId) {
    throw new Error('Cannot empty adminId.');
  }
  return Admin.destroy({
    where: {
      admin_id: adminId
    }
  });
}

module.exports = {
  createAdmin,
  getAdmin,
  authenticateAdmin,
  updateAdmin,
  deleteAdmin
}