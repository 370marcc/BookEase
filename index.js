require('dotenv').config()
const express = require('express')
const bcrypt = require('bcrypt')
const session = require('express-session')
const db = require('./db')

const app = express()

app.use(express.static('public'))
app.use(express.json())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}))

// Register
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' })
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' })
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists.' })
  }

  const hashed = await bcrypt.hash(password, 10)
  const result = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)').run(name, email, hashed)

  req.session.userId = result.lastInsertRowid
  res.json({ name, email })
})

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
  if (!user) return res.status(401).json({ error: 'Incorrect email or password.' })

  const match = await bcrypt.compare(password, user.password)
  if (!match) return res.status(401).json({ error: 'Incorrect email or password.' })

  req.session.userId = user.id
  res.json({ name: user.name, email: user.email })
})

// Check current session (so the frontend knows if you're logged in on page reload)
app.get('/api/me', (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Not logged in.' })
  const user = db.prepare('SELECT name, email FROM users WHERE id = ?').get(req.session.userId)
  res.json(user)
})

// Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ success: true }))
})

// Middleware — require login for booking routes
function requireAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'Please log in first.' })
  next()
}

// Create a booking
app.post('/api/bookings', requireAuth, (req, res) => {
  const { service_name, price, duration, booking_date, booking_time } = req.body
  if (!service_name || !price || !booking_date || !booking_time) {
    return res.status(400).json({ error: 'Missing booking details.' })
  }

  const result = db.prepare(`
    INSERT INTO bookings (user_id, service_name, price, duration, booking_date, booking_time)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(req.session.userId, service_name, price, duration, booking_date, booking_time)

  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(result.lastInsertRowid)
  res.json(booking)
})

// Get all bookings for the logged-in user
app.get('/api/bookings', requireAuth, (req, res) => {
  const bookings = db.prepare(`
    SELECT * FROM bookings WHERE user_id = ? ORDER BY booking_date DESC, booking_time DESC
  `).all(req.session.userId)
  res.json(bookings)
})

// Cancel a booking
app.patch('/api/bookings/:id/cancel', requireAuth, (req, res) => {
  const booking = db.prepare('SELECT * FROM bookings WHERE id = ? AND user_id = ?').get(req.params.id, req.session.userId)
  if (!booking) return res.status(404).json({ error: 'Booking not found.' })

  db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run('cancelled', req.params.id)
  res.json({ success: true })
})

app.listen(3000, () => console.log('Server running on http://localhost:3000'))