"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { insertOrganization } from "@/features/auth/actions";

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    org_name: "",
    sector: "",
    domain: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();

      // 1. Sign up the user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            org_name: formData.org_name,
            sector: formData.sector,
            domain: formData.domain,
          },
        },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      const userId = authData?.user?.id ?? authData?.session?.user?.id;

      if (!userId) {
        // Email confirmation enabled — no userId yet; redirect to confirm flow
        setLoading(false);
        window.location.href = "/login?registered=true&confirm=true";
        return;
      }

      // 2. Insert organization record via Server Action (uses service role key — bypasses RLS)
      const result = await insertOrganization({
        id: userId,
        org_name: formData.org_name,
        sector: formData.sector,
        domain: formData.domain,
      });

      if (result?.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      // Navigate — use full page load so the server reads the fresh auth cookie
      window.location.href = authData.session ? "/dashboard" : "/login?registered=true";
    } catch (err) {
      console.error("[RegisterForm] unexpected error:", err);
      setError(err?.message ?? "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <section className="bg-primary dark:bg-background min-h-screen flex items-center justify-center">
      <div className="py-6 max-w-xl px-4 sm:px-0 mx-auto w-full">
        <div className="mb-4">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-primary-foreground hover:text-white dark:text-muted-foreground dark:hover:text-foreground transition">
            ← Back to home
          </Link>
        </div>
        <Card className="max-w-xl px-8 py-3 sm:p-7 relative shadow-2xl">
          <CardHeader className="text-center gap-1 p-0">
            {/* Logo */}
            <div className="flex justify-center">
              <div className="relative h-24 w-48">
                <Image src="/logo.png" alt="Rakshak AI" fill className="object-contain" />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <CardTitle className="text-2xl font-semibold">
                Protect Your Organization
              </CardTitle>
              <CardDescription className="text-sm">
                Cyber Threat Early Warning System for Indian Organizations
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="p-0 mt-5">
            <form onSubmit={handleSubmit}>
              <FieldGroup className="gap-4">

                {/* Row 1: Org Name + Sector */}
                <div className="grid grid-cols-2 gap-4">
                  <Field className="gap-1.5">
                    <FieldLabel className="text-sm text-muted-foreground">Organization Name</FieldLabel>
                    <Input
                      type="text"
                      name="org_name"
                      value={formData.org_name}
                      onChange={handleChange}
                      placeholder="SATIM College"
                      required
                      className="dark:bg-background"
                    />
                  </Field>
                  <Field className="gap-1.5">
                    <FieldLabel className="text-sm text-muted-foreground">Sector</FieldLabel>
                    <Input
                      type="text"
                      name="sector"
                      value={formData.sector}
                      onChange={handleChange}
                      placeholder="Education / Fintech"
                      required
                      className="dark:bg-background"
                    />
                  </Field>
                </div>

                {/* Row 2: Domain + Email */}
                <div className="grid grid-cols-2 gap-4">
                  <Field className="gap-1.5">
                    <FieldLabel className="text-sm text-muted-foreground">Domain / Website</FieldLabel>
                    <Input
                      type="text"
                      name="domain"
                      value={formData.domain}
                      onChange={handleChange}
                      placeholder="satimcollege.edu.in"
                      required
                      className="dark:bg-background"
                    />
                  </Field>
                  <Field className="gap-1.5">
                    <FieldLabel className="text-sm text-muted-foreground">Work Email</FieldLabel>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="admin@org.com"
                      required
                      className="dark:bg-background"
                    />
                  </Field>
                </div>

                {/* Password */}
                <Field className="gap-1.5">
                  <FieldLabel className="text-sm text-muted-foreground">Password</FieldLabel>
                  <Input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 8 chars, upper + lower + number"
                    required
                    minLength={8}
                    pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}"
                    title="Password must be at least 8 characters long and include uppercase, lowercase, and a number."
                    className="dark:bg-background"
                  />
                </Field>

                {/* Error */}
                {error && (
                  <p className="text-sm text-red-500 text-center">{error}</p>
                )}

                {/* CTA */}
                <Field className="gap-3">
                  <Button
                    type="submit"
                    size="lg"
                    className="rounded-lg w-full"
                    disabled={loading}
                  >
                    {loading ? "Registering…" : "Start Monitoring Threats 🚀"}
                  </Button>

                  <FieldDescription className="text-center text-sm text-muted-foreground">
                    Already protected?{" "}
                    <a href="/login" className="font-medium text-card-foreground">
                      Sign in
                    </a>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default RegisterForm;
