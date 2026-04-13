"use client";

import { useAuth, useClerk, useSignUp } from "@clerk/clerk-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  checkBackendHealth,
  createTokenGetter,
  verifyBackendSession,
} from "@/features/auth/services/backend-auth.service";

const RegisterForm = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { getToken } = useAuth();
  const { signOut } = useClerk();
  const navigate = useNavigate();

  const [pendingVerification, setPendingVerification] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!isLoaded) {
      return;
    }

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

      const result = await signUp.create({
        emailAddress: email,
        password,
      });

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
    } catch (authError) {
      const message = authError?.errors?.[0]?.longMessage ?? authError?.message ?? "Failed to create account.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode(event) {
    event.preventDefault();
    if (!isLoaded) {
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

      const result = await signUp.attemptEmailAddressVerification({ code });

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
      const message = verifyError?.errors?.[0]?.longMessage ?? verifyError?.message ?? "Failed to verify code.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResendCode() {
    if (!isLoaded) {
      return;
    }

    setError("");
    setLoading(true);
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
    } catch (resendError) {
      const message = resendError?.errors?.[0]?.longMessage ?? resendError?.message ?? "Failed to resend code.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-primary dark:bg-background min-h-screen flex items-center justify-center">
      <div className="py-6 max-w-xl px-4 sm:px-0 mx-auto w-full">
        <div className="mb-4">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-primary-foreground hover:text-white dark:text-muted-foreground dark:hover:text-foreground transition">
            {'<- Back to home'}
          </Link>
        </div>

        <div className="bg-card border border-border shadow-2xl rounded-xl p-6 sm:p-8">
          <h1 className="text-2xl font-semibold text-white">Create Account</h1>
          <p className="mt-1 text-sm text-gray-400">Register using Clerk client SDK.</p>

          {!pendingVerification ? (
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-1 block text-sm text-gray-300">Work Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@organization.com"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-300">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Minimum 8 characters"
                  minLength={8}
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-300">Confirm Password</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Re-enter password"
                  minLength={8}
                  required
                />
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <Button type="submit" className="w-full" disabled={loading || !isLoaded}>
                {loading ? "Creating account..." : "Create account"}
              </Button>

              <p className="text-center text-sm text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="text-cyan-400 hover:text-cyan-300">
                  Sign in
                </Link>
              </p>
            </form>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={handleVerifyCode}>
              <p className="text-sm text-gray-400">
                We sent a verification code to {email}. Enter it below to complete signup.
              </p>

              <div>
                <label className="mb-1 block text-sm text-gray-300">Email verification code</label>
                <Input
                  type="text"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  placeholder="123456"
                  inputMode="numeric"
                  required
                />
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <Button type="submit" className="w-full" disabled={loading || !isLoaded}>
                {loading ? "Verifying code..." : "Verify and continue"}
              </Button>

              <div className="flex justify-between text-sm">
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="text-cyan-400 hover:text-cyan-300"
                  disabled={loading || !isLoaded}
                >
                  Resend code
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPendingVerification(false);
                    setCode("");
                    setError("");
                  }}
                  className="text-gray-400 hover:text-white"
                  disabled={loading}
                >
                  Edit email
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default RegisterForm;
