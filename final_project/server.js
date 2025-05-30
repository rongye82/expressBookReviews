const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();
// ===== Middleware Setup =====
app.use(cors({
  origin: 'https://thomaskoh1982.github.io',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

app.use(express.json());

/*app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true, sameSite: 'none' }
}));*/

// ===== Route Mounting =====
// Mount general routes at root ("/")
//app.use('/', genl_routes);

// Mount authenticated routes under "/customer"
//app.use('/customer', customer_routes);

// ===== Error Handling =====
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
