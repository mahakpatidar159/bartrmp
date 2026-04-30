const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const { users, profiles, requests, messages } = require('../data/memory');

router.get('/users', adminAuth, (req, res) => {
  const userList = users.map(u => {
    const profile = profiles.find(p => p.userId === u.id);
    return { id: u.id, email: u.email, role: u.role, profile };
  });
  res.json(userList);
});

router.get('/requests', adminAuth, (req, res) => {
  res.json(requests);
});

router.get('/chats', adminAuth, (req, res) => {
  res.json(messages);
});

router.delete('/users/:id', adminAuth, (req, res) => {
  const idx = users.findIndex(u => u.id === req.params.id);
  if (idx !== -1) {
    users.splice(idx, 1);
    
    // Remove related data
    const pIdx = profiles.findIndex(p => p.userId === req.params.id);
    if (pIdx !== -1) profiles.splice(pIdx, 1);
    
    res.json({ message: 'User deleted' });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

module.exports = router;
