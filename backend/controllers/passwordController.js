const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const PasswordReset = require('../models/PasswordReset');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// POST /auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(200).json({ message: 'If an account exists the reset link has been sent' });

    // create token
    const token = crypto.randomBytes(20).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // remove existing
    await PasswordReset.deleteMany({ user: user._id });
    await PasswordReset.create({ user: user._id, tokenHash, expiresAt });

    const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}&id=${user._id}`;

    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      });
      await transporter.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to: user.email, subject: 'Password reset', text: `Reset: ${resetUrl}` });
    } else {
      console.log(`Password reset link for ${user.email}: ${resetUrl}`);
    }

    res.status(200).json({ message: 'If an account exists the reset link has been sent' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { userId, token, newPassword } = req.body;
    if (!userId || !token || !newPassword) return res.status(400).json({ message: 'userId, token and newPassword required' });
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const record = await PasswordReset.findOne({ user: userId, tokenHash });
    if (!record || record.expiresAt < new Date()) return res.status(400).json({ message: 'Invalid or expired token' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    // remove tokens
    await PasswordReset.deleteMany({ user: user._id });

    res.status(200).json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /auth/change-password (authenticated)
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'currentPassword and newPassword required' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(400).json({ message: 'Current password incorrect' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.status(200).json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { forgotPassword, resetPassword, changePassword };
