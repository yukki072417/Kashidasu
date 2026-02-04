const { Admin, sequelize } = require('../db/init');


async function createAdmin(adminId, password) {
  let success = false;
  if (adminId == null || password == null) {
    throw new Error('Cannot empty adminId and password.');
  }

  const newAdmin = await sequelize.transaction(async (t) => {
    return Admin.create({
      admin_id: adminId,
      password: password
    }, { transaction: t });
  });

  if(newAdmin && newAdmin.admin_id){
    success = true;
  }

  return { success: success };
}

async function getAdminById(adminId) {
  let success = false;

  if(adminId == null){
    throw new Error('Cannot empty userId.');
  }

  const admin = await sequelize.transaction(async (t) => {
    return Admin.findOne({
      where: {
        user_id: adminId
      }
    }, { transaction: t });
  });

  if(admin && admin.admin_id){
    success = true;
  }

  return { success: success, admin: admin };
}

async function updateAdmin(adminId, changedAdminId, changedPassword) {
  let success = false;

  if(adminId == null || changedAdminId == null || changedPassword == null) {
    throw new Error('Cannot empty adminId, changedAdminId, and changedPassword.');
  }

  const affectedRows = await sequelize.transaction(async (t) => {
    return Admin.update({
      admin_id: changedAdminId,
      password: changedPassword
    }, {
      where: {
        admin_id: adminId
      },
      transaction: t
    });
  });
  
  if(affectedRows.length > 0){
    success = true;
  }

  return { success: success, affected_rows: affectedRows.length }
}

async function deleteAdmin(adminId) {
  let success = false;
  
  const affectedRows = await sequelize.transaction(async (t) => {
    return Admin.destroy({
      where: {
        admin_id: adminId
      }
    }, { transaction: t });
  });

  if(affectedRows.length > 0){
    success = true;
  }

  return { success: success, affected_rows: affectedRows.length }
}

module.exports = {
  createAdmin,
  getAdminById,
  updateAdmin,
  deleteAdmin
}