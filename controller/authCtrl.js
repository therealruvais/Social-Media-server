const User = require("../model/userModel");
const Post = require("../model/postModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Notify = require('../model/notificationModel')

const createUser = async (req, res) => {
  const { name, email, username, password, gender } = req.body;
  const findEmail = await User.findOne({ email });
  if (findEmail) {
    res.status(400).json({ msg: "user Already exists" });
  }
  const findUsername = await User.findOne({ username });
  if (findUsername) throw new Error("user already exists");
  const encryptText = bcrypt.hashSync(password);
  const user = new User({
    name: name,
    username: username,
    email: email,
    password: encryptText,
    gender: gender,
  });
  await user.save();
  res.json(user);
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const findUser = await User.findOne({ email });
  if (!findUser) throw new Error("invalid email or password");
  const validPassword = bcrypt.compareSync(password, findUser.password);
  if (!validPassword) throw new Error("invalid credentials");
  const userToken = jwt.sign({ id: findUser._id }, process.env.USER_KEY, {
    expiresIn: "1d",
  });
  if (req.cookies[`${findUser._id}`]) {
     res.clearCookie(`${findUser.id}`);
    req.cookies[`${findUser._id}`] = "";
  }
  res.cookie(String(findUser._id), userToken, {
    path: "/",
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", 
  });
  res.json({ msg: "success", userToken });
};

const getUser = async (req, res) => {
  const { id } = req.user;
  const getaUser = await User.findById(id, "-password");
  if (!getaUser) throw new Error("User not found");
  res.json({ msg: "success", getaUser });
};

const getAllusers = async (req, res) => {
  const getallUsers = await User.find({}).select("-password");
  if (!getallUsers) throw new Error(`no users found`);
  res.json(getallUsers);
};

const refreshToken = (req, res, next) => {
  const cookie = req.headers.cookie;
  if (!cookie) throw new Error("cookie not found");
  const token = cookie.split("=")[1];
  if (!token) throw new Error("token not found");
  jwt.verify(token.toString(), process.env.USER_KEY, (error, user) => {
    if (error) {
      return res.status(403).json({ msg: "Authentication failed" });
    }
    res.clearCookie(`${user.id}`);
    req.cookies[`${user.id}`] = "";

    const refreshToken = jwt.sign({ id: user.id }, process.env.USER_KEY, {
      expiresIn: "2d",
    });
    res.cookie(String(user.id), refreshToken, {
      path: "/",
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
      httpOnly: true,
      sameSite: "lax",
    });
    console.log(user);
  });
  next();
};

const logOut = async (req, res) => {
  const { id } = req.user;
  const findUser = await User.findById(id, "-password");
  if (!findUser) throw new Error("user not found");
  res.clearCookie(`${findUser.id}`);
  req.cookies[`${findUser.id}`] = "";
  res.json({ msg: "user loggedout" });
};

const searchUser = async (req, res) => {
  try {
    const users = await User.find({ username: { $regex: req.query.username } })
      .limit(10)
      .select("name username image");

    res.json({ users });
  } catch (err) {
    return res.status(500).json({ msg: "failed" });
  }
};

const getProfileUser = async (req, res) => {
  const { username } = req.params;
  const users = await User.findOne({ username })
    .select("-password")
    .populate("followers following", "-password");
  if (!users) throw new Error("no user found");
  res.json({ users });
};

const updateUser = async (req, res) => {
  const { id } = req.user;

  const newUser = await User.findByIdAndUpdate(
    id,
    {
      name: req?.body?.name,
      username: req?.body?.username,
      email: req?.body?.email,
      bio: req?.body?.bio,
      website: req?.body?.website,
    },
    {
      new: true,
    }
  );
  if (!newUser) throw new Error("cannot update user try again");
  res.json({ newUser });
};

const updateImage = async (req, res) => {
  const { id } = req.user;
  try {
    const imageUrl = req.body.imageUrl;
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: { image: imageUrl } },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    return res
      .status(200)
      .json({ message: "Image URL updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating image URL:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const followUnfollow = async (req, res) => {
  const { username } = req.params;
  const { id } = req.user;

  const followingUser = await User.findById(id);
  const followedUser = await User.findOne({ username });
  if (!followedUser) {
    return res.status(404).json("User not found");
  }

  if (followingUser._id.equals(followedUser._id)) {
    return res.status(403).json("Action Forbidden");
  }

  const isFollowing = followedUser.followers.includes(
    followingUser._id.toString()
  );
  if (isFollowing) {
    let follow = await User.findOneAndUpdate(
      { _id: followedUser._id },
      { $pull: { followers: followingUser._id } },
      { new: true }
    );
    let unfollowing = await User.findOneAndUpdate(
      { _id: followingUser._id },
      { $pull: { following: followedUser._id } },
      { new: true }
    );
    res.json({ msg: "unfollowed", follow });
  } else {
    let follow = await User.findOneAndUpdate(
      { _id: followedUser._id },
      { $push: { followers: followingUser._id } },
      { new: true }
    );
    let following = await User.findOneAndUpdate(
      { _id: followingUser._id },
      { $push: { following: followedUser._id } },
      { new: true }
    );

    const notification = await Notify.create({
      user: followedUser._id,
      actionBy: followingUser._id,
      actionType: "Started following you",
      username: followingUser.username,
      image: followingUser.image,
    });

    followedUser.notifications.push(notification._id);
    await followedUser.save();

    res.json({ msg: "followed", follow });
  }
};

const getOneUser = async (req,res) => {
  const { id } = req.params;
  const user = await User.findById(id).select("-password");
  if (!user) throw new Error('user not found')
  res.json(user)
}



module.exports = {
  createUser,
  loginUser,
  getUser,
  getAllusers,
  refreshToken,
  logOut,
  searchUser,
  getProfileUser,
  updateUser,
  followUnfollow,
  updateImage,
  getOneUser,
};
