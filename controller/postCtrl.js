const Post = require("../model/postModel");
const User = require("../model/userModel");
const Comment = require("../model/commentModel");
const Notify = require("../model/notificationModel");

const createPost = async (req, res) => {
  const { id } = req.user;

  const user = await User.findById(id).select("-password");

  if (user) {
    const { desc, image } = req.body;

    const newPost = new Post({
      desc,
      image,
      owner: user._id,
    });
    await newPost.save();

    res.json({
      msg: "Created Post!",
      newPost,
    });
  } else {
    res.status(404).json({ error: "User not found" });
  }
};

const getPost = async (req, res) => {
  const post = await Post.find({}).populate("owner").sort({ createdAt: -1 });
  if (post) {
    res.json({
      post,
    });
  } else {
    res.status(404).json({ error: "Post not found" });
  }
};

const userFollowingPosts = async (req, res) => {
  const { id } = req.user;
  const user = await User.findById(id)
    .select("-password")
    .populate("following");
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  const followingIds = user.following.map((followingUser) => followingUser._id);
  const posts = await Post.find({
    $or: [{ owner: id }, { owner: { $in: followingIds } }],
  })
    .sort({ createdAt: -1 })
    .populate("owner");

  if (!posts) throw new Eror("error fetching posts");

  res.json({ posts });
};

const getUsersPost = async (req, res) => {
  const { username } = req.params;

  const userId = await User.findOne({ username }).select("-password");
  if (!userId) throw new Error("cannot find user");

  const userPost = await Post.find({ owner: userId._id })
    .sort({ createdAt: -1 })
    .populate("owner");

  if (!userPost) throw new Error("cannot get post");

  res.json({ userPost });
};

const updatePost = async (req, res) => {
  const { id } = req.params;
  const newPost = await Post.findByIdAndUpdate(
    id,
    {
      desc: req?.body?.desc,
    },
    {
      new: true,
    }
  ).populate("owner");

  if (!newPost) throw new Error("cannot find post");

  res.json({ newPost });
};

const deletePost = async (req, res) => {
  const { id } = req.params;
  const deletedPost = await Post.findByIdAndDelete(id);
  if (!deletedPost) throw new Error("cannot find the Post");

  res.json({ msg: "success" });
};

const likeDislike = async (req, res) => {
  const { id } = req.user;
  const { postId } = req.params;

  const user = await User.findById(id).select("-password");
  const post = await Post.findById(postId);

  if (!user || !post) {
    return res.status(404).json({ error: "User or Post not found" });
  }

  const isLiked = post.likes.includes(user._id);
  if (isLiked) {
    let likedislike = await Post.findOneAndUpdate(
      {
        _id: post._id,
      },
      {
        $pull: { likes: user._id },
      },
      { new: true }
    );
    res.json({ msg: "unliked", likedislike });
  } else {
    let likedislike = await Post.findOneAndUpdate(
      { _id: post._id },
      { $push: { likes: user._id } },
      { new: true }
    ).populate('owner');

    const notification = await Notify.create({
      user: post.owner._id,
      actionBy: user._id,
      actionType: "liked your post",
      post: post._id,
      username: user.username,
      image: user.image,
    });

    await User.findByIdAndUpdate(
      post.owner._id,
      { $push: { notifications: notification._id } },
      { new: true }
    );

    res.json({ msg: "liked", likedislike });
  }
};

const addComment = async (req, res) => {
  const { id } = req.user;
  const { postId } = req.params;
  const { content } = req.body;

  const user = await User.findById(id).select("-password");
  const post = await Post.findById(postId).populate("owner");

  if (!user || !post) {
    return res.status(404).json({ error: "User or Post not found" });
  }

  const newComment = new Comment({
    content,
    owner: id,
  });
  await newComment.save();

  post.comments.push(newComment);
  await post.save();

  const notification = await Notify.create({
    user: post.owner,
    actionBy: user._id,
    actionType: "Commented on your post",
    post: post._id,
    username: user.username,
    image: user.image,
  });

 await User.findByIdAndUpdate(
   post.owner._id,
   { $push: { notifications: notification._id } },
   { new: true }
 );

  res.json({ msg: "success", comment: newComment });
};

const getAllComments = async (req, res) => {
  const { postId } = req.params;
  const post = await Post.findById(postId);
  const comments = await Comment.find({
    _id: { $in: post.comments },
  }).populate({
    path: "owner",
    select: "username image",
  });

  if (!comments) throw new Error("cannot get comments");

  res.json({ comments });
};

const deleteComment = async (req, res) => {
  const { id } = req.params;
  const comment = await Comment.findByIdAndDelete(id);
  if (!comment) throw new Error("cannot find comment");

  await Post.findOneAndUpdate(
    { comments: { $in: [comment._id] } },
    { $pull: { comments: comment._id } }
  );

  res.json({ msg: "success" });
};

const savePost = async (req, res) => {
  const { id } = req.user;
  const { postId } = req.params;

  const user = await User.findById(id).select("-password");
  const post = await Post.findById(postId);
  if (!user || !post) {
    return res.status(404).json({ error: "User or Post not found" });
  }
  const isSaved = user.saved.includes(post._id);
  if (isSaved) {
    let save = await User.findOneAndUpdate(
      { _id: user._id },
      {
        $pull: { saved: post._id },
      },
      {
        new: true,
      }
    );
    res.json({ msg: "unsaved", save });
  } else {
    let save = await User.findOneAndUpdate(
      { _id: user._id },
      { $push: { saved: post._id } },
      { new: true }
    );
    res.json({ msg: "saved", save });
  }
};

const getSavedPosts = async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ username }).select("-password");
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  const savedPosts = await Post.find({ _id: { $in: user.saved } });
  res.json({ savedPosts });
};

module.exports = {
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
};
