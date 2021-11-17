const router = require("express").Router();
const { categoryAuthorization } = require("../middlewares/authorization");
const CategoryController = require("../controllers/category");

router.get("/", CategoryController.findAllOwn);
router.post("/", CategoryController.add);
router.put("/:id", categoryAuthorization, CategoryController.update);
router.delete("/:id", categoryAuthorization, CategoryController.delete);

module.exports = router;
