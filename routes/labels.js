const express = require('express');
const router = express.Router();
const EasyPost = require('@easypost/api');
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
    const client = new EasyPost(process.env.EASYPOST_API_KEY);

    // Buy the label
    const shipment = await client.Shipment.buy(shipment_id, rate_id);

    const trackingCode = shipment.tracking_code;
    const labelUrl = shipment.postage_label.label_url;
    const carrier = shipment.selected_rate.carrier;

    // Write tracking back to Clover order
    await axios.put(
      `${process.env.CLOVER_API_BASE}/v3/merchants/${merchant_id}/orders/${order_id}`,
      {
        state: 'locked',
        trackingNumber: trackingCode,
        carrier
      },
      {
        headers: { Authorization: `Bearer ${access_token}` }
      }
    );

    res.json({
      success: true,
      tracking_number: trackingCode,
      carrier,
      label_url: labelUrl,
      message: 'Label purchased and tracking saved to Clover'
    });

  } catch (err) {
    console.error('Label error:', err.message);
    res.status(500).json({ error: 'Could not purchase label' });
  }
});

module.exports = router;
