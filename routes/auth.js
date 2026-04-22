const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db/database');

// SIGNUP
router.post('/signup', (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  db.get(
    'SELECT id FROM users WHERE email = ? OR username = ?',
    [email, username],
    (err, existing) => {

      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (existing) {
        return res.status(409).json({ error: 'Email or username already in use.' });
      }

      const hashed = bcrypt.hashSync(password, 10);

      db.run(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        [username, email, hashed],
        function (err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          db.get(
            'SELECT id, username, email FROM users WHERE id = ?',
            [this.lastID],
            (err, user) => {
              if (err) {
                return res.status(500).json({ error: err.message });
              }

              req.session.userId = user.id;

              res.json({
                success: true,
                user
              });
            }
          );
        }
      );
    }
  );
});


// LOGIN
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    req.session.userId = user.id;

    delete user.password;

    res.json({ success: true, user });
  });
});


// LOGOUT
router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});


// GET CURRENT USER
router.get('/me', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }

  db.get(
    'SELECT id, username, email, created_at FROM users WHERE id = ?',
    [req.session.userId],
    (err, user) => {

      if (err) return res.status(500).json({ error: err.message });
      if (!user) return res.status(404).json({ error: 'User not found.' });

      res.json({ user });
    }
  );
});

module.exports = router;