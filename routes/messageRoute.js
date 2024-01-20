const express = require("express");
const {
  addMessage,
    getMessage,
  deleteOne,
  deleteMessage,
} = require("../controller/messageCtrl");
const authVerify = require("../middleware/auth");

const router = express.Router();

router.post('/', authVerify, addMessage)
router.get('/:chatId',authVerify, getMessage)
router.delete("/delete-one/:messageId", authVerify, deleteOne);
router.delete("/delete/:chatId", authVerify, deleteMessage);

module.exports = router;