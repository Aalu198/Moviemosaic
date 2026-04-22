# 🎬 MovieMosaic

**MovieMosaic** is a full-stack movie recommendation and booking web application built with Node.js, Express, SQLite3, and vanilla HTML/CSS/JavaScript.

---

## ✨ Features

- **Personality Quiz** — 5-question quiz that maps your movie taste to a type (Maverick, Sage, Dreamer, etc.) with tailored recommendations
- **Movie Browser** — 16+ curated Bollywood & Hollywood films with search, genre, industry, and rating filters
- **Ticket Booking** — Book seats across 10 Indian cities with date/time/seat selection
- **Reward Coupons** — Write reviews to earn discount coupons (10%, 20%, 30% off)
- **User Auth** — Signup/login with sessions, profile dashboard
- **Movie Reviews** — Write and read audience reviews per movie
- **Platform Feedback** — Rate the platform and submit genre preferences
- **Dark/Light Mode** — Toggle with persistence via localStorage
- **Responsive** — Works on mobile, tablet, and desktop

---

## 🗂 Project Structure

```
moviemosaic/
├── server.js               # Express server entry point
├── package.json
├── db/
│   └── database.js         # SQLite3 schema + movie seed data
├── routes/
│   ├── auth.js             # Signup, login, logout, /me
│   ├── movies.js           # List & detail movies
│   ├── bookings.js         # Create, list, cancel bookings
│   ├── reviews.js          # Submit reviews + coupon logic
│   └── feedback.js         # Platform feedback + quiz save
└── public/
    ├── index.html          # Single Page Application
    ├── css/
    │   └── style.css       # Full styling (dark theme + light mode)
    └── js/
        └── app.js          # All frontend JS logic
```

---

## 🚀 Setup & Installation

### Prerequisites
- **Node.js** v16 or higher
- **npm** v7 or higher

### Steps

```bash
# 1. Navigate to the project folder
cd moviemosaic

# 2. Install dependencies
npm install

# 3. Start the server
npm start
```

The app will be live at **http://localhost:3000**

For development with auto-reload:
```bash
npm run dev   # requires nodemon (included as devDependency)
```

---

## 🗄 Database

MovieMosaic uses **SQLite3** (via `better-sqlite3`) — no external database setup required. The database file `moviemosaic.db` is auto-created in the `db/` directory on first run.

**Tables:**
| Table | Purpose |
|-------|---------|
| `users` | Auth, personality type, coupons, review count |
| `movies` | All seeded movie records |
| `bookings` | Ticket bookings per user |
| `reviews` | Movie reviews per user |
| `feedback` | Platform feedback submissions |

---

## 🎟 Coupon System

Users earn discount coupons by writing movie reviews:

| Reviews Written | Coupon Code | Discount |
|-----------------|-------------|---------|
| 1st review | `CRITIC10` | 10% off |
| 3rd review | `FAN20` | 20% off |
| 5th review | `MOGUL30` | 30% off |

Coupons can be applied at checkout during booking.

---

## 🎭 Personality Types

The quiz maps answers to 7 types:
- **THE MAVERICK** — Action & Thriller lover
- **THE JESTER** — Comedy & Romance fan
- **THE SAGE** — Drama & Biography aficionado
- **THE DETECTIVE** — Thriller & Mystery seeker
- **THE DREAMER** — Fantasy & Sci-Fi explorer
- **THE VISIONARY** — Sci-Fi & big ideas
- **THE ROMANTIC** — Romance & emotional depth

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/movies` | List movies (filters: search, genre, industry, minRating) |
| GET | `/api/movies/:id` | Movie detail + reviews |
| GET | `/api/bookings` | User's bookings |
| POST | `/api/bookings` | Create booking |
| DELETE | `/api/bookings/:id` | Cancel booking |
| POST | `/api/reviews` | Submit review |
| GET | `/api/reviews/my` | User's reviews |
| POST | `/api/feedback` | Submit platform feedback |
| POST | `/api/feedback/quiz` | Save personality type |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | HTML5, CSS3 (custom design system), Vanilla JS |
| Backend | Node.js, Express.js |
| Database | SQLite3 via `better-sqlite3` |
| Auth | `express-session` + `bcryptjs` |
| Fonts | Bebas Neue, Playfair Display, DM Sans |

---

## 📱 Responsive Design

- **Desktop** (1280px+): Full layout with hero film showcase
- **Tablet** (768–1024px): Adjusted grid, hidden sidebar overlay
- **Mobile** (<768px): Hamburger nav, stacked layouts, 2-column movie grid

---

## 🎨 Design System

- **Theme**: Cinematic dark (charcoal, grain overlay, gold accents)
- **Colors**: `--gold` (#e8c97a), `--crimson` (#c0392b), `--teal` (#1abc9c)
- **Fonts**: Display (Bebas Neue) + Serif (Playfair Display) + Body (DM Sans)
- **Animations**: CSS keyframe animations, smooth transitions, floating cards

---

*Built with 🎬 for cinema lovers.*
