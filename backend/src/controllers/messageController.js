const Message = require('../models/Message');

exports.listMessages = async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = userId ? { $or: [{ from: userId }, { to: userId }] } : {};
    const msgs = await Message.find(filter)
      .populate('from', 'name role')
      .populate('to', 'name role')
      .sort({ createdAt: 1 });
    res.json(msgs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const msg = await Message.create({
      from: req.user._id,
      to: req.body.to || null,
      body: req.body.body,
    });
    res.status(201).json(msg);
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