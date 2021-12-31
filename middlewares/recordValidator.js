module.exports = function (req, res, next) {
  try {
    const { type, amount } = req.body;

    if (type == "expense") {
      if (amount > 0) {
        res.status(400).json({
          status: 400,
          message: "Type expense only accepts negative amount",
        });
      } else {
        next();
      }
    } else if (type == "income") {
      if (amount < 0) {
        res.status(400).json({
          status: 400,
          message: "Type income only accepts positive amount",
        });
      } else {
        next();
      }
    } else if (type == "transfer") {
      if (amount < 0) {
        res.status(400).json({
          status: 400,
          message: "Type income only accepts positive amount",
        });
      } else {
        next();
      }
    } else {
      res.status(400).json({
        status: 400,
        message:
          "Payload type should be either 'expense', 'income', or 'transfer'",
      });
    }
  } catch (err) {
    res.status(401).json({ status: 401, message: "Login required" });
  }
};
