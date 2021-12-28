const { verifyAccessToken } = require("../helpers/jwt");
const { User } = require("../models/index");

module.exports = function (req, res, next) {
  try {
    req.decoded = verifyAccessToken(req.headers.authorization);
    User.findOne({
      where: {
        id: req.decoded.id,
      },
    })
      .then((user) => {
        if (user) {
          req.currentUserId = user.id;
          next();
        } else {
          res
            .status(401)
            .json({ status: 401, message: "Sorry, we do not recognize you" });
        }
        return null;
      })
      .catch((err) => {
        res.status(500).json(err);
      });
  } catch (err) {
    res.status(401).json({ status: 401, message: "Login required" });
  }
};
