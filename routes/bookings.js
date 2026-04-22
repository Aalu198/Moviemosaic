const express = require('express');
const router = express.Router();
const db = require('../db/database');

const requireAuth = (req, res, next) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Login required.' });
  next();
};

const TICKET_PRICE = 250; // Base price in INR

// GET /api/bookings - user's bookings
router.get('/', requireAuth, (req, res) => {
  const bookings = db.prepare(
    'SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC'
  ).all(req.session.userId);
  res.json({ bookings });
});

// POST /api/bookings
router.post('/', requireAuth, (req, res) => {
  const { movie_id, movie_title, location, show_date, show_time, seats, coupon_code } = req.body;
  if (!movie_id || !location || !show_date || !show_time || !seats)
    return res.status(400).json({ error: 'All booking fields required.' });

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.userId);
  let discount = 0;
  let couponUsed = null;
  let coupons = JSON.parse(user.coupons || '[]');

  if (coupon_code) {
    const idx = coupons.findIndex(c => c.code === coupon_code && !c.used);
    if (idx === -1) return res.status(400).json({ error: 'Invalid or already used coupon.' });
    discount = coupons[idx].discount;
    coupons[idx].used = true;
    couponUsed = coupon_code;
    db.prepare('UPDATE users SET coupons = ? WHERE id = ?').run(JSON.stringify(coupons), user.id);
  }

  const subtotal = TICKET_PRICE * seats;
  const total_price = subtotal - (subtotal * discount / 100);

  const result = db.prepare(`
    INSERT INTO bookings (user_id, movie_id, movie_title, location, show_date, show_time, seats, total_price, coupon_used, discount)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(req.session.userId, movie_id, movie_title, location, show_date, show_time, seats, total_price, couponUsed, discount);

  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(result.lastInsertRowid);
  res.json({ success: true, booking });
});

// DELETE /api/bookings/:id - cancel booking
router.delete('/:id', requireAuth, (req, res) => {
  const booking = db.prepare('SELECT * FROM bookings WHERE id = ? AND user_id = ?').get(req.params.id, req.session.userId);
  if (!booking) return res.status(404).json({ error: 'Booking not found.' });
  db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run('cancelled', req.params.id);
  res.json({ success: true });
});

module.exports = router;
