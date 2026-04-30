const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { messages, requests } = require('../data/memory');

router.post('/send', auth, (req, res) => {
  const { requestId, text } = req.body;
  const request = requests.find(r => r.id === requestId);
  if (!request) return res.status(404).json({ message: 'Request not found' });
  if (request.status !== 'accepted') return res.status(400).json({ message: 'Request must be accepted to chat' });
  if (request.senderId !== req.user.id && request.receiverId !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

  const newMessage = { id: Date.now().toString(), requestId, senderId: req.user.id, text, timestamp: new Date() };
  messages.push(newMessage);
  res.status(201).json(newMessage);
});

router.get('/chat/:requestId', auth, (req, res) => {
  const { requestId } = req.params;
  const request = requests.find(r => r.id === requestId);
  if (!request || (request.senderId !== req.user.id && request.receiverId !== req.user.id)) {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const chat = messages.filter(m => m.requestId === requestId);
  res.json(chat);
});

module.exports = router;
