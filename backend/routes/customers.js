const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');

// Create a new customer
router.post('/', (req, res) => {
  const { name, phone, email, address } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: 'name and phone are required' });
  }

  Customer.create({ name, phone, email, address }, (err, customerId) => {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ error: 'Phone number already exists' });
      }
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ success: true, customerId });
  });
});

// Get all customers
router.get('/', (req, res) => {
  Customer.getAll((err, customers) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(customers);
  });
});

// Get customer by ID
router.get('/:id', (req, res) => {
  Customer.getById(req.params.id, (err, customer) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  });
});

// Update customer
router.put('/:id', (req, res) => {
  const { name, phone, email, address } = req.body;

  Customer.update(req.params.id, { name, phone, email, address }, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, message: 'Customer updated' });
  });
});

module.exports = router;
