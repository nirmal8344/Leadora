import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import apiClient from "../api/client";
import {
  Link2,
  Plus,
  Search,
  ExternalLink,
  CheckCircle2,
  X,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

export default function LandingPages() {
  const [pages, setPages] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    campaignId: "",
    url: "",
    targetAudience: "",
    objective: "",
    callToAction: "Request Demo",
    status: "Active",
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [pagesRes, campRes] = await Promise.all([
        apiClient.get("/api/v1/landing-pages"),
        apiClient.get("/api/v1/campaigns").catch(() => ({ data: [] })),
      ]);
      setPages(pagesRes?.data || []);
      setCampaigns(campRes?.data || []);
    } catch (err) {
      setError(err.message || "Failed to load tracked landing pages.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingPage(null);
    setFormData({
      name: "",
      campaignId: campaigns.length > 0 ? campaigns[0].id : "",
      url: "https://leadora.com/lp/",
      targetAudience: "B2B Enterprise Leaders",
      objective: "Lead Generation & Demo Bookings",
      callToAction: "Request Executive Demo",
      status: "Active",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (page) => {
    setEditingPage(page);
    setFormData({
      name: page.name,
      campaignId: page.campaignId || "",
      url: page.url,
      targetAudience: page.targetAudience || "",
      objective: page.objective || "",
      callToAction: page.callToAction || "",
      status: page.status || "Active",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.url.trim()) return;

    setSaving(true);
    try {
      const payload = {
        ...formData,
        campaignId: formData.campaignId ? Number(formData.campaignId) : null,
      };

      if (editingPage) {
        await apiClient.put(`/api/v1/landing-pages/${editingPage.id}`, payload);
        setSuccessMsg(`Landing page "${formData.name}" successfully updated.`);
      } else {
        await apiClient.post("/api/v1/landing-pages", payload);
        setSuccessMsg(`Landing page "${formData.name}" successfully registered.`);
      }
      setIsModalOpen(false);
      fetchInitialData();
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err) {
      alert("Error saving landing page: " + (err.message || "Invalid input"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete landing page "${name}"?`)) return;
    try {
      await apiClient.delete(`/api/v1/landing-pages/${id}`);
      setSuccessMsg(`Landing page "${name}" removed.`);
      fetchInitialData();
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err) {
      alert("Failed to delete landing page: " + (err.message || "Error"));
    }
  };

  const filteredPages = pages.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.url.toLowerCase().includes(search.toLowerCase()) ||
      (p.campaignName && p.campaignName.toLowerCase().includes(search.toLowerCase()));
    return matchesSearch;
  });

  return (
    <Layout
      pageTitle="Landing Pages & Conversion Funnels"
      pageSubtitle="Track and optimize high-converting inbound landing pages and acquisition URLs"
      headerAction={
        <button className="btn btn-primary" onClick={handleOpenCreate}>
          <Plus size={16} />
          <span>Track Landing Page</span>
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
              placeholder="Search landing pages, URLs, campaigns..."
              className="form-control"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Panel */}
      <div className="panel-card">
        <div className="panel-header">
          <div className="panel-title">
            <Link2 size={18} />
            <span>Active Funnel Pages ({filteredPages.length})</span>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            <Loader2 className="btn-spinner-icon" size={24} style={{ margin: "0 auto 8px" }} />
            <p>Loading landing pages...</p>
          </div>
        ) : filteredPages.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-muted)" }}>
            <Link2 size={32} style={{ margin: "0 auto 12px", opacity: 0.6 }} />
            <p style={{ fontWeight: 600, fontSize: "1rem" }}>No landing pages tracked</p>
            <p style={{ fontSize: "0.88rem" }}>Add a marketing landing page URL to monitor inbound conversion performance.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Page Title & URL</th>
                  <th>Associated Campaign</th>
                  <th>Target Audience</th>
                  <th>Call to Action</th>
                  <th>Leads Captured</th>
                  <th>Deals Closed</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPages.map((page) => (
                  <tr key={page.id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                          {page.name}
                        </div>
                        <a
                          href={page.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            fontSize: "0.82rem",
                            color: "var(--bronze-600)",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            textDecoration: "none",
                          }}
                        >
                          <span>{page.url}</span>
                          <ExternalLink size={11} />
                        </a>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.88rem", color: "var(--text-secondary)", fontWeight: 500 }}>
                        {page.campaignName || "Global / Unlinked"}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        {page.targetAudience || "All Prospects"}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-active">{page.callToAction || "Sign Up"}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                        {page.leadsGenerated ?? 0}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: "var(--bronze-600)" }}>
                        {page.conversions ?? 0}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${page.status === "Active" ? "badge-converted" : "badge-lost"}`}>
                        {page.status}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: "6px 8px" }}
                          onClick={() => handleOpenEdit(page)}
                          title="Edit Landing Page"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: "6px 8px" }}
                          onClick={() => handleDelete(page.id, page.name)}
                          title="Delete Page"
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
              <h3>{editingPage ? "Edit Landing Page" : "Track Inbound Landing Page"}</h3>
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
                  <label className="form-label">Landing Page Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Enterprise AI Demo Request Hub"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Page URL *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://leadora.com/lp/enterprise-cloud"
                    className="form-control"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Associated Campaign</label>
                    <select
                      className="form-control"
                      value={formData.campaignId}
                      onChange={(e) => setFormData({ ...formData, campaignId: e.target.value })}
                    >
                      <option value="">No Campaign (Direct Traffic)</option>
                      {campaigns.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      className="form-control"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Active">Active (Collecting Leads)</option>
                      <option value="Paused">Paused</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Primary Call to Action (CTA)</label>
                    <input
                      type="text"
                      placeholder="e.g. Request Demo, Download Whitepaper, Book Consultation"
                      className="form-control"
                      value={formData.callToAction}
                      onChange={(e) => setFormData({ ...formData, callToAction: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Target Audience</label>
                    <input
                      type="text"
                      placeholder="e.g. IT Leaders, CFOs, Enterprise Directors"
                      className="form-control"
                      value={formData.targetAudience}
                      onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Page Objective & Key Value Proposition</label>
                  <textarea
                    className="form-control"
                    placeholder="Brief explanation of the goal of this funnel page..."
                    value={formData.objective}
                    onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
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
                  disabled={saving || !formData.name.trim() || !formData.url.trim()}
                >
                  {saving ? "Saving..." : editingPage ? "Save Changes" : "Register Funnel Page"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
