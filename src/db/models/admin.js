const { Model, DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

class Admin extends Model {}

Admin.init(
    {
        admin_id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        password:{
            type: DataTypes.STRING,
            allowNull: false
        }
    },
    {
        sequelize: sequelize,
        modelName: 'admin',
        timestamps: false
    }
);

module.exports = Admin;