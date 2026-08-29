const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'boutique.db');
let dbReady = false;

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    if (!process.env.JEST_WORKER_ID) console.log('Connected to SQLite database:', dbPath);
    dbReady = true;
  }
});

// Initialize database tables
const initializeDatabase = () => {
  db.serialize(() => {
    try {
      // Customers table
      db.run(`CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT UNIQUE NOT NULL,
        email TEXT,
        address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err && !err.message.includes('already exists')) {
          console.error('Error creating customers table:', err.message);
        }
      });

      // Orders table
      db.run(`CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        customer_id TEXT NOT NULL,
        order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        delivery_date DATE NOT NULL,
        cutting_deadline DATE,
        status TEXT DEFAULT 'Booked',
        model_design TEXT,
        cost REAL,
        notes TEXT,
        measurements TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(customer_id) REFERENCES customers(id)
      )`, (err) => {
        if (err && !err.message.includes('already exists')) {
          console.error('Error creating orders table:', err.message);
        }
      });

      // Ensure measurements column exists on older databases
      db.run(`ALTER TABLE orders ADD COLUMN measurements TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding measurements column:', err.message);
        }
      });

      // Bills table
      db.run(`CREATE TABLE IF NOT EXISTS bills (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        bill_number TEXT UNIQUE NOT NULL,
        amount REAL NOT NULL,
        paid_amount REAL DEFAULT 0,
        payment_status TEXT DEFAULT 'Pending',
        bill_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(order_id) REFERENCES orders(id)
      )`, (err) => {
        if (err && !err.message.includes('already exists')) {
          console.error('Error creating bills table:', err.message);
        }
      });

      // Photos table
      db.run(`CREATE TABLE IF NOT EXISTS photos (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        file_path TEXT,
        uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(order_id) REFERENCES orders(id)
      )`, (err) => {
        if (err && !err.message.includes('already exists')) {
          console.error('Error creating photos table:', err.message);
        }
      });

      // Quality Checklist table
      db.run(`CREATE TABLE IF NOT EXISTS quality_checklist (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        ironed BOOLEAN DEFAULT 0,
        lining_check BOOLEAN DEFAULT 0,
        stitching_check BOOLEAN DEFAULT 0,
        packaging_done BOOLEAN DEFAULT 0,
        final_notes TEXT,
        checked_at DATETIME,
        FOREIGN KEY(order_id) REFERENCES orders(id)
      )`, (err) => {
        if (err && !err.message.includes('already exists')) {
          console.error('Error creating quality_checklist table:', err.message);
        }
      });

      // Lining workflow table
      db.run(`CREATE TABLE IF NOT EXISTS lining_workflow (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        lining_provided DATETIME,
        lining_washed DATETIME,
        lining_attached DATETIME,
        status TEXT DEFAULT 'Pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(order_id) REFERENCES orders(id)
      )`, (err) => {
        if (err && !err.message.includes('already exists')) {
          console.error('Error creating lining_workflow table:', err.message);
        }
      });

      console.log('Database tables initialized');
    } catch (err) {
      console.error('Database initialization error:', err.message);
    }
  });
};

initializeDatabase();

module.exports = db;
