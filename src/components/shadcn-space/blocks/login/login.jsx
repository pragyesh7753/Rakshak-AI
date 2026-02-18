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

const LoginForm = () => {
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
            <form>
              <FieldGroup className="gap-6">

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

                {/* CTA */}
                <Field className="gap-4">
                  <Button type="submit" size="lg" className="rounded-lg w-full">
                    Open Security Dashboard 🔐
                  </Button>

                  <FieldDescription className="text-center text-sm text-muted-foreground">
                    New organization?{" "}
                    <a href="#" className="font-medium">
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
