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

const RegisterForm = () => {
  return (
    <section className="bg-primary dark:bg-background min-h-screen flex items-center justify-center">
      <div className="py-10 md:py-20 max-w-lg px-4 sm:px-0 mx-auto w-full">
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
            <form>
              <FieldGroup className="gap-6">

                {/* Organization Name */}
                <Field className="gap-1.5">
                  <FieldLabel className="text-sm text-muted-foreground">
                    Organization Name
                  </FieldLabel>
                  <Input
                    type="text"
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
                    placeholder="Education / Fintech / Healthcare"
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
                    placeholder="Create a secure password"
                    required
                    className="dark:bg-background"
                  />
                </Field>

                {/* CTA */}
                <Field className="gap-4">
                  <Button type="submit" size="lg" className="rounded-lg w-full">
                    Start Monitoring Threats 🚀
                  </Button>

                  <FieldDescription className="text-center text-sm text-muted-foreground">
                    Already protected?{" "}
                    <a href="#" className="font-medium text-card-foreground">
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
