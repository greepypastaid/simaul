import api from '@/lib/axios';

/**
 * Dashboard Service
 */
export const dashboardService = {
  getStats: () => api.get('/dashboard'),
  getRevenue: (params) => api.get('/dashboard/revenue', { params }),
  getServicesReport: (params) => api.get('/dashboard/services', { params }),
  getCustomersReport: (params) => api.get('/dashboard/customers', { params }),
  getOperations: () => api.get('/dashboard/operations'),
};

/**
 * Order Service
 */
export const orderService = {
  getAll: (params) => api.get('/orders', { params }),
  getStats: () => api.get('/orders/stats'),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  confirm: (id) => api.post(`/orders/${id}/confirm`),
  updateStatus: (id, data) => api.patch(`/orders/${id}/status`, data),
  updatePayment: (id, data) => api.patch(`/orders/${id}/payment`, data),
};

/**
 * Customer Service
 */
export const customerService = {
  getAll: (params) => api.get('/customers', { params }),
  search: (query) => api.get('/customers/search', { params: { query } }),
  getTopCustomers: () => api.get('/customers/top'),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
  getOrders: (id, params) => api.get(`/customers/${id}/orders`, { params }),
  adjustPoints: (id, data) => api.post(`/customers/${id}/points`, data),
};

/**
 * Service Service (Layanan)
 */
export const serviceService = {
  getAll: (params) => api.get('/services', { params }),
  getById: (id) => api.get(`/services/${id}`),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
  updateMaterials: (id, data) => api.put(`/services/${id}/materials`, data),
  toggleActive: (id) => api.post(`/services/${id}/toggle-active`),
};

/**
 * Material Service
 */
export const materialService = {
  getAll: (params) => api.get('/materials', { params }),
  getLowStock: () => api.get('/materials/low-stock'),
  getStockStatus: () => api.get('/materials/stock-status'),
  getById: (id) => api.get(`/materials/${id}`),
  create: (data) => api.post('/materials', data),
  update: (id, data) => api.put(`/materials/${id}`, data),
  delete: (id) => api.delete(`/materials/${id}`),
  getHistory: (id, params) => api.get(`/materials/${id}/history`, { params }),
  addStock: (id, data) => api.post(`/materials/${id}/add-stock`, data),
  adjustStock: (id, data) => api.post(`/materials/${id}/adjust-stock`, data),
  toggleActive: (id) => api.post(`/materials/${id}/toggle-active`),
};

/**
 * Tracking Service
 */
export const trackingService = {
  track: (trackingCode) => api.get(`/tracking/${trackingCode}`),
};

/**
 * Booking Service (Public)
 */
export const bookingService = {
  create: (data) => api.post('/bookings', data),
  getServices: () => api.get('/services'),
};

export default {
  dashboard: dashboardService,
  orders: orderService,
  customers: customerService,
  services: serviceService,
  materials: materialService,
  tracking: trackingService,
  booking: bookingService,
};
