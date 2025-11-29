import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ordersAPI } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

export function OrderHistoryPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [dateRange, setDateRange] = useState<
    "today" | "week" | "month" | "all"
  >("today");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadOrders();
  }, [selectedDate, dateRange]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const tenantId = user?.tenantId || user?._id;
      if (!tenantId) return;

      const response = await ordersAPI.getAll(tenantId);
      const allOrders = response.data;

      // Filter orders based on selected date range
      const filtered = allOrders.filter((order: any) => {
        const orderDate = new Date(order.createdAt);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        switch (dateRange) {
          case "today":
            const selectedDateObj = new Date(selectedDate);
            selectedDateObj.setHours(0, 0, 0, 0);
            const nextDay = new Date(selectedDateObj);
            nextDay.setDate(nextDay.getDate() + 1);
            return orderDate >= selectedDateObj && orderDate < nextDay;

          case "week":
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return orderDate >= weekAgo;

          case "month":
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return orderDate >= monthAgo;

          case "all":
            return true;

          default:
            return true;
        }
      });

      setOrders(
        filtered.sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

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

  // Group orders by date
  const groupedOrders = orders.reduce((acc: any, order: any) => {
    const date = new Date(order.createdAt).toLocaleDateString("vi-VN");
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(order);
    return acc;
  }, {});

  const totalRevenue = orders
    .filter((o) => o.status?.toLowerCase() === "completed")
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const completedOrders = orders.filter(
    (o) => o.status?.toLowerCase() === "completed"
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-red-600 text-white p-6">
        <div className="container mx-auto">
          <button
            onClick={() => navigate("/admin")}
            className="mb-4 flex items-center gap-2 hover:opacity-80"
          >
            ← Quay lại Dashboard
          </button>
          <h1 className="text-2xl font-bold">📊 Lịch sử Đơn hàng</h1>
          <p className="text-red-100">Xem chi tiết đơn hàng theo ngày</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date Range Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Khoảng thời gian
              </label>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => {
                    setDateRange("today");
                    setSelectedDate(new Date().toISOString().split("T")[0]);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    dateRange === "today"
                      ? "bg-red-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Hôm nay
                </button>
                <button
                  onClick={() => setDateRange("week")}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    dateRange === "week"
                      ? "bg-red-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  7 ngày
                </button>
                <button
                  onClick={() => setDateRange("month")}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    dateRange === "month"
                      ? "bg-red-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  30 ngày
                </button>
                <button
                  onClick={() => setDateRange("all")}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    dateRange === "all"
                      ? "bg-red-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Tất cả
                </button>
              </div>
            </div>

            {/* Date Picker */}
            {dateRange === "today" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn ngày cụ thể
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                />
              </div>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Tổng đơn hàng</p>
            <p className="text-3xl font-bold text-gray-900">{orders.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Đơn hoàn thành</p>
            <p className="text-3xl font-bold text-green-600">
              {completedOrders}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Doanh thu</p>
            <p className="text-3xl font-bold text-red-600">
              {totalRevenue.toLocaleString("vi-VN")}đ
            </p>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            Không có đơn hàng nào trong khoảng thời gian này
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedOrders).map(
              ([date, dateOrders]: [string, any]) => (
                <div key={date} className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    📅 {date}
                    <span className="text-sm font-normal text-gray-600">
                      ({dateOrders.length} đơn)
                    </span>
                  </h2>

                  <div className="space-y-3">
                    {dateOrders.map((order: any) => (
                      <div
                        key={order._id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-red-300 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-medium text-lg">
                              Đơn #{order.orderNumber || order._id.slice(-6)}
                            </p>
                            <p className="text-sm text-gray-600">
                              🍽️ Bàn {order.tableId?.tableNumber || "N/A"} •{" "}
                              {new Date(order.createdAt).toLocaleTimeString(
                                "vi-VN"
                              )}
                            </p>
                          </div>
                          <div className="text-right">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                order.status
                              )}`}
                            >
                              {getStatusText(order.status)}
                            </span>
                            <p className="text-lg font-bold text-red-600 mt-2">
                              {(order.total || 0).toLocaleString("vi-VN")}đ
                            </p>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="border-t pt-3">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Món đã đặt:
                          </p>
                          <div className="space-y-1">
                            {order.items?.map((item: any, idx: number) => (
                              <div
                                key={idx}
                                className="flex justify-between text-sm"
                              >
                                <span className="text-gray-600">
                                  {item.menuId?.name || item.name || "Món ăn"} x
                                  {item.quantity}
                                </span>
                                <span className="text-gray-900">
                                  {(
                                    item.price * item.quantity || 0
                                  ).toLocaleString("vi-VN")}
                                  đ
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Date Summary */}
                  <div className="mt-4 pt-4 border-t flex justify-between items-center">
                    <span className="font-medium text-gray-700">
                      Tổng cộng ({date}):
                    </span>
                    <span className="text-xl font-bold text-red-600">
                      {dateOrders
                        .filter(
                          (o: any) => o.status?.toLowerCase() === "completed"
                        )
                        .reduce(
                          (sum: number, o: any) => sum + (o.total || 0),
                          0
                        )
                        .toLocaleString("vi-VN")}
                      đ
                    </span>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
