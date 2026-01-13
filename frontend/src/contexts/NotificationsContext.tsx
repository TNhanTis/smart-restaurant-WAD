import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useSocket } from "./SocketContext";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";
import { notificationsApi } from "../api/notificationsApi";
import { Notification } from "../types/socket.types";

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType>({
  notifications: [],
  unreadCount: 0,
  fetchNotifications: async () => {},
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  deleteNotification: async () => {},
});

export const useNotifications = () => useContext(NotificationsContext);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { socket } = useSocket();
  const { user } = useAuth();

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    try {
      const data = await notificationsApi.getNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unread_count);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(
    async (id: string) => {
      try {
        await notificationsApi.deleteNotification(id);
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        setUnreadCount((prev) => {
          const deleted = notifications.find((n) => n.id === id);
          return deleted && !deleted.is_read ? Math.max(0, prev - 1) : prev;
        });
      } catch (error) {
        console.error("Failed to delete notification:", error);
      }
    },
    [notifications]
  );

  // Listen to real-time events
  useEffect(() => {
    if (!socket || !user) return;

    // New order notification (for waiters)
    socket.on("new_order", (data) => {
      console.log("📦 New order notification:", data);
      toast("🔔 " + data.message, {
        icon: "📦",
        duration: 5000,
      });
      fetchNotifications();
    });

    // Order accepted (for kitchen & customer)
    socket.on("order_accepted", (data) => {
      console.log("✅ Order accepted:", data);
      toast.success(data.message);
      fetchNotifications();
    });

    // Order ready (for waiter & customer)
    socket.on("order_ready", (data) => {
      console.log("🍽️ Order ready:", data);
      toast("🍽️ " + data.message, {
        icon: "✅",
        duration: 5000,
      });
      fetchNotifications();
    });

    // Order status update (for customer)
    socket.on("order_status_update", (data) => {
      console.log("🔄 Order status update:", data);
      toast(data.message);
      fetchNotifications();
    });

    // Order rejected
    socket.on("order_rejected", (data) => {
      console.log("❌ Order rejected:", data);
      toast.error(data.message);
      fetchNotifications();
    });

    return () => {
      socket.off("new_order");
      socket.off("order_accepted");
      socket.off("order_ready");
      socket.off("order_status_update");
      socket.off("order_rejected");
    };
  }, [socket, user, fetchNotifications]);

  // Fetch notifications on mount
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, fetchNotifications]);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};
