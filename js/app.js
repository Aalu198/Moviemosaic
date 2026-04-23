// ─── STATE ────────────────────────────────────────────────────────────────────
const State = {
  user: null,
  movies: [],
  currentPage: 'home',
  selectedMovie: null,
  bookingMovie: null,
  selectedCoupon: null,
  quizAnswers: [],
  quizStep: 0,
  profileTab: 'bookings',
};

// ─── QUIZ DATA ─────────────────────────────────────────────────────────────────
const QUIZ = [
  {
    q: "What's your ideal Friday night?",
    opts: [
      { emoji: '🎢', text: 'Full of adrenaline & surprises', val: 'action' },
      { emoji: '😂', text: 'Laughing until my stomach hurts', val: 'comedy' },
      { emoji: '💕', text: 'Cozy & romantic vibes', val: 'romance' },
      { emoji: '🧩', text: 'Something that makes me think', val: 'thriller' },
    ]
  },
  {
    q: "Pick your dream vacation destination:",
    opts: [
      { emoji: '🏔️', text: 'Remote mountains — raw adventure', val: 'action' },
      { emoji: '🌴', text: 'Beach resort with cocktails', val: 'comedy' },
      { emoji: '🏯', text: 'Historic European city', val: 'drama' },
      { emoji: '🚀', text: 'Space — if it were possible', val: 'scifi' },
    ]
  },
  {
    q: "Your favorite storytelling element is:",
    opts: [
      { emoji: '💥', text: 'Epic set pieces & spectacle', val: 'action' },
      { emoji: '🎭', text: 'Complex characters & nuance', val: 'drama' },
      { emoji: '🔮', text: 'Imagination & world-building', val: 'fantasy' },
      { emoji: '🕵️', text: 'Mystery & unpredictable twists', val: 'thriller' },
    ]
  },
  {
    q: "How do you prefer your movie endings?",
    opts: [
      { emoji: '🎉', text: 'Happy & satisfying — always', val: 'comedy' },
      { emoji: '😢', text: 'Emotional & bittersweet', val: 'drama' },
      { emoji: '💡', text: 'Thought-provoking & open-ended', val: 'thriller' },
      { emoji: '🔥', text: 'Explosive & jaw-dropping', val: 'action' },
    ]
  },
  {
    q: "Pick a film era you love most:",
    opts: [
      { emoji: '🎞️', text: 'Golden age classics (50s–70s)', val: 'drama' },
      { emoji: '📼', text: 'Blockbuster era (80s–90s)', val: 'action' },
      { emoji: '🌐', text: 'Modern prestige cinema (2000s+)', val: 'thriller' },
      { emoji: '✨', text: 'Doesn\'t matter — just quality', val: 'fantasy' },
    ]
  },
];

const PERSONALITY_MAP = {
  action: { type: 'THE MAVERICK', desc: 'You live for heart-pounding thrills, explosive action, and heroes who never give up. You want your movies big, bold, and breathless.', genres: ['Action', 'Thriller', 'Adventure'] },
  comedy: { type: 'THE JESTER', desc: "Life is too short to be serious. You seek joy, laughter, and warmth in cinema — movies that leave you smiling long after the credits roll.", genres: ['Comedy', 'Romance', 'Drama'] },
  drama: { type: 'THE SAGE', desc: 'You appreciate depth, humanity, and stories that illuminate the human condition. You want characters who feel real and stories that linger.', genres: ['Drama', 'Biography', 'History'] },
  thriller: { type: 'THE DETECTIVE', desc: "Your mind never stops working. You love puzzles, twists, and the thrill of figuring things out before the movie reveals them.", genres: ['Thriller', 'Mystery', 'Crime'] },
  fantasy: { type: 'THE DREAMER', desc: "Reality is a canvas — and movies are your escape to extraordinary worlds. You love spectacle, magic, and imagination without limits.", genres: ['Fantasy', 'Sci-Fi', 'Adventure'] },
  scifi: { type: 'THE VISIONARY', desc: "You think about the future, humanity, and big questions. Science fiction is your playground — the bigger the ideas, the better.", genres: ['Sci-Fi', 'Fantasy', 'Thriller'] },
  romance: { type: 'THE ROMANTIC', desc: "You believe in the power of connection and emotion. Movies that make you feel deeply are the ones you treasure forever.", genres: ['Romance', 'Drama', 'Comedy'] },
};

// ─── DOM HELPERS ──────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; };

// ─── TOAST ────────────────────────────────────────────────────────────────────
function toast(msg, type = 'info', duration = 3500) {
  const icons = { success: '✅', error: '❌', info: '🎬' };
  const container = $('toast-container');
  const t = el('div', `toast ${type}`);
  t.innerHTML = `<span class="toast-icon">${icons[type]}</span><span class="toast-text">${msg}</span>`;
  container.appendChild(t);
  setTimeout(() => { t.classList.add('hiding'); setTimeout(() => t.remove(), 300); }, duration);
}

// ─── API ──────────────────────────────────────────────────────────────────────
async function api(method, path, body) {
  const opts = { method, headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin' };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch('/api' + path, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// ─── NAVIGATION ───────────────────────────────────────────────────────────────
function navigate(page) {
  State.currentPage = page;
  $$('.page-section').forEach(s => s.classList.remove('active'));
  const section = $(`page-${page}`);
  if (section) {
    section.classList.add('active');
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  $$('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.dataset.page === page);
  });
  closeMobileNav();
  // Load page-specific data
  if (page === 'movies') loadMovies();
  if (page === 'profile') { if (!State.user) { showAuth(); return; } loadProfile(); }
  if (page === 'quiz') renderQuiz();
}

function closeMobileNav() {
  $('mobile-nav').classList.remove('open');
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
async function checkAuth() {
  try {
    const data = await api('GET', '/auth/me');
    State.user = data.user;
    updateAuthUI();
  } catch {
    State.user = null;
    updateAuthUI();
  }
}

function updateAuthUI() {
  const nav = $('nav-auth-area');
  if (State.user) {
    nav.innerHTML = `
      <span style="font-size:13px;color:var(--text-muted);margin-right:4px">👋 ${State.user.username}</span>
      <button class="btn btn-outline btn-sm" onclick="navigate('profile')">Profile</button>
      <button class="btn btn-ghost btn-sm" onclick="doLogout()">Logout</button>
    `;
  } else {
    nav.innerHTML = `
      <button class="btn btn-outline btn-sm" onclick="showAuth('login')">Login</button>
      <button class="btn btn-gold btn-sm" onclick="showAuth('signup')">Sign Up</button>
    `;
  }
}

function showAuth(tab = 'login') {
  $('auth-modal-overlay').classList.add('active');
  switchAuthTab(tab);
}
function hideAuth() { $('auth-modal-overlay').classList.remove('active'); }
function switchAuthTab(tab) {
  $$('.auth-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  $('login-form').style.display = tab === 'login' ? 'block' : 'none';
  $('signup-form').style.display = tab === 'signup' ? 'block' : 'none';
}

async function doLogin(e) {
  e.preventDefault();
  const email = $('login-email').value;
  const password = $('login-password').value;
  const errEl = $('login-error');
  errEl.textContent = '';
  try {
    const data = await api('POST', '/auth/login', { email, password });
    State.user = data.user;
    updateAuthUI();
    hideAuth();
    toast(`Welcome back, ${data.user.username}! 🎬`, 'success');
  } catch (err) {
    errEl.textContent = err.message;
  }
}

async function doSignup(e) {
  e.preventDefault();
  const username = $('signup-username').value;
  const email = $('signup-email').value;
  const password = $('signup-password').value;
  const errEl = $('signup-error');
  errEl.textContent = '';
  if (password.length < 6) { errEl.textContent = 'Password must be at least 6 characters.'; return; }
  try {
    const data = await api('POST', '/auth/signup', { username, email, password });
    State.user = data.user;
    updateAuthUI();
    hideAuth();
    toast(`Welcome to MovieMosaic, ${data.user.username}! 🎉`, 'success');
  } catch (err) {
    errEl.textContent = err.message;
  }
}

async function doLogout() {
  await api('POST', '/auth/logout');
  State.user = null;
  updateAuthUI();
  if (State.currentPage === 'profile') navigate('home');
  toast('Logged out. See you soon! 👋', 'info');
}

// ─── MOVIES ───────────────────────────────────────────────────────────────────
async function loadMovies(triggerAI = false) {
  const grid = $('movies-grid');
  grid.innerHTML = '<div class="loader"><div class="spinner"></div></div>';
  try {
    const params = new URLSearchParams();
    const search = $('movie-search')?.value;
    const genre = $('movie-genre-filter')?.value;
    const industry = $('movie-industry-filter')?.value;
    const rating = $('movie-rating-filter')?.value;
    if (search) params.set('search', search);
    if (genre) params.set('genre', genre);
    if (industry) params.set('industry', industry);
    if (rating) params.set('minRating', rating);
    const data = await api('GET', `/movies?${params}`);
    State.movies = data.movies;

    // If we have AI movies cached, include them (applying client-side filters)
    let aiMovies = State.aiMovies || [];
    if (search) aiMovies = aiMovies.filter(m => m.title.toLowerCase().includes(search.toLowerCase()));
    if (genre) aiMovies = aiMovies.filter(m => m.genre.toLowerCase().includes(genre.toLowerCase()));
    if (industry) aiMovies = aiMovies.filter(m => m.industry === industry);
    if (rating) aiMovies = aiMovies.filter(m => m.rating >= parseFloat(rating));

    const combined = [...data.movies, ...aiMovies];
    renderMovieGrid(combined, aiMovies.length > 0);

    // First time loading movies — trigger AI expansion
    if (!State.aiLibraryLoaded) {
      State.aiLibraryLoaded = true;
      loadAIMovies();
    }
  } catch (err) {
    grid.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><h3>Error loading movies</h3><p>${err.message}</p></div>`;
  }
}

function renderMovieGrid(movies, includesAI = false) {
  const grid = $('movies-grid');
  if (!movies.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">🎬</div><h3>No movies found</h3><p>Try adjusting your filters</p></div>`;
    return;
  }
  grid.innerHTML = movies.map(m => `
    <div class="movie-card fade-in" onclick="showMovieDetail(${m.id})">
      <div class="movie-card-poster">
        <img src="${m.poster}" alt="${m.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/220x330/1a1a26/8a8799?text=${encodeURIComponent(m.title)}'">
        <span class="movie-industry-badge ${m.industry === 'Bollywood' ? 'bollywood' : ''}">${m.industry}</span>
        <span class="movie-rating-badge">${m.rating}</span>
        ${m.isAI ? `<span class="ai-movie-badge">✨ AI Pick</span>` : ''}
        <div class="movie-card-overlay">
          ${m.isAI
            ? `<button class="btn btn-outline btn-sm" onclick="event.stopPropagation();showMovieDetail(${m.id})">Details</button>`
            : `<button class="btn btn-gold btn-sm" onclick="event.stopPropagation();openBooking(${m.id})">Book</button>
               <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();openReviewModal(${m.id})">Review</button>`
          }
        </div>
      </div>
      <div class="movie-card-info">
        <div class="movie-card-title">${m.title}</div>
        <div class="movie-card-meta">
          <span>${m.year}</span>
          <span>•</span>
          <span>${m.duration}</span>
        </div>
        <div class="movie-card-genre">${m.genre}</div>
      </div>
    </div>
  `).join('');
}

async function showMovieDetail(movieId) {
  const data = await api('GET', `/movies/${movieId}`);
  const m = data.movie;
  const reviews = data.reviews;
  State.selectedMovie = m;

  const overlay = $('movie-detail-overlay');
  overlay.querySelector('.modal').innerHTML = `
    <button class="modal-close" onclick="closeMovieDetail()">×</button>
    <div class="movie-detail-header">
      <div class="movie-detail-poster">
        <img src="${m.poster}" alt="${m.title}" onerror="this.src='https://via.placeholder.com/140x210/1a1a26/8a8799?text=No+Image'">
      </div>
      <div class="movie-detail-meta">
        <div class="movie-detail-title">${m.title}</div>
        <div class="meta-row">
          <span class="meta-chip gold">★ ${m.rating}</span>
          <span class="meta-chip">📅 ${m.year}</span>
          <span class="meta-chip">⏱ ${m.duration}</span>
          <span class="meta-chip">🌐 ${m.language}</span>
        </div>
        <div class="meta-row">
          <span class="meta-chip">🎬 ${m.industry}</span>
          <span class="meta-chip">🎭 ${m.genre}</span>
        </div>
        <div class="movie-detail-desc">${m.description}</div>
        <div style="font-size:13px;color:var(--text-dim);margin-bottom:4px">🎥 Dir: <span style="color:var(--text-muted)">${m.director}</span></div>
        <div style="font-size:13px;color:var(--text-dim)">⭐ Cast: <span style="color:var(--text-muted)">${m.cast}</span></div>
      </div>
    </div>
    <div class="movie-detail-body">
      <div style="display:flex;gap:12px;margin-bottom:24px">
        <button class="btn btn-gold" onclick="closeMovieDetail();openBooking(${m.id})">🎟 Book Tickets</button>
        <button class="btn btn-outline" onclick="closeMovieDetail();openReviewModal(${m.id})">✍️ Write Review</button>
      </div>
      <div style="font-family:var(--font-display);font-size:20px;margin-bottom:16px;color:var(--text)">AUDIENCE REVIEWS</div>
      ${reviews.length ? reviews.map(r => `
        <div class="review-item">
          <div class="review-header">
            <div>
              <span style="font-weight:600;color:var(--text)">${r.username}</span>
              <div class="review-date">${new Date(r.created_at).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'})}</div>
            </div>
            <div class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div>
          </div>
          <div class="review-text">${r.review_text}</div>
        </div>
      `).join('') : '<div class="empty-state" style="padding:24px"><div class="empty-icon">💬</div><p>Be the first to review this movie!</p></div>'}
    </div>
  `;
  overlay.classList.add('active');
}
function closeMovieDetail() { $('movie-detail-overlay').classList.remove('active'); }

// ─── BOOKING ──────────────────────────────────────────────────────────────────
async function openBooking(movieId) {
  if (!State.user) { showAuth('login'); toast('Please login to book tickets', 'info'); return; }
  const movie = State.movies.find(m => m.id === movieId) || (await api('GET', `/movies/${movieId}`)).movie;
  State.bookingMovie = movie;
  State.selectedCoupon = null;

  const userCoupons = JSON.parse(State.user.coupons || '[]').filter(c => !c.used);

  $('booking-modal-overlay').querySelector('.modal').innerHTML = `
    <button class="modal-close" onclick="closeBooking()">×</button>
    <div class="booking-header">
      <div class="booking-movie-info">
        <div class="booking-poster"><img src="${movie.poster}" alt="${movie.title}" onerror="this.src='https://via.placeholder.com/60x90/1a1a26/8a8799'"></div>
        <div>
          <div class="booking-movie-title">${movie.title}</div>
          <div style="font-size:13px;color:var(--text-dim)">${movie.industry} • ★${movie.rating}</div>
        </div>
      </div>
    </div>
    <div style="padding:24px">
      <div class="form-group">
        <label class="form-label">Select City</label>
        <select class="form-select" id="book-location" onchange="updateBookingPrice()">
          <option value="">Choose your city...</option>
          ${['Mumbai','Delhi','Bangalore','Hyderabad','Chennai','Kolkata','Pune','Ahmedabad','Jaipur','Surat'].map(c=>`<option>${c}</option>`).join('')}
        </select>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Show Date</label>
          <input type="date" class="form-input" id="book-date" min="${new Date().toISOString().split('T')[0]}" onchange="updateBookingPrice()">
        </div>
        <div class="form-group">
          <label class="form-label">Show Time</label>
          <select class="form-select" id="book-time" onchange="updateBookingPrice()">
            <option value="">Select time</option>
            ${['10:00 AM','1:00 PM','4:00 PM','7:00 PM','10:00 PM'].map(t=>`<option>${t}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Number of Seats</label>
        <select class="form-select" id="book-seats" onchange="updateBookingPrice()">
          ${[1,2,3,4,5,6].map(n=>`<option value="${n}">${n} Seat${n>1?'s':''}</option>`).join('')}
        </select>
      </div>
      ${userCoupons.length ? `
        <div class="form-group">
          <label class="form-label">Apply Coupon</label>
          <div class="coupon-list">
            ${userCoupons.map(c => `
              <div class="coupon-item" id="coupon-${c.code}" onclick="selectCoupon('${c.code}',${c.discount})">
                <div>
                  <div class="coupon-code">${c.code}</div>
                  <div style="font-size:12px;color:var(--text-dim)">${c.label}</div>
                </div>
                <span class="coupon-discount">-${c.discount}%</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
      <div class="booking-price-preview" id="booking-price-preview">
        <div class="price-row"><span>Base Price</span><span>₹250 × 1</span></div>
        <div class="price-row total"><span>Total</span><span id="booking-total">₹250</span></div>
      </div>
      <div id="booking-error" class="form-err-banner" style="display:none;margin-top:12px"></div>
      <button class="btn btn-gold" style="width:100%;justify-content:center;margin-top:16px" onclick="confirmBooking()">🎟 Confirm Booking</button>
    </div>
  `;
  $('booking-modal-overlay').classList.add('active');
}

function selectCoupon(code, discount) {
  if (State.selectedCoupon === code) {
    State.selectedCoupon = null;
    document.getElementById(`coupon-${code}`)?.classList.remove('selected');
  } else {
    $$('.coupon-item').forEach(i => i.classList.remove('selected'));
    State.selectedCoupon = code;
    document.getElementById(`coupon-${code}`)?.classList.add('selected');
  }
  updateBookingPrice();
}

function updateBookingPrice() {
  const seats = parseInt($('book-seats')?.value || 1);
  const subtotal = 250 * seats;
  const discount = State.selectedCoupon ? JSON.parse(State.user.coupons || '[]').find(c => c.code === State.selectedCoupon)?.discount || 0 : 0;
  const total = subtotal - (subtotal * discount / 100);
  const preview = $('booking-price-preview');
  if (preview) {
    preview.innerHTML = `
      <div class="price-row"><span>₹250 × ${seats} seat${seats>1?'s':''}</span><span>₹${subtotal}</span></div>
      ${discount ? `<div class="price-row"><span>Discount (${discount}%)</span><span class="discount">-₹${(subtotal*discount/100).toFixed(0)}</span></div>` : ''}
      <div class="price-row total"><span>Total</span><span id="booking-total">₹${total.toFixed(0)}</span></div>
    `;
  }
}

async function confirmBooking() {
  const location = $('book-location')?.value;
  const show_date = $('book-date')?.value;
  const show_time = $('book-time')?.value;
  const seats = $('book-seats')?.value;
  const errEl = $('booking-error');
  errEl.style.display = 'none';

  if (!location || !show_date || !show_time) {
    errEl.textContent = 'Please fill all booking details.';
    errEl.style.display = 'block';
    return;
  }
  try {
    const data = await api('POST', '/bookings', {
      movie_id: State.bookingMovie.id,
      movie_title: State.bookingMovie.title,
      location, show_date, show_time,
      seats: parseInt(seats),
      coupon_code: State.selectedCoupon
    });
    closeBooking();
    // refresh user coupons
    const me = await api('GET', '/auth/me');
    State.user = me.user;
    updateAuthUI();
    toast(`🎉 Booked! ${seats} seat(s) for ${State.bookingMovie.title} in ${location}`, 'success', 5000);
  } catch (err) {
    errEl.textContent = err.message;
    errEl.style.display = 'block';
  }
}
function closeBooking() { $('booking-modal-overlay').classList.remove('active'); State.selectedCoupon = null; }

// ─── REVIEW MODAL ─────────────────────────────────────────────────────────────
function openReviewModal(movieId) {
  if (!State.user) { showAuth('login'); toast('Please login to write a review', 'info'); return; }
  const movie = State.movies.find(m => m.id === movieId) || { id: movieId, title: 'Movie' };
  $('review-modal-overlay').querySelector('.modal').innerHTML = `
    <button class="modal-close" onclick="closeReviewModal()">×</button>
    <div style="padding:32px">
      <div style="font-family:var(--font-display);font-size:28px;margin-bottom:4px">WRITE A REVIEW</div>
      <div style="font-family:var(--font-serif);font-style:italic;color:var(--text-muted);margin-bottom:24px">${movie.title}</div>
      <div id="review-success" style="display:none" class="form-success"></div>
      <div id="review-error" style="display:none" class="form-err-banner"></div>
      <div class="form-group">
        <label class="form-label">Your Rating</label>
        <div class="star-rating" id="star-rating">
          ${[5,4,3,2,1].map(n => `
            <input type="radio" name="star" id="star${n}" value="${n}">
            <label for="star${n}" title="${n} stars">★</label>
          `).join('')}
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Your Review</label>
        <textarea class="form-textarea" id="review-text" placeholder="Share your thoughts about this movie..." rows="4"></textarea>
      </div>
      <button class="btn btn-gold" style="width:100%;justify-content:center" onclick="submitReview(${movie.id},'${movie.title.replace(/'/g,"\\'")}')">Submit Review</button>
    </div>
  `;
  $('review-modal-overlay').classList.add('active');
}
function closeReviewModal() { $('review-modal-overlay').classList.remove('active'); }

async function submitReview(movieId, movieTitle) {
  const ratingEl = document.querySelector('input[name="star"]:checked');
  const reviewText = $('review-text')?.value?.trim();
  const errEl = $('review-error');
  const sucEl = $('review-success');
  errEl.style.display = 'none';

  if (!ratingEl || !reviewText) {
    errEl.textContent = 'Please select a rating and write your review.';
    errEl.style.display = 'block';
    return;
  }
  try {
    const data = await api('POST', '/reviews', { movie_id: movieId, movie_title: movieTitle, rating: parseInt(ratingEl.value), review_text: reviewText });
    sucEl.textContent = `✅ Review submitted! You've written ${data.reviewsCount} review(s).`;
    sucEl.style.display = 'block';
    if (data.newCoupon) {
      toast(`🎁 Coupon unlocked: ${data.newCoupon.code} — ${data.newCoupon.label}!`, 'success', 6000);
      const me = await api('GET', '/auth/me');
      State.user = me.user;
      updateAuthUI();
    } else {
      toast('Review submitted!', 'success');
    }
    setTimeout(() => closeReviewModal(), 2000);
  } catch (err) {
    errEl.textContent = err.message;
    errEl.style.display = 'block';
  }
}

// ─── QUIZ ─────────────────────────────────────────────────────────────────────
function renderQuiz() {
  State.quizStep = 0;
  State.quizAnswers = [];
  renderQuizStep();
}

function renderQuizStep() {
  const container = $('quiz-container');
  if (State.quizStep >= QUIZ.length) { renderQuizResult(); return; }
  const q = QUIZ[State.quizStep];
  const pct = ((State.quizStep) / QUIZ.length * 100).toFixed(0);

  container.innerHTML = `
    <div class="quiz-progress">
      <div class="quiz-progress-bar"><div class="quiz-progress-fill" style="width:${pct}%"></div></div>
      <div class="quiz-progress-label">${State.quizStep + 1} / ${QUIZ.length}</div>
    </div>
    <div class="quiz-question">"${q.q}"</div>
    <div class="quiz-options">
      ${q.opts.map((o, i) => `
        <button class="quiz-option" onclick="answerQuiz('${o.val}',this)">
          <span class="option-emoji">${o.emoji}</span>
          ${o.text}
        </button>
      `).join('')}
    </div>
  `;
}

function answerQuiz(val, btn) {
  $$('.quiz-option').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  State.quizAnswers.push(val);
  setTimeout(() => {
    State.quizStep++;
    renderQuizStep();
  }, 400);
}

async function renderQuizResult() {
  const freq = {};
  State.quizAnswers.forEach(a => freq[a] = (freq[a]||0)+1);
  const top = Object.entries(freq).sort((a,b)=>b[1]-a[1])[0][0];
  const result = PERSONALITY_MAP[top] || PERSONALITY_MAP.action;

  // Show loading state while AI generates
  $('quiz-container').innerHTML = `
    <div class="quiz-result fade-in" style="text-align:center;padding:20px 0">
      <div style="font-size:14px;color:var(--text-dim);margin-bottom:8px;letter-spacing:0.1em;text-transform:uppercase">Your movie personality is</div>
      <div class="quiz-result-type">${result.type}</div>
      <div class="quiz-result-desc">${result.desc}</div>
      <div style="margin:32px auto;max-width:360px">
        <div class="ai-thinking">
          <div class="ai-thinking-dots"><span></span><span></span><span></span></div>
          <div style="font-size:13px;color:var(--text-muted);margin-top:12px">✨ AI is curating your perfect watchlist...</div>
        </div>
      </div>
    </div>
  `;

  try {
    const existingTitles = State.movies.map(m => m.title);
    const data = await fetch('/api/ai/quiz-recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personalityType: result.type,
        personalityDesc: result.desc,
        quizAnswers: State.quizAnswers,
        existingMovies: existingTitles,
      })
    }).then(r => r.json());

    if (!data.success) throw new Error(data.error);
    renderAIQuizResult(result, data.data);
  } catch (err) {
    // Fallback to basic result
    let recMovies = State.movies.filter(m => m.genre.includes(result.genres[0]) || m.genre.includes(result.genres[1])).slice(0,4);
    if (!recMovies.length) recMovies = State.movies.slice(0,4);
    $('quiz-container').innerHTML = `
      <div class="quiz-result fade-in">
        <div style="font-size:14px;color:var(--text-dim);margin-bottom:8px;letter-spacing:0.1em;text-transform:uppercase">Your movie personality is</div>
        <div class="quiz-result-type">${result.type}</div>
        <div class="quiz-result-desc">${result.desc}</div>
        <div style="font-size:13px;color:var(--text-muted);margin-bottom:12px;text-transform:uppercase;letter-spacing:0.08em">Recommended For You</div>
        <div class="quiz-result-movies">${recMovies.map(m => `<div class="rec-movie-chip" onclick="showMovieDetail(${m.id})" style="cursor:pointer">🎬 ${m.title}</div>`).join('')}</div>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
          <button class="btn btn-gold" onclick="renderQuiz()">Retake Quiz</button>
          <button class="btn btn-outline" onclick="navigate('movies')">Browse Movies</button>
          ${State.user ? `<button class="btn btn-ghost" onclick="savePersonality('${result.type}')">Save to Profile</button>` : ''}
        </div>
      </div>
    `;
  }
}

function renderAIQuizResult(result, aiData) {
  const recs = aiData.recommendations || [];
  $('quiz-container').innerHTML = `
    <div class="quiz-result fade-in">
      <div style="font-size:14px;color:var(--text-dim);margin-bottom:8px;letter-spacing:0.1em;text-transform:uppercase">Your movie personality is</div>
      <div class="quiz-result-type">${result.type}</div>

      <!-- AI Insight Cards -->
      <div class="ai-insight-grid">
        <div class="ai-insight-card">
          <div class="ai-insight-icon">🎭</div>
          <div class="ai-insight-label">Your Cinematic Soul</div>
          <div class="ai-insight-text">${aiData.personalityInsight || result.desc}</div>
        </div>
        <div class="ai-insight-card">
          <div class="ai-insight-icon">🍿</div>
          <div class="ai-insight-label">Your Watching Style</div>
          <div class="ai-insight-text">${aiData.watchingStyle || 'You enjoy immersive, atmospheric viewing experiences.'}</div>
        </div>
      </div>

      <!-- AI Recommendations -->
      <div style="display:flex;align-items:center;gap:12px;margin:32px 0 16px">
        <div style="font-family:var(--font-display);font-size:22px;color:var(--text)">✨ AI PICKS FOR YOU</div>
        <div class="ai-badge">Powered by Claude</div>
      </div>
      <div class="ai-recs-grid">
        ${recs.map(m => `
          <div class="ai-rec-card">
            <div class="ai-rec-poster">
              <img src="${m.poster}" alt="${m.title}" onerror="this.src='https://via.placeholder.com/100x150/1a1a26/e8c97a?text=${encodeURIComponent(m.title)}'">
              <div class="ai-rec-rating">★ ${m.rating}</div>
            </div>
            <div class="ai-rec-info">
              <div class="ai-rec-title">${m.title} <span style="font-size:13px;color:var(--text-dim);font-family:var(--font-body)">(${m.year})</span></div>
              <div style="display:flex;gap:6px;flex-wrap:wrap;margin:6px 0">
                <span class="meta-chip" style="font-size:11px">${m.industry}</span>
                <span class="meta-chip" style="font-size:11px">${m.genre}</span>
              </div>
              <div class="ai-rec-why">"${m.whyThisFilm}"</div>
              <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;align-items:center">
                <span style="font-size:12px;color:var(--teal)">📺 ${m.streamingHint || 'Check availability'}</span>
              </div>
              <div style="font-size:11px;color:var(--gold);margin-top:6px;font-style:italic">${m.moodTag || ''}</div>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Hidden Gem -->
      ${aiData.hiddenGem ? `
        <div class="ai-hidden-gem">
          <div class="ai-hidden-gem-label">💎 AI'S HIDDEN GEM FOR YOU</div>
          <div class="ai-hidden-gem-title">${aiData.hiddenGem.title}</div>
          <div class="ai-hidden-gem-reason">${aiData.hiddenGem.reason}</div>
        </div>
      ` : ''}

      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:32px">
        <button class="btn btn-gold" onclick="renderQuiz()">🔄 Retake Quiz</button>
        <button class="btn btn-outline" onclick="navigate('movies')">Browse All Movies</button>
        ${State.user ? `<button class="btn btn-ghost" onclick="savePersonality('${result.type}')">💾 Save to Profile</button>` : ''}
      </div>
    </div>
  `;
}

// ─── AI LIBRARY EXPANSION ─────────────────────────────────────────────────────
async function loadAIMovies() {
  const banner = $('ai-movies-banner');
  if (banner) banner.style.display = 'flex';
  try {
    const existingTitles = State.movies.map(m => m.title);
    const res = await fetch('/api/ai/expand-library', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ existingTitles })
    });
    const data = await res.json();
    if (!data.success || !data.movies?.length) throw new Error('No movies returned');

    // Merge AI movies with existing, giving them negative fake IDs so they don't clash
    const aiMovies = data.movies.map((m, i) => ({
      ...m,
      id: -(i + 1),
      isAI: true,
    }));
    State.aiMovies = aiMovies;
    if (banner) banner.style.display = 'none';

    // Re-render grid with combined list
    const combined = [...State.movies, ...aiMovies];
    renderMovieGrid(combined, true);
    toast(`✨ AI added ${aiMovies.length} more movies to the library!`, 'success');
  } catch (err) {
    if (banner) banner.style.display = 'none';
    toast('Could not load AI movies right now.', 'error');
  }
}

// Override showMovieDetail to handle AI-only movies (no DB id)
const _originalShowMovieDetail = showMovieDetail;
async function showMovieDetail(movieId) {
  if (movieId < 0) {
    // AI movie — render from State.aiMovies
    const m = (State.aiMovies || []).find(x => x.id === movieId);
    if (!m) return;
    const overlay = $('movie-detail-overlay');
    overlay.querySelector('.modal').innerHTML = `
      <button class="modal-close" onclick="closeMovieDetail()">×</button>
      <div class="movie-detail-header">
        <div class="movie-detail-poster">
          <img src="${m.poster}" alt="${m.title}" onerror="this.src='https://via.placeholder.com/140x210/1a1a26/8a8799?text=No+Image'">
        </div>
        <div class="movie-detail-meta">
          <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(232,201,122,0.1);border:1px solid rgba(232,201,122,0.2);color:var(--gold);padding:3px 10px;border-radius:100px;font-size:11px;font-weight:700;margin-bottom:8px;letter-spacing:0.06em">✨ AI SUGGESTED</div>
          <div class="movie-detail-title">${m.title}</div>
          <div class="meta-row">
            <span class="meta-chip gold">★ ${m.rating}</span>
            <span class="meta-chip">📅 ${m.year}</span>
            <span class="meta-chip">⏱ ${m.duration}</span>
            <span class="meta-chip">🌐 ${m.language}</span>
          </div>
          <div class="meta-row">
            <span class="meta-chip">🎬 ${m.industry}</span>
            <span class="meta-chip">🎭 ${m.genre}</span>
          </div>
          <div class="movie-detail-desc">${m.description}</div>
          <div style="font-size:13px;color:var(--text-dim);margin-bottom:4px">🎥 Dir: <span style="color:var(--text-muted)">${m.director}</span></div>
          <div style="font-size:13px;color:var(--text-dim)">⭐ Cast: <span style="color:var(--text-muted)">${m.cast}</span></div>
        </div>
      </div>
      <div class="movie-detail-body">
        <div style="background:rgba(232,201,122,0.05);border:1px solid rgba(232,201,122,0.15);border-radius:var(--radius);padding:12px 16px;margin-bottom:16px;font-size:13px;color:var(--text-muted)">
          ✨ This movie was suggested by AI. It's not yet in the booking system — search for it on your favourite streaming platform!
        </div>
        <div style="font-family:var(--font-display);font-size:20px;margin-bottom:12px">WHERE TO WATCH</div>
        <div style="font-size:14px;color:var(--text-muted)">Search for <strong style="color:var(--text)">"${m.title}"</strong> on Netflix, Prime Video, Disney+, JioCinema, or your local cinema.</div>
      </div>
    `;
    overlay.classList.add('active');
    return;
  }
  return _originalShowMovieDetail(movieId);
}

async function savePersonality(type) {
  try {
    await api('POST', '/feedback/quiz', { personality_type: type });
    const me = await api('GET', '/auth/me');
    State.user = me.user;
    toast(`Personality saved: ${type}`, 'success');
  } catch { toast('Could not save personality', 'error'); }
}

// ─── PROFILE ──────────────────────────────────────────────────────────────────
async function loadProfile() {
  if (!State.user) return;
  // Update sidebar
  const initial = State.user.username[0].toUpperCase();
  $('profile-avatar').textContent = initial;
  $('profile-username').textContent = State.user.username;
  $('profile-email').textContent = State.user.email;
  const ptype = $('profile-personality-type');
  if (State.user.personality_type) { ptype.textContent = State.user.personality_type; ptype.style.display = 'inline-flex'; }
  else ptype.style.display = 'none';
  // Load active tab
  switchProfileTab(State.profileTab);
}

function switchProfileTab(tab) {
  State.profileTab = tab;
  $$('.profile-nav-item').forEach(i => i.classList.toggle('active', i.dataset.tab === tab));
  $$('.profile-panel').forEach(p => p.classList.remove('active'));
  const panel = $(`panel-${tab}`);
  if (panel) panel.classList.add('active');
  if (tab === 'bookings') loadBookings();
  if (tab === 'reviews') loadMyReviews();
  if (tab === 'coupons') loadCoupons();
}

async function loadBookings() {
  const container = $('bookings-list');
  container.innerHTML = '<div class="loader"><div class="spinner"></div></div>';
  try {
    const data = await api('GET', '/bookings');
    if (!data.bookings.length) {
      container.innerHTML = `<div class="empty-state"><div class="empty-icon">🎟</div><h3>No bookings yet</h3><p>Book a movie and your tickets will appear here!</p></div>`;
      return;
    }
    container.innerHTML = data.bookings.map(b => {
      const movie = State.movies.find(m => m.id === b.movie_id);
      return `
        <div class="booking-list-item">
          ${movie ? `<div class="booking-poster-sm"><img src="${movie.poster}" alt="${b.movie_title}" onerror="this.style.display='none'"></div>` : ''}
          <div class="booking-info">
            <div class="booking-title">${b.movie_title}</div>
            <div class="booking-meta">
              <span>📍 ${b.location}</span>
              <span>📅 ${new Date(b.show_date).toLocaleDateString('en-IN')}</span>
              <span>⏰ ${b.show_time}</span>
              <span>🪑 ${b.seats} seat${b.seats>1?'s':''}</span>
              ${b.coupon_used ? `<span style="color:var(--teal)">🏷 ${b.coupon_used}</span>` : ''}
            </div>
          </div>
          <span class="booking-status ${b.status}">${b.status}</span>
          <div class="booking-price">₹${b.total_price.toFixed(0)}</div>
          ${b.status === 'confirmed' ? `<button class="btn btn-danger btn-sm" onclick="cancelBooking(${b.id})">Cancel</button>` : ''}
        </div>
      `;
    }).join('');
  } catch (err) {
    container.innerHTML = `<p style="color:var(--crimson-light)">${err.message}</p>`;
  }
}

async function cancelBooking(id) {
  if (!confirm('Cancel this booking?')) return;
  try {
    await api('DELETE', `/bookings/${id}`);
    toast('Booking cancelled.', 'info');
    loadBookings();
  } catch (err) { toast(err.message, 'error'); }
}

async function loadMyReviews() {
  const container = $('reviews-list');
  container.innerHTML = '<div class="loader"><div class="spinner"></div></div>';
  try {
    const data = await api('GET', '/reviews/my');
    if (!data.reviews.length) {
      container.innerHTML = `<div class="empty-state"><div class="empty-icon">✍️</div><h3>No reviews yet</h3><p>Review movies to earn discount coupons!</p></div>`;
      return;
    }
    container.innerHTML = data.reviews.map(r => `
      <div class="review-item">
        <div class="review-header">
          <div>
            <div class="review-movie">${r.movie_title}</div>
            ${r.poster ? `<img src="${r.poster}" style="width:40px;border-radius:4px;margin-top:6px" onerror="this.style.display='none'">` : ''}
          </div>
          <div class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div>
        </div>
        <div class="review-text">${r.review_text}</div>
        <div class="review-date">${new Date(r.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</div>
      </div>
    `).join('');
  } catch (err) { container.innerHTML = `<p style="color:var(--crimson-light)">${err.message}</p>`; }
}

function loadCoupons() {
  const container = $('coupons-list');
  const coupons = JSON.parse(State.user?.coupons || '[]');
  if (!coupons.length) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">🎁</div><h3>No coupons yet</h3><p>Write reviews to earn discount coupons on bookings!</p><div style="margin-top:16px;font-size:13px;color:var(--text-dim)">
      <div style="margin-bottom:8px">✍️ <strong>1 review</strong> → CRITIC10 (10% off)</div>
      <div style="margin-bottom:8px">✍️ <strong>3 reviews</strong> → FAN20 (20% off)</div>
      <div>✍️ <strong>5 reviews</strong> → MOGUL30 (30% off)</div>
    </div></div>`;
    return;
  }
  container.innerHTML = `<div class="coupon-grid">${coupons.map(c => `
    <div class="coupon-card ${c.used ? 'used' : ''}">
      <div class="coupon-card-code">${c.code}</div>
      <div class="coupon-card-label">${c.label}</div>
      ${c.used ? '<div class="coupon-used-badge">USED</div>' : `<div style="font-size:11px;color:var(--teal);margin-top:6px;font-weight:600">${c.discount}% OFF</div>`}
    </div>
  `).join('')}</div>`;
}

// ─── FEEDBACK ─────────────────────────────────────────────────────────────────
// ─── FEEDBACK ─────────────────────────────────────────────────────────────────

// Toggle genre selection
function toggleGenre(el) {
  el.classList.toggle('checked');

  // Sync checkbox inside (if present)
  const checkbox = el.querySelector('input');
  if (checkbox) checkbox.checked = !checkbox.checked;

  console.log("Selected:", el.dataset.genre);
}


// Submit feedback
async function submitFeedback(e) {
  e.preventDefault();

  const name = $('fb-name').value.trim();
  const email = $('fb-email').value.trim();
  const platform_rating = $('fb-rating').value;
  const message = $('fb-message').value.trim();

  // ✅ Collect selected genres
  const checked = document.querySelectorAll('.genre-checkbox-label.checked');
  const genres = Array.from(checked).map(el => el.dataset.genre);

  const errEl = $('fb-error');
  const sucEl = $('fb-success');

  errEl.style.display = 'none';
  sucEl.style.display = 'none';

  // Validation
  if (!name || !email || !platform_rating || !message || genres.length === 0) {
    errEl.textContent = 'Please fill all fields and select at least one genre.';
    errEl.style.display = 'block';
    return;
  }

  try {
    await api('POST', '/feedback', {
      name,
      email,
      platform_rating: parseInt(platform_rating),
      genres,
      message
    });

    sucEl.textContent = '✅ Thank you for your feedback! We appreciate it.';
    sucEl.style.display = 'block';

    // Reset form
    e.target.reset();

    // Remove selected genres
    document.querySelectorAll('.genre-checkbox-label').forEach(el => {
      el.classList.remove('checked');
      const checkbox = el.querySelector('input');
      if (checkbox) checkbox.checked = false;
    });

    toast('Feedback submitted! Thank you 🙏', 'success');

  } catch (err) {
    errEl.textContent = err.message;
    errEl.style.display = 'block';
  }
}

// ─── AI CHAT WIDGET ───────────────────────────────────────────────────────────
const ChatState = { open: false, history: [], typing: false };

function toggleChat() {
  ChatState.open = !ChatState.open;
  $('ai-chat-panel').classList.toggle('open', ChatState.open);
  if (ChatState.open && ChatState.history.length === 0) {
    appendChatMessage('ai', "Hi! I'm Mosaic 🎬 — your AI film companion. Ask me anything: what to watch tonight, movie comparisons, hidden gems, or trivia. What's on your mind?");
  }
  if (ChatState.open) setTimeout(() => $('chat-input')?.focus(), 100);
}

function appendChatMessage(role, text) {
  const log = $('chat-log');
  const div = document.createElement('div');
  div.className = `chat-msg chat-msg-${role}`;
  div.textContent = text;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}

function showChatTyping() {
  const log = $('chat-log');
  const div = document.createElement('div');
  div.className = 'chat-msg chat-msg-ai chat-typing';
  div.id = 'chat-typing-indicator';
  div.innerHTML = '<span></span><span></span><span></span>';
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}
function hideChatTyping() { document.getElementById('chat-typing-indicator')?.remove(); }

async function sendChatMessage() {
  const input = $('chat-input');
  const msg = input.value.trim();
  if (!msg || ChatState.typing) return;
  input.value = '';
  appendChatMessage('user', msg);
  ChatState.history.push({ role: 'user', content: msg });
  ChatState.typing = true;
  showChatTyping();

  const userContext = State.user
    ? `User: ${State.user.username}. Personality: ${State.user.personality_type || 'unknown'}.`
    : null;

  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg, conversationHistory: ChatState.history.slice(-10), userContext })
    });
    const data = await res.json();
    hideChatTyping();
    const reply = data.reply || "I couldn't think of a response. Try again!";
    appendChatMessage('ai', reply);
    ChatState.history.push({ role: 'assistant', content: reply });
  } catch {
    hideChatTyping();
    appendChatMessage('ai', "Something went wrong. Please try again.");
  }
  ChatState.typing = false;
}

// ─── THEME ────────────────────────────────────────────────────────────────────
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next === 'dark' ? '' : 'light');
  $('theme-btn').textContent = next === 'dark' ? '☀️' : '🌙';
  localStorage.setItem('mm-theme', next);
}
function initTheme() {
  const saved = localStorage.getItem('mm-theme');
  if (saved === 'light') { document.documentElement.setAttribute('data-theme', 'light'); $('theme-btn').textContent = '🌙'; }
}

// ─── HERO FILM SHOWCASE ───────────────────────────────────────────────────────
async function loadHeroFilms() {
  try {
    const data = await api('GET', '/movies');
    State.movies = data.movies;
    const picks = data.movies.slice(0,6);
    const stack1 = $('hero-stack-1');
    const stack2 = $('hero-stack-2');
    if (stack1) stack1.innerHTML = picks.slice(0,3).map(m => `
      <div class="film-card-mini" onclick="showMovieDetail(${m.id});navigate('movies')" style="cursor:pointer">
        <img src="${m.poster}" alt="${m.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/160x240/1a1a26/8a8799'">
      </div>
    `).join('');
    if (stack2) stack2.innerHTML = picks.slice(3,6).map(m => `
      <div class="film-card-mini" onclick="showMovieDetail(${m.id});navigate('movies')" style="cursor:pointer">
        <img src="${m.poster}" alt="${m.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/160x240/1a1a26/8a8799'">
      </div>
    `).join('');
  } catch {}
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  await checkAuth();
  await loadHeroFilms();

  // Hamburger toggle
  $('hamburger').addEventListener('click', () => {
    $('mobile-nav').classList.toggle('open');
  });

  // Close modals on overlay click
  $$('.modal-overlay').forEach(o => {
    o.addEventListener('click', e => {
      if (e.target === o) {
        o.classList.remove('active');
        State.selectedCoupon = null;
      }
    });
  });

  // Movies filter events
  ['movie-search','movie-genre-filter','movie-industry-filter','movie-rating-filter'].forEach(id => {
    const el = $(id);
    if (el) el.addEventListener('input', () => { clearTimeout(el._t); el._t = setTimeout(loadMovies, 300); });
  });

  // Chat enter key
  $('chat-input')?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); }
  });

  // Scroll animation
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('fade-in'); });
  }, { threshold: 0.1 });
  $$('.observe').forEach(el => observer.observe(el));
});
let selectedGenres = [];

function toggleGenre(element) {
  const genre = element.getAttribute("data-genre");

  if (selectedGenres.includes(genre)) {
    selectedGenres = selectedGenres.filter(g => g !== genre);
    element.classList.remove("active");
  } else {
    selectedGenres.push(genre);
    element.classList.add("active");
  }

  console.log(selectedGenres); // debug
}