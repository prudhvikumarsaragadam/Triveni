# Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Prerequisites
- Node.js installed ([Download here](https://nodejs.org/))
- Any modern web browser
- Python (for simple HTTP server on frontend)

### Step 1: Install Dependencies

Open terminal in project root and run:
```bash
cd backend
npm install
```

### Step 2: Start Backend Server

In the same terminal (in backend directory):
```bash
npm start
```

You should see:
```
Database tables initialized
Server is running on http://localhost:5000
Connected to SQLite database
```

### Step 3: Start Frontend

Open a NEW terminal and navigate to project root:
```bash
cd frontend
python3 -m http.server 3000
```

Or if Python isn't working:
- Simply open `frontend/index.html` in your browser

### Step 4: Access the Application

Open browser and go to: `http://localhost:3000`

---

## 📱 Using the Application

### Create Your First Order

1. **Go to "Orders" Tab**
2. **Fill in Customer Details:**
   - Name: Rampriya Sharma
   - Phone: 9876543210
   - Email: rampriya@example.com (optional)
   - Address: 123 Silk Street, Bangalore (optional)

3. **Fill in Order Details:**
   - Model/Design: Designer Blouse with Mirror Work
   - Cost: 2500
   - Booking Date: (auto-filled as today)
   - Delivery Date: Select 7-10 days from today
   - Cutting Deadline: 3-4 days from today
   - Notes: Any special requests

4. **Click "Create Order & Bill"**

### Track Order Status

1. Switch to **"Orders"** tab
2. Find your order in the list
3. Use the **Status Dropdown** to move through workflow:
   ```
   Booked → Cutting → Stitching → QC → Ready → Delivered
   ```

### View Order Queue

- Go to **"Order Queue"** tab
- See all pending orders sorted by delivery date
- 🚨 Red alerts = Delivery in ≤2 days
- 🟠 Orange = Delivery in ≤5 days

### Manage Payments

1. Go to **"Bills & Payment"** tab
2. See all bills with customer names
3. Enter payment amount
4. Click "Record Payment"
5. Status updates: Pending → Partial → Paid

### Dashboard Overview

The **"Dashboard"** tab shows:
- Total Orders Created
- Active Orders in Progress
- Completed Orders
- Pending Payments
- Next 5 Deliveries with urgency

---

## 🔧 Development & Customization

### Change Backend Port

Edit `backend/.env`:
```
PORT=5000  # Change to any port
```

### Customize Order Statuses

Edit in `frontend/js/app.js` (search for "status dropdown"):
```javascript
<option value="Booked">Booked</option>
<option value="Cutting">Cutting</option>
// Add more as needed
```

### Add New Fields to Orders

1. Update database schema in `backend/database/db.js`
2. Add form field to `frontend/index.html`
3. Update API route in `backend/routes/orders.js`
4. Update frontend API call in `frontend/js/api.js`

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `backend/server.js` | Express server configuration |
| `backend/database/db.js` | Database schema & initialization |
| `backend/routes/` | API endpoints |
| `backend/models/` | Data models |
| `frontend/index.html` | Main UI |
| `frontend/js/app.js` | Application logic |
| `frontend/js/api.js` | API helper functions |
| `frontend/styles/main.css` | Styling & responsive design |

---

## 🐛 Troubleshooting

### "Cannot find module 'express'"
```bash
cd backend
npm install
```

### "Port 5000 already in use"
Change PORT in `backend/.env` or kill the process using port 5000

### "Cannot connect to server"
- Ensure backend is running on `http://localhost:5000`
- Check terminal for error messages
- Check browser console (F12) for network errors

### Frontend won't load
- Try opening `frontend/index.html` directly in browser
- Or check if Python server is running
- Clear browser cache (Ctrl+Shift+Delete)

### Database errors
```bash
# Delete old database
rm backend/database/boutique.db

# Restart backend
npm start
```

---

## 📊 API Testing

Test the API using curl or Postman:

### Get All Orders
```bash
curl http://localhost:5000/api/orders
```

### Get Order Queue
```bash
curl http://localhost:5000/api/orders/queue/all
```

### Get All Customers
```bash
curl http://localhost:5000/api/customers
```

For detailed API documentation, see: `/docs/API_DOCUMENTATION.md`

---

## ✨ Tips & Best Practices

1. **Set realistic delivery dates** (7-10 days from booking)
2. **Update cutting deadline** 3-4 days before delivery
3. **Check dashboard daily** for urgent orders (red highlighted)
4. **Record payments immediately** after customer pays
5. **Update order status** as work progresses

---

## 🚀 Ready to Launch?

1. **Terminal 1** (Backend):
   ```bash
   cd backend && npm start
   ```

2. **Terminal 2** (Frontend):
   ```bash
   cd frontend && python3 -m http.server 3000
   ```

3. **Open Browser**:
   ```
   http://localhost:3000
   ```

---

## 📞 Need Help?

- Check `README.md` for full documentation
- See `/docs/API_DOCUMENTATION.md` for API details
- Review error messages in browser console (F12)
- Check terminal output for server errors

**Happy boutique management!** 🧥✨
