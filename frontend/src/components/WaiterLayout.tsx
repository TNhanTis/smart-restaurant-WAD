import { ReactNode, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSocket } from "../contexts/SocketContext";
import toast from "react-hot-toast";
import "./WaiterLayout.css";

// Audio notification
const playNotificationSound = () => {
  const audio = new Audio('/notification.mp3');
  audio.volume = 0.5;
  audio.play().catch(() => {
    // Ignore audio play errors (user may not have interacted with page yet)
  });
};

interface WaiterLayoutProps {
  children: ReactNode;
}

export default function WaiterLayout({ children }: WaiterLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const mountedRef = useRef(false);

  // Global notification listener for waiter
  useEffect(() => {
    if (!socket || mountedRef.current) return;
    mountedRef.current = true;

    // New order notification
    socket.on("new_order", (data: any) => {
      console.log("🔔 New order received:", data);
      playNotificationSound();
      toast.custom(
        (t) => (
          <div
            className={`waiter-notification ${t.visible ? 'show' : ''}`}
            onClick={() => {
              toast.dismiss(t.id);
              navigate("/waiter/orders");
            }}
          >
            <div className="notification-icon">📋</div>
            <div className="notification-content">
              <strong>New Order!</strong>
              <p>Table {data.table_number || 'N/A'} - Order #{data.order_number || 'New'}</p>
            </div>
          </div>
        ),
        { duration: 5000, position: "top-right" }
      );
    });

    // New bill request notification (listen to both event names)
    const handleBillRequest = (data: any) => {
      console.log("🔔 New bill request received:", data);
      playNotificationSound();
      toast.custom(
        (t) => (
          <div
            className={`waiter-notification bill-request ${t.visible ? 'show' : ''}`}
            onClick={() => {
              toast.dismiss(t.id);
              navigate("/waiter/bill-requests");
            }}
          >
            <div className="notification-icon">💳</div>
            <div className="notification-content">
              <strong>New Bill Request!</strong>
              <p>Table {data.table_number || 'N/A'} requests bill</p>
            </div>
          </div>
        ),
        { duration: 5000, position: "top-right" }
      );
    };
    socket.on("new_bill_request", handleBillRequest);
    socket.on("bill_request_created", handleBillRequest);

    // Order updated notification
    socket.on("order_updated", (data: any) => {
      if (data.status === "READY") {
        console.log("🔔 Order ready:", data);
        toast.custom(
          (t) => (
            <div
              className={`waiter-notification order-ready ${t.visible ? 'show' : ''}`}
              onClick={() => {
                toast.dismiss(t.id);
                navigate("/waiter/orders");
              }}
            >
              <div className="notification-icon">✅</div>
              <div className="notification-content">
                <strong>Order Ready!</strong>
                <p>Order #{data.order_number || 'N/A'} is ready to serve</p>
              </div>
            </div>
          ),
          { duration: 5000, position: "top-right" }
        );
      }
    });

    return () => {
      socket.off("new_order");
      socket.off("new_bill_request");
      socket.off("bill_request_created");
      socket.off("order_updated");
      mountedRef.current = false;
    };
  }, [socket, navigate]);

  const handleLogout = () => {
    // TODO: Implement logout logic
    navigate("/admin/login");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="waiter-layout">
      {/* Sidebar */}
      <div className="waiter-sidebar">
        <div className="sidebar-logo">
          <span style={{ fontSize: "30px" }}>🍴</span>
          <span>Waiter Panel</span>
        </div>

        <nav className="sidebar-nav">
          <Link
            to="/waiter/orders"
            className={`nav-link ${isActive("/waiter/orders") ? "active" : ""}`}
          >
            <span className="nav-icon">📋</span>
            Orders
          </Link>
          <Link
            to="/waiter/bill-requests"
            className={`nav-link ${isActive("/waiter/bill-requests") ? "active" : ""}`}
          >
            <span className="nav-icon">💳</span>
            Bill Requests
          </Link>
          <Link
            to="/waiter/tables"
            className={`nav-link ${isActive("/waiter/tables") ? "active" : ""}`}
          >
            <span className="nav-icon">🪑</span>
            Tables
          </Link>
          <Link
            to="/waiter/dashboard"
            className={`nav-link ${
              isActive("/waiter/dashboard") ? "active" : ""
            }`}
          >
            <span className="nav-icon">📊</span>
            Performance
          </Link>
        </nav>

        <div className="sidebar-footer">
          <div className="waiter-profile">
            <div className="waiter-avatar">TN</div>
            <div className="waiter-info">
              <div className="waiter-name">Waiter</div>
              <div className="waiter-role">Staff</div>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-link">
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="waiter-main">{children}</div>
    </div>
  );
}
