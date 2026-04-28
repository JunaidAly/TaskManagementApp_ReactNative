const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User.model');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 'error', message: 'Validation failed', errors: errors.array() });
    }

    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ status: 'error', message: 'User already exists with this email' });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: { user: { id: user._id, name: user.name, email: user.email }, token },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error registering user', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 'error', message: 'Validation failed', errors: errors.array() });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ status: 'error', message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);
    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: { user: { id: user._id, name: user.name, email: user.email }, token },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error logging in', error: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      status: 'success',
      data: { user: { id: user._id, name: user.name, email: user.email, createdAt: user.createdAt } },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error fetching profile', error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (email) user.email = email;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: { user: { id: user._id, name: user.name, email: user.email } },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error updating profile', error: error.message });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ status: 'error', message: 'Current and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ status: 'error', message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ status: 'error', message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ status: 'success', message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error updating password', error: error.message });
  }
};

module.exports = { register, login, getProfile, updateProfile, updatePassword };
