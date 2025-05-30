const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
const books = require('./router/booksdb.js'); // Add at top of file

const app = express();

// Middleware ordering is crucial - session should come before routes
app.use(express.json());

// Session configuration - should be before CORS
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true, // should be true in production
    sameSite: 'none', // required for cross-site cookies
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// CORS configuration
const allowedOrigins = [
  'https://thomaskoh1982.github.io',
  'http://localhost:3000' // For local testing
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  exposedHeaders: ['set-cookie']
}));

// Test endpoint
app.get('/cors-test', (req, res) => {
  res.json({
    status: 'CORS_SUCCESS',
    yourOrigin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// Auth middleware
app.use("/customer/auth/*", (req, res, next) => {
  if (req.session.authorization) {
    const token = req.session.authorization['accessToken'];
    jwt.verify(token, "access", (err, user) => {
      if (err) return res.status(403).json({ message: "Unauthorized" });
      req.user = user;
      next();
    });
  } else {
    return res.status(403).json({ message: "Not logged in" });
  }
});

// Routes
app.use("/customer", customer_routes);

// Put this BEFORE the general routes
app.get('/', (req, res) => {
  res.json(books); // Make sure to require booksdb.js
});

app.use("/", genl_routes);

// Root route
/*app.get('/', (req, res) => {
  res.send('<h1>Express Book Reviews API</h1>');
});*/

// Error handling
app.use((req, res) => {
  res.status(404).json({ error: 'ENDPOINT_NOT_FOUND' });
});

// Export for Vercel
module.exports = app;

// Local testing
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Local server running on port ${PORT}`));
}
