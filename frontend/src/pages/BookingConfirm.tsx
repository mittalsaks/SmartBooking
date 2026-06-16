import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axiosClient from '../api/axiosClient';
import { sendNotification } from '../services/notificationApi';
import {
  ArrowLeft, User, Phone, Mail, Users, FileText,
  CheckCircle, Calendar, Clock, Building2, Zap,
  AlertCircle, Hash, Loader2, ChevronRight,
} from 'lucide-react';

/* ─────────────────── Design Tokens ─────────────────── */
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
  borderRadius: 20,
  backdropFilter: 'blur(20px)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
  overflow: 'hidden',
};

/* ─────────────────── Types ─────────────────── */
interface SlotInfo {
  id: number;
  offerId: number;
  offerTitle: string;
  businessName: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  availableCount: number;
  capacity: number;
  offerPrice: number;
  originalPrice: number;
  maxBookingPerCustomer: number;
}

interface BookingResult {
  id: number;
  bookingReference: string;
  referenceNumber?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  offerTitle: string;
  businessName: string;
  slotDate: string;
  slotStartTime: string;
  slotEndTime: string;
  peopleCount: number;
  status: string;
  offerPrice: number;
}

interface FormState {
  customerName:  string;
  customerPhone: string;
  customerEmail: string;
  peopleCount:   number;
  specialNote:   string;
}

interface FormErrors {
  customerName?:  string;
  customerPhone?: string;
  customerEmail?: string;
  peopleCount?:   string;
  general?:       string;
}

/* ─────────────────── Helpers ─────────────────── */
function formatTime(t?: string): string {
  if (!t) return '—';
  const parts = t.split(':');
  if (parts.length < 2) return t;
  const h = parseInt(parts[0]);
  return `${h % 12 === 0 ? 12 : h % 12}:${parts[1]} ${h >= 12 ? 'PM' : 'AM'}`;
}

function formatDate(d: string): string {
  try {
    return new Date(d).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  } catch { return d; }
}

/* ─────────────────── Input style ─────────────────── */
const inputStyle = (focused: boolean, hasError: boolean): React.CSSProperties => ({
  width: '100%',
  padding: '11px 14px',
  borderRadius: 12,
  fontSize: 13,
  fontWeight: 500,
  color: T.text,
  background: 'rgba(255,255,255,0.04)',
  border: `1px solid ${hasError ? 'rgba(248,113,113,0.5)' : focused ? 'rgba(57,255,150,0.4)' : T.border}`,
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box' as const,
});

/* ─────────────────── Field wrapper ─────────────────── */
function Field({
  label, icon: Icon, required, error, children,
}: {
  label: string; icon: React.ElementType;
  required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{
        display: 'flex', alignItems: 'center', gap: 5,
        fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const,
        letterSpacing: '0.08em', color: T.textMuted,
      }}>
        <Icon size={11} />
        {label}
        {required && <span style={{ color: T.red }}>*</span>}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ fontSize: 11, color: T.red, display: 'flex', alignItems: 'center', gap: 4, margin: 0 }}>
            <AlertCircle size={10} /> {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────── Confirmation Page ─────────────────── */
function ConfirmationPage({ booking, onBack }: { booking: BookingResult; onBack: () => void }) {
  const ref = booking.bookingReference || booking.referenceNumber || `#${booking.id}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      style={{ maxWidth: 560, margin: '0 auto' }}
    >
      <div style={{ ...cardStyle }}>
        {/* Top accent */}
        <div style={{ height: 3, background: `linear-gradient(90deg, ${T.green}, ${T.cyan})` }} />

        {/* Hero */}
        <div style={{
          padding: '40px 32px 28px', textAlign: 'center',
          borderBottom: `1px solid ${T.border}`,
          background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(57,255,150,0.06) 0%, transparent 70%)',
        }}>
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.15 }}
            style={{
              width: 72, height: 72, borderRadius: '50%', margin: '0 auto 20px',
              background: 'rgba(57,255,150,0.12)', border: `2px solid ${T.greenBorder}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 40px rgba(57,255,150,0.2)',
            }}
          >
            <CheckCircle size={34} color={T.green} strokeWidth={2} />
          </motion.div>

          <h1 style={{
            fontSize: 24, fontWeight: 800, margin: '0 0 8px', letterSpacing: -0.5,
            background: `linear-gradient(135deg, #F7FAFC 40%, ${T.green} 100%)`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            Booking Confirmed!
          </h1>
          <p style={{ fontSize: 13, color: T.textMuted, margin: 0 }}>
            Your reservation has been successfully placed.
          </p>

          {/* Reference number */}
          <div style={{
            marginTop: 20, padding: '14px 20px', borderRadius: 14,
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: T.greenDim, border: `1px solid ${T.greenBorder}`,
          }}>
            <Hash size={16} color={T.green} />
            <div style={{ textAlign: 'left' }}>
              <p style={{
                fontSize: 9, fontWeight: 700, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: 'rgba(57,255,150,0.6)', margin: '0 0 2px',
              }}>Booking Reference</p>
              <p style={{ fontSize: 20, fontWeight: 800, fontFamily: 'monospace', color: T.green, margin: 0 }}>
                {ref}
              </p>
            </div>
          </div>
        </div>

        {/* Detail rows */}
        <div style={{ padding: '24px 32px' }}>
          {[
            { icon: FileText,    label: 'Offer',    value: booking.offerTitle },
            { icon: Building2,   label: 'Business', value: booking.businessName },
            { icon: Calendar,    label: 'Date',     value: formatDate(booking.slotDate) },
            {
              icon: Clock, label: 'Time',
              value: `${formatTime(booking.slotStartTime)} – ${formatTime(booking.slotEndTime)}`,
            },
            { icon: User,        label: 'Customer', value: booking.customerName },
            { icon: Users,       label: 'People',   value: String(booking.peopleCount) },
            { icon: CheckCircle, label: 'Status',   value: booking.status, highlight: true },
          ].map(({ icon: Icon, label, value, highlight }) => (
            <div key={label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '11px 0', borderBottom: `1px solid rgba(255,255,255,0.05)`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon size={13} color={T.textMuted} />
                <span style={{ fontSize: 12, color: T.textMuted, fontWeight: 600 }}>{label}</span>
              </div>
              {highlight ? (
                <span style={{
                  padding: '3px 10px', borderRadius: 99, fontSize: 10, fontWeight: 800,
                  background: T.greenDim, border: `1px solid ${T.greenBorder}`, color: T.green,
                }}>{value}</span>
              ) : (
                <span style={{
                  fontSize: 13, color: T.text, fontWeight: 600,
                  textAlign: 'right', maxWidth: '58%',
                }}>{value}</span>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: '0 32px 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{
            padding: '12px 16px', borderRadius: 12, textAlign: 'center',
            background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.18)',
            fontSize: 11, color: T.cyan, lineHeight: 1.6,
          }}>
            📩 Save your booking reference. Show it at the venue to redeem your offer.
          </div>
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
            onClick={onBack}
            style={{
              width: '100%', padding: '13px', borderRadius: 14, border: 'none',
              background: `linear-gradient(135deg, ${T.green}, #22C55E)`,
              color: '#050D18', fontSize: 14, fontWeight: 800,
              cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              boxShadow: '0 0 24px rgba(57,255,150,0.25)',
            }}
          >
            Browse More Deals <ChevronRight size={16} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
export default function BookingConfirm() {
  const { slotId } = useParams<{ slotId: string }>();
  const navigate   = useNavigate();

  const [slot,       setSlot]       = useState<SlotInfo | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed,  setConfirmed]  = useState<BookingResult | null>(null);
  const [errors,     setErrors]     = useState<FormErrors>({});
  const [focused,    setFocused]    = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    customerName:  '',
    customerPhone: '',
    customerEmail: '',
    peopleCount:   1,
    specialNote:   '',
  });

  /* ── Load slot + offer info ── */
  useEffect(() => {
    if (!slotId) return;
    (async () => {
      try {
        /* Step 1: fetch the slot directly */
        const slotRes = await axiosClient.get(`/slots/${slotId}`);
        const s = slotRes.data;

        /* Step 2: fetch the parent offer for pricing + business info */
        let offerData: any = {};
        try {
          const offerRes = await axiosClient.get(`/offers/${s.offerId}`);
          offerData = offerRes.data;
        } catch { /* offer info is enrichment only — fail gracefully */ }

        setSlot({
          id:                    s.id,
          offerId:               s.offerId,
          offerTitle:            offerData.title             ?? s.offerTitle        ?? 'Offer',
          businessName:          offerData.businessName      ?? s.businessName      ?? '',
          slotDate:              s.slotDate,
          startTime:             s.startTime,
          endTime:               s.endTime,
          availableCount:        s.availableCount            ?? s.available         ?? 0,
          capacity:              s.capacity,
          offerPrice:            offerData.offerPrice        ?? s.offerPrice        ?? 0,
          originalPrice:         offerData.originalPrice     ?? s.originalPrice     ?? 0,
          maxBookingPerCustomer: offerData.maxBookingPerCustomer ?? 5,
        });
      } catch {
        setErrors({ general: 'Could not load slot details. Please go back and try again.' });
      } finally {
        setLoading(false);
      }
    })();
  }, [slotId]);

  /* ── Validation ── */
  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!form.customerName.trim())
      e.customerName = 'Full name is required.';
    if (!form.customerPhone.trim())
      e.customerPhone = 'Phone number is required.';
    else if (!/^\+?[\d\s\-()\u0966-\u096F]{7,20}$/.test(form.customerPhone.trim()))
      e.customerPhone = 'Enter a valid phone number.';
    if (form.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail))
      e.customerEmail = 'Enter a valid email address.';
    if (form.peopleCount < 1)
      e.peopleCount = 'At least 1 person required.';
    if (slot && form.peopleCount > slot.availableCount)
      e.peopleCount = `Only ${slot.availableCount} seat(s) available.`;
    if (slot && form.peopleCount > slot.maxBookingPerCustomer)
      e.peopleCount = `Max ${slot.maxBookingPerCustomer} people per booking.`;
    return e;
  };

  /* ── Submit ── */
  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);
    try {
      const payload: Record<string, any> = {
        slotId:        Number(slotId),
        offerId:       slot?.offerId ?? 0,
        customerName:  form.customerName.trim(),
        customerPhone: form.customerPhone.trim(),
        peopleCount:   form.peopleCount,
      };
      if (form.customerEmail.trim()) payload.customerEmail = form.customerEmail.trim();
      if (form.specialNote.trim())   payload.specialNote   = form.specialNote.trim();

      const res = await axiosClient.post('/bookings', payload);
      const handleSubmit = async () => {
  const errs = validate();
  if (Object.keys(errs).length > 0) { setErrors(errs); return; }
  setErrors({});
  setSubmitting(true);
  try {
    const payload: Record<string, any> = {
      slotId:        Number(slotId),
      offerId:       slot?.offerId ?? 0,
      customerName:  form.customerName.trim(),
      customerPhone: form.customerPhone.trim(),
      peopleCount:   form.peopleCount,
    };
    if (form.customerEmail.trim()) payload.customerEmail = form.customerEmail.trim();
    if (form.specialNote.trim())   payload.specialNote   = form.specialNote.trim();

    const res = await axiosClient.post('/bookings', payload);

    // ✅ WhatsApp notification — fire and forget (booking cancel nahi hogi agar fail ho)
    sendNotification({
      userId:  0,           // guest booking hai toh 0, agar userId available ho toh woh do
      type:    'booking_confirmation',
      channel: 'email',
      data: {
        customerName:  form.customerName.trim(),
        customerEmail: form.customerEmail.trim(),
        bookingRef:    res.data.bookingReference || res.data.referenceNumber || `#${res.data.id}`,
        offerTitle:    slot?.offerTitle    ?? '',
        businessName:  slot?.businessName  ?? '',
        slotDate:      slot?.slotDate      ?? '',
        startTime:     slot?.startTime     ?? '',
        endTime:       slot?.endTime       ?? '',
        peopleCount:   form.peopleCount,
        offerPrice:    slot?.offerPrice    ?? 0,
      },
    }).catch(err => console.warn('[WhatsApp] Notification failed silently:', err));

    setConfirmed(res.data);
  } catch (err: any) {
    const raw = err?.response?.data;
    const msg =
      typeof raw === 'string' ? raw :
      raw?.message            ? raw.message :
      raw?.error              ? raw.error :
      'Booking failed. Please try again.';
    setErrors({ general: msg });
  } finally {
    setSubmitting(false);
  }
};
      setConfirmed(res.data);
    } catch (err: any) {
      const raw = err?.response?.data;
      const msg =
        typeof raw === 'string'   ? raw :
        raw?.message              ? raw.message :
        raw?.error                ? raw.error :
        'Booking failed. Please try again.';
      setErrors({ general: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const setField = (k: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const val = k === 'peopleCount' ? Math.max(1, Number(e.target.value)) : e.target.value;
      setForm(f => ({ ...f, [k]: val }));
      setErrors(prev => ({ ...prev, [k]: undefined, general: undefined }));
    };

  /* ─── Loading ─── */
  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{
            width: 36, height: 36, borderRadius: '50%', margin: '0 auto 12px',
            border: `3px solid rgba(57,255,150,0.2)`, borderTopColor: T.green,
          }}
        />
        <p style={{ color: T.textMuted, fontSize: 13, fontWeight: 600 }}>Loading slot details…</p>
      </div>
    </div>
  );

  /* ─── Slot load failed ─── */
  if (!slot && errors.general) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <div style={{ ...cardStyle, padding: 32, textAlign: 'center', maxWidth: 420 }}>
        <AlertCircle size={36} color={T.red} style={{ margin: '0 auto 14px' }} />
        <p style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 16 }}>{errors.general}</p>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => navigate(-1)}
          style={{
            padding: '10px 20px', borderRadius: 12, border: 'none',
            background: `linear-gradient(135deg, ${T.green}, #22C55E)`,
            color: '#050D18', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
          }}>
          Go Back
        </motion.button>
      </div>
    </div>
  );

  /* ─── Confirmation ─── */
  if (confirmed) return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
      <ConfirmationPage booking={confirmed} onBack={() => navigate('/')} />
    </div>
  );

  /* ─── Booking Form ─── */
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px', position: 'relative' }}>

      {/* Ambient glow */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse 80% 40% at 50% -5%, rgba(57,255,150,0.04) 0%, transparent 70%)',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -3 }}
          onClick={() => navigate(-1)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 12, fontWeight: 600, color: T.textMuted,
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'inherit', marginBottom: 24, padding: 0,
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = T.green}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = T.textMuted}
        >
          <ArrowLeft size={15} /> Back to Offer
        </motion.button>

        {/* Title */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 28 }}>
          <p style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: 'rgba(57,255,150,0.6)', marginBottom: 6,
          }}>⚡ Complete Your Booking</p>
          <h1 style={{
            fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: -0.5,
            background: `linear-gradient(135deg, #F7FAFC 40%, ${T.green} 100%)`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            Reserve Your Spot
          </h1>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>

          {/* ══ FORM (left) ══ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ ...cardStyle }}
          >
            <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${T.green}, transparent)`, opacity: 0.5 }} />

            <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 22 }}>
              <div>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: T.text, margin: '0 0 4px' }}>Your Details</h2>
                <p style={{ fontSize: 11, color: T.textMuted, margin: 0 }}>
                  Fields marked <span style={{ color: T.red }}>*</span> are required.
                </p>
              </div>

              {/* General error */}
              <AnimatePresence>
                {errors.general && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{
                      padding: '12px 16px', borderRadius: 12,
                      background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.3)',
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                    }}
                  >
                    <AlertCircle size={16} color={T.red} style={{ flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: 12, color: T.red, margin: 0, fontWeight: 600 }}>{errors.general}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Customer Name */}
              <Field label="Customer Name" icon={User} required error={errors.customerName}>
                <input
                  type="text" value={form.customerName}
                  onChange={setField('customerName')}
                  placeholder="Enter your full name"
                  onFocus={() => setFocused('name')} onBlur={() => setFocused(null)}
                  style={inputStyle(focused === 'name', !!errors.customerName)}
                />
              </Field>

              {/* Phone */}
              <Field label="Phone Number" icon={Phone} required error={errors.customerPhone}>
                <input
                  type="tel" value={form.customerPhone}
                  onChange={setField('customerPhone')}
                  placeholder="+91 98765 43210"
                  onFocus={() => setFocused('phone')} onBlur={() => setFocused(null)}
                  style={inputStyle(focused === 'phone', !!errors.customerPhone)}
                />
              </Field>

              {/* Email */}
              <Field label="Email Address" icon={Mail} error={errors.customerEmail}>
                <input
                  type="email" value={form.customerEmail}
                  onChange={setField('customerEmail')}
                  placeholder="you@email.com (optional)"
                  onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                  style={inputStyle(focused === 'email', !!errors.customerEmail)}
                />
              </Field>

              {/* People */}
              <Field label="Number of People" icon={Users} required error={errors.peopleCount}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <input
                    type="number" value={form.peopleCount}
                    onChange={setField('peopleCount')}
                    min={1} max={slot?.maxBookingPerCustomer ?? 20}
                    onFocus={() => setFocused('people')} onBlur={() => setFocused(null)}
                    style={{ ...inputStyle(focused === 'people', !!errors.peopleCount), width: 110 }}
                  />
                  <span style={{ fontSize: 11, color: T.textMuted }}>
                    Max {slot?.maxBookingPerCustomer ?? '—'} · {slot?.availableCount ?? '—'} seats left
                  </span>
                </div>
              </Field>

              {/* Special Note */}
              <Field label="Special Note" icon={FileText}>
                <textarea
                  value={form.specialNote}
                  onChange={setField('specialNote')}
                  placeholder="Any special requests… (optional)"
                  rows={3}
                  onFocus={() => setFocused('note')} onBlur={() => setFocused(null)}
                  style={{
                    ...inputStyle(focused === 'note', false),
                    resize: 'vertical', minHeight: 80, lineHeight: 1.6,
                  }}
                />
              </Field>

              {/* Selected slot summary */}
              <div style={{
                padding: '14px 16px', borderRadius: 14,
                background: T.greenDim, border: `1px solid ${T.greenBorder}`,
              }}>
                <p style={{
                  fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.1em', color: 'rgba(57,255,150,0.6)', margin: '0 0 10px',
                }}>Selected Slot</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Calendar size={13} color={T.green} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>
                      {slot ? formatDate(slot.slotDate) : '—'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Clock size={13} color={T.textMuted} />
                    <span style={{ fontSize: 12, color: T.textSec, fontFamily: 'monospace' }}>
                      {slot ? `${formatTime(slot.startTime)} – ${formatTime(slot.endTime)}` : '—'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <motion.button
                onClick={handleSubmit}
                disabled={submitting}
                whileHover={!submitting ? { scale: 1.02, y: -1 } : {}}
                whileTap={!submitting ? { scale: 0.98 } : {}}
                style={{
                  width: '100%', padding: '14px', borderRadius: 14, border: 'none',
                  background: submitting
                    ? 'rgba(57,255,150,0.3)'
                    : 'linear-gradient(135deg,#39FF96,#22C55E)',
                  color: '#050D18', fontSize: 15, fontWeight: 800,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: submitting ? 'none' : '0 0 28px rgba(57,255,150,0.3)',
                }}
              >
                {submitting
                  ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Confirming…</>
                  : <><Zap size={16} strokeWidth={2.5} /> Confirm Booking</>
                }
              </motion.button>
            </div>
          </motion.div>

          {/* ══ SUMMARY (right) ══ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            style={{ position: 'sticky', top: 24 }}
          >
            <div style={{ ...cardStyle }}>
              <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${T.cyan}, transparent)`, opacity: 0.5 }} />
              <div style={{ padding: '20px 22px' }}>
                <h2 style={{ fontSize: 13, fontWeight: 700, color: T.text, margin: '0 0 16px' }}>
                  Booking Summary
                </h2>

                {/* Offer name + business */}
                <div style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: 15, fontWeight: 800, color: T.text, margin: '0 0 3px', lineHeight: 1.3 }}>
                    {slot?.offerTitle ?? '—'}
                  </p>
                  <p style={{ fontSize: 12, color: T.textMuted, margin: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Building2 size={11} /> {slot?.businessName ?? '—'}
                  </p>
                </div>

                {/* Slot info */}
                <div style={{
                  padding: '12px 14px', borderRadius: 12, marginBottom: 16,
                  background: 'rgba(255,255,255,0.03)', border: `1px solid ${T.border}`,
                  display: 'flex', flexDirection: 'column', gap: 7,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Calendar size={12} color={T.textMuted} />
                    <span style={{ fontSize: 12, color: T.textSec, fontWeight: 600 }}>
                      {slot
                        ? new Date(slot.slotDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                        : '—'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Clock size={12} color={T.textMuted} />
                    <span style={{ fontSize: 12, color: T.textSec, fontFamily: 'monospace' }}>
                      {slot ? `${formatTime(slot.startTime)} – ${formatTime(slot.endTime)}` : '—'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Users size={12} color={T.textMuted} />
                    <span style={{ fontSize: 12, color: T.textSec }}>
                      {slot?.availableCount ?? '—'} of {slot?.capacity ?? '—'} seats available
                    </span>
                  </div>
                </div>

                {/* Pricing */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { label: 'Offer Price',    val: slot ? `₹${slot.offerPrice.toFixed(2)}` : '—',    color: T.text },
                    { label: 'Original Price', val: slot ? `₹${slot.originalPrice.toFixed(2)}` : '—', color: T.textMuted, strike: true },
                  ].map(({ label, val, color, strike }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span style={{ color: T.textMuted }}>{label}</span>
                      <span style={{ fontWeight: 700, color, textDecoration: strike ? 'line-through' : 'none' }}>{val}</span>
                    </div>
                  ))}
                  {slot && (
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      padding: '8px 12px', borderRadius: 10, marginTop: 2,
                      background: T.greenDim, border: `1px solid ${T.greenBorder}`, fontSize: 12,
                    }}>
                      <span style={{ fontWeight: 700, color: T.green }}>You Save</span>
                      <span style={{ fontWeight: 800, color: T.green }}>
                        ₹{(slot.originalPrice - slot.offerPrice).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                {/* People total */}
                {slot && form.peopleCount > 1 && (
                  <div style={{
                    marginTop: 12, padding: '10px 14px', borderRadius: 12, fontSize: 12,
                    background: 'rgba(167,139,250,0.07)', border: '1px solid rgba(167,139,250,0.2)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: T.textMuted }}>Total for {form.peopleCount} people</span>
                      <span style={{ fontWeight: 800, color: T.purple }}>
                        ₹{(slot.offerPrice * form.peopleCount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                <p style={{ fontSize: 10, color: T.textFaint, textAlign: 'center', marginTop: 16, lineHeight: 1.5 }}>
                  By confirming you agree to the offer's terms and conditions.
                </p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
