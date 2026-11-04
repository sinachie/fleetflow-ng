const Message = require('../models/Message');

exports.listMessages = async (req, res) => {
  try {
    // Fetch the last 50 messages, populate the sender's name and role
    const msgs = await Message.find()
      .populate('from', 'name role')
      .sort({ createdAt: -1 })
      .limit(50);
      
    // Reverse the array so the oldest message is at the top of the chat
    res.json(msgs.reverse());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    // 1. Save the message to MongoDB
    const msg = await Message.create({
      from: req.user._id,
      body: req.body.body,
    });

    // 2. Populate the sender's info so the frontend knows who it is
    const populatedMsg = await msg.populate('from', 'name role');

    // 3. Broadcast to everyone via Socket.IO
    const io = req.app.get('io');
    io.emit('chat:message', {
      id: populatedMsg._id,
      author: populatedMsg.from.name,
      role: populatedMsg.from.role,
      body: populatedMsg.body,
    });

    // 4. Send success back to the sender
    res.status(201).json(populatedMsg);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.markRead = async (req, res) => {
  try {
    await Message.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ message: 'Marked read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};