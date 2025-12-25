const { Model, DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

class Book extends Model {}

Book.init(
    {
        isbn: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        author: {
            type: DataTypes.STRING,
            allowNull: true
        },
        publisher: {
            type: DataTypes.STRING,
            allowNull: true
        },
    },
    {
        sequelize: sequelize,
        modelName: 'book',
        timestamps: false
    }
);

module.exports = Book;