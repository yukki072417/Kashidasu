// const { User } = require("../db/init");

// async function createUser(userId, password, grade) {
//   let success = false;

//   if (userId == null || password == null || grade == null) {
//     throw new Error("Cannot empty userId, password, and grade.");
//   }

//   const newUser = await User.create({
//     user_id: userId,
//     password: password,
//     grade: grade,
//   });

//   if (newUser && newUser.user_id) {
//     success = true;
//   }

//   return { success: success, user: newUser };
// }

// async function getUserByID(userId) {
//   let success = false;

//   if (userId == null) {
//     throw new Error("Cannot empty userId.");
//   }

//   const user = await User.findOne({
//     where: {
//       user_id: userId,
//     },
//   });

//   if (user && user.user_id) {
//     success = true;
//   }

//   return { success: success, user: user };
// }

// async function getUserByName(userId) {
//   let success = false;
//   if (userId == null) {
//     throw new Error("Cannot empty user_id.");
//   }

//   const user = await User.findOne({
//     where: {
//       user_id: userId,
//     },
//   });

//   if (user && user.user_id) {
//     success = true;
//   }

//   return { success: success, user: user };
// }

// async function updateUser(userId, password, grade) {
//   let success = false;

//   if (userId == null || password == null || grade == null) {
//     throw new Error("Cannot empty userId, password, and grade.");
//   }

//   const affectedRows = await User.update(
//     {
//       password: password,
//       grade: grade,
//     },
//     {
//       where: {
//         user_id: userId,
//       },
//     },
//   );

//   if (affectedRows > 0) {
//     success = true;
//   }

//   return { success: success, affected_rows: affectedRows };
// }

// async function deleteUser(user_id) {
//   let success = false;
//   if (user_id == null) {
//     throw new Error("Cannot empty user_id.");
//   }

//   const affectedRows = await User.destroy({
//     where: {
//       user_id: user_id,
//     },
//   });

//   if (affectedRows > 0) {
//     success = true;
//   }

//   return { success: success, affected_rows: affectedRows };
// }

// module.exports = {
//   createUser,
//   getUserByID,
//   getUserByName,
//   updateUser,
//   deleteUser,
// };
