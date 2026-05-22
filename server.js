
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/rates', require('./routes/rates'));
app.use('/api/labels', require('./routes/labels'));
app.use('/webhooks', require('./routes/webhooks'));

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'CloverShip is running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`CloverShip running on port ${PORT}`);
});

module.exports = app;
