const sequelize = require('./sequelize');
const User = require('./models/admin');
const Book = require('./models/book');
const Admin = require('./models/admin');


async function initDb() {
    await sequelize.sync();
    console.log("Database & tables created!");
}

module.exports = {
    initDb,
    User,
    Book,
    Admin,
    sequelize
};
