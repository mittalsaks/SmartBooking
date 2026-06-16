import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { useToast } from '../components/ToastProvider';

const T = {
  card: 'rgba(10,20,36,0.82)',
  border: 'rgba(255,255,255,0.07)',
  green: '#39FF96',
  greenDim: 'rgba(57,255,150,0.09)',
  greenBorder: 'rgba(57,255,150,0.22)',
  red: '#F87171',
  text: '#F0FDF4',
  textMuted: '#94A3B8',
};

const inputStyle: React.CSSProperties = {
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: T.textMuted, fontSize: 12, fontWeight: 600 }}>
        {icon}
        <span>{label}</span>
      </div>
      {children}
    </div>
  );
}

export default function CustomerLogin() {
  const navigate = useNavigate();
  const { pushToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axiosClient.post('/Auth/login', { email, password });
      if (response.status === 200 && response.data?.token) {
        localStorage.setItem('customerToken', response.data.token);
        pushToast({ title: 'Welcome back', message: 'Login successful.', level: 'success' });
        navigate('/');
      } else {
        setError(response.data?.message || 'Invalid email or password.');
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Unable to login. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#070D1A' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: 440, background: T.card, border: `1px solid ${T.border}`, borderRadius: 24, padding: 36 }}>
        <div style={{ marginBottom: 26, textAlign: 'center' }}>
          <p style={{ margin: 0, color: T.textMuted, letterSpacing: '0.18em', fontSize: 11 }}>Customer Login</p>
          <h1 style={{ margin: '14px 0 0', fontSize: 28, color: T.text }}>Sign in to continue</h1>
          <p style={{ margin: '10px 0 0', color: T.textMuted, fontSize: 13 }}>Access your bookings and offers with a secure customer account.</p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} style={{ marginBottom: 18, padding: '12px 14px', borderRadius: 14, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', color: T.red, fontSize: 13 }}>
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
          <Field label="Email" icon={<Mail size={14} color={T.textMuted} />}>
            <input
              style={inputStyle}
              type="email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </Field>

          <Field label="Password" icon={<Lock size={14} color={T.textMuted} />}>
            <div style={{ position: 'relative' }}>
              <input
                style={{ ...inputStyle, paddingRight: 42 }}
                type={showPw ? 'text' : 'password'}
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPw((value) => !value)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', color: T.textMuted }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </Field>

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '14px 0', borderRadius: 14, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 700, background: T.green, color: '#050D18', boxShadow: loading ? 'none' : '0 18px 44px rgba(57,255,150,0.16)' }}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: T.textMuted, fontSize: 13 }}>
          <Link to="/register" style={{ color: T.green, fontWeight: 700, textDecoration: 'none' }}>Register</Link>
          <Link to="/forgot-password" style={{ color: T.green, fontWeight: 700, textDecoration: 'none' }}>Forgot password?</Link>
        </div>
      </motion.div>
    </div>
  );
}
