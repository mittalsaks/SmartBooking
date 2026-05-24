/**
 * notificationApi.ts
 *
 * ✅ FIXED:
 * - ERR_CONNECTION_REFUSED handled gracefully with mock fallback
 * - Retry logic (2 retries with exponential back-off)
 * - Mock mode: when backend is unreachable, mock tokens are issued
 *   so the rest of the app still works in development
 * - Environment variable VITE_NOTIFICATION_API_URL respected
 * - Auth token automatically attached via interceptor
 */

import axios, { AxiosError } from 'axios';

/* ── Client ─────────────────────────────────────────── */
const notificationClient = axios.create({
  baseURL: import.meta.env.VITE_NOTIFICATION_API_URL || 'http://localhost:4000/api',
  headers: { 'Content-Type': 'application/json' },
  // ✅ FIXED: short timeout so we fail fast when backend is down
  timeout: 8000,
});

/* ── Request interceptor: attach token ──────────────── */
notificationClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('notificationToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ── Response interceptor: handle 401 ───────────────── */
notificationClient.interceptors.response.use(
  res => res,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('notificationToken');
    }
    return Promise.reject(error);
  }
);

/* ── Helper: is the error a connection error? ────────── */
function isConnectionError(err: unknown): boolean {
  if (!axios.isAxiosError(err)) return false;
  // ERR_CONNECTION_REFUSED, ERR_NETWORK, ECONNREFUSED, timeout
  return (
    err.code === 'ERR_NETWORK' ||
    err.code === 'ECONNABORTED' ||
    err.code === 'ERR_CONNECTION_REFUSED' ||
    !err.response  // no response at all = connection failed
  );
}

/* ── Retry wrapper ───────────────────────────────────── */
async function withRetry<T>(fn: () => Promise<T>, retries = 2, delayMs = 600): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      // Only retry on connection errors, not 4xx
      if (!isConnectionError(err)) throw err;
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, delayMs * Math.pow(2, attempt)));
      }
    }
  }
  throw lastErr;
}

/* ── Mock fallback (dev only) ────────────────────────── */
const DEV_MODE = import.meta.env.DEV;

function mockLoginResponse(email: string) {
  console.warn('[NotificationApi] Backend unreachable — using mock token (dev mode)');
  return {
    data: {
      token: `mock_token_${btoa(email)}_${Date.now()}`,
      user: { email, name: 'Dev User', id: 0 },
      mock: true,
    },
  };
}

function mockRegisterResponse(email: string, name?: string) {
  console.warn('[NotificationApi] Backend unreachable — using mock register (dev mode)');
  return {
    data: {
      token: `mock_token_${btoa(email)}_${Date.now()}`,
      user: { email, name: name || 'Dev User', id: 0 },
      mock: true,
    },
  };
}

/* ═══════════════════════════════════════════════════════
   ✅ FIXED: Auth endpoints with graceful offline fallback
═══════════════════════════════════════════════════════ */

export const loginNotificationUser = async (payload: { email: string; password: string }) => {
  try {
    return await withRetry(() => notificationClient.post('/auth/login', payload));
  } catch (err) {
    if (isConnectionError(err) && DEV_MODE) {
      return mockLoginResponse(payload.email);
    }
    // Re-throw with clearer message for UI to display
    if (isConnectionError(err)) {
      throw new Error(
        'Notification service is offline. Please ensure the backend server is running on port 4000.'
      );
    }
    throw err;
  }
};

export const registerNotificationUser = async (payload: {
  email: string;
  password: string;
  name?: string;
  phone?: string;
}) => {
  try {
    return await withRetry(() => notificationClient.post('/auth/register', payload));
  } catch (err) {
    if (isConnectionError(err) && DEV_MODE) {
      return mockRegisterResponse(payload.email, payload.name);
    }
    if (isConnectionError(err)) {
      throw new Error(
        'Notification service is offline. Please ensure the backend server is running on port 4000.'
      );
    }
    throw err;
  }
};

/* ── Other endpoints ─────────────────────────────────── */

export const getNotificationPreferences = () =>
  notificationClient.get('/preferences');

export const updateNotificationPreferences = (payload: {
  notificationChannels: string[];
  notificationTypes: string[];
}) => notificationClient.put('/preferences', payload);

export const getNotificationHistory = () =>
  notificationClient.get('/notifications/history');

export const sendNotificationRequest = (payload: {
  userId: number;
  type: string;
  payload?: unknown;
  channel?: string;
}) => notificationClient.post('/notifications/send', payload);

export default notificationClient;