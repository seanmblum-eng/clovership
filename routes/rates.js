const express = require('express');
const router = express.Router();
const EasyPostClient = require('@easypost/api');

router.post('/', async (req, res) => {
  const {
    to_name, to_street1, to_city, to_state,
    to_zip, to_country, weight_oz, length, width, height
  } = req.body;

  try {
    const client = new EasyPostClient(process.env.EASYPOST_API_KEY);

    const shipment = await client.Shipment.create({
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

    // Log full shipment object so we can see the structure
    console.log('Shipment keys:', Object.keys(shipment));
    console.log('Shipment rates:', JSON.stringify(shipment.rates));
    console.log('Shipment lowestRate:', shipment.lowestRate);

    // Try multiple ways to get rates
    const rates = shipment.rates
      || shipment.lowestRate
      || [];

    const ratesArray = Array.isArray(rates) ? rates : [rates];

    const sorted = ratesArray
      .filter(r => r && r.rate)
      .sort((a, b) => parseFloat(a.rate) - parseFloat(b.rate));

    console.log('Sorted rates count:', sorted.length);

    res.json({
      shipment_id: shipment.id,
      rates: sorted.map(r => ({
        id: r.id,
        carrier: r.carrier,
        service: r.service,
        rate: r.rate,
        delivery_days: r.delivery_days,
        delivery_date: r.delivery_date
      }))
    });

  } catch (err) {
    console.error('Rates error full:', err);
    res.status(500).json({ error: 'Could not fetch rates', detail: err.message });
  }
});

module.exports = router;
