const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

// 1. Universal CORS Handler
app.use((req, res, next) => {
  // Allow your specific frontend origin
  res.setHeader('Access-Control-Allow-Origin', 'https://thomaskoh1982.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Immediately respond to OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// 2. Working Test Endpoint
app.get('/cors-test', (req, res) => {
  res.json({
    status: 'CORS_SUCCESS',
    yourOrigin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// 3. Root Endpoint
//app.get('/', (req, res) => {
//  res.send('API_ROOT - Test CORS at /cors-test');
//});

// 4. Error Handling
app.use((req, res) => {
  res.status(404).json({ error: 'ENDPOINT_NOT_FOUND' });
});

module.exports = app;

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    sameSite: 'none',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

/* CORS Configuration
const allowedOrigins = [
  'https://thomaskoh1982.github.io',
  'http://localhost:3000' // For local testing
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  exposedHeaders: ['set-cookie']
}));


app.use(cors(corsOptions)); */// Use CORS middleware

// Middleware
app.use(express.json());

// Session middleware
app.use("/customer", session({
  secret: "fingerprint_customer",
  resave: true,
  saveUninitialized: true
}));

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
app.use("/", genl_routes);

// Root route
app.get('/', (req, res) => {
  res.send('<h1>Express Book Reviews API</h1>');
});

// Export for Vercel (required!)
module.exports = app;

// Local testing (Vercel ignores this)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Local server running on port ${PORT}`));
}
