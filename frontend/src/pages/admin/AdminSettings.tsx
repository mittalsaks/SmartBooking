import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store, MapPin, Clock, Image as ImageIcon,
  CheckCircle, AlertCircle, Save, ChevronRight,
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';

/* ─────────────────────────────────────
   DESIGN TOKENS — identical to Dashboard
───────────────────────────────────── */
const T = {
  bg:          '#070D1A',
  card:        'rgba(10,20,36,0.82)',
  border:      'rgba(255,255,255,0.07)',
  green:       '#39FF96',
  greenDim:    'rgba(57,255,150,0.09)',
  greenBorder: 'rgba(57,255,150,0.22)',
  cyan:        '#22D3EE',
  purple:      '#A78BFA',
  amber:       '#FCD34D',
  red:         '#F87171',
  text:        '#F0FDF4',
  textSec:     '#94A3B8',
  textMuted:   '#4A5568',
  textFaint:   '#2D3748',
};

const cardStyle: React.CSSProperties = {
  background: T.card,
  border: `1px solid ${T.border}`,
  borderRadius: 18,
  backdropFilter: 'blur(20px)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.28)',
};

/* ─────────────────────────────────────
   SECTION WRAPPER
───────────────────────────────────── */
interface SectionProps {
  icon: any;
  title: string;
  accent?: string;
  delay?: number;
  children: React.ReactNode;
}
function Section({ icon: Icon, title, accent = T.green, delay = 0, children }: SectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.34, 1.56, 0.64, 1] }}
      style={{ ...cardStyle, padding: 28, position: 'relative', overflow: 'hidden' }}
    >
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: -32, right: -32, width: 120, height: 120,
        borderRadius: '50%', background: accent, opacity: 0.04,
        filter: 'blur(28px)', pointerEvents: 'none',
      }} />

      {/* Section header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24,
        paddingBottom: 16, borderBottom: `1px solid ${T.border}`,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 11, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `${accent}13`, border: `1px solid ${accent}26`,
        }}>
          <Icon size={17} color={accent} strokeWidth={1.8} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: T.text, letterSpacing: '-0.01em' }}>
          {title}
        </span>
      </div>

      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────
   STYLED INPUT
───────────────────────────────────── */
interface FieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  type?: string;
  required?: boolean;
  accent?: string;
  children?: React.ReactNode; // for select
}
function Field({ label, name, value, onChange, type = 'text', required = false, accent = T.green, children }: FieldProps) {
  const [focused, setFocused] = useState(false);
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px 14px',
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 500,
    color: T.text,
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${focused ? accent + '50' : T.border}`,
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxShadow: focused ? `0 0 0 3px ${accent}12` : 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{
        fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
        textTransform: 'uppercase', color: T.textMuted,
      }}>
        {label}
      </label>
      {children ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ ...inputStyle, appearance: 'none' }}
        >
          {children}
        </select>
      ) : (
        <input
          required={required}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={inputStyle}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════ */
export default function AdminSettings() {
  const [loading,   setLoading]   = useState(false);
  const [fetching,  setFetching]  = useState(true);
  const [success,   setSuccess]   = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    id: 1,
    name: '',
    businessType: 'Restaurant',
    ownerName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    openingTime: '09:00',
    closingTime: '18:00',
    logoUrl: '',
  });

  const businessTypes = ['Restaurant', 'Gym', 'Salon', 'Clinic', 'Coaching', 'Turf', 'Other'];

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const response = await axiosClient.get('/business');
        const data = Array.isArray(response.data) ? response.data[0] : response.data;
        if (data) {
          setFormData({
            id: data.id || 1,
            name: data.name || '',
            businessType: data.businessType || 'Restaurant',
            ownerName: data.ownerName || '',
            phone: data.phone || '',
            email: data.email || '',
            address: data.address || '',
            city: data.city || '',
            openingTime: data.openingTime || '09:00',
            closingTime: data.closingTime || '18:00',
            logoUrl: data.logoUrl || '',
          });
        }
      } catch (error) {
        console.error('Failed to load business profile', error);
      } finally {
        setFetching(false);
      }
    };
    fetchBusiness();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setSuccess(false);
    setSaveError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setSaveError(null);

    const payload: any = {
      id: formData.id,
      name: formData.name,
      businessType: formData.businessType,
      ownerName: formData.ownerName,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      city: formData.city,
      openingTime: formData.openingTime,
      closingTime: formData.closingTime,
    };
    if (formData.logoUrl) payload.logoUrl = formData.logoUrl;

    try {
      await axiosClient.put(`/business/${formData.id}`, payload);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.response?.data ||
        'Failed to save profile. Please check all fields and try again.';
      setSaveError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div style={{ padding: 40, color: T.textMuted, fontSize: 13, fontWeight: 600 }}>
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        >
          Loading profile data...
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100%', background: 'transparent' }}>

      {/* Ambient top glow — same as Dashboard */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse 80% 40% at 50% -5%, rgba(57,255,150,0.06) 0%, transparent 70%)',
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 860, margin: '0 auto', padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={{ marginBottom: 4 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(57,255,150,0.6)' }}>
              Admin Portal
            </span>
            <ChevronRight size={11} color={T.textFaint} />
            <span style={{ fontSize: 10, color: T.textMuted }}>Settings</span>
          </div>
          <h1 style={{
            fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: -0.5, lineHeight: 1.15,
            background: 'linear-gradient(135deg, #F7FAFC 30%, #39FF96 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            Business <span style={{ fontWeight: 300 }}>Profile</span>
          </h1>
          <p style={{ fontSize: 11, color: T.textMuted, marginTop: 5 }}>
            Manage your public storefront details and operating hours.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* ── Logo Upload ── */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ ...cardStyle, padding: 24, display: 'flex', alignItems: 'center', gap: 24 }}
          >
            {/* Clickable logo zone */}
            <motion.div
              whileHover={{ scale: 1.04, borderColor: T.green }}
              whileTap={{ scale: 0.97 }}
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: 88, height: 88, borderRadius: 18, flexShrink: 0,
                background: T.greenDim,
                border: `2px dashed ${T.greenBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.2s',
                boxShadow: `0 0 24px rgba(57,255,150,0.08)`,
              }}
            >
              {formData.logoUrl ? (
                <img src={formData.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ textAlign: 'center', padding: 8 }}>
                  <ImageIcon size={22} color={T.green} strokeWidth={1.5} />
                  <span style={{ display: 'block', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.green, marginTop: 5 }}>
                    Upload
                  </span>
                </div>
              )}
            </motion.div>

            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/*"
              onChange={handleFileChange}
            />

            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: T.text, margin: '0 0 4px' }}>Business Logo</p>
              <p style={{ fontSize: 11, color: T.textMuted, margin: 0 }}>Click the box to upload a PNG or JPG.</p>
              {formData.logoUrl && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setFormData(p => ({ ...p, logoUrl: '' }))}
                  style={{
                    marginTop: 8, fontSize: 10, fontWeight: 700, color: T.red,
                    background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
                    borderRadius: 8, padding: '3px 10px', cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  Remove
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* ── Core Information ── */}
          <Section icon={Store} title="Core Information" accent={T.green} delay={0.16}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Business Name"  name="name"         value={formData.name}         onChange={handleChange} required accent={T.green} />
              <Field label="Business Type"  name="businessType" value={formData.businessType} onChange={handleChange} accent={T.green}>
                {businessTypes.map(t => <option key={t} value={t} style={{ background: '#0d1b2e' }}>{t}</option>)}
              </Field>
              <div style={{ gridColumn: '1 / -1' }}>
                <Field label="Owner Name" name="ownerName" value={formData.ownerName} onChange={handleChange} required accent={T.green} />
              </div>
            </div>
          </Section>

          {/* ── Contact & Location ── */}
          <Section icon={MapPin} title="Contact & Location" accent={T.cyan} delay={0.24}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Phone"   name="phone"   value={formData.phone}   onChange={handleChange} type="tel"   required accent={T.cyan} />
              <Field label="Email"   name="email"   value={formData.email}   onChange={handleChange} type="email" required accent={T.cyan} />
              <div style={{ gridColumn: '1 / -1' }}>
                <Field label="Address" name="address" value={formData.address} onChange={handleChange} required accent={T.cyan} />
              </div>
              <Field label="City" name="city" value={formData.city} onChange={handleChange} required accent={T.cyan} />
            </div>
          </Section>

          {/* ── Operating Hours ── */}
          <Section icon={Clock} title="Operating Hours" accent={T.purple} delay={0.32}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Opening Time" name="openingTime" value={formData.openingTime} onChange={handleChange} type="time" required accent={T.purple} />
              <Field label="Closing Time" name="closingTime" value={formData.closingTime} onChange={handleChange} type="time" required accent={T.purple} />
            </div>
          </Section>

          {/* ── Save Row ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12, paddingBottom: 40 }}
          >
            {/* Success toast */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '8px 16px', borderRadius: 12, fontSize: 12, fontWeight: 600,
                    background: T.greenDim, border: `1px solid ${T.greenBorder}`, color: T.green,
                  }}
                >
                  <CheckCircle size={14} />
                  Profile saved successfully!
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error toast */}
            <AnimatePresence>
              {saveError && (
                <motion.div
                  initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '8px 16px', borderRadius: 12, fontSize: 12, fontWeight: 600, maxWidth: 340, textAlign: 'right',
                    background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', color: T.red,
                  }}
                >
                  <AlertCircle size={14} style={{ flexShrink: 0 }} />
                  {saveError}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Save button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={loading ? {} : { scale: 1.03, y: -1 }}
              whileTap={loading ? {} : { scale: 0.97 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 22px', borderRadius: 13,
                background: loading ? 'rgba(57,255,150,0.3)' : 'linear-gradient(135deg,#39FF96,#22C55E)',
                color: '#050D18', fontWeight: 700, fontSize: 13, border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                boxShadow: loading ? 'none' : '0 0 22px rgba(57,255,150,0.3)',
                transition: 'all 0.2s',
              }}
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                >
                  <Save size={15} strokeWidth={2.5} />
                </motion.div>
              ) : (
                <Save size={15} strokeWidth={2.5} />
              )}
              {loading ? 'Saving...' : 'Save Profile Changes'}
            </motion.button>
          </motion.div>
        </form>

      </div>
    </div>
  );
}