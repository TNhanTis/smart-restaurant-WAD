import axiosInstance from "./axiosConfig";
import { Notification } from "../types/socket.types";
import {
  GetNotificationsParams,
  GetNotificationsResponse,
} from "../types/notifications.types";
// Types

export const notificationsApi = {
  // GET /notifications - Lấy danh sách thông báo
  getNotifications: async (
    params?: GetNotificationsParams
  ): Promise<GetNotificationsResponse> => {
    const response = await axiosInstance.get<GetNotificationsResponse>(
      "/notifications",
      { params }
    );
    return response.data;
  },

  // GET /notifications/unread-count - Lấy số thông báo chưa đọc
  getUnreadCount: async (): Promise<number> => {
    const response = await axiosInstance.get<{ count: number }>(
      "/notifications/unread-count"
    );
    return response.data.count;
  },

  // PATCH /notifications/:id/read - Đánh dấu đã đọc
  markAsRead: async (id: string): Promise<void> => {
    await axiosInstance.patch(`/notifications/${id}/read`);
  },

  // PATCH /notifications/read-all - Đánh dấu tất cả đã đọc
  markAllAsRead: async (): Promise<void> => {
    await axiosInstance.patch("/notifications/read-all");
  },

  // DELETE /notifications/:id - Xóa thông báo
  deleteNotification: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/notifications/${id}`);
  },
};
