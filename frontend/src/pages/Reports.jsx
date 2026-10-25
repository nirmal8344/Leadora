import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import apiClient from "../api/client";
import {
  BarChart3,
  Download,
  Calendar,
  FileSpreadsheet,
  Search,
  Filter,
  CheckCircle2,
  Eye,
  X,
  AlertCircle,
  RefreshCw,
  Table,
} from "lucide-react";

const STANDARD_REPORTS = [
  {
    type: "campaign-performance",
    title: "Campaign Performance Report",
    category: "Marketing",
    description: "Detailed metrics for all campaigns including Impressions, Clicks, CTR, Budget, Total Spent, and ROI.",
  },
  {
    type: "lead-generation",
    title: "Lead Generation Report",
    category: "Funnel Analysis",
    description: "Chronological pipeline of all captured leads, source attribution, status, and assigned sales executive.",
  },
  {
    type: "source-attribution",
    title: "Lead Source Attribution Report",
    category: "Attribution",
    description: "Multi-channel lead source volume, active channels, deal conversion count, and conversion win rate.",
  },
  {
    type: "conversion-analysis",
    title: "Conversion Analysis Report",
    category: "Sales",
    description: "Won deals with customer company, closing sales executive, closed deal value (₹), and closing notes.",
  },
  {
    type: "expenditure-budget",
    title: "Campaign Expenditure vs. Budget Report",
    category: "Financial",
    description: "Compares approved marketing budgets against actual expenditures with budget variance and utilization rate.",
  },
  {
    type: "sales-performance",
    title: "Sales Executive Performance Report",
    category: "Sales",
    description: "Evaluates sales representatives on assigned leads, completed conversions, pending follow-ups, and win rates.",
  },
  {
    type: "roi-summary",
    title: "Return on Investment (ROI) Summary Report",
    category: "Financial",
    description: "Holistic marketing financial returns with spend vs revenue, net profit generated, and overall ROI percentage.",
  },
];

export default function Reports() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [downloadingType, setDownloadingType] = useState(null);
  const [previewReport, setPreviewReport] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(null);
  const [previewData, setPreviewData] = useState(null);

  const handleDownloadCsv = async (reportType, title) => {
    setDownloadingType(reportType);
    try {
      const response = await apiClient.get(`/api/v1/reports/${reportType}/csv`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${reportType}_report.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(`Failed to export CSV for ${title}. Check backend availability.`);
    } finally {
      setDownloadingType(null);
    }
  };

  const handlePreviewReport = async (report) => {
    setPreviewReport(report);
    setPreviewLoading(true);
    setPreviewError(null);
    try {
      const res = await apiClient.get(`/api/v1/reports/${report.type}`);
      setPreviewData(res.data);
    } catch (err) {
      setPreviewError("Failed to fetch report preview from server.");
    } finally {
      setPreviewLoading(false);
    }
  };

  const filteredReports = STANDARD_REPORTS.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase()) ||
      r.category.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === "ALL" || r.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <Layout
      pageTitle="Intelligence & Exportable Reports"
      pageSubtitle="Generate, inspect, and export live CSV reports across all 7 mandatory business dimensions"
    >
      {/* Filter / Search Bar */}
      <div className="filter-bar" style={{ marginBottom: "20px" }}>
        <div className="filter-group">
          <div className="search-input-wrapper">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search business reports..."
              className="form-control"
              style={{ width: "320px" }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="form-control"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            <option value="Marketing">Marketing</option>
            <option value="Funnel Analysis">Funnel Analysis</option>
            <option value="Attribution">Attribution</option>
            <option value="Sales">Sales</option>
            <option value="Financial">Financial</option>
          </select>
        </div>

        <div style={{ fontSize: "0.92rem", color: "var(--text-muted)", fontWeight: 500 }}>
          Available reports: <strong>{filteredReports.length}</strong>
        </div>
      </div>

      {/* Reports Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        {filteredReports.map((r) => (
          <div key={r.type} className="panel-card" style={{ display: "flex", flexDirection: "column" }}>
            <div className="panel-header" style={{ paddingBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    background: "var(--bronze-50)",
                    color: "var(--bronze-700)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FileSpreadsheet size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)" }}>{r.title}</div>
                  <span className="badge badge-planned" style={{ fontSize: "0.75rem", padding: "2px 8px", marginTop: "4px" }}>
                    {r.category}
                  </span>
                </div>
              </div>
            </div>

            <div className="panel-body" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "20px" }}>
                {r.description}
              </p>

              <div style={{ display: "flex", gap: "10px", marginTop: "auto", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => handlePreviewReport(r)}
                >
                  <Eye size={14} />
                  <span>Preview Data</span>
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => handleDownloadCsv(r.type, r.title)}
                  disabled={downloadingType === r.type}
                >
                  <Download size={14} />
                  <span>{downloadingType === r.type ? "Exporting..." : "Download CSV"}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Report Data Preview Modal */}
      {previewReport && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: "960px", width: "95%", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">{previewReport.title}</h3>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  {previewData?.count != null ? `${previewData.count} record(s) loaded from live database` : "Fetching records..."}
                </span>
              </div>
              <button className="btn-close" onClick={() => setPreviewReport(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
              {previewLoading && (
                <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                  <RefreshCw size={28} className="spin" style={{ margin: "0 auto 12px" }} />
                  <p>Querying database and generating report matrix...</p>
                </div>
              )}

              {previewError && (
                <div className="alert-danger" style={{ marginBottom: "16px" }}>
                  <AlertCircle size={16} />
                  <span>{previewError}</span>
                </div>
              )}

              {!previewLoading && previewData && (
                <div className="table-container" style={{ margin: 0, maxHeight: "55vh" }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        {previewData.headers?.map((h, i) => (
                          <th key={i}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.rows?.length > 0 ? (
                        previewData.rows.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {previewData.headers?.map((h, cellIndex) => {
                              const val = Array.isArray(row) ? row[cellIndex] : (row && typeof row === 'object' ? row[h] : null);
                              return (
                                <td key={cellIndex}>
                                  <span style={{ fontSize: "0.88rem", color: "var(--text-primary)" }}>
                                    {val != null ? String(val) : "—"}
                                  </span>
                                </td>
                              );
                            })}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={previewData.headers?.length || 1}>
                            <div className="empty-state">
                              <Table size={32} />
                              <h4>No records in this report yet</h4>
                              <p>Add active campaigns, leads, or expenses to generate live rows.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                Generated at: {previewData?.generatedAt ? new Date(previewData.generatedAt).toLocaleString() : "Just now"}
              </span>
              <div style={{ display: "flex", gap: "10px" }}>
                <button className="btn btn-secondary" onClick={() => setPreviewReport(null)}>
                  Close
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => handleDownloadCsv(previewReport.type, previewReport.title)}
                  disabled={downloadingType === previewReport.type}
                >
                  <Download size={14} />
                  <span>Export Official CSV</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
