const { Model, DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const User = require('../models/user');

class Loan extends Model {}

Loan.init(
    {
        loan_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        isbn: {
            type: DataTypes.STRING(13),
            allowNull: false,
        },
        user_id: {
            type: DataTypes.STRING(10),
            allowNull: false,
        },
        lend_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        return_date: {
            type: DataTypes.DATE,
            allowNull: false,
        }
    },
    {
        sequelize: sequelize,
        modelName: 'loan',
        timestamps: false
    }
);


// 「一つの貸出は、一人のユーザーに属する」という関係を定義するため、`belongsTo` を使用します。
Loan.belongsTo(User, { foreignKey: 'user_id' });

module.exports = Loan;