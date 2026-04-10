# Boutique Management System - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Currently, no authentication is required. In production, implement JWT or session-based auth.

---

## CUSTOMERS ENDPOINTS

### 1. Create Customer
**POST** `/customers`

Creates a new customer record.

**Request Body:**
```json
{
  "name": "Rampriya Sharma",
  "phone": "9876543210",
  "email": "rampriya@example.com",
  "address": "123, Silk Street, Bangalore"
}
```

**Response:**
```json
{
  "success": true,
  "customerId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Status Codes:**
- `201` - Customer created successfully
- `400` - Missing required fields
- `409` - Phone number already exists
- `500` - Server error

---

### 2. Get All Customers
**GET** `/customers`

Retrieves all customers (sorted by name).

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Rampriya Sharma",
    "phone": "9876543210",
    "email": "rampriya@example.com",
    "address": "123, Silk Street, Bangalore",
    "created_at": "2026-04-10T10:30:00Z"
  }
]
```

---

### 3. Get Customer by ID
**GET** `/customers/:id`

Retrieves a specific customer's details.

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Rampriya Sharma",
  "phone": "9876543210",
  "email": "rampriya@example.com",
  "address": "123, Silk Street, Bangalore",
  "created_at": "2026-04-10T10:30:00Z"
}
```

---

### 4. Update Customer
**PUT** `/customers/:id`

Updates an existing customer's information.

**Request Body:**
```json
{
  "name": "Rampriya Sharma",
  "phone": "9876543210",
  "email": "rampriya.new@example.com",
  "address": "456, New Address, Bangalore"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Customer updated"
}
```

---

## ORDERS ENDPOINTS

### 1. Create Order
**POST** `/orders`

Creates a new order and automatically generates a bill.

**Request Body:**
```json
{
  "customer_id": "550e8400-e29b-41d4-a716-446655440000",
  "delivery_date": "2026-04-25",
  "cutting_deadline": "2026-04-21",
  "model_design": "Designer Blouse with Mirror Work",
  "cost": 2500,
  "notes": "Customer wants golden thread work"
}
```

**Response:**
```json
{
  "success": true,
  "orderId": "660e8400-e29b-41d4-a716-446655440001",
  "billNumber": "BL-1680945600000"
}
```

**Status Codes:**
- `201` - Order created successfully
- `400` - Missing required fields
- `500` - Server error

---

### 2. Get All Orders
**GET** `/orders`

Retrieves all orders with customer details (sorted by delivery date).

**Response:**
```json
[
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "customer_id": "550e8400-e29b-41d4-a716-446655440000",
    "order_date": "2026-04-10T10:30:00Z",
    "delivery_date": "2026-04-25",
    "cutting_deadline": "2026-04-21",
    "status": "Booked",
    "model_design": "Designer Blouse with Mirror Work",
    "cost": 2500,
    "notes": "Customer wants golden thread work",
    "name": "Rampriya Sharma",
    "phone": "9876543210",
    "created_at": "2026-04-10T10:30:00Z",
    "updated_at": "2026-04-10T10:30:00Z"
  }
]
```

---

### 3. Get Order by ID
**GET** `/orders/:id`

Retrieves a specific order's complete details.

**Response:**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "customer_id": "550e8400-e29b-41d4-a716-446655440000",
  "order_date": "2026-04-10T10:30:00Z",
  "delivery_date": "2026-04-25",
  "cutting_deadline": "2026-04-21",
  "status": "Cutting",
  "model_design": "Designer Blouse with Mirror Work",
  "cost": 2500,
  "notes": "Customer wants golden thread work",
  "name": "Rampriya Sharma",
  "email": "rampriya@example.com",
  "phone": "9876543210",
  "created_at": "2026-04-10T10:30:00Z",
  "updated_at": "2026-04-10T10:30:00Z"
}
```

---

### 4. Get Order Queue
**GET** `/orders/queue/all`

Retrieves all pending orders sorted by delivery date (excludes Delivered and Cancelled).

**Response:**
```json
[
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "customer_id": "550e8400-e29b-41d4-a716-446655440000",
    "order_date": "2026-04-10T10:30:00Z",
    "delivery_date": "2026-04-15",
    "cutting_deadline": "2026-04-11",
    "status": "Stitching",
    "model_design": "Designer Blouse with Mirror Work",
    "cost": 2500,
    "name": "Rampriya Sharma",
    "phone": "9876543210"
  }
]
```

---

### 5. Update Order Status
**PATCH** `/orders/:id/status`

Updates the order status through the workflow stages.

**Request Body:**
```json
{
  "status": "Stitching"
}
```

**Valid Status Values:**
- `Booked` - Order confirmed, awaiting cutting
- `Cutting` - Fabric cutting in progress
- `Stitching` - Blouse stitching in progress
- `QC` - Quality check phase
- `Ready` - Ready for delivery
- `Delivered` - Order delivered to customer
- `Cancelled` - Order cancelled

**Response:**
```json
{
  "success": true,
  "message": "Order status updated"
}
```

---

## BILLS ENDPOINTS

### 1. Get Bill by Order
**GET** `/bills/order/:order_id`

Retrieves the bill associated with an order.

**Response:**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "order_id": "660e8400-e29b-41d4-a716-446655440001",
  "bill_number": "BL-1680945600000",
  "amount": 2500,
  "paid_amount": 1000,
  "payment_status": "Partial",
  "bill_date": "2026-04-10T10:30:00Z",
  "created_at": "2026-04-10T10:30:00Z"
}
```

---

### 2. Update Payment
**PATCH** `/bills/:id/payment`

Records a payment against a bill.

**Request Body:**
```json
{
  "paid_amount": 2500,
  "payment_status": "Paid"
}
```

**Payment Status Values:**
- `Pending` - No payment received
- `Partial` - Partial payment received
- `Paid` - Full payment received

**Response:**
```json
{
  "success": true,
  "message": "Payment updated"
}
```

---

## DATABASE SCHEMA

### Customers Table
```
id (UUID Primary Key)
name (Text, Required)
phone (Text, Unique, Required)
email (Text)
address (Text)
created_at (DateTime)
```

### Orders Table
```
id (UUID Primary Key)
customer_id (UUID Foreign Key → customers.id)
order_date (DateTime)
delivery_date (Date, Required)
cutting_deadline (Date)
status (Text Default: 'Booked')
model_design (Text)
cost (Real)
notes (Text)
created_at (DateTime)
updated_at (DateTime)
```

### Bills Table
```
id (UUID Primary Key)
order_id (UUID Foreign Key → orders.id)
bill_number (Text, Unique)
amount (Real, Required)
paid_amount (Real Default: 0)
payment_status (Text Default: 'Pending')
bill_date (DateTime)
created_at (DateTime)
```

### Photos Table
```
id (UUID Primary Key)
order_id (UUID Foreign Key → orders.id)
file_path (Text)
uploaded_at (DateTime)
```

### Quality Checklist Table
```
id (UUID Primary Key)
order_id (UUID Foreign Key → orders.id)
ironed (Boolean)
lining_check (Boolean)
stitching_check (Boolean)
packaging_done (Boolean)
final_notes (Text)
checked_at (DateTime)
```

### Lining Workflow Table
```
id (UUID Primary Key)
order_id (UUID Foreign Key → orders.id)
lining_provided (DateTime)
lining_washed (DateTime)
lining_attached (DateTime)
status (Text Default: 'Pending')
created_at (DateTime)
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "customer_id and delivery_date are required"
}
```

### 404 Not Found
```json
{
  "error": "Order not found"
}
```

### 409 Conflict
```json
{
  "error": "Phone number already exists"
}
```

### 500 Server Error
```json
{
  "error": "Internal Server Error",
  "message": "Detailed error message"
}
```

---

## Example Workflow

### 1. Create Customer and Order

**Step 1:** Create Customer
```bash
curl -X POST http://localhost:5000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rampriya Sharma",
    "phone": "9876543210",
    "email": "rampriya@example.com",
    "address": "123 Silk Street"
  }'
```

**Step 2:** Create Order
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "550e8400-e29b-41d4-a716-446655440000",
    "delivery_date": "2026-04-25",
    "cutting_deadline": "2026-04-21",
    "model_design": "Designer Blouse",
    "cost": 2500
  }'
```

**Step 3:** Update Order Status
```bash
curl -X PATCH http://localhost:5000/api/orders/660e8400-e29b-41d4-a716-446655440001/status \
  -H "Content-Type: application/json" \
  -d '{"status": "Cutting"}'
```

**Step 4:** Get Queue (for daily updates)
```bash
curl http://localhost:5000/api/orders/queue/all
```

**Step 5:** Record Payment
```bash
curl -X PATCH http://localhost:5000/api/bills/770e8400-e29b-41d4-a716-446655440002/payment \
  -H "Content-Type: application/json" \
  -d '{
    "paid_amount": 2500,
    "payment_status": "Paid"
  }'
```

---

## Rate Limiting & Performance
- No rate limiting currently implemented
- Database queries are indexed on `delivery_date` and `status` for performance
- Recommended: Implement connection pooling for production use

## Future Enhancements
- Add authentication (JWT)
- Implement file upload for photos
- Add WhatsApp notification API
- Add SMS notifications
- Export to PDF/Excel
- Advanced reporting and analytics

---

**Version:** 1.0.0  
**Last Updated:** April 10, 2026
