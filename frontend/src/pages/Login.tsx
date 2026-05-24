import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, Eye, EyeOff, AlertCircle, ChevronRight } from 'lucide-react';
import axiosClient from '../api/axiosClient';

/* ─────────────────────────────────────
   DESIGN TOKENS — identical to Dashboard
───────────────────────────────────── */
const T = {
  card:        'rgba(10,20,36,0.82)',
  border:      'rgba(255,255,255,0.07)',
  green:       '#39FF96',
  greenDim:    'rgba(57,255,150,0.09)',
  greenBorder: 'rgba(57,255,150,0.22)',
  red:         '#F87171',
  text:        '#F0FDF4',
  textSec:     '#94A3B8',
  textMuted:   '#4A5568',
};

export default function Login() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // ✅ validateStatus: accept both 200 and 401 — don't throw on 401
      // because the .NET backend returns 401 even when login is successful
      const response = await axiosClient.post(
        '/Auth/login',
        { email, password },
        { validateStatus: (status) => status < 500 }
      );

      const isSuccess =
        response.status === 200 ||
        response.data?.message === 'Login successful.' ||
        response.data?.token;

      if (isSuccess && response.data?.token) {
        // ✅ Store token and go to admin
        localStorage.setItem('token', response.data.token);
        navigate('/admin');
      } else if (isSuccess && !response.data?.token) {
        // Backend says success but no token returned — backend bug
        setError('Login succeeded but no token received. Please contact support.');
      } else {
        // Genuine auth failure
        setError(
          response.data?.message || 'Invalid email or password. Please try again.'
        );
      }
    } catch {
      setError('Unable to connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#070D1A',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Ambient glows */}
      <div style={{
        position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 300, borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(57,255,150,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', right: '20%',
        width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(34,211,238,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        style={{
          width: '100%', maxWidth: 420,
          background: T.card,
          border: `1px solid ${T.border}`,
          borderRadius: 24,
          backdropFilter: 'blur(24px)',
          boxShadow: '0 8px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(57,255,150,0.04)',
          padding: '40px 36px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Top glow line */}
        <div style={{
          position: 'absolute', top: 0, left: '20%', right: '20%', height: 1,
          background: `linear-gradient(90deg, transparent, ${T.green}, transparent)`,
          opacity: 0.6,
        }} />

        {/* Lock icon */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
            style={{
              width: 56, height: 56, borderRadius: 18,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: T.greenDim,
              border: `1px solid ${T.greenBorder}`,
              boxShadow: `0 0 28px rgba(57,255,150,0.12)`,
            }}
          >
            <Lock size={24} color={T.green} strokeWidth={1.8} />
          </motion.div>
        </div>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginBottom: 10 }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(57,255,150,0.55)' }}>
            Admin Portal
          </span>
          <ChevronRight size={10} color={T.textMuted} />
          <span style={{ fontSize: 9, color: T.textMuted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Secure Login</span>
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: 22, fontWeight: 800, textAlign: 'center', margin: '0 0 28px',
          letterSpacing: -0.4, lineHeight: 1.2,
          background: 'linear-gradient(135deg, #F7FAFC 30%, #39FF96 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>
          Admin Portal <span style={{ fontWeight: 300 }}>Login</span>
        </h2>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 14px', borderRadius: 12, marginBottom: 20,
                background: 'rgba(248,113,113,0.08)',
                border: '1px solid rgba(248,113,113,0.25)',
                color: T.red, fontSize: 12, fontWeight: 600,
              }}
            >
              <AlertCircle size={14} style={{ flexShrink: 0 }} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Email */}
          <FieldWrapper label="Email Address" icon={<Mail size={14} color={T.textMuted} />}>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@smartbooking.com"
              style={inputStyle}
              onFocus={e => applyFocus(e.currentTarget)}
              onBlur={e => removeFocus(e.currentTarget)}
            />
          </FieldWrapper>

          {/* Password */}
          <FieldWrapper label="Password" icon={<Lock size={14} color={T.textMuted} />}>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ ...inputStyle, paddingRight: 42 }}
                onFocus={e => applyFocus(e.currentTarget)}
                onBlur={e => removeFocus(e.currentTarget)}
              />
              <button
                type="button"
                onClick={() => setShowPw(p => !p)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: 2,
                  color: T.textMuted,
                }}
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </FieldWrapper>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={loading ? {} : { scale: 1.02, y: -1 }}
            whileTap={loading ? {} : { scale: 0.98 }}
            style={{
              marginTop: 8,
              width: '100%', padding: '13px',
              borderRadius: 14, border: 'none',
              background: loading
                ? 'rgba(57,255,150,0.25)'
                : 'linear-gradient(135deg,#39FF96,#22C55E)',
              color: '#050D18',
              fontWeight: 800, fontSize: 14,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              boxShadow: loading ? 'none' : '0 0 28px rgba(57,255,150,0.28)',
              transition: 'all 0.2s',
              letterSpacing: '0.02em',
            }}
          >
            {loading ? (
              <motion.span
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                Authenticating...
              </motion.span>
            ) : 'Sign In'}
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

/* ── helpers ── */
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: 12,
  fontSize: 13,
  fontWeight: 500,
  color: '#F0FDF4',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.07)',
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
  el.style.borderColor = 'rgba(255,255,255,0.07)';
  el.style.boxShadow   = 'none';
}

function FieldWrapper({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {icon}
        <label style={{
          fontSize: 9, fontWeight: 700, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: '#4A5568',
        }}>
          {label}
        </label>
      </div>
      {children}
    </div>
  );
}