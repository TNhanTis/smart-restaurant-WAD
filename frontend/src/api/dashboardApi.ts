import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface DashboardStats {
  todayRevenue: number;
  todayOrders: number;
  occupiedTables: number;
  totalTables: number;
  occupancyRate: number;
  avgPrepTime: number;
  revenueChange: number;
  ordersChange: number;
  weeklyRevenue?: Array<{
    day: string;
    revenue: number;
  }>;
  topItems?: Array<{
    name: string;
    orders: number;
    revenue: number;
  }>;
}

export const dashboardApi = {
  // Get dashboard statistics
  async getStats(): Promise<DashboardStats> {
    try {
      const response = await api.get("/dashboard/stats");
      return response.data;
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      // Return mock data if API fails
      return {
        todayRevenue: 2458,
        todayOrders: 48,
        occupiedTables: 12,
        totalTables: 20,
        occupancyRate: 60,
        avgPrepTime: 18,
        revenueChange: 12,
        ordersChange: 8,
        weeklyRevenue: [
          { day: "Mon", revenue: 1200 },
          { day: "Tue", revenue: 1500 },
          { day: "Wed", revenue: 900 },
          { day: "Thu", revenue: 1800 },
          { day: "Fri", revenue: 1700 },
          { day: "Sat", revenue: 2000 },
          { day: "Sun", revenue: 1400 },
        ],
        topItems: [
          { name: "Grilled Salmon", orders: 124, revenue: 2232 },
          { name: "Pasta Carbonara", orders: 98, revenue: 1470 },
          { name: "Beef Steak", orders: 76, revenue: 1900 },
          { name: "Caesar Salad", orders: 65, revenue: 780 },
        ],
      };
    }
  },

  // Get revenue data for charts
  async getRevenueData(period: "week" | "month" = "week"): Promise<any> {
    try {
      const response = await api.get("/dashboard/revenue", {
        params: { period },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching revenue data:", error);
      throw error;
    }
  },

  // Get top selling items
  async getTopItems(limit: number = 10): Promise<any> {
    try {
      const response = await api.get("/dashboard/top-items", {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching top items:", error);
      throw error;
    }
  },
};
