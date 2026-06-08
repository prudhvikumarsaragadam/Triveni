const app = require('../server');
const fs = require('fs');
const path = require('path');
const port = process.env.TEST_API_PORT ? Number(process.env.TEST_API_PORT) : 5002;

(async () => {
  const fetch = globalThis.fetch;
  const server = app.listen(port, async () => {
    console.log('Test server started on port', port);
    const baseUrl = `http://localhost:${port}`;

    try {
      const health = await fetch(`${baseUrl}/api/health`);
      console.log('Health status:', health.status);
      console.log('Health body:', await health.json());

      const uniquePhone = `99${Date.now().toString().slice(-8)}`;
      const customerResp = await fetch(`${baseUrl}/api/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Customer',
          phone: uniquePhone,
          email: 'testcustomer@example.com',
          address: '123 Test Street, Mumbai'
        })
      });
      const customerJson = await customerResp.json();
      console.log('Create customer:', customerResp.status, customerJson);
      const customerId = customerJson.customerId;

      const orderResp = await fetch(`${baseUrl}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: customerId,
          delivery_date: '2026-06-20',
          cutting_deadline: '2026-06-15',
          model_design: 'Evening gown with embroidery',
          cost: 9999,
          notes: 'Please use silk and pearl work',
          measurements: { bust: '34', waist: '28', hips: '38' }
        })
      });
      const orderJson = await orderResp.json();
      console.log('Create order:', orderResp.status, orderJson);

      if (orderJson.orderId) {
        const uploadPath = path.resolve(__dirname, '../uploads/test-image-red-1x1.png');
        if (fs.existsSync(uploadPath)) {
          const form = new FormData();
          const fileBuffer = fs.readFileSync(uploadPath);
          const fileBlob = new Blob([fileBuffer], { type: 'image/png' });
          form.append('photos', fileBlob, 'test-image-red-1x1.png');

          const uploadResp = await fetch(`${baseUrl}/api/photos/upload/${orderJson.orderId}`, {
            method: 'POST',
            body: form
          });
          console.log('Upload photo status:', uploadResp.status);
          console.log('Upload photo body:', await uploadResp.json());
        } else {
          console.warn('Upload image not found:', uploadPath);
        }
      }

      const orders = await fetch(`${baseUrl}/api/orders`);
      console.log('All orders status:', orders.status);
      console.log('All orders body:', await orders.json());

      if (customerId) {
        const customerGet = await fetch(`${baseUrl}/api/customers/${customerId}`);
        console.log('Customer detail status:', customerGet.status);
        console.log('Customer detail body:', await customerGet.json());
      }
    } catch (err) {
      console.error('Test error:', err);
    } finally {
      server.close(() => {
        console.log('Test server stopped');
      });
    }
  });
})();
