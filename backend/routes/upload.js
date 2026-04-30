const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { profiles } = require('../data/memory');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    cb(null, req.user.id + '-' + Date.now() + path.extname(file.originalname))
  }
});
const upload = multer({ storage: storage });

router.post('/resume', auth, upload.single('resume'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Please upload a file' });
  
  const profile = profiles.find(p => p.userId === req.user.id);
  if (profile) {
    profile.resume = req.file.filename;
  }
  
  res.json({ message: 'Resume uploaded successfully', filename: req.file.filename });
});

module.exports = router;
