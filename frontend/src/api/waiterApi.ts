import axiosInstance from "./axiosConfig";

export interface OrderModifier {
  id: string;
  name: string;
  price: number;
}

export interface OrderItem {
  id: string;
  menu_item_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  notes?: string;
  modifiers?: OrderModifier[];
}

export interface WaiterOrder {
  id: string;
  order_number: string;
  table_id: string;
  table_number?: string;
  customer_id?: string;
  customer_name?: string;
  status: string;
  total_price: number;
  special_instructions?: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface PendingOrdersParams {
  restaurant_id: string;
  table_id?: string;
}

export interface RejectOrderDto {
  restaurant_id: string;
  rejection_reason: string;
}

export interface AcceptOrderDto {
  restaurant_id: string;
}

// Get pending orders for waiter
export const getPendingOrders = async (
  params: PendingOrdersParams
): Promise<WaiterOrder[]> => {
  const response = await axiosInstance.get("/waiter/pending-orders", {
    params,
  });
  return response.data;
};

// Accept an order
export const acceptOrder = async (
  orderId: string,
  data: AcceptOrderDto
): Promise<WaiterOrder> => {
  const response = await axiosInstance.post(
    `/waiter/orders/${orderId}/accept`,
    data
  );
  return response.data;
};

// Reject an order
export const rejectOrder = async (
  orderId: string,
  data: RejectOrderDto
): Promise<WaiterOrder> => {
  const response = await axiosInstance.post(
    `/waiter/orders/${orderId}/reject`,
    data
  );
  return response.data;
};

// Mark order as served
export const serveOrder = async (
  orderId: string,
  restaurantId: string
): Promise<WaiterOrder> => {
  const response = await axiosInstance.post(`/waiter/orders/${orderId}/serve`, {
    restaurant_id: restaurantId,
  });
  return response.data;
};

// Get all restaurant orders (for waiter)
export const getRestaurantOrders = async (
  restaurantId: string,
  status?: string
): Promise<WaiterOrder[]> => {
  const params: any = { restaurant_id: restaurantId };
  if (status) params.status = status;
  const response = await axiosInstance.get("/waiter/orders", { params });
  return response.data;
};
