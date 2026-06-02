require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/auth', require('./routes/auth'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/rates', require('./routes/rates'));
app.use('/api/labels', require('./routes/labels'));
app.use('/webhooks', require('./routes/webhooks'));

app.get('/', (req, res) => {
  res.json({ status: 'Handy Ship running' });
});

app.get('/checkout', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'checkout.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Port ' + PORT);
});

module.exports = app;
