const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth'); // Import your token verification middleware

// ─── LOGIN USER ─────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`\n🔑 Login attempt received for email: ${email}`);

    // 1. Check for user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log('❌ Login failed: Email not found in MongoDB database.');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 2. Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('❌ Login failed: Password does not match.');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 3. Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback_secret', {
      expiresIn: '24h',
    });

    console.log('✅ Login successful! Token generated.');
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error('💥 Server error during login:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// ─── REGISTER USER ──────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({ name, email: email.toLowerCase(), password });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback_secret', {
      expiresIn: '24h',
    });

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// ─── GET CURRENT USER (Fixes the frontend 404 /auth/me) ──────────────────────
router.get('/me', auth, async (req, res) => {
  try {
    // req.user is supplied automatically by your auth middleware
    res.json(req.user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching user profile' });
  }
});

module.exports = router;