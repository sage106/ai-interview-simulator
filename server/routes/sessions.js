const express = require('express');
const router = express.Router();
const Session = require('../models/Session');

// GET /api/sessions — all completed sessions (for history page)
router.get('/', async (req, res) => {
  try {
    const sessions = await Session.find({ status: 'completed' })
      .sort({ createdAt: -1 })
      .select('role level type overallScore hiringDecision totalQuestions createdAt');
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sessions.' });
  }
});

module.exports = router;
