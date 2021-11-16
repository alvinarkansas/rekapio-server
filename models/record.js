"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Record extends Model {}
  Record.init(
    {
      type: { type: DataTypes.STRING, allowNull: false },
      amount: { type: DataTypes.INTEGER, allowNull: false },
      time: { type: DataTypes.DATE, allowNull: false },
      note: DataTypes.STRING,
      AccountId: DataTypes.INTEGER,
      CategoryId: DataTypes.INTEGER,
      DestinationAccountId: DataTypes.INTEGER,
      UserId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Record",
    }
  );
  Record.associate = function (models) {
    Record.belongsTo(models.Account);
    Record.belongsTo(models.Category);
    Record.belongsTo(models.User);
  };
  return Record;
};
