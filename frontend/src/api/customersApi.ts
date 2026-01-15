import axios from './axiosConfig';

export interface CustomerProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  created_at: string;
}

export interface UpdateProfileData {
  email?: string;
  full_name?: string;
  phone?: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
}

/**
 * Get customer profile
 */
export const getCustomerProfile = async (customerId: string): Promise<CustomerProfile> => {
  const response = await axios.get(`/api/customers/${customerId}`);
  return response.data;
};

/**
 * Update customer profile
 */
export const updateCustomerProfile = async (
  customerId: string,
  data: UpdateProfileData
): Promise<{ message: string; data: CustomerProfile }> => {
  const response = await axios.patch(`/api/customers/${customerId}`, data);
  return response.data;
};

/**
 * Change customer password
 */
export const changeCustomerPassword = async (
  customerId: string,
  data: ChangePasswordData
): Promise<{ message: string }> => {
  const response = await axios.patch(`/api/customers/${customerId}/password`, data);
  return response.data;
};

/**
 * Get customer order history
 */
export const getCustomerOrderHistory = async (
  customerId: string,
  filters?: {
    status?: string;
    restaurant_id?: string;
    start_date?: string;
    end_date?: string;
  }
): Promise<{ data: any[]; total: number }> => {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.restaurant_id) params.append('restaurant_id', filters.restaurant_id);
  if (filters?.start_date) params.append('start_date', filters.start_date);
  if (filters?.end_date) params.append('end_date', filters.end_date);

  const response = await axios.get(
    `/api/orders/customer/${customerId}${params.toString() ? '?' + params.toString() : ''}`
  );
  return response.data;
};
