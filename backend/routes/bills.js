const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');

// Get bill by order ID
router.get('/order/:order_id', (req, res) => {
  Bill.getByOrderId(req.params.order_id, (err, bill) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }
    res.json(bill);
  });
});

// Update bill payment
router.patch('/:id/payment', (req, res) => {
  const { paid_amount, payment_status } = req.body;

  if (paid_amount === undefined || !payment_status) {
    return res.status(400).json({ error: 'paid_amount and payment_status are required' });
  }

  Bill.updatePayment(req.params.id, paid_amount, payment_status, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, message: 'Payment updated' });
  });
});

module.exports = router;
