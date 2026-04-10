const { v4: uuidv4 } = require('uuid');
const db = require('../database/db');

class Customer {
  static create(customerData, callback) {
    const id = uuidv4();
    const { name, phone, email, address } = customerData;
    
    const query = `INSERT INTO customers (id, name, phone, email, address)
                   VALUES (?, ?, ?, ?, ?)`;
    
    db.run(query, [id, name, phone, email, address], function(err) {
      if (err) callback(err);
      else callback(null, id);
    });
  }

  static getAll(callback) {
    const query = `SELECT * FROM customers ORDER BY name ASC`;
    db.all(query, (err, rows) => {
      callback(err, rows);
    });
  }

  static getById(id, callback) {
    const query = `SELECT * FROM customers WHERE id = ?`;
    db.get(query, [id], (err, row) => {
      callback(err, row);
    });
  }

  static update(id, customerData, callback) {
    const { name, phone, email, address } = customerData;
    const query = `UPDATE customers SET name = ?, phone = ?, email = ?, address = ? WHERE id = ?`;
    db.run(query, [name, phone, email, address, id], callback);
  }
}

module.exports = Customer;
