const apiBaseUrl = (process.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api').replace(/\/$/, '');
const bearerToken = process.env.SMOKE_CLERK_BEARER_TOKEN ?? '';
const requireAuth = process.argv.includes('--require-auth');

async function expectStatus(label, url, options, expectedStatus) {
  const response = await fetch(url, options);
  if (response.status !== expectedStatus) {
    const body = await response.text().catch(() => '');
    throw new Error(`${label} expected ${expectedStatus}, got ${response.status}. ${body}`.trim());
  }
  console.log(`[ok] ${label}: ${response.status}`);
}

async function run() {
  console.log(`[info] API base URL: ${apiBaseUrl}`);

  await expectStatus('health endpoint', `${apiBaseUrl}/health`, {}, 200);
  await expectStatus('protected endpoint without token', `${apiBaseUrl}/threats/summary`, {}, 401);

  if (!bearerToken) {
    if (requireAuth) {
      console.error('[fail] SMOKE_CLERK_BEARER_TOKEN is required for --require-auth mode.');
      process.exitCode = 1;
      return;
    }

    console.log('[warn] SMOKE_CLERK_BEARER_TOKEN not provided; skipping authenticated checks.');
    return;
  }

  const authHeaders = {
    Authorization: `Bearer ${bearerToken}`,
  };

  await expectStatus(
    'protected summary endpoint with token',
    `${apiBaseUrl}/threats/summary`,
    { headers: authHeaders },
    200
  );

  await expectStatus(
    'organization profile endpoint with token',
    `${apiBaseUrl}/organizations/me`,
    { headers: authHeaders },
    200
  );

  console.log('[ok] Authenticated checks completed successfully.');
}

run().catch((error) => {
  console.error('[fail] Auth smoke test failed:', error.message);
  process.exitCode = 1;
});
