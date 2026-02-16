// const { Admin } = require("../db/init");
// const crypto = require("../services/crypto");

// async function createAdmin(adminId, password) {
//   let success = false;
//   if (adminId == null || password == null) {
//     throw new Error("Cannot empty adminId and password.");
//   }

//   const hashedPassword = crypto.hash(password);

//   const newAdmin = await Admin.create({
//     admin_id: adminId,
//     password: hashedPassword,
//   });

//   if (newAdmin && newAdmin.admin_id) {
//     success = true;
//   }

//   return { success: success };
// }

// async function getAdminById(adminId) {
//   let success = false;

//   if (adminId == null) {
//     throw new Error("Cannot empty userId.");
//   }

//   const admin = await Admin.findOne({
//     where: {
//       admin_id: adminId,
//     },
//   });

//   if (admin && admin.admin_id) {
//     success = true;
//   }

//   return { success: success, admin: admin };
// }

// async function authenticateAdmin(adminId, password) {
//   if (!adminId || !password) {
//     throw new Error("Cannot empty adminId and password.");
//   }

//   const admin = await Admin.findOne({
//     where: {
//       admin_id: adminId,
//     },
//   });

//   if (!admin) {
//     crypto.isValid("", "");
//     return false;
//   }

//   return crypto.isValid(password, admin.password);
// }

// async function updateAdmin(adminId, changedAdminId, changedPassword) {
//   let success = false;

//   if (adminId == null || changedAdminId == null || changedPassword == null) {
//     throw new Error(
//       "Cannot empty adminId, changedAdminId, and changedPassword.",
//     );
//   }
//   const hashedPassword = crypto.hash(changedPassword);

//   const affectedRows = await Admin.update(
//     {
//       admin_id: changedAdminId,
//       password: hashedPassword,
//     },
//     {
//       where: {
//         admin_id: adminId,
//       },
//     },
//   );

//   if (affectedRows.length > 0) {
//     success = true;
//   }

//   return { success: success, affected_rows: affectedRows.length };
// }

// async function deleteAdmin(adminId) {
//   let success = false;

//   const affectedRows = await Admin.destroy({
//     where: {
//       admin_id: adminId,
//     },
//   });

//   if (affectedRows > 0) {
//     // Repository.destroy returns the count directly
//     success = true;
//   }

//   return { success: success, affected_rows: affectedRows };
// }

// module.exports = {
//   createAdmin,
//   getAdminById,
//   updateAdmin,
//   deleteAdmin,
// };
