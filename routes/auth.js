
const express = require('express');
const router = express.Router();
const axios = require('axios');

// Step 1 — Merchant clicks "Connect Clover" 
router.get('/clover', (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.CLOVER_APP_ID,
    redirect_uri: `${process.env.APP_URL}/auth/callback`
  });
  res.redirect(`${process.env.CLOVER_API_BASE}/oauth/authorize?${params}`);
});

// Step 2 — Clover sends back an auth code, we exchange it for a token
router.get('/callback', async (req, res) => {
  const { code, merchant_id } = req.query;

  try {
    const response = await axios.get(`${process.env.CLOVER_API_BASE}/oauth/token`, {
      params: {
        client_id: process.env.CLOVER_APP_ID,
        client_secret: process.env.CLOVER_APP_SECRET,
        code
      }
    });

    const accessToken = response.data.access_token;

    // Store merchant token (we'll hook this to the database next)
    console.log(`Merchant ${merchant_id} connected. Token: ${accessToken}`);

    res.json({
      success: true,
      merchant_id,
      message: 'Clover connected successfully'
    });

  } catch (err) {
    console.error('Auth error:', err.message);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

module.exports = router;
