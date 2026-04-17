"use client";

import { useAuth, useClerk, useSignUp } from "@clerk/clerk-react";
import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft, Mail } from "lucide-react";
import {
  checkBackendHealth,
  createTokenGetter,
  verifyBackendSession,
} from "@/features/auth/services/backend-auth.service";
import OtpInput from "./OtpInput";
import "./auth.css";

/* ─── Password strength helper ──────────────────────────── */
function getStrength(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}
const STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Strong"];

/* ─── Countdown timer hook ──────────────────────────────── */
function useCountdown(initial) {
  const [secs, setSecs] = useState(initial);

  const reset = useCallback(() => setSecs(initial), [initial]);

  useEffect(() => {
    if (secs <= 0) return;
    const id = setInterval(() => setSecs((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [secs]);

  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");
  return { secs, display: `${mm}:${ss}`, reset };
}

const RegisterForm = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { getToken } = useAuth();
  const { signOut } = useClerk();
  const navigate = useNavigate();

  const [pendingVerification, setPendingVerification] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const strength = getStrength(password);
  const { secs: timerSecs, display: timerDisplay, reset: resetTimer } = useCountdown(300);

  /* ── Registration ──────────────────────────────────────── */
  async function handleSubmit(event) {
    event.preventDefault();
    if (!isLoaded) return;

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const backendReady = await checkBackendHealth();
      if (!backendReady) {
        setError("Backend server is unavailable. Start backend and try again.");
        return;
      }

      const result = await signUp.create({ emailAddress: email, password });

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
        navigate("/onboarding", { replace: true });
        return;
      }

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
      resetTimer();
    } catch (authError) {
      const message =
        authError?.errors?.[0]?.longMessage ?? authError?.message ?? "Failed to create account.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  /* ── Verify OTP ─────────────────────────────────────────── */
  async function handleVerifyCode(event) {
    event.preventDefault();
    if (!isLoaded || otp.length < 6) return;

    setError("");
    setLoading(true);

    try {
      const backendReady = await checkBackendHealth();
      if (!backendReady) {
        setError("Backend server is unavailable. Start backend and try again.");
        return;
      }

      const result = await signUp.attemptEmailAddressVerification({ code: otp });

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
        navigate("/onboarding", { replace: true });
        return;
      }

      setError("Verification did not complete. Please check the code and try again.");
    } catch (verifyError) {
      const message =
        verifyError?.errors?.[0]?.longMessage ?? verifyError?.message ?? "Failed to verify code.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  /* ── Resend ─────────────────────────────────────────────── */
  async function handleResendCode() {
    if (!isLoaded || timerSecs > 0) return;
    setError("");
    setLoading(true);
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setOtp("");
      resetTimer();
    } catch (resendError) {
      const message =
        resendError?.errors?.[0]?.longMessage ?? resendError?.message ?? "Failed to resend code.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  /* ══════════════════════════════════════════════════════════
     OTP Verification view
  ══════════════════════════════════════════════════════════ */
  if (pendingVerification) {
    return (
      <section className="auth-page">
        <div className="auth-back-link">
          <Link to="/register">← Back</Link>
        </div>

        <div className="auth-card">
          <div className="auth-logo">
            <img src="/logo.png" alt="Rakshak AI" />
          </div>

          <div className="otp-icon">
            <Mail size={44} color="#34d399" strokeWidth={1.5} />
          </div>

          <h1 className="auth-title">Verify Your Email</h1>
          <p className="auth-subtitle">
            We sent a 6-digit security code to{" "}
            <span className="otp-email-highlight">{email}</span>.
            <br />Check your inbox and enter the code below.
          </p>

          <form onSubmit={handleVerifyCode}>
            {/* 6-box OTP input */}
            <OtpInput value={otp} onChange={setOtp} length={6} />

            {/* Timer */}
            <p className="otp-timer">
              Code expires in <span>{timerDisplay}</span>
            </p>

            {/* Error */}
            {error && (
              <div className="auth-error" role="alert" style={{ marginTop: 16 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            {/* Verify CTA */}
            <button
              id="otp-verify-btn"
              type="submit"
              className="auth-btn"
              style={{ marginTop: 20 }}
              disabled={loading || !isLoaded || otp.length < 6}
            >
              {loading ? (
                <><span className="auth-spinner" />Verifying...</>
              ) : (
                "Verify & Continue →"
              )}
            </button>
          </form>

          {/* Resend */}
          <div className="otp-resend">
            Didn&apos;t receive the code?{" "}
            <button
              type="button"
              onClick={handleResendCode}
              disabled={loading || timerSecs > 0}
            >
              {timerSecs > 0 ? `Resend in ${timerDisplay}` : "Resend code"}
            </button>
          </div>

          {/* Edit email */}
          <div className="otp-edit-link">
            <button
              type="button"
              onClick={() => {
                setPendingVerification(false);
                setOtp("");
                setError("");
              }}
            >
              <ArrowLeft size={13} /> Edit email address
            </button>
          </div>
        </div>
      </section>
    );
  }

  /* ══════════════════════════════════════════════════════════
     Registration form view
  ══════════════════════════════════════════════════════════ */
  return (
    <section className="auth-page">
      <div className="auth-back-link">
        <Link to="/">← Back to home</Link>
      </div>

      <div className="auth-card">
        <div className="auth-logo">
          <img src="/logo.png" alt="Rakshak AI" />
        </div>

        <h1 className="auth-title">Create Your Account</h1>
        <p className="auth-subtitle">Join Rakshak AI to protect your organization</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Work Email */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-email">Work Email</label>
            <div className="auth-input-wrap">
              <input
                id="reg-email"
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
            <label className="auth-label" htmlFor="reg-password">Password</label>
            <div className="auth-input-wrap">
              <input
                id="reg-password"
                type={showPw ? "text" : "password"}
                className="auth-input auth-input--icon-right"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                minLength={8}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className="auth-input-icon-btn"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Password strength */}
            {password && (
              <div className="auth-strength">
                <div className="auth-strength-bar">
                  {[1, 2, 3, 4].map((n) => (
                    <div
                      key={n}
                      className={`auth-strength-seg${strength >= n ? ` auth-strength-seg--${strength}` : ""}`}
                    />
                  ))}
                </div>
                <span className="auth-strength-label">
                  {STRENGTH_LABELS[strength]}
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-confirm">Confirm Password</label>
            <div className="auth-input-wrap">
              <input
                id="reg-confirm"
                type={showConfirm ? "text" : "password"}
                className="auth-input auth-input--icon-right"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                minLength={8}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className="auth-input-icon-btn"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
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
            id="register-submit"
            type="submit"
            className="auth-btn"
            disabled={loading || !isLoaded}
          >
            {loading ? (
              <><span className="auth-spinner" />Creating account...</>
            ) : (
              "Create Secure Account"
            )}
          </button>

          {/* Footer */}
          <p className="auth-footer">
            Already have an account?{" "}
            <Link to="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </section>
  );
};

export default RegisterForm;
