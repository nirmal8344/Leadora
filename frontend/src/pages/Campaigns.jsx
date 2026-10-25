import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import apiClient from "../api/client";
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  Receipt,
  X,
  Trash2,
  Edit2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Layers,
} from "lucide-react";

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modal State (Create & Edit Campaign)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Expense Management Drawer
  const [expenseCampaign, setExpenseCampaign] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [expensesLoading, setExpensesLoading] = useState(false);
  const [expenseSubmitting, setExpenseSubmitting] = useState(false);
  const [newExpense, setNewExpense] = useState({
    expenseType: "Advertising",
    amount: "",
    expenseDate: new Date().toISOString().split("T")[0],
    description: "",
  });

  const [formData, setFormData] = useState({
    name: "",
    type: "Social Media",
    objective: "",
    budget: "",
    startDate: "",
    endDate: "",
    targetAudience: "",
    targetLocation: "",
    description: "",
    status: "Planned",
    impressions: 0,
    clicks: 0,
    reach: 0,
    revenueGenerated: 0,
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get("/api/v1/campaigns");
      setCampaigns(res?.data || []);
    } catch (err) {
      setError("Failed to fetch campaigns from the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingCampaign(null);
    setFormData({
      name: "",
      type: "Social Media",
      objective: "",
      budget: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      targetAudience: "",
      targetLocation: "",
      description: "",
      status: "Planned",
      impressions: 0,
      clicks: 0,
      reach: 0,
      revenueGenerated: 0,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (camp) => {
    setEditingCampaign(camp);
    setFormData({
      name: camp.name || "",
      type: camp.type || "Social Media",
      objective: camp.objective || "",
      budget: camp.budget !== undefined ? String(camp.budget) : "",
      startDate: camp.startDate || "",
      endDate: camp.endDate || "",
      targetAudience: camp.targetAudience || "",
      targetLocation: camp.targetLocation || "",
      description: camp.description || "",
      status: camp.status || "Planned",
      impressions: camp.impressions || 0,
      clicks: camp.clicks || 0,
      reach: camp.reach || 0,
      revenueGenerated: camp.revenueGenerated || 0,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        budget: parseFloat(formData.budget) || 0,
        impressions: parseInt(formData.impressions, 10) || 0,
        clicks: parseInt(formData.clicks, 10) || 0,
        reach: parseInt(formData.reach, 10) || 0,
        revenueGenerated: parseFloat(formData.revenueGenerated) || 0,
      };

      if (editingCampaign) {
        await apiClient.put(`/api/v1/campaigns/${editingCampaign.id}`, payload);
        setSuccessMsg(`Campaign "${formData.name}" updated successfully.`);
      } else {
        await apiClient.post("/api/v1/campaigns", payload);
        setSuccessMsg(`Campaign "${formData.name}" launched successfully.`);
      }

      setIsModalOpen(false);
      setTimeout(() => setSuccessMsg(null), 4000);
      fetchCampaigns();
    } catch (err) {
      setError(err?.message || "Failed to save campaign. Please check inputs.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await apiClient.delete(`/api/v1/campaigns/${deleteConfirmId}`);
      setDeleteConfirmId(null);
      setSuccessMsg("Campaign deleted successfully.");
      setTimeout(() => setSuccessMsg(null), 4000);
      fetchCampaigns();
    } catch (err) {
      alert("Failed to delete campaign.");
    }
  };

  // Open Expense Drawer for Campaign
  const handleOpenExpenses = async (camp) => {
    setExpenseCampaign(camp);
    setNewExpense({
      expenseType: "Advertising",
      amount: "",
      expenseDate: new Date().toISOString().split("T")[0],
      description: "",
    });
    setExpensesLoading(true);
    try {
      const res = await apiClient.get(`/api/v1/campaigns/${camp.id}/expenses`);
      setExpenses(res?.data || []);
    } catch {
      setExpenses([]);
    } finally {
      setExpensesLoading(false);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!expenseCampaign || !newExpense.amount) return;

    setExpenseSubmitting(true);
    try {
      const payload = {
        ...newExpense,
        amount: parseFloat(newExpense.amount) || 0,
      };
      await apiClient.post(`/api/v1/campaigns/${expenseCampaign.id}/expenses`, payload);
      setNewExpense({
        expenseType: "Advertising",
        amount: "",
        expenseDate: new Date().toISOString().split("T")[0],
        description: "",
      });
      // Refresh expenses and campaigns
      const res = await apiClient.get(`/api/v1/campaigns/${expenseCampaign.id}/expenses`);
      setExpenses(res?.data || []);
      fetchCampaigns();
    } catch (err) {
      alert("Error recording expense: " + (err.message || "Invalid input"));
    } finally {
      setExpenseSubmitting(false);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm("Are you sure you want to delete this recorded expenditure?")) return;
    try {
      await apiClient.delete(`/api/v1/campaigns/expenses/${expenseId}`);
      const res = await apiClient.get(`/api/v1/campaigns/${expenseCampaign.id}/expenses`);
      setExpenses(res?.data || []);
      fetchCampaigns();
    } catch (err) {
      alert("Failed to delete expense: " + (err.message || "Error"));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Active":
        return <span className="badge badge-active">Active</span>;
      case "Paused":
        return <span className="badge badge-paused">Paused</span>;
      case "Completed":
        return <span className="badge badge-completed">Completed</span>;
      case "Planned":
      default:
        return <span className="badge badge-planned">Planned</span>;
    }
  };

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.objective && c.objective.toLowerCase().includes(search.toLowerCase())) ||
      (c.type && c.type.toLowerCase().includes(search.toLowerCase()));
    const matchesType = typeFilter === "ALL" || c.type === typeFilter;
    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <Layout
      pageTitle="Campaign Operations & Expenditure"
      pageSubtitle="Design, execute, and monitor multi-channel digital marketing programs, expenditures, and ROI"
      headerAction={
        <button className="btn btn-primary" onClick={handleOpenCreate}>
          <Plus size={16} />
          <span>Launch Campaign</span>
        </button>
      }
    >
      {error && <div className="dash-error">{error}</div>}
      {successMsg && (
        <div className="alert-success" style={{ marginBottom: "20px" }}>
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="filter-bar">
        <div className="filter-group">
          <div className="search-input-wrapper">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search campaigns by name, objective..."
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
            <option value="ALL">All Channels</option>
            <option value="Social Media">Social Media</option>
            <option value="Search">Search</option>
            <option value="Email">Email</option>
            <option value="Content Marketing">Content Marketing</option>
            <option value="Website">Website</option>
            <option value="Referral">Referral</option>
            <option value="Event">Event</option>
            <option value="Other">Other</option>
          </select>

          <select
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Planned">Planned</option>
            <option value="Paused">Paused</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div style={{ fontSize: "0.92rem", color: "var(--text-muted)", fontWeight: 500 }}>
          Showing <strong>{filteredCampaigns.length}</strong> of {campaigns.length} campaigns
        </div>
      </div>

      {/* Campaigns Table Panel */}
      <div className="panel-card">
        <div className="panel-header">
          <div className="panel-title">
            <Megaphone size={18} />
            <span>Active Marketing Programs ({filteredCampaigns.length})</span>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            <Loader2 className="btn-spinner-icon" size={24} style={{ margin: "0 auto 8px" }} />
            <p>Loading campaigns data...</p>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-muted)" }}>
            <Megaphone size={32} style={{ margin: "0 auto 12px", opacity: 0.6 }} />
            <p style={{ fontWeight: 600, fontSize: "1rem" }}>No campaigns found</p>
            <p style={{ fontSize: "0.88rem" }}>Launch your first marketing campaign to acquire leads.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Campaign Details</th>
                  <th>Channel</th>
                  <th>Status</th>
                  <th>Budget vs Spent</th>
                  <th>Funnel (Leads / Convs)</th>
                  <th>CTR & ROI</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCampaigns.map((camp) => {
                  const budgetNum = Number(camp.budget || 0);
                  const spentNum = Number(camp.totalSpent || 0);
                  const percentSpent = budgetNum > 0 ? Math.min(100, Math.round((spentNum / budgetNum) * 100)) : 0;
                  const isOverBudget = spentNum > budgetNum && budgetNum > 0;

                  return (
                    <tr key={camp.id}>
                      <td>
                        <div>
                          <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.96rem" }}>
                            {camp.name}
                          </div>
                          <div style={{ fontSize: "0.84rem", color: "var(--text-muted)", maxWidth: "300px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {camp.objective || camp.description || "Multi-channel demand generation"}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 500, fontSize: "0.92rem", color: "var(--text-secondary)" }}>
                          {camp.type || "Social Media"}
                        </span>
                      </td>
                      <td>{getStatusBadge(camp.status)}</td>
                      <td>
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.86rem", marginBottom: "3px" }}>
                            <span style={{ fontWeight: 700, color: isOverBudget ? "#dc2626" : "var(--text-primary)" }}>
                              ₹{spentNum.toLocaleString()}
                            </span>
                            <span style={{ color: "var(--text-muted)" }}>
                              of ₹{budgetNum.toLocaleString()}
                            </span>
                          </div>
                          <div style={{ width: "130px", height: "6px", background: "#e2e8f0", borderRadius: "3px", overflow: "hidden" }}>
                            <div
                              style={{
                                width: `${percentSpent}%`,
                                height: "100%",
                                background: isOverBudget ? "#dc2626" : "var(--bronze-600)",
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: "0.88rem" }}>
                          <div>
                            <strong>{camp.leadsCount ?? 0}</strong> leads
                          </div>
                          <div style={{ fontSize: "0.82rem", color: "var(--bronze-600)", fontWeight: 600 }}>
                            {camp.conversionsCount ?? 0} converted
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: "0.88rem" }}>
                          <div>
                            CTR: <strong>{camp.ctr ?? 0}%</strong>
                          </div>
                          <div style={{ fontSize: "0.82rem", color: (camp.roi ?? 0) >= 0 ? "var(--bronze-600)" : "#dc2626", fontWeight: 600 }}>
                            ROI: {camp.roi ?? 0}%
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "6px" }}>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: "6px 9px", fontSize: "0.82rem", gap: "4px" }}
                            onClick={() => handleOpenExpenses(camp)}
                            title="Manage Campaign Expenses"
                          >
                            <Receipt size={14} />
                            <span>Expenses</span>
                          </button>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: "6px 8px" }}
                            onClick={() => handleOpenEdit(camp)}
                            title="Edit Campaign"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="btn btn-danger"
                            style={{ padding: "6px 8px" }}
                            onClick={() => setDeleteConfirmId(camp.id)}
                            title="Delete Campaign"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Campaign Create/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingCampaign ? "Edit Marketing Program" : "Launch New Campaign"}</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Campaign Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Q4 High-Intent Cloud Infrastructure Inbound"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Program Channel *</label>
                    <select
                      className="form-control"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option value="Social Media">Social Media</option>
                      <option value="Search">Search Engine</option>
                      <option value="Email">Email Outreach</option>
                      <option value="Content Marketing">Content Marketing</option>
                      <option value="Website">Website</option>
                      <option value="Referral">Partner Referral</option>
                      <option value="Event">Event / Trade Show</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Total Allocated Budget (₹) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="100"
                      placeholder="e.g. 50000"
                      className="form-control"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Lifecycle Status</label>
                    <select
                      className="form-control"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Planned">Planned</option>
                      <option value="Active">Active</option>
                      <option value="Paused">Paused</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Target Audience</label>
                    <input
                      type="text"
                      placeholder="e.g. Enterprise CTOs, Mid-market VP IT"
                      className="form-control"
                      value={formData.targetAudience}
                      onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Target Location</label>
                    <input
                      type="text"
                      placeholder="e.g. India, APAC, Global"
                      className="form-control"
                      value={formData.targetLocation}
                      onChange={(e) => setFormData({ ...formData, targetLocation: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Strategic Objective</label>
                    <input
                      type="text"
                      placeholder="e.g. Generate 50+ enterprise demo inquiries"
                      className="form-control"
                      value={formData.objective}
                      onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                    />
                  </div>
                </div>

                {editingCampaign && (
                  <div style={{ background: "var(--cream-100)", padding: "14px", borderRadius: "8px", marginBottom: "16px", border: "1px solid var(--cream-300)" }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--bronze-700)", textTransform: "uppercase", marginBottom: "10px" }}>
                      Performance Tracking Metrics
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Impressions</label>
                        <input
                          type="number"
                          min="0"
                          className="form-control"
                          value={formData.impressions}
                          onChange={(e) => setFormData({ ...formData, impressions: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Clicks</label>
                        <input
                          type="number"
                          min="0"
                          className="form-control"
                          value={formData.clicks}
                          onChange={(e) => setFormData({ ...formData, clicks: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Description & Channel Strategy</label>
                  <textarea
                    className="form-control"
                    placeholder="Provide overview of campaign channels, ad sets, and value proposition..."
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
                  disabled={submitting || !formData.name.trim()}
                >
                  {submitting ? "Saving..." : editingCampaign ? "Save Changes" : "Launch Campaign"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense Management Modal / Drawer */}
      {expenseCampaign && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "720px" }}>
            <div className="modal-header">
              <div>
                <h3 style={{ margin: 0 }}>Campaign Expenditures: {expenseCampaign.name}</h3>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  Budget: ₹{Number(expenseCampaign.budget || 0).toLocaleString()} &bull; Total Recorded: ₹{expenses.reduce((acc, x) => acc + Number(x.amount || 0), 0).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setExpenseCampaign(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {/* Record New Expense Form */}
              <form onSubmit={handleAddExpense} style={{ background: "var(--cream-100)", padding: "16px", borderRadius: "8px", border: "1px solid var(--cream-300)", marginBottom: "20px" }}>
                <h4 style={{ margin: "0 0 12px", fontSize: "0.95rem", fontWeight: 700, color: "var(--bronze-700)" }}>
                  Record New Campaign Expenditure
                </h4>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Expense Category *</label>
                    <select
                      className="form-control"
                      value={newExpense.expenseType}
                      onChange={(e) => setNewExpense({ ...newExpense, expenseType: e.target.value })}
                    >
                      <option value="Advertising">Advertising (Ad Spend)</option>
                      <option value="Content">Content Creation</option>
                      <option value="Design">Design & Collateral</option>
                      <option value="Event">Event / Booth Fee</option>
                      <option value="Influencer">Influencer / KOL</option>
                      <option value="Software">Software & Tools</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Amount (₹) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="50"
                      placeholder="e.g. 15000"
                      className="form-control"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Expense Date *</label>
                    <input
                      type="date"
                      required
                      className="form-control"
                      value={newExpense.expenseDate}
                      onChange={(e) => setNewExpense({ ...newExpense, expenseDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: "12px" }}>
                  <label className="form-label">Description / Invoice Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Google Ads search campaign invoice #4928"
                    className="form-control"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: "100%", justifyContent: "center" }}
                  disabled={expenseSubmitting || !newExpense.amount}
                >
                  {expenseSubmitting ? "Recording..." : "Record Expense"}
                </button>
              </form>

              {/* Itemized Expenses Table */}
              <h4 style={{ margin: "0 0 10px", fontSize: "0.92rem", fontWeight: 700, color: "var(--text-primary)" }}>
                Itemized Expenses History ({expenses.length})
              </h4>

              {expensesLoading ? (
                <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)" }}>
                  <Loader2 size={20} className="btn-spinner-icon" />
                  <p>Loading expenses history...</p>
                </div>
              ) : expenses.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)", background: "#fff", border: "1px dashed var(--cream-400)", borderRadius: "6px" }}>
                  No expenditures recorded yet for this campaign.
                </div>
              ) : (
                <div className="table-container" style={{ maxHeight: "240px", overflowY: "auto" }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Category</th>
                        <th>Description</th>
                        <th>Amount</th>
                        <th style={{ textAlign: "right" }}>Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.map((exp) => (
                        <tr key={exp.id}>
                          <td>{exp.expenseDate}</td>
                          <td>
                            <span className="badge badge-active">{exp.expenseType}</span>
                          </td>
                          <td>
                            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                              {exp.description || "—"}
                            </span>
                          </td>
                          <td>
                            <strong style={{ color: "var(--text-primary)" }}>
                              ₹{Number(exp.amount || 0).toLocaleString()}
                            </strong>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <button
                              className="btn btn-danger"
                              style={{ padding: "4px 6px" }}
                              onClick={() => handleDeleteExpense(exp.id)}
                              title="Delete expense entry"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setExpenseCampaign(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "440px" }}>
            <div className="modal-header">
              <h3 style={{ color: "var(--danger-600)" }}>Delete Campaign?</h3>
              <button
                onClick={() => setDeleteConfirmId(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ margin: 0, fontSize: "0.92rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Are you sure you want to permanently delete this marketing program? All associated leads will remain, but campaign attribution tracking will be cleared.
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setDeleteConfirmId(null)}
              >
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDelete}>
                Delete Program
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
