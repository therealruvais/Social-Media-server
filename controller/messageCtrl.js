const Message = require('../model/messageModel')


const addMessage = async (req,res) => {
    const { chatId, senderId, text } = req.body
    const message = new Message({
      chatId,
      senderId,
      text,
    });
    await message.save()
    res.json(message)
}

const getMessage = async (req,res) => {
    const { chatId } = req.params;
  const result = await Message.find({ chatId })
  res.json(result)
}

const deleteMessage = async (req, res) => {
  const { chatId } = req.params;
  const deleted = await Message.deleteMany({chatId});
  if (!deleted) throw new Error('cannot delete msg');
  
  res.json({msg:'sucess', deleted});

}

const deleteOne = async (req, res) => {
  const { messageId } = req.params;
  const deleted = await Message.findByIdAndDelete(messageId);
  if (!deleted) throw new Error("cannot delete msg");
  res.json({msg:'success', deleted})
}


module.exports = { addMessage, getMessage, deleteMessage, deleteOne };