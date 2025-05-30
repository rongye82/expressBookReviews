const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

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
