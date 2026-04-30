const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const loadDemoData = require('./data/demoData');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/auth', require('./routes/auth'));
app.use('/profiles', require('./routes/profiles'));
app.use('/profile', require('./routes/profiles'));
app.use('/match', require('./routes/match'));
app.use('/requests', require('./routes/requests'));
app.use('/messages', require('./routes/messages'));
app.use('/upload', require('./routes/upload'));
app.use('/admin', require('./routes/admin'));
app.use('/direct', require('./routes/direct'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  await loadDemoData();
  console.log(`Server running on port ${PORT}`);
});
