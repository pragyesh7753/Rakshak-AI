"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Checkbox } from "@/components/ui/checkbox";
import { createClient } from "@/lib/supabase/client";

const LoginForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <section className="bg-primary dark:bg-background min-h-screen flex items-center justify-center">
      <div className="py-10 md:py-20 max-w-lg px-4 sm:px-0 mx-auto w-full">
        <Card className="max-w-lg px-6 py-8 sm:p-12 shadow-2xl">
          <CardHeader className="text-center gap-3 p-0">
            
            {/* Logo */}
            <div className="text-3xl font-bold tracking-tight">
              🛡️ Rakshak AI
            </div>

            <div className="flex flex-col gap-1">
              <CardTitle className="text-2xl font-semibold">
                Access Threat Dashboard
              </CardTitle>
              <CardDescription>
                Monitor cyber threats targeting your organization
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="p-0 mt-6">
            <form onSubmit={handleSubmit}>
              <FieldGroup className="gap-6">

                {/* Email */}
                <Field className="gap-1.5">
                  <FieldLabel className="text-sm text-muted-foreground">
                    Work Email
                  </FieldLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="dark:bg-background"
                  />
                </Field>

                {/* Remember device */}
                <Field className="flex flex-row items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <Checkbox id="remember" defaultChecked className="cursor-pointer" />
                    <FieldLabel
                      htmlFor="remember"
                      className="text-sm cursor-pointer">
                      Trust this device
                    </FieldLabel>
                  </div>

                  <a href="#" className="text-sm font-medium">
                    Forgot password?
                  </a>
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
                    {loading ? "Signing in…" : "Open Security Dashboard 🔐"}
                  </Button>

                  <FieldDescription className="text-center text-sm text-muted-foreground">
                    New organization?{" "}
                    <a href="/register" className="font-medium">
                      Create account
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

export default LoginForm;
