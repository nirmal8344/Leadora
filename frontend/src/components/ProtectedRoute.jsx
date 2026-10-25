import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <p style={{ color: "#64748b", fontSize: "16px" }}>Authenticating session...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their authorized role dashboard
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

  return children;
}
