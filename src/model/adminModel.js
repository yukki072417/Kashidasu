const sequelize = require('../db/sequelize');
const Admin = require('../db/models/admin');

async function createAdmin(adminId, password) {
  if (adminId == null || password == null) {
    throw new Error('Cannot empty adminId and password.');
  }

  const newAdmin = await sequelize.transaction(async (t) => {
    return Admin.create({
      admin_id: adminId,
      password: password
    }, { transaction: t });
  });

  return newAdmin;
}

async function getAdmin(adminId) {
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
    password: admin.password
  }
  
  return result;
}

async function updateAdmin(adminId, password) {
  const [affectedRows] = await sequelize.transaction(async (t) => {
    return Admin.update({
      password: password
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
  return Admin.destroy({
    where: {
      admin_id: adminId
    }
  });
}

module.exports = {
  createAdmin,
  getAdmin,
  updateAdmin,
  deleteAdmin
}