const { v4: uuidv4 } = require('uuid');
const db = require('../database/db');

class Photo {
  static create(orderId, filePath, callback) {
    const id = uuidv4();

    const query = `INSERT INTO photos (id, order_id, file_path, uploaded_at)
                   VALUES (?, ?, ?, CURRENT_TIMESTAMP)`;

    db.run(query, [id, orderId, filePath], function(err) {
      if (err) callback(err);
      else callback(null, id);
    });
  }

  static getByOrderId(orderId, callback) {
    const query = `SELECT * FROM photos WHERE order_id = ? ORDER BY uploaded_at ASC`;
    db.all(query, [orderId], (err, rows) => {
      callback(err, rows);
    });
  }

  static delete(id, callback) {
    const query = `DELETE FROM photos WHERE id = ?`;
    db.run(query, [id], callback);
  }

  static getAll(callback) {
    const query = `SELECT * FROM photos ORDER BY uploaded_at DESC`;
    db.all(query, (err, rows) => {
      callback(err, rows);
    });
  }
}

module.exports = Photo;