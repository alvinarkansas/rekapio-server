const router = require("express").Router();
const authentication = require("../middlewares/authentication");
const errorHandler = require("../middlewares/errorHandler");
const usersRoutes = require("./users");
const accountsRoutes = require("./accounts");
const categoriesRoutes = require("./categories");

router.get("/", (req, res) => {
  res.json("> > > > 💰 Welcome To Dalso API 💰 < < < <");
});

router.use("/users", usersRoutes);
router.use(authentication);
router.use("/accounts", accountsRoutes);
router.use("/categories", categoriesRoutes);

router.use(errorHandler);

module.exports = router;
