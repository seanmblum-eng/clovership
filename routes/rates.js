const express = require('express');
const router = express.Router();
const axios = require('axios');

const carrierName = (c) => ({
  'UPSDAP': 'UPS', 'UPS': 'UPS', 'USPS': 'USPS',
  'FedExDefault': 'FedEx', 'FedEx': 'FedEx', 'FEDEX': 'FedEx',
  'DHLExpress': 'DHL', 'Stamps': 'USPS'
}[c] || c);

const serviceName = (s) => s
  .replace('UPSGroundsaverGreaterThan1lb', 'Ground Saver')
  .replace('GroundsaverGreaterThan1lb', 'Ground Saver')
  .replace('GroundAdvantage', 'Ground Advantage')
  .replace('SMART_POST', 'SmartPost')
  .replace('FEDEX_GROUND', 'Ground')
  .replace('FEDEX_EXPRESS_SAVER', 'Express Saver')
  .replace('FEDEX_2_DAY', '2 Day')
  .replace('STANDARD_OVERNIGHT', 'Standard Overnight')
  .replace('PRIORITY_OVERNIGHT', 'Priority Overnight')
  .replace('2ndDayAir', '2nd Day Air')
  .replace('NextDayAir', 'Next Day Air')
  .replace('3DaySelect', '3 Day Select')
  .replace(/_/g, ' ');

// Only show these clean service levels
const ALLOWED_SERVICES = [
  'GroundsaverGreaterThan1lb', 'UPSGroundsaverGreaterThan1lb',
  'Ground', 'GroundAdvantage',
  'Priority', 'FEDEX_GROUND',
  '3DaySelect', 'FEDEX_EXPRESS_SAVER',
  '2ndDayAir', 'FEDEX_2_DAY',
  'NextDayAir', 'PRIORITY_OVERNIGHT',
  'Express'
];

router.post('/', async (req, res) => {
  const {
    to_name, to_street1, to_city, to_state,
    to_zip, to_country, weight_oz, length, width, height
  } = req.body;

  try {
    const response = await axios.post(
      'https://api.easypost.com/v2/shipments',
      {
        shipment: {
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
        }
      },
      {
        auth: {
          username: process.env.EASYPOST_API_KEY,
          password: ''
        }
      }
    );

    const shipment = response.data;
    const rates = (shipment.rates || [])
      .filter(r => r && r.rate && ALLOWED_SERVICES.includes(r.service))
      .sort((a, b) => parseFloat(a.rate) - parseFloat(b.rate));

    res.json({
      shipment_id: shipment.id,
      rates: rates.map(r => ({
        id: r.id,
        carrier: carrierName(r.carrier),
        service: serviceName(r.service),
        rate: r.rate,
        retail_rate: r.retail_rate,
        delivery_days: r.delivery_days,
        delivery_date: r.delivery_date
      }))
    });

  } catch (err) {
    console.error('Rates error:', err.response ? JSON.stringify(err.response.data) : err.message);
    res.status(500).json({ error: 'Could not fetch rates', detail: err.message });
  }
});

module.exports = router;
