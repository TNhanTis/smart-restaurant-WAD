import { useState, useEffect } from "react";
import { usersApi } from "../../../api/usersApi";
import type { User, CreateUserData } from "../../../types/user.types";
import { useToast } from "../../../contexts/ToastContext";
import { useConfirm } from "../../../components/ConfirmDialog";
import { useAuth } from "../../../contexts/AuthContext";
import { useRestaurant } from "../../../contexts/RestaurantContext";

// All possible roles with restrictions (excluding customer as it has its own tab)
const ALL_ROLES = [
  {
    value: "admin",
    label: "Admin - Restaurant Administrator",
    forSuperAdminOnly: true,
  },
  {
    value: "waiter",
    label: "Waiter - Service Staff",
    forSuperAdminOnly: false,
  },
  {
    value: "kitchen",
    label: "Kitchen - Kitchen Staff",
    forSuperAdminOnly: false,
  },
];

export default function UsersTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const toast = useToast();
  const { confirm, ConfirmDialogComponent } = useConfirm();
  const { user } = useAuth();
  const { selectedRestaurant } = useRestaurant();

  const isSuperAdmin = user?.roles?.includes("super_admin");
  const isAdmin = user?.roles?.includes("admin") && !isSuperAdmin;

  // Filter available roles based on user type
  const AVAILABLE_ROLES = isSuperAdmin
    ? ALL_ROLES // SuperAdmin sees admin, waiter, kitchen (customer has its own tab)
    : ALL_ROLES.filter((r) => r.value === "waiter" || r.value === "kitchen"); // Admin sees only waiter and kitchen

  // Filters
  const [roleFilter, setRoleFilter] = useState<string>("");

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form data
  const [formData, setFormData] = useState<CreateUserData>({
    email: "",
    password: "",
    full_name: "",
    phone: "",
    roles: [],
  });

  // Load users
  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await usersApi.getAll(roleFilter || undefined);
      setUsers(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load users");
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.roles.length === 0) {
      toast.error("Please select at least one role");
      return;
    }

    try {
      // For admin creating waiter/kitchen, include restaurant_id
      const dataToSend = {
        ...formData,
        restaurant_id:
          isAdmin && selectedRestaurant ? selectedRestaurant.id : undefined,
      };

      await usersApi.create(dataToSend);
      setShowCreateModal(false);
      setFormData({
        email: "",
        password: "",
        full_name: "",
        phone: "",
        roles: [],
      });
      toast.success("User created successfully!");
      loadUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create user");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (formData.roles.length === 0) {
      toast.error("User must have at least one role");
      return;
    }

    try {
      await usersApi.update(selectedUser.id, {
        full_name: formData.full_name,
        phone: formData.phone,
        roles: formData.roles,
      });
      setShowEditModal(false);
      setSelectedUser(null);
      setFormData({
        email: "",
        password: "",
        full_name: "",
        phone: "",
        roles: [],
      });
      toast.success("User updated successfully!");
      loadUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update user");
    }
  };

  const handleDelete = async (id: string, email: string) => {
    const confirmed = await confirm(
      "Delete User",
      `Are you sure you want to delete user "${email}"?`,
    );
    if (!confirmed) return;

    try {
      await usersApi.delete(id);
      toast.success("User deleted successfully!");
      loadUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete user");
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      password: "",
      full_name: user.full_name || "",
      phone: user.phone || "",
      roles: user.roles,
    });
    setShowEditModal(true);
  };

  const toggleRole = (role: string) => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role],
    }));
  };

  return (
    <>
      {/* Filters & Actions */}
      <div className="filters">
        <div className="filter-group">
          <label>Role Filter:</label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            {AVAILABLE_ROLES.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            + Add User
          </button>
        </div>
      </div>

      {/* Users Grid */}
      {loading ? (
        <div className="loading" style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
          Loading users...
        </div>
      ) : error ? (
        <div className="error" style={{ padding: '1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '8px' }}>{error}</div>
      ) : (
        <div className="tables-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '1.5rem',
          marginTop: '1.5rem'
        }}>
          {users.map((user) => {
            // Get initials for avatar
            const initials = user.full_name
              ? user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
              : user.email.slice(0, 2).toUpperCase();

            // Deterministic color for avatar based on name
            const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];
            const colorIndex = (user.full_name || user.email).length % colors.length;
            const avatarColor = colors[colorIndex];

            return (
              <div key={user.id} className="table-card" style={{
                background: 'white',
                borderRadius: '20px',
                padding: '1.5rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
                transition: 'all 0.3s ease'
              }}>
                {/* Header: Avatar + Info */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  {/* Avatar */}
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: `${avatarColor}15`, // 15% opacity
                    color: avatarColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    flexShrink: 0
                  }}>
                    {initials}
                  </div>

                  {/* Name & Email (Hierarchy Reversed) */}
                  <div style={{ overflow: 'hidden' }}>
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: '700',
                      color: '#1e293b',
                      margin: '0 0 0.25rem 0',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {user.full_name || "Unnamed User"}
                    </h3>
                    <p style={{
                      fontSize: '0.875rem',
                      color: '#64748b',
                      margin: 0,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Role Badges */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {user.roles.map(role => {
                    let badgeStyle = { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' };

                    if (role === 'kitchen') badgeStyle = { bg: '#fff7ed', text: '#c2410c', border: '#ffedd5' }; // Orange
                    else if (role === 'waiter') badgeStyle = { bg: '#eff6ff', text: '#1d4ed8', border: '#dbeafe' }; // Blue
                    else if (role === 'admin' || role === 'super_admin') badgeStyle = { bg: '#f3e8ff', text: '#7e22ce', border: '#e9d5ff' }; // Purple

                    return (
                      <span key={role} style={{
                        background: badgeStyle.bg,
                        color: badgeStyle.text,
                        border: `1px solid ${badgeStyle.border}`,
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.025em'
                      }}>
                        {role}
                      </span>
                    );
                  })}
                </div>

                {/* Divider */}
                <div style={{ height: '1px', background: '#f1f5f9' }}></div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <button
                    onClick={() => openEditModal(user)}
                    className="btn"
                    style={{
                      flex: 1,
                      padding: '0.625rem',
                      background: 'white',
                      border: '1px solid #cbd5e1',
                      borderRadius: '10px',
                      color: '#334155',
                      fontWeight: '600',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.2s',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = '#94a3b8';
                      e.currentTarget.style.background = '#f8fafc';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = '#cbd5e1';
                      e.currentTarget.style.background = 'white';
                    }}
                  >
                    ✏️ Edit Details
                  </button>

                  <button
                    onClick={() => handleDelete(user.id, user.email)}
                    className="btn"
                    style={{
                      padding: '0.625rem',
                      background: '#fee2e2',
                      border: 'none',
                      borderRadius: '10px',
                      color: '#ef4444',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                      width: '40px'
                    }}
                    title="Delete User"
                    onMouseOver={(e) => e.currentTarget.style.background = '#fecaca'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#fee2e2'}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {users.length === 0 && !loading && !error && (
        <div className="empty-state">
          <p>No users found. Create your first user!</p>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowCreateModal(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create New User</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="user@example.com"
                />
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Min 6 characters"
                />
              </div>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  placeholder="Optional"
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="Optional"
                />
              </div>
              <div className="form-group">
                <label>Roles * (Select at least one)</label>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {AVAILABLE_ROLES.map((role) => (
                    <label
                      key={role.value}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        cursor: "pointer",
                        padding: "8px",
                        background: formData.roles.includes(role.value)
                          ? "#6366f120"
                          : "transparent",
                        borderRadius: "6px",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.roles.includes(role.value)}
                        onChange={() => toggleRole(role.value)}
                      />
                      <span>{role.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={formData.roles.length === 0}
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Edit User</h2>
            <form onSubmit={handleEdit}>
              <div className="form-group">
                <label>Email (Read-only)</label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  style={{ background: "#e5e7eb", cursor: "not-allowed" }}
                />
              </div>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Roles</label>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {AVAILABLE_ROLES.map((role) => (
                    <label
                      key={role.value}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        cursor: "pointer",
                        padding: "8px",
                        background: formData.roles.includes(role.value)
                          ? "#6366f120"
                          : "transparent",
                        borderRadius: "6px",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.roles.includes(role.value)}
                        onChange={() => toggleRole(role.value)}
                      />
                      <span>{role.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={formData.roles.length === 0}
                >
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialogComponent />
    </>
  );
}
