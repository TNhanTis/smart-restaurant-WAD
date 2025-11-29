import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
  register: (data: any) => api.post("/auth/register", data),
};

// Tenants API
export const tenantsAPI = {
  getAll: () => api.get("/tenants"),
  getById: (id: string) => api.get(`/tenants/${id}`),
  getBySlug: (slug: string) => api.get(`/tenants/slug/${slug}`),
  create: (data: any) => api.post("/tenants", data),
  update: (id: string, data: any) => api.patch(`/tenants/${id}`, data),
};

// Menus API
export const menusAPI = {
  getAll: (tenantId: string, category?: string) =>
    api.get("/menus", { params: { tenantId, category } }),
  getById: (id: string) => api.get(`/menus/${id}`),
  create: (data: any) => api.post("/menus", data),
  update: (id: string, data: any) => api.patch(`/menus/${id}`, data),
  delete: (id: string) => api.delete(`/menus/${id}`),
};

// Tables API
export const tablesAPI = {
  getAll: (tenantId: string) => api.get("/tables", { params: { tenantId } }),
  getById: (id: string) => api.get(`/tables/${id}`),
  getByQRCode: (qrCode: string) => api.get(`/tables/qr/${qrCode}`),
  create: (data: any) => api.post("/tables", data),
};

// Orders API
export const ordersAPI = {
  getAll: (tenantId: string, status?: string) =>
    api.get("/orders", { params: { tenantId, status } }),
  getById: (id: string) => api.get(`/orders/${id}`),
  create: (data: any) => api.post("/orders", data),
  updateStatus: (id: string, status: string) =>
    api.patch(`/orders/${id}/status`, { status }),
};

// Payments API
export const paymentsAPI = {
  getByOrderId: (orderId: string) => api.get(`/payments/order/${orderId}`),
  create: (data: any) => api.post("/payments", data),
};
