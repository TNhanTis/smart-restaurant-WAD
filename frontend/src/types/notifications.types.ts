export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface GetNotificationsResponse {
  notifications: Notification[];
  unread_count: number;
  total: number;
}

export interface GetNotificationsParams {
  limit?: number;
  offset?: number;
}
