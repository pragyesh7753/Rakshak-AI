import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Loader2, Globe, Briefcase, Tag } from 'lucide-react';
import { useAuthedApi } from '@/hooks/use-authed-api';
import { getOrganization, upsertOrganization } from '@/features/organization/services/organization.service';
import '@/features/auth/components/auth.css';

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
    description: '',
    keywords: '',
  });

  const submitDisabled = useMemo(() => {
    return (
      saving ||
      !form.org_name.trim() ||
      !form.sector.trim() ||
      !form.domain.trim() ||
      !form.description.trim()
    );
  }, [form, saving]);

  useEffect(() => {
    if (!isAuthLoaded) return;
    if (!isSignedIn) { setLoading(false); return; }

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
        if (active) setLoading(false);
      }
    }

    bootstrap();
    return () => { active = false; };
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
        description: form.description.trim(),
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

  /* ── Loading state ─────────────────────────────────────── */
  if (!isAuthLoaded || loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0d0f14',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Loader2
          size={32}
          style={{ color: '#34d399' }}
          className="auth-spinner"
        />
      </div>
    );
  }

  if (!isSignedIn) return <Navigate to="/login" replace />;

  /* ── Main page ─────────────────────────────────────────── */
  return (
    <section className="auth-page">
      <div className="auth-back-link">
        <Link to="/">← Back to home</Link>
      </div>

      <div className="auth-card auth-card--wide">
        {/* Logo */}
        <div className="auth-logo">
          <img src="/logo.png" alt="Rakshak AI" />
        </div>

        {/* Step indicator */}
        <div className="auth-step-indicator">
          <span className="auth-step-label">Step 2 of 2 — Organization Setup</span>
          <div className="auth-progress-bar" style={{ width: '100%' }}>
            <div className="auth-progress-fill" style={{ width: '100%' }} />
          </div>
        </div>

        <h1 className="auth-title">Finish Organization Setup</h1>
        <p className="auth-subtitle">
          Add your organization profile so Rakshak can personalize alerts and threat intelligence.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Organization Name */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="ob-org-name">Organization Name</label>
            <div className="auth-input-wrap">
              <input
                id="ob-org-name"
                type="text"
                className="auth-input"
                value={form.org_name}
                onChange={(e) => setForm((prev) => ({ ...prev, org_name: e.target.value }))}
                placeholder="Acme Security Pvt Ltd"
                required
              />
            </div>
          </div>

          {/* Sector */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="ob-sector">Sector / Industry</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon-left">
                <Briefcase size={15} />
              </span>
              <input
                id="ob-sector"
                type="text"
                className="auth-input auth-input--icon-left"
                value={form.sector}
                onChange={(e) => setForm((prev) => ({ ...prev, sector: e.target.value }))}
                placeholder="Healthcare, Finance, Education"
                required
              />
            </div>
          </div>

          {/* Primary Domain */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="ob-domain">Primary Domain</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon-left">
                <Globe size={15} />
              </span>
              <input
                id="ob-domain"
                type="text"
                className="auth-input auth-input--icon-left"
                value={form.domain}
                onChange={(e) => setForm((prev) => ({ ...prev, domain: e.target.value }))}
                placeholder="acme-security.com"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="ob-description">Organization Description</label>
            <textarea
              id="ob-description"
              className="auth-textarea"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your services, tech stack, customer base, and what kind of cyber risks you care about."
              required
            />
            <p className="auth-helper">
              This helps generate sector-specific multilingual threat keywords.
            </p>
          </div>

          {/* Keywords */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="ob-keywords">Keywords (optional)</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon-left">
                <Tag size={15} />
              </span>
              <input
                id="ob-keywords"
                type="text"
                className="auth-input auth-input--icon-left"
                value={form.keywords}
                onChange={(e) => setForm((prev) => ({ ...prev, keywords: e.target.value }))}
                placeholder="ransomware, phishing, data breach"
              />
            </div>
            <p className="auth-helper">Separate multiple keywords with commas.</p>
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
            id="onboarding-submit"
            type="submit"
            className="auth-btn"
            disabled={submitDisabled}
          >
            {saving ? (
              <><span className="auth-spinner" />Saving organization...</>
            ) : (
              "Save and Continue →"
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
