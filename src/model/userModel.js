const { User, sequelize } = require('../db/init');

async function createUser(userId, password, grade) {
  let success = false;

  if (userId == null || password == null || grade == null) {
    throw new Error('Cannot empty userId, password, and grade.');
  }

  const newBook = await sequelize.transaction(async (t) => {
    return User.create({
      userId: userId,
      password: password,
      grade: grade
    });
  });

  if(newBook && newBook.userId){
    success = true;
  }

  return {success: success, user: newBook};
}

async function getUserByID(userId) {
  let success = false;

  if(userId == null){
    throw new Error('Cannot empty userId.');
  }

  const user = await sequelize.transaction(async (t) => {
    return User.findOne({
      where: {
        user_id: userId
      }
    }, { transaction: t });
  });

  if(user && user.user_id){
    success = true;
  }

  return {success: success, user: user};
}

async function getUserByName(name) {
  let success = false;
  if(name == null){
    throw new Error('Cannot empty name.');
  }
  
  const user = await sequelize.transaction(async (t) => {
    return User.findOne({
      where: {
        name: name
      }
    }, { transaction: t });
  });

  if(user && user.user_id){
    success = true;
  }

  return { success: success, user: user }
}

async function updateUser(userId, password, grade) {
  let success = false;

  if(userId == null || password == null || grade == null){
    throw new Error('Cannot empty userId, password, and grade.');
  }

  const affectedRows = await sequelize.transaction(async (t) => {
    return User.update({
      user_id: userId,
      password: password,
      grade: grade
    });
  });

  if(affectedRows.length > 0){
    success = true;
  }

  return { success: success, affected_rows: affectedRows.length}
}

async function deleteUser(user_id) {
  let success = false;
  if(user_id == null){
    throw new Error('Cannot empty user_id.');
  }

  const affectedRows = await sequelize.transaction(async (t) => {
    return User.destroy({
      where: {
        user_id: user_id
      }
    }, { transaction: t });
  });

  if(affectedRows.length > 0){
    success = true;
  }

  return { success: success, affected_rows: affectedRows.length }
}

exports.modules = {
  createUser,
  getUserByID,
  getUserByName,
  updateUser,
  deleteUser
}
