"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {}
  Category.init(
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
      icon: DataTypes.STRING,
      color: DataTypes.STRING,
      visible: DataTypes.BOOLEAN,
      UserId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Category",
    }
  );
  Category.associate = function (models) {
    Category.belongsTo(models.User);
  };
  return Category;
};
