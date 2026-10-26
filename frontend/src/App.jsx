import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { PwaProvider } from "./context/PwaContext";
import PwaBanner from "./components/PwaBanner";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import MarketingDashboard from "./pages/dashboards/MarketingDashboard";
import SalesDashboard from "./pages/dashboards/SalesDashboard";
import Campaigns from "./pages/Campaigns";
import Leads from "./pages/Leads";
import FollowUps from "./pages/FollowUps";
import Users from "./pages/Users";
import LeadSources from "./pages/LeadSources";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Content from "./pages/Content";
import LandingPages from "./pages/LandingPages";
import Analytics from "./pages/Analytics";

function RootRedirect() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <p style={{ color: "#64748b", fontWeight: 500 }}>Loading Leadora...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case "ADMIN":
      return <Navigate to="/admin/dashboard" replace />;
    case "DIGITAL_MARKETING_EXECUTIVE":
      return <Navigate to="/marketing/dashboard" replace />;
    case "SALES_EXECUTIVE":
      return <Navigate to="/sales/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}

function PublicLoginRoute() {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (isAuthenticated && user) {
    switch (user.role) {
      case "ADMIN":
        return <Navigate to="/admin/dashboard" replace />;
      case "DIGITAL_MARKETING_EXECUTIVE":
        return <Navigate to="/marketing/dashboard" replace />;
      case "SALES_EXECUTIVE":
        return <Navigate to="/sales/dashboard" replace />;
      default:
        break;
    }
  }

  return <Login />;
}

export default function App() {
  return (
    <PwaProvider>
      <AuthProvider>
        <BrowserRouter>
          <PwaBanner />
          <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<PublicLoginRoute />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Role-Specific Dashboard Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/marketing/dashboard"
            element={
              <ProtectedRoute allowedRoles={["DIGITAL_MARKETING_EXECUTIVE", "ADMIN"]}>
                <MarketingDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/sales/dashboard"
            element={
              <ProtectedRoute allowedRoles={["SALES_EXECUTIVE", "ADMIN"]}>
                <SalesDashboard />
              </ProtectedRoute>
            }
          />

          {/* Core Feature Routes */}
          <Route
            path="/campaigns"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "DIGITAL_MARKETING_EXECUTIVE"]}>
                <Campaigns />
              </ProtectedRoute>
            }
          />

          <Route
            path="/leads"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "DIGITAL_MARKETING_EXECUTIVE", "SALES_EXECUTIVE"]}>
                <Leads />
              </ProtectedRoute>
            }
          />

          <Route
            path="/follow-ups"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "SALES_EXECUTIVE"]}>
                <FollowUps />
              </ProtectedRoute>
            }
          />

          <Route
            path="/opportunities"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "SALES_EXECUTIVE"]}>
                <Leads
                  title="Opportunities Pipeline"
                  customSubtitle="Active high-intent qualified deals and proposal negotiations in your pipeline"
                  defaultStatusFilter="Qualified"
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/proposals"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "SALES_EXECUTIVE"]}>
                <Leads
                  title="Sales Proposals"
                  customSubtitle="Track, review, and follow up on issued commercial proposals"
                  defaultStatusFilter="Proposal"
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/clients"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "SALES_EXECUTIVE"]}>
                <Leads
                  title="Converted Clients & Accounts"
                  customSubtitle="Customer accounts, successful deal closings, and relationship management"
                  defaultStatusFilter="Converted"
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <Users />
              </ProtectedRoute>
            }
          />

          <Route
            path="/lead-sources"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "DIGITAL_MARKETING_EXECUTIVE"]}>
                <LeadSources />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "DIGITAL_MARKETING_EXECUTIVE", "SALES_EXECUTIVE"]}>
                <Reports />
              </ProtectedRoute>
            }
          />

          <Route
            path="/content"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "DIGITAL_MARKETING_EXECUTIVE"]}>
                <Content />
              </ProtectedRoute>
            }
          />

          <Route
            path="/landing-pages"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "DIGITAL_MARKETING_EXECUTIVE"]}>
                <LandingPages />
              </ProtectedRoute>
            }
          />

          <Route
            path="/analytics"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "DIGITAL_MARKETING_EXECUTIVE"]}>
                <Analytics />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* Root & Fallback */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </PwaProvider>
  );
}
