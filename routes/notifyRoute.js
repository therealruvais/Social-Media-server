const express = require("express");
const {
  getNotification,
  deleteNotification,
  readUnread,
  read,
  clearMessages,
} = require("../controller/notifyCtrler");
const authVerify = require("../middleware/auth");
const router = express.Router();

router.get("/follow", authVerify, getNotification);
router.put("/read/:id", authVerify, readUnread);
router.put("/read-all", authVerify, read);
router.delete("/delete/:notifyId", authVerify, deleteNotification);
router.delete("/delete", authVerify, clearMessages);


module.exports = router;