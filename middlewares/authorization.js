const { Account, Category, Record } = require("../models/index");

const accountAuthorization = async (req, res, next) => {
  const { id } = req.params;

  try {
    const account = await Account.findOne({ where: { id } });
    if (account) {
      if (account.UserId == req.currentUserId) {
        next();
      } else {
        res.status(401).json({ status: 401, message: "Authorization failed" });
      }
    } else {
      res.status(404).json({ status: 404, message: "Account not found" });
    }
  } catch (error) {
    next(error);
  }
};

const categoryAuthorization = async (req, res, next) => {
  const { id } = req.params;

  try {
    const category = await Category.findOne({ where: { id } });
    if (category) {
      if (category.UserId == req.currentUserId) {
        next();
      } else {
        res.status(401).json({ status: 401, message: "Authorization failed" });
      }
    } else {
      res.status(404).json({ status: 404, message: "Category not found" });
    }
  } catch (error) {
    next(error);
  }
};

const recordAuthorization = async (req, res, next) => {
  const { id } = req.params;

  try {
    const record = await Record.findOne({ where: { id } });
    if (record) {
      if (record.UserId == req.currentUserId) {
        next();
      } else {
        res.status(401).json({ status: 401, message: "Authorization failed" });
      }
    } else {
      res.status(404).json({ status: 404, message: "Record not found" });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { accountAuthorization, categoryAuthorization, recordAuthorization };
