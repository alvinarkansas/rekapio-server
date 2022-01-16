const { Account } = require("../models");
const { Op } = require("sequelize");

class AccountController {
  static async findAllOwn(req, res, next) {
    try {
      const accounts = await Account.findAll({
        order: [["name", "ASC"]],
        where: { UserId: req.currentUserId, suspended: false },
      });
      res.status(200).json(accounts);
    } catch (error) {
      next(error);
    }
  }

  static async findOwnById(req, res, next) {
    const { id } = req.params;
    try {
      const account = await Account.findOne({
        where: {
          [Op.and]: [{ id }, { UserId: req.currentUserId }],
        },
      });
      res.status(200).json(account);
    } catch (error) {
      next(error);
    }
  }

  static async add(req, res, next) {
    try {
      const { name, color, current_balance } = req.body;
      const newAccount = await Account.create({
        name,
        color,
        current_balance,
        UserId: req.currentUserId,
      });

      res.status(201).json(newAccount);
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    const { name, current_balance, color } = req.body;
    const { id } = req.params;

    try {
      const updatedAccount = await Account.update(
        { name, current_balance, color },
        { where: { id }, returning: true }
      );
      res.status(200).json(updatedAccount[1][0]);
    } catch (error) {
      next(error);
    }
  }

  static async suspend(req, res, next) {
    const { id } = req.params;

    try {
      const suspendedAccount = await Account.update(
        { suspended: true },
        { where: { id }, returning: true }
      );

      console.log(suspendedAccount[1][0].name);

      res
        .status(200)
        .json({ message: `Account ${suspendedAccount[1][0].name} suspended` });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AccountController;
