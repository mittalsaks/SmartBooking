import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, User, Phone, Eye, EyeOff, AlertCircle, ChevronRight } from 'lucide-react';
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

export default function Register() {
  const navigate = useNavigate();
  const { pushToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosClient.post('/Auth/register', {
        name,
        email,
        phone,
        password,
        role: 2, // 0=Admin, 1=BusinessOwner, 2=Customer
      });

      if (response.status === 200) {
        pushToast({ title: 'Registered', message: 'Account created successfully.', level: 'success' });
        navigate('/customer-login');
      } else {
        setError(response.data?.message || 'Unable to register. Please try again.');
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Unable to register. Please try again.';
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
        style={{ width: '100%', maxWidth: 460, background: T.card, border: `1px solid ${T.border}`, borderRadius: 24, padding: 36, position: 'relative', overflow: 'hidden' }}>
        <div style={{ marginBottom: 26, textAlign: 'center' }}>
          <p style={{ margin: 0, color: T.textMuted, letterSpacing: '0.18em', fontSize: 11 }}>Customer Registration</p>
          <h1 style={{ margin: '14px 0 0', fontSize: 28, color: T.text }}>Create your account</h1>
          <p style={{ margin: '10px 0 0', color: T.textMuted, fontSize: 13 }}>Sign up to discover offers and book appointments fast.</p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} style={{ marginBottom: 18, padding: '12px 14px', borderRadius: 14, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', color: T.red, fontSize: 13 }}>
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
          <Field label="Name" icon={<User size={14} color={T.textMuted} />}>
            <input
              style={inputStyle}
              value={name}
              required
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Smith"
            />
          </Field>

          <Field label="Email" icon={<Mail size={14} color={T.textMuted} />}>
            <input
              style={inputStyle}
              type="email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
            />
          </Field>

          <Field label="Phone" icon={<Phone size={14} color={T.textMuted} />}>
            <input
              style={inputStyle}
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Optional phone number"
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
                placeholder="Create a password"
              />
              <button
                type="button"
                onClick={() => setShowPw((value) => !value)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', color: T.textMuted }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </Field>

          <Field label="Confirm Password" icon={<Lock size={14} color={T.textMuted} />}>
            <div style={{ position: 'relative' }}>
              <input
                style={{ ...inputStyle, paddingRight: 42 }}
                type={showConfirmPw ? 'text' : 'password'}
                value={confirmPassword}
                required
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPw((value) => !value)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', color: T.textMuted }}>
                {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </Field>

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '14px 0', borderRadius: 14, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 700, background: T.green, color: '#050D18', boxShadow: loading ? 'none' : '0 18px 44px rgba(57,255,150,0.16)' }}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: 'center', color: T.textMuted, fontSize: 13 }}>
          Already have an account?{' '}
          <Link to="/customer-login" style={{ color: T.green, fontWeight: 700, textDecoration: 'none' }}>Log in</Link>
        </div>
      </motion.div>
    </div>
  );
}
