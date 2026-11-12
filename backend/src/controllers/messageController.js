const Message = require('../models/Message');

exports.listMessages = async (req, res) => {
  try {
    const msgs = await Message.find({ companyId: req.user.companyId })
      .populate('from', 'name role')
      .sort({ createdAt: -1 })
      .limit(50);
      
    res.json(msgs.reverse());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const msg = await Message.create({
      from: req.user._id,
      body: req.body.body,
      companyId: req.user.companyId, // <-- USE COMPANY ID
    });

    const populatedMsg = await msg.populate('from', 'name role');

    const io = req.app.get('io');
    // Broadcast to the room named after the companyId
    io.to(req.user.companyId).emit('chat:message', {
      id: populatedMsg._id,
      author: populatedMsg.from.name,
      role: populatedMsg.from.role,
      body: populatedMsg.body,
    });

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