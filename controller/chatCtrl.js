const Chat = require('../model/chatModel')


const createChat = async (req, res) => {
    const existingChat = await Chat.findOne({
        members: { $all: [req.body.senderId, req.body.recieverId] }
    });

    if (existingChat) {
        return res.json({ msg: "exists", existingChat });
    }

    const newChat = new Chat({
        members: [req.body.senderId, req.body.recieverId]
    })

    await newChat.save()

    res.json({ msg: "success", newChat });
}




const usersChats = async (req, res) => {
    const {id} = req.user
    const chat = await Chat.find({
        members:{$in:[id]}
    })
    res.json(chat)
}

const findChat = async (req, res) => {
    const chat = await Chat.findOne({
        members:{$all:[req.params.firstId,req.params.secondId]}
    })
     res.json(chat);
}

const deleteChat = async (req, res) => {
    const { chatId } = req.params;
    const deleted = await Chat.findByIdAndDelete(chatId);
    if (!deleted) throw new Error('canot find chat');
    res.json({msg:'success',deleted})
}

module.exports = { createChat, usersChats, findChat, deleteChat };
