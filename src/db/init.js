require('dotenv').config();
const { Sequelize, Model, DataTypes } = require('sequelize');

function initDb(){
    const sequelize = new Sequelize('KASHIDASU', process.env.DB_USER, process.env.DB_PASSWORD, {
    host: 'localhost',
    port: 3306,
    dialect: mysql
    });

    class Admin extends Model {}
    class Books extends Model{}
    class User extends Model {}

    User.init(
        {
            ID: DataTypes.STRING,
            PASSWORD: DataTypes.STRING,
            GRADE: DataTypes.INTEGER
        }
    );

    Books.init(
        {
            ID: DataTypes.STRING,
            NAME: DataTypes.STRING,
            AUTHOR: DataTypes.STRING,
        }
    );

    Admin.init(
        {
            ID: DataTypes.STRING,
            PASSWORD: DataTypes.STRING,
        }
    );

    (async () => {
        await sequelize.sync();
        console.log("Database & tables created!");
    })();
}

exports.modules = { initDb }