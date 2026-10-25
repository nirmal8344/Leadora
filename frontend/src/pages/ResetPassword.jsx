import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle, Loader2, Layers } from "lucide-react";
import apiClient from "../api/client";
import "./Login.css";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "New password is required")
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [showPassword, setShowPassword] = useState(false);
  const [serverMessage, setServerMessage] = useState("");
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (data) => {
    if (!token) {
      setServerError("Reset token is missing from URL. Please use the complete link provided in your recovery instructions.");
      return;
    }

    setServerError("");
    setServerMessage("");

    try {
      const res = await apiClient.post("/api/v1/auth/reset-password", {
        token,
        newPassword: data.password,
      });
      setServerMessage(res?.message || "Password has been successfully updated.");
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setServerError(err.message || "Failed to reset password. The link may have expired.");
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f8fafc", padding: "20px" }}>
      <div style={{ width: "100%", maxWidth: "420px", background: "#ffffff", padding: "40px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
          <div style={{ width: "36px", height: "36px", background: "#4f46e5", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
            <Layers size={20} />
          </div>
          <span style={{ fontSize: "20px", fontWeight: "700", color: "#0f172a" }}>Leadora</span>
        </div>

        <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#0f172a", marginBottom: "8px" }}>Set new password</h2>
        <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "28px" }}>
          Choose a secure password of at least 6 characters.
        </p>

        {serverMessage && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#059669", padding: "12px 16px", borderRadius: "8px", fontSize: "14px", marginBottom: "20px" }}>
            <CheckCircle size={18} />
            <span>{serverMessage} Redirecting to login...</span>
          </div>
        )}

        {serverError && (
          <div className="alert-error" role="alert">
            <AlertCircle size={18} />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="new-password">New Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                id="new-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                className={`form-input ${errors.password ? "has-error" : ""}`}
                {...register("password")}
              />
              <button
                type="button"
                className="input-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="field-error-text">{errors.password.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirm-password">Confirm New Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                placeholder="Re-enter new password"
                className={`form-input ${errors.confirmPassword ? "has-error" : ""}`}
                {...register("confirmPassword")}
              />
            </div>
            {errors.confirmPassword && <p className="field-error-text">{errors.confirmPassword.message}</p>}
          </div>

          <button type="submit" className="btn-submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="spinner" size={18} />
                <span>Updating Password...</span>
              </>
            ) : (
              <span>Reset Password</span>
            )}
          </button>
        </form>

        <div style={{ marginTop: "24px", textAlign: "center" }}>
          <Link to="/login" style={{ fontSize: "14px", color: "#4f46e5", fontWeight: "500" }}>
            Return to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
