const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'moviemosaic.db');
const db = new sqlite3.Database(dbPath);

// ─── CREATE TABLES ─────────────────────────────────────────
db.serialize(() => {

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      personality_type TEXT DEFAULT NULL,
      coupons TEXT DEFAULT '[]',
      reviews_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS movies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      genre TEXT,
      rating REAL,
      poster TEXT,
      description TEXT,
      year INTEGER,
      industry TEXT,
      duration TEXT,
      director TEXT,
      cast TEXT,
      language TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      movie_id INTEGER,
      movie_title TEXT,
      location TEXT,
      show_date TEXT,
      show_time TEXT,
      seats INTEGER,
      total_price REAL,
      coupon_used TEXT,
      discount REAL,
      status TEXT DEFAULT 'confirmed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      movie_id INTEGER,
      movie_title TEXT,
      rating INTEGER,
      review_text TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT,
      email TEXT,
      platform_rating INTEGER,
      genres TEXT,
      message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

});

// ─── SEED MOVIES ───────────────────────────────────────────

db.get("SELECT COUNT(*) as count FROM movies", (err, row) => {
  if (err) return console.error(err);

  if (row.count === 0) {

    const insert = db.prepare(`
      INSERT INTO movies 
      (title, genre, rating, poster, description, year, industry, duration, director, cast, language)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const movies = [
      ["Pathaan", "Action", 7.2, "/images/pathaan.jpeg", "RAW agent story", 2023, "Bollywood", "2h", "Siddharth Anand", "SRK", "Hindi"],
      ["Oppenheimer", "Drama", 8.9, "/images/oppen.jpeg", "Atomic bomb story", 2023, "Hollywood", "3h", "Christopher Nolan", "Cillian Murphy", "English"],
      ["RRR", "Action", 8.8, "/images/rrr.jpeg", "Freedom fighters story", 2022, "Tollywood", "3h", "SS Rajamouli", "NTR, Ram Charan", "Telugu"],
      ["Bahubali", "Action", 8.1, "/images/bahubali.jpg", "Epic kingdom saga", 2015, "Tollywood", "2h 30m", "SS Rajamouli", "Prabhas", "Telugu"],
      ["Jawan", "Action", 7.5, "/images/jawan.jpg", "Vigilante justice", 2023, "Bollywood", "2h 45m", "Atlee", "SRK", "Hindi"],
      ["3 Idiots", "Comedy", 8.4, "/images/3 idiots.jpeg", "Engineering life story", 2009, "Bollywood", "2h 50m", "Rajkumar Hirani", "Aamir Khan", "Hindi"],
      ["Dangal", "Drama", 8.3, "/images/dangal.jpg", "Wrestling journey", 2016, "Bollywood", "2h 40m", "Nitesh Tiwari", "Aamir Khan", "Hindi"],
      ["Interstellar", "Sci-Fi", 8.6, "/images/interstellar.jpeg", "Space exploration", 2014, "Hollywood", "2h 50m", "Christopher Nolan", "Matthew McConaughey", "English"],
      ["Inception", "Sci-Fi", 8.8, "/images/inception.jpeg", "Dream within dream", 2010, "Hollywood", "2h 30m", "Christopher Nolan", "Leonardo DiCaprio", "English"],
      ["The Dark Knight", "Action", 9.0, "/images/TDK.jpg", "Batman vs Joker", 2008, "Hollywood", "2h 32m", "Christopher Nolan", "Christian Bale", "English"],
      ["Fight Club", "Drama", 8.8, "/images/fightclub.jpg", "Underground fight club", 1999, "Hollywood", "2h 20m", "David Fincher", "Brad Pitt", "English"],
      ["ZNMD", "Drama", 8.2, "/images/znmd.jpg", "Friendship journey", 2011, "Bollywood", "2h 30m", "Zoya Akhtar", "Hrithik Roshan", "Hindi"],
      ["Kabir Singh", "Romance", 7.1, "/images/kabir singh.jpeg", "Intense love story", 2019, "Bollywood", "2h 50m", "Sandeep Reddy Vanga", "Shahid Kapoor", "Hindi"],
      ["The Conjuring", "Horror", 7.5, "/images/TheConjuring.jpeg", "Paranormal case", 2013, "Hollywood", "2h", "James Wan", "Patrick Wilson", "English"],
      ["Stree", "Horror", 7.6, "/images/stree.jpeg", "Horror comedy", 2018, "Bollywood", "2h", "Amar Kaushik", "Rajkummar Rao", "Hindi"],
      ["Drishyam", "Thriller", 8.2, "/images/drishyam.jpeg", "Crime cover-up", 2015, "Bollywood", "2h 45m", "Ajay Devgn", "Hindi"],
      ["Andhadhun", "Thriller", 8.2, "/images/andhadhun.jpeg", "Blind pianist mystery", 2018, "Bollywood", "2h 20m", "Sriram Raghavan", "Ayushmann Khurrana", "Hindi"],
      ["Dune", "Sci-Fi", 8.0, "/images/dune.jpeg", "Desert planet war", 2021, "Hollywood", "2h 35m", "Denis Villeneuve", "Timothée Chalamet", "English"],
      ["Barbie", "Comedy", 7.0, "/images/barbie.jpeg", "Fantasy comedy world", 2023, "Hollywood", "2h", "Greta Gerwig", "Margot Robbie", "English"],
      ["Shawshank Redemption", "Drama", 9.3, "/images/TSR.jpg", "Prison escape story", 1994, "Hollywood", "2h 22m", "Frank Darabont", "Tim Robbins", "English"]
    ];

    movies.forEach(movie => {
      insert.run(movie, (err) => {
        if (err) console.error(err);
      });
    });

    insert.finalize();
    console.log("✅ Movies seeded with images");
  }
});


module.exports = db;