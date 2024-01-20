const mongoose = require("mongoose");

// Declare the Schema of the Mongo model
const chatSchema = new mongoose.Schema(
  {
    members: {
      type: Array,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", chatSchema);
