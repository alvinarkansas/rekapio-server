const router = require("express").Router();
const UserController = require("../controllers/user");

router.post("/signup", UserController.signUp);
router.post("/signin", UserController.signIn);
router.post("/refresh_token", UserController.generateNewToken);
router.post("/revoke_refresh_token", UserController.revokeUserRefreshToken);

module.exports = router;
