// Base URL of the backend API. Configure via .env (REACT_APP_API_URL) for
// production; defaults to the local Express server during development.
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Thin wrapper around fetch that:
 * - always sends/receives the httpOnly auth cookie (credentials: 'include')
 * - sets JSON headers
 * - throws an Error with the server's message on non-2xx responses
 */
export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // No JSON body (e.g. 204) — that's fine.
  }

  if (!res.ok) {
    const message = data?.message || `Request failed (${res.status})`;
    const error = new Error(message);
    error.status = res.status;
    error.code = data?.code;
    throw error;
  }

  return data;
}
