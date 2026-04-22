const express = require('express');
const router = express.Router();
const db = require('../db/database');

// POST /api/feedback
router.post('/', (req, res) => {
  const { name, email, platform_rating, genres, message } = req.body;
  if (!name || !email || !platform_rating || !genres || !message)
    return res.status(400).json({ error: 'All fields required.' });

  const userId = req.session.userId || null;
  db.prepare(`
    INSERT INTO feedback (user_id, name, email, platform_rating, genres, message)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(userId, name, email, platform_rating, Array.isArray(genres) ? genres.join(',') : genres, message);

  res.json({ success: true });
});

// POST /api/quiz - save personality type
router.post('/quiz', (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ error: 'Login required.' });
  const { personality_type } = req.body;
  if (!personality_type) return res.status(400).json({ error: 'Personality type required.' });
  db.prepare('UPDATE users SET personality_type = ? WHERE id = ?').run(personality_type, req.session.userId);
  res.json({ success: true, personality_type });
});

module.exports = router;
