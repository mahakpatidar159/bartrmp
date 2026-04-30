const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { users } = require('../data/memory');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'secret123';

router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (users.find(u => u.email === email)) return res.status(400).json({ message: 'User already exists' });
  
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { id: Date.now().toString(), email, password: hashedPassword, role: 'user' };
  users.push(newUser);
  res.status(201).json({ message: 'User registered successfully' });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
  res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
});

router.post('/admin-login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.role === 'admin');
  if (!user) return res.status(400).json({ message: 'Invalid admin credentials' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Invalid admin credentials' });

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
  res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
});

module.exports = router;
