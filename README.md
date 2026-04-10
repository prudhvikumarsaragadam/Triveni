# Boutique Management System

A comprehensive web-based management system for tracking customer orders for stitching saree blouses and garments. The system handles order queuing, timeline tracking, billing, payment management, and quality checklists.

## Features

✨ **Order Management**
- Create and track customer orders
- Automatic bill generation with unique bill numbers
- Timeline tracking (Booking → Cutting → Stitching → QC → Ready → Delivered)
- Cutting deadline calculation and alerts

📊 **Dashboard**
- Real-time statistics (Total orders, Active orders, Completed orders, Pending payments)
- Next delivery schedule with urgency indicators
- Quick insights into shop status

👥 **Customer Management**
- Customer registration with contact details
- Phone-based duplicate detection
- Customer history and order tracking

📦 **Order Queue**
- All pending orders sorted by delivery date
- Urgency indicators (red for ≤2 days, orange for ≤5 days)
- Cutting deadline alerts
- Status tracking at each stage

💳 **Billing & Payments**
- Automatic bill generation with order
- Payment tracking (Pending/Partial/Paid)
- Payment recording interface
- Bill management and status

🎨 **Quality Management**
- Final quality checklist before delivery
- Photo upload capability (placeholder)
- Lining workflow tracking
- Delivery readiness verification

⚠️ **Smart Alerts**
- Urgent delivery alerts (≤2 days)
- Near deadline warnings (≤5 days)
- Cutting deadline overdue alerts
- Payment pending notifications

## Tech Stack

**Backend:**
- Node.js with Express.js
- SQLite3 Database
- RESTful API architecture

**Frontend:**
- HTML5, CSS3, JavaScript (Vanilla)
- Responsive design for desktop and mobile
- Real-time UI updates

**Database:**
- SQLite with 7 main tables:
  - customers
  - orders
  - bills
  - photos
  - quality_checklist
  - lining_workflow
  - payment_history (ready to extend)

## Project Structure

```
boutique-management-system/
├── backend/                    # Node.js/Express server
│   ├── database/              # Database configuration
│   │   └── db.js              # SQLite initialization and tables
│   ├── models/                # Data models
│   │   ├── Customer.js        # Customer model
│   │   ├── Order.js           # Order model
│   │   └── Bill.js            # Bill model
│   ├── routes/                # API routes
│   │   ├── customers.js       # Customer endpoints
│   │   ├── orders.js          # Order endpoints
│   │   └── bills.js           # Bill endpoints
│   ├── uploads/               # Photo storage
│   ├── server.js              # Main Express app
│   ├── package.json           # Dependencies
│   ├── .env                   # Environment variables
│   └── .gitignore             # Git ignore rules
│
├── frontend/                  # Web interface
│   ├── styles/
│   │   └── main.css           # Styling and responsiveness
│   ├── js/
│   │   ├── api.js             # API helper functions
│   │   └── app.js             # Main application logic
│   ├── index.html             # Main page
│   └── package.json           # Frontend config
│
├── docs/                      # Documentation
│   └── API_DOCUMENTATION.md   # API reference
│
├── .github/
│   └── copilot-instructions.md # Project setup guide
│
└── README.md                  # This file
```

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. **Clone or download the project**
   ```bash
   cd boutique-management-system
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Start the backend server**
   ```bash
   npm start
   # OR for development with auto-reload
   npm run dev
   ```
   Server runs on `http://localhost:5000`

4. **Open the frontend** (in another terminal)
   ```bash
   cd frontend
   npm start
   # OR manually open index.html in browser
   ```
   Frontend runs on `http://localhost:3000` (or open `frontend/index.html` directly)

5. **Access the application**
   - Open browser and go to `http://localhost:3000`
   - Or directly open `frontend/index.html` in your browser

## Database Schema

### Tables
- **customers**: Customer contact information
- **orders**: Order details with status and timeline
- **bills**: Billing information with payment tracking
- **photos**: Photo uploads for orders
- **quality_checklist**: Final quality checks before delivery
- **lining_workflow**: Lining washing and attachment tracking

## API Endpoints

### Customers
- `POST /api/customers` - Create customer
- `GET /api/customers` - List all customers
- `GET /api/customers/:id` - Get customer details
- `PUT /api/customers/:id` - Update customer

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - List all orders
- `GET /api/orders/:id` - Get order details
- `GET /api/orders/queue/all` - Get order queue (sorted by delivery date)
- `PATCH /api/orders/:id/status` - Update order status

### Bills
- `GET /api/bills/order/:order_id` - Get bill by order
- `PATCH /api/bills/:id/payment` - Update payment status

## Usage Examples

### Creating a New Order

1. Navigate to the "Orders" tab
2. Fill in customer details:
   - Customer name (required)
   - Phone number (required)
   - Email (optional)
   - Address (optional)
3. Enter order details:
   - Model/Design (required)
   - Cost (required)
   - Delivery date (required)
   - Cutting deadline (optional)
   - Notes (optional)
4. Click "Create Order & Bill"
5. Bill is automatically generated with unique bill number

### Managing Order Status

1. Go to "Orders" tab
2. Find the order in the list
3. Use the status dropdown to change:
   - Booked
   - Cutting
   - Stitching
   - Quality Check (QC)
   - Ready
   - Delivered

### Tracking Payments

1. Navigate to "Bills & Payment" tab
2. View all bills with payment status
3. Enter amount paid and click "Record Payment"
4. Status updates to: Pending → Partial → Paid

### Viewing Order Queue

1. Go to "Order Queue" tab
2. Orders are automatically sorted by delivery date
3. Red alert (🚨) = Delivery in ≤2 days
4. Orange background = Delivery in ≤5 days
5. See cutting deadline status at a glance

## Customization

### Modify Order Statuses
Edit the status dropdown in `frontend/js/app.js` and update backend routes accordingly.

### Change Timeline Steps
Update the timeline array in order display sections of `frontend/js/app.js`.

### Add Additional Fields
1. Update database schema in `backend/database/db.js`
2. Add form fields in `frontend/index.html`
3. Update models in `backend/models/`
4. Update API routes

### Integrate WhatsApp
- Google integration ready in `backend/.env`
- Update WhatsApp group link in `.env`
- Extend `/api/orders` endpoint to send WhatsApp notifications

## Future Enhancements

- 📸 Photo upload and gallery
- 📱 WhatsApp integration for notifications
- 📊 Sales analytics and reports
- 💾 Data export to Excel/PDF
- 🔐 User authentication and roles
- 📧 Email notifications
- 🌙 Dark mode
- 📲 Mobile app version

## Troubleshooting

### Backend won't start
```bash
# Check if port 5000 is in use
# Change PORT in .env file if needed
```

### Database errors
```bash
# Ensures fresh database
rm backend/database/boutique.db
npm start
```

### CORS errors on frontend
```bash
# Ensure backend is running on port 5000
# Check frontend is connecting to http://localhost:5000
```

### npm dependencies issues
```bash
# Clear npm cache
npm cache clean --force
# Reinstall dependencies
rm package-lock.json node_modules
npm install
```

## Contact & Support

For issues, questions, or suggestions, please create an issue in the repository.

## License

ISC

---

**Happy boutique management!** 🧥✨
