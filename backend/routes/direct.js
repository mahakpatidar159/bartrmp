const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { directMessages, profiles, users } = require('../data/memory');

// Send a direct message to any user
router.post('/send', auth, (req, res) => {
  const { toUserId, text } = req.body;
  if (!toUserId || !text) return res.status(400).json({ message: 'toUserId and text are required' });
  if (toUserId === req.user.id) return res.status(400).json({ message: "Can't message yourself" });

  const msg = {
    id: Date.now().toString(),
    fromUserId: req.user.id,
    toUserId,
    text,
    timestamp: new Date()
  };
  directMessages.push(msg);
  res.status(201).json(msg);
});

// Get conversation between logged-in user and another user
router.get('/conversation/:userId', auth, (req, res) => {
  const otherId = req.params.userId;
  const myId = req.user.id;

  const conversation = directMessages.filter(m =>
    (m.fromUserId === myId && m.toUserId === otherId) ||
    (m.fromUserId === otherId && m.toUserId === myId)
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  res.json(conversation);
});

// Get all users I've had a conversation with (inbox)
router.get('/inbox', auth, (req, res) => {
  const myId = req.user.id;

  // Find unique user IDs I've chatted with
  const userIds = new Set();
  directMessages.forEach(m => {
    if (m.fromUserId === myId) userIds.add(m.toUserId);
    if (m.toUserId === myId) userIds.add(m.fromUserId);
  });

  const inbox = Array.from(userIds).map(uid => {
    const profile = profiles.find(p => p.userId === uid);
    const user = users.find(u => u.id === uid);
    const lastMsg = directMessages
      .filter(m => (m.fromUserId === myId && m.toUserId === uid) || (m.fromUserId === uid && m.toUserId === myId))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    return { userId: uid, email: user?.email, profile, lastMessage: lastMsg };
  });

  res.json(inbox);
});

module.exports = router;
