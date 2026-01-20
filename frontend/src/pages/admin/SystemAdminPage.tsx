import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import UsersTab from "./tabs/UsersTab";
import RestaurantsTab from "./tabs/RestaurantsTab";
import "../../App.css";

type TabType = "users" | "restaurants";

export default function SystemAdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>("users");
  const { user } = useAuth();
  const navigate = useNavigate();

  const isSuperAdmin = user?.roles?.includes("super_admin");
  const isAdmin = user?.roles?.includes("admin");

  // Only super_admin and admin can access
  if (!isSuperAdmin && !isAdmin) {
    return (
      <div className="app">
        <div
          style={{
            textAlign: "center",
            padding: "50px",
            background: "#1e293b",
            borderRadius: "12px",
            border: "2px solid #ef4444",
          }}
        >
          <h2 style={{ color: "#ef4444", marginBottom: "20px" }}>
            🚫 Access Denied
          </h2>
          <p style={{ color: "#cbd5e1" }}>
            Only Administrators can access system administration.
          </p>
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/")}
            style={{ marginTop: "20px" }}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Header */}
      {/* Header */}
      <header className="header" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '1.5rem',
        padding: '2.5rem 3rem',
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative Circles */}
        <div style={{ position: 'absolute', top: '-20%', right: '-5%', width: '300px', height: '300px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: '-40%', left: '-10%', width: '400px', height: '400px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>

        <div style={{ position: 'relative', zIndex: 1, color: 'white' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            color: 'white',
            margin: '0 0 0.5rem 0',
            lineHeight: 1.2,
            letterSpacing: '-0.025em',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)',
            WebkitTextFillColor: 'white'
          }}>
            {isSuperAdmin ? "System Administration" : "Staff Management"}
          </h1>
          <p style={{
            color: 'rgba(255, 255, 255, 0.9)',
            margin: 0,
            fontSize: '1.1rem',
            fontWeight: '500'
          }}>Manage users, permissions, and system settings</p>
        </div>

        <div style={{ position: 'relative', zIndex: 1, display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            onClick={() => navigate("/admin/dashboard")}
            style={{
              padding: '0.6rem 1rem',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '12px',
              backdropFilter: 'blur(4px)',
              cursor: 'pointer',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          >
            ← Back to Dashboard
          </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          borderBottom: "2px solid #334155",
          paddingBottom: "10px",
        }}
      >
        <button
          onClick={() => setActiveTab("users")}
          style={{
            padding: "12px 24px",
            fontSize: "16px",
            fontWeight: "600",
            border: "none",
            borderRadius: "8px 8px 0 0",
            cursor: "pointer",
            background: activeTab === "users" ? "#6366f1" : "#1e293b",
            color: activeTab === "users" ? "white" : "#94a3b8",
            transition: "all 0.3s ease",
            borderBottom:
              activeTab === "users"
                ? "3px solid #6366f1"
                : "3px solid transparent",
          }}
        >
          {isSuperAdmin ? "👥 All Users" : "👥 Staff (Waiter/Kitchen)"}
        </button>
        {isSuperAdmin && (
          <button
            onClick={() => setActiveTab("restaurants")}
            style={{
              padding: "12px 24px",
              fontSize: "16px",
              fontWeight: "600",
              border: "none",
              borderRadius: "8px 8px 0 0",
              cursor: "pointer",
              background: activeTab === "restaurants" ? "#6366f1" : "#1e293b",
              color: activeTab === "restaurants" ? "white" : "#94a3b8",
              transition: "all 0.3s ease",
              borderBottom:
                activeTab === "restaurants"
                  ? "3px solid #6366f1"
                  : "3px solid transparent",
            }}
          >
            🏪 Restaurants
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "users" && <UsersTab />}
        {activeTab === "restaurants" && isSuperAdmin && <RestaurantsTab />}
      </div>
    </div>
  );
}
