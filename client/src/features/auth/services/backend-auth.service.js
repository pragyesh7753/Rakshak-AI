import { apiRequest } from '@/lib/api/client';

const DEFAULT_BACKEND_TIMEOUT_MS = 8000;

function withTimeout(promise, timeoutMs, onTimeoutMessage) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(onTimeoutMessage), timeoutMs);

  return {
    signal: controller.signal,
    finish: async () => {
      try {
        return await promise(controller.signal);
      } finally {
        clearTimeout(timer);
      }
    },
  };
}

export function createTokenGetter(getToken) {
  const template = import.meta.env.VITE_CLERK_JWT_TEMPLATE;
  return () => (template ? getToken({ template }) : getToken());
}

export async function checkBackendHealth() {
  const run = withTimeout(
    async (signal) =>
      apiRequest('/health', {
        requiresAuth: false,
        signal,
      }),
    DEFAULT_BACKEND_TIMEOUT_MS,
    'Backend health check timed out'
  );

  try {
    const result = await run.finish();
    return Boolean(result?.ok);
  } catch {
    return false;
  }
}

export async function verifyBackendSession(getToken) {
  const run = withTimeout(
    async (signal) =>
      apiRequest('/auth/verify', {
        getToken,
        signal,
      }),
    DEFAULT_BACKEND_TIMEOUT_MS,
    'Backend auth verification timed out'
  );

  return run.finish();
}
