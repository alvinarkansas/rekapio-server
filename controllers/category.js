const { Category } = require("../models");
const { Op } = require("sequelize");

class CategoryController {
  static async findAllOwn(req, res, next) {
    const { term } = req.query;

    let whereOption = null;

    if (term) {
      whereOption = {
        [Op.and]: [
          {
            name: {
              [Op.iLike]: `%${term.toLowerCase()}%`,
            },
          },
          {
            UserId: req.currentUserId,
          },
        ],
      };
    } else {
      whereOption = {
        UserId: req.currentUserId,
      };
    }

    try {
      const categories = await Category.findAll({
        where: whereOption,
        order: [["name", "ASC"]],
      });
      res.status(200).json(categories);
    } catch (error) {
      next(error);
    }
  }

  static async add(req, res, next) {
    try {
      const { name, icon, color } = req.body;
      const newCategory = await Category.create({
        name,
        icon,
        color,
        UserId: req.currentUserId,
      });

      res.status(201).json(newCategory);
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    const { name, icon, color } = req.body;
    const { id } = req.params;

    try {
      const updatedCategory = await Category.update(
        { name, icon, color },
        { where: { id }, returning: true }
      );
      res.status(200).json(updatedCategory[1][0]);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    const { id } = req.params;
    let deletedCategory;

    try {
      const category = await Category.findByPk(id);

      if (category) {
        deletedCategory = category;
        await Category.destroy({ where: { id } });
        res.status(200).json(deletedCategory);
      } else {
        next({
          status: 404,
          message: "Category not found",
        });
      }
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CategoryController;
