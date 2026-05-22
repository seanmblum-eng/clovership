
const express = require('express');
const router = express.Router();
const axios = require('axios');

// Get all open orders that need a shipping label
router.get('/', async (req, res) => {
  const { merchant_id, access_token } = req.query;

  try {
    const response = await axios.get(
      `${process.env.CLOVER_API_BASE}/v3/merchants/${merchant_id}/orders`,
      {
        headers: { Authorization: `Bearer ${access_token}` },
        params: {
          filter: 'paymentState=PAID',
          expand: 'lineItems,customers'
        }
      }
    );

    // Filter to only orders that have a shipping address
    const shippableOrders = response.data.elements.filter(
      order => order.shippingAddress
    );

    res.json({
      total: shippableOrders.length,
      orders: shippableOrders
    });

  } catch (err) {
    console.error('Orders fetch error:', err.message);
    res.status(500).json({ error: 'Could not fetch orders' });
  }
});

// Mark an order as shipped in Clover
router.put('/:orderId/ship', async (req, res) => {
  const { orderId } = req.params;
  const { merchant_id, access_token, tracking_number, carrier } = req.body;

  try {
    await axios.put(
      `${process.env.CLOVER_API_BASE}/v3/merchants/${merchant_id}/orders/${orderId}`,
      {
        state: 'locked',
        trackingNumber: tracking_number,
        carrier
      },
      {
        headers: { Authorization: `Bearer ${access_token}` }
      }
    );

    res.json({ success: true, message: 'Order marked as shipped' });

  } catch (err) {
    console.error('Order update error:', err.message);
    res.status(500).json({ error: 'Could not update order' });
  }
});

module.exports = router;
