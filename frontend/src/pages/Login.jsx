import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import leadoraLogo from "../assets/leadora-logo.png";
import "./Login.css";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Work email is required")
    .email("Please enter a valid work email"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().default(true),
});

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  });

  const onSubmit = async (data) => {
    setAuthError("");
    try {
      const result = await login(data.email, data.password, data.rememberMe);
      const user = result.user;

      // Role-specific redirect
      if (user.role === "ADMIN") {
        navigate("/admin/dashboard", { replace: true });
      } else if (user.role === "DIGITAL_MARKETING_EXECUTIVE") {
        navigate("/marketing/dashboard", { replace: true });
      } else if (user.role === "SALES_EXECUTIVE") {
        navigate("/sales/dashboard", { replace: true });
      } else {
        navigate("/login", { replace: true });
      }
    } catch (err) {
      setAuthError(err.message || "Invalid work email or password. Please try again.");
    }
  };

  return (
    <div className="login-page">
      {/* Left Hero Panel: Top-Left Brand Logo + Real HTML/CSS Headline & Subtitle */}
      <div className="login-left-panel">
        <div className="login-hero-brand">
          <img src={leadoraLogo} alt="Leadora" className="login-hero-logo" />
        </div>

        <div className="login-hero-text">
          <h1 className="hero-headline">
            Simpler Work.<br />
            <span className="hero-headline-accent">Better Results.</span>
          </h1>
          <p className="hero-subtext">
            A smarter way to manage, collaborate<br />
            and get work done.
          </p>
        </div>
      </div>

      {/* Right Login Panel */}
      <div className="login-right-panel">
        <div className="login-card">
          {/* Centered Leadora Logo */}
          <div className="card-brand-header">
            <img
              src={leadoraLogo}
              alt="Leadora"
              className="card-brand-logo"
            />
          </div>

          {/* Welcome Heading & Subtitle */}
          <div className="card-titles">
            <h2 className="card-title">Welcome Back</h2>
            <p className="card-subtitle">Sign in to continue</p>
          </div>

          {/* Error Notification */}
          {authError && (
            <div className="login-alert-error" role="alert">
              <AlertCircle size={16} className="alert-icon" />
              <span>{authError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="login-form">
            {/* Email Field */}
            <div className="form-field-group">
              <div className={`input-box ${errors.email ? "input-box-error" : ""}`}>
                <Mail className="input-field-icon" />
                <input
                  id="email-input"
                  type="email"
                  placeholder="Email"
                  autoComplete="email"
                  className="field-text-input"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="field-validation-msg">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="form-field-group">
              <div className={`input-box ${errors.password ? "input-box-error" : ""}`}>
                <Lock className="input-field-icon" />
                <input
                  id="password-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  autoComplete="current-password"
                  className="field-text-input"
                  {...register("password")}
                />
                <button
                  type="button"
                  className="toggle-visibility-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="field-validation-msg">{errors.password.message}</p>
              )}
            </div>

            {/* Options: Remember me & Forgot password */}
            <div className="form-options-row">
              <label className="remember-me-container" htmlFor="remember-me">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="remember-me-checkbox"
                  {...register("rememberMe")}
                />
                <span className="remember-me-label">Remember me</span>
              </label>

              <Link to="/forgot-password" className="forgot-password-anchor">
                Forgot password?
              </Link>
            </div>

            {/* Sign in Button */}
            <button
              type="submit"
              className="signin-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="btn-spinner-icon" size={18} />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight size={18} strokeWidth={2.4} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
