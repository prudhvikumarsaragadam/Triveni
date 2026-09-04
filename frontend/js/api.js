const isLocalFrontend = window.location.protocol === 'file:' ||
  ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
    window.location.port !== '5000');
const API_BASE_URL = isLocalFrontend ? 'http://localhost:5000/api' : '/api';
const API_ORIGIN = isLocalFrontend ? 'http://localhost:5000' : '';
window.APP_API_BASE_URL = API_BASE_URL;
window.APP_API_ORIGIN = API_ORIGIN;

const parseResponse = async (response) => {
  const body = await response.text();
  let data;

  try {
    data = JSON.parse(body);
  } catch (error) {
    throw new Error(`API returned ${response.status} from ${response.url}: ${body.slice(0, 120)}`);
  }

  if (!response.ok) {
    throw new Error(data.error || data.message || `API request failed with status ${response.status}`);
  }

  return data;
};

// API Helper Functions
const api = {
  // Customers
  createCustomer: async (customerData) => {
    const response = await fetch(`${API_BASE_URL}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customerData)
    });
    return parseResponse(response);
  },

  getCustomers: async () => {
    const response = await fetch(`${API_BASE_URL}/customers`);
    return parseResponse(response);
  },

  getCustomer: async (id) => {
    const response = await fetch(`${API_BASE_URL}/customers/${id}`);
    return parseResponse(response);
  },

  // Orders
  createOrder: async (orderData) => {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    return parseResponse(response);
  },

  getOrders: async () => {
    const response = await fetch(`${API_BASE_URL}/orders`);
    return parseResponse(response);
  },

  getOrder: async (id) => {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`);
    return parseResponse(response);
  },

  getOrderQueue: async () => {
    const response = await fetch(`${API_BASE_URL}/orders/queue/all`);
    return parseResponse(response);
  },

  updateOrderStatus: async (id, status) => {
    const response = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return parseResponse(response);
  },

  // Bills
  getBillByOrder: async (orderId) => {
    const response = await fetch(`${API_BASE_URL}/bills/order/${orderId}`);
    return parseResponse(response);
  },

  updatePayment: async (billId, paidAmount, paymentStatus) => {
    const response = await fetch(`${API_BASE_URL}/bills/${billId}/payment`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paid_amount: paidAmount, payment_status: paymentStatus })
    });
    return parseResponse(response);
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
    return parseResponse(response);
  },

  getOrderPhotos: async (orderId) => {
    const response = await fetch(`${API_BASE_URL}/photos/order/${orderId}`);
    return parseResponse(response);
  },

  deletePhoto: async (photoId) => {
    const response = await fetch(`${API_BASE_URL}/photos/${photoId}`, {
      method: 'DELETE'
    });
    return parseResponse(response);
  }
};
