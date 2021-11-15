const router = require("express").Router();

router.get("/", (req, res) => {
  res.json("> > > > 💰 Welcome To Dalso API 💰 < < < <");
});

module.exports = router;
