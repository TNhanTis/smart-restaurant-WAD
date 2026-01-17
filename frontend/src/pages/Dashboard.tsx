import { useState, useEffect } from "react";
import { dashboardApi, DashboardStats } from "../api/dashboardApi";
import { ordersApi, Order } from "../api/ordersApi";
import OrderStatusBadge from "../components/OrderStatusBadge";
import "../App.css";

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, ordersData] = await Promise.all([
        dashboardApi.getStats(),
        ordersApi.getAll({ limit: 5 }),
      ]);

      setStats(statsData);
      setRecentOrders(
        Array.isArray(ordersData) ? ordersData : ordersData.data || []
      );
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load dashboard data");
      console.error("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const orderDate = new Date(date);
    const diffInMinutes = Math.floor(
      (now.getTime() - orderDate.getTime()) / 60000
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hr ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="sidebar-logo">
          <span style={{ fontSize: "30px" }}>🍴</span>
          <span>Smart Restaurant</span>
        </div>

        <nav className="sidebar-nav">
          <a href="/admin/dashboard" className="nav-link active">
            <span className="nav-icon">📊</span>
            Dashboard
          </a>
          <a href="/admin/orders" className="nav-link">
            <span className="nav-icon">📋</span>
            Orders
            {stats && stats.todayOrders > 0 && (
              <span className="nav-badge">{stats.todayOrders}</span>
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
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">
              Welcome back! Here's what's happening today.
            </p>
          </div>
          <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
            <button className="btn-secondary">📺 Open KDS</button>
            <button className="btn-primary">+ New Order</button>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center" }}>
            Loading dashboard...
          </div>
        ) : error ? (
          <div style={{ padding: "40px", textAlign: "center", color: "red" }}>
            {error}
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div
                  className="stat-icon"
                  style={{ background: "#e8f8f5", color: "#27ae60" }}
                >
                  💰
                </div>
                <div className="stat-content">
                  <div className="stat-value">
                    {formatCurrency(stats?.todayRevenue || 0)}
                  </div>
                  <div className="stat-label">Today's Revenue</div>
                  <div className="stat-change positive">
                    ↑ {stats?.revenueChange || 0}% from yesterday
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div
                  className="stat-icon"
                  style={{ background: "#ebf5fb", color: "#3498db" }}
                >
                  📦
                </div>
                <div className="stat-content">
                  <div className="stat-value">{stats?.todayOrders || 0}</div>
                  <div className="stat-label">Orders Today</div>
                  <div className="stat-change positive">
                    ↑ {stats?.ordersChange || 0}% from yesterday
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div
                  className="stat-icon"
                  style={{ background: "#fef9e7", color: "#f39c12" }}
                >
                  🪑
                </div>
                <div className="stat-content">
                  <div className="stat-value">
                    {stats?.occupiedTables || 0}/{stats?.totalTables || 0}
                  </div>
                  <div className="stat-label">Tables Occupied</div>
                  <div className="stat-change">
                    {stats?.occupancyRate || 0}% occupancy
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div
                  className="stat-icon"
                  style={{ background: "#fdedec", color: "#e74c3c" }}
                >
                  ⏳
                </div>
                <div className="stat-content">
                  <div className="stat-value">
                    {stats?.avgPrepTime || 0} min
                  </div>
                  <div className="stat-label">Avg. Prep Time</div>
                  <div
                    className={`stat-change ${(stats?.avgPrepTime || 0) > 15 ? "negative" : ""
                      }`}
                  >
                    {(stats?.avgPrepTime || 0) > 15 ? "↑" : "✓"}{" "}
                    {Math.abs((stats?.avgPrepTime || 0) - 15)} min from target
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="charts-row">
              {/* Revenue Chart */}
              <div className="chart-card">
                <div className="chart-header">
                  <h3>Revenue This Week</h3>
                  <select className="chart-filter">
                    <option>This Week</option>
                    <option>Last Week</option>
                    <option>This Month</option>
                  </select>
                </div>
                <div className="chart-placeholder">
                  <div className="bar-chart">
                    {stats?.weeklyRevenue?.map((day, index) => (
                      <div
                        key={index}
                        className={`bar ${index === 5 ? "active" : ""}`}
                        style={{
                          height: `${(day.revenue /
                              Math.max(
                                ...(stats.weeklyRevenue?.map((d) => d.revenue) || [1])
                              )) *
                            100
                            }%`,
                        }}
                      >
                        <span>{day.day}</span>
                      </div>
                    )) || (
                        <>
                          <div className="bar" style={{ height: "60%" }}>
                            <span>Mon</span>
                          </div>
                          <div className="bar" style={{ height: "75%" }}>
                            <span>Tue</span>
                          </div>
                          <div className="bar" style={{ height: "45%" }}>
                            <span>Wed</span>
                          </div>
                          <div className="bar" style={{ height: "90%" }}>
                            <span>Thu</span>
                          </div>
                          <div className="bar" style={{ height: "85%" }}>
                            <span>Fri</span>
                          </div>
                          <div className="bar active" style={{ height: "100%" }}>
                            <span>Sat</span>
                          </div>
                          <div className="bar" style={{ height: "70%" }}>
                            <span>Sun</span>
                          </div>
                        </>
                      )}
                  </div>
                </div>
              </div>

              {/* Popular Items */}
              <div className="chart-card">
                <div className="chart-header">
                  <h3>Top Selling Items</h3>
                  <a href="#" className="view-all">
                    View All
                  </a>
                </div>
                <div className="top-items">
                  {stats?.topItems && stats.topItems.length > 0 ? (
                    stats.topItems.map((item, index) => (
                      <div key={index} className="top-item">
                        <span className="top-rank">{index + 1}</span>
                        <span className="top-icon">🍴</span>
                        <div className="top-info">
                          <div className="top-name">{item.name}</div>
                          <div className="top-stats">
                            {item.orders} orders |{" "}
                            {formatCurrency(item.revenue)}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="top-item">
                        <span className="top-rank">1</span>
                        <span className="top-icon">🍴</span>
                        <div className="top-info">
                          <div className="top-name">Grilled Salmon</div>
                          <div className="top-stats">124 orders | $2,232</div>
                        </div>
                      </div>
                      <div className="top-item">
                        <span className="top-rank">2</span>
                        <span className="top-icon">🍝</span>
                        <div className="top-info">
                          <div className="top-name">Pasta Carbonara</div>
                          <div className="top-stats">98 orders | $1,470</div>
                        </div>
                      </div>
                      <div className="top-item">
                        <span className="top-rank">3</span>
                        <span className="top-icon">🥩</span>
                        <div className="top-info">
                          <div className="top-name">Beef Steak</div>
                          <div className="top-stats">76 orders | $1,900</div>
                        </div>
                      </div>
                      <div className="top-item">
                        <span className="top-rank">4</span>
                        <span className="top-icon">🥗</span>
                        <div className="top-info">
                          <div className="top-name">Caesar Salad</div>
                          <div className="top-stats">65 orders | $780</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="table-card">
              <div className="table-header">
                <h3>Recent Orders</h3>
                <a href="/admin/orders" className="view-all">
                  View All Orders →
                </a>
              </div>
              {recentOrders.length > 0 ? (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Table</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td>#{order.order_number || order.id.slice(0, 8)}</td>
                        <td>Table {order.table_id}</td>
                        <td>{order.items?.length || 0} items</td>
                        <td>{formatCurrency(order.total_price || 0)}</td>
                        <td>
                          <OrderStatusBadge
                            status={order.status}
                            showIcon={false}
                          />
                        </td>
                        <td>{getTimeAgo(order.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: "40px", textAlign: "center" }}>
                  No recent orders
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
