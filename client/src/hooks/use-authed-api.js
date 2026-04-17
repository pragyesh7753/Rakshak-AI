import { useAuth } from '@clerk/clerk-react';
import { useCallback } from 'react';
import { apiRequest } from '@/lib/api/client';
import { createTokenGetter } from '@/features/auth/services/backend-auth.service';

/**
 * Reusable auth-aware API helper for frontend components.
 * Provides helpers that automatically attach Clerk bearer tokens.
 */
export function useAuthedApi() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const getBackendToken = useCallback(createTokenGetter(getToken), [getToken]);

  const callApi = useCallback(
    (path, options = {}) => {
      return apiRequest(path, { ...options, getToken: getBackendToken });
    },
    [getBackendToken]
  );

  const callService = useCallback(
    (serviceFn, ...args) => {
      return serviceFn(...args, getBackendToken);
    },
    [getBackendToken]
  );

  return {
    callApi,
    callService,
    isAuthLoaded: isLoaded,
    isSignedIn,
  };
}
