const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone, company } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already in use' });

    const hashed = await bcrypt.hash(password, 10);
    
    // Generate a unique company ID for the first user registering this company
    const companyId = crypto.randomBytes(8).toString('hex'); 

    const user = await User.create({ 
      name, email, password: hashed, role, phone, company, companyId 
    });
    
    const token = signToken(user._id);
    res.status(201).json({
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        company: user.company,
        companyId: user.companyId 
      },
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
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        company: user.company,
        companyId: user.companyId // <-- CRITICAL: Send companyId on login
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.me = async (req, res) => {
  res.json(req.user);
};

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

// Get all users in the same company (using companyId)
exports.getTeam = async (req, res) => {
  try {
    const team = await User.find({ companyId: req.user.companyId }).select('-password');
    res.json(team);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new team member (Driver or Manager)
exports.createTeamMember = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already in use' });

    const hashed = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashed,
      role, 
      company: req.user.company,
      companyId: req.user.companyId // <-- INHERIT THE COMPANY ID
    });

    res.status(201).json({ message: 'Team member created successfully', user: newUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};