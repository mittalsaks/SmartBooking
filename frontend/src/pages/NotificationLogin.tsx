/**
 * NotificationLogin.tsx – fixed (was returning null, form was missing)
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Mail, Lock, User, Phone, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { loginNotificationUser, registerNotificationUser } from '../services/notificationApi';
import { useToast } from '../components/ToastProvider';

const T = {
  card:        'rgba(10,20,36,0.82)',
  border:      'rgba(255,255,255,0.07)',
  green:       '#39FF96',
  greenDim:    'rgba(57,255,150,0.09)',
  greenBorder: 'rgba(57,255,150,0.22)',
  red:         '#F87171',
  text:        '#F0FDF4',
  textMuted:   '#4A5568',
};

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

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {icon}
        <label style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.textMuted }}>
          {label}
        </label>
      </div>
      {children}
    </div>
  );
}

export default function NotificationLogin() {
  const [mode,        setMode]        = useState<'login' | 'register'>('login');
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [name,        setName]        = useState('');
  const [phone,       setPhone]       = useState('');
  const [showPw,      setShowPw]      = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const navigate      = useNavigate();
  const { pushToast } = useToast();

  const switchMode = (m: 'login' | 'register') => { setMode(m); setServerError(null); };

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
        pushToast({ title: 'Dev Mode', message: 'Using mock token – notification backend is offline.', level: 'warning' });
      } else {
        pushToast({ title: 'Success', message: `${mode === 'login' ? 'Logged in' : 'Registered'} successfully.`, level: 'success' });
      }
      navigate('/notifications/history');
    } catch (error: unknown) {
      const axiosMsg = (error as any)?.response?.data?.message;
      const message  = axiosMsg || 'Unable to sign in. Please try again.';
      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  // ── FIX: was `return null` — now returns actual UI ───────────────────────
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#020817',
      padding: 16,
    }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: '100%',
          maxWidth: 420,
          background: T.card,
          border: `1px solid ${T.border}`,
          borderRadius: 24,
          padding: 32,
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: T.greenDim, border: `1px solid ${T.greenBorder}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px',
          }}>
            <Bell size={24} color={T.green} />
          </div>
          <h2 style={{ margin: 0, color: T.text, fontSize: 20, fontWeight: 700 }}>
            Notification Centre
          </h2>
          <p style={{ margin: '6px 0 0', color: T.textMuted, fontSize: 13 }}>
            {mode === 'login' ? 'Sign in to manage your alerts' : 'Create your notification account'}
          </p>
        </div>

        {/* Mode toggle */}
        <div style={{
          display: 'flex', background: 'rgba(255,255,255,0.04)',
          borderRadius: 12, padding: 4, marginBottom: 24,
        }}>
          {(['login', 'register'] as const).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              style={{
                flex: 1, padding: '8px 0', borderRadius: 9, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 600, transition: 'all 0.2s',
                background: mode === m ? T.greenDim : 'transparent',
                color: mode === m ? T.green : T.textMuted,
                outline: 'none',
              }}
            >
              {m === 'login' ? 'Sign in' : 'Register'}
            </button>
          ))}
        </div>

        {/* Error banner */}
        <AnimatePresence>
          {serverError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(248,113,113,0.1)', border: `1px solid rgba(248,113,113,0.25)`,
                borderRadius: 10, padding: '10px 12px', marginBottom: 16,
                color: T.red, fontSize: 12,
              }}
            >
              <AlertCircle size={14} />
              {serverError}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {mode === 'register' && (
            <Field label="Full name" icon={<User size={11} color={T.textMuted} />}>
              <input
                style={baseInput}
                type="text"
                placeholder="Jane Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={(e) => { e.target.style.borderColor = 'rgba(57,255,150,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(57,255,150,0.1)'; }}
                onBlur={(e)  => { e.target.style.borderColor = T.border; e.target.style.boxShadow = 'none'; }}
              />
            </Field>
          )}

          <Field label="Email" icon={<Mail size={11} color={T.textMuted} />}>
            <input
              style={baseInput}
              type="email"
              placeholder="you@example.com"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(57,255,150,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(57,255,150,0.1)'; }}
              onBlur={(e)  => { e.target.style.borderColor = T.border; e.target.style.boxShadow = 'none'; }}
            />
          </Field>

          <Field label="Password" icon={<Lock size={11} color={T.textMuted} />}>
            <div style={{ position: 'relative' }}>
              <input
                style={{ ...baseInput, paddingRight: 40 }}
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
                onFocus={(e) => { e.target.style.borderColor = 'rgba(57,255,150,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(57,255,150,0.1)'; }}
                onBlur={(e)  => { e.target.style.borderColor = T.border; e.target.style.boxShadow = 'none'; }}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: T.textMuted, padding: 0,
                }}
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </Field>

          {mode === 'register' && (
            <Field label="Phone (optional)" icon={<Phone size={11} color={T.textMuted} />}>
              <input
                style={baseInput}
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onFocus={(e) => { e.target.style.borderColor = 'rgba(57,255,150,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(57,255,150,0.1)'; }}
                onBlur={(e)  => { e.target.style.borderColor = T.border; e.target.style.boxShadow = 'none'; }}
              />
            </Field>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 8,
              padding: '13px 0',
              borderRadius: 12,
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 14,
              fontWeight: 700,
              background: loading ? 'rgba(57,255,150,0.4)' : T.green,
              color: '#020817',
              transition: 'all 0.2s',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}