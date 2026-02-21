"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { insertOrganization } from "@/actions/auth";

const RegisterForm = () => {
  const router = useRouter();
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

    const supabase = createClient();

    // 1. Sign up the user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        // Pass org metadata so we can use it in the callback if needed
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
      // Supabase returned no user — likely email confirmation is enabled.
      // Re-try insert using the admin action with the email as a lookup key won't work here.
      // Show a message and do NOT attempt insert (email confirmation flow will handle it).
      setLoading(false);
      router.push("/login?registered=true&confirm=true");
      return;
    }

    // 2. Insert organization record via Server Action (uses service role key — bypasses RLS)
    const { error: dbError } = await insertOrganization({
      id: userId,
      org_name: formData.org_name,
      sector: formData.sector,
      domain: formData.domain,
    });

    if (dbError) {
      setError(dbError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    // If email confirmation is enabled, show a message; otherwise redirect
    if (authData.session) {
      router.push("/dashboard");
    } else {
      router.push("/login?registered=true");
    }
  };

  return (
    <section className="bg-primary dark:bg-background min-h-screen flex items-center justify-center">
      <div className="py-10 md:py-20 max-w-lg px-4 sm:px-0 mx-auto w-full">
        <div className="mb-4">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-primary-foreground/80 hover:text-primary-foreground transition">
            ← Back to home
          </Link>
        </div>
        <Card className="max-w-lg px-6 py-8 sm:p-12 relative shadow-2xl">
          <CardHeader className="text-center gap-3 p-0">
            
            {/* Logo */}
            <div className="text-3xl font-bold tracking-tight">
              🛡️ Rakshak AI
            </div>

            <div className="flex flex-col gap-1">
              <CardTitle className="text-2xl font-semibold">
                Protect Your Organization
              </CardTitle>
              <CardDescription>
                Cyber Threat Early Warning System for Indian Organizations
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="p-0 mt-6">
            <form onSubmit={handleSubmit}>
              <FieldGroup className="gap-6">

                {/* Organization Name */}
                <Field className="gap-1.5">
                  <FieldLabel className="text-sm text-muted-foreground">
                    Organization Name
                  </FieldLabel>
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

                {/* Sector */}
                <Field className="gap-1.5">
                  <FieldLabel className="text-sm text-muted-foreground">
                    Sector
                  </FieldLabel>
                  <Input
                    type="text"
                    name="sector"
                    value={formData.sector}
                    onChange={handleChange}
                    placeholder="Education / Fintech / Healthcare"
                    required
                    className="dark:bg-background"
                  />
                </Field>

                {/* Domain */}
                <Field className="gap-1.5">
                  <FieldLabel className="text-sm text-muted-foreground">
                    Domain / Website
                  </FieldLabel>
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

                {/* Email */}
                <Field className="gap-1.5">
                  <FieldLabel className="text-sm text-muted-foreground">
                    Work Email
                  </FieldLabel>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="admin@organization.com"
                    required
                    className="dark:bg-background"
                  />
                </Field>

                {/* Password */}
                <Field className="gap-1.5">
                  <FieldLabel className="text-sm text-muted-foreground">
                    Password
                  </FieldLabel>
                  <Input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a secure password"
                    required
                    minLength={8}
                    pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}"
                    title="Password must be at least 8 characters long and include uppercase, lowercase, and a number."
                    className="dark:bg-background"
                  />
                  <FieldDescription className="text-xs text-muted-foreground">
                    Must be at least 8 characters and include uppercase, lowercase, and a number.
                  </FieldDescription>
                </Field>

                {/* Error */}
                {error && (
                  <p className="text-sm text-red-500 text-center">{error}</p>
                )}

                {/* CTA */}
                <Field className="gap-4">
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
