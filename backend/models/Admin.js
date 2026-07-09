const db = require('../database/db');

class Admin {
  static authenticate(username, password, callback) {
    const query = `SELECT * FROM admins WHERE username = ?`;
    db.get(query, [username], (err, row) => {
      if (err) {
        callback(err, null);
      } else if (row && row.password === password) {
        // Simple authentication (in production, use bcrypt for password hashing)
        callback(null, { id: row.id, username: row.username, name: row.name, email: row.email });
      } else {
        callback(null, null);
      }
    });
  }

  static getById(id, callback) {
    const query = `SELECT id, username, name, email FROM admins WHERE id = ?`;
    db.get(query, [id], (err, row) => {
      callback(err, row);
    });
  }
}

module.exports = Admin;
