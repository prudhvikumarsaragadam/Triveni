const { v4: uuidv4 } = require('uuid');
const db = require('../database/db');

class Order {
  static create(customerData, callback) {
    const id = uuidv4();
    const { customer_id, delivery_date, cutting_deadline, model_design, cost, notes, measurements } = customerData;
    
    const query = `INSERT INTO orders (id, customer_id, delivery_date, cutting_deadline, model_design, cost, notes, measurements)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.run(query, [id, customer_id, delivery_date, cutting_deadline, model_design, cost, notes, measurements ? JSON.stringify(measurements) : null], function(err) {
      if (err) callback(err);
      else callback(null, id);
    });
  }

  static getAll(callback) {
    const query = `SELECT o.*, c.name, c.phone, c.email,
                   GROUP_CONCAT(p.file_path, '|') as photos
                   FROM orders o
                   JOIN customers c ON o.customer_id = c.id
                   LEFT JOIN photos p ON o.id = p.order_id
                   GROUP BY o.id
                   ORDER BY o.delivery_date ASC`;
    db.all(query, (err, rows) => {
      if (err) callback(err, null);
      else {
        // Parse photos string into array
        const orders = rows.map(order => ({
          ...order,
          photos: order.photos ? order.photos.split('|') : [],
          measurements: order.measurements ? JSON.parse(order.measurements) : null
        }));
        callback(null, orders);
      }
    });
  }

  static getById(id, callback) {
    const query = `SELECT o.*, c.name, c.phone, c.email,
                   GROUP_CONCAT(p.file_path, '|') as photos
                   FROM orders o
                   JOIN customers c ON o.customer_id = c.id
                   LEFT JOIN photos p ON o.id = p.order_id
                   WHERE o.id = ?
                   GROUP BY o.id`;
    db.get(query, [id], (err, row) => {
      if (err) callback(err, null);
      else if (!row) callback(null, null);
      else {
        row.photos = row.photos ? row.photos.split('|') : [];
        row.measurements = row.measurements ? JSON.parse(row.measurements) : null;
        callback(null, row);
      }
    });
  }

  static updateStatus(id, status, callback) {
    const query = `UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    db.run(query, [status, id], callback);
  }

  static getQueue(callback) {
    const query = `SELECT o.*, c.name, c.phone 
                   FROM orders o
                   JOIN customers c ON o.customer_id = c.id
                   WHERE o.status NOT IN ('Delivered', 'Cancelled')
                   ORDER BY o.delivery_date ASC, o.order_date ASC`;
    db.all(query, (err, rows) => {
      callback(err, rows);
    });
  }
}

module.exports = Order;
