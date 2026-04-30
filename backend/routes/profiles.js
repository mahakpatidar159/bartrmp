const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { profiles, users } = require('../data/memory');

router.get('/', (req, res) => {
  const publicProfiles = profiles.map(p => {
    const user = users.find(u => u.id === p.userId);
    return { ...p, email: user?.email };
  });
  res.json(publicProfiles);
});

router.post('/create', auth, (req, res) => {
  const existing = profiles.find(p => p.userId === req.user.id);
  if (existing) {
    Object.assign(existing, req.body);
    return res.json({ message: 'Profile updated', profile: existing });
  }
  const newProfile = { userId: req.user.id, ...req.body };
  profiles.push(newProfile);
  res.status(201).json({ message: 'Profile created', profile: newProfile });
});

router.get('/me', auth, (req, res) => {
  const profile = profiles.find(p => p.userId === req.user.id);
  if (!profile) return res.status(404).json({ message: 'Profile not found' });
  res.json(profile);
});

module.exports = router;
