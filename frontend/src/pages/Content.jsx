import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import apiClient from "../api/client";
import {
  FileText,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  X,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

export default function Content() {
  const [contentList, setContentList] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    campaignId: "",
    contentType: "Social Media Posts",
    platform: "LinkedIn",
    targetAudience: "B2B Decision Makers",
    publicationDate: new Date().toISOString().split("T")[0],
    status: "Published",
    description: "",
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [contentRes, campRes] = await Promise.all([
        apiClient.get("/api/v1/content"),
        apiClient.get("/api/v1/campaigns").catch(() => ({ data: [] })),
      ]);
      setContentList(contentRes?.data || []);
      setCampaigns(campRes?.data || []);
    } catch (err) {
      setError(err.message || "Failed to load marketing collateral.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      title: "",
      campaignId: campaigns.length > 0 ? campaigns[0].id : "",
      contentType: "Social Media Posts",
      platform: "LinkedIn",
      targetAudience: "B2B Enterprise Leaders",
      publicationDate: new Date().toISOString().split("T")[0],
      status: "Published",
      description: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      campaignId: item.campaignId || "",
      contentType: item.contentType || "Social Media Posts",
      platform: item.platform || "",
      targetAudience: item.targetAudience || "",
      publicationDate: item.publicationDate || new Date().toISOString().split("T")[0],
      status: item.status || "Draft",
      description: item.description || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setSaving(true);
    try {
      const payload = {
        ...formData,
        campaignId: formData.campaignId ? Number(formData.campaignId) : null,
      };

      if (editingItem) {
        await apiClient.put(`/api/v1/content/${editingItem.id}`, payload);
        setSuccessMsg(`Asset "${formData.title}" successfully updated.`);
      } else {
        await apiClient.post("/api/v1/content", payload);
        setSuccessMsg(`Asset "${formData.title}" published to marketing library.`);
      }
      setIsModalOpen(false);
      fetchInitialData();
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err) {
      alert("Error saving marketing content: " + (err.message || "Invalid input"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to remove "${title}"?`)) return;
    try {
      await apiClient.delete(`/api/v1/content/${id}`);
      setSuccessMsg(`Asset "${title}" removed.`);
      fetchInitialData();
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err) {
      alert("Failed to delete content: " + (err.message || "Error"));
    }
  };

  const filteredItems = contentList.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      (item.platform && item.platform.toLowerCase().includes(search.toLowerCase())) ||
      (item.campaignName && item.campaignName.toLowerCase().includes(search.toLowerCase()));
    const matchesType = typeFilter === "ALL" || item.contentType === typeFilter;
    const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <Layout
      pageTitle="Marketing Content & Campaign Collateral"
      pageSubtitle="Manage articles, whitepapers, social media collateral, ad creatives, and case studies"
      headerAction={
        <button className="btn btn-primary" onClick={handleOpenCreate}>
          <Plus size={16} />
          <span>New Content Piece</span>
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
              placeholder="Search assets, platforms, campaigns..."
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
            <option value="ALL">All Content Types</option>
            <option value="Social Media Posts">Social Media Posts</option>
            <option value="Blogs">Blogs</option>
            <option value="Advertisements">Advertisements</option>
            <option value="Emails">Emails</option>
            <option value="Videos">Videos</option>
            <option value="Landing Pages">Landing Pages</option>
            <option value="Other">Other</option>
          </select>

          <select
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Lifecycle Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Published">Published</option>
            <option value="Archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Panel */}
      <div className="panel-card">
        <div className="panel-header">
          <div className="panel-title">
            <FileText size={18} />
            <span>Marketing Assets Repository ({filteredItems.length})</span>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            <Loader2 className="btn-spinner-icon" size={24} style={{ margin: "0 auto 8px" }} />
            <p>Loading collateral catalog...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-muted)" }}>
            <FileText size={32} style={{ margin: "0 auto 12px", opacity: 0.6 }} />
            <p style={{ fontWeight: 600, fontSize: "1rem" }}>No marketing collateral found</p>
            <p style={{ fontSize: "0.88rem" }}>Create your first social post, blog, or ad creative.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Content Piece Title</th>
                  <th>Content Type</th>
                  <th>Platform / Channel</th>
                  <th>Target Campaign</th>
                  <th>Target Audience</th>
                  <th>Publication Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                        {item.title}
                      </div>
                      {item.description && (
                        <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", maxWidth: "340px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.description}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="badge badge-active">{item.contentType}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 500, color: "var(--text-secondary)" }}>
                        {item.platform || "Multi-channel"}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.88rem", color: "var(--bronze-600)", fontWeight: 500 }}>
                        {item.campaignName || "General Brand"}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        {item.targetAudience || "All Prospects"}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.88rem" }}>
                        {item.publicationDate || "Unscheduled"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          item.status === "Published"
                            ? "badge-converted"
                            : item.status === "Scheduled"
                            ? "badge-active"
                            : item.status === "Draft"
                            ? "badge-contacted"
                            : "badge-lost"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: "6px 8px" }}
                          onClick={() => handleOpenEdit(item)}
                          title="Edit Asset"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: "6px 8px" }}
                          onClick={() => handleDelete(item.id, item.title)}
                          title="Delete Asset"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingItem ? "Edit Marketing Collateral" : "Create New Marketing Collateral"}</h3>
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
                  <label className="form-label">Asset Title / Headline *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. How Enterprise Leaders Cut Cloud Latency by 40%"
                    className="form-control"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Content Type *</label>
                    <select
                      className="form-control"
                      value={formData.contentType}
                      onChange={(e) => setFormData({ ...formData, contentType: e.target.value })}
                    >
                      <option value="Social Media Posts">Social Media Posts</option>
                      <option value="Blogs">Blogs</option>
                      <option value="Advertisements">Advertisements</option>
                      <option value="Emails">Emails</option>
                      <option value="Videos">Videos</option>
                      <option value="Landing Pages">Landing Pages</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Platform / Channel</label>
                    <input
                      type="text"
                      placeholder="e.g. LinkedIn, YouTube, Company Blog"
                      className="form-control"
                      value={formData.platform}
                      onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Associated Campaign</label>
                    <select
                      className="form-control"
                      value={formData.campaignId}
                      onChange={(e) => setFormData({ ...formData, campaignId: e.target.value })}
                    >
                      <option value="">No Campaign (Brand Asset)</option>
                      {campaigns.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Lifecycle Status</label>
                    <select
                      className="form-control"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Draft">Draft</option>
                      <option value="Scheduled">Scheduled</option>
                      <option value="Published">Published</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Target Audience</label>
                    <input
                      type="text"
                      placeholder="e.g. CTOs, VP Engineering, IT Directors"
                      className="form-control"
                      value={formData.targetAudience}
                      onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Publication / Launch Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.publicationDate}
                      onChange={(e) => setFormData({ ...formData, publicationDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Copy / Content Description & URL</label>
                  <textarea
                    className="form-control"
                    placeholder="Key messaging points, call-to-action link, and asset summary..."
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
                  disabled={saving || !formData.title.trim()}
                >
                  {saving ? "Saving..." : editingItem ? "Save Changes" : "Create Asset"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
