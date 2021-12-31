const router = require("express").Router();
const { accountAuthorization } = require("../middlewares/authorization");
const AccountController = require("../controllers/account");

router.get("/", AccountController.findAllOwn);
router.get("/:id", AccountController.findOwnById);
router.post("/", AccountController.add);
router.put("/:id", accountAuthorization, AccountController.update);
router.delete("/:id", accountAuthorization, AccountController.delete);

module.exports = router;
