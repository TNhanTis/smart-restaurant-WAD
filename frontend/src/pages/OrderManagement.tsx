import { useState, useEffect } from "react";
import { ordersApi, Order } from "../api/ordersApi";
import OrderDetailModal, { OrderDetail } from "../components/OrderDetailModal";
import OrderStatusBadge from "../components/OrderStatusBadge";
import "../App.css";

type OrderStatus = "all" | "pending" | "preparing" | "ready" | "completed";

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<OrderStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [tableFilter, setTableFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("today");

  // Modal
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const ordersPerPage = 10;

  // Load orders
  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await ordersApi.getAll({
        status: statusFilter === "all" ? undefined : statusFilter,
        search: searchQuery || undefined,
        table: tableFilter || undefined,
        date: dateFilter,
        page: currentPage,
        limit: ordersPerPage,
      });
      setOrders(data.orders || data);
      setTotalOrders(data.total || data.length);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load orders");
      console.error("Failed to load orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter, searchQuery, tableFilter, dateFilter, currentPage]);

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      await ordersApi.updateStatus(orderId, "preparing");
      loadOrders();
    } catch (err) {
      console.error("Failed to accept order:", err);
    }
  };

  const handleMarkReady = async (orderId: string) => {
    try {
      await ordersApi.updateStatus(orderId, "ready");
      loadOrders();
    } catch (err) {
      console.error("Failed to mark order as ready:", err);
    }
  };

  const handleCompleteOrder = async (orderId: string) => {
    try {
      await ordersApi.updateStatus(orderId, "completed");
      loadOrders();
    } catch (err) {
      console.error("Failed to complete order:", err);
    }
  };

  const convertToOrderDetail = (order: Order): OrderDetail => {
    return {
      id: order.id,
      order_number: order.order_number || `ORD-${order.id.slice(-6)}`,
      table_id: order.table_id,
      table_number: order.table?.table_number,
      customer_id: order.customer_id,
      customer_name: order.customer?.full_name,
      status: order.status,
      total_price: order.total_price,
      special_instructions: order.special_instructions,
      items:
        order.items?.map((item) => ({
          id: item.id,
          menu_item_id: item.menu_item_id,
          name: item.menu_item?.name || "Unknown Item",
          quantity: item.quantity,
          unit_price: item.unit_price,
          notes: item.notes,
          modifiers: item.modifiers?.map((m) => ({
            id: m.id,
            name: m.name || m.modifier_option?.name || "Unknown Modifier",
            price: m.price_adjustment || 0,
          })),
        })) || [],
      created_at: order.created_at,
      updated_at: order.updated_at,
    };
  };

  const getStatusCount = (status: OrderStatus) => {
    if (status === "all") return totalOrders;
    return orders.filter((o) => o.status.toLowerCase() === status).length;
  };

  const filteredOrders = orders;

  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = Math.min(startIndex + ordersPerPage, totalOrders);

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="sidebar-logo">
          <span style={{ fontSize: "30px" }}>🍴</span>
          <span>Smart Restaurant</span>
        </div>

        <nav className="sidebar-nav">
          <a href="/admin/dashboard" className="nav-link">
            <span className="nav-icon">📊</span>
            Dashboard
          </a>
          <a href="/admin/orders" className="nav-link active">
            <span className="nav-icon">📋</span>
            Orders
            {getStatusCount("pending") > 0 && (
              <span className="nav-badge">{getStatusCount("pending")}</span>
            )}
          </a>
          <a href="/menu" className="nav-link">
            <span className="nav-icon">🍴</span>
            Menu Items
          </a>
          <a href="/categories" className="nav-link">
            <span className="nav-icon">📁</span>
            Categories
          </a>
          <a href="/" className="nav-link">
            <span className="nav-icon">🪑</span>
            Tables
          </a>
          <a href="/admin/reports" className="nav-link">
            <span className="nav-icon">📈</span>
            Reports
          </a>
          <a href="/admin/kds" className="nav-link">
            <span className="nav-icon">📺</span>
            Kitchen Display
          </a>
        </nav>

        <div className="sidebar-footer">
          <div className="admin-profile">
            <div className="admin-avatar">JD</div>
            <div className="admin-info">
              <div className="admin-name">John Doe</div>
              <div className="admin-role">Restaurant Admin</div>
            </div>
          </div>
          <a href="/admin/login" className="logout-link">
            🚪 Logout
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        {/* Header */}
        <div className="admin-header">
          <div>
            <h1 className="page-title">Orders</h1>
            <p className="page-subtitle">Manage and track all orders</p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn-secondary">📺 Open KDS</button>
            <button className="btn-primary">+ Manual Order</button>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="status-tabs">
          <button
            className={`status-tab ${statusFilter === "all" ? "active" : ""}`}
            onClick={() => setStatusFilter("all")}
          >
            All Orders
            <span className="tab-count">{totalOrders}</span>
          </button>
          <button
            className={`status-tab ${
              statusFilter === "pending" ? "active" : ""
            }`}
            onClick={() => setStatusFilter("pending")}
          >
            Received
            <span className="tab-count warning">
              {getStatusCount("pending")}
            </span>
          </button>
          <button
            className={`status-tab ${
              statusFilter === "preparing" ? "active" : ""
            }`}
            onClick={() => setStatusFilter("preparing")}
          >
            Preparing
            <span className="tab-count">{getStatusCount("preparing")}</span>
          </button>
          <button
            className={`status-tab ${statusFilter === "ready" ? "active" : ""}`}
            onClick={() => setStatusFilter("ready")}
          >
            Ready
            <span className="tab-count success">{getStatusCount("ready")}</span>
          </button>
          <button
            className={`status-tab ${
              statusFilter === "completed" ? "active" : ""
            }`}
            onClick={() => setStatusFilter("completed")}
          >
            Completed
            <span className="tab-count">{getStatusCount("completed")}</span>
          </button>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <div className="search-box">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search by order ID or table..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="filter-select"
            value={tableFilter}
            onChange={(e) => setTableFilter(e.target.value)}
          >
            <option value="">All Tables</option>
            <option value="1">Table 1</option>
            <option value="2">Table 2</option>
            <option value="3">Table 3</option>
            <option value="4">Table 4</option>
            <option value="5">Table 5</option>
          </select>
          <select
            className="filter-select"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>

        {/* Orders Table */}
        <div className="table-card">
          {loading ? (
            <div style={{ padding: "40px", textAlign: "center" }}>
              Loading orders...
            </div>
          ) : error ? (
            <div style={{ padding: "40px", textAlign: "center", color: "red" }}>
              {error}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center" }}>
              No orders found
            </div>
          ) : (
            <>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Table</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Time</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className={
                        order.status === "pending"
                          ? "new-order"
                          : order.status === "completed"
                          ? "completed-row"
                          : ""
                      }
                    >
                      <td>
                        <strong>#{order.order_number || order.id}</strong>
                      </td>
                      <td>Table {order.table_id}</td>
                      <td>
                        <div className="order-items-preview">
                          {order.items?.slice(0, 2).map((item, idx) => (
                            <span key={idx}>
                              {item.quantity}x {item.name || item.menu_item_id}
                            </span>
                          ))}
                          {order.items && order.items.length > 2 && (
                            <span className="more">
                              +{order.items.length - 2} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td>${order.total_price?.toFixed(2) || "0.00"}</td>
                      <td>
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td>{new Date(order.created_at).toLocaleTimeString()}</td>
                      <td>
                        <div style={{ display: "flex", gap: "5px" }}>
                          {order.status === "pending" && (
                            <button
                              className="btn-action accept"
                              onClick={() => handleAcceptOrder(order.id)}
                            >
                              Accept
                            </button>
                          )}
                          {order.status === "preparing" && (
                            <button
                              className="btn-action ready"
                              onClick={() => handleMarkReady(order.id)}
                            >
                              Mark Ready
                            </button>
                          )}
                          {order.status === "ready" && (
                            <button
                              className="btn-action complete"
                              onClick={() => handleCompleteOrder(order.id)}
                            >
                              Complete
                            </button>
                          )}
                          <button
                            className="btn-action view"
                            onClick={() => handleViewDetails(order)}
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="pagination">
                <button
                  className="page-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  ← Previous
                </button>
                <span className="page-info">
                  Showing {startIndex + 1}-{endIndex} of {totalOrders} orders
                </span>
                <button
                  className="page-btn"
                  disabled={endIndex >= totalOrders}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next →
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <OrderDetailModal
          order={convertToOrderDetail(selectedOrder)}
          role="admin"
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
}
