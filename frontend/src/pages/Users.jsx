import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import apiClient from "../api/client";
import {
  Users2,
  Shield,
  Briefcase,
  Megaphone,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  Filter,
  X,
  UserCheck,
  AlertTriangle,
} from "lucide-react";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Create User Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "SALES_EXECUTIVE",
    department: "",
    phone: "",
  });

  // Toggle Confirm Modal State
  const [userToToggle, setUserToToggle] = useState(null);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get("/api/v1/users");
      setUsers(res?.data || []);
    } catch (err) {
      setError("Failed to fetch organization users. Please verify connectivity.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await apiClient.post("/api/v1/users", formData);
      setIsCreateOpen(false);
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "SALES_EXECUTIVE",
        department: "",
        phone: "",
      });
      setSuccessMsg(`User ${formData.name} successfully created.`);
      setTimeout(() => setSuccessMsg(null), 4000);
      fetchUsers();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to create user. Please check requirements."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmToggle = async () => {
    if (!userToToggle) return;
    setToggling(true);
    try {
      const newActive = !userToToggle.active;
      await apiClient.patch(`/api/v1/users/${userToToggle.id}/active?active=${newActive}`);
      setUserToToggle(null);
      setSuccessMsg(
        `User ${userToToggle.name} ${newActive ? "activated" : "deactivated"} successfully.`
      );
      setTimeout(() => setSuccessMsg(null), 4000);
      fetchUsers();
    } catch (err) {
      alert("Failed to update user status.");
    } finally {
      setToggling(false);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "ADMIN":
        return (
          <span className="badge badge-admin">
            <Shield size={12} /> Administrator
          </span>
        );
      case "DIGITAL_MARKETING_EXECUTIVE":
        return (
          <span className="badge badge-marketing">
            <Megaphone size={12} /> Marketing Executive
          </span>
        );
      case "SALES_EXECUTIVE":
        return (
          <span className="badge badge-sales">
            <Briefcase size={12} /> Sales Executive
          </span>
        );
      default:
        return <span className="badge">{role}</span>;
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(search.toLowerCase()));
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && u.active) ||
      (statusFilter === "INACTIVE" && !u.active);
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <Layout
      pageTitle="Team Governance & Access"
      pageSubtitle="Manage employee accounts, role assignments, and organizational access"
      headerAction={
        <button
          className="btn btn-primary"
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus size={16} />
          <span>Add Team Member</span>
        </button>
      }
    >
      {error && <div className="dash-error">{error}</div>}
      {successMsg && <div className="alert-success">{successMsg}</div>}

      {/* Filter / Search Bar */}
      <div className="filter-bar">
        <div className="filter-group">
          <div className="search-input-wrapper">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search by name, email, department..."
              className="form-control"
              style={{ width: "320px" }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="form-control"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Administrator</option>
            <option value="DIGITAL_MARKETING_EXECUTIVE">Marketing Executive</option>
            <option value="SALES_EXECUTIVE">Sales Executive</option>
          </select>

          <select
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Accounts</option>
            <option value="INACTIVE">Inactive Accounts</option>
          </select>
        </div>

        <div style={{ fontSize: "0.92rem", color: "var(--text-muted)", fontWeight: 500 }}>
          Showing <strong>{filteredUsers.length}</strong> of {users.length} members
        </div>
      </div>

      {/* Users Table */}
      <div className="panel-card">
        <div className="panel-header">
          <div className="panel-title">
            <Users2 size={18} />
            <span>Organization Members ({filteredUsers.length})</span>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Member Name</th>
                <th>Role & Access</th>
                <th>Department</th>
                <th>Contact</th>
                <th>Account Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "999px",
                            background: "var(--bronze-100)",
                            color: "var(--bronze-700)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: "0.85rem",
                            flexShrink: 0,
                          }}
                        >
                          {getInitials(u.name)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.95rem" }}>
                            {u.name}
                          </div>
                          <div style={{ fontSize: "0.84rem", color: "var(--text-muted)" }}>
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{getRoleBadge(u.role)}</td>
                    <td>
                      <span style={{ fontWeight: 500 }}>
                        {u.department || "Enterprise"}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: u.phone ? "var(--text-secondary)" : "var(--text-light)" }}>
                        {u.phone || "No phone listed"}
                      </span>
                    </td>
                    <td>
                      {u.active ? (
                        <span className="badge badge-active">
                          <CheckCircle2 size={13} /> Active
                        </span>
                      ) : (
                        <span className="badge badge-inactive">
                          <XCircle size={13} /> Inactive
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className={`btn btn-sm ${u.active ? "btn-secondary" : "btn-primary"}`}
                        onClick={() => setUserToToggle(u)}
                      >
                        {u.active ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <Users2 size={36} />
                      <h4>No members found</h4>
                      <p>Try adjusting your search query or filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {isCreateOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <div className="modal-title">Create Team Member</div>
              <button
                className="modal-close"
                onClick={() => setIsCreateOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Samantha Wright"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Work Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="samantha@leadora.com"
                    className="form-control"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Role *</label>
                    <select
                      className="form-control"
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                    >
                      <option value="SALES_EXECUTIVE">Sales Executive</option>
                      <option value="DIGITAL_MARKETING_EXECUTIVE">
                        Digital Marketing Executive
                      </option>
                      <option value="ADMIN">System Administrator</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <input
                      type="text"
                      placeholder="e.g. Inbound Sales"
                      className="form-control"
                      value={formData.department}
                      onChange={(e) =>
                        setFormData({ ...formData, department: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Contact Phone</label>
                    <input
                      type="text"
                      placeholder="+1 (555) 000-0000"
                      className="form-control"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Initial Password</label>
                    <input
                      type="password"
                      placeholder="Leave blank for default"
                      className="form-control"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? "Creating..." : "Save Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Activate/Deactivate */}
      {userToToggle && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: "420px" }}>
            <div className="modal-header">
              <div className="modal-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertTriangle size={18} color="#D97706" />
                <span>Confirm Status Change</span>
              </div>
              <button
                className="modal-close"
                onClick={() => setUserToToggle(null)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                Are you sure you want to{" "}
                <strong>{userToToggle.active ? "deactivate" : "activate"}</strong>{" "}
                account for <strong>{userToToggle.name}</strong> ({userToToggle.email})?
              </p>
              {userToToggle.active && (
                <p style={{ fontSize: "0.86rem", color: "var(--text-muted)", marginTop: "8px" }}>
                  The user will immediately lose access to the Leadora platform until reactivated.
                </p>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setUserToToggle(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`btn ${userToToggle.active ? "btn-danger" : "btn-primary"}`}
                onClick={handleConfirmToggle}
                disabled={toggling}
              >
                {toggling ? "Updating..." : userToToggle.active ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
