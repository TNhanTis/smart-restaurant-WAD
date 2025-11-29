import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ordersAPI, tablesAPI } from "@/lib/api";

export function OrderPage() {
  const { orderId, qrCode } = useParams();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [table, setTable] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();

    // Auto-refresh every 5 seconds for real-time status updates
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, [orderId, qrCode]);

  const loadOrders = async () => {
    try {
      if (orderId) {
        // Load single order by ID
        const response = await ordersAPI.getById(orderId!);
        setOrders([response.data]);
        setTable(response.data.tableId);
      } else if (qrCode) {
        // Load all orders for this table via QR code
        const tableRes = await tablesAPI.getByQRCode(qrCode!);
        setTable(tableRes.data);

        const tenantId =
          typeof tableRes.data.tenantId === "string"
            ? tableRes.data.tenantId
            : tableRes.data.tenantId?._id;

        const orderRes = await ordersAPI.getAll(tenantId);
        console.log(
          "All orders:",
          orderRes.data.map((o: any) => ({
            id: o._id.slice(-6),
            status: o.status,
            table: o.tableId?.tableNumber,
          }))
        );
        // Filter orders for this specific table that are not completed/cancelled
        const tableOrders = orderRes.data.filter(
          (o: any) =>
            (o.tableId?._id === tableRes.data._id ||
              o.tableId === tableRes.data._id) &&
            !["completed", "cancelled"].includes(o.status?.toLowerCase())
        );
        console.log(
          "Filtered table orders:",
          tableOrders.map((o: any) => ({
            id: o._id.slice(-6),
            status: o.status,
          }))
        );
        setOrders(tableOrders);
      }
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">Không có đơn hàng nào</p>
          <button
            onClick={() => navigate("/")}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const normalizedStatus = status?.toLowerCase();
    const colors: any = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      preparing: "bg-purple-100 text-purple-800",
      ready: "bg-green-100 text-green-800",
      served: "bg-green-100 text-green-800",
      completed: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[normalizedStatus] || "bg-gray-100 text-gray-800";
  };

  const getStatusText = (status: string) => {
    const normalizedStatus = status?.toLowerCase();
    const texts: any = {
      pending: "Chờ xác nhận",
      confirmed: "Đã xác nhận",
      preparing: "Đang chuẩn bị",
      ready: "Sẵn sàng",
      served: "Đã phục vụ",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
    };
    return texts[normalizedStatus] || status;
  };

  const totalAmount = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-red-600 text-white p-6">
        <div className="container mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-2 hover:opacity-80"
          >
            ← Quay lại
          </button>
          <h1 className="text-2xl font-bold">
            Đơn hàng - Bàn {table?.tableNumber || "N/A"}
          </h1>
          <p className="text-red-100">{orders.length} đơn hàng</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Orders List */}
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow-md p-6">
              {/* Order Header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b">
                <div>
                  <p className="text-sm text-gray-500">Mã đơn</p>
                  <p className="font-medium">#{order._id?.slice(-8)}</p>
                </div>
                <span
                  className={`px-4 py-2 rounded-full font-medium ${getStatusColor(
                    order.status
                  )}`}
                >
                  {getStatusText(order.status)}
                </span>
              </div>

              {/* Order Time */}
              <p className="text-sm text-gray-600 mb-3">
                {new Date(order.createdAt).toLocaleString("vi-VN")}
              </p>

              {/* Order Items */}
              <div className="space-y-2 mb-4">
                {order.items?.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {item.menuId?.name || item.name || "Món ăn"}
                      </p>
                      {item.notes && (
                        <p className="text-xs text-gray-500 italic">
                          {item.notes}
                        </p>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm text-gray-600">x{item.quantity}</p>
                      <p className="font-medium text-red-600 text-sm">
                        {(item.price || 0).toLocaleString("vi-VN")}đ
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Total */}
              <div className="flex justify-between items-center pt-3 border-t">
                <span className="font-bold">Tổng:</span>
                <span className="font-bold text-red-600">
                  {(order.total || 0).toLocaleString("vi-VN")}đ
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold">Tổng cộng tất cả:</span>
            <span className="text-2xl font-bold text-red-600">
              {totalAmount.toLocaleString("vi-VN")}đ
            </span>
          </div>
        </div>

        {/* All Items Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-4">
          <h2 className="text-lg font-bold mb-4">📋 Danh sách món đã đặt</h2>
          <div className="space-y-2">
            {orders
              .flatMap((order) => order.items || [])
              .reduce((acc: any[], item: any) => {
                const existing = acc.find(
                  (i) =>
                    i.menuId?._id === item.menuId?._id || i.name === item.name
                );
                if (existing) {
                  existing.quantity += item.quantity;
                } else {
                  acc.push({ ...item });
                }
                return acc;
              }, [])
              .map((item: any, index: number) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-2 border-b last:border-b-0"
                >
                  <div className="flex-1">
                    <p className="font-medium">
                      {item.menuId?.name || item.name || "Món ăn"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600">x{item.quantity}</p>
                    <p className="font-medium text-red-600">
                      {((item.price || 0) * item.quantity).toLocaleString(
                        "vi-VN"
                      )}
                      đ
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-bold hover:bg-gray-700"
          >
            ← Quay lại menu
          </button>
          {qrCode && (
            <button
              onClick={() => navigate(`/menu/${qrCode}`)}
              className="flex-1 bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700"
            >
              + Thêm món
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
