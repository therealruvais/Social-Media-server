const mongoose = require("mongoose");

var postSchema = new mongoose.Schema({
  desc: {
    type: String,
  },
  image: {
    type: String,
    required: true,
  },
  owner: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  likes: [
    {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  ],
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: "Notify" }],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

//Export the model
module.exports = mongoose.model("Post", postSchema);
