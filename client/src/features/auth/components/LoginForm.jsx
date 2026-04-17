"use client";

import { useAuth, useClerk, useSignIn } from "@clerk/clerk-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  checkBackendHealth,
  createTokenGetter,
  verifyBackendSession,
} from "@/features/auth/services/backend-auth.service";

const LoginForm = () => {
  const { isLoaded, signIn, setActive } = useSignIn();
  const { getToken } = useAuth();
  const { signOut } = useClerk();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [trustDevice, setTrustDevice] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
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

      const result = await signIn.create({
        identifier: email,
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

        navigate("/dashboard", { replace: true });
        return;
      }

      setError("Sign in requires additional steps. Please complete verification in Clerk.");
    } catch (authError) {
      const message = authError?.errors?.[0]?.longMessage ?? authError?.message ?? "Failed to sign in.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-primary dark:bg-background min-h-screen flex items-center justify-center">
      <div className="md:py-8 max-w-lg px-4 sm:px-0 mx-auto w-full">
        <div className="mb-4">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-primary-foreground hover:text-white dark:text-muted-foreground dark:hover:text-foreground transition">
            {'<- Back to home'}
          </Link>
        </div>

        <div className="bg-card border border-border shadow-2xl rounded-xl px-6 py-8 sm:p-8">
          <div className="flex justify-center mb-6">
            <img src="/logo.png" alt="Rakshak AI" className="h-16 w-40 object-contain" />
          </div>

          <h1 className="text-4xl font-semibold text-white text-center">Access Threat Dashboard</h1>
          <p className="mt-2 text-lg text-gray-400 text-center">Monitor cyber threats targeting your organization</p>

          <form className="mt-10 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm text-gray-300">Work Email</label>
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@organization.com"
                required
                className="dark:bg-background"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-300">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
                className="dark:bg-background"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-3 text-sm text-white cursor-pointer">
                <Checkbox
                  checked={trustDevice}
                  onCheckedChange={(checked) => setTrustDevice(Boolean(checked))}
                  className="cursor-pointer"
                />
                Trust this device
              </label>

              <button
                type="button"
                className="text-sm font-medium text-white hover:text-cyan-300 transition"
                onClick={() => setError("Please use Clerk account recovery flow for password reset.")}
              >
                Forgot password?
              </button>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <Button type="submit" className="w-full rounded-lg" disabled={loading || !isLoaded}>
              {loading ? "Signing in..." : "Open Security Dashboard 🔐"}
            </Button>

            <p className="text-center text-sm text-gray-400 pt-1">
              New organization?{' '}
              <Link to="/register" className="text-white underline underline-offset-4 hover:text-cyan-300">
                Create account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

export default LoginForm;
