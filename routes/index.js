const router = require("express").Router();
const errorHandler = require("../middlewares/errorHandler");
const usersRoutes = require("./users");
const accountsRoutes = require("./accounts");

router.get("/", (req, res) => {
  res.json("> > > > 💰 Welcome To Dalso API 💰 < < < <");
});

router.use("/users", usersRoutes);
router.use("/accounts", accountsRoutes);

router.use(errorHandler);

module.exports = router;
