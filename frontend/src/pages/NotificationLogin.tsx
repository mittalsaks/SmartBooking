/**
 * NotificationLogin.tsx — restyled to match Dashboard dark aesthetic
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Mail, Lock, User, Phone,
  Eye, EyeOff, WifiOff, ChevronRight,
} from 'lucide-react';
import { loginNotificationUser, registerNotificationUser } from '../services/notificationApi';
import { useToast } from '../components/ToastProvider';

/* ─────────────────────────────────────
   DESIGN TOKENS — same as Dashboard
───────────────────────────────────── */
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

/* ── shared input style ── */
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

/* ── field wrapper ── */
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

/* ══════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════ */
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
      const message   = isError ? error.message : axiosMsg || 'Unable to sign in. Please try again.';
      const isOffline = message.includes('offline') || message.includes('port 4000');

      if (isOffline) setServerError(message);
      else pushToast({ title: 'Error', message, level: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Single return with all JSX inside
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#050D18',
      padding: '24px 16px',
      fontFamily: 'inherit',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        style={{
          width: '100%', maxWidth: 440,
          background: T.card,
          border: `1px solid ${T.border}`,
          borderRadius: 24,
          backdropFilter: 'blur(24px)',
          boxShadow: '0 8px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(57,255,150,0.04)',
          padding: '40px 36px',
          position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Top glow line */}
        <div style={{
          position: 'absolute', top: 0, left: '20%', right: '20%', height: 1,
          background: `linear-gradient(90deg, transparent, ${T.green}, transparent)`,
          opacity: 0.6,
        }} />

        {/* Bell icon */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
            style={{
              width: 52, height: 52, borderRadius: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: T.greenDim, border: `1px solid ${T.greenBorder}`,
              boxShadow: '0 0 28px rgba(57,255,150,0.12)',
            }}
          >
            <Bell size={22} color={T.green} strokeWidth={1.8} />
          </motion.div>
        </div>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginBottom: 8 }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(57,255,150,0.55)' }}>
            SmartBooking
          </span>
          <ChevronRight size={10} color={T.textMuted} />
          <span style={{ fontSize: 9, color: T.textMuted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Notifications</span>
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: 20, fontWeight: 800, textAlign: 'center', margin: '0 0 6px',
          letterSpacing: -0.4,
          background: 'linear-gradient(135deg, #F7FAFC 30%, #39FF96 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>
          Notification <span style={{ fontWeight: 300 }}>Portal</span>
        </h2>
        <p style={{ fontSize: 11, color: T.textMuted, textAlign: 'center', margin: '0 0 24px' }}>
          Secure access to notification history and preferences.
        </p>

        {/* Offline error banner */}
        <AnimatePresence>
          {serverError && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              style={{
                marginBottom: 20, padding: '12px 14px', borderRadius: 14,
                background: 'rgba(248,113,113,0.07)',
                border: '1px solid rgba(248,113,113,0.22)',
                display: 'flex', alignItems: 'flex-start', gap: 10,
              }}
            >
              <WifiOff size={15} color={T.red} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: T.red, margin: '0 0 3px' }}>
                  Notification Service Offline
                </p>
                <p style={{ fontSize: 11, color: 'rgba(248,113,113,0.7)', margin: '0 0 6px', lineHeight: 1.5 }}>
                  {serverError}
                </p>
                <p style={{ fontSize: 10, color: T.textMuted, margin: 0 }}>
                  Run <code style={{ padding: '1px 5px', borderRadius: 5, background: 'rgba(255,255,255,0.06)', fontFamily: 'monospace', fontSize: 9 }}>npm run dev</code> in your{' '}
                  <code style={{ padding: '1px 5px', borderRadius: 5, background: 'rgba(255,255,255,0.06)', fontFamily: 'monospace', fontSize: 9 }}>notification-service</code> folder, then retry.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mode tabs */}
        <div style={{
          display: 'flex', gap: 4, marginBottom: 24,
          padding: 4, borderRadius: 14,
          background: 'rgba(255,255,255,0.03)',
          border: `1px solid ${T.border}`,
        }}>
          {(['login', 'register'] as const).map(m => (
            <motion.button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              whileTap={{ scale: 0.97 }}
              style={{
                flex: 1, padding: '9px 0', borderRadius: 11, border: 'none',
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'inherit', transition: 'all 0.18s',
                background: mode === m ? T.greenDim : 'transparent',
                color: mode === m ? T.green : T.textMuted,
                boxShadow: mode === m ? `inset 0 0 0 1px ${T.greenBorder}` : 'none',
              }}
            >
              {m === 'login' ? 'Login' : 'Register'}
            </motion.button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <AnimatePresence>
            {mode === 'register' && (
              <motion.div
                key="name"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22 }}
              >
                <Field label="Full Name" icon={<User size={13} color={T.textMuted} />}>
                  <input
                    value={name} onChange={e => setName(e.target.value)}
                    required type="text" placeholder="Jane Doe"
                    style={baseInput}
                    onFocus={e => applyFocus(e.currentTarget)}
                    onBlur={e => removeFocus(e.currentTarget)}
                  />
                </Field>
              </motion.div>
            )}
          </AnimatePresence>

          <Field label="Email Address" icon={<Mail size={13} color={T.textMuted} />}>
            <input
              value={email} onChange={e => setEmail(e.target.value)}
              required type="email" placeholder="hello@example.com"
              style={baseInput}
              onFocus={e => applyFocus(e.currentTarget)}
              onBlur={e => removeFocus(e.currentTarget)}
            />
          </Field>

          <Field label="Password" icon={<Lock size={13} color={T.textMuted} />}>
            <div style={{ position: 'relative' }}>
              <input
                value={password} onChange={e => setPassword(e.target.value)}
                required type={showPw ? 'text' : 'password'} placeholder="••••••••"
                style={{ ...baseInput, paddingRight: 42 }}
                onFocus={e => applyFocus(e.currentTarget)}
                onBlur={e => removeFocus(e.currentTarget)}
              />
              <button
                type="button" onClick={() => setShowPw(p => !p)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: T.textMuted, padding: 2,
                }}
              >
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </Field>

          <AnimatePresence>
            {mode === 'register' && (
              <motion.div
                key="phone"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22 }}
              >
                <Field label="Phone Number" icon={<Phone size={13} color={T.textMuted} />}>
                  <input
                    value={phone} onChange={e => setPhone(e.target.value)}
                    type="tel" placeholder="+91 98765 43210"
                    style={baseInput}
                    onFocus={e => applyFocus(e.currentTarget)}
                    onBlur={e => removeFocus(e.currentTarget)}
                  />
                </Field>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={loading ? {} : { scale: 1.02, y: -1 }}
            whileTap={loading ? {} : { scale: 0.98 }}
            style={{
              marginTop: 6,
              width: '100%', padding: '13px',
              borderRadius: 14, border: 'none',
              background: loading
                ? 'rgba(57,255,150,0.25)'
                : 'linear-gradient(135deg,#39FF96,#22C55E)',
              color: '#050D18',
              fontWeight: 800, fontSize: 13,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              boxShadow: loading ? 'none' : '0 0 28px rgba(57,255,150,0.28)',
              transition: 'all 0.2s',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            {loading
              ? <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1, repeat: Infinity }}>Processing…</motion.span>
              : mode === 'login' ? 'Sign In' : 'Create Account'
            }
          </motion.button>
        </form>

        {/* Bottom glow */}
        <div style={{
          position: 'absolute', bottom: 0, left: '30%', right: '30%', height: 1,
          background: `linear-gradient(90deg, transparent, rgba(57,255,150,0.15), transparent)`,
        }} />
      </motion.div>
    </div>
  );
}