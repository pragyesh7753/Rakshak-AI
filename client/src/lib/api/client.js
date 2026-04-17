const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api').replace(/\/$/, '');

function toQueryString(query = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    params.set(key, String(value));
  }
  const asString = params.toString();
  return asString ? `?${asString}` : '';
}

export async function apiRequest(
  path,
  { method = 'GET', query, body, getToken, signal, requiresAuth = true } = {}
) {
  const token = typeof getToken === 'function' ? await getToken() : null;

  if (requiresAuth && !token) {
    throw new Error('Authentication required');
  }

  const headers = {
    Accept: 'application/json',
  };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}${toQueryString(query)}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch {
    throw new Error('Backend unavailable');
  }

  if (response.status === 204) {
    return null;
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload?.error ?? `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload;
}
