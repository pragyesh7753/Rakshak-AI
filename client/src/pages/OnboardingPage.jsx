import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthedApi } from '@/hooks/use-authed-api';
import { getOrganization, upsertOrganization } from '@/features/organization/services/organization.service';

function normalizeKeywords(value) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function OnboardingPage() {
  const navigate = useNavigate();
  const { callService, isAuthLoaded, isSignedIn } = useAuthedApi();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    org_name: '',
    sector: '',
    domain: '',
    keywords: '',
  });

  const submitDisabled = useMemo(() => {
    return saving || !form.org_name.trim() || !form.sector.trim() || !form.domain.trim();
  }, [form, saving]);

  useEffect(() => {
    if (!isAuthLoaded) {
      return;
    }

    if (!isSignedIn) {
      setLoading(false);
      return;
    }

    let active = true;

    async function bootstrap() {
      try {
        const org = await callService(getOrganization);
        if (!active) return;

        if (org?.org_name && org?.domain) {
          navigate('/dashboard', { replace: true });
          return;
        }
      } catch (bootstrapError) {
        if (!active) return;
        console.error('[OnboardingPage] bootstrap:', bootstrapError);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    bootstrap();

    return () => {
      active = false;
    };
  }, [callService, isAuthLoaded, isSignedIn, navigate]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSaving(true);

    try {
      await callService(upsertOrganization, {
        org_name: form.org_name.trim(),
        sector: form.sector.trim(),
        domain: form.domain.trim(),
        keywords: normalizeKeywords(form.keywords),
      });
      navigate('/dashboard', { replace: true });
    } catch (submitError) {
      console.error('[OnboardingPage] submit:', submitError);
      setError(submitError?.message ?? 'Failed to save organization details.');
    } finally {
      setSaving(false);
    }
  }

  if (!isAuthLoaded || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <section className="bg-primary dark:bg-background min-h-screen flex items-center justify-center">
      <div className="w-full max-w-2xl px-4 py-8">
        <div className="mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-primary-foreground hover:text-white dark:text-muted-foreground dark:hover:text-foreground transition"
          >
            {'<- Back to home'}
          </Link>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 sm:p-8 shadow-2xl">
          <h1 className="text-2xl font-semibold text-white">Finish Organization Setup</h1>
          <p className="mt-2 text-sm text-gray-400">
            Add your organization profile so Rakshak can personalize alerts and threat intelligence.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm text-gray-300">Organization Name</label>
              <Input
                value={form.org_name}
                onChange={(event) => setForm((prev) => ({ ...prev, org_name: event.target.value }))}
                placeholder="Acme Security Pvt Ltd"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-300">Sector</label>
              <Input
                value={form.sector}
                onChange={(event) => setForm((prev) => ({ ...prev, sector: event.target.value }))}
                placeholder="Healthcare, Finance, Education"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-300">Primary Domain</label>
              <Input
                value={form.domain}
                onChange={(event) => setForm((prev) => ({ ...prev, domain: event.target.value }))}
                placeholder="acme-security.com"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-300">Keywords (optional)</label>
              <Input
                value={form.keywords}
                onChange={(event) => setForm((prev) => ({ ...prev, keywords: event.target.value }))}
                placeholder="ransomware, phishing, data breach"
              />
              <p className="mt-1 text-xs text-gray-500">Separate multiple keywords with commas.</p>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <Button type="submit" disabled={submitDisabled} className="w-full">
              {saving ? 'Saving organization...' : 'Save and continue'}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
