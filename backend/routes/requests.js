const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { requests, profiles } = require('../data/memory');

router.post('/send', auth, (req, res) => {
  const { receiverId } = req.body;
  if (receiverId === req.user.id) return res.status(400).json({ message: "Can't send request to yourself" });
  
  const existing = requests.find(r => r.senderId === req.user.id && r.receiverId === receiverId);
  if (existing) return res.status(400).json({ message: 'Request already sent' });

  const newRequest = { id: Date.now().toString(), senderId: req.user.id, receiverId, status: 'pending', timestamp: new Date() };
  requests.push(newRequest);
  res.status(201).json({ message: 'Request sent', request: newRequest });
});

router.post('/update', auth, (req, res) => {
  const { requestId, status } = req.body;
  const request = requests.find(r => r.id === requestId);
  if (!request) return res.status(404).json({ message: 'Request not found' });
  if (request.receiverId !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

  request.status = status;
  res.json({ message: `Request ${status}`, request });
});

router.get('/my', auth, (req, res) => {
  const myRequests = requests.filter(r => r.senderId === req.user.id || r.receiverId === req.user.id);
  
  // Attach profiles
  const enriched = myRequests.map(r => {
    const otherId = r.senderId === req.user.id ? r.receiverId : r.senderId;
    const otherProfile = profiles.find(p => p.userId === otherId);
    return { ...r, otherProfile };
  });
  
  res.json(enriched);
});

module.exports = router;
