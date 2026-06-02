const express = require('express');
const router = express.Router();
const axios = require('axios');

const carrierName = (c) => ({
  'UPSDAP': 'UPS', 'UPS': 'UPS', 'USPS': 'USPS',
  'FedExDefault': 'FedEx', 'FedEx': 'FedEx', 'FEDEX': 'FedEx',
  'DHLExpress': 'DHL', 'Stamps': 'USPS'
}[c] || c);

const serviceName = (s) => s
  .replace('GroundsaverGreaterThan1lb', 'Ground Saver')
  .replace('UPSGroundsaverGreaterThan1lb', 'Ground Saver')
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
