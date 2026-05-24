import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import axiosClient from '../api/axiosClient';
import {
  MapPin, Calendar, Clock, CheckCircle, ArrowLeft,
  AlertCircle, QrCode, Timer, ChevronRight, Zap,
} from 'lucide-react';

/* ─────────────────────────────────────
   IMAGE HELPER
───────────────────────────────────── */
const BACKEND_URL = 'http://localhost:5237';
const getImageUrl = (path?: string | null): string => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${BACKEND_URL}${path}`;
};

/* ─────────────────────────────────────
   DESIGN TOKENS
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
  borderRadius: 20,
  backdropFilter: 'blur(20px)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
};

/* ─────────────────────────────────────
   COUNTDOWN HOOK
───────────────────────────────────── */
function useCountdown(targetDate?: string) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; h: number; m: number; s: number; expired: boolean } | null>(null);
  useEffect(() => {
    if (!targetDate) return;
    const tick = () => {
      const end = targetDate.includes('T') ? new Date(targetDate) : new Date(`${targetDate}T23:59:59`);
      if (isNaN(end.getTime())) { setTimeLeft({ days: 0, h: 0, m: 0, s: 0, expired: true }); return; }
      const diff = end.getTime() - Date.now();
      if (diff <= 0) { setTimeLeft({ days: 0, h: 0, m: 0, s: 0, expired: true }); return; }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        h:    Math.floor((diff % 86400000) / 3600000),
        m:    Math.floor((diff % 3600000) / 60000),
        s:    Math.floor((diff % 60000) / 1000),
        expired: false,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return timeLeft;
}

function CountdownDisplay({ targetDate }: { targetDate?: string }) {
  const t = useCountdown(targetDate);
  if (!t) return <span style={{ color: T.textMuted, fontSize: 13 }}>—</span>;
  if (t.expired) return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: T.red, fontWeight: 700, fontSize: 13 }}>
      <Timer size={13} /> Expired
    </span>
  );
  return (
    <span style={{ fontSize: 14, fontWeight: 700, color: T.amber, fontVariantNumeric: 'tabular-nums' }}>
      {t.days > 0 && `${t.days}d `}{String(t.h).padStart(2,'0')}:{String(t.m).padStart(2,'0')}:{String(t.s).padStart(2,'0')}
    </span>
  );
}

/* ─────────────────────────────────────
   FORMAT TIME
───────────────────────────────────── */
function formatTime(timeStr?: string): string {
  if (!timeStr) return '—';
  const parts = timeStr.split(':');
  if (parts.length >= 2) {
    const h = parseInt(parts[0]);
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 === 0 ? 12 : h % 12}:${parts[1]} ${ampm}`;
  }
  return timeStr;
}

/* ─────────────────────────────────────
   TYPES
───────────────────────────────────── */
interface Offer {
  id: number; title: string; description: string;
  businessName: string; businessType: string;
  businessAddress: string; businessCity: string; businessLogoUrl?: string;
  category: string; originalPrice: number; offerPrice: number;
  discountPercentage: number; startDate: string; endDate: string;
  startTime: string; endTime: string; totalCapacity: number;
  maxBookingPerCustomer: number; availableSlotsCount: number;
  canBook: boolean; termsAndConditions: string; status: string; imageUrl?: string;
}
interface Slot {
  id: number; offerId: number; slotDate: string;
  startTime: string; endTime: string;
  capacity: number; bookedCount: number; availableCount: number; status: string;
}

/* ─────────────────────────────────────
   SECTION BLOCK
───────────────────────────────────── */
function Section({ title, children, accent = T.green }: { title?: string; children: React.ReactNode; accent?: string }) {
  return (
    <div style={{ padding: '24px 28px', borderBottom: `1px solid ${T.border}` }}>
      {title && (
        <h2 style={{ fontSize: 13, fontWeight: 700, color: T.text, margin: '0 0 16px', letterSpacing: '-0.01em' }}>
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}

/* ══════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════ */
export default function OfferDetail() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [offer,          setOffer]          = useState<Offer | null>(null);
  const [slots,          setSlots]          = useState<Slot[]>([]);
  const [fullSlots,      setFullSlots]      = useState<Slot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [loading,        setLoading]        = useState(true);
  const [slotsLoading,   setSlotsLoading]   = useState(true);
  const [error,          setError]          = useState<string | null>(null);
  const [showQR,         setShowQR]         = useState(false);
  const [waitlistMsg,    setWaitlistMsg]    = useState<string | null>(null);
  const [waitlistPhone,  setWaitlistPhone]  = useState('');
  const [waitlistSlotId, setWaitlistSlotId] = useState<number | null>(null);
  const [phoneFocused,   setPhoneFocused]   = useState(false);

  const offerUrl = `${window.location.origin}/offers/${id}`;

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const offerRes = await axiosClient.get(`/offers/${id}`);
        setOffer(offerRes.data);
        try {
          const slotsRes = await axiosClient.get(`/slots/offer/${id}`);
          if (Array.isArray(slotsRes.data)) {
            setSlots(slotsRes.data.filter((s: Slot) => s.status === 'Available'));
            setFullSlots(slotsRes.data.filter((s: Slot) => s.status === 'Full'));
          }
        } catch { setSlots([]); }
      } catch { setError('Failed to load offer details. Please try again.'); }
      finally { setLoading(false); setSlotsLoading(false); }
    };
    fetchDetails();
  }, [id]);

  const handleJoinWaitlist = () => {
    if (!waitlistPhone.trim()) { setWaitlistMsg('Please enter your phone number.'); return; }
    setWaitlistMsg(`You're on the waitlist! We'll notify you at ${waitlistPhone} if a spot opens.`);
    setWaitlistSlotId(null);
    setWaitlistPhone('');
  };

  const calculateDiscount = (original: number, offerPrice: number) =>
    Math.round(((original - offerPrice) / original) * 100);

  const handleBooking = () => {
    if (!selectedSlotId) { alert('Please select a time slot'); return; }
    navigate(`/booking/confirm/${selectedSlotId}`);
  };

  /* ── Loading ── */
  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${T.greenBorder}`, borderTopColor: T.green, margin: '0 auto 14px' }}
        />
        <p style={{ color: T.textMuted, fontSize: 13, fontWeight: 600 }}>Loading offer details...</p>
      </div>
    </div>
  );

  /* ── Error ── */
  if (error || !offer) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <div style={{ ...cardStyle, padding: 32, textAlign: 'center', maxWidth: 420 }}>
        <AlertCircle size={36} color={T.red} style={{ margin: '0 auto 14px' }} />
        <p style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 8 }}>{error || 'Offer not found'}</p>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/')}
          style={{
            padding: '10px 20px', borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg,#39FF96,#22C55E)',
            color: '#050D18', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >Back to Deals</motion.button>
      </div>
    </div>
  );

  const imageUrl = getImageUrl(offer.imageUrl);
  const discount = calculateDiscount(offer.originalPrice, offer.offerPrice);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px', position: 'relative' }}>

      {/* Ambient glow */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse 80% 40% at 50% -5%, rgba(57,255,150,0.05) 0%, transparent 70%)',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Back button ── */}
        <motion.button
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -3 }}
          onClick={() => navigate(-1)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 12, fontWeight: 600, color: T.textMuted,
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'inherit', marginBottom: 24, padding: 0,
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = T.green}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = T.textMuted}
        >
          <ArrowLeft size={15} /> Back to Deals
        </motion.button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>

          {/* ══ LEFT COLUMN ══ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            style={{ ...cardStyle, overflow: 'hidden' }}
          >
            {/* Hero image */}
            {imageUrl && (
              <div style={{ height: 280, overflow: 'hidden', position: 'relative' }}>
                <img
                  src={imageUrl} alt={offer.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(7,13,26,0.9) 0%, rgba(7,13,26,0.2) 50%, transparent 100%)',
                }} />
              </div>
            )}

            {/* Hero info */}
            <div style={{ padding: '24px 28px', borderBottom: `1px solid ${T.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  {/* Category + breadcrumb */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: 99, fontSize: 9, fontWeight: 700,
                      letterSpacing: '0.12em', textTransform: 'uppercase',
                      background: T.greenDim, border: `1px solid ${T.greenBorder}`, color: T.green,
                    }}>
                      {offer.category}
                    </span>
                    <ChevronRight size={10} color={T.textFaint} />
                    <span style={{ fontSize: 9, color: T.textMuted }}>{offer.businessType}</span>
                  </div>

                  <h1 style={{
                    fontSize: 26, fontWeight: 800, margin: '0 0 12px', letterSpacing: -0.5, lineHeight: 1.2,
                    background: 'linear-gradient(135deg, #F7FAFC 40%, #39FF96 100%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  }}>
                    {offer.title}
                  </h1>

                  {/* Business */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {offer.businessLogoUrl && (
                      <img src={getImageUrl(offer.businessLogoUrl)} alt={offer.businessName}
                        style={{ width: 34, height: 34, borderRadius: 10, objectFit: 'cover', border: `1px solid ${T.border}` }} />
                    )}
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: T.text, margin: 0 }}>{offer.businessName}</p>
                      <p style={{ fontSize: 11, color: T.textMuted, margin: 0 }}>{offer.businessType}</p>
                    </div>
                  </div>
                </div>

                {/* Discount + QR */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                  <div style={{
                    padding: '6px 14px', borderRadius: 99,
                    background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.3)',
                    fontSize: 15, fontWeight: 800, color: T.red,
                  }}>
                    -{discount}%
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setShowQR(v => !v)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '5px 12px', borderRadius: 10, border: `1px solid ${T.border}`,
                      background: showQR ? T.greenDim : 'rgba(255,255,255,0.03)',
                      color: showQR ? T.green : T.textMuted,
                      fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    <QrCode size={13} /> {showQR ? 'Hide QR' : 'Show QR'}
                  </motion.button>
                </div>
              </div>

              {/* QR Panel */}
              <AnimatePresence>
                {showQR && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.22 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{
                      marginTop: 20, padding: 20, borderRadius: 16,
                      background: 'rgba(255,255,255,0.03)', border: `1px solid ${T.border}`,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', width: 'fit-content',
                    }}>
                      <p style={{ fontSize: 10, color: T.textMuted, marginBottom: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        Scan to share this offer
                      </p>
                      <div style={{ padding: 12, background: '#fff', borderRadius: 12 }}>
                        <QRCodeSVG value={offerUrl} size={150} level="H" includeMargin />
                      </div>
                      <p style={{ fontSize: 9, color: T.textFaint, marginTop: 10, maxWidth: 160, textAlign: 'center', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                        {offerUrl}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Pricing */}
            <Section title="Pricing">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {[
                  { label: 'Offer Price',    val: `₹${offer.offerPrice.toFixed(2)}`,                       color: T.green,  accent: T.greenDim,               border: T.greenBorder },
                  { label: 'Original Price', val: `₹${offer.originalPrice.toFixed(2)}`,                    color: T.textSec, accent: 'rgba(255,255,255,0.03)', border: T.border,      strike: true },
                  { label: 'You Save',       val: `₹${(offer.originalPrice - offer.offerPrice).toFixed(2)}`, color: T.cyan,  accent: 'rgba(34,211,238,0.07)',  border: 'rgba(34,211,238,0.2)' },
                ].map(({ label, val, color, accent, border, strike }) => (
                  <div key={label} style={{
                    padding: '14px 16px', borderRadius: 14,
                    background: accent, border: `1px solid ${border}`,
                  }}>
                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.textMuted, marginBottom: 6 }}>{label}</p>
                    <p style={{
                      fontSize: 20, fontWeight: 800, color,
                      textDecoration: strike ? 'line-through' : 'none',
                      fontVariantNumeric: 'tabular-nums',
                    }}>{val}</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* Availability */}
            <Section title="Availability">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                  borderRadius: 14, background: T.greenDim, border: `1px solid ${T.greenBorder}`,
                }}>
                  <CheckCircle size={20} color={T.green} />
                  <div>
                    <p style={{ fontSize: 10, color: T.textMuted, margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Available Slots</p>
                    <p style={{ fontSize: 20, fontWeight: 800, color: T.text, margin: 0 }}>{offer.availableSlotsCount}</p>
                  </div>
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                  borderRadius: 14, background: 'rgba(252,211,77,0.07)', border: '1px solid rgba(252,211,77,0.2)',
                }}>
                  <Calendar size={20} color={T.amber} />
                  <div>
                    <p style={{ fontSize: 10, color: T.textMuted, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Expires In</p>
                    <CountdownDisplay targetDate={offer.endDate} />
                  </div>
                </div>
              </div>
            </Section>

            {/* About */}
            <Section title="About This Offer">
              <p style={{ fontSize: 13, color: T.textSec, lineHeight: 1.7, margin: '0 0 20px' }}>
                {offer.description || <em style={{ color: T.textMuted }}>No description provided.</em>}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {[
                  { label: 'Start Date', value: new Date(offer.startDate).toLocaleDateString() },
                  { label: 'End Date',   value: new Date(offer.endDate).toLocaleDateString() },
                  { label: 'Start Time', value: formatTime(offer.startTime) },
                  { label: 'End Time',   value: formatTime(offer.endTime) },
                ].map(({ label, value }) => (
                  <div key={label} style={{
                    padding: '12px 14px', borderRadius: 12,
                    background: 'rgba(255,255,255,0.03)', border: `1px solid ${T.border}`,
                  }}>
                    <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.textMuted, margin: '0 0 4px' }}>{label}</p>
                    <p style={{ fontSize: 12, fontWeight: 700, color: T.text, margin: 0 }}>{value}</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* Location */}
            {(offer.businessAddress || offer.businessCity) && (
              <Section>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)',
                  }}>
                    <MapPin size={15} color={T.purple} />
                  </div>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Location</p>
                    <p style={{ fontSize: 13, color: T.textSec, margin: 0 }}>
                      {offer.businessAddress}{offer.businessCity && `, ${offer.businessCity}`}
                    </p>
                  </div>
                </div>
              </Section>
            )}

            {/* Terms */}
            {offer.termsAndConditions && (
              <Section title="Terms & Conditions">
                <div style={{
                  padding: '14px 16px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.02)', border: `1px solid ${T.border}`,
                  fontSize: 12, color: T.textMuted, lineHeight: 1.7,
                  maxHeight: 160, overflowY: 'auto',
                }}>
                  {offer.termsAndConditions}
                </div>
              </Section>
            )}
          </motion.div>

          {/* ══ RIGHT: Booking Card ══ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12 }}
            style={{ position: 'sticky', top: 24 }}
          >
            <div style={{ ...cardStyle, overflow: 'hidden' }}>
              {/* Top glow line */}
              <div style={{
                height: 2,
                background: `linear-gradient(90deg, transparent, ${T.green}, transparent)`,
                opacity: 0.5,
              }} />

              <div style={{ padding: 22 }}>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: T.text, margin: '0 0 18px' }}>
                  Select Time Slot
                </h2>

                {/* Slot list */}
                {slotsLoading ? (
                  <div style={{ textAlign: 'center', padding: '28px 0', color: T.textMuted, fontSize: 12 }}>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      style={{ width: 24, height: 24, borderRadius: '50%', border: `2px solid ${T.greenBorder}`, borderTopColor: T.green, margin: '0 auto 10px' }}
                    />
                    Loading slots...
                  </div>
                ) : slots.length === 0 && fullSlots.length === 0 ? (
                  <div style={{
                    padding: '20px 16px', borderRadius: 14, textAlign: 'center', marginBottom: 16,
                    background: 'rgba(252,211,77,0.07)', border: '1px solid rgba(252,211,77,0.2)',
                  }}>
                    <AlertCircle size={22} color={T.amber} style={{ margin: '0 auto 8px' }} />
                    <p style={{ fontSize: 12, fontWeight: 700, color: T.amber, margin: '0 0 3px' }}>No Available Slots</p>
                    <p style={{ fontSize: 11, color: T.textMuted, margin: 0 }}>Please check back later</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16, maxHeight: 360, overflowY: 'auto' }}>

                    {/* Available slots */}
                    {slots.map(slot => {
                      const selected = selectedSlotId === slot.id;
                      return (
                        <motion.label
                          key={slot.id}
                          whileHover={{ scale: 1.01 }}
                          style={{
                            display: 'flex', flexDirection: 'column', padding: '13px 14px',
                            borderRadius: 14, cursor: 'pointer', transition: 'all 0.15s',
                            background: selected ? T.greenDim : 'rgba(255,255,255,0.03)',
                            border: `1px solid ${selected ? T.greenBorder : T.border}`,
                            boxShadow: selected ? `0 0 16px rgba(57,255,150,0.1)` : 'none',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                            <input
                              type="radio" name="slot"
                              checked={selected}
                              onChange={() => setSelectedSlotId(slot.id)}
                              style={{ marginTop: 2, accentColor: T.green }}
                            />
                            <div style={{ flex: 1 }}>
                              <p style={{ fontSize: 12, fontWeight: 700, color: T.text, margin: '0 0 4px' }}>
                                {new Date(slot.slotDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                              </p>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                                <Clock size={11} color={T.textMuted} />
                                <span style={{ fontSize: 11, color: T.textSec, fontFamily: 'monospace' }}>
                                  {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                                </span>
                              </div>
                              <span style={{ fontSize: 10, color: T.textMuted }}>
                                {slot.availableCount} of {slot.capacity} available
                              </span>
                            </div>
                          </div>
                          {slot.availableCount < 3 && (
                            <p style={{ fontSize: 10, color: T.red, fontWeight: 700, marginTop: 6 }}>
                              🔥 Only {slot.availableCount} left!
                            </p>
                          )}
                        </motion.label>
                      );
                    })}

                    {/* Full slots */}
                    {fullSlots.map(slot => (
                      <div key={slot.id} style={{
                        padding: '13px 14px', borderRadius: 14, opacity: 0.65,
                        background: 'rgba(255,255,255,0.02)', border: `1px solid ${T.border}`,
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <p style={{ fontSize: 12, fontWeight: 700, color: T.textSec, margin: '0 0 4px' }}>
                              {new Date(slot.slotDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                              <Clock size={11} color={T.textMuted} />
                              <span style={{ fontSize: 11, color: T.textMuted, fontFamily: 'monospace' }}>
                                {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                              </span>
                            </div>
                          </div>
                          <span style={{
                            padding: '2px 8px', borderRadius: 99, fontSize: 9, fontWeight: 800,
                            textTransform: 'uppercase', letterSpacing: '0.06em',
                            background: 'rgba(248,113,113,0.1)', color: T.red, border: '1px solid rgba(248,113,113,0.2)',
                          }}>Full</span>
                        </div>

                        {waitlistSlotId === slot.id ? (
                          <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
                            <input
                              type="tel" value={waitlistPhone}
                              onChange={e => setWaitlistPhone(e.target.value)}
                              placeholder="Your phone number"
                              onFocus={() => setPhoneFocused(true)}
                              onBlur={() => setPhoneFocused(false)}
                              style={{
                                flex: 1, padding: '7px 10px', borderRadius: 9, fontSize: 11,
                                color: T.text, background: 'rgba(255,255,255,0.04)',
                                border: `1px solid ${phoneFocused ? 'rgba(57,255,150,0.4)' : T.border}`,
                                outline: 'none', fontFamily: 'inherit',
                              }}
                            />
                            <button onClick={handleJoinWaitlist} style={{
                              padding: '7px 12px', borderRadius: 9, border: 'none',
                              background: 'linear-gradient(135deg,#39FF96,#22C55E)',
                              color: '#050D18', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                            }}>Join</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setWaitlistSlotId(slot.id); setWaitlistMsg(null); }}
                            style={{
                              marginTop: 8, fontSize: 11, fontWeight: 600, color: T.cyan,
                              background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0,
                            }}
                          >
                            + Join Waitlist
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Waitlist success */}
                <AnimatePresence>
                  {waitlistMsg && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      style={{
                        marginBottom: 14, padding: '10px 14px', borderRadius: 12,
                        background: T.greenDim, border: `1px solid ${T.greenBorder}`,
                        fontSize: 11, color: T.green, fontWeight: 600, lineHeight: 1.5,
                      }}
                    >
                      ✅ {waitlistMsg}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Price summary */}
                <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 14, marginBottom: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { label: 'Offer Price',    val: `₹${offer.offerPrice.toFixed(2)}`,                         color: T.text },
                    { label: 'Original Price', val: `₹${offer.originalPrice.toFixed(2)}`,                      color: T.textMuted, strike: true },
                  ].map(({ label, val, color, strike }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span style={{ color: T.textMuted }}>{label}</span>
                      <span style={{ fontWeight: 700, color, textDecoration: strike ? 'line-through' : 'none' }}>{val}</span>
                    </div>
                  ))}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', fontSize: 12,
                    padding: '8px 12px', borderRadius: 10,
                    background: T.greenDim, border: `1px solid ${T.greenBorder}`,
                  }}>
                    <span style={{ fontWeight: 700, color: T.green }}>Total Savings</span>
                    <span style={{ fontWeight: 800, color: T.green }}>₹{(offer.originalPrice - offer.offerPrice).toFixed(2)}</span>
                  </div>
                </div>

                {/* Book button */}
                <motion.button
                  onClick={handleBooking}
                  disabled={offer.availableSlotsCount === 0 || !selectedSlotId}
                  whileHover={selectedSlotId && offer.availableSlotsCount > 0 ? { scale: 1.02, y: -1 } : {}}
                  whileTap={selectedSlotId && offer.availableSlotsCount > 0 ? { scale: 0.98 } : {}}
                  style={{
                    width: '100%', padding: '13px', borderRadius: 14, border: 'none',
                    fontSize: 14, fontWeight: 800, cursor: selectedSlotId && offer.availableSlotsCount > 0 ? 'pointer' : 'not-allowed',
                    fontFamily: 'inherit', transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                    ...(offer.availableSlotsCount === 0
                      ? { background: 'rgba(255,255,255,0.05)', color: T.textMuted }
                      : selectedSlotId
                      ? { background: 'linear-gradient(135deg,#39FF96,#22C55E)', color: '#050D18', boxShadow: '0 0 24px rgba(57,255,150,0.3)' }
                      : { background: 'rgba(255,255,255,0.04)', color: T.textMuted, border: `1px solid ${T.border}` }
                    ),
                  }}
                >
                  {offer.availableSlotsCount === 0 ? 'Sold Out'
                    : !selectedSlotId ? 'Select a Slot'
                    : <><Zap size={15} strokeWidth={2.5} /> Book Now</>
                  }
                </motion.button>

                <p style={{ fontSize: 10, color: T.textMuted, textAlign: 'center', marginTop: 10 }}>
                  Maximum {offer.maxBookingPerCustomer} booking{offer.maxBookingPerCustomer !== 1 ? 's' : ''} per customer
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}