const { Account } = require("../models/index");

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

module.exports = { accountAuthorization };
