import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import apiClient from "../api/client";
import { useAuth } from "../context/AuthContext";
import {
  Link2,
  Plus,
  Search,
  CheckCircle2,
  TrendingUp,
  X,
  Edit2,
  Trash2,
  Layers,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function LeadSources() {
  const { user } = useAuth();
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState(null);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    type: "Search",
    description: "",
    active: true,
  });

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get("/api/v1/lead-sources");
      setSources(res?.data || []);
    } catch (err) {
      setError(err.message || "Failed to load lead acquisition sources.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingSource(null);
    setFormData({
      name: "",
      type: "Search",
      description: "",
      active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (source) => {
    setEditingSource(source);
    setFormData({
      name: source.name,
      type: source.type || "Other",
      description: source.description || "",
      active: source.active !== false,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSaving(true);
    try {
      if (editingSource) {
        await apiClient.put(`/api/v1/lead-sources/${editingSource.id}`, formData);
        setSuccessMsg(`Source "${formData.name}" successfully updated.`);
      } else {
        await apiClient.post("/api/v1/lead-sources", formData);
        setSuccessMsg(`Source "${formData.name}" successfully registered.`);
      }
      setIsModalOpen(false);
      fetchSources();
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err) {
      alert("Error saving lead source: " + (err.message || "Invalid input"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete or deactivate source "${name}"?`)) return;
    try {
      await apiClient.delete(`/api/v1/lead-sources/${id}`);
      setSuccessMsg(`Source "${name}" updated.`);
      fetchSources();
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err) {
      alert("Failed to delete source: " + (err.message || "Error"));
    }
  };

  const filteredSources = sources.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.type && s.type.toLowerCase().includes(search.toLowerCase())) ||
      (s.description && s.description.toLowerCase().includes(search.toLowerCase()));
    const matchesType = typeFilter === "ALL" || s.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <Layout
      pageTitle="Lead Sources & Attribution Channels"
      pageSubtitle="Configure and monitor inbound acquisition channels, source attribution, and conversion efficiency"
      headerAction={
        <button className="btn btn-primary" onClick={handleOpenCreate}>
          <Plus size={16} />
          <span>New Lead Source</span>
        </button>
      }
    >
      {successMsg && (
        <div className="alert-success" style={{ marginBottom: "20px" }}>
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="login-alert-error" style={{ marginBottom: "20px" }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="filter-bar">
        <div className="filter-group">
          <div className="search-input-wrapper">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search channels..."
              className="form-control"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="form-control"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="ALL">All Channel Types</option>
            <option value="Search">Search Engine</option>
            <option value="Social Media">Social Media</option>
            <option value="Website">Website Inbound</option>
            <option value="Email">Email Outreach</option>
            <option value="Referral">Partner Referral</option>
            <option value="Event">Event / Trade Show</option>
            <option value="Direct">Direct</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Sources Table Panel */}
      <div className="panel-card">
        <div className="panel-header">
          <div className="panel-title">
            <Layers size={18} />
            <span>Configured Inbound Channels ({filteredSources.length})</span>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            <Loader2 className="btn-spinner-icon" size={24} style={{ margin: "0 auto 8px" }} />
            <p>Loading attribution channels...</p>
          </div>
        ) : filteredSources.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-muted)" }}>
            <Link2 size={32} style={{ margin: "0 auto 12px", opacity: 0.6 }} />
            <p style={{ fontWeight: 600, fontSize: "1rem" }}>No lead sources found</p>
            <p style={{ fontSize: "0.88rem" }}>Add a new channel to begin capturing prospect origin data.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Source Name</th>
                  <th>Channel Type</th>
                  <th>Description</th>
                  <th>Leads Acquired</th>
                  <th>Converted Deals</th>
                  <th>Conversion Rate</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSources.map((source) => (
                  <tr key={source.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                        {source.name}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-active">{source.type}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>
                        {source.description || "—"}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{source.totalLeads ?? 0}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: "var(--bronze-600)" }}>
                        {source.convertedLeads ?? 0}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <TrendingUp size={14} color="var(--bronze-600)" />
                        <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                          {source.conversionRate ?? 0}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${source.active ? "badge-converted" : "badge-lost"}`}>
                        {source.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: "6px 8px" }}
                          onClick={() => handleOpenEdit(source)}
                          title="Edit Channel"
                        >
                          <Edit2 size={14} />
                        </button>
                        {user?.role === "ADMIN" && (
                          <button
                            className="btn btn-danger"
                            style={{ padding: "6px 8px" }}
                            onClick={() => handleDelete(source.id, source.name)}
                            title="Deactivate / Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingSource ? "Edit Lead Channel" : "Register Lead Acquisition Channel"}</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Channel Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Google Search Ads, LinkedIn Outreach"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Channel Category *</label>
                    <select
                      className="form-control"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option value="Search">Search</option>
                      <option value="Social Media">Social Media</option>
                      <option value="Website">Website</option>
                      <option value="Email">Email</option>
                      <option value="Referral">Referral</option>
                      <option value="Event">Event</option>
                      <option value="Direct">Direct</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      className="form-control"
                      value={formData.active ? "true" : "false"}
                      onChange={(e) => setFormData({ ...formData, active: e.target.value === "true" })}
                    >
                      <option value="true">Active (Collecting Leads)</option>
                      <option value="false">Inactive / Paused</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description / Source Details</label>
                  <textarea
                    className="form-control"
                    placeholder="Notes on UTM tracking, specific landing campaign, or attribution rules..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving || !formData.name.trim()}
                >
                  {saving ? "Saving..." : editingSource ? "Save Changes" : "Create Channel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
