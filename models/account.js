"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Account extends Model {}
  Account.init(
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
      current_balance: DataTypes.INTEGER,
      color: DataTypes.STRING,
      suspended: DataTypes.BOOLEAN,
      UserId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Account",
    }
  );
  Account.associate = function (models) {
    Account.belongsTo(models.User);
  };
  return Account;
};
