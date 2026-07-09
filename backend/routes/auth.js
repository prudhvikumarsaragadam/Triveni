const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');

// Admin Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  Admin.authenticate(username, password, (err, admin) => {
    if (err) {
      return res.status(500).json({ error: 'Authentication error' });
    }
    
    if (admin) {
      // Return admin info (in production, use JWT tokens)
      res.json({
        success: true,
        admin: admin,
        token: Buffer.from(admin.id).toString('base64') // Simple token for demo
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
});

// Verify Session
router.get('/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const adminId = Buffer.from(token, 'base64').toString();
    Admin.getById(adminId, (err, admin) => {
      if (err || !admin) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      res.json({ admin: admin });
    });
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Logout (front-end handled)
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
