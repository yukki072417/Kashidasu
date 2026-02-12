const { Model, DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

class User extends Model {}

User.init(
  {
    user_id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    grade: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize: sequelize,
    modelName: "user",
    timestamps: false,
  },
);

module.exports = User;
