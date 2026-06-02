require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());

// Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/rates', require('./routes/rates'));
app.use('/api/labels', require('./routes/labels'));
app.use('/webhooks', require('./routes/webhooks'));

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'Handy Ship is running' });
});

// Checkout page route
app.get('/checkout', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'checkout.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Handy Ship running on port ${PORT}`);
});

module.exports = app;
