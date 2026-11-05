const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone, company } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already in use' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role, phone, company });
    const token = signToken(user._id);
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });

    const token = signToken(user._id);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.me = async (req, res) => {
  res.json(req.user);
};

const crypto = require('crypto');

exports.generateApiKey = async (req, res) => {
  try {
    const newKey = 'ff_live_' + crypto.randomBytes(16).toString('hex');
    await User.findByIdAndUpdate(req.user._id, { apiKey: newKey });
    res.json({ apiKey: newKey });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateErpUrl = async (req, res) => {
  try {
    const { erpWebhookUrl } = req.body;
    await User.findByIdAndUpdate(req.user._id, { erpWebhookUrl });
    res.json({ message: 'ERP Webhook updated successfully', erpWebhookUrl });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all users in the same company
exports.getTeam = async (req, res) => {
  try {
    // Finds all users with the same company name as the logged-in admin
    const team = await User.find({ company: req.user.company }).select('-password');
    res.json(team);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new team member (Driver or Manager)
exports.createTeamMember = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already in use' });

    // 2. Hash password
    const bcrypt = require('bcryptjs');
    const hashed = await bcrypt.hash(password, 10);

    // 3. Create the user, assigning them to the Admin's company
    const newUser = await User.create({
      name,
      email,
      password: hashed,
      role: role, // 'driver' or 'manager'
      company: req.user.company // This links them to the Admin's company
    });

    res.status(201).json({ message: 'Team member created successfully', user: newUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};