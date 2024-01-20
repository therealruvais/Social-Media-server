const express = require("express");
const {
  createUser,
  loginUser,
  getUser,
  logOut,
  getAllusers,
  searchUser,
  getProfileUser,
  updateUser,
  followUnfollow,
  updateImage,
  getOneUser,
} = require("../controller/authCtrl");
const authVerify = require("../middleware/auth");
const router = express.Router();

router.post("/register", createUser);
router.post("/login", loginUser);
router.post("/logout", authVerify, logOut);
router.patch("/update", authVerify, updateUser);
router.put("/updateimg", authVerify, updateImage);
router.put("/followunfollow/:username", authVerify, followUnfollow);
router.get("/verify", authVerify, getUser);
router.get("/all-users", getAllusers);
router.get("/search", authVerify, searchUser);
router.get("/getuser/:username", authVerify, getProfileUser);
router.get("/getoneuser/:id", authVerify, getOneUser);

module.exports = router;
