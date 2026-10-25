import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import apiClient from "../api/client";
import { useAuth } from "../context/AuthContext";
import {
  Building2,
  Plus,
  Search,
  Filter,
  UserPlus,
  ArrowRightCircle,
  Eye,
  Trash2,
  X,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  Clock,
  AlertTriangle,
  Download,
  Calendar,
  Save,
  Loader2,
  DollarSign,
  TrendingUp,
  FileText,
} from "lucide-react";

export default function Leads({ title, customSubtitle, defaultStatusFilter }) {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [leadSources, setLeadSources] = useState([]);
  const [salesUsers, setSalesUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Filters
  const [search, setSearch] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("search") || "";
  });
  const [statusFilter, setStatusFilter] = useState(() => {
    if (defaultStatusFilter) return defaultStatusFilter;
    const params = new URLSearchParams(window.location.search);
    return params.get("status") || "ALL";
  });
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [qualificationFilter, setQualificationFilter] = useState("ALL");

  // Create Lead Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [newLead, setNewLead] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    location: "",
    industry: "",
    jobRole: "",
    sourceId: "",
    campaignId: "",
    notes: "",
    leadScore: 50,
    qualificationStatus: "Potential",
  });

  // Assign Lead Modal State
  const [assigningLead, setAssigningLead] = useState(null);
  const [selectedSalesUser, setSelectedSalesUser] = useState("");
  const [assignPriority, setAssignPriority] = useState("Medium");
  const [assignNotes, setAssignNotes] = useState("");
  const [assigning, setAssigning] = useState(false);

  // Advance Pipeline Status Modal State
  const [statusLead, setStatusLead] = useState(null);
  const [newStatus, setNewStatus] = useState("Contacted");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  // Conversion specifics
  const [conversionData, setConversionData] = useState({
    dealValue: "",
    customerCompany: "",
    notes: "",
  });
  // Lost specifics
  const [lostData, setLostData] = useState({
    reason: "Budget",
    notes: "",
  });

  // View Details Drawer / Modal State
  const [viewLead, setViewLead] = useState(null);
  const [viewTab, setViewTab] = useState("timeline"); // timeline | qualification | details
  const [timeline, setTimeline] = useState([]);
  const [qualification, setQualification] = useState(null);
  const [savingQual, setSavingQual] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, [user]);

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = user?.role === "SALES_EXECUTIVE" ? "/api/v1/leads/my" : "/api/v1/leads";
      const [leadsRes, campRes, sourcesRes] = await Promise.all([
        apiClient.get(endpoint),
        apiClient.get("/api/v1/campaigns").catch(() => ({ data: [] })),
        apiClient.get("/api/v1/lead-sources").catch(() => ({ data: [] })),
      ]);

      const fetchedLeads = leadsRes?.data || [];
      setLeads(fetchedLeads);
      setCampaigns(campRes?.data || []);
      setLeadSources(sourcesRes?.data || []);

      // If URL specifies a lead id, open it
      const params = new URLSearchParams(window.location.search);
      const leadIdParam = params.get("id");
      if (leadIdParam) {
        const found = fetchedLeads.find((l) => String(l.id) === String(leadIdParam));
        if (found) handleOpenViewLead(found);
      }

      // Fetch sales reps for assignment
      if (user?.role === "ADMIN" || user?.role === "DIGITAL_MARKETING_EXECUTIVE") {
        try {
          const salesRes = await apiClient.get("/api/v1/users/sales");
          setSalesUsers(salesRes?.data || []);
        } catch {
          // ignore
        }
      }
    } catch (err) {
      setError(err?.message || "Failed to fetch leads.");
    } finally {
      setLoading(false);
    }
  };

  // Duplicate Check
  const handleCheckDuplicate = async (email, phone) => {
    if (!email && !phone) {
      setDuplicateWarning(null);
      return;
    }
    try {
      const query = new URLSearchParams();
      if (email) query.set("email", email);
      if (phone) query.set("phone", phone);
      const res = await apiClient.get(`/api/v1/leads/check-duplicate?${query.toString()}`);
      if (res?.data?.duplicate) {
        setDuplicateWarning(res.data);
      } else {
        setDuplicateWarning(null);
      }
    } catch {
      // ignore
    }
  };

  const handleOpenCreate = () => {
    setDuplicateWarning(null);
    setNewLead({
      name: "",
      company: "",
      email: "",
      phone: "",
      location: "",
      industry: "",
      jobRole: "",
      sourceId: leadSources.length > 0 ? leadSources[0].id : "",
      campaignId: "",
      notes: "",
      leadScore: 50,
      qualificationStatus: "Potential",
    });
    setIsCreateOpen(true);
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const payload = {
        ...newLead,
        sourceId: newLead.sourceId ? Number(newLead.sourceId) : null,
        campaignId: newLead.campaignId ? Number(newLead.campaignId) : null,
        leadScore: Number(newLead.leadScore) || 50,
      };
      await apiClient.post("/api/v1/leads", payload);
      setIsCreateOpen(false);
      setSuccessMsg(`Lead "${newLead.name}" from ${newLead.company} added to pipeline.`);
      setTimeout(() => setSuccessMsg(null), 3500);
      fetchInitialData();
    } catch (err) {
      alert("Failed to create lead: " + (err.message || "Invalid input"));
    } finally {
      setCreating(false);
    }
  };

  const handleOpenAssign = (lead) => {
    setAssigningLead(lead);
    setSelectedSalesUser(lead.assignedUserId ? String(lead.assignedUserId) : "");
    setAssignPriority("Medium");
    setAssignNotes("");
  };

  const handleAssignLead = async (e) => {
    e.preventDefault();
    if (!assigningLead || !selectedSalesUser) return;

    setAssigning(true);
    try {
      await apiClient.post(`/api/v1/leads/${assigningLead.id}/assign`, {
        salesUserId: Number(selectedSalesUser),
        priority: assignPriority,
        notes: assignNotes,
      });
      setSuccessMsg(`Lead "${assigningLead.name}" assigned successfully.`);
      setAssigningLead(null);
      setTimeout(() => setSuccessMsg(null), 3500);
      fetchInitialData();
    } catch (err) {
      alert("Failed to assign lead: " + (err.message || "Unknown error"));
    } finally {
      setAssigning(false);
    }
  };

  const handleOpenStatusModal = (lead) => {
    setStatusLead(lead);
    setNewStatus(lead.status || "Contacted");
    setConversionData({
      dealValue: "",
      customerCompany: lead.company,
      notes: "",
    });
    setLostData({
      reason: "Budget",
      notes: "",
    });
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!statusLead) return;

    setUpdatingStatus(true);
    try {
      if (newStatus === "Converted") {
        await apiClient.post(`/api/v1/leads/${statusLead.id}/convert`, {
          dealValue: parseFloat(conversionData.dealValue) || 0,
          customerCompany: conversionData.customerCompany || statusLead.company,
          notes: conversionData.notes,
        });
        setSuccessMsg(`Congratulations! Lead "${statusLead.name}" converted to client deal.`);
      } else if (newStatus === "Lost") {
        await apiClient.post(`/api/v1/leads/${statusLead.id}/lost`, {
          reason: lostData.reason,
          notes: lostData.notes,
        });
        setSuccessMsg(`Lead "${statusLead.name}" closed as lost (${lostData.reason}).`);
      } else {
        await apiClient.put(`/api/v1/leads/${statusLead.id}`, {
          ...statusLead,
          status: newStatus,
        });
        setSuccessMsg(`Pipeline stage updated to "${newStatus}".`);
      }

      setStatusLead(null);
      setTimeout(() => setSuccessMsg(null), 3500);
      fetchInitialData();
    } catch (err) {
      alert("Failed to update status: " + (err.message || "Error"));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleOpenViewLead = async (lead) => {
    setViewLead(lead);
    setViewTab("timeline");
    // Fetch timeline and qualification details
    try {
      const [detailRes, timeRes, qualRes] = await Promise.all([
        apiClient.get(`/api/v1/leads/${lead.id}`),
        apiClient.get(`/api/v1/leads/${lead.id}/timeline`),
        apiClient.get(`/api/v1/leads/${lead.id}/qualification`),
      ]);
      setViewLead(detailRes?.data || lead);
      setTimeline(timeRes?.data || []);
      setQualification(qualRes?.data || null);
    } catch {
      // fallback
    }
  };

  const handleSaveQualification = async (e) => {
    e.preventDefault();
    if (!viewLead || !qualification) return;
    setSavingQual(true);
    try {
      const res = await apiClient.put(`/api/v1/leads/${viewLead.id}/qualification`, qualification);
      setQualification(res?.data || qualification);
      alert("Lead qualification updated successfully.");
      fetchInitialData();
    } catch (err) {
      alert("Failed to save qualification: " + (err.message || "Error"));
    } finally {
      setSavingQual(false);
    }
  };

  const handleDeleteLead = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete lead "${name}"?`)) return;
    try {
      await apiClient.delete(`/api/v1/leads/${id}`);
      setSuccessMsg(`Lead "${name}" deleted.`);
      setTimeout(() => setSuccessMsg(null), 3500);
      fetchInitialData();
    } catch (err) {
      alert("Failed to delete lead: " + (err.message || "Error"));
    }
  };

  const handleExportCsv = () => {
    if (filteredLeads.length === 0) {
      alert("No leads to export.");
      return;
    }
    const headers = [
      "Lead ID",
      "Name",
      "Company",
      "Email",
      "Phone",
      "Status",
      "Score",
      "Qualification",
      "Source",
      "Campaign",
      "Assigned To",
      "Date Received",
    ];

    const rows = filteredLeads.map((l) => [
      l.id,
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.company.replace(/"/g, '""')}"`,
      `"${l.email}"`,
      `"${l.phone || ""}"`,
      l.status,
      l.leadScore,
      l.qualificationStatus,
      `"${l.sourceName || "Direct"}"`,
      `"${l.campaignName || ""}"`,
      `"${l.assignedUserName || "Unassigned"}"`,
      `"${l.dateReceived || ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `leadora_leads_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.company.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase()) ||
      (l.location && l.location.toLowerCase().includes(search.toLowerCase())) ||
      (l.industry && l.industry.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === "ALL" || l.status === statusFilter;
    const matchesSource = sourceFilter === "ALL" || String(l.sourceId) === sourceFilter;
    const matchesQual = qualificationFilter === "ALL" || l.qualificationStatus === qualificationFilter;
    return matchesSearch && matchesStatus && matchesSource && matchesQual;
  });

  return (
    <Layout
      pageTitle={title || "Lead Pipeline & Conversion"}
      pageSubtitle={
        customSubtitle ||
        "Complete lifecycle tracking from marketing acquisition to sales qualification, follow-ups, and conversion"
      }
      headerAction={
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="btn btn-secondary" onClick={handleExportCsv} title="Export filtered leads to CSV">
            <Download size={15} />
            <span>Export CSV</span>
          </button>
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <Plus size={16} />
            <span>New Prospect</span>
          </button>
        </div>
      }
    >
      {successMsg && (
        <div className="alert-success" style={{ marginBottom: "20px" }}>
          <CheckCircle size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="login-alert-error" style={{ marginBottom: "20px" }}>
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter / Actions Bar */}
      <div className="filter-bar">
        <div className="filter-group">
          <div className="search-input-wrapper">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search by name, company, email, location..."
              className="form-control"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="New">New</option>
            <option value="Assigned">Assigned</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Proposal">Proposal</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Converted">Converted (Closed Won)</option>
            <option value="Lost">Lost (Closed Lost)</option>
          </select>

          <select
            className="form-control"
            value={qualificationFilter}
            onChange={(e) => setQualificationFilter(e.target.value)}
          >
            <option value="ALL">All Qualification Levels</option>
            <option value="High Priority">High Priority</option>
            <option value="Qualified">Qualified</option>
            <option value="Potential">Potential</option>
            <option value="Not Qualified">Not Qualified</option>
          </select>

          <select
            className="form-control"
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
          >
            <option value="ALL">All Lead Sources</option>
            {leadSources.map((s) => (
              <option key={s.id} value={String(s.id)}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ fontSize: "0.92rem", color: "var(--text-muted)", fontWeight: 500 }}>
          Showing <strong>{filteredLeads.length}</strong> of {leads.length} prospects
        </div>
      </div>

      {/* Leads Table Panel */}
      <div className="panel-card">
        <div className="panel-header">
          <div className="panel-title">
            <Building2 size={18} />
            <span>Active Pipeline Prospects ({filteredLeads.length})</span>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            <Loader2 className="btn-spinner-icon" size={24} style={{ margin: "0 auto 8px" }} />
            <p>Loading prospects...</p>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-muted)" }}>
            <Building2 size={32} style={{ margin: "0 auto 12px", opacity: 0.6 }} />
            <p style={{ fontWeight: 600, fontSize: "1rem" }}>No matching prospects found</p>
            <p style={{ fontSize: "0.88rem" }}>Adjust your filters or add a new prospect to your pipeline.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Prospect & Company</th>
                  <th>Contact Details</th>
                  <th>Source & Campaign</th>
                  <th>Assigned Representative</th>
                  <th>Score</th>
                  <th>Pipeline Stage</th>
                  <th>Qualification</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id}>
                    <td>
                      <div>
                        <div
                          style={{ fontWeight: 600, color: "var(--text-primary)", cursor: "pointer" }}
                          onClick={() => handleOpenViewLead(lead)}
                        >
                          {lead.name}
                        </div>
                        <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                          {lead.jobRole ? `${lead.jobRole} at ` : ""}<strong>{lead.company}</strong>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: "0.86rem" }}>
                        <div>{lead.email}</div>
                        <div style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
                          {lead.phone || "—"}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: "0.86rem" }}>
                        <span className="badge badge-active">{lead.sourceName || "Direct"}</span>
                        {lead.campaignName && (
                          <div style={{ fontSize: "0.8rem", color: "var(--bronze-600)", marginTop: "2px" }}>
                            {lead.campaignName}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 500, fontSize: "0.88rem", color: lead.assignedUserName ? "var(--text-primary)" : "var(--text-muted)" }}>
                        {lead.assignedUserName || "Unassigned"}
                      </span>
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          background: (lead.leadScore || 0) >= 70 ? "#ecfdf5" : (lead.leadScore || 0) >= 40 ? "#fffbeb" : "#fef2f2",
                          color: (lead.leadScore || 0) >= 70 ? "#047857" : (lead.leadScore || 0) >= 40 ? "#b45309" : "#b91c1c",
                          fontWeight: 700,
                        }}
                      >
                        {lead.leadScore ?? 0}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          lead.status === "Converted"
                            ? "badge-converted"
                            : lead.status === "Lost"
                            ? "badge-lost"
                            : lead.status === "Qualified" || lead.status === "Proposal"
                            ? "badge-active"
                            : "badge-contacted"
                        }`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          lead.qualificationStatus === "High Priority"
                            ? "badge-active"
                            : lead.qualificationStatus === "Qualified"
                            ? "badge-converted"
                            : "badge-contacted"
                        }`}
                      >
                        {lead.qualificationStatus || "Not Qualified"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: "6px 8px" }}
                          onClick={() => handleOpenViewLead(lead)}
                          title="View Complete Journey Timeline"
                        >
                          <Eye size={14} />
                        </button>

                        {(user?.role === "ADMIN" || user?.role === "DIGITAL_MARKETING_EXECUTIVE") && (
                          <button
                            className="btn btn-secondary"
                            style={{ padding: "6px 8px" }}
                            onClick={() => handleOpenAssign(lead)}
                            title="Assign to Sales Executive"
                          >
                            <UserPlus size={14} />
                          </button>
                        )}

                        <button
                          className="btn btn-secondary"
                          style={{ padding: "6px 8px" }}
                          onClick={() => handleOpenStatusModal(lead)}
                          title="Advance Stage / Convert / Close Lost"
                        >
                          <ArrowRightCircle size={14} />
                        </button>

                        {user?.role === "ADMIN" && (
                          <button
                            className="btn btn-danger"
                            style={{ padding: "6px 8px" }}
                            onClick={() => handleDeleteLead(lead.id, lead.name)}
                            title="Delete Lead"
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

      {/* Create Lead Modal */}
      {isCreateOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "680px" }}>
            <div className="modal-header">
              <h3>Add New Prospect to Pipeline</h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateLead}>
              <div className="modal-body">
                {/* Duplicate Lead Warning Alert Banner */}
                {duplicateWarning && (
                  <div
                    style={{
                      background: "#fffbeb",
                      border: "1px solid #fde68a",
                      color: "#92400e",
                      padding: "12px 14px",
                      borderRadius: "8px",
                      marginBottom: "16px",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                    }}
                  >
                    <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
                    <div style={{ fontSize: "0.88rem" }}>
                      <strong>Duplicate Lead Alert:</strong> A prospect with matching contact details already exists:
                      <div style={{ marginTop: "4px" }}>
                        <strong>{duplicateWarning.existingLead?.name}</strong> at <em>{duplicateWarning.existingLead?.company}</em> (Status: <strong>{duplicateWarning.existingLead?.status}</strong>)
                      </div>
                    </div>
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Anand Sharma"
                      className="form-control"
                      value={newLead.name}
                      onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Company / Account Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Global Technologies"
                      className="form-control"
                      value={newLead.company}
                      onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Work Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="anand@apexcloud.com"
                      className="form-control"
                      value={newLead.email}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewLead({ ...newLead, email: val });
                        handleCheckDuplicate(val, newLead.phone);
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      className="form-control"
                      value={newLead.phone}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewLead({ ...newLead, phone: val });
                        handleCheckDuplicate(newLead.email, val);
                      }}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Job Title / Designation</label>
                    <input
                      type="text"
                      placeholder="e.g. Chief Technology Officer"
                      className="form-control"
                      value={newLead.jobRole}
                      onChange={(e) => setNewLead({ ...newLead, jobRole: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Industry</label>
                    <input
                      type="text"
                      placeholder="e.g. SaaS, Fintech, Manufacturing"
                      className="form-control"
                      value={newLead.industry}
                      onChange={(e) => setNewLead({ ...newLead, industry: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Acquisition Lead Source *</label>
                    <select
                      className="form-control"
                      value={newLead.sourceId}
                      onChange={(e) => setNewLead({ ...newLead, sourceId: e.target.value })}
                      required
                    >
                      <option value="">Select inbound source...</option>
                      {leadSources.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Attributed Campaign</label>
                    <select
                      className="form-control"
                      value={newLead.campaignId}
                      onChange={(e) => setNewLead({ ...newLead, campaignId: e.target.value })}
                    >
                      <option value="">Direct / Organic Traffic (No Campaign)</option>
                      {campaigns.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.type})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Location / City</label>
                    <input
                      type="text"
                      placeholder="e.g. Bengaluru, Mumbai, Singapore"
                      className="form-control"
                      value={newLead.location}
                      onChange={(e) => setNewLead({ ...newLead, location: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Initial Lead Score (0 - 100)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="form-control"
                      value={newLead.leadScore}
                      onChange={(e) => setNewLead({ ...newLead, leadScore: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Initial Qualification Level</label>
                  <select
                    className="form-control"
                    value={newLead.qualificationStatus}
                    onChange={(e) => setNewLead({ ...newLead, qualificationStatus: e.target.value })}
                  >
                    <option value="Not Qualified">Not Qualified</option>
                    <option value="Potential">Potential</option>
                    <option value="Qualified">Qualified</option>
                    <option value="High Priority">High Priority</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Discovery Notes & Business Requirements</label>
                  <textarea
                    className="form-control"
                    placeholder="Key pain points, timeline expectations, budget range..."
                    value={newLead.notes}
                    onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                  />
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
                  disabled={creating || !newLead.name || !newLead.company || !newLead.email}
                >
                  {creating ? "Adding..." : "Add to Pipeline"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Lead Modal */}
      {assigningLead && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "520px" }}>
            <div className="modal-header">
              <h3>Assign Lead to Sales Executive</h3>
              <button
                onClick={() => setAssigningLead(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAssignLead}>
              <div className="modal-body">
                <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginBottom: "16px" }}>
                  Routing <strong>{assigningLead.name}</strong> from <strong>{assigningLead.company}</strong> to an active sales representative.
                </p>

                <div className="form-group">
                  <label className="form-label">Select Sales Representative *</label>
                  <select
                    className="form-control"
                    value={selectedSalesUser}
                    onChange={(e) => setSelectedSalesUser(e.target.value)}
                    required
                  >
                    <option value="">Choose sales representative...</option>
                    {salesUsers.map((su) => (
                      <option key={su.id} value={su.id}>
                        {su.name} ({su.email}) &bull; {su.department || "Sales"}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Priority Level</label>
                  <select
                    className="form-control"
                    value={assignPriority}
                    onChange={(e) => setAssignPriority(e.target.value)}
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority (Urgent Outreach)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Assignment Brief / Handover Notes</label>
                  <textarea
                    className="form-control"
                    placeholder="Instructions for rep regarding prospect background, context, or key stakeholders..."
                    value={assignNotes}
                    onChange={(e) => setAssignNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setAssigningLead(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={assigning || !selectedSalesUser}
                >
                  {assigning ? "Assigning..." : "Confirm & Assign"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Advance Stage / Convert / Lost Modal */}
      {statusLead && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "540px" }}>
            <div className="modal-header">
              <h3>Update Pipeline Stage: {statusLead.name}</h3>
              <button
                onClick={() => setStatusLead(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateStatus}>
              <div className="modal-body">
                <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginBottom: "16px" }}>
                  Current stage: <strong>{statusLead.status}</strong> &bull; Company: <strong>{statusLead.company}</strong>
                </p>

                <div className="form-group">
                  <label className="form-label">Target Pipeline Stage *</label>
                  <select
                    className="form-control"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    required
                  >
                    <option value="New">New</option>
                    <option value="Assigned">Assigned</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Proposal">Proposal Issued</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="Converted">Converted (Closed Won Deal)</option>
                    <option value="Lost">Lost (Closed Lost Deal)</option>
                  </select>
                </div>

                {/* Converted Fields */}
                {newStatus === "Converted" && (
                  <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "16px", borderRadius: "8px", marginTop: "16px" }}>
                    <h4 style={{ margin: "0 0 12px", color: "#166534", fontSize: "0.95rem", fontWeight: 700 }}>
                      Closed Won Deal Record
                    </h4>
                    <div className="form-group">
                      <label className="form-label">Final Deal Value (₹) *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="1000"
                        placeholder="e.g. 250000"
                        className="form-control"
                        value={conversionData.dealValue}
                        onChange={(e) => setConversionData({ ...conversionData, dealValue: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Client Account Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={conversionData.customerCompany}
                        onChange={(e) => setConversionData({ ...conversionData, customerCompany: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Deal Closing Notes</label>
                      <textarea
                        className="form-control"
                        placeholder="Contract terms, billing cycle, onboarded services..."
                        value={conversionData.notes}
                        onChange={(e) => setConversionData({ ...conversionData, notes: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {/* Lost Fields */}
                {newStatus === "Lost" && (
                  <div style={{ background: "#fef2f2", border: "1px solid #fecaca", padding: "16px", borderRadius: "8px", marginTop: "16px" }}>
                    <h4 style={{ margin: "0 0 12px", color: "#991b1b", fontSize: "0.95rem", fontWeight: 700 }}>
                      Closed Lost Analysis Reason *
                    </h4>
                    <div className="form-group">
                      <label className="form-label">Primary Reason *</label>
                      <select
                        className="form-control"
                        required
                        value={lostData.reason}
                        onChange={(e) => setLostData({ ...lostData, reason: e.target.value })}
                      >
                        <option value="Budget">Budget Constraints</option>
                        <option value="Competitor">Lost to Competitor</option>
                        <option value="No Requirement">No Current Requirement</option>
                        <option value="No Response">No Response / Unresponsive</option>
                        <option value="Timing">Project Postponed / Timing</option>
                        <option value="Product Mismatch">Product / Technical Mismatch</option>
                        <option value="Pricing">Pricing Disagreement</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Detailed Notes</label>
                      <textarea
                        className="form-control"
                        placeholder="Provide context on why the opportunity was lost for executive review..."
                        value={lostData.notes}
                        onChange={(e) => setLostData({ ...lostData, notes: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setStatusLead(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={updatingStatus}
                >
                  {updatingStatus ? "Updating..." : "Confirm Stage Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Lead Details & Journey Timeline Drawer */}
      {viewLead && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "760px", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
            <div className="modal-header">
              <div>
                <h3 style={{ margin: 0 }}>{viewLead.name}</h3>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  {viewLead.jobRole ? `${viewLead.jobRole} at ` : ""}<strong>{viewLead.company}</strong> &bull; Stage: <strong>{viewLead.status}</strong>
                </span>
              </div>
              <button
                onClick={() => setViewLead(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Sub-Tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid var(--cream-300)", padding: "0 24px" }}>
              <button
                onClick={() => setViewTab("timeline")}
                style={{
                  padding: "12px 16px",
                  background: "none",
                  border: "none",
                  borderBottom: viewTab === "timeline" ? "2px solid var(--bronze-600)" : "2px solid transparent",
                  fontWeight: 600,
                  fontSize: "0.88rem",
                  color: viewTab === "timeline" ? "var(--bronze-700)" : "var(--text-muted)",
                  cursor: "pointer",
                }}
              >
                Chronological Journey ({timeline.length})
              </button>
              <button
                onClick={() => setViewTab("qualification")}
                style={{
                  padding: "12px 16px",
                  background: "none",
                  border: "none",
                  borderBottom: viewTab === "qualification" ? "2px solid var(--bronze-600)" : "2px solid transparent",
                  fontWeight: 600,
                  fontSize: "0.88rem",
                  color: viewTab === "qualification" ? "var(--bronze-700)" : "var(--text-muted)",
                  cursor: "pointer",
                }}
              >
                B2B Qualification Criteria
              </button>
              <button
                onClick={() => setViewTab("details")}
                style={{
                  padding: "12px 16px",
                  background: "none",
                  border: "none",
                  borderBottom: viewTab === "details" ? "2px solid var(--bronze-600)" : "2px solid transparent",
                  fontWeight: 600,
                  fontSize: "0.88rem",
                  color: viewTab === "details" ? "var(--bronze-700)" : "var(--text-muted)",
                  cursor: "pointer",
                }}
              >
                Profile & Attribution
              </button>
            </div>

            <div className="modal-body" style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
              {/* Tab 1: Timeline */}
              {viewTab === "timeline" && (
                <div>
                  <h4 style={{ margin: "0 0 16px", fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>
                    Lead Lifecycle & Milestone Audit Trail
                  </h4>
                  {timeline.length === 0 ? (
                    <div style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)" }}>
                      <Clock size={28} style={{ margin: "0 auto 8px", opacity: 0.5 }} />
                      <p>No activity records logged yet for this lead.</p>
                    </div>
                  ) : (
                    <div style={{ position: "relative", paddingLeft: "24px" }}>
                      <div
                        style={{
                          position: "absolute",
                          left: "8px",
                          top: "6px",
                          bottom: "6px",
                          width: "2px",
                          background: "var(--cream-400)",
                        }}
                      />
                      {timeline.map((act) => (
                        <div key={act.id} style={{ position: "relative", marginBottom: "20px" }}>
                          <div
                            style={{
                              position: "absolute",
                              left: "-20px",
                              top: "2px",
                              width: "10px",
                              height: "10px",
                              borderRadius: "50%",
                              background: "var(--bronze-600)",
                              border: "2px solid #fff",
                            }}
                          />
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                            <span style={{ fontWeight: 700, fontSize: "0.92rem", color: "var(--text-primary)" }}>
                              {act.activityType}
                            </span>
                            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                              {act.createdAt ? new Date(act.createdAt).toLocaleString() : ""}
                            </span>
                          </div>
                          {act.notes && (
                            <p style={{ margin: "4px 0 0", fontSize: "0.86rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                              {act.notes}
                            </p>
                          )}
                          {act.userName && (
                            <span style={{ fontSize: "0.78rem", color: "var(--bronze-600)", fontWeight: 500 }}>
                              By {act.userName}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Qualification Criteria */}
              {viewTab === "qualification" && qualification && (
                <form onSubmit={handleSaveQualification}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Qualification Level</label>
                      <select
                        className="form-control"
                        value={qualification.qualificationLevel || "Potential"}
                        onChange={(e) => setQualification({ ...qualification, qualificationLevel: e.target.value })}
                      >
                        <option value="Not Qualified">Not Qualified</option>
                        <option value="Potential">Potential</option>
                        <option value="Qualified">Qualified</option>
                        <option value="High Priority">High Priority</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Priority</label>
                      <select
                        className="form-control"
                        value={qualification.priority || "Medium"}
                        onChange={(e) => setQualification({ ...qualification, priority: e.target.value })}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Company Size / Employees</label>
                      <input
                        type="text"
                        placeholder="e.g. 50-250 employees"
                        className="form-control"
                        value={qualification.companySize || ""}
                        onChange={(e) => setQualification({ ...qualification, companySize: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Expected Purchase Timeline</label>
                      <input
                        type="text"
                        placeholder="e.g. Q4 2026, 1-3 months"
                        className="form-control"
                        value={qualification.expectedTimeline || ""}
                        onChange={(e) => setQualification({ ...qualification, expectedTimeline: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Budget Range</label>
                      <input
                        type="text"
                        placeholder="e.g. ₹200,000 - ₹500,000"
                        className="form-control"
                        value={qualification.budgetRange || ""}
                        onChange={(e) => setQualification({ ...qualification, budgetRange: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Decision-Maker Status</label>
                      <input
                        type="text"
                        placeholder="e.g. Primary Buyer, Recommender, Committee"
                        className="form-control"
                        value={qualification.decisionMakerStatus || ""}
                        onChange={(e) => setQualification({ ...qualification, decisionMakerStatus: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Business Need & Functional Requirements</label>
                    <textarea
                      className="form-control"
                      placeholder="Specific requirements, pain points, and current solutions..."
                      value={qualification.businessRequirement || qualification.businessNeed || ""}
                      onChange={(e) => setQualification({ ...qualification, businessRequirement: e.target.value })}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={savingQual}
                    style={{ marginTop: "12px" }}
                  >
                    {savingQual ? "Saving..." : "Save Qualification Data"}
                  </button>
                </form>
              )}

              {/* Tab 3: Profile & Attribution */}
              {viewTab === "details" && (
                <div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px", marginBottom: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.92rem" }}>
                      <Mail size={16} color="var(--bronze-600)" />
                      <span>{viewLead.email}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.92rem" }}>
                      <Phone size={16} color="var(--bronze-600)" />
                      <span>{viewLead.phone || "No phone recorded"}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.92rem" }}>
                      <MapPin size={16} color="var(--bronze-600)" />
                      <span>{viewLead.location || "Remote / Unspecified"}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.92rem" }}>
                      <Building2 size={16} color="var(--bronze-600)" />
                      <span>{viewLead.industry || "General Enterprise"}</span>
                    </div>
                  </div>

                  <div style={{ background: "var(--cream-100)", padding: "16px", borderRadius: "8px", border: "1px solid var(--cream-300)", marginBottom: "16px" }}>
                    <h5 style={{ margin: "0 0 10px", fontSize: "0.85rem", fontWeight: 700, color: "var(--bronze-700)", textTransform: "uppercase" }}>
                      Attribution & Acquisition
                    </h5>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", fontSize: "0.88rem" }}>
                      <div>Source Channel: <strong>{viewLead.sourceName || "Direct Inbound"}</strong></div>
                      <div>Campaign: <strong>{viewLead.campaignName || "Direct"}</strong></div>
                      <div>Assigned Rep: <strong>{viewLead.assignedUserName || "Unassigned"}</strong></div>
                      <div>Lead Score: <strong>{viewLead.leadScore ?? 0} / 100</strong></div>
                    </div>
                  </div>

                  {/* Closed Won details */}
                  {viewLead.status === "Converted" && viewLead.conversionDetails && (
                    <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "14px", borderRadius: "8px", marginBottom: "16px" }}>
                      <h5 style={{ margin: "0 0 6px", color: "#166534", fontSize: "0.9rem", fontWeight: 700 }}>
                        Closed Deal Value: ₹{Number(viewLead.conversionDetails.dealValue || 0).toLocaleString()}
                      </h5>
                      {viewLead.conversionDetails.notes && (
                        <p style={{ margin: 0, fontSize: "0.85rem", color: "#166534" }}>
                          Notes: {viewLead.conversionDetails.notes}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Closed Lost details */}
                  {viewLead.status === "Lost" && viewLead.lostDetails && (
                    <div style={{ background: "#fef2f2", border: "1px solid #fecaca", padding: "14px", borderRadius: "8px", marginBottom: "16px" }}>
                      <h5 style={{ margin: "0 0 6px", color: "#991b1b", fontSize: "0.9rem", fontWeight: 700 }}>
                        Opportunity Lost Reason: {viewLead.lostDetails.reason}
                      </h5>
                      {viewLead.lostDetails.notes && (
                        <p style={{ margin: 0, fontSize: "0.85rem", color: "#991b1b" }}>
                          Notes: {viewLead.lostDetails.notes}
                        </p>
                      )}
                    </div>
                  )}

                  {viewLead.notes && (
                    <div>
                      <h5 style={{ margin: "0 0 6px", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)" }}>
                        Discovery Notes
                      </h5>
                      <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--text-secondary)", background: "#fff", padding: "12px", borderRadius: "6px", border: "1px solid var(--cream-300)" }}>
                        {viewLead.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setViewLead(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
