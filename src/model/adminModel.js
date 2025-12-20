const sequelize = require('../db/sequelize');
const { Admin } = require('../db/init');

async function createAdmin(adminId, password) {
  // サンプル処理
  if (adminId == null || password == null) throw new Error('adminIdまたはpasswordがnullです');

  try {
    let admin;
    sequelize.transaction(async (t) => {
      admin = await Admin.create({
        admin_id: adminId,
        password: password
      });
    });

    return admin;
  } catch (error) {
    console.error(`Error: adminModel.js: ${error}`)
    throw error;
  }
}

async function getAdmin() {

}

async function updateAdmin() {

}

async function deleteAdmin() {

}

module.exports = {
  createAdmin,
  getAdmin,
  updateAdmin,
  deleteAdmin
}
