import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import apiClient from "../api/client";
import {
  BarChart3,
  TrendingUp,
  Target,
  MousePointerClick,
  DollarSign,
  PieChart,
  Eye,
  Percent,
  RefreshCw,
  AlertCircle,
  Award,
} from "lucide-react";

export default function Analytics() {
  const [campaigns, setCampaigns] = useState([]);
  const [leadSources, setLeadSources] = useState([]);
  const [roiReport, setRoiReport] = useState(null);
  const [marketingStats, setMarketingStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [campRes, sourcesRes, roiRes, statsRes] = await Promise.all([
        apiClient.get("/api/v1/campaigns").catch(() => ({ data: [] })),
        apiClient.get("/api/v1/lead-sources").catch(() => ({ data: [] })),
        apiClient.get("/api/v1/reports/roi-summary").catch(() => ({ data: null })),
        apiClient.get("/api/v1/dashboard/marketing-stats").catch(() => ({ data: null })),
      ]);

      setCampaigns(campRes?.data || []);
      setLeadSources(sourcesRes?.data || []);
      setRoiReport(roiRes?.data || null);
      setMarketingStats(statsRes?.data || null);
    } catch (err) {
      setError("Failed to load live analytics data from backend.");
    } finally {
      setLoading(false);
    }
  };

  // Derive aggregate KPIs from real database entities
  const totalSpend = campaigns.reduce((acc, c) => acc + (c.totalSpent != null ? Number(c.totalSpent) : 0), 0);
  const totalBudget = campaigns.reduce((acc, c) => acc + (c.budget != null ? Number(c.budget) : 0), 0);
  const totalImpressions = campaigns.reduce((acc, c) => acc + (c.impressions != null ? Number(c.impressions) : 0), 0);
  const totalClicks = campaigns.reduce((acc, c) => acc + (c.clicks != null ? Number(c.clicks) : 0), 0);
  const totalLeads = campaigns.reduce((acc, c) => acc + (c.leadsCount != null ? Number(c.leadsCount) : 0), 0);
  const totalConversions = campaigns.reduce((acc, c) => acc + (c.conversionsCount != null ? Number(c.conversionsCount) : 0), 0);
  const totalRevenue = campaigns.reduce((acc, c) => acc + (c.revenueGenerated != null ? Number(c.revenueGenerated) : 0), 0);

  // Safe zero-division calculations
  const overallCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0.00";
  const overallCpl = totalLeads > 0 ? (totalSpend / totalLeads).toFixed(2) : "0.00";
  const overallCostPerConv = totalConversions > 0 ? (totalSpend / totalConversions).toFixed(2) : "0.00";
  const overallConvRate = totalLeads > 0 ? ((totalConversions / totalLeads) * 100).toFixed(2) : "0.00";
  const overallRoi = totalSpend > 0 ? (((totalRevenue - totalSpend) / totalSpend) * 100).toFixed(2) : "0.00";

  // Group campaigns by channel / type for channel performance breakdown
  const channelBreakdown = campaigns.reduce((acc, c) => {
    const channel = c.type || "Other";
    if (!acc[channel]) {
      acc[channel] = {
        channel,
        campaignsCount: 0,
        impressions: 0,
        clicks: 0,
        spend: 0,
        leads: 0,
        conversions: 0,
      };
    }
    acc[channel].campaignsCount += 1;
    acc[channel].impressions += c.impressions || 0;
    acc[channel].clicks += c.clicks || 0;
    acc[channel].spend += c.totalSpent || 0;
    acc[channel].leads += c.leadsCount || 0;
    acc[channel].conversions += c.conversionsCount || 0;
    return acc;
  }, {});

  const channelRows = Object.values(channelBreakdown);

  return (
    <Layout
      pageTitle="Campaign & Attribution Analytics"
      pageSubtitle="Comprehensive multi-touch attribution, visitor trends, and cost efficiency with zero-division protection"
      headerAction={
        <button className="btn btn-secondary" onClick={loadAnalyticsData} disabled={loading}>
          <RefreshCw size={15} className={loading ? "spin" : ""} />
          <span>Refresh Analytics</span>
        </button>
      }
    >
      {error && (
        <div className="alert-danger" style={{ marginBottom: "20px" }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Primary KPI Metrics Grid */}
      <div className="stats-grid" style={{ marginBottom: "24px" }}>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Total Spend Allocation</span>
            <div className="stat-card-icon">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="stat-card-value">₹{totalSpend.toLocaleString()}</div>
          <div className="stat-card-footer">
            <span>Budget: ₹{totalBudget.toLocaleString()}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Average Click-Through (CTR)</span>
            <div className="stat-card-icon">
              <Percent size={20} />
            </div>
          </div>
          <div className="stat-card-value">{overallCtr}%</div>
          <div className="stat-card-footer">
            <span>{totalClicks.toLocaleString()} clicks / {totalImpressions.toLocaleString()} views</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Cost Per Lead (CPL)</span>
            <div className="stat-card-icon">
              <Target size={20} />
            </div>
          </div>
          <div className="stat-card-value">₹{Number(overallCpl).toLocaleString()}</div>
          <div className="stat-card-footer">
            <span>{totalLeads} total campaign leads generated</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Return on Investment (ROI)</span>
            <div className="stat-card-icon">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="stat-card-value">{overallRoi}%</div>
          <div className="stat-card-footer">
            <span>Revenue: ₹{totalRevenue.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Secondary Efficiency Metrics */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
          marginBottom: "24px",
        }}
      >
        <div className="panel-card">
          <div className="panel-header">
            <div className="panel-title">
              <MousePointerClick size={18} />
              <span>Acquisition Efficiency</span>
            </div>
          </div>
          <div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "var(--text-muted)" }}>Total Impressions</span>
              <strong style={{ fontSize: "1.1rem" }}>{totalImpressions.toLocaleString()}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "var(--text-muted)" }}>Total Clicks</span>
              <strong style={{ fontSize: "1.1rem" }}>{totalClicks.toLocaleString()}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "var(--text-muted)" }}>Cost per Conversion (CAC)</span>
              <strong style={{ fontSize: "1.1rem", color: "var(--bronze-600)" }}>
                ₹{Number(overallCostPerConv).toLocaleString()}
              </strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "var(--text-muted)" }}>Lead-to-Deal Conversion Rate</span>
              <strong style={{ fontSize: "1.1rem", color: "#16a34a" }}>{overallConvRate}%</strong>
            </div>
          </div>
        </div>

        {/* Lead Source Distribution from Live Lead Sources */}
        <div className="panel-card">
          <div className="panel-header">
            <div className="panel-title">
              <PieChart size={18} />
              <span>Lead Source Performance</span>
            </div>
          </div>
          <div className="panel-body">
            {leadSources.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>No lead sources tracked yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {leadSources.slice(0, 5).map((s) => (
                  <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{s.name}</div>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        {s.leadVolume || 0} leads generated
                      </span>
                    </div>
                    <span className="badge badge-active">
                      {s.conversionRate != null ? `${s.conversionRate}% Conv.` : "0.0% Conv."}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Channel Performance Comparison Table */}
      <div className="panel-card" style={{ marginBottom: "24px" }}>
        <div className="panel-header">
          <div className="panel-title">
            <BarChart3 size={18} />
            <span>Channel Performance Comparison (Live Database Aggregation)</span>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Marketing Channel</th>
                <th>Campaigns</th>
                <th>Impressions</th>
                <th>Clicks</th>
                <th>Average CTR</th>
                <th>Spend Allocation</th>
                <th>Leads Generated</th>
                <th>Cost Per Lead</th>
              </tr>
            </thead>
            <tbody>
              {channelRows.length > 0 ? (
                channelRows.map((c, i) => {
                  const ctr = c.impressions > 0 ? ((c.clicks / c.impressions) * 100).toFixed(2) : "0.00";
                  const cpl = c.leads > 0 ? (c.spend / c.leads).toFixed(2) : "0.00";
                  return (
                    <tr key={i}>
                      <td>
                        <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{c.channel}</div>
                      </td>
                      <td>
                        <span className="badge badge-planned">{c.campaignsCount} Active</span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{c.impressions.toLocaleString()}</span>
                      </td>
                      <td>
                        <span>{c.clicks.toLocaleString()}</span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: "var(--bronze-600)" }}>{ctr}%</span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>₹{c.spend.toLocaleString()}</span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{c.leads}</span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: "var(--bronze-700)" }}>
                          ₹{Number(cpl).toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <BarChart3 size={36} />
                      <h4>No channel data recorded yet</h4>
                      <p>Create campaigns and record lead acquisitions to populate live analytics.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Campaign Detailed Attribution Table */}
      <div className="panel-card">
        <div className="panel-header">
          <div className="panel-title">
            <Award size={18} />
            <span>Individual Campaign ROI Breakdown</span>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Type</th>
                <th>Budget</th>
                <th>Total Spent</th>
                <th>Leads</th>
                <th>Conversions</th>
                <th>CPL</th>
                <th>Cost / Conv.</th>
                <th>ROI</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.length > 0 ? (
                campaigns.map((camp) => (
                  <tr key={camp.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{camp.name}</div>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{camp.objective || "Awareness"}</span>
                    </td>
                    <td>
                      <span className="badge badge-planned">{camp.type || "Marketing"}</span>
                    </td>
                    <td>₹{Number(camp.budget || 0).toLocaleString()}</td>
                    <td style={{ fontWeight: 600 }}>₹{Number(camp.totalSpent || 0).toLocaleString()}</td>
                    <td>{camp.leadsCount || 0}</td>
                    <td>{camp.conversionsCount || 0}</td>
                    <td>₹{Number(camp.cpl || 0).toLocaleString()}</td>
                    <td>₹{Number(camp.costPerConversion || 0).toLocaleString()}</td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          background: Number(camp.roi || 0) >= 0 ? "#ecfdf5" : "#fef2f2",
                          color: Number(camp.roi || 0) >= 0 ? "#047857" : "#b91c1c",
                          fontWeight: 700,
                        }}
                      >
                        {camp.roi || 0}%
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9}>
                    <div className="empty-state">
                      <Target size={36} />
                      <h4>No campaigns created yet</h4>
                      <p>Create your first campaign from the Campaigns page to see granular ROI tracking.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
