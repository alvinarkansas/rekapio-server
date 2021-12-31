const router = require("express").Router();
const { recordAuthorization } = require("../middlewares/authorization");
const recordValidator = require("../middlewares/recordValidator");
const RecordController = require("../controllers/record");

router.get("/", RecordController.findAllAndGroupByDate);
router.get("/:account_id", RecordController.findAllByAccIdAndGroupByDate);
router.post("/", recordValidator, RecordController.add);
router.put("/:id", recordAuthorization, recordValidator, RecordController.update);
router.delete("/:id", recordAuthorization, RecordController.delete);

module.exports = router;
