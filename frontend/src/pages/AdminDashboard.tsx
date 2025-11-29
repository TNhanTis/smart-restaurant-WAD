import { useAuthStore } from "@/store/auth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { menusAPI, tablesAPI, ordersAPI } from "@/lib/api";
import { QRCodeSVG } from "qrcode.react";

export function AdminDashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"overview" | "orders">("overview");
  const [menus, setMenus] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({ orders: 0, revenue: 0, menuCount: 0 });
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [editingMenu, setEditingMenu] = useState<any>(null);
  const [menuForm, setMenuForm] = useState({
    name: "",
    description: "",
    price: 0,
    category: "",
    image: "",
  });
  const [tableForm, setTableForm] = useState({
    tableNumber: "",
    capacity: 4,
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      loadData();
    }
  }, [user, navigate]);

  const loadData = async () => {
    try {
      const tenantId = user?.tenantId || user?._id;
      if (!tenantId) {
        console.error("No tenantId found");
        return;
      }

      console.log("Loading data for tenantId:", tenantId);

      // Load menus
      const menuRes = await menusAPI.getAll(tenantId);
      console.log("Menus loaded:", menuRes.data.length);
      setMenus(menuRes.data);

      // Load tables
      const tableRes = await tablesAPI.getAll(tenantId);
      console.log("Tables loaded:", tableRes.data.length);
      setTables(tableRes.data);

      // Load orders
      const orderRes = await ordersAPI.getAll(tenantId);
      console.log("Orders loaded:", orderRes.data);
      setOrders(orderRes.data);

      const todayOrders = orderRes.data.filter((o: any) => {
        const orderDate = new Date(o.createdAt);
        const today = new Date();
        return orderDate.toDateString() === today.toDateString();
      });

      const revenue = todayOrders.reduce(
        (sum: number, o: any) => sum + o.total,
        0
      );

      setStats({
        orders: todayOrders.length,
        revenue,
        menuCount: menuRes.data.length,
      });
    } catch (error: any) {
      console.error("Error loading data:", error);
      console.error("Error details:", error.response?.data);
      alert(
        `Lỗi tải dữ liệu: ${error.response?.data?.message || error.message}`
      );
    }
  };

  const handleCreateMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tenantId = user?.tenantId || user?._id;
      await menusAPI.create({ ...menuForm, tenantId });
      setShowMenuModal(false);
      setMenuForm({
        name: "",
        description: "",
        price: 0,
        category: "",
        image: "",
      });
      loadData();
    } catch (error) {
      console.error("Error creating menu:", error);
    }
  };

  const handleUpdateMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await menusAPI.update(editingMenu._id, menuForm);
      setShowMenuModal(false);
      setEditingMenu(null);
      setMenuForm({
        name: "",
        description: "",
        price: 0,
        category: "",
        image: "",
      });
      loadData();
    } catch (error) {
      console.error("Error updating menu:", error);
    }
  };

  const handleDeleteMenu = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa món này?")) return;
    try {
      await menusAPI.delete(id);
      loadData();
    } catch (error) {
      console.error("Error deleting menu:", error);
    }
  };

  const openEditMenu = (menu: any) => {
    setEditingMenu(menu);
    setMenuForm({
      name: menu.name,
      description: menu.description,
      price: menu.price,
      category: menu.category,
      image: menu.image || "",
    });
    setShowMenuModal(true);
  };

  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tenantId = user?.tenantId || user?._id;
      await tablesAPI.create({ ...tableForm, tenantId });
      setShowTableModal(false);
      setTableForm({ tableNumber: "", capacity: 4 });
      loadData();
    } catch (error) {
      console.error("Error creating table:", error);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      // Convert lowercase frontend status to uppercase backend enum
      const backendStatus = status.toUpperCase();
      await ordersAPI.updateStatus(orderId, backendStatus);
      loadData();
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Không thể cập nhật trạng thái đơn hàng");
    }
  };

  const completeTableOrders = async (orderIds: string[]) => {
    try {
      if (
        !confirm(
          `Xác nhận thanh toán và hoàn thành ${orderIds.length} đơn hàng?`
        )
      ) {
        return;
      }
      // Update all orders to completed status
      await Promise.all(
        orderIds.map((id) => ordersAPI.updateStatus(id, "COMPLETED"))
      );
      // Wait a bit before reloading to ensure backend updates
      await new Promise((resolve) => setTimeout(resolve, 500));
      await loadData();
      alert("Đã thanh toán thành công!");
    } catch (error) {
      console.error("Error completing table orders:", error);
      alert("Không thể hoàn thành thanh toán");
    }
  };

  const getStatusColor = (status: string) => {
    const normalizedStatus = status?.toLowerCase();
    const colors: any = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      preparing: "bg-purple-100 text-purple-800",
      ready: "bg-green-100 text-green-800",
      completed: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
      served: "bg-green-100 text-green-800",
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/order-history")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              📊 Lịch sử đơn hàng
            </button>
            <button
              onClick={logout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex gap-4">
            <button
              onClick={() => setActiveTab("overview")}
              className={`pb-3 px-1 border-b-2 font-medium ${
                activeTab === "overview"
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Tổng quan
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`pb-3 px-1 border-b-2 font-medium flex items-center gap-2 ${
                activeTab === "orders"
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Đơn hàng
              {orders.filter((o) => o.status === "pending").length > 0 && (
                <span className="bg-red-600 text-white text-xs rounded-full px-2 py-0.5">
                  {orders.filter((o) => o.status === "pending").length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <>
            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-600 text-sm font-medium">
                  Đơn hàng hôm nay
                </h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.orders}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-600 text-sm font-medium">Doanh thu</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.revenue.toLocaleString("vi-VN")}đ
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-600 text-sm font-medium">Món ăn</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.menuCount}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Menu Management */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Quản lý Menu</h2>
                  <button
                    onClick={() => {
                      setEditingMenu(null);
                      setMenuForm({
                        name: "",
                        description: "",
                        price: 0,
                        category: "",
                        image: "",
                      });
                      setShowMenuModal(true);
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    Thêm món mới
                  </button>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {menus.map((menu) => (
                    <div
                      key={menu._id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded"
                    >
                      <div>
                        <p className="font-medium">{menu.name}</p>
                        <p className="text-sm text-gray-600">
                          {menu.price.toLocaleString("vi-VN")}đ
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditMenu(menu)}
                          className="text-blue-600 hover:text-blue-800 px-2 py-1"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteMenu(menu._id)}
                          className="text-red-600 hover:text-red-800 px-2 py-1"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Table Management */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Quản lý Bàn & QR</h2>
                  <button
                    onClick={() => setShowTableModal(true)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    Thêm bàn mới
                  </button>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {tables.map((table) => (
                    <div
                      key={table._id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded"
                    >
                      <div>
                        <p className="font-medium">Bàn {table.tableNumber}</p>
                        <p className="text-sm text-gray-600">
                          Sức chứa: {table.capacity} người
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedTable(table);
                          setShowQRModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 border border-blue-600 rounded hover:bg-blue-50"
                      >
                        Xem QR
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                Quản lý Đơn hàng (Theo bàn)
              </h2>
              <button
                onClick={loadData}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                🔄 Làm mới
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                Chưa có đơn hàng nào
              </div>
            ) : (
              <div className="grid gap-4">
                {/* Group orders by table */}
                {Object.entries(
                  orders
                    .filter(
                      (o) =>
                        !["completed", "cancelled"].includes(
                          o.status?.toLowerCase()
                        )
                    )
                    .reduce((acc: any, order) => {
                      const tableId = order.tableId?._id || "unknown";
                      if (!acc[tableId]) {
                        acc[tableId] = {
                          tableNumber: order.tableId?.tableNumber || "N/A",
                          orders: [],
                          totalAmount: 0,
                        };
                      }
                      acc[tableId].orders.push(order);
                      acc[tableId].totalAmount += order.total || 0;
                      return acc;
                    }, {})
                ).map(([tableId, tableData]: [string, any]) => (
                  <div
                    key={tableId}
                    className="bg-white rounded-lg shadow p-6 border-l-4 border-red-600"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-xl">
                          🍽️ Bàn {tableData.tableNumber}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {tableData.orders.length} đơn hàng
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-red-600">
                          {tableData.totalAmount.toLocaleString("vi-VN")}đ
                        </p>
                        <p className="text-xs text-gray-500">Tổng cộng</p>
                        <button
                          onClick={() =>
                            completeTableOrders(
                              tableData.orders.map((o: any) => o._id)
                            )
                          }
                          className="mt-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium"
                        >
                          💳 Thanh toán
                        </button>
                      </div>
                    </div>

                    {/* List all orders for this table */}
                    <div className="space-y-4">
                      {tableData.orders.map((order: any) => (
                        <div
                          key={order._id}
                          className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-bold">
                                Đơn #{order._id.slice(-6)}
                              </h4>
                              <p className="text-xs text-gray-600">
                                {new Date(order.createdAt).toLocaleString(
                                  "vi-VN"
                                )}
                              </p>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                order.status
                              )}`}
                            >
                              {getStatusText(order.status)}
                            </span>
                          </div>

                          <div className="mb-3">
                            <h5 className="font-medium text-sm mb-2">
                              Món đã đặt:
                            </h5>
                            <div className="space-y-1">
                              {order.items?.map((item: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="flex justify-between text-sm"
                                >
                                  <span>
                                    {item.menuId?.name || item.name || "Món ăn"}{" "}
                                    x{item.quantity || 0}
                                  </span>
                                  <span className="text-gray-600">
                                    {(item.price || 0).toLocaleString("vi-VN")}đ
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex flex-wrap justify-between items-center gap-2 pt-3 border-t">
                            <span className="font-bold text-base">
                              Tiền: {(order.total || 0).toLocaleString("vi-VN")}
                              đ
                            </span>
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() =>
                                  updateOrderStatus(order._id, "confirmed")
                                }
                                disabled={
                                  order.status?.toLowerCase() !== "pending"
                                }
                                className={`px-3 py-1.5 text-sm rounded whitespace-nowrap ${
                                  order.status?.toLowerCase() === "pending"
                                    ? "bg-blue-600 text-white hover:bg-blue-700"
                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                }`}
                              >
                                ✓ Xác nhận
                              </button>
                              <button
                                onClick={() =>
                                  updateOrderStatus(order._id, "preparing")
                                }
                                disabled={
                                  order.status?.toLowerCase() !== "confirmed"
                                }
                                className={`px-3 py-1.5 text-sm rounded whitespace-nowrap ${
                                  order.status?.toLowerCase() === "confirmed"
                                    ? "bg-purple-600 text-white hover:bg-purple-700"
                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                }`}
                              >
                                👨‍🍳 Bắt đầu nấu
                              </button>
                              <button
                                onClick={() =>
                                  updateOrderStatus(order._id, "ready")
                                }
                                disabled={
                                  order.status?.toLowerCase() !== "preparing"
                                }
                                className={`px-3 py-1.5 text-sm rounded whitespace-nowrap ${
                                  order.status?.toLowerCase() === "preparing"
                                    ? "bg-green-600 text-white hover:bg-green-700"
                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                }`}
                              >
                                ✓ Hoàn thành
                              </button>
                              <button
                                onClick={() =>
                                  updateOrderStatus(order._id, "cancelled")
                                }
                                disabled={["completed", "cancelled"].includes(
                                  order.status?.toLowerCase()
                                )}
                                className={`px-3 py-1.5 text-sm rounded whitespace-nowrap ${
                                  !["completed", "cancelled"].includes(
                                    order.status?.toLowerCase()
                                  )
                                    ? "bg-red-600 text-white hover:bg-red-700"
                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                }`}
                              >
                                ✕ Hủy
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Menu Modal */}
      {showMenuModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">
              {editingMenu ? "Sửa món ăn" : "Thêm món mới"}
            </h3>
            <form onSubmit={editingMenu ? handleUpdateMenu : handleCreateMenu}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Tên món
                  </label>
                  <input
                    type="text"
                    value={menuForm.name}
                    onChange={(e) =>
                      setMenuForm({ ...menuForm, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Mô tả
                  </label>
                  <textarea
                    value={menuForm.description}
                    onChange={(e) =>
                      setMenuForm({ ...menuForm, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Giá (VNĐ)
                  </label>
                  <input
                    type="number"
                    value={menuForm.price}
                    onChange={(e) =>
                      setMenuForm({
                        ...menuForm,
                        price: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Danh mục
                  </label>
                  <input
                    type="text"
                    value={menuForm.category}
                    onChange={(e) =>
                      setMenuForm({ ...menuForm, category: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="VD: Món chính, Đồ uống..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    URL Hình ảnh
                  </label>
                  <input
                    type="text"
                    value={menuForm.image}
                    onChange={(e) =>
                      setMenuForm({ ...menuForm, image: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
                >
                  {editingMenu ? "Cập nhật" : "Thêm"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMenuModal(false);
                    setEditingMenu(null);
                    setMenuForm({
                      name: "",
                      description: "",
                      price: 0,
                      category: "",
                      image: "",
                    });
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && selectedTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full text-center">
            <h3 className="text-2xl font-bold mb-2">
              QR Code - Bàn {selectedTable.tableNumber}
            </h3>
            <p className="text-gray-600 mb-6">
              Khách hàng quét mã để xem menu và đặt món
            </p>

            <div className="bg-white p-6 rounded-lg inline-block shadow-lg">
              <QRCodeSVG
                value={`${window.location.origin}/menu/${selectedTable.qrCode}`}
                size={256}
                level="H"
                includeMargin={true}
              />
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Link menu:</p>
              <p className="text-xs font-mono text-blue-600 break-all">
                {window.location.origin}/menu/{selectedTable.qrCode}
              </p>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  const link = `${window.location.origin}/menu/${selectedTable.qrCode}`;
                  navigator.clipboard.writeText(link);
                  alert("Đã copy link!");
                }}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                📋 Copy Link
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
              >
                🖨️ In QR
              </button>
              <button
                onClick={() => {
                  setShowQRModal(false);
                  setSelectedTable(null);
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table Modal */}
      {showTableModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Thêm bàn mới</h3>
            <form onSubmit={handleCreateTable}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Số bàn
                  </label>
                  <input
                    type="text"
                    value={tableForm.tableNumber}
                    onChange={(e) =>
                      setTableForm({
                        ...tableForm,
                        tableNumber: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="VD: 01, A1, B2..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Sức chứa (người)
                  </label>
                  <input
                    type="number"
                    value={tableForm.capacity}
                    onChange={(e) =>
                      setTableForm({
                        ...tableForm,
                        capacity: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    min="1"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
                >
                  Tạo bàn
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowTableModal(false);
                    setTableForm({ tableNumber: "", capacity: 4 });
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
