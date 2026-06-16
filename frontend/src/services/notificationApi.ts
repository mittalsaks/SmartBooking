import axios from 'axios';
// BookingConfirm.tsx ke top pe yeh import add karo
import { sendNotification } from '../services/notificationApi';

const NOTIFICATION_BASE_URL = import.meta.env.VITE_NOTIFICATION_API_URL || 'http://localhost:4000/api';

// Axios instance specifically for the notification service (port 4000)
const notificationClient = axios.create({
  baseURL: NOTIFICATION_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach the notification token (separate from main app JWT) on every request
notificationClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('notificationToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Auth ────────────────────────────────────────────────────────────────────

export interface RegisterPayload {
  email: string;
  password: string;
  name?: string;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: { id: number; email: string; name?: string };
  mock?: boolean;
}

export const registerNotificationUser = async (payload: RegisterPayload) => {
  try {
    const res = await notificationClient.post<AuthResponse>('/auth/register', payload);
    return { data: res.data };
  } catch (error: any) {
    // If the notification service is offline, return a mock token so the
    // rest of the app keeps working during development
    if (!error.response) {
      console.warn('[notificationApi] Service offline – using mock token');
      return { data: { token: 'mock-token-offline', user: { id: 0, email: payload.email }, mock: true } };
    }
    throw error;
  }
};

export const loginNotificationUser = async (payload: LoginPayload) => {
  try {
    const res = await notificationClient.post<AuthResponse>('/auth/login', payload);
    return { data: res.data };
  } catch (error: any) {
    if (!error.response) {
      console.warn('[notificationApi] Service offline – using mock token');
      return { data: { token: 'mock-token-offline', user: { id: 0, email: payload.email }, mock: true } };
    }
    throw error;
  }
};

// ── Notifications ────────────────────────────────────────────────────────────

export interface Notification {
  id: number;
  type: string;
  channel: string;
  subject?: string;
  body?: string;
  status: 'pending' | 'sent' | 'failed';
  sentAt?: string;
  createdAt: string;
}

export const fetchNotificationHistory = async (): Promise<Notification[]> => {
  const res = await notificationClient.get<Notification[]>('/notifications/history');
  return res.data;
};

export const sendNotification = async (payload: {
  userId: number;
  type: string;
  channel?: string;
  data?: Record<string, unknown>;
}) => {
  const res = await notificationClient.post('/notifications/send', payload);
  return res.data;
};

// ── Preferences ──────────────────────────────────────────────────────────────

export interface NotificationPreferences {
  notificationTypes: string[];
  notificationChannels: string[];
}

export const fetchPreferences = async (): Promise<NotificationPreferences> => {
  const res = await notificationClient.get<NotificationPreferences>('/preferences');
  return res.data;
};

export const updatePreferences = async (prefs: NotificationPreferences): Promise<NotificationPreferences> => {
  const res = await notificationClient.put<NotificationPreferences>('/preferences', prefs);
  return res.data;
};
// Alias for backward compatibility
export const getNotificationPreferences = fetchPreferences;
export const updateNotificationPreferences = updatePreferences;