import { useState, useEffect } from "react";
import { usersApi } from "../../../api/usersApi";
import type { User, CreateUserData } from "../../../types/user.types";
import { useToast } from "../../../contexts/ToastContext";
import { useConfirm } from "../../../components/ConfirmDialog";

// Only customer role
const AVAILABLE_ROLES = [{ value: "customer", label: "Customer - End User" }];

export default function CustomersTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const toast = useToast();
  const { confirm, ConfirmDialogComponent } = useConfirm();

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
    roles: ["customer"], // Default to customer
  });

  // Load users with customer role
  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await usersApi.getAll("customer");
      setUsers(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load users");
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await usersApi.create(formData);
      setShowCreateModal(false);
      setFormData({
        email: "",
        password: "",
        full_name: "",
        phone: "",
        roles: ["customer"],
      });
      toast.success("Customer created successfully!");
      loadUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create customer");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

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
        roles: ["customer"],
      });
      toast.success("Customer updated successfully!");
      loadUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update customer");
    }
  };

  const handleDelete = async (id: string, email: string) => {
    const confirmed = await confirm(
      "Delete Customer",
      `Are you sure you want to delete customer "${email}"?`,
    );
    if (!confirmed) return;

    try {
      await usersApi.delete(id);
      toast.success("Customer deleted successfully!");
      loadUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete customer");
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

  return (
    <>
      {/* Actions */}
      <div className="filters">
        <div style={{ color: "#94a3b8" }}>Total: {users.length} customers</div>
        <div style={{ marginLeft: "auto" }}>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            + Add Customer
          </button>
        </div>
      </div>

      {/* Users Grid */}
      {loading ? (
        <div className="loading">Loading customers...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <div className="tables-grid">
          {users.map((user) => (
            <div key={user.id} className="table-card">
              <div className="table-header">
                <h3>{user.email}</h3>
                <span className={`status-badge ${user.status}`}>
                  {user.status}
                </span>
              </div>
              <div className="table-body">
                {user.full_name && (
                  <p>
                    <strong>Name:</strong> {user.full_name}
                  </p>
                )}
                {user.phone && (
                  <p>
                    <strong>Phone:</strong> {user.phone}
                  </p>
                )}
                <p>
                  <strong>Roles:</strong>{" "}
                  <span
                    style={{
                      display: "flex",
                      gap: "5px",
                      flexWrap: "wrap",
                      marginTop: "5px",
                    }}
                  >
                    {user.roles.map((role) => (
                      <span
                        key={role}
                        style={{
                          background: "#6366f1",
                          color: "white",
                          padding: "3px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                        }}
                      >
                        {role}
                      </span>
                    ))}
                  </span>
                </p>
                <p style={{ fontSize: "12px", color: "#94a3b8" }}>
                  Created: {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="table-actions">
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => openEditModal(user)}
                >
                  ✏️ Edit
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(user.id, user.email)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {users.length === 0 && !loading && !error && (
        <div className="empty-state">
          <p>No customers found. Create your first customer!</p>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowCreateModal(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Customer</h2>
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
                  placeholder="customer@example.com"
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
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Customer
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
            <h2>Edit Customer</h2>
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
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Customer
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
