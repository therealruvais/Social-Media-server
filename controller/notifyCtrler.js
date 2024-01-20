const User = require("../model/userModel");
const Post = require("../model/postModel");
const Notify = require("../model/notificationModel");

const getNotification = async (req, res) => {
  const { id } = req.user;
  const user = await User.findById(id).populate({
    path: "notifications",
  });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const notifications = user.notifications;

  res.json({ notifications });
};

const deleteNotification = async (req, res) => {
  const { id } = req.user;
  const { notifyId } = req.params;
  const user = await User.findById(id).populate({
    path: "notifications",
  });
  const notify = await Notify.findById(notifyId);

  if (!user || !notify) {
    return res.status(404).json({ error: "User and notification not found" });
  }

  const deleteNot = await User.findByIdAndUpdate(
    user._id,
    {
      $pull: { notifications: notify._id },
    },
    { new: true }
  );

  res.json({ msg: "success", deleteNot });
};

const clearMessages = async (req, res) => {
  const { id } = req.user;
  const user = await User.findById(id).select("-password").populate({
    path: "notifications",
  });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const clearAllMessages = await Promise.all(
    user.notifications.map(async (notification) => {
      const deleteAll = await Notify.findOneAndDelete({ _id: notification._id });
      return deleteAll;
    })

  )
  res.json({msg:'success',clearAllMessages})

}

const readUnread = async (req, res) => {
  const { id } = req.params;

  const notify = await Notify.findById(id);

  if (!notify) throw new Error("notify not found");

  const updatedNotifications = await Notify.findOneAndUpdate(
    { _id: notify._id },
    { isRead: true },
    { new: true }
  );

  res.json({ msg: "success", updatedNotifications });
};

const read = async (req, res) => {
  const { id } = req.user;

  const user = await User.findById(id).populate({
    path: "notifications",
  });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const updatedNotifications = await Promise.all(
    user.notifications.map(async (notification) => {
      const updatedNotification = await Notify.findOneAndUpdate(
        { _id: notification._id },
        { isRead: true },
        { new: true }
      );
      return updatedNotification;
    })
  );

  res.json({ msg: "success", updatedNotifications });
};


module.exports = {
  getNotification,
  deleteNotification,
  readUnread,
  read,
  clearMessages,
};
