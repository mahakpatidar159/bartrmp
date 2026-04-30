const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { profiles } = require('../data/memory');

router.get('/', auth, (req, res) => {
  try {
    const myProfile = profiles.find(p => p.userId === req.user.id);
    if (!myProfile) return res.json([]);

    const myOffered = Array.isArray(myProfile.skillsOffered) ? myProfile.skillsOffered : [];
    const myNeeded  = Array.isArray(myProfile.skillsNeeded)  ? myProfile.skillsNeeded  : [];

    const matches = profiles.filter(p => {
      if (p.userId === req.user.id) return false;

      const theirOffered = Array.isArray(p.skillsOffered) ? p.skillsOffered : [];
      const theirNeeded  = Array.isArray(p.skillsNeeded)  ? p.skillsNeeded  : [];

      // They offer something I need
      const theyOfferWhatINeed = myNeeded.some(skill =>
        theirOffered.map(s => s.toLowerCase()).includes(skill.toLowerCase())
      );

      // I offer something they need
      const iOfferWhatTheyNeed = theirNeeded.some(skill =>
        myOffered.map(s => s.toLowerCase()).includes(skill.toLowerCase())
      );

      return theyOfferWhatINeed || iOfferWhatTheyNeed;
    });

    res.json(matches);
  } catch (err) {
    console.error('Match error:', err);
    res.status(500).json({ message: 'Server error in match' });
  }
});

module.exports = router;
