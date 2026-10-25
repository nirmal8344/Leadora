import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import apiClient from "../api/client";
import { useAuth } from "../context/AuthContext";
import {
  CalendarCheck2,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Check,
  X,
  Phone,
  Mail,
  Video,
  Users,
} from "lucide-react";

export default function FollowUps() {
  const { user } = useAuth();
  const [followUps, setFollowUps] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, PENDING, COMPLETED

  // Schedule Follow-up Modal State
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [newFollowUp, setNewFollowUp] = useState({
    leadId: "",
    followUpType: "Meeting",
    scheduledDateTime: "",
    notes: "",
  });

  // Complete Follow-up Modal State
  const [completingItem, setCompletingItem] = useState(null);
  const [outcome, setOutcome] = useState("Interested");
  const [completionNotes, setCompletionNotes] = useState("");
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint =
        user?.role === "SALES_EXECUTIVE"
          ? "/api/v1/follow-ups/my"
          : "/api/v1/follow-ups/my";

      const [fuRes, leadsRes] = await Promise.all([
        apiClient.get(endpoint).catch(() => ({ data: [] })),
        apiClient.get(user?.role === "SALES_EXECUTIVE" ? "/api/v1/leads/my" : "/api/v1/leads"),
      ]);

      setFollowUps(fuRes?.data || []);
      setLeads(leadsRes?.data || []);
    } catch (err) {
      setError("Failed to fetch follow-ups.");
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!newFollowUp.leadId || !newFollowUp.scheduledDateTime) return;

    setScheduling(true);
    try {
      // Format datetime to ISO
      const isoDate = new Date(newFollowUp.scheduledDateTime).toISOString();
      await apiClient.post("/api/v1/follow-ups", {
        ...newFollowUp,
        leadId: Number(newFollowUp.leadId),
        scheduledDateTime: isoDate,
      });

      setIsScheduleOpen(false);
      setNewFollowUp({
        leadId: "",
        followUpType: "Meeting",
        scheduledDateTime: "",
        notes: "",
      });
      fetchData();
    } catch (err) {
      alert("Failed to schedule follow-up: " + (err.message || "Unknown error"));
    } finally {
      setScheduling(false);
    }
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    if (!completingItem) return;

    setCompleting(true);
    try {
      await apiClient.patch(`/api/v1/follow-ups/${completingItem.id}/complete`, {
        outcome,
        notes: completionNotes,
      });
      setCompletingItem(null);
      setCompletionNotes("");
      fetchData();
    } catch (err) {
      alert("Failed to complete follow-up.");
    } finally {
      setCompleting(false);
    }
  };

  const filteredFollowUps = followUps.filter((item) => {
    if (statusFilter === "PENDING") return !item.completed;
    if (statusFilter === "COMPLETED") return item.completed;
    return true;
  });

  const getChannelIcon = (type) => {
    switch (type) {
      case "Phone":
        return <Phone size={14} />;
      case "Email":
        return <Mail size={14} />;
      case "Meeting":
      case "Demo":
      case "Online Meeting":
        return <Video size={14} />;
      default:
        return <Users size={14} />;
    }
  };

  return (
    <Layout
      pageTitle="Sales Touchpoint Schedule"
      pageSubtitle="Coordinate calls, discovery meetings, product demos, and follow-up cadence"
    >
      {error && (
        <div style={{ padding: "14px 18px", borderRadius: "8px", background: "#fee2e2", color: "#991b1b", marginBottom: "20px" }}>
          {error}
        </div>
      )}

      {/* Filter / Action Bar */}
      <div className="filter-bar">
        <div className="filter-group">
          <select
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Touchpoints</option>
            <option value="PENDING">Pending Action</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <button className="btn btn-primary" onClick={() => setIsScheduleOpen(true)}>
          <Plus size={16} />
          <span>Schedule Follow-up</span>
        </button>
      </div>

      {/* Follow-ups Table */}
      <div className="panel-card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Lead & Account</th>
                <th>Channel Type</th>
                <th>Scheduled Date & Time</th>
                <th>Touchpoint Objectives</th>
                <th>Status / Outcome</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFollowUps.length > 0 ? (
                filteredFollowUps.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--slate-900)", fontSize: "0.95rem" }}>
                        {item.leadName || "Lead Contact"}
                      </div>
                      <div style={{ fontSize: "0.85rem", color: "var(--slate-500)" }}>
                        {item.companyName || "Organization"}
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "0.92rem",
                          fontWeight: 500,
                          color: "var(--slate-700)",
                        }}
                      >
                        {getChannelIcon(item.followUpType)}
                        {item.followUpType}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: "0.92rem", fontWeight: 500, color: "var(--slate-800)" }}>
                        {item.scheduledDateTime ? new Date(item.scheduledDateTime).toLocaleString() : "—"}
                      </div>
                    </td>
                    <td style={{ maxWidth: "260px", fontSize: "0.90rem", color: "var(--slate-600)" }}>
                      {item.notes || "Standard check-in"}
                    </td>
                    <td>
                      {item.completed ? (
                        <div>
                          <span className="badge badge-converted">Completed</span>
                          {item.outcome && (
                            <div style={{ fontSize: "0.82rem", color: "var(--slate-500)", marginTop: "3px" }}>
                              Outcome: <strong>{item.outcome}</strong>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="badge badge-contacted">Pending</span>
                      )}
                    </td>
                    <td>
                      {!item.completed && (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => setCompletingItem(item)}
                        >
                          <Check size={14} />
                          <span>Complete</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "var(--slate-400)" }}>
                    No follow-ups found for this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Follow-up Modal */}
      {isScheduleOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Schedule Next Sales Touchpoint</h3>
              <button
                onClick={() => setIsScheduleOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--slate-400)" }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleScheduleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Select Prospect / Account *</label>
                  <select
                    className="form-control"
                    value={newFollowUp.leadId}
                    onChange={(e) => setNewFollowUp({ ...newFollowUp, leadId: e.target.value })}
                    required
                  >
                    <option value="">Choose a lead...</option>
                    {leads.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name} &bull; {l.company} ({l.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Touchpoint Medium *</label>
                    <select
                      className="form-control"
                      value={newFollowUp.followUpType}
                      onChange={(e) => setNewFollowUp({ ...newFollowUp, followUpType: e.target.value })}
                      required
                    >
                      <option value="Phone">Phone Call</option>
                      <option value="Meeting">In-Person Meeting</option>
                      <option value="Online Meeting">Online Video Call (Zoom/Meet)</option>
                      <option value="Demo">Product Demonstration</option>
                      <option value="Email">Email Outreach</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Scheduled Date & Time *</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={newFollowUp.scheduledDateTime}
                      onChange={(e) => setNewFollowUp({ ...newFollowUp, scheduledDateTime: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group col-span-2">
                    <label className="form-label">Meeting Agenda / Talking Points</label>
                    <textarea
                      className="form-control"
                      placeholder="Outline topics to cover, questions to answer, or materials to prepare..."
                      value={newFollowUp.notes}
                      onChange={(e) => setNewFollowUp({ ...newFollowUp, notes: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsScheduleOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={scheduling || !newFollowUp.leadId}
                >
                  {scheduling ? "Scheduling..." : "Schedule Touchpoint"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Follow-up Modal */}
      {completingItem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Log Touchpoint Outcome</h3>
              <button
                onClick={() => setCompletingItem(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--slate-400)" }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCompleteSubmit}>
              <div className="modal-body">
                <p style={{ fontSize: "0.88rem", color: "var(--slate-600)", marginBottom: "16px" }}>
                  Recording notes for meeting with <strong>{completingItem.leadName}</strong> ({completingItem.companyName}).
                </p>

                <div className="form-group">
                  <label className="form-label">Call / Meeting Outcome *</label>
                  <select
                    className="form-control"
                    value={outcome}
                    onChange={(e) => setOutcome(e.target.value)}
                    required
                  >
                    <option value="Interested">Interested (Progress deal)</option>
                    <option value="Follow-up Required">Follow-up Required</option>
                    <option value="Not Interested">Not Interested</option>
                    <option value="No Response">No Response</option>
                    <option value="Converted">Converted (Deal Won)</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Summary & Key Objections / Takeaways</label>
                  <textarea
                    className="form-control"
                    placeholder="Document discussion highlights..."
                    value={completionNotes}
                    onChange={(e) => setCompletionNotes(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setCompletingItem(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={completing}
                >
                  {completing ? "Saving..." : "Record & Complete"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
