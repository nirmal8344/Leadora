import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import apiClient from "../../api/client";
import "./MarketingDashboard.css";
import marketingHeroBanner from "../../assets/marketing-hero-banner.jpg";
import {
  Megaphone,
  Eye,
  MousePointerClick,
  Percent,
  ChevronRight,
  BarChart2,
  Calendar,
  Zap,
  FileText,
  Link2,
  BarChart3,
  MoreVertical,
  Plus,
  ArrowRight,
  X,
  Check,
  ChevronDown,
  AlertCircle,
} from "lucide-react";

export default function MarketingDashboard() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [channelTimeFilter, setChannelTimeFilter] = useState("This Month");

  // Action Menu dropdown state: campId -> bool
  const [openActionId, setOpenActionId] = useState(null);

  // Launch Campaign Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "Instagram",
    objective: "Brand Awareness & Conversions",
    budget: "",
    startDate: "",
    endDate: "",
    targetAudience: "Decision makers & Tech Leads",
    targetLocation: "Global / Pan-India",
    description: "",
    status: "Active",
    impressions: 10000,
    clicks: 450,
    reach: 8500,
  });

  // Upcoming Tasks Interactive Checklist
  const [tasks, setTasks] = useState([
    { id: 1, title: "Create creatives for new campaign", due: "Today", completed: false },
    { id: 2, title: "Review landing page content", due: "Today", completed: false },
    { id: 3, title: "Schedule social media posts", due: "Tomorrow", completed: false },
    { id: 4, title: "Analyze campaign performance", due: "Tomorrow", completed: false },
  ]);

  const [marketingStats, setMarketingStats] = useState(null);

  useEffect(() => {
    fetchMarketingData();

    const handleOutsideClick = (e) => {
      if (!e.target.closest(".mkt-dropdown-wrapper")) {
        setOpenActionId(null);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  const fetchMarketingData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [campRes, statsRes] = await Promise.all([
        apiClient.get("/api/v1/campaigns").catch(() => ({ data: [] })),
        apiClient.get("/api/v1/dashboard/marketing-stats").catch(() => ({ data: null })),
      ]);
      setCampaigns(campRes?.data || []);
      setMarketingStats(statsRes?.data || null);
    } catch (err) {
      setError("Failed to load marketing intelligence. Please verify connectivity.");
    } finally {
      setLoading(false);
    }
  };

  const handleLaunchCampaign = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        budget: parseFloat(formData.budget) || 10000,
        impressions: parseInt(formData.impressions, 10) || 10000,
        clicks: parseInt(formData.clicks, 10) || 450,
        reach: parseInt(formData.reach, 10) || 8500,
      };

      await apiClient.post("/api/v1/campaigns", payload);
      setIsModalOpen(false);
      setFormData({
        name: "",
        type: "Instagram",
        objective: "Brand Awareness & Conversions",
        budget: "",
        startDate: "",
        endDate: "",
        targetAudience: "Decision makers & Tech Leads",
        targetLocation: "Global / Pan-India",
        description: "",
        status: "Active",
        impressions: 10000,
        clicks: 450,
        reach: 8500,
      });
      fetchMarketingData();
    } catch (err) {
      alert("Failed to launch campaign. Please check inputs.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleTask = (taskId) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  // Active Campaigns filter
  const activeCampaigns = campaigns.filter(
    (c) => c.status === "Active" || c.status === "ACTIVE"
  );

  // Real Aggregated KPI numbers from DB
  const totalCampaignsCount = marketingStats?.totalCampaigns ?? campaigns.length;
  const activeCount = marketingStats?.activeCampaigns ?? activeCampaigns.length;

  const totalImpressions = marketingStats?.totalImpressions ?? campaigns.reduce((acc, c) => acc + (c.impressions || 0), 0);
  const totalClicks = marketingStats?.totalClicks ?? campaigns.reduce((acc, c) => acc + (c.clicks || 0), 0);
  const avgCtr = marketingStats?.avgCtr ?? (totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0.00");

  // Dynamic Channel Performance aggregated from campaigns
  const channelBreakdown = campaigns.reduce((acc, c) => {
    const ch = c.type || "Other";
    if (!acc[ch]) {
      acc[ch] = { channel: ch, impressions: 0, clicks: 0 };
    }
    acc[ch].impressions += c.impressions || 0;
    acc[ch].clicks += c.clicks || 0;
    return acc;
  }, {});

  const channelData = Object.values(channelBreakdown).map((c) => ({
    channel: c.channel,
    impressions: c.impressions.toLocaleString(),
    clicks: c.clicks.toLocaleString(),
    ctr: c.impressions > 0 ? ((c.clicks / c.impressions) * 100).toFixed(2) + "%" : "0.00%",
  }));

  return (
    <Layout>
      <div className="mkt-dash-container">
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
        <section className="mkt-hero-card">
          <div className="mkt-hero-left">
            <div className="mkt-hero-tag">MARKETING</div>
            <h1 className="mkt-hero-title">
              Turn Ideas Into <br />
              <span className="mkt-hero-accent">Real Results.</span>
            </h1>
            <p className="mkt-hero-sub">
              Plan, launch and track your marketing campaigns with ease.
            </p>
          </div>
          <div className="mkt-hero-right">
            <img
              src={marketingHeroBanner}
              alt="Marketing Growth Studio"
              className="mkt-hero-image"
            />
          </div>
        </section>

        {/* 2. Four KPI Cards */}
        <section className="mkt-kpi-grid">
          {/* Card 1: Active Campaigns */}
          <Link to="/campaigns" className="mkt-kpi-card">
            <div className="mkt-kpi-left">
              <div className="mkt-kpi-icon">
                <Megaphone size={22} />
              </div>
              <div className="mkt-kpi-info">
                <span className="mkt-kpi-label">Active Campaigns</span>
                <span className="mkt-kpi-val">{activeCount}</span>
                <span className="mkt-kpi-sub">
                  Out of {totalCampaignsCount} total campaigns
                </span>
              </div>
            </div>
            <ChevronRight size={18} className="mkt-kpi-arrow" />
          </Link>

          {/* Card 2: Total Impressions */}
          <Link to="/campaigns" className="mkt-kpi-card">
            <div className="mkt-kpi-left">
              <div className="mkt-kpi-icon">
                <Eye size={22} />
              </div>
              <div className="mkt-kpi-info">
                <span className="mkt-kpi-label">Total Impressions</span>
                <span className="mkt-kpi-val">{totalImpressions.toLocaleString()}</span>
                <div className="mkt-kpi-trend-row">
                  <span className="mkt-kpi-trend">↑ +12%</span>
                  <span className="mkt-kpi-vs">vs last month</span>
                </div>
              </div>
            </div>
            <ChevronRight size={18} className="mkt-kpi-arrow" />
          </Link>

          {/* Card 3: Total Clicks */}
          <Link to="/campaigns" className="mkt-kpi-card">
            <div className="mkt-kpi-left">
              <div className="mkt-kpi-icon">
                <MousePointerClick size={22} />
              </div>
              <div className="mkt-kpi-info">
                <span className="mkt-kpi-label">Total Clicks</span>
                <span className="mkt-kpi-val">{totalClicks.toLocaleString()}</span>
                <div className="mkt-kpi-trend-row">
                  <span className="mkt-kpi-trend">↑ +18%</span>
                  <span className="mkt-kpi-vs">vs last month</span>
                </div>
              </div>
            </div>
            <ChevronRight size={18} className="mkt-kpi-arrow" />
          </Link>

          {/* Card 4: Average CTR */}
          <Link to="/campaigns" className="mkt-kpi-card">
            <div className="mkt-kpi-left">
              <div className="mkt-kpi-icon">
                <Percent size={20} />
              </div>
              <div className="mkt-kpi-info">
                <span className="mkt-kpi-label">Average CTR</span>
                <span className="mkt-kpi-val">{avgCtr}%</span>
                <div className="mkt-kpi-trend-row">
                  <span className="mkt-kpi-trend">↑ +5%</span>
                  <span className="mkt-kpi-vs">vs last month</span>
                </div>
              </div>
            </div>
            <ChevronRight size={18} className="mkt-kpi-arrow" />
          </Link>
        </section>

        {/* 3. Middle Section: Active Campaigns (Left) + Channel Performance (Right) */}
        <section className="mkt-mid-grid">
          {/* Left: Active Campaigns Table */}
          <div className="mkt-card">
            <div className="mkt-card-header">
              <div className="mkt-card-header-left">
                <div className="mkt-card-icon-box">
                  <Megaphone size={18} />
                </div>
                <div>
                  <h2 className="mkt-card-title">Active Campaigns</h2>
                  <p className="mkt-card-sub">
                    Track your running campaigns and their performance.
                  </p>
                </div>
              </div>

              <div className="mkt-header-actions">
                <button
                  type="button"
                  className="mkt-btn-primary"
                  onClick={() => setIsModalOpen(true)}
                >
                  <Plus size={15} />
                  <span>Launch Campaign</span>
                </button>

                <Link to="/campaigns" className="mkt-link-action">
                  <span>View All</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            <div className="mkt-table-wrapper">
              <table className="mkt-table mkt-camp-table">
                <thead>
                  <tr>
                    <th>Campaign Name</th>
                    <th>Channel</th>
                    <th>Status</th>
                    <th>Budget</th>
                    <th>Impressions</th>
                    <th>Clicks</th>
                    <th>CTR</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeCampaigns.map((camp) => {
                    const ctrVal =
                      camp.ctr ||
                      (camp.impressions
                        ? ((camp.clicks / camp.impressions) * 100).toFixed(2) + "%"
                        : "0.00%");

                    const channelName =
                      camp.channel ||
                      (camp.name?.includes("Google")
                        ? "Google Search"
                        : camp.name?.includes("Enterprise")
                        ? "Instagram"
                        : camp.type === "Social Media"
                        ? "Instagram"
                        : camp.type === "Search"
                        ? "Google Search"
                        : camp.type || "Instagram");

                    return (
                      <tr key={camp.id}>
                        <td>
                          <div className="mkt-camp-name">{camp.name}</div>
                        </td>
                        <td className="mkt-channel-cell">{channelName}</td>
                        <td>
                          <span className="mkt-status-badge">Active</span>
                        </td>
                        <td>₹{Number(camp.budget || 0).toLocaleString()}</td>
                        <td>{(camp.impressions || 0).toLocaleString()}</td>
                        <td>{(camp.clicks || 0).toLocaleString()}</td>
                        <td>{ctrVal}</td>
                        <td>
                          <div className="mkt-dropdown-wrapper">
                            <button
                              type="button"
                              className="mkt-dots-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenActionId(openActionId === camp.id ? null : camp.id);
                              }}
                              title="Campaign Options"
                            >
                              <MoreVertical size={16} />
                            </button>

                            {openActionId === camp.id && (
                              <div className="mkt-dropdown-menu">
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigate("/campaigns");
                                    setOpenActionId(null);
                                  }}
                                >
                                  <Eye size={14} color="#964f1d" />
                                  <span>View Campaign</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigate("/campaigns");
                                    setOpenActionId(null);
                                  }}
                                >
                                  <FileText size={14} color="#44403c" />
                                  <span>Edit Budget</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Channel Performance Table */}
          <div className="mkt-card">
            <div className="mkt-card-header">
              <div className="mkt-card-header-left">
                <div className="mkt-card-icon-box">
                  <BarChart2 size={18} />
                </div>
                <div>
                  <h2 className="mkt-card-title">Channel Performance</h2>
                </div>
              </div>

              <select
                value={channelTimeFilter}
                onChange={(e) => setChannelTimeFilter(e.target.value)}
                className="mkt-select-pill"
              >
                <option value="This Month">This Month</option>
                <option value="This Quarter">This Quarter</option>
                <option value="All Time">All Time</option>
              </select>
            </div>

            <div className="mkt-table-wrapper">
              <table className="mkt-table mkt-channel-table">
                <thead>
                  <tr>
                    <th>Channel</th>
                    <th>Impressions</th>
                    <th>Clicks</th>
                    <th>CTR</th>
                  </tr>
                </thead>
                <tbody>
                  {channelData.map((row) => (
                    <tr key={row.channel}>
                      <td className="mkt-camp-name">{row.channel}</td>
                      <td>{row.impressions}</td>
                      <td>{row.clicks}</td>
                      <td>{row.ctr}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 4. Bottom Section: Upcoming Tasks (Left) + Quick Actions (Right) */}
        <section className="mkt-bottom-grid">
          {/* Left: Upcoming Tasks (Interactive Checklist) */}
          <div className="mkt-card">
            <div className="mkt-card-header">
              <div className="mkt-card-header-left">
                <div className="mkt-card-icon-box">
                  <Calendar size={18} />
                </div>
                <div>
                  <h2 className="mkt-card-title">Upcoming Tasks</h2>
                </div>
              </div>

              <Link to="/campaigns" className="mkt-link-action">
                <span>View All</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="mkt-tasks-list">
              {tasks.map((task) => (
                <div key={task.id} className="mkt-task-row">
                  <div className="mkt-task-left">
                    <button
                      type="button"
                      className={`mkt-task-checkbox ${task.completed ? "checked" : ""}`}
                      onClick={() => toggleTask(task.id)}
                      title="Toggle Task"
                    >
                      {task.completed && <Check size={12} strokeWidth={3} />}
                    </button>
                    <span className={`mkt-task-title ${task.completed ? "completed" : ""}`}>
                      {task.title}
                    </span>
                  </div>

                  <div className="mkt-task-right">
                    <span
                      className={
                        task.due === "Today" ? "mkt-badge-today" : "mkt-badge-tomorrow"
                      }
                    >
                      {task.due}
                    </span>
                    <button type="button" className="mkt-dots-btn" title="Options">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Quick Actions 2x2 Grid */}
          <div className="mkt-card">
            <div className="mkt-card-header">
              <div className="mkt-card-header-left">
                <div className="mkt-card-icon-box">
                  <Zap size={18} />
                </div>
                <div>
                  <h2 className="mkt-card-title">Quick Actions</h2>
                </div>
              </div>
            </div>

            <div className="mkt-actions-grid">
              {/* Action 1: Create Campaign */}
              <div
                className="mkt-action-card mkt-action-campaign"
                onClick={() => setIsModalOpen(true)}
              >
                <div className="mkt-action-left">
                  <div className="mkt-action-icon">
                    <Megaphone size={20} />
                  </div>
                  <div>
                    <div className="mkt-action-name">Create Campaign</div>
                    <div className="mkt-action-desc">Launch a new campaign</div>
                  </div>
                </div>
                <ChevronRight size={18} color="#c2410c" className="mkt-action-arrow" />
              </div>

              {/* Action 2: Manage Content */}
              <Link to="/content" className="mkt-action-card mkt-action-content">
                <div className="mkt-action-left">
                  <div className="mkt-action-icon">
                    <FileText size={20} />
                  </div>
                  <div>
                    <div className="mkt-action-name">Manage Content</div>
                    <div className="mkt-action-desc">Social posts, blogs, ads</div>
                  </div>
                </div>
                <ChevronRight size={18} color="#0284c7" className="mkt-action-arrow" />
              </Link>

              {/* Action 3: Landing Pages */}
              <Link to="/landing-pages" className="mkt-action-card mkt-action-landing">
                <div className="mkt-action-left">
                  <div className="mkt-action-icon">
                    <Link2 size={20} />
                  </div>
                  <div>
                    <div className="mkt-action-name">Landing Pages</div>
                    <div className="mkt-action-desc">View and manage pages</div>
                  </div>
                </div>
                <ChevronRight size={18} color="#16a34a" className="mkt-action-arrow" />
              </Link>

              {/* Action 4: View Reports */}
              <Link to="/reports" className="mkt-action-card mkt-action-reports">
                <div className="mkt-action-left">
                  <div className="mkt-action-icon">
                    <BarChart3 size={20} />
                  </div>
                  <div>
                    <div className="mkt-action-name">View Reports</div>
                    <div className="mkt-action-desc">Analyze performance</div>
                  </div>
                </div>
                <ChevronRight size={18} color="#9333ea" className="mkt-action-arrow" />
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* Launch Campaign Modal */}
      {isModalOpen && (
        <div className="mkt-modal-backdrop">
          <div className="mkt-modal-card">
            <div className="mkt-modal-header">
              <h3 className="mkt-modal-title">Launch New Campaign</h3>
              <button
                className="mkt-modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleLaunchCampaign}>
              <div className="mkt-form-group">
                <label className="mkt-form-label">Campaign Name</label>
                <input
                  type="text"
                  className="mkt-form-input"
                  placeholder="e.g. Q4 Cloud Infrastructure Push"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="mkt-modal-form-grid">
                <div className="mkt-form-group">
                  <label className="mkt-form-label">Channel Platform</label>
                  <select
                    className="mkt-form-select"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="Google Search">Google Search</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Facebook">Facebook</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="mkt-form-group">
                  <label className="mkt-form-label">Budget (₹)</label>
                  <input
                    type="number"
                    className="mkt-form-input"
                    placeholder="15000"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="mkt-modal-form-grid">
                <div className="mkt-form-group">
                  <label className="mkt-form-label">Start Date</label>
                  <input
                    type="date"
                    className="mkt-form-input"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>

                <div className="mkt-form-group">
                  <label className="mkt-form-label">End Date</label>
                  <input
                    type="date"
                    className="mkt-form-input"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="mkt-form-group">
                <label className="mkt-form-label">Strategic Objective</label>
                <input
                  type="text"
                  className="mkt-form-input"
                  placeholder="e.g. Inbound Enterprise Lead Acquisition"
                  value={formData.objective}
                  onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                />
              </div>

              <div className="mkt-modal-footer">
                <button
                  type="button"
                  className="mkt-btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="mkt-btn-primary"
                  disabled={submitting}
                >
                  {submitting ? "Launching..." : "Launch Campaign"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
