const { User, Category, Account } = require("../models");

class AccountController {
  static async findAll(req, res, next) {
    try {
      const accounts = await Account.findAll({
        order: [["name", "ASC"]],
      });
      res.status(200).json(accounts);
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

  static async delete(req, res, next) {
    const { id } = req.params;
    let deletedAccount;

    try {
      const account = await Account.findByPk(id);

      if (account) {
        deletedAccount = account;
        await Account.destroy({ where: { id } });
        res.status(200).json(deletedAccount);
      } else {
        next({
          status: 404,
          message: "Account not found",
        });
      }
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AccountController;
