/**
 * NotificationLogin.tsx — restyled to match Dashboard dark aesthetic
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Mail, Lock, User, Phone,
  Eye, EyeOff, WifiOff, AlertCircle, ChevronRight,
} from 'lucide-react';
import { loginNotificationUser, registerNotificationUser } from '../services/notificationApi';
import { useToast } from '../components/ToastProvider';

/* -------------------------------------
   DESIGN TOKENS — same as Dashboard
------------------------------------- */
const T = {
  card:        'rgba(10,20,36,0.82)',
  border:      'rgba(255,255,255,0.07)',
  green:       '#39FF96',
  greenDim:    'rgba(57,255,150,0.09)',
  greenBorder: 'rgba(57,255,150,0.22)',
  cyan:        '#22D3EE',
  red:         '#F87171',
  amber:       '#FCD34D',
  text:        '#F0FDF4',
  textMuted:   '#4A5568',
};

/* -- shared input style -- */
const baseInput: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: 12,
  fontSize: 13,
  fontWeight: 500,
  color: T.text,
  background: 'rgba(255,255,255,0.04)',
  border: `1px solid ${T.border}`,
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};

function applyFocus(el: HTMLInputElement) {
  el.style.borderColor = 'rgba(57,255,150,0.5)';
  el.style.boxShadow   = '0 0 0 3px rgba(57,255,150,0.1)';
}
function removeFocus(el: HTMLInputElement) {
  el.style.borderColor = T.border;
  el.style.boxShadow   = 'none';
}

/* -- field wrapper -- */
function Field({
  label, icon, children,
}: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {icon}
        <label style={{
          fontSize: 9, fontWeight: 700, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: T.textMuted,
        }}>
          {label}
        </label>
      </div>
      {children}
    </div>
  );
}

/* --------------------------------------
   MAIN COMPONENT
-------------------------------------- */
export default function NotificationLogin() {
  const [mode,        setMode]        = useState<'login' | 'register'>('login');
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [name,        setName]        = useState('');
  const [phone,       setPhone]       = useState('');
  const [showPw,      setShowPw]      = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const navigate    = useNavigate();
  const { pushToast } = useToast();

  const switchMode = (m: 'login' | 'register') => {
    setMode(m);
    setServerError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setServerError(null);

    try {
      const response = mode === 'login'
        ? await loginNotificationUser({ email, password })
        : await registerNotificationUser({ email, password, name, phone });

      localStorage.setItem('notificationToken', response.data.token);

      if (response.data.mock) {
        pushToast({ title: 'Dev Mode', message: 'Using mock token — backend is offline.', level: 'warning' });
      } else {
        pushToast({
          title: 'Success',
          message: `${mode === 'login' ? 'Logged in' : 'Registered'} successfully.`,
          level: 'success',
        });
      }
      navigate('/notifications/history');
    } catch (error: unknown) {
      const isError  = error instanceof Error;
      const axiosMsg = !isError && typeof error === 'object' && error !== null
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      const message  = isError ? error.message : axiosMsg || 'Unable to sign in. Please try again.';
      const isOffline = message.includes('offline') || message.includes('port 4000');

      if (isOffline) setServerError(message);
      else pushToast({ title: 'Error', message, level: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return null;
}
