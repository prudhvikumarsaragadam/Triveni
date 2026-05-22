// App State
let appState = {
  customers: [],
  orders: [],
  bills: [],
  currentTab: 'dashboard'
};

const measurementGroups = {
  'Blouse Measurements': [
    { label: 'Length', key: 'blouse_length', min: 6, max: 25 },
    { label: 'Shoulder', key: 'blouse_shoulder', min: 8, max: 22 },
    { label: 'Chest Upper', key: 'blouse_chest_upper', min: 18, max: 50 },
    { label: 'Middle Chest', key: 'blouse_middle_chest', min: 18, max: 50 },
    { label: 'Waist', key: 'blouse_waist', min: 18, max: 50 },
    { label: 'Hand Length', key: 'blouse_hand_length', min: 1, max: 25 },
    { label: 'Hand Loose', key: 'blouse_hand_loose', min: 6, max: 20 },
    { label: 'Arm Hole', key: 'blouse_arm_hole', min: 7, max: 24 },
    { label: 'Front Neck Deep', key: 'blouse_front_neck_deep', min: 2, max: 10 },
    { label: 'Back Neck Deep', key: 'blouse_back_neck_deep', min: 2, max: 13 },
    { label: 'Chest Points', key: 'blouse_chest_points', min: 8, max: 20 },
    { label: 'Collar', key: 'blouse_collar', min: 10, max: 25 }
  ],
  'Dress / Top / Frock Measurements': [
    { label: 'Length', key: 'dress_length', min: 10, max: 50 },
    { label: 'Shoulder', key: 'dress_shoulder', min: 8, max: 22 },
    { label: 'Chest Upper', key: 'dress_chest_upper', min: 18, max: 50 },
    { label: 'Middle Chest', key: 'dress_middle_chest', min: 18, max: 50 },
    { label: 'Waist', key: 'dress_waist', min: 18, max: 50 },
    { label: 'Hip', key: 'dress_hip', min: 18, max: 60 },
    { label: 'Slit', key: 'dress_slit', min: 1, max: 30 },
    { label: 'Hand Length', key: 'dress_hand_length', min: 1, max: 25 },
    { label: 'Hand Loose', key: 'dress_hand_loose', min: 6, max: 20 },
    { label: 'Arm Hole', key: 'dress_arm_hole', min: 7, max: 24 },
    { label: 'Front Neck Deep', key: 'dress_front_neck_deep', min: 2, max: 10 },
    { label: 'Back Neck Deep', key: 'dress_back_neck_deep', min: 2, max: 13 },
    { label: 'Collar', key: 'dress_collar', min: 10, max: 25 }
  ],
  'Lehenga / Skirt / Pant Measurements': [
    { label: 'Length', key: 'lehenga_length', min: 10, max: 50 },
    { label: 'Waist', key: 'lehenga_waist', min: 18, max: 50 },
    { label: 'Hip', key: 'lehenga_hip', min: 18, max: 50 },
    { label: 'Thigh / Tight', key: 'lehenga_thigh_tight', min: 18, max: 40 },
    { label: 'Loose', key: 'lehenga_loose', min: 10, max: 30 }
  ],
  'Saree Pleating Measurements': [
    { label: 'Pallu Length', key: 'saree_pallu_length', min: 38, max: 48 },
    { label: 'Shoulder to Waist', key: 'saree_shoulder_to_waist', min: 35, max: 55 },
    { label: 'Waist to Waist', key: 'saree_waist_to_waist', min: 30, max: 68 },
    { label: 'Pallu Size', key: 'saree_pallu_size', min: 3, max: 18 },
    { label: 'Chest Size', key: 'saree_chest_size', min: 9, max: 18 }
  ]
};

// Tab Switching
function switchTab(tab) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach(el => {
    el.classList.remove('active');
  });
  
  // Deactivate all buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  // Show selected tab
  const tabElement = document.getElementById(tab);
  if (tabElement) {
    tabElement.classList.add('active');
  }

  // Activate the correct button based on tab name
  const buttons = document.querySelectorAll('.nav-btn');
  buttons.forEach(btn => {
    if (btn.textContent.toLowerCase().includes(tab.replace('-', ' ')) || 
        (tab === 'dashboard' && btn.textContent.includes('Dashboard')) ||
        (tab === 'orders' && btn.textContent.includes('Orders')) ||
        (tab === 'customers' && btn.textContent.includes('Customers')) ||
        (tab === 'queue' && btn.textContent.includes('Queue')) ||
        (tab === 'bills' && btn.textContent.includes('Bills'))) {
      btn.classList.add('active');
    }
  });

  appState.currentTab = tab;

  // Load data for the tab
  if (tab === 'orders') {
    loadAllOrders();
  } else if (tab === 'customers') {
    loadCustomers();
  } else if (tab === 'queue') {
    loadOrderQueue();
  } else if (tab === 'bills') {
    loadBills();
  } else if (tab === 'dashboard') {
    loadDashboard();
  }
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  // Set booking date to today
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('bookingDate').value = today;

  // Populate measurement types and fields
  populateMeasurementTypeOptions();
  document.getElementById('measurementType').addEventListener('change', () => {
    renderMeasurementFields(document.getElementById('measurementType').value);
  });

  // Setup form submission
  document.getElementById('orderForm').addEventListener('submit', handleOrderSubmit);

  // Setup photo upload preview
  setupPhotoUpload();

  // Setup customer filters
  setupCustomerFilters();

  // Load initial data
  loadDashboard();
  loadCustomers();
});

// Setup customer filter event listeners
function setupCustomerFilters() {
  const phoneFilter = document.getElementById('phoneFilter');
  const joinedFromFilter = document.getElementById('joinedFromFilter');
  const joinedToFilter = document.getElementById('joinedToFilter');

  if (phoneFilter) {
    phoneFilter.addEventListener('input', () => loadCustomers());
  }

  if (joinedFromFilter) {
    joinedFromFilter.addEventListener('change', () => loadCustomers());
  }

  if (joinedToFilter) {
    joinedToFilter.addEventListener('change', () => loadCustomers());
  }
}

function populateMeasurementTypeOptions() {
  const measurementTypeSelect = document.getElementById('measurementType');
  if (!measurementTypeSelect) return;

  Object.keys(measurementGroups).forEach(groupName => {
    const option = document.createElement('option');
    option.value = groupName;
    option.textContent = groupName;
    measurementTypeSelect.appendChild(option);
  });
}

function renderMeasurementFields(groupKey) {
  const container = document.getElementById('measurementFields');
  if (!container) return;

  if (!groupKey || !measurementGroups[groupKey]) {
    container.innerHTML = '<p style="color: #475569;">Select a measurement group to load fields.</p>';
    return;
  }

  const fields = measurementGroups[groupKey];
  container.innerHTML = fields.map(field => {
    const options = Array.from({ length: field.max - field.min + 1 }, (_, index) => {
      const value = field.min + index;
      return `<option value="${value}">${value}</option>`;
    }).join('');

    return `
      <div class="form-field">
        <label>${field.label}</label>
        <select id="${field.key}">
          <option value="">Select ${field.label}</option>
          ${options}
        </select>
      </div>
    `;
  }).join('');
}

// Setup photo upload preview
function setupPhotoUpload() {
  const photoInput = document.getElementById('orderPhotos');
  const photoPreview = document.getElementById('photoPreview');

  photoInput.addEventListener('change', (e) => {
    const rawFiles = Array.from(e.target.files || []);
    photoPreview.innerHTML = '';

    // Client-side validation: max 10 files, each <= 5MB, images only
    const validFiles = [];
    rawFiles.forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      if (file.size > 5 * 1024 * 1024) return;
      validFiles.push(file);
    });

    if (rawFiles.length > 10) {
      showMessage('You can upload a maximum of 10 images', 'error');
    }

    // If some files were invalid due to size/type, notify user
    if (validFiles.length < rawFiles.length) {
      showMessage('Some files were ignored (non-image or >5MB)', 'warning');
    }

    // Reflect validated files back to the input (so upload uses filtered set)
    const dt = new DataTransfer();
    validFiles.slice(0, 10).forEach(f => dt.items.add(f));
    photoInput.files = dt.files;

    validFiles.slice(0, 10).forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const previewItem = document.createElement('div');
        previewItem.className = 'photo-preview-item';
        previewItem.innerHTML = `
          <img src="${e.target.result}" alt="Preview ${index + 1}">
          <div class="photo-meta">
            <div class="photo-name">${file.name}</div>
            <div class="photo-size">${(file.size / 1024).toFixed(1)} KB</div>
          </div>
          <button type="button" class="remove-photo" onclick="removePhotoPreview(${index})">&times;</button>
        `;
        photoPreview.appendChild(previewItem);
      };
      reader.readAsDataURL(file);
    });
  });
}

// Remove photo from preview
function removePhotoPreview(index) {
  const photoInput = document.getElementById('orderPhotos');
  const photoPreview = document.getElementById('photoPreview');

  // Remove from preview
  const previewItems = photoPreview.querySelectorAll('.photo-preview-item');
  if (previewItems[index]) {
    previewItems[index].remove();
  }

  // Remove from file input
  const dt = new DataTransfer();
  const files = Array.from(photoInput.files);
  files.splice(index, 1);
  files.forEach(file => dt.items.add(file));
  photoInput.files = dt.files;
}

// Open photo modal
function openPhotoModal(photoPath) {
  const modal = document.getElementById('photoModal');
  const modalPhoto = document.getElementById('modalPhoto');
  modalPhoto.src = `http://localhost:5000${photoPath}`;
  modal.style.display = 'flex';
}

// Close photo modal
function closePhotoModal() {
  const modal = document.getElementById('photoModal');
  modal.style.display = 'none';
}

// Close modal when clicking outside
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('photoModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closePhotoModal();
      }
    });
  }
});

// Handle Order Form Submission
async function handleOrderSubmit(e) {
  e.preventDefault();

  const customerName = document.getElementById('customerName').value;
  const customerPhone = document.getElementById('customerPhone').value;
  const customerEmail = document.getElementById('customerEmail').value;
  const customerAddress = document.getElementById('customerAddress').value;
  const modelDesign = document.getElementById('modelDesign').value;
  const cost = parseFloat(document.getElementById('cost').value);
  const deliveryDate = document.getElementById('deliveryDate').value;
  const cuttingDeadline = document.getElementById('cuttingDeadline').value;
  const notes = document.getElementById('notes').value;
  const measurementType = document.getElementById('measurementType').value;
  const measurements = {
    type: measurementType || null,
    values: {}
  };

  if (measurementType && measurementGroups[measurementType]) {
    measurementGroups[measurementType].forEach(field => {
      const fieldElement = document.getElementById(field.key);
      if (fieldElement && fieldElement.value) {
        measurements.values[field.key] = fieldElement.value;
      }
    });
  }

  if (!customerName || !customerPhone || !modelDesign || !cost || !deliveryDate) {
    showMessage('Please fill all required fields', 'error');
    return;
  }

  try {
    // Step 1: Check if customer exists, otherwise create new customer
    let customerId;
    const existingCustomer = appState.customers.find(c => c.phone === customerPhone);

    if (existingCustomer) {
      customerId = existingCustomer.id;
    } else {
      const customerResponse = await api.createCustomer({
        name: customerName,
        phone: customerPhone,
        email: customerEmail,
        address: customerAddress
      });

      if (customerResponse.success) {
        customerId = customerResponse.customerId;
      } else {
        showMessage('Error creating customer', 'error');
        return;
      }
    }

    // Step 2: Create order
    const orderResponse = await api.createOrder({
      customer_id: customerId,
      delivery_date: deliveryDate,
      cutting_deadline: cuttingDeadline || null,
      model_design: modelDesign,
      cost: cost,
      notes: notes,
      measurements: measurements
    });

    if (orderResponse.success) {
      // Upload photos if any are selected
      const photoInput = document.getElementById('orderPhotos');
      if (photoInput.files && photoInput.files.length > 0) {
        try {
          const photoResponse = await api.uploadPhotos(orderResponse.orderId, Array.from(photoInput.files));
          if (photoResponse.success) {
            showMessage(`Order created successfully! Bill #${orderResponse.billNumber}. ${photoResponse.message}`, 'success');
          } else {
            showMessage(`Order created successfully! Bill #${orderResponse.billNumber}. Photo upload failed: ${photoResponse.error}`, 'warning');
          }
        } catch (photoError) {
          console.error('Photo upload error:', photoError);
          showMessage(`Order created successfully! Bill #${orderResponse.billNumber}. Photo upload failed.`, 'warning');
        }
      } else {
        showMessage(`Order created successfully! Bill #${orderResponse.billNumber}`, 'success');
      }

      document.getElementById('orderForm').reset();
      document.getElementById('bookingDate').value = new Date().toISOString().split('T')[0];
      // Clear photo preview
      document.getElementById('photoPreview').innerHTML = '';
      loadAllOrders();
      loadDashboard();
    } else {
      showMessage('Error creating order', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    showMessage('Error creating order: ' + error.message, 'error');
  }
}

// Load Dashboard
async function loadDashboard() {
  try {
    const orders = await api.getOrders();
    const customers = await api.getCustomers();

    // Calculate stats
    const totalOrders = orders.length;
    const activeOrders = orders.filter(o => !['Delivered', 'Cancelled'].includes(o.status)).length;
    const completedOrders = orders.filter(o => o.status === 'Delivered').length;
    const pendingPayments = orders.filter(o => {
      // This would need bill data, placeholder for now
      return o.status !== 'Delivered';
    }).length;

    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('activeOrders').textContent = activeOrders;
    document.getElementById('completedOrders').textContent = completedOrders;
    document.getElementById('pendingPayments').textContent = pendingPayments;

    // Load next deliveries
    const nextOrders = orders
      .filter(o => !['Delivered', 'Cancelled'].includes(o.status))
      .sort((a, b) => new Date(a.delivery_date) - new Date(b.delivery_date))
      .slice(0, 5);

    const deliveriesHtml = nextOrders.map(order => {
      const daysUntilDelivery = Math.ceil((new Date(order.delivery_date) - new Date()) / (1000 * 60 * 60 * 24));
      const isUrgent = daysUntilDelivery <= 2;
      const isNearDeadline = daysUntilDelivery <= 5;

      return `
        <div class="order-card ${isUrgent ? 'urgent' : isNearDeadline ? 'near-deadline' : ''}">
          <div class="card-header">
            <div class="card-title">${order.name} - ${order.model_design}</div>
            <span class="order-status status-${order.status.toLowerCase()}">${order.status}</span>
          </div>
          <div class="card-details">
            <div class="detail-item">
              <div class="detail-label">Delivery Date</div>
              <div class="detail-value">${new Date(order.delivery_date).toLocaleDateString()}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Days Left</div>
              <div class="detail-value ${isUrgent ? 'style="color: red"' : ''}">${daysUntilDelivery} days</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Cost</div>
              <div class="detail-value">₹${order.cost}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Phone</div>
              <div class="detail-value">${order.phone}</div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    document.getElementById('nextDeliveries').innerHTML = deliveriesHtml || '<p>No pending orders</p>';
  } catch (error) {
    console.error('Error loading dashboard:', error);
  }
}

// Load All Orders
async function loadAllOrders() {
  try {
    const orders = await api.getOrders();
    appState.orders = orders;

    const ordersHtml = orders.map(order => {
      const photoItems = (order.photos || []).map(photo => `
        <div class="order-photo-item">
          <img src="http://localhost:5000${photo}" alt="Order photo" onclick="openPhotoModal('${photo}')">
        </div>
      `).join('');

      const photosHtml = photoItems ? `
        <div class="order-photos">
          <h4>Photos</h4>
          <div class="order-photos-grid">
            ${photoItems}
          </div>
        </div>
      ` : '';

      return `
      <div class="order-card">
        <div class="card-header">
          <div class="card-title">${order.name} - ${order.model_design}</div>
          <span class="order-status status-${order.status.toLowerCase()}">${order.status}</span>
        </div>
        <div class="card-details">
          <div class="detail-item">
            <div class="detail-label">Phone</div>
            <div class="detail-value">${order.phone}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Booking Date</div>
            <div class="detail-value">${new Date(order.order_date).toLocaleDateString()}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Delivery Date</div>
            <div class="detail-value">${new Date(order.delivery_date).toLocaleDateString()}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Cost</div>
            <div class="detail-value">₹${order.cost}</div>
          </div>
          ${order.measurements && order.measurements.type ? `
            <div class="detail-item">
              <div class="detail-label">Measurement Group</div>
              <div class="detail-value">${order.measurements.type}</div>
            </div>
          ` : ''}
        </div>
        ${photosHtml}
        <div class="timeline-steps">
          <div class="timeline-step ${order.status === 'Booked' || ['Cutting', 'Stitching', 'QC', 'Ready', 'Delivered'].includes(order.status) ? 'completed' : 'pending'}">
            <div class="timeline-label">Booked</div>
          </div>
          <div class="timeline-step ${order.status === 'Cutting' || ['Stitching', 'QC', 'Ready', 'Delivered'].includes(order.status) ? 'completed' : order.status === 'Booked' ? 'pending' : 'active'}">
            <div class="timeline-label">Cutting</div>
          </div>
          <div class="timeline-step ${order.status === 'Stitching' || ['QC', 'Ready', 'Delivered'].includes(order.status) ? 'completed' : order.status === 'Booked' || order.status === 'Cutting' ? 'pending' : 'active'}">
            <div class="timeline-label">Stitching</div>
          </div>
          <div class="timeline-step ${order.status === 'QC' || ['Ready', 'Delivered'].includes(order.status) ? 'completed' : order.status === 'Delivered' || order.status === 'Ready' ? 'active' : 'pending'}">
            <div class="timeline-label">QC</div>
          </div>
          <div class="timeline-step ${order.status === 'Ready' || order.status === 'Delivered' ? 'completed' : 'pending'}">
            <div class="timeline-label">Ready</div>
          </div>
          <div class="timeline-step ${order.status === 'Delivered' ? 'completed' : 'pending'}">
            <div class="timeline-label">Delivered</div>
          </div>
        </div>
        <div style="margin-top: 15px;">
          <select onchange="updateOrderStatus('${order.id}', this.value)" style="padding: 8px; border-radius: 6px; border: 1px solid #ccc;">
            <option value="">Change Status...</option>
            <option value="Booked">Booked</option>
            <option value="Cutting">Cutting</option>
            <option value="Stitching">Stitching</option>
            <option value="QC">Quality Check</option>
            <option value="Ready">Ready</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>
      </div>
    `;
    }).join('');

    document.getElementById('allOrders').innerHTML = ordersHtml || '<p>No orders yet</p>';
  } catch (error) {
    console.error('Error loading orders:', error);
  }
}

// Load Customers
async function loadCustomers() {
  try {
    const customers = await api.getCustomers();
    appState.customers = customers;

    // Apply filters
    const filteredCustomers = applyCustomerFilters(customers);

    const customersHtml = filteredCustomers.map(customer => `
      <div class="customer-card">
        <div class="card-header">
          <div class="card-title">${customer.name}</div>
        </div>
        <div class="card-details">
          <div class="detail-item">
            <div class="detail-label">Phone</div>
            <div class="detail-value">${customer.phone}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Email</div>
            <div class="detail-value">${customer.email || '-'}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Address</div>
            <div class="detail-value">${customer.address || '-'}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Joined</div>
            <div class="detail-value">${new Date(customer.created_at).toLocaleDateString()}</div>
          </div>
        </div>
      </div>
    `).join('');

    document.getElementById('customersList').innerHTML = customersHtml || '<p>No customers match the filter criteria</p>';
  } catch (error) {
    console.error('Error loading customers:', error);
  }
}

// Apply customer filters
function applyCustomerFilters(customers) {
  const phoneFilter = document.getElementById('phoneFilter').value.toLowerCase().trim();
  const joinedFromFilter = document.getElementById('joinedFromFilter').value;
  const joinedToFilter = document.getElementById('joinedToFilter').value;

  return customers.filter(customer => {
    // Phone number filter
    if (phoneFilter && !customer.phone.toLowerCase().includes(phoneFilter)) {
      return false;
    }

    // Joined date filters
    const joinedDate = new Date(customer.created_at);
    const fromDate = joinedFromFilter ? new Date(joinedFromFilter) : null;
    const toDate = joinedToFilter ? new Date(joinedToFilter) : null;

    if (fromDate && joinedDate < fromDate) {
      return false;
    }

    if (toDate && joinedDate > toDate) {
      return false;
    }

    return true;
  });
}

// Clear customer filters
function clearCustomerFilters() {
  document.getElementById('phoneFilter').value = '';
  document.getElementById('joinedFromFilter').value = '';
  document.getElementById('joinedToFilter').value = '';
  loadCustomers();
}

// Load Order Queue
async function loadOrderQueue() {
  try {
    const orders = await api.getOrderQueue();

    const queueHtml = orders.map(order => {
      const daysUntilDelivery = Math.ceil((new Date(order.delivery_date) - new Date()) / (1000 * 60 * 60 * 24));
      const isUrgent = daysUntilDelivery <= 2;
      const isNearDeadline = daysUntilDelivery <= 5;

      return `
        <div class="queue-item ${isUrgent ? 'urgent' : isNearDeadline ? 'near-deadline' : ''}">
          <div class="card-header">
            <div class="card-title">${order.name} - ${order.model_design}</div>
            <span class="order-status status-${order.status.toLowerCase()}">${order.status}</span>
          </div>
          <div class="card-details">
            <div class="detail-item">
              <div class="detail-label">Phone</div>
              <div class="detail-value">${order.phone}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Delivery Date</div>
              <div class="detail-value">${new Date(order.delivery_date).toLocaleDateString()}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Days Left</div>
              <div class="detail-value ${isUrgent ? 'style="color: red; font-weight: bold"' : ''}">
                ${isUrgent ? '🚨' : ''} ${daysUntilDelivery} days
              </div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Cost</div>
              <div class="detail-value">₹${order.cost}</div>
            </div>
          </div>
          ${order.cutting_deadline ? `
            <div style="background: #f0f0f0; padding: 10px; border-radius: 6px; margin-top: 10px; font-size: 0.9em;">
              <strong>Cutting Deadline:</strong> ${new Date(order.cutting_deadline).toLocaleDateString()}
              ${new Date(order.cutting_deadline) < new Date() ? ' ⚠️ OVERDUE' : ''}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    document.getElementById('orderQueue').innerHTML = queueHtml || '<p>No pending orders in queue</p>';
  } catch (error) {
    console.error('Error loading queue:', error);
  }
}

// Load Bills
async function loadBills() {
  try {
    const orders = await api.getOrders();
    const bills = [];

    // Fetch bills for all orders
    for (const order of orders) {
      try {
        const bill = await api.getBillByOrder(order.id);
        if (bill && bill.id) {
          bills.push({ ...bill, customer_name: order.name, customer_phone: order.phone });
        }
      } catch (e) {
        // Bill might not exist
      }
    }

    const billsHtml = bills.map(bill => {
      const pendingAmount = bill.amount - bill.paid_amount;
      const isPaid = pendingAmount === 0;

      return `
        <div class="bill-card">
          <div class="card-header">
            <div class="card-title">${bill.customer_name}</div>
            <span class="order-status ${isPaid ? 'status-delivered' : 'status-booked'}">${bill.payment_status}</span>
          </div>
          <div class="card-details">
            <div class="detail-item">
              <div class="detail-label">Bill #</div>
              <div class="detail-value">${bill.bill_number}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Phone</div>
              <div class="detail-value">${bill.customer_phone}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Total Amount</div>
              <div class="detail-value">₹${bill.amount}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Paid Amount</div>
              <div class="detail-value">₹${bill.paid_amount}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Pending</div>
              <div class="detail-value" style="${pendingAmount > 0 ? 'color: red' : 'color: green'}">₹${pendingAmount}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Bill Date</div>
              <div class="detail-value">${new Date(bill.bill_date).toLocaleDateString()}</div>
            </div>
          </div>
          <input type="number" placeholder="Amount paid" id="paid_${bill.id}" style="padding: 8px; border: 1px solid #ccc; border-radius: 6px; margin-top: 10px; width: 100%; margin-bottom: 10px;">
          <button onclick="recordPayment('${bill.id}', document.getElementById('paid_${bill.id}').value)" class="btn btn-small btn-success" style="width: 100%;">Record Payment</button>
        </div>
      `;
    }).join('');

    document.getElementById('billsList').innerHTML = billsHtml || '<p>No bills yet</p>';
  } catch (error) {
    console.error('Error loading bills:', error);
  }
}

// Update Order Status
async function updateOrderStatus(orderId, newStatus) {
  if (!newStatus) return;

  try {
    const response = await api.updateOrderStatus(orderId, newStatus);
    if (response.success) {
      showMessage('Order status updated', 'success');
      loadAllOrders();
      loadDashboard();
      loadOrderQueue();
    } else {
      showMessage('Error updating status', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    showMessage('Error: ' + error.message, 'error');
  }
}

// Record Payment
async function recordPayment(billId, amountPaid) {
  if (!amountPaid || parseFloat(amountPaid) <= 0) {
    showMessage('Please enter a valid amount', 'error');
    return;
  }

  try {
    const response = await api.updatePayment(billId, parseFloat(amountPaid), 'Partial');
    if (response.success) {
      showMessage('Payment recorded successfully', 'success');
      loadBills();
    } else {
      showMessage('Error recording payment', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    showMessage('Error: ' + error.message, 'error');
  }
}

// Show Message
function showMessage(message, type) {
  const messageDiv = document.getElementById('orderMessage');
  messageDiv.textContent = message;
  messageDiv.className = `message ${type}`;
  setTimeout(() => {
    messageDiv.className = 'message';
  }, 4000);
}
