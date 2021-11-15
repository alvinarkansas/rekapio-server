module.exports = function (err, req, res, next) {
  console.log("👾 error 👾", err);

  if (err.name === "SequelizeUniqueConstraintError") {
    res.status(400).json({ message: "Your email has already registered" });
  } else if (err.name === "SequelizeValidationError") {
    let message = err.errors.map((error) => error.message);
    res.status(400).json({ message });
  } else {
    res.status(err.status || 500).json(err.message || "Internal server error");
  }
};
