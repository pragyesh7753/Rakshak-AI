"use client";

import { useAuth, useClerk, useSignIn } from "@clerk/clerk-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import {
  checkBackendHealth,
  createTokenGetter,
  verifyBackendSession,
} from "@/features/auth/services/backend-auth.service";
import "./auth.css";

const LoginForm = () => {
  const { isLoaded, signIn, setActive } = useSignIn();
  const { getToken } = useAuth();
  const { signOut } = useClerk();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [trustDevice, setTrustDevice] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!isLoaded) return;

    setError("");
    setLoading(true);

    try {
      const backendReady = await checkBackendHealth();
      if (!backendReady) {
        setError("Backend server is unavailable. Start backend and try again.");
        return;
      }

      const result = await signIn.create({ identifier: email, password });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        const getBackendToken = createTokenGetter(getToken);

        try {
          await verifyBackendSession(getBackendToken);
        } catch {
          await signOut();
          setError("Backend session verification failed. Please try again after backend starts.");
          return;
        }

        navigate("/dashboard", { replace: true });
        return;
      }

      setError("Sign in requires additional steps. Please complete verification in Clerk.");
    } catch (authError) {
      const message =
        authError?.errors?.[0]?.longMessage ?? authError?.message ?? "Failed to sign in.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-back-link">
        <Link to="/">← Back to home</Link>
      </div>

      <div className="auth-card">
        <div className="auth-logo">
          <img src="/logo.png" alt="Rakshak AI" />
        </div>

        <h1 className="auth-title">Access Threat Dashboard</h1>
        <p className="auth-subtitle">Monitor cyber threats targeting your organization</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Work Email */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="login-email">Work Email</label>
            <div className="auth-input-wrap">
              <input
                id="login-email"
                type="email"
                className="auth-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@organization.com"
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="login-password">Password</label>
            <div className="auth-input-wrap">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                className="auth-input auth-input--icon-right"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="auth-input-icon-btn"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Trust device + Forgot */}
          <div className="auth-row">
            <label className="auth-check-label">
              <input
                type="checkbox"
                checked={trustDevice}
                onChange={(e) => setTrustDevice(e.target.checked)}
              />
              Trust this device
            </label>
            <button
              type="button"
              className="auth-text-btn"
              onClick={() => setError("Please use Clerk account recovery flow for password reset.")}
            >
              Forgot password?
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="auth-error" role="alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          {/* CTA */}
          <button
            id="login-submit"
            type="submit"
            className="auth-btn"
            disabled={loading || !isLoaded}
          >
            {loading ? (
              <><span className="auth-spinner" />Signing in...</>
            ) : (
              "Open Security Dashboard 🔐"
            )}
          </button>

          {/* Footer */}
          <p className="auth-footer">
            New organization?{" "}
            <Link to="/register">Create account</Link>
          </p>
        </form>
      </div>
    </section>
  );
};

export default LoginForm;
