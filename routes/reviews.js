const express = require('express');
const router = express.Router();
const db = require('../db/database');

const requireAuth = (req, res, next) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Login required.' });
  next();
};

const COUPON_MILESTONES = [
  { reviews: 1, code: 'CRITIC10', discount: 10, label: '10% Off – First Review Reward' },
  { reviews: 3, code: 'FAN20', discount: 20, label: '20% Off – Active Reviewer' },
  { reviews: 5, code: 'MOGUL30', discount: 30, label: '30% Off – Movie Mogul' },
];

// POST /api/reviews
router.post('/', requireAuth, (req, res) => {
  const { movie_id, movie_title, rating, review_text } = req.body;
  if (!movie_id || !rating || !review_text)
    return res.status(400).json({ error: 'All fields required.' });

  // Check if user already reviewed this movie
  const existing = db.prepare('SELECT id FROM reviews WHERE user_id = ? AND movie_id = ?').get(req.session.userId, movie_id);
  if (existing) return res.status(409).json({ error: 'You already reviewed this movie.' });

  db.prepare(`
    INSERT INTO reviews (user_id, movie_id, movie_title, rating, review_text)
    VALUES (?, ?, ?, ?, ?)
  `).run(req.session.userId, movie_id, movie_title, rating, review_text);

  // Update user review count and check coupons
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.userId);
  const newCount = (user.reviews_count || 0) + 1;
  let coupons = JSON.parse(user.coupons || '[]');
  let newCoupon = null;

  const milestone = COUPON_MILESTONES.find(m => m.reviews === newCount);
  if (milestone) {
    const alreadyHas = coupons.find(c => c.code === milestone.code);
    if (!alreadyHas) {
      newCoupon = { code: milestone.code, discount: milestone.discount, label: milestone.label, used: false };
      coupons.push(newCoupon);
    }
  }

  db.prepare('UPDATE users SET reviews_count = ?, coupons = ? WHERE id = ?')
    .run(newCount, JSON.stringify(coupons), user.id);

  res.json({ success: true, newCoupon, reviewsCount: newCount });
});

// GET /api/reviews/my
router.get('/my', requireAuth, (req, res) => {
  const reviews = db.prepare(`
    SELECT r.*, m.poster FROM reviews r
    JOIN movies m ON r.movie_id = m.id
    WHERE r.user_id = ? ORDER BY r.created_at DESC
  `).all(req.session.userId);
  res.json({ reviews });
});

module.exports = router;
