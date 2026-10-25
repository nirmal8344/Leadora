import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import apiClient from "../../api/client";
import "./SalesDashboard.css";
import salesHeroGrowth from "../../assets/sales-hero-growth.jpg";
import {
  Users,
  Filter,
  CalendarClock,
  Handshake,
  BarChart2,
  Calendar,
  ChevronRight,
  ArrowRight,
  FileText,
  PhoneCall,
  Phone,
  Video,
  Mail,
  MoreHorizontal,
  CheckCircle2,
  X,
  Clock,
  Building,
  AlertCircle,
} from "lucide-react";

export default function SalesDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [myLeads, setMyLeads] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState("This Month");

  // Action menu dropdown state: followUpId -> bool
  const [openActionId, setOpenActionId] = useState(null);

  // Complete Follow-up Modal State
  const [completingFollowUp, setCompletingFollowUp] = useState(null);
  const [outcome, setOutcome] = useState("Interested");
  const [notes, setNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Lead Details Quick View Modal State
  const [selectedLead, setSelectedLead] = useState(null);

  useEffect(() => {
    fetchSalesData();

    // Close action dropdowns on outside click
    const handleOutsideClick = (e) => {
      if (!e.target.closest(".sales-action-dropdown-wrapper")) {
        setOpenActionId(null);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  const fetchSalesData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, leadsRes, followUpsRes] = await Promise.all([
        apiClient.get("/api/v1/dashboard/sales-stats").catch(() => ({ data: {} })),
        apiClient.get("/api/v1/leads/my").catch(() => ({ data: [] })),
        apiClient.get("/api/v1/follow-ups/my").catch(() => ({ data: [] })),
      ]);

      setStats(statsRes?.data || {});
      setMyLeads(leadsRes?.data || []);
      setFollowUps(followUpsRes?.data || []);
    } catch (err) {
      setError("Failed to load your sales workspace data. Please verify your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteFollowUp = async (e) => {
    e.preventDefault();
    if (!completingFollowUp) return;

    setActionLoading(true);
    try {
      await apiClient.patch(`/api/v1/follow-ups/${completingFollowUp.id}/complete`, {
        outcome,
        notes,
      });
      setCompletingFollowUp(null);
      setNotes("");
      fetchSalesData();
    } catch (err) {
      alert("Failed to complete follow-up. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  // Helper to format scheduled dates cleanly
  const formatDateTime = (dateStr) => {
    if (!dateStr) return "Scheduled";
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const isToday =
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();

      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const isTomorrow =
        date.getDate() === tomorrow.getDate() &&
        date.getMonth() === tomorrow.getMonth() &&
        date.getFullYear() === tomorrow.getFullYear();

      const timeStr = date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      if (isToday) return `Today, ${timeStr}`;
      if (isTomorrow) return `Tomorrow, ${timeStr}`;

      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }) + `, ${timeStr}`;
    } catch (e) {
      return dateStr;
    }
  };

  // Extract initials
  const getInitials = (name) => {
    if (!name) return "L";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Render follow-up type pill
  const renderTypePill = (type) => {
    const t = (type || "").toLowerCase();
    if (t.includes("phone") || t.includes("call")) {
      return (
        <span className="sales-type-pill sales-type-call">
          <Phone size={13} /> Call
        </span>
      );
    }
    if (t.includes("demo") || t.includes("video")) {
      return (
        <span className="sales-type-pill sales-type-demo">
          <Video size={13} /> Demo
        </span>
      );
    }
    if (t.includes("meet")) {
      return (
        <span className="sales-type-pill sales-type-meeting">
          <Users size={13} /> Meeting
        </span>
      );
    }
    return (
      <span className="sales-type-pill sales-type-email">
        <Mail size={13} /> Email
      </span>
    );
  };

  // Status badge
  const renderStatusBadge = (item) => {
    if (item.completed) {
      return <span className="sales-status-badge sales-status-completed">Completed</span>;
    }
    const sched = new Date(item.scheduledDateTime);
    const now = new Date();
    if (sched < now) {
      return <span className="sales-status-badge sales-status-pending">Pending</span>;
    }
    return <span className="sales-status-badge sales-status-upcoming">Upcoming</span>;
  };

  // Pipeline stage calculations from live data
  const statusMap = stats?.leadsByStatus || {};
  const newCount = statusMap["New"] || statusMap["NEW"] || 0;
  const contactedCount = statusMap["Contacted"] || statusMap["CONTACTED"] || 0;
  const qualifiedCount = statusMap["Qualified"] || statusMap["QUALIFIED"] || 0;
  const proposalCount = statusMap["Proposal"] || statusMap["PROPOSAL"] || 0;
  const convertedCount = stats?.convertedLeads ?? (statusMap["Converted"] || statusMap["CONVERTED"] || 0);

  // My leads count
  const totalLeadsCount = stats?.totalLeads ?? myLeads.length;

  // Pending follow ups count
  const followUpsDueCount = stats?.pendingFollowUps ?? followUps.filter((f) => !f.completed).length;

  // Recent upcoming follow-ups (take up to 5)
  const displayedFollowUps = followUps.slice(0, 5);

  return (
    <Layout>
      <div className="sales-dash-container">
        {error && (
          <div
            style={{
              padding: "14px 18px",
              borderRadius: "10px",
              background: "#fee2e2",
              color: "#991b1b",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Hero Banner */}
        <section className="sales-hero-card">
          <div className="sales-hero-left">
            <div className="sales-hero-accent-bar" />
            <h1 className="sales-hero-title">
              Your next deal <br />
              <span className="sales-hero-title-accent">starts here.</span>
            </h1>
            <p className="sales-hero-subtitle">
              Manage assigned leads and keep every follow-up on track.
            </p>
          </div>
          <div className="sales-hero-right">
            <img
              src={salesHeroGrowth}
              alt="Sales Growth Progression"
              className="sales-hero-image"
            />
          </div>
        </section>

        {/* 2. Four KPI Cards */}
        <section className="sales-kpi-grid">
          {/* Card 1: My Leads */}
          <Link to="/leads" className="sales-kpi-card">
            <div className="sales-kpi-left">
              <div className="sales-kpi-icon-box">
                <Users size={22} />
              </div>
              <div className="sales-kpi-info">
                <span className="sales-kpi-label">My Leads</span>
                <span className="sales-kpi-value">{totalLeadsCount}</span>
                <span className="sales-kpi-sub">Assigned to you</span>
              </div>
            </div>
            <ChevronRight size={18} className="sales-kpi-arrow" />
          </Link>

          {/* Card 2: Qualified */}
          <div
            onClick={() => navigate("/leads?status=Qualified")}
            className="sales-kpi-card"
          >
            <div className="sales-kpi-left">
              <div className="sales-kpi-icon-box">
                <Filter size={22} />
              </div>
              <div className="sales-kpi-info">
                <span className="sales-kpi-label">Qualified</span>
                <span className="sales-kpi-value">{qualifiedCount}</span>
                <span className="sales-kpi-sub">Ready for proposal</span>
              </div>
            </div>
            <ChevronRight size={18} className="sales-kpi-arrow" />
          </div>

          {/* Card 3: Follow-ups Due */}
          <Link to="/follow-ups" className="sales-kpi-card">
            <div className="sales-kpi-left">
              <div className="sales-kpi-icon-box">
                <CalendarClock size={22} />
              </div>
              <div className="sales-kpi-info">
                <span className="sales-kpi-label">Follow-ups Due</span>
                <span className="sales-kpi-value">{followUpsDueCount}</span>
                <span className="sales-kpi-sub">This week</span>
              </div>
            </div>
            <ChevronRight size={18} className="sales-kpi-arrow" />
          </Link>

          {/* Card 4: Closed Deals */}
          <div
            onClick={() => navigate("/clients")}
            className="sales-kpi-card"
          >
            <div className="sales-kpi-left">
              <div className="sales-kpi-icon-box">
                <Handshake size={22} />
              </div>
              <div className="sales-kpi-info">
                <span className="sales-kpi-label">Closed Deals</span>
                <span className="sales-kpi-value">{convertedCount}</span>
                <span className="sales-kpi-sub">This month</span>
              </div>
            </div>
            <ChevronRight size={18} className="sales-kpi-arrow" />
          </div>
        </section>

        {/* 3. Sales Pipeline */}
        <section className="sales-pipeline-card">
          <div className="sales-card-header">
            <div className="sales-card-header-left">
              <div className="sales-card-header-icon">
                <BarChart2 size={18} />
              </div>
              <div>
                <h2 className="sales-card-title">Sales Pipeline</h2>
                <p className="sales-card-subtitle">
                  Track your opportunities and move deals forward.
                </p>
              </div>
            </div>

            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="sales-filter-select"
            >
              <option value="This Month">This Month</option>
              <option value="This Week">This Week</option>
              <option value="This Quarter">This Quarter</option>
              <option value="All Time">All Time</option>
            </select>
          </div>

          <div className="sales-pipeline-grid">
            {/* Stage 1: New */}
            <div
              className="sales-stage-chevron sales-stage-new"
              onClick={() => navigate("/leads?status=New")}
              title="Filter New Leads"
            >
              <div className="sales-stage-top">
                <FileText size={17} />
                <span>New</span>
              </div>
              <div className="sales-stage-bottom">
                <span className="sales-stage-count">{newCount}</span>
                <span className="sales-stage-unit">Leads</span>
              </div>
            </div>

            {/* Stage 2: Contacted */}
            <div
              className="sales-stage-chevron sales-stage-contacted"
              onClick={() => navigate("/leads?status=Contacted")}
              title="Filter Contacted Leads"
            >
              <div className="sales-stage-top">
                <PhoneCall size={17} />
                <span>Contacted</span>
              </div>
              <div className="sales-stage-bottom">
                <span className="sales-stage-count">{contactedCount}</span>
                <span className="sales-stage-unit">Leads</span>
              </div>
            </div>

            {/* Stage 3: Qualified */}
            <div
              className="sales-stage-chevron sales-stage-qualified"
              onClick={() => navigate("/leads?status=Qualified")}
              title="Filter Qualified Leads"
            >
              <div className="sales-stage-top">
                <Users size={17} />
                <span>Qualified</span>
              </div>
              <div className="sales-stage-bottom">
                <span className="sales-stage-count">{qualifiedCount}</span>
                <span className="sales-stage-unit">Leads</span>
              </div>
            </div>

            {/* Stage 4: Proposal */}
            <div
              className="sales-stage-chevron sales-stage-proposal"
              onClick={() => navigate("/leads?status=Proposal")}
              title="Filter Proposal Leads"
            >
              <div className="sales-stage-top">
                <FileText size={17} />
                <span>Proposal</span>
              </div>
              <div className="sales-stage-bottom">
                <span className="sales-stage-count">{proposalCount}</span>
                <span className="sales-stage-unit">Leads</span>
              </div>
            </div>

            {/* Stage 5: Converted (Active rich bronze) */}
            <div
              className="sales-stage-chevron sales-stage-converted"
              onClick={() => navigate("/clients")}
              title="View Converted Deals"
            >
              <div className="sales-stage-top">
                <Handshake size={17} />
                <span>Converted</span>
              </div>
              <div className="sales-stage-bottom">
                <span className="sales-stage-count">{convertedCount}</span>
                <span className="sales-stage-unit">Deals</span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Upcoming Follow-ups */}
        <section className="sales-followups-card">
          <div className="sales-card-header">
            <div className="sales-card-header-left">
              <div className="sales-card-header-icon">
                <Calendar size={18} />
              </div>
              <div>
                <h2 className="sales-card-title">Upcoming Follow-ups</h2>
              </div>
            </div>

            <Link to="/follow-ups" className="sales-view-all-link">
              <span>View All</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="sales-table-wrapper">
            <table className="sales-table">
              <thead>
                <tr>
                  <th>Contact</th>
                  <th>Company</th>
                  <th>Type</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {displayedFollowUps.length === 0 ? (
                  <tr>
                    <td colSpan="6">
                      <div className="sales-empty-state">
                        <CalendarClock size={36} className="sales-empty-icon" />
                        <p>No follow-ups scheduled at this time.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  displayedFollowUps.map((item) => (
                    <tr key={item.id}>
                      {/* Contact */}
                      <td>
                        <div className="sales-contact-cell">
                          <div className="sales-contact-avatar">
                            {getInitials(item.leadName)}
                          </div>
                          <span className="sales-contact-name">
                            {item.leadName || "Lead Contact"}
                          </span>
                        </div>
                      </td>

                      {/* Company */}
                      <td className="sales-company-cell">
                        {item.leadCompany || "Enterprise Client"}
                      </td>

                      {/* Type */}
                      <td>{renderTypePill(item.followUpType)}</td>

                      {/* Date & Time */}
                      <td>{formatDateTime(item.scheduledDateTime)}</td>

                      {/* Status */}
                      <td>{renderStatusBadge(item)}</td>

                      {/* Action */}
                      <td>
                        <div className="sales-action-dropdown-wrapper">
                          <button
                            type="button"
                            className="sales-action-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenActionId(openActionId === item.id ? null : item.id);
                            }}
                            title="Actions"
                          >
                            <MoreHorizontal size={18} />
                          </button>

                          {openActionId === item.id && (
                            <div className="sales-action-dropdown">
                              {!item.completed && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCompletingFollowUp(item);
                                    setOpenActionId(null);
                                  }}
                                >
                                  <CheckCircle2 size={15} color="#166534" />
                                  <span>Mark as Complete</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  navigate(`/leads?id=${item.leadId}`);
                                  setOpenActionId(null);
                                }}
                              >
                                <Users size={15} color="#964f1d" />
                                <span>View Lead</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  navigate("/follow-ups");
                                  setOpenActionId(null);
                                }}
                              >
                                <CalendarClock size={15} color="#44403c" />
                                <span>Reschedule</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Complete Follow-up Modal */}
      {completingFollowUp && (
        <div className="sales-modal-backdrop">
          <div className="sales-modal-card">
            <div className="sales-modal-header">
              <h3 className="sales-modal-title">Complete Follow-up</h3>
              <button
                className="sales-modal-close"
                onClick={() => setCompletingFollowUp(null)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCompleteFollowUp}>
              <div className="sales-form-group">
                <label className="sales-form-label">Contact</label>
                <input
                  type="text"
                  className="sales-form-input"
                  value={completingFollowUp.leadName || ""}
                  disabled
                />
              </div>

              <div className="sales-form-group">
                <label className="sales-form-label">Call/Meeting Outcome</label>
                <select
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                  className="sales-form-select"
                  required
                >
                  <option value="Interested">Interested (Advance to Qualified)</option>
                  <option value="Follow-up Required">Follow-up Required</option>
                  <option value="Not Interested">Not Interested</option>
                  <option value="No Response">No Response</option>
                  <option value="Converted">Converted (Deal Closed)</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>

              <div className="sales-form-group">
                <label className="sales-form-label">Meeting Notes & Next Steps</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record summary of discussion, buyer objections, and committed next steps..."
                  className="sales-form-textarea"
                  rows={4}
                  required
                />
              </div>

              <div className="sales-modal-footer">
                <button
                  type="button"
                  className="sales-btn-secondary"
                  onClick={() => setCompletingFollowUp(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="sales-btn-primary"
                  disabled={actionLoading}
                >
                  {actionLoading ? "Saving..." : "Save & Complete"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
