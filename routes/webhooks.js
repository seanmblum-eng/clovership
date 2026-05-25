const express = require('express');
const router = express.Router();
const axios = require('axios');

// Clover webhook verification
router.get('/easypost', (req, res) => {
  const verificationCode = req.query.verification_code;
  if (verificationCode) {
    res.send(verificationCode);
  } else {
    res.json({ status: 'webhook endpoint active' });
  }
});

// EasyPost delivery webhook
router.post('/easypost', async (req, res) => {
  const event = req.body;

  try {
    const result = event.result;
    const status = result?.status;
    const trackingCode = result?.tracking_code;

    console.log(`Tracking event: ${trackingCode} — ${status}`);

    if (status === 'delivered') {
      const merchantId = result?.metadata?.merchant_id;
      const customerId = result?.metadata?.customer_id;
      const orderId = result?.metadata?.order_id;

      console.log(`Package delivered — Order ${orderId}, Customer ${customerId}`);

      if (merchantId && customerId) {
        await triggerReviewBoost(merchantId, customerId, orderId);
      }
    }

    res.json({ received: true });

  } catch (err) {
    console.error('Webhook error:', err.message);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

async function triggerReviewBoost(merchantId, customerId, orderId) {
  try {
    const reviewBoostUrl = process.env.REVIEWBOOST_URL;
    if (!reviewBoostUrl) {
      console.log('REVIEWBOOST_URL not set — skipping loyalty trigger');
      return;
    }
    await axios.post(`${reviewBoostUrl}/api/delivery-event`, {
      merchant_id: merchantId,
      customer_id: customerId,
      order_id: orderId,
      event: 'delivered'
    });
    console.log(`ReviewBoost triggered for customer ${customerId}`);
  } catch (err) {
    console.error('ReviewBoost trigger error:', err.message);
  }
}

module.exports = router;
