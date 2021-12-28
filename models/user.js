"use strict";
const { Model } = require("sequelize");
const { hashPassword } = require("../helpers/bcrypt");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {}
  User.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            args: true,
            msg: "Name cannot be empty",
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: {
            args: true,
            msg: "Invalid email format",
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [6],
            msg: "Password should at least have 6 characers",
          },
        },
      },
      token_version: {
        type: DataTypes.INTEGER,
      },
    },
    {
      hooks: {
        beforeCreate: (User, options) => {
          User.password = hashPassword(User.password);
        },
      },
      sequelize,
      modelName: "User",
    }
  );
  User.associate = function (models) {
    User.hasMany(models.Account);
    User.hasMany(models.Category);
  };
  return User;
};
