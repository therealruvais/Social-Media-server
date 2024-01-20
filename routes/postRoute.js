const express = require("express");
const {
  createPost,
  getPost,
  userFollowingPosts,
  getUsersPost,
  updatePost,
  deletePost,
  likeDislike,
  addComment,
  getAllComments,
  deleteComment,
  savePost,
  getSavedPosts,
} = require("../controller/postCtrl");
const authVerify = require("../middleware/auth");
const router = express.Router()

router.post("/comment/:postId", authVerify, addComment);
router.post("/create", authVerify, createPost);
router.put("/update/:id", authVerify, updatePost);
router.put("/like/:postId", authVerify, likeDislike);
router.put("/save/:postId", authVerify, savePost);

router.get("/homepost", authVerify, userFollowingPosts);
router.get("/post", authVerify, getPost);
router.get("/userpost/:username", authVerify, getUsersPost);
router.get("/getcomments/:postId", authVerify, getAllComments);
router.get("/getsaved/:username", authVerify, getSavedPosts);
router.delete("/delete/:id", authVerify, deletePost);
router.delete("/deleteC/:id", authVerify, deleteComment);


module.exports = router;