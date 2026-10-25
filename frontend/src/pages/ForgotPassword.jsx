import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Mail, AlertCircle, CheckCircle, Loader2, Layers } from "lucide-react";
import apiClient from "../api/client";
import "./Login.css";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Work email is required")
    .email("Please enter a valid work email"),
});

export default function ForgotPassword() {
  const [serverMessage, setServerMessage] = useState("");
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data) => {
    setServerError("");
    setServerMessage("");
    try {
      const res = await apiClient.post("/api/v1/auth/forgot-password", { email: data.email });
      setServerMessage(res?.message || "Password reset instructions have been dispatched.");
    } catch (err) {
      setServerError(err.message || "Failed to process request. Please try again.");
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

        <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#0f172a", marginBottom: "8px" }}>Reset your password</h2>
        <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "28px" }}>
          Enter your registered work email address and we will provide password recovery instructions.
        </p>

        {serverMessage && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#059669", padding: "12px 16px", borderRadius: "8px", fontSize: "14px", marginBottom: "20px" }}>
            <CheckCircle size={18} />
            <span>{serverMessage}</span>
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
            <label className="form-label" htmlFor="forgot-email">Work Email</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                id="forgot-email"
                type="email"
                placeholder="name@company.com"
                className={`form-input ${errors.email ? "has-error" : ""}`}
                {...register("email")}
              />
            </div>
            {errors.email && <p className="field-error-text">{errors.email.message}</p>}
          </div>

          <button type="submit" className="btn-submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="spinner" size={18} />
                <span>Sending...</span>
              </>
            ) : (
              <span>Send Instructions</span>
            )}
          </button>
        </form>

        <div style={{ marginTop: "24px", textAlign: "center" }}>
          <Link to="/login" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "14px", color: "#4f46e5", fontWeight: "500" }}>
            <ArrowLeft size={16} />
            <span>Back to sign in</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
