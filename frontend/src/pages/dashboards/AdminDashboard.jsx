import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import apiClient from "../../api/client";
import {
  Users,
  Target,
  Megaphone,
  TrendingUp,
  BarChart2,
  Calendar,
  ChevronRight,
  Clock,
  UserCheck,
  AlertCircle,
  Layers,
  FileText,
  Mail,
  Globe,
  Share2,
  MoreVertical,
  ChevronDown,
} from "lucide-react";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return "Good Morning";
  } else if (hour >= 12 && hour < 17) {
    return "Good Afternoon";
  } else {
    return "Good Evening";
  }
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [greeting, setGreeting] = useState(getGreeting());

  useEffect(() => {
    fetchDashboardData();

    const handleUpdateGreeting = () => {
      setGreeting(getGreeting());
    };

    window.addEventListener("focus", handleUpdateGreeting);
    const handleVisibility = () => {
      if (!document.hidden) handleUpdateGreeting();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("focus", handleUpdateGreeting);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get("/api/v1/dashboard/stats");
      setStats(res?.data || {});
    } catch (err) {
      setError("Failed to load dashboard metrics from the server.");
      setStats({});
    } finally {
      setLoading(false);
    }
  };

  const formattedToday = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const totalLeads = stats?.totalLeads ?? 0;
  const activeLeads = stats?.activeLeads ?? 0;
  const activeCampaigns = stats?.activeCampaigns ?? 0;
  const convertedLeads = stats?.convertedLeads ?? 0;

  const statusMap = stats?.leadsByStatus || {};
  const pipelineCounts = {
    new: statusMap["New"] ?? 0,
    contacted: statusMap["Contacted"] ?? 0,
    qualified: statusMap["Qualified"] ?? 0,
    proposal: statusMap["Proposal"] ?? 0,
    converted: statusMap["Converted"] ?? 0,
  };

  const overdueCount = stats?.overdueFollowUps ?? 0;
  const unassignedCount = stats?.unassignedLeads ?? 0;
  const riskCount = stats?.leadsAtRisk ?? 0;

  const recentLeads = stats?.recentLeads || [];
  const recentCampaigns = stats?.recentCampaigns || [];

  const renderSourceIcon = (source) => {
    const s = (source || "").toLowerCase();
    if (s.includes("google")) {
      return (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "16px",
            height: "16px",
            borderRadius: "50%",
            fontSize: "10px",
            fontWeight: "700",
            color: "#4285F4",
          }}
        >
          G
        </span>
      );
    }
    if (s.includes("linkedin")) {
      return (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "16px",
            height: "16px",
            borderRadius: "3px",
            background: "#0077B5",
            color: "#fff",
            fontSize: "9px",
            fontWeight: "800",
          }}
        >
          in
        </span>
      );
    }
    if (s.includes("mail")) {
      return <Mail size={14} color="#EA4335" />;
    }
    if (s.includes("referral")) {
      return <Share2 size={14} color="#B26A38" />;
    }
    return <Globe size={14} color="#5F6368" />;
  };

  const getInitials = (name) => {
    if (!name) return "L";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <Layout>
      {error && <div className="dash-error">{error}</div>}

      {/* Dynamic Header */}
      <div className="dash-header">
        <div>
          <div className="dash-greeting">{greeting},</div>
          <h1 className="dash-title">Executive Overview</h1>
          <p className="dash-subtitle">
            Manage your campaigns, leads and team performance — all in one place.
          </p>
        </div>

        <div className="dash-date-pill">
          <Calendar size={18} />
          <div className="dash-date-meta">
            <span className="dash-date-label">Today</span>
            <span className="dash-date-val">{formattedToday}</span>
          </div>
        </div>
      </div>

      {/* 4 KPI Cards - Strictly Real Data from DB */}
      <div className="dash-kpi-grid">
        <div className="dash-kpi-card">
          <div className="dash-kpi-icon">
            <Users size={22} />
          </div>
          <div className="dash-kpi-content">
            <div className="dash-kpi-label">Total Leads</div>
            <div className="dash-kpi-value">{totalLeads}</div>
            <div className="dash-kpi-subtext">Across all marketing sources</div>
          </div>
        </div>

        <div className="dash-kpi-card">
          <div className="dash-kpi-icon">
            <Target size={22} />
          </div>
          <div className="dash-kpi-content">
            <div className="dash-kpi-label">Active Leads</div>
            <div className="dash-kpi-value">{activeLeads}</div>
            <div className="dash-kpi-subtext">Under active sales engagement</div>
          </div>
        </div>

        <div className="dash-kpi-card">
          <div className="dash-kpi-icon">
            <Megaphone size={22} />
          </div>
          <div className="dash-kpi-content">
            <div className="dash-kpi-label">Active Campaigns</div>
            <div className="dash-kpi-value">{activeCampaigns}</div>
            <div className="dash-kpi-subtext">Live multi-channel programs</div>
          </div>
        </div>

        <div className="dash-kpi-card">
          <div className="dash-kpi-icon">
            <TrendingUp size={22} />
          </div>
          <div className="dash-kpi-content">
            <div className="dash-kpi-label">Converted Leads</div>
            <div className="dash-kpi-value">{convertedLeads}</div>
            <div className="dash-kpi-subtext">Closed-won customer accounts</div>
          </div>
        </div>
      </div>

      {/* Middle Section: Lead Pipeline + Needs Attention */}
      <div className="dash-mid-grid">
        {/* Lead Pipeline Flow */}
        <div className="dash-card">
          <div className="dash-card-header">
            <div className="dash-card-title">
              <Layers size={18} />
              <span>Lead Pipeline</span>
            </div>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
              All Inbound Stages
            </span>
          </div>
          <div className="dash-card-body">
            <div className="dash-pipeline-flow">
              <Link to="/leads?status=New" className="dash-pipeline-stage">
                <div className="dash-pipeline-icon">
                  <Users size={18} />
                </div>
                <span className="dash-pipeline-label">New</span>
                <span className="dash-pipeline-count">{pipelineCounts.new}</span>
              </Link>

              <div className="dash-pipeline-arrow">
                <svg width="32" height="12" viewBox="0 0 32 12" fill="none">
                  <path
                    d="M1 6H26M26 6L21 1M26 6L21 11"
                    stroke="#D4C8BA"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="2 3"
                  />
                </svg>
              </div>

              <Link to="/leads?status=Contacted" className="dash-pipeline-stage">
                <div className="dash-pipeline-icon">
                  <BarChart2 size={18} />
                </div>
                <span className="dash-pipeline-label">Contacted</span>
                <span className="dash-pipeline-count">{pipelineCounts.contacted}</span>
              </Link>

              <div className="dash-pipeline-arrow">
                <svg width="32" height="12" viewBox="0 0 32 12" fill="none">
                  <path
                    d="M1 6H26M26 6L21 1M26 6L21 11"
                    stroke="#D4C8BA"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="2 3"
                  />
                </svg>
              </div>

              <Link to="/leads?status=Qualified" className="dash-pipeline-stage">
                <div className="dash-pipeline-icon">
                  <UserCheck size={18} />
                </div>
                <span className="dash-pipeline-label">Qualified</span>
                <span className="dash-pipeline-count">{pipelineCounts.qualified}</span>
              </Link>

              <div className="dash-pipeline-arrow">
                <svg width="32" height="12" viewBox="0 0 32 12" fill="none">
                  <path
                    d="M1 6H26M26 6L21 1M26 6L21 11"
                    stroke="#D4C8BA"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="2 3"
                  />
                </svg>
              </div>

              <Link to="/leads?status=Proposal" className="dash-pipeline-stage">
                <div className="dash-pipeline-icon">
                  <Mail size={18} />
                </div>
                <span className="dash-pipeline-label">Proposal</span>
                <span className="dash-pipeline-count">{pipelineCounts.proposal}</span>
              </Link>

              <div className="dash-pipeline-arrow">
                <svg width="32" height="12" viewBox="0 0 32 12" fill="none">
                  <path
                    d="M1 6H26M26 6L21 1M26 6L21 11"
                    stroke="#D4C8BA"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="2 3"
                  />
                </svg>
              </div>

              <Link to="/leads?status=Converted" className="dash-pipeline-stage">
                <div className="dash-pipeline-icon">
                  <FileText size={18} />
                </div>
                <span className="dash-pipeline-label">Converted</span>
                <span className="dash-pipeline-count">{pipelineCounts.converted}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Needs Attention Card */}
        <div className="dash-card">
          <div className="dash-card-header">
            <div className="dash-card-title">
              <Clock size={18} />
              <span>Needs Attention</span>
            </div>
            <Link to="/leads" className="dash-card-action">
              <span>View All</span>
              <ChevronRight size={14} />
            </Link>
          </div>
          <div className="dash-card-body">
            <div className="dash-attention-list">
              <Link to="/follow-ups" className="dash-attention-row">
                <div className="dash-attention-left">
                  <div className="dash-attention-icon overdue">
                    <Clock size={16} />
                  </div>
                  <div className="dash-attention-text">
                    <strong>{overdueCount} Overdue Follow-ups</strong>
                    <span>Leads pending follow-up</span>
                  </div>
                </div>
                <div className="dash-attention-right">
                  <span className="dash-attention-badge overdue">{overdueCount}</span>
                  <ChevronRight size={14} style={{ color: "#D4C8BA" }} />
                </div>
              </Link>

              <Link to="/leads" className="dash-attention-row">
                <div className="dash-attention-left">
                  <div className="dash-attention-icon unassigned">
                    <Users size={16} />
                  </div>
                  <div className="dash-attention-text">
                    <strong>{unassignedCount} Unassigned Leads</strong>
                    <span>Leads waiting for assignment</span>
                  </div>
                </div>
                <div className="dash-attention-right">
                  <span className="dash-attention-badge unassigned">{unassignedCount}</span>
                  <ChevronRight size={14} style={{ color: "#D4C8BA" }} />
                </div>
              </Link>

              <Link to="/leads" className="dash-attention-row">
                <div className="dash-attention-left">
                  <div className="dash-attention-icon risk">
                    <AlertCircle size={16} />
                  </div>
                  <div className="dash-attention-text">
                    <strong>{riskCount} Leads at Risk</strong>
                    <span>No response for 7+ days</span>
                  </div>
                </div>
                <div className="dash-attention-right">
                  <span className="dash-attention-badge risk">{riskCount}</span>
                  <ChevronRight size={14} style={{ color: "#D4C8BA" }} />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Lead Activity + Campaign Overview */}
      <div className="dash-bottom-grid">
        {/* Recent Lead Activity Table */}
        <div className="dash-card">
          <div className="dash-card-header">
            <div className="dash-card-title">
              <FileText size={18} />
              <span>Recent Lead Activity</span>
            </div>
            <Link to="/leads" className="dash-card-action">
              <span>View All</span>
              <ChevronRight size={14} />
            </Link>
          </div>
          <div className="dash-card-body" style={{ padding: 0 }}>
            {recentLeads.length > 0 ? (
              <div className="table-container">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Lead / Company</th>
                      <th>Source</th>
                      <th>Assigned To</th>
                      <th>Status</th>
                      <th>Received</th>
                      <th style={{ width: "36px" }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLeads.map((lead) => (
                      <tr key={lead.id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div
                              style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "999px",
                                background: "var(--bronze-200)",
                                color: "var(--bronze-800)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 700,
                                fontSize: "0.82rem",
                                flexShrink: 0,
                              }}
                            >
                              {getInitials(lead.name)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.95rem" }}>
                                {lead.name}
                              </div>
                              <div style={{ fontSize: "0.84rem", color: "var(--text-muted)" }}>
                                {lead.company}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            {renderSourceIcon(lead.sourceName)}
                            <span>{lead.sourceName || "Direct"}</span>
                          </div>
                        </td>
                        <td>{lead.assignedUserName || <span style={{ color: "var(--text-light)", fontStyle: "italic" }}>Unassigned</span>}</td>
                        <td>
                          <span className={`dash-status-badge ${(lead.status || "new").toLowerCase()}`}>
                            {lead.status}
                          </span>
                        </td>
                        <td style={{ color: "var(--text-muted)" }}>
                          {lead.dateReceived
                            ? new Date(lead.dateReceived).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "Recent"}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn-icon"
                            onClick={() => navigate("/leads")}
                            title="View Lead"
                          >
                            <MoreVertical size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <FileText size={32} />
                <h4>No recent lead activity</h4>
                <p>Inbound leads from campaigns and sources will appear here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Campaign Overview Table */}
        <div className="dash-card">
          <div className="dash-card-header">
            <div className="dash-card-title">
              <Megaphone size={18} />
              <span>Campaign Overview</span>
            </div>
            <Link to="/campaigns" className="dash-card-action">
              <span>View All</span>
              <ChevronRight size={14} />
            </Link>
          </div>
          <div className="dash-card-body" style={{ padding: 0 }}>
            {recentCampaigns.length > 0 ? (
              <div className="table-container">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Campaign</th>
                      <th>Status</th>
                      <th>Reach</th>
                      <th>Budget</th>
                      <th style={{ width: "36px" }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentCampaigns.map((camp) => (
                      <tr key={camp.id}>
                        <td>
                          <div>
                            <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.95rem" }}>
                              {camp.name}
                            </div>
                            <div style={{ fontSize: "0.84rem", color: "var(--text-muted)" }}>
                              {camp.startDate && camp.endDate
                                ? `${new Date(camp.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${new Date(camp.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                                : camp.type}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`dash-status-badge ${(camp.status || "active").toLowerCase()}`}>
                            {camp.status}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                          {(camp.reach || camp.impressions || 0).toLocaleString()}
                        </td>
                        <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                          ₹{Number(camp.budget || 0).toLocaleString()}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn-icon"
                            onClick={() => navigate("/campaigns")}
                            title="View Campaign"
                          >
                            <MoreVertical size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <Megaphone size={32} />
                <h4>No active campaigns</h4>
                <p>Launch marketing campaigns to generate enterprise pipeline leads.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
