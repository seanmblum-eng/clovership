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
        heigh
