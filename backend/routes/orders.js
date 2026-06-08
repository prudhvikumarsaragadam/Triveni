const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Bill = require('../models/Bill');
const googleIntegration = require('../services/googleIntegration');

// Create a new order
router.post('/', (req, res) => {
  const { customer_id, delivery_date, cutting_deadline, model_design, cost, notes, measurements } = req.body;

  if (!customer_id || !delivery_date) {
    return res.status(400).json({ error: 'customer_id and delivery_date are required' });
  }

  Order.create({
    customer_id,
    delivery_date,
    cutting_deadline: cutting_deadline || null,
    model_design: model_design || '',
    cost: cost || 0,
    notes: notes || '',
    measurements: measurements || null
  }, (err, orderId) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Create bill
    const billNumber = `BL-${Date.now()}`;
    Bill.create({
      order_id: orderId,
      bill_number: billNumber,
      amount: cost || 0
    }, (billErr) => {
      if (billErr) console.error('Bill creation error:', billErr);
    });

    Order.getById(orderId, async (orderErr, order) => {
      let googleSync = { success: false, message: 'Google sync not attempted' };

      if (!orderErr && order) {
        try {
          googleSync = await googleIntegration.syncOrderToSheet(order);
        } catch (syncError) {
          console.error('Google sync error:', syncError.message);
          googleSync = { success: false, message: syncError.message };
        }
      }

      res.status(201).json({ success: true, orderId, billNumber, googleSync });
    });
  });
});

// Get all orders
router.get('/', (req, res) => {
  Order.getAll((err, orders) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(orders);
  });
});

// Get order by ID
router.get('/:id', (req, res) => {
  Order.getById(req.params.id, (err, order) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  });
});

// Get order queue (sorted by delivery date)
router.get('/queue/all', (req, res) => {
  Order.getQueue((err, orders) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(orders);
  });
});

// Update order status
router.patch('/:id/status', (req, res) => {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'status is required' });
  }

  Order.updateStatus(req.params.id, status, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, message: 'Order status updated' });
  });
});

module.exports = router;
