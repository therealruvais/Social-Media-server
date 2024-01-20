const express = require('express')
const {
  createChat,
  usersChats,
  findChat,
  deleteChat,
} = require("../controller/chatCtrl");
const authVerify = require('../middleware/auth');
const router = express.Router()

router.post("/", authVerify,createChat);
router.get("/user", authVerify,usersChats);
router.get("/find/:firstId/:secondId", authVerify,findChat);
router.delete("/delete/:chatId", authVerify, deleteChat);


module.exports = router