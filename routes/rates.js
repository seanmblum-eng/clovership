const express = require('express');
const router = express.Router();
const Easypost = require('@easypost/api');

router.post('/', async (req, res) => {
  const {
    to_name, to_street1, to_city, to_state,
    to_zip, to_country, weight_oz, length, width, height
  } = req.body;

  try {
    const api = new Easypost(process.env.EASYPOST_API_KEY);

    const shipment = await api.Shipment.create({
      from_address: {
        name: process.env.FROM_NAME,
        street1: process.env.FROM_STREET,
        city: process.env.FROM_CITY,
        state: process.env.FROM_STATE,
        zip: process.env.FROM_ZIP,
        country: 'US'
      },
      to_address: {
        name: to_name,
        street1: to_street1,
        city: to_city,
        state: to_state,
        zip: to_zip,
        country: to_country || 'US'
      },
      parcel: {
        length: length || 10,
        width: width || 8,
        height: height || 6,
        weight: weight_oz || 16
      }
    });

    console.log('Shipment id:', shipment.id);
    console.log('Rates:', JSON.stringify(shipment.rates));

    const rates = (shipment.rates || [])
      .filter(r => r && r.rate)
      .sort((a, b) => parseFloat(a.rate) - parseFloat(b.rate));

    res.json({
      shipment_id: shipment.id,
      rates: rates.map(r => ({
        id: r.id,
        carrier: r.carrier,
        service: r.service,
        rate: r.rate,
        delivery_days: r.delivery_days,
        delivery_date: r.delivery_date
      }))
    });

  } catch (err) {
    console.error('Rates error:', err.message);
    res.status(500).json({ error: 'Could not fetch rates', detail: err.message });
  }
});

module.exports = router;
