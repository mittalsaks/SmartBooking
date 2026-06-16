import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, User, Mail, Phone, Lock, Eye, EyeOff, AlertCircle, ChevronRight } from 'lucide-react';
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
  transition: 'all 0.2s ease',
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

export default function AdminRegister() {
  const navigate = useNavigate();
  const { pushToast } = useToast();

  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [city, setCity] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosClient.post('/Auth/register', {
        name: ownerName,
        email,
        phone,
        password,
        role: 1, // 1 = BusinessOwner
      });

      if (response.data?.isSuccess) {
        pushToast({
          title: 'Business Registered',
          message: 'Your account is ready. Redirecting to login...',
          level: 'success',
        });
        setTimeout(() => navigate('/admin/login'), 1500);
      } else {
        setError(response.data?.message || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to register. Please try again.');
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
      padding: '24px',
    }}>
      {/* Background orbs */}
      <div style={{
        position: 'absolute', top: '-15%', left: '10%',
        width: 500, height: 400, borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(57,255,150,0.06) 0%, transparent 70%)',
        filter: 'blur(50px)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', right: '10%',
        width: 350, height: 350, borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(34,211,238,0.05) 0%, transparent 70%)',
        filter: 'blur(50px)',
        pointerEvents: 'none',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          width: '100%',
          maxWidth: 460,
          background: T.card,
          border: `1px solid ${T.border}`,
          borderRadius: 24,
          backdropFilter: 'blur(24px)',
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

        {/* Building icon */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            style={{
              width: 56,
              height: 56,
              borderRadius: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: T.greenDim,
              border: `1px solid ${T.greenBorder}`,
            }}
          >
            <Building2 size={24} color={T.green} strokeWidth={1.8} />
          </motion.div>
        </div>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginBottom: 10 }}>
          <span style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'rgba(57,255,150,0.55)',
          }}>
            Business Portal
          </span>
          <ChevronRight size={10} color={T.textMuted} />
          <span style={{ fontSize: 9, color: T.textMuted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Register
          </span>
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: 22,
          fontWeight: 800,
          textAlign: 'center',
          margin: '0 0 28px',
          letterSpacing: -0.4,
          lineHeight: 1.2,
          background: `linear-gradient(135deg, ${T.text} 30%, ${T.green} 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          Register Your Business
        </h2>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 14px',
                borderRadius: 12,
                marginBottom: 20,
                background: 'rgba(248,113,113,0.08)',
                border: '1px solid rgba(248,113,113,0.25)',
                color: T.red,
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <AlertCircle size={14} style={{ flexShrink: 0 }} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
          {/* Owner Name */}
          <Field label="Owner Name" icon={<User size={14} />}>
            <input
              type="text"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="John Doe"
              required
              style={inputStyle}
              onFocus={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.borderColor = T.greenBorder;
              }}
              onBlur={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                e.currentTarget.style.borderColor = T.border;
              }}
            />
          </Field>

          {/* Email */}
          <Field label="Email" icon={<Mail size={14} />}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="business@example.com"
              required
              style={inputStyle}
              onFocus={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.borderColor = T.greenBorder;
              }}
              onBlur={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                e.currentTarget.style.borderColor = T.border;
              }}
            />
          </Field>

          {/* Phone */}
          <Field label="Phone" icon={<Phone size={14} />}>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              style={inputStyle}
              onFocus={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.borderColor = T.greenBorder;
              }}
              onBlur={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                e.currentTarget.style.borderColor = T.border;
              }}
            />
          </Field>

          {/* Password */}
          <Field label="Password" icon={<Lock size={14} />}>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                style={inputStyle}
                onFocus={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.borderColor = T.greenBorder;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.borderColor = T.border;
                }}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: T.textMuted,
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </Field>

          {/* Confirm Password */}
          <Field label="Confirm Password" icon={<Lock size={14} />}>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPw ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                style={inputStyle}
                onFocus={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.borderColor = T.greenBorder;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.borderColor = T.border;
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPw(!showConfirmPw)}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: T.textMuted,
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </Field>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 8,
              padding: '12px 16px',
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 700,
              background: T.green,
              color: '#000',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 8px 20px rgba(57,255,150,0.3)`;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {loading ? 'Registering...' : 'Register Business'}
          </button>
        </form>

        {/* Login link */}
        <div style={{
          marginTop: 20,
          textAlign: 'center',
          fontSize: 13,
          color: T.textMuted,
        }}>
          Already registered?{' '}
          <Link
            to="/admin/login"
            style={{
              color: T.green,
              textDecoration: 'none',
              fontWeight: 700,
              transition: 'opacity 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
