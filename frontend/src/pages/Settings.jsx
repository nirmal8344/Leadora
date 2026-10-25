import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import apiClient from "../api/client";
import {
  Settings as SettingsIcon,
  Shield,
  Database,
  Building,
  Sliders,
  CheckCircle2,
  Lock,
  Globe,
  Bell,
  Save,
  Clock,
  History,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export default function Settings() {
  const [savedMsg, setSavedMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const [config, setConfig] = useState({
    orgName: "Leadora Enterprise",
    timezone: "Asia/Kolkata (IST +5:30)",
    currency: "INR (₹)",
    riskThresholdDays: 7,
    autoAssign: true,
    routingMode: "Round-Robin Rep Allocation",
    sessionTimeoutHours: 24,
    requireStrongPassword: true,
  });

  useEffect(() => {
    fetchSettingsAndLogs();
  }, []);

  const fetchSettingsAndLogs = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [settingsRes, logsRes] = await Promise.all([
        apiClient.get("/api/v1/settings").catch(() => ({ data: null })),
        apiClient.get("/api/v1/settings/audit-logs").catch(() => ({ data: [] })),
      ]);

      if (settingsRes?.data) {
        setConfig((prev) => ({
          ...prev,
          ...settingsRes.data,
        }));
      }
      setAuditLogs(logsRes?.data || []);
    } catch (err) {
      setErrorMsg("Failed to load settings or audit logs.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    try {
      const res = await apiClient.put("/api/v1/settings", config);
      if (res?.data) {
        setConfig(res.data);
      }
      setSavedMsg("System configuration successfully saved and audited.");
      setTimeout(() => setSavedMsg(null), 3500);
      // Refresh audit logs
      const updatedLogs = await apiClient.get("/api/v1/settings/audit-logs");
      setAuditLogs(updatedLogs?.data || []);
    } catch (err) {
      setErrorMsg("Failed to save settings to server.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout
      pageTitle="System Settings & Governance"
      pageSubtitle="Manage organization preferences, security policies, and inspect real-time audit logs"
      headerAction={
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          <Save size={16} />
          <span>{saving ? "Saving..." : "Save Changes"}</span>
        </button>
      }
    >
      {savedMsg && <div className="alert-success" style={{ marginBottom: "20px" }}>{savedMsg}</div>}
      {errorMsg && (
        <div className="alert-danger" style={{ marginBottom: "20px" }}>
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "20px", marginBottom: "24px" }}>
        {/* Organization Preferences */}
        <div className="panel-card">
          <div className="panel-header">
            <div className="panel-title">
              <Building size={18} />
              <span>Organization & Localization</span>
            </div>
          </div>
          <div className="panel-body">
            <div className="form-group">
              <label className="form-label">Organization Workspace Name</label>
              <input
                type="text"
                className="form-control"
                value={config.orgName || ""}
                onChange={(e) => setConfig({ ...config, orgName: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Default Currency</label>
                <select
                  className="form-control"
                  value={config.currency || "INR (₹)"}
                  onChange={(e) => setConfig({ ...config, currency: e.target.value })}
                >
                  <option value="INR (₹)">Indian Rupee (₹ INR)</option>
                  <option value="USD ($)">US Dollar ($ USD)</option>
                  <option value="EUR (€)">Euro (€ EUR)</option>
                  <option value="GBP (£)">British Pound (£ GBP)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">System Timezone</label>
                <select
                  className="form-control"
                  value={config.timezone || "Asia/Kolkata (IST +5:30)"}
                  onChange={(e) => setConfig({ ...config, timezone: e.target.value })}
                >
                  <option value="Asia/Kolkata (IST +5:30)">Asia/Kolkata (IST +5:30)</option>
                  <option value="UTC">UTC Universal Time</option>
                  <option value="America/New_York (EST)">America/New_York (EST)</option>
                  <option value="Europe/London (GMT)">Europe/London (GMT)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Lead Governance & Automation */}
        <div className="panel-card">
          <div className="panel-header">
            <div className="panel-title">
              <Sliders size={18} />
              <span>Pipeline Automation & SLAs</span>
            </div>
          </div>
          <div className="panel-body">
            <div className="form-group">
              <label className="form-label">Lead Routing Strategy</label>
              <select
                className="form-control"
                value={config.routingMode || "Round-Robin Rep Allocation"}
                onChange={(e) => setConfig({ ...config, routingMode: e.target.value })}
              >
                <option value="Round-Robin Rep Allocation">Round-Robin Rep Allocation</option>
                <option value="Territory & Location Based">Territory & Location Based</option>
                <option value="Weighted Workload Capacity">Weighted Workload Capacity</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Leads at Risk Inactivity Cutoff (Days)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  className="form-control"
                  value={config.riskThresholdDays || 7}
                  onChange={(e) => setConfig({ ...config, riskThresholdDays: Number(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Auto-Assignment on Inbound</label>
                <select
                  className="form-control"
                  value={config.autoAssign ? "enabled" : "disabled"}
                  onChange={(e) => setConfig({ ...config, autoAssign: e.target.value === "enabled" })}
                >
                  <option value="enabled">Enabled (Auto-assign)</option>
                  <option value="disabled">Disabled (Manual queue)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Access Policies */}
        <div className="panel-card">
          <div className="panel-header">
            <div className="panel-title">
              <Shield size={18} />
              <span>Security & Session Policies</span>
            </div>
          </div>
          <div className="panel-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">JWT Session Validity (Hours)</label>
                <input
                  type="number"
                  min="1"
                  max="72"
                  className="form-control"
                  value={config.sessionTimeoutHours || 24}
                  onChange={(e) => setConfig({ ...config, sessionTimeoutHours: Number(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password Complexity Policy</label>
                <select
                  className="form-control"
                  value={config.requireStrongPassword ? "strict" : "standard"}
                  onChange={(e) => setConfig({ ...config, requireStrongPassword: e.target.value === "strict" })}
                >
                  <option value="strict">Strict (8+ chars, upper, number, symbol)</option>
                  <option value="standard">Standard (6+ characters)</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: "10px", fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
              Role-Based Access Control (RBAC) enforces strict privileges between <strong>ADMIN</strong>, <strong>DIGITAL_MARKETING_EXECUTIVE</strong>, and <strong>SALES_EXECUTIVE</strong>.
            </div>
          </div>
        </div>

        {/* Database & Infrastructure Health */}
        <div className="panel-card">
          <div className="panel-header">
            <div className="panel-title">
              <Database size={18} />
              <span>Infrastructure Health & Services</span>
            </div>
          </div>
          <div className="panel-body">
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.92rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "8px", borderBottom: "1px solid var(--border-subtle)" }}>
                <div>
                  <strong>Primary Database</strong>
                  <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>PostgreSQL 16 &bull; HikariCP Connection Pool</div>
                </div>
                <span className="badge badge-active">
                  <CheckCircle2 size={13} /> Operational
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "8px", borderBottom: "1px solid var(--border-subtle)" }}>
                <div>
                  <strong>Backend Application Server</strong>
                  <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Spring Boot 3.3.x &bull; Tomcat REST API</div>
                </div>
                <span className="badge badge-active">
                  <CheckCircle2 size={13} /> Active &amp; Ready
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong>Database Migration Schema</strong>
                  <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Flyway Versioned Migrations &bull; V4 (Revenue Tracking)</div>
                </div>
                <span className="badge badge-active">
                  <CheckCircle2 size={13} /> Schema V4 Synchronized
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real Audit History & Activity Logs Panel */}
      <div className="panel-card">
        <div className="panel-header">
          <div className="panel-title">
            <History size={18} />
            <span>Audit History & Governance Activity Log</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={fetchSettingsAndLogs}>
            <RefreshCw size={13} className={loading ? "spin" : ""} />
            <span>Refresh Logs</span>
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Entity Type</th>
                <th>Entity ID</th>
                <th>User / Initiator</th>
                <th>Activity Details</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.length > 0 ? (
                auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <span className="badge badge-active" style={{ fontSize: "0.76rem" }}>
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{log.entityType}</span>
                    </td>
                    <td>
                      <span style={{ fontFamily: "monospace", fontSize: "0.84rem", color: "var(--text-muted)" }}>
                        #{log.entityId || "N/A"}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 500, color: "var(--bronze-700)" }}>{log.userEmail || "System"}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.86rem", color: "var(--text-secondary)" }}>{log.details}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                        {log.createdAt ? new Date(log.createdAt).toLocaleString() : "Just now"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <History size={32} />
                      <h4>No audit logs recorded yet</h4>
                      <p>Actions like lead assignment, qualification, conversions, and setting updates will be logged here.</p>
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
