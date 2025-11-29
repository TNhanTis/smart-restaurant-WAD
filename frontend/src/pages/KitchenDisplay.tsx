import { useEffect, useState } from "react";
import { ordersAPI } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

export function KitchenDisplay() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
    // Refresh every 10 seconds
    const interval = setInterval(loadOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      const tenantId = user?.tenantId || user?._id;
      if (!tenantId) return;

      const response = await ordersAPI.getAll(tenantId);
      // Only show orders that are not completed or cancelled
      const activeOrders = response.data.filter(
        (order: any) =>
          !["completed", "cancelled"].includes(order.status?.toLowerCase())
      );
      setOrders(activeOrders);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const backendStatus = status.toUpperCase();
      await ordersAPI.updateStatus(orderId, backendStatus);
      loadOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const getOrdersByStatus = (status: string) => {
    return orders.filter((order) => order.status?.toLowerCase() === status);
  };

  const OrderCard = ({ order }: { order: any }) => (
    <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-yellow-500">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-bold text-lg">Đơn #{order._id.slice(-6)}</p>
          <p className="text-sm text-gray-400">
            Bàn {order.tableId?.tableNumber}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(order.createdAt).toLocaleTimeString("vi-VN")}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">{order.items.length} món</p>
          <p className="font-bold text-yellow-400">
            {(order.total || 0).toLocaleString("vi-VN")}đ
          </p>
        </div>
      </div>

      <div className="space-y-2 mb-3">
        {order.items.map((item: any, index: number) => (
          <div key={index} className="bg-gray-700 p-2 rounded">
            <div className="flex justify-between">
              <span className="font-medium">
                {item.menuId?.name || "Món ăn"}
              </span>
              <span className="text-yellow-400">x{item.quantity}</span>
            </div>
            {item.notes && (
              <p className="text-sm text-gray-400 italic mt-1">
                📝 {item.notes}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        {order.status === "pending" && (
          <button
            onClick={() => updateOrderStatus(order._id, "confirmed")}
            className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded font-medium"
          >
            Xác nhận
          </button>
        )}
        {order.status === "confirmed" && (
          <button
            onClick={() => updateOrderStatus(order._id, "preparing")}
            className="flex-1 bg-purple-600 hover:bg-purple-700 py-2 rounded font-medium"
          >
            Bắt đầu nấu
          </button>
        )}
        {order.status === "preparing" && (
          <button
            onClick={() => updateOrderStatus(order._id, "ready")}
            className="flex-1 bg-green-600 hover:bg-green-700 py-2 rounded font-medium"
          >
            Hoàn thành
          </button>
        )}
        {order.status === "ready" && (
          <button
            onClick={() => updateOrderStatus(order._id, "completed")}
            className="flex-1 bg-gray-600 hover:bg-gray-700 py-2 rounded font-medium"
          >
            Đã giao
          </button>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Kitchen Display System</h1>
          <p className="text-gray-400 mt-2">
            Tổng đơn đang xử lý: {orders.length}
          </p>
        </div>
        <button
          onClick={loadOrders}
          className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg"
        >
          🔄 Làm mới
        </button>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Pending Orders */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-yellow-400 text-lg font-bold mb-4 flex items-center gap-2">
            <span>⏳</span>
            CHỜ XÁC NHẬN ({getOrdersByStatus("pending").length})
          </h3>
          <div className="space-y-4">
            {getOrdersByStatus("pending").map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        </div>

        {/* Confirmed Orders */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-blue-400 text-lg font-bold mb-4 flex items-center gap-2">
            <span>✅</span>
            ĐÃ XÁC NHẬN ({getOrdersByStatus("confirmed").length})
          </h3>
          <div className="space-y-4">
            {getOrdersByStatus("confirmed").map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        </div>

        {/* Preparing Orders */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-purple-400 text-lg font-bold mb-4 flex items-center gap-2">
            <span>👨‍🍳</span>
            ĐANG NẤU ({getOrdersByStatus("preparing").length})
          </h3>
          <div className="space-y-4">
            {getOrdersByStatus("preparing").map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        </div>

        {/* Ready Orders */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-green-400 text-lg font-bold mb-4 flex items-center gap-2">
            <span>🍽️</span>
            SẴN SÀNG ({getOrdersByStatus("ready").length})
          </h3>
          <div className="space-y-4">
            {getOrdersByStatus("ready").map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
