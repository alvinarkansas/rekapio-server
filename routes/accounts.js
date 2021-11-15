const router = require("express").Router();
const authentication = require("../middlewares/authentication");
const { accountAuthorization } = require("../middlewares/authorization");
const AccountController = require("../controllers/account");

router.use(authentication);

router.get("/", AccountController.findAll);
router.post("/", AccountController.add);
router.put("/:id", accountAuthorization, AccountController.update);
router.delete("/:id", accountAuthorization, AccountController.delete);

module.exports = router;
