import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface OrderItem {
  id?: string;
  menu_item_id: string;
  name?: string;
  quantity: number;
  price?: number;
  notes?: string;
  modifiers?: Array<{
    id: string;
    name: string;
    price: number;
  }>;
}

// DTO for creating orders (matches backend expectations)
export interface CreateOrderItemDto {
  menu_item_id: string;
  quantity: number;
  special_requests?: string;
  modifiers?: Array<{
    modifier_option_id: string;
  }>;
}

export interface Order {
  id: string;
  order_number?: string;
  table_id: string;
  customer_id?: string;
  status: string;
  total_price?: number;
  tax?: number;
  discount?: number;
  special_instructions?: string;
  items?: OrderItem[];
  created_at: string;
  updated_at?: string;
}

export interface GetOrdersParams {
  status?: string;
  search?: string;
  table?: string;
  date?: string;
  page?: number;
  limit?: number;
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
}

export const ordersApi = {
  // Get all orders with filters
  async getAll(params?: GetOrdersParams): Promise<OrdersResponse | Order[]> {
    try {
      const response = await api.get("/api/orders", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw error;
    }
  },

  // Get single order by ID
  async getById(id: string): Promise<Order> {
    try {
      const response = await api.get(`/api/orders/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching order:", error);
      throw error;
    }
  },

  // Create new order
  async create(orderData: {
    restaurant_id: string;
    table_id: string;
    customer_id?: string;
    session_id?: string;
    items: CreateOrderItemDto[];
    special_requests?: string;
  }): Promise<Order> {
    try {
      const response = await api.post("/api/orders", orderData);
      return response.data;
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  },

  // Update order status
  async updateStatus(id: string, status: string): Promise<Order> {
    try {
      const response = await api.patch(`/api/orders/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  },

  // Update order
  async update(id: string, orderData: Partial<Order>): Promise<Order> {
    try {
      const response = await api.patch(`/api/orders/${id}`, orderData);
      return response.data;
    } catch (error) {
      console.error("Error updating order:", error);
      throw error;
    }
  },

  // Delete order
  async delete(id: string): Promise<void> {
    try {
      await api.delete(`/api/orders/${id}`);
    } catch (error) {
      console.error("Error deleting order:", error);
      throw error;
    }
  },

  // Get orders by table
  async getByTable(tableId: string): Promise<Order[]> {
    try {
      const response = await api.get(`/api/orders/table/${tableId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching orders by table:", error);
      throw error;
    }
  },

  // Get orders by customer
  async getByCustomer(customerId: string): Promise<Order[]> {
    try {
      const response = await api.get(`/api/orders/customer/${customerId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching orders by customer:", error);
      throw error;
    }
  },

  async getOrderStatus(orderId: string): Promise<any> {
    try {
      const response = await api.get(`/api/orders/${orderId}/status`);
      return response.data;
    } catch (error) {
      console.error("Error fetching order status:", error);
      throw error;
    }
  },

  async getOrderById(orderId: string): Promise<any> {
    try {
      const response = await api.get(`/api/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching order details:", error);
      throw error;
    }
  },

  async addItemsToOrder(orderId: string, items: any[]): Promise<any> {
    try {
      const response = await api.post(`/api/orders/${orderId}/add-items`, { items });
      return response.data;
    } catch (error) {
      console.error("Error adding items to order:", error);
      throw error;
    }
  },
};

export default ordersApi;
