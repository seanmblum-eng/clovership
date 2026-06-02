const express = require('express');
const router = express.Router();
const axios = require('axios');

// Buy a label for a selected rate
router.post('/', async (req, res) => {
  const {
    shipment_id,
    rate_id,
    order_id,
    merchant_id,
    access_token
  } = req.body;

  try {
    // Buy the label via EasyPost REST API
    const response = await axios.post(
      `https://api.easypost.com/v2/shipments/${shipment_id}/buy`,
      { rate: { id: rate_id } },
      {
        auth: {
          username: process.env.EASYPOST_API_KEY,
          password: ''
        }
      }
    );

    const shipment = response.data;
    const trackingCode = shipment.tracking_code;
    const labelUrl = shipment.postage_label?.label_url;
    const carrier = shipment.selected_rate?.carrier;

    console.log('Label purchased:', trackingCode, carrier);

    // Write tracking back to Clover order
    if (merchant_id && access_token && order_id) {
      await axios.put(
        `${process.env.CLOVER_API_BASE}/v3/merchants/${merchant_id}/orders/${order_id}`,
        { state: 'locked', trackingNumber: trackingCode, carrier },
        { headers: { Authorization: `Bearer ${access_token}` } }
      );
    }

    res.json({
      success: true,
      tracking_number: trackingCode,
      carrier,
      label_url: labelUrl,
      message: 'Label purchased and tracking saved to Clover'
    });

  } catch (err) {
    console.error('Label error:', err.response ? JSON.stringify(err.response.data) : err.message);
    res.status(500).json({ error: 'Could not purchase label', detail: err.message });
  }
});

module.exports = router;
