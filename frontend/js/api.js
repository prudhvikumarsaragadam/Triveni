const API_BASE_URL = 'http://localhost:5000/api';

// API Helper Functions
const api = {
  // Customers
  createCustomer: async (customerData) => {
    const response = await fetch(`${API_BASE_URL}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customerData)
    });
    return response.json();
  },

  getCustomers: async () => {
    const response = await fetch(`${API_BASE_URL}/customers`);
    return response.json();
  },

  getCustomer: async (id) => {
    const response = await fetch(`${API_BASE_URL}/customers/${id}`);
    return response.json();
  },

  // Orders
  createOrder: async (orderData) => {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    return response.json();
  },

  getOrders: async () => {
    const response = await fetch(`${API_BASE_URL}/orders`);
    return response.json();
  },

  getOrder: async (id) => {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`);
    return response.json();
  },

  getOrderQueue: async () => {
    const response = await fetch(`${API_BASE_URL}/orders/queue/all`);
    return response.json();
  },

  updateOrderStatus: async (id, status) => {
    const response = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return response.json();
  },

  // Bills
  getBillByOrder: async (orderId) => {
    const response = await fetch(`${API_BASE_URL}/bills/order/${orderId}`);
    return response.json();
  },

  updatePayment: async (billId, paidAmount, paymentStatus) => {
    const response = await fetch(`${API_BASE_URL}/bills/${billId}/payment`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paid_amount: paidAmount, payment_status: paymentStatus })
    });
    return response.json();
  },

  // Photos
  uploadPhotos: async (orderId, files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('photos', file);
    });

    const response = await fetch(`${API_BASE_URL}/photos/upload/${orderId}`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  },

  getOrderPhotos: async (orderId) => {
    const response = await fetch(`${API_BASE_URL}/photos/order/${orderId}`);
    return response.json();
  },

  deletePhoto: async (photoId) => {
    const response = await fetch(`${API_BASE_URL}/photos/${photoId}`, {
      method: 'DELETE'
    });
    return response.json();
  }
};
