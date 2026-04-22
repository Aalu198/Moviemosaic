const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/movies
router.get('/', (req, res) => {
  const { search, genre, industry, minRating, maxRating } = req.query;

  let query = 'SELECT * FROM movies WHERE 1=1';
  const params = [];

  if (search) {
    query += ' AND title LIKE ?';
    params.push(`%${search}%`);
  }
  if (genre) {
    query += ' AND genre LIKE ?';
    params.push(`%${genre}%`);
  }
  if (industry) {
    query += ' AND industry = ?';
    params.push(industry);
  }
  if (minRating) {
    query += ' AND rating >= ?';
    params.push(parseFloat(minRating));
  }
  if (maxRating) {
    query += ' AND rating <= ?';
    params.push(parseFloat(maxRating));
  }

  query += ' ORDER BY rating DESC';

  db.all(query, params, (err, movies) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }

    res.json({ movies }); // ✅ MUST return like this
  });
});


// GET /api/movies/:id
router.get('/:id', (req, res) => {

  db.get('SELECT * FROM movies WHERE id = ?', [req.params.id], (err, movie) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found.' });
    }
    db.all(`
      SELECT r.*, u.username 
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.movie_id = ?
      ORDER BY r.created_at DESC
    `, [req.params.id], (err, reviews) => {

      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({ movie, reviews });
    });
  });

});
module.exports = router;