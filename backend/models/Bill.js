const { v4: uuidv4 } = require('uuid');
const db = require('../database/db');

class Bill {
  static create(billData, callback) {
    const id = uuidv4();
    const { order_id, bill_number, amount } = billData;
    
    const query = `INSERT INTO bills (id, order_id, bill_number, amount)
                   VALUES (?, ?, ?, ?)`;
    
    db.run(query, [id, order_id, bill_number, amount], function(err) {
      if (err) callback(err);
      else callback(null, id);
    });
  }

  static getByOrderId(order_id, callback) {
    const query = `SELECT * FROM bills WHERE order_id = ?`;
    db.get(query, [order_id], (err, row) => {
      callback(err, row);
    });
  }

  static updatePayment(id, paid_amount, payment_status, callback) {
    const query = `UPDATE bills SET paid_amount = ?, payment_status = ? WHERE id = ?`;
    db.run(query, [paid_amount, payment_status, id], callback);
  }
}

module.exports = Bill;
