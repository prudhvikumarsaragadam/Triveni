const request = require('supertest');
const path = require('path');
const fs = require('fs');

const TEST_DB_PATH = path.join(__dirname, `boutique.test.${Date.now()}.db`);

const cleanupTestDb = () => {
  if (fs.existsSync(TEST_DB_PATH)) {
    try {
      fs.unlinkSync(TEST_DB_PATH);
    } catch (error) {
      // Ignore locked file cleanup errors in test environment
    }
  }
};

process.env.DB_PATH = TEST_DB_PATH;
const app = require('../server');

describe('Boutique Management Backend API', () => {
  let customerId;
  let orderId;
  let billId;

  afterAll(() => {
    cleanupTestDb();
  });

  test('Health endpoint returns server status', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'Server is running');
    expect(response.body).toHaveProperty('timestamp');
  });

  test('Create customer successfully', async () => {
    const response = await request(app)
      .post('/api/customers')
      .send({ name: 'Test Customer', phone: '9999999999', email: 'test@example.com', address: 'Test Address' });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('customerId');
    customerId = response.body.customerId;
  });

  test('Create order successfully with measurement data and generate bill', async () => {
    const response = await request(app)
      .post('/api/orders')
      .send({
        customer_id: customerId,
        delivery_date: '2026-05-01',
        cutting_deadline: '2026-04-25',
        model_design: 'Test Blouse',
        cost: 1500,
        notes: 'Test order',
        measurements: {
          type: 'Blouse Measurements',
          bePw: '15',
          values: {
            blouse_length: '22',
            blouse_shoulder: '14',
            blouse_chest_upper: '36'
          }
        }
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('orderId');
    expect(response.body).toHaveProperty('billNumber');
    orderId = response.body.orderId;
  });

  test('Fetch all orders and verify new order exists with measurement data', async () => {
    const response = await request(app).get('/api/orders');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    const createdOrder = response.body.find((order) => order.id === orderId);
    expect(createdOrder).toBeDefined();
    expect(createdOrder).toMatchObject({
      customer_id: customerId,
      delivery_date: '2026-05-01',
      model_design: 'Test Blouse',
      cost: 1500,
      measurements: {
        type: 'Blouse Measurements',
        bePw: '15',
        values: {
          blouse_length: '22',
          blouse_shoulder: '14',
          blouse_chest_upper: '36'
        }
      }
    });
  });

  test('Update order status successfully', async () => {
    const response = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .send({ status: 'Cutting' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
  });

  test('Order queue returns the updated order', async () => {
    const response = await request(app).get('/api/orders/queue/all');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    const queuedOrder = response.body.find((order) => order.id === orderId);
    expect(queuedOrder).toBeDefined();
    expect(queuedOrder).toHaveProperty('status', 'Cutting');
  });

  test('Fetch bill by order ID and update payment', async () => {
    const billResponse = await request(app).get(`/api/bills/order/${orderId}`);
    expect(billResponse.status).toBe(200);
    expect(billResponse.body).toHaveProperty('id');
    billId = billResponse.body.id;
    expect(billResponse.body).toHaveProperty('amount', 1500);
    expect(billResponse.body).toHaveProperty('payment_status', 'Pending');

    const paymentResponse = await request(app)
      .patch(`/api/bills/${billId}/payment`)
      .send({ paid_amount: 500, payment_status: 'Partial' });

    expect(paymentResponse.status).toBe(200);
    expect(paymentResponse.body).toHaveProperty('success', true);
  });
});
