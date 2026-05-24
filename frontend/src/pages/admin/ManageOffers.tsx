import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Edit2, Trash2, Plus, Calendar, Tags, Search,
  ChevronRight, LayoutGrid, LayoutList, AlertTriangle,
  X, TrendingDown, Package, RefreshCw,
  Zap, Download,
  QrCode, Timer, UserPlus, Star, Filter,
  ChevronLeft, ChevronRight as ChevronRightIcon, Clock, Users, CheckCircle, XCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { getImageUrl } from '../../utils/imageUrl';

/* ─────────────────────────────────────
   TYPES
───────────────────────────────────── */
interface Offer {
  id: number;
  title: string;
  category: string;
  originalPrice: number;
  offerPrice: number;
  discountPercentage: number;
  status: string;
  imageUrl?: string;
  endDate?: string;
  endTime?: string;
  totalCapacity?: number;
  bookedCount?: number;
  couponCode?: string;
  paymentStatus?: string;
}

interface Slot {
  id: number;
  offerId: number;
  slotDate: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  availableCount: number;
  status: string;
}

/* ─────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────── */
const T = {
  bg:          '#070D1A',
  card:        'rgba(10,20,36,0.82)',
  border:      'rgba(255,255,255,0.07)',
  borderHover: 'rgba(57,255,150,0.2)',
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
   STATUS CONFIG
───────────────────────────────────── */
const STATUS_CFG: Record<string, { color: string; bg: string; border: string; dot: string }> = {
  Active:    { color: T.green,  bg: 'rgba(57,255,150,0.09)',  border: 'rgba(57,255,150,0.28)',  dot: T.green  },
  Draft:     { color: T.textSec,bg: 'rgba(148,163,184,0.09)', border: 'rgba(148,163,184,0.2)',  dot: T.textSec },
  Paused:    { color: T.amber,  bg: 'rgba(252,211,77,0.09)',  border: 'rgba(252,211,77,0.28)',  dot: T.amber  },
  Expired:   { color: T.red,    bg: 'rgba(248,113,113,0.09)', border: 'rgba(248,113,113,0.28)', dot: T.red    },
  Cancelled: { color: '#64748B',bg: 'rgba(100,116,139,0.09)', border: 'rgba(100,116,139,0.2)',  dot: '#64748B'},
};
const getStatus = (s: string) => {
  const label = s === '0' ? 'Active' : (s || 'Draft');
  return { label, ...(STATUS_CFG[label] ?? STATUS_CFG['Draft']) };
};

/* Admin page styles (responsive, dashboard look) */
const adminStyles = `
:root{--bg:${T.bg};--card:${T.card};--green:${T.green};--cyan:${T.cyan};--purple:${T.purple};--amber:${T.amber};--red:${T.red};--text:${T.text};--muted:${T.textMuted};--border:${T.border};}
.admin-page{min-height:100%;background:transparent;font-family:Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;color:var(--text);}
.admin-wrap{max-width:1400px;margin:0 auto;padding:28px 32px;display:flex;flex-direction:column;gap:20px}
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
.toolbar{display:flex;flex-wrap:wrap;gap:10px;align-items:center}
.search-input{flex:0 0 240px}
.grid-view{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px}
.offer-card{border-radius:18px;background:var(--card);border:1px solid var(--border);backdrop-filter:blur(18px);box-shadow:0 8px 24px rgba(0,0,0,0.45);overflow:hidden;transition:transform .18s,box-shadow .18s;border-radius:14px}
.offer-card:hover{transform:translateY(-6px);box-shadow:0 24px 64px rgba(0,0,0,0.6),0 0 28px rgba(57,255,150,0.06)}
.table-wrap{overflow-x:auto}
.list-card{padding:0}
.header-title{font-size:28px;font-weight:800;letter-spacing:-0.02em;line-height:1.12;background:linear-gradient(135deg,#F7FAFC 30%,#39FF96 100%);-webkit-background-clip:text;background-clip:text;color:transparent}

@media (max-width: 1024px){
  .stats-grid{grid-template-columns:repeat(2,1fr)}
}
@media (max-width: 640px){
  .stats-grid{grid-template-columns:1fr}
  .admin-wrap{padding:18px}
  .search-input{flex:1 1 100%}
  .toolbar{flex-direction:column;align-items:stretch}
  .grid-view{grid-template-columns:repeat(auto-fill,minmax(200px,1fr))}
}
`;

/* ─────────────────────────────────────
   COUNTDOWN HOOK
───────────────────────────────────── */
function useCountdown(endDate?: string, endTime?: string) {
  const [timeLeft, setTimeLeft] = useState<{ h: number; m: number; s: number; expired: boolean } | null>(null);
  useEffect(() => {
    if (!endDate) return;
    const tick = () => {
      const time = (endTime || '23:59:59').split('.')[0];
      const end  = new Date(`${endDate.split('T')[0]}T${time}`);
      if (isNaN(end.getTime())) { setTimeLeft({ h: 0, m: 0, s: 0, expired: true }); return; }
      const diff = end.getTime() - Date.now();
      if (diff <= 0) { setTimeLeft({ h: 0, m: 0, s: 0, expired: true }); return; }
      setTimeLeft({ h: Math.floor(diff / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000), expired: false });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endDate, endTime]);
  return timeLeft;
}

/* ─────────────────────────────────────
   COUNTDOWN BADGE
───────────────────────────────────── */
function CountdownBadge({ endDate, endTime }: { endDate?: string; endTime?: string }) {
  const t = useCountdown(endDate, endTime);
  if (!t) return null;
  const urgent = !t.expired && t.h < 2;
  const color  = t.expired ? T.red : urgent ? T.amber : T.green;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 7, fontSize: 10, fontWeight: 700,
      fontVariantNumeric: 'tabular-nums',
      background: t.expired ? 'rgba(248,113,113,0.09)' : urgent ? 'rgba(252,211,77,0.09)' : T.greenDim,
      border: `1px solid ${t.expired ? 'rgba(248,113,113,0.28)' : urgent ? 'rgba(252,211,77,0.28)' : T.greenBorder}`,
      color,
    }}>
      <Timer size={9} />
      {t.expired ? 'Expired' : `${String(t.h).padStart(2,'0')}:${String(t.m).padStart(2,'0')}:${String(t.s).padStart(2,'0')}`}
    </div>
  );
}

/* ─────────────────────────────────────
   CAPACITY BAR
───────────────────────────────────── */
function CapacityBar({ total = 0, booked = 0 }: { total?: number; booked?: number }) {
  const pct   = total > 0 ? Math.min((booked / total) * 100, 100) : 0;
  const full  = pct >= 100;
  const warn  = pct >= 80;
  const color = full ? T.red : warn ? T.amber : T.green;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: T.textMuted }}>
          {full ? '⚠ Waitlist' : 'Capacity'}
        </span>
        <span style={{ fontSize: 10, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>{booked}/{total}</span>
      </div>
      <div style={{ height: 3, borderRadius: 99, overflow: 'hidden', background: 'rgba(255,255,255,0.06)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
          style={{
            height: '100%', borderRadius: 99,
            background: full
              ? 'linear-gradient(90deg,#EF4444,#F87171)'
              : warn
              ? 'linear-gradient(90deg,#F59E0B,#FCD34D)'
              : 'linear-gradient(90deg,#22C55E,#39FF96)',
            boxShadow: `0 0 8px ${color}50`,
          }}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────
   MINI QR
───────────────────────────────────── */
function MiniQR({ id }: { id: number }) {
  const cells = useMemo(() => {
    const arr: boolean[] = [];
    let seed = id * 2654435761;
    for (let i = 0; i < 49; i++) {
      seed = (seed ^ (seed >> 13)) * 1664525 + 1013904223;
      arr.push((seed >>> 0) % 3 !== 0);
    }
    [0,1,2,7,8,14,6,13,42,43,44,48,47,46,41,35,36].forEach(c => { arr[c] = true; });
    return arr;
  }, [id]);
  return (
    <div style={{ padding: 6, borderRadius: 8, background: '#fff', display: 'inline-block' }}>
      <svg width="52" height="52" viewBox="0 0 7 7">
        {cells.map((on, i) => on ? <rect key={i} x={i % 7} y={Math.floor(i / 7)} width="1" height="1" fill="#050C18" /> : null)}
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────
   MODAL WRAPPER
───────────────────────────────────── */
function ModalOverlay({ children, onClose, accentColor = T.green }: { children: React.ReactNode; onClose: () => void; accentColor?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(5,12,24,0.9)', backdropFilter: 'blur(14px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 22 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 22 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        style={{ width: '100%', overflow: 'hidden', background: 'rgba(8,16,30,0.99)', border: `1px solid ${accentColor}30`, borderRadius: 20, boxShadow: '0 32px 100px rgba(0,0,0,0.8)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* accent line */}
        <div style={{ height: 2, background: `linear-gradient(90deg,${accentColor},${T.cyan})` }} />
        {children}
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────
   QR MODAL
───────────────────────────────────── */
function QRModal({ offer, onClose }: { offer: Offer; onClose: () => void }) {
  return (
    <ModalOverlay onClose={onClose} accentColor={T.green}>
      <div style={{ maxWidth: 320, margin: '0 auto', padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <QrCode size={16} color={T.green} />
          <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Offer QR Code</span>
        </div>
        <MiniQR id={offer.id} />
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{offer.title}</p>
          <p style={{ fontSize: 10, color: T.textMuted, marginTop: 3 }}>Scan to book · ID #{offer.id}</p>
        </div>
        {offer.couponCode && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 11, fontSize: 12, fontFamily: 'monospace', fontWeight: 700, background: T.greenDim, border: `1px solid ${T.greenBorder}`, color: T.green }}>
            <Star size={11} /> {offer.couponCode}
          </div>
        )}
        <button onClick={onClose} style={{ width: '100%', padding: '10px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.border}`, color: T.textSec, cursor: 'pointer', fontFamily: 'inherit' }}>
          Close
        </button>
      </div>
    </ModalOverlay>
  );
}

/* ─────────────────────────────────────
   DELETE MODAL
───────────────────────────────────── */
function DeleteModal({ offer, onConfirm, onCancel, loading }:
  { offer: Offer; onConfirm: () => void; onCancel: () => void; loading: boolean }) {
  return (
    <ModalOverlay onClose={onCancel} accentColor={T.red}>
      <div style={{ maxWidth: 440, margin: '0 auto', padding: 28 }}>
        <div style={{ width: 48, height: 48, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)' }}>
          <AlertTriangle size={22} color={T.red} />
        </div>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 6 }}>Delete Offer</h3>
        <p style={{ fontSize: 13, color: T.textSec, marginBottom: 4 }}>You're about to permanently delete:</p>
        <p style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 14 }}>"{offer.title}"</p>
        <p style={{ fontSize: 11, color: T.textMuted, marginBottom: 24 }}>This will remove all associated slots and data. This action cannot be undone.</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '10px', borderRadius: 12, fontSize: 13, fontWeight: 600, background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.border}`, color: T.textSec, cursor: 'pointer', fontFamily: 'inherit' }}>
            Cancel
          </button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={onConfirm} disabled={loading}
            style={{ flex: 1, padding: '10px', borderRadius: 12, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.35)', color: T.red, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
            {loading
              ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}><RefreshCw size={14} /></motion.div>
              : <Trash2 size={14} />}
            {loading ? 'Deleting…' : 'Delete'}
          </motion.button>
        </div>
      </div>
    </ModalOverlay>
  );
}

/* ─────────────────────────────────────
   CALENDAR MODAL
───────────────────────────────────── */
function CalendarModal({ offer, onClose }: { offer: Offer; onClose: () => void }) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear,  setCurrentYear]  = useState(today.getFullYear());
  const [slots,        setSlots]        = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [selectedDay,  setSelectedDay]  = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoadingSlots(true);
      try {
        const res = await axiosClient.get(`/slots/offer/${offer.id}`);
        setSlots(res.data || []);
      } catch { setSlots([]); }
      finally { setLoadingSlots(false); }
    })();
  }, [offer.id]);

  const firstDay    = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const slotsByDate = useMemo(() => {
    const map: Record<string, Slot[]> = {};
    slots.forEach(s => {
      const key = s.slotDate?.split('T')[0];
      if (key) map[key] = [...(map[key] ?? []), s];
    });
    return map;
  }, [slots]);

  const monthName = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' });

  const prevMonth = () => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); } else setCurrentMonth(m => m - 1); setSelectedDay(null); };
  const nextMonth = () => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); } else setCurrentMonth(m => m + 1); setSelectedDay(null); };

  const fmt = (day: number) => `${currentYear}-${String(currentMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  const selectedSlots = selectedDay ? (slotsByDate[selectedDay] ?? []) : [];

  const navBtn: React.CSSProperties = { width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.border}`, color: T.textSec, cursor: 'pointer' };

  return (
    <ModalOverlay onClose={onClose} accentColor={T.green}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px 14px', borderBottom: `1px solid ${T.border}` }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
              <Calendar size={14} color={T.green} />
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(57,255,150,0.65)' }}>Slot Calendar</span>
            </div>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: T.text, margin: 0 }}>{offer.title}</h2>
          </div>
          <button onClick={onClose} style={{ ...navBtn, width: 32, height: 32, borderRadius: 10 }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = T.red; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = T.textSec; }}>
            <X size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 0 }}>
          {/* Calendar */}
          <div style={{ padding: 20, borderRight: `1px solid ${T.border}` }}>
            {/* Month nav */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <motion.button whileTap={{ scale: 0.9 }} onClick={prevMonth} style={navBtn}><ChevronLeft size={13} /></motion.button>
              <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{monthName}</span>
              <motion.button whileTap={{ scale: 0.9 }} onClick={nextMonth} style={navBtn}><ChevronRightIcon size={13} /></motion.button>
            </div>
            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: 6 }}>
              {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: T.textMuted, padding: '4px 0', letterSpacing: '0.06em' }}>{d}</div>
              ))}
            </div>
            {/* Days */}
            {loadingSlots ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 140 }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                  <RefreshCw size={20} color={T.green} />
                </motion.div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3 }}>
                {Array(firstDay).fill(null).map((_, i) => <div key={`b${i}`} />)}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                  const key       = fmt(day);
                  const daySlots  = slotsByDate[key] ?? [];
                  const hasSlots  = daySlots.length > 0;
                  const isToday   = today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear;
                  const isSelected = selectedDay === key;
                  const allFull   = hasSlots && daySlots.every(s => s.availableCount <= 0);
                  const dotColor  = allFull ? T.red : T.green;

                  return (
                    <motion.button key={day} whileHover={hasSlots ? { scale: 1.1 } : {}} whileTap={hasSlots ? { scale: 0.92 } : {}}
                      onClick={() => hasSlots && setSelectedDay(isSelected ? null : key)}
                      style={{
                        position: 'relative', aspectRatio: '1', display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', borderRadius: 10,
                        fontSize: 11, fontWeight: 600, transition: 'all 0.15s', fontFamily: 'inherit',
                        background: isSelected ? T.greenDim : isToday ? 'rgba(57,255,150,0.05)' : hasSlots ? 'rgba(255,255,255,0.03)' : 'transparent',
                        border: `1px solid ${isSelected ? T.greenBorder : isToday ? 'rgba(57,255,150,0.22)' : hasSlots ? T.border : 'transparent'}`,
                        color: isSelected ? T.green : isToday ? T.green : hasSlots ? T.text : T.textFaint,
                        cursor: hasSlots ? 'pointer' : 'default',
                      }}>
                      {day}
                      {hasSlots && (
                        <div style={{ position: 'absolute', bottom: 3, display: 'flex', gap: 2 }}>
                          {daySlots.slice(0, 3).map((_, i) => (
                            <div key={i} style={{ width: 3, height: 3, borderRadius: '50%', background: dotColor }} />
                          ))}
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            )}
            {/* Legend */}
            <div style={{ display: 'flex', gap: 16, marginTop: 14, paddingTop: 12, borderTop: `1px solid ${T.border}` }}>
              {[{ color: T.green, label: 'Available' }, { color: T.red, label: 'Full' }, { color: T.green, label: 'Today', ring: true }].map(({ color, label, ring }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  {ring
                    ? <div style={{ width: 11, height: 11, borderRadius: '50%', border: `1px solid ${color}`, background: `${color}18` }} />
                    : <div style={{ width: 7, height: 7, borderRadius: '50%', background: color }} />}
                  <span style={{ fontSize: 10, color: T.textMuted }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Slot detail panel */}
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', minHeight: 320 }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.textMuted, marginBottom: 10 }}>
              {selectedDay
                ? new Date(selectedDay + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
                : 'Select a day'}
            </p>

            {!selectedDay ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 12, border: `1px dashed ${T.border}` }}>
                <Calendar size={26} color="rgba(57,255,150,0.2)" strokeWidth={1} />
                <p style={{ fontSize: 11, color: T.textFaint, textAlign: 'center', margin: 0 }}>Click a highlighted<br />date to view slots</p>
              </div>
            ) : selectedSlots.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 12, border: `1px dashed ${T.border}` }}>
                <XCircle size={22} color="rgba(248,113,113,0.3)" strokeWidth={1} />
                <p style={{ fontSize: 11, color: T.textFaint, margin: 0 }}>No slots on this day</p>
              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', maxHeight: 260 }}>
                {selectedSlots.map(slot => {
                  const full = slot.availableCount <= 0;
                  const pct  = slot.capacity > 0 ? Math.min((slot.bookedCount / slot.capacity) * 100, 100) : 0;
                  return (
                    <motion.div key={slot.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                      style={{ padding: 12, borderRadius: 12, background: full ? 'rgba(248,113,113,0.06)' : T.greenDim, border: `1px solid ${full ? 'rgba(248,113,113,0.2)' : T.greenBorder}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <Clock size={11} color={full ? T.red : T.green} />
                        <span style={{ fontSize: 11, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: full ? T.red : T.green }}>
                          {slot.startTime} – {slot.endTime}
                        </span>
                        {full && <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 6, background: 'rgba(248,113,113,0.15)', color: T.red, border: '1px solid rgba(248,113,113,0.3)' }}>FULL</span>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <Users size={10} color={T.textMuted} />
                        <span style={{ fontSize: 10, color: T.textSec, fontVariantNumeric: 'tabular-nums' }}>{slot.bookedCount}/{slot.capacity} booked</span>
                        {!full && <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 600, color: T.green }}>{slot.availableCount} left</span>}
                      </div>
                      <div style={{ height: 3, borderRadius: 99, overflow: 'hidden', background: 'rgba(255,255,255,0.05)', marginBottom: 6 }}>
                        <div style={{ height: '100%', borderRadius: 99, width: `${pct}%`, background: full ? 'linear-gradient(90deg,#EF4444,#F87171)' : pct >= 80 ? 'linear-gradient(90deg,#F59E0B,#FCD34D)' : 'linear-gradient(90deg,#22C55E,#39FF96)' }} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        {full ? <XCircle size={10} color={T.red} /> : <CheckCircle size={10} color={T.green} />}
                        <span style={{ fontSize: 9, fontWeight: 600, color: full ? T.red : T.green }}>{slot.status || (full ? 'Full' : 'Available')}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {slots.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.border}` }}>
                {[
                  { label: 'Total Slots', value: slots.length, color: T.textSec },
                  { label: 'Available',   value: slots.filter(s => s.availableCount > 0).length, color: T.green },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ padding: '8px', borderRadius: 10, textAlign: 'center', background: 'rgba(255,255,255,0.03)', border: `1px solid ${T.border}` }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color }}>{value}</div>
                    <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.textFaint, marginTop: 2 }}>{label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ModalOverlay>
  );
}

/* ─────────────────────────────────────
   OFFER CARD
───────────────────────────────────── */
function OfferCard({ offer, onDelete, onSlots, onQR, onCalendar, onEdit, index }:
  { offer: Offer; onDelete: (o: Offer) => void; onSlots: (id: number) => void; onQR: (o: Offer) => void; onCalendar: (o: Offer) => void; onEdit: (id: number) => void; index: number }) {
  const s       = getStatus(offer.status);
  const savings = offer.originalPrice - offer.offerPrice;
  const isFull  = (offer.bookedCount ?? 0) >= (offer.totalCapacity ?? Infinity);

  const actionBtnStyle = (color: string): React.CSSProperties => ({
    padding: '7px 9px', borderRadius: 10, cursor: 'pointer',
    background: `${color}06`, border: `1px solid ${color}14`, color,
    transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.42, delay: index * 0.05, ease: [0.34, 1.56, 0.64, 1] }}
      whileHover={{ y: -3, transition: { duration: 0.18 } }}
      className="offer-card" style={{ ...cardStyle, overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.2s, border-color 0.2s' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = T.borderHover; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 40px rgba(0,0,0,0.4), 0 0 24px rgba(57,255,150,0.06)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = T.border; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 24px rgba(0,0,0,0.28)'; }}
    >
      {/* Image */}
      <div style={{ height: 150, position: 'relative', overflow: 'hidden', flexShrink: 0, background: 'rgba(5,12,24,0.6)' }}>
        {offer.imageUrl ? (
          <img src={getImageUrl(offer.imageUrl)} alt={offer.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, background: T.greenDim }}>
            <Package size={26} color="rgba(57,255,150,0.25)" strokeWidth={1} />
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.textFaint }}>No image</span>
          </div>
        )}
        {/* Discount badge */}
        {offer.discountPercentage > 0 && (
          <div style={{ position: 'absolute', top: 10, left: 10, padding: '4px 10px', borderRadius: 10, fontSize: 11, fontWeight: 800, background: 'linear-gradient(135deg,#22C55E,#39FF96)', color: '#050C18', boxShadow: '0 0 16px rgba(57,255,150,0.5)' }}>
            {Math.round(offer.discountPercentage)}% OFF
          </div>
        )}
        {isFull && !offer.discountPercentage && (
          <div style={{ position: 'absolute', top: 10, left: 10, display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 8, fontSize: 10, fontWeight: 700, background: 'rgba(252,211,77,0.15)', border: '1px solid rgba(252,211,77,0.4)', color: T.amber }}>
            <UserPlus size={10} /> Waitlist
          </div>
        )}
        {/* Status badge */}
        <div style={{ position: 'absolute', top: 10, right: 10, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 8, fontSize: 10, fontWeight: 600, background: 'rgba(5,12,24,0.88)', border: `1px solid ${s.border}`, color: s.color, backdropFilter: 'blur(8px)' }}>
          <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }}
            style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot, boxShadow: `0 0 5px ${s.border}` }} />
          {s.label}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: 14, display: 'flex', flexDirection: 'column', flex: 1, gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(57,255,150,0.55)' }}>{offer.category}</span>
          <CountdownBadge endDate={offer.endDate} endTime={offer.endTime} />
        </div>

        <h3 style={{ fontSize: 13, fontWeight: 600, color: T.text, margin: 0, lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {offer.title}
        </h3>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 7 }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: T.green, fontVariantNumeric: 'tabular-nums' }}>₹{offer.offerPrice.toFixed(0)}</span>
          <span style={{ fontSize: 11, textDecoration: 'line-through', color: T.textMuted, marginBottom: 1, fontVariantNumeric: 'tabular-nums' }}>₹{offer.originalPrice.toFixed(0)}</span>
          {savings > 0 && <span style={{ fontSize: 10, color: T.textFaint, marginBottom: 1 }}>save ₹{savings.toFixed(0)}</span>}
        </div>

        {(offer.totalCapacity ?? 0) > 0 && <CapacityBar total={offer.totalCapacity} booked={offer.bookedCount ?? 0} />}

        {offer.couponCode && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 9, fontSize: 10, fontFamily: 'monospace', fontWeight: 700, background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)', color: T.purple }}>
            <Star size={9} /> {offer.couponCode}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 'auto', paddingTop: 4 }}>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.93 }}
            onClick={() => onSlots(offer.id)}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '7px 6px', borderRadius: 10, fontSize: 11, fontWeight: 600, background: T.greenDim, border: `1px solid ${T.greenBorder}`, color: T.green, cursor: 'pointer', fontFamily: 'inherit' }}>
            <Calendar size={12} /> Slots
          </motion.button>
          {[
            { icon: Calendar, color: T.purple, title: 'Calendar View', fn: () => onCalendar(offer) },
            { icon: QrCode,   color: T.green,  title: 'QR Code',       fn: () => onQR(offer)      },
            { icon: Edit2,    color: T.cyan,   title: 'Edit',           fn: () => onEdit(offer.id) },
            { icon: Trash2,   color: T.red,    title: 'Delete',         fn: () => onDelete(offer)  },
          ].map(({ icon: Icon, color, title, fn }) => (
            <motion.button key={title} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }}
              onClick={fn} title={title}
              style={actionBtnStyle(color)}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${color}14`; (e.currentTarget as HTMLElement).style.borderColor = `${color}30`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${color}06`; (e.currentTarget as HTMLElement).style.borderColor = `${color}14`; }}>
              <Icon size={13} />
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────
   SKELETON CARD
───────────────────────────────────── */
function SkeletonCard() {
  return (
    <div style={{ ...cardStyle, overflow: 'hidden', opacity: 0.6 }}>
      <div style={{ height: 150, background: 'rgba(255,255,255,0.03)' }} />
      <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[16, '100%', '75%', 32].map((w, i) => (
          <div key={i} style={{ height: i === 0 ? 10 : i === 3 ? 32 : 14, width: w, borderRadius: 8, background: 'rgba(255,255,255,0.04)' }} />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────
   CSV EXPORT
───────────────────────────────────── */
function exportCSV(offers: Offer[]) {
  const headers = ['ID','Title','Category','Original Price','Offer Price','Discount %','Status','Coupon Code'];
  const rows = offers.map(o => [o.id, `"${o.title}"`, o.category, o.originalPrice, o.offerPrice, o.discountPercentage.toFixed(2), getStatus(o.status).label, o.couponCode || '']);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `offers_${Date.now()}.csv`; a.click();
  URL.revokeObjectURL(url);
}

/* ═══════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════ */
export default function ManageOffers() {
  const [offers,         setOffers]         = useState<Offer[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [view,           setView]           = useState<'grid' | 'list'>('grid');
  const [search,         setSearch]         = useState('');
  const [filterStatus,   setFilterStatus]   = useState('All');
  const [toDelete,       setToDelete]       = useState<Offer | null>(null);
  const [qrOffer,        setQrOffer]        = useState<Offer | null>(null);
  const [calendarOffer,  setCalendarOffer]  = useState<Offer | null>(null);
  const [deleting,       setDeleting]       = useState(false);
  const [showFilters,    setShowFilters]    = useState(false);
  const navigate = useNavigate();

  const fetchOffers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/offers');
      setOffers(res.data);
    } catch (err) { console.error('Failed to fetch offers', err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchOffers(); }, [fetchOffers]);

  useEffect(() => {
    const check = () => { if (localStorage.getItem('afterOfferChange')) { localStorage.removeItem('afterOfferChange'); fetchOffers(); } };
    window.addEventListener('storage', check);
    return () => window.removeEventListener('storage', check);
  }, [fetchOffers]);

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await axiosClient.delete(`/offers/${toDelete.id}`);
      setOffers(prev => prev.filter(o => o.id !== toDelete.id));
      setToDelete(null);
    } catch (err) { console.error('Delete failed:', err); }
    finally { setDeleting(false); }
  };

  const filtered = useMemo(() => offers.filter(o => {
    const matchStatus = filterStatus === 'All' || getStatus(o.status).label === filterStatus;
    const q = search.toLowerCase();
    return matchStatus && (!q || o.title.toLowerCase().includes(q) || o.category.toLowerCase().includes(q));
  }), [offers, search, filterStatus]);

  const statusCounts = useMemo(() => {
    const c: Record<string, number> = { All: offers.length };
    offers.forEach(o => { const l = getStatus(o.status).label; c[l] = (c[l] ?? 0) + 1; });
    return c;
  }, [offers]);

  const stats = useMemo(() => ({
    total: offers.length,
    active: offers.filter(o => getStatus(o.status).label === 'Active').length,
    revenue: offers.reduce((s, o) => s + o.offerPrice, 0),
    avgDiscount: offers.length ? offers.reduce((s, o) => s + o.discountPercentage, 0) / offers.length : 0,
  }), [offers]);

  const filterBtnBase: React.CSSProperties = { padding: '6px 13px', borderRadius: 10, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', display: 'inline-flex', alignItems: 'center', gap: 5 };

  return (
    <div className="admin-page">
      <style>{adminStyles}</style>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(57,255,150,0.05) 0%, transparent 70%)' }} />

      <div className="admin-wrap" style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.22,1,0.36,1] }}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(57,255,150,0.6)' }}>Admin</span>
              <ChevronRight size={11} color={T.textFaint} />
              <span style={{ fontSize: 10, color: T.textMuted }}>Offers</span>
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: -0.5, lineHeight: 1.15, background: 'linear-gradient(135deg,#F7FAFC 30%,#39FF96 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Manage Offers
            </h1>
            <p style={{ fontSize: 11, color: T.textMuted, marginTop: 5 }}>{offers.length} total · {stats.active} active</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => exportCSV(filtered)}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.border}`, color: T.textSec, cursor: 'pointer', fontFamily: 'inherit' }}>
              <Download size={13} /> Export CSV
            </motion.button>
            <motion.button whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/admin/offers/new')}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 12, fontSize: 13, fontWeight: 700, background: 'linear-gradient(135deg,#39FF96,#22C55E)', color: '#050D18', border: 'none', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 0 22px rgba(57,255,150,0.3)' }}>
              <Plus size={15} strokeWidth={2.5} /> New Offer
            </motion.button>
          </div>
        </motion.div>

        {/* ── Stats strip ── */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.42, delay: 0.06 }} className="stats-grid">
          {[
            { label: 'Total Offers', value: stats.total,                              icon: Tags,        color: T.green  },
            { label: 'Active Now',   value: stats.active,                              icon: Zap,         color: T.cyan   },
            { label: 'Avg Discount', value: `${stats.avgDiscount.toFixed(1)}%`,        icon: TrendingDown,color: T.purple },
            { label: 'Offer Value',  value: `₹${(stats.revenue / 1000).toFixed(1)}k`, icon: Star,        color: T.amber  },
          ].map(({ label, value, icon: Icon, color }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 + i * 0.04 }}
              style={{ ...cardStyle, padding: '14px 16px', borderRadius: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: T.textMuted }}>{label}</span>
                <div style={{ width: 26, height: 26, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${color}12`, border: `1px solid ${color}22` }}>
                  <Icon size={13} color={color} strokeWidth={1.8} />
                </div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Toolbar ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.38, delay: 0.1 }} className="toolbar">
          {/* Search */}
          <div className="search-input" style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: T.textMuted, pointerEvents: 'none' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search offers…"
              style={{ width: '100%', padding: '9px 32px 9px 32px', borderRadius: 11, fontSize: 13, background: 'rgba(255,255,255,0.03)', border: `1px solid ${T.border}`, color: T.text, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
              onFocus={e => { e.currentTarget.style.borderColor = T.greenBorder; }}
              onBlur={e => { e.currentTarget.style.borderColor = T.border; }} />
            {search && (
              <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: T.textMuted, cursor: 'pointer', padding: 2 }}>
                <X size={12} />
              </button>
            )}
          </div>

          {/* Mobile filter toggle */}
          <motion.button whileTap={{ scale: 0.94 }} onClick={() => setShowFilters(p => !p)}
            style={{ ...filterBtnBase, background: showFilters ? T.greenDim : 'rgba(255,255,255,0.03)', border: `1px solid ${showFilters ? T.greenBorder : T.border}`, color: showFilters ? T.green : T.textMuted }}>
            <Filter size={12} /> Filters
          </motion.button>

          {/* Filter pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {['All','Active','Draft','Paused','Expired'].map(s => {
              const isActive = filterStatus === s;
              const cfg = STATUS_CFG[s];
              return (
                <motion.button key={s} whileTap={{ scale: 0.94 }} onClick={() => setFilterStatus(s)}
                  style={{
                    ...filterBtnBase,
                    background: isActive ? (cfg ? cfg.bg : T.greenDim) : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isActive ? (cfg ? cfg.border : T.greenBorder) : T.border}`,
                    color: isActive ? (cfg ? cfg.color : T.green) : T.textMuted,
                  }}>
                  {s}
                  {statusCounts[s] !== undefined && (
                    <span style={{ padding: '1px 6px', borderRadius: 99, fontSize: 9, fontWeight: 800, background: isActive ? (cfg ? `${cfg.color}18` : 'rgba(57,255,150,0.15)') : 'rgba(255,255,255,0.05)', color: isActive ? (cfg ? cfg.color : T.green) : T.textMuted }}>
                      {statusCounts[s]}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* View toggle */}
          <div style={{ display: 'flex', gap: 3, padding: 3, borderRadius: 11, background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.border}`, marginLeft: 'auto' }}>
            {(['grid','list'] as const).map(v => (
              <motion.button key={v} whileTap={{ scale: 0.88 }} onClick={() => setView(v)}
                style={{ padding: '6px 7px', borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s', background: view === v ? T.greenDim : 'transparent', border: `1px solid ${view === v ? T.greenBorder : 'transparent'}`, color: view === v ? T.green : T.textMuted }}>
                {v === 'grid' ? <LayoutGrid size={15} /> : <LayoutList size={15} />}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* ── Grid / List ── */}
        <AnimatePresence mode="wait">
          {view === 'grid' ? (
            <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid-view">
              {loading
                ? [...Array(8)].map((_, i) => <SkeletonCard key={i} />)
                : filtered.length === 0
                ? (
                  <div style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0', gap: 16 }}>
                    <Tags size={28} color="rgba(57,255,150,0.3)" strokeWidth={1} />
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: T.text, margin: 0 }}>No offers found</p>
                      <p style={{ fontSize: 11, color: T.textMuted, marginTop: 4 }}>Try adjusting your search or filters</p>
                    </div>
                    <motion.button whileHover={{ scale: 1.03 }} onClick={() => navigate('/admin/offers/new')}
                      style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 12, fontSize: 13, fontWeight: 700, background: 'linear-gradient(135deg,#39FF96,#22C55E)', color: '#050D18', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                      <Plus size={14} /> Create first offer
                    </motion.button>
                  </div>
                )
                : filtered.map((offer, i) => (
                  <OfferCard key={offer.id} offer={offer} index={i}
                    onDelete={setToDelete}
                    onSlots={id => navigate(`/admin/offers/${id}/slots`)}
                    onQR={setQrOffer}
                    onCalendar={setCalendarOffer}
                    onEdit={id => navigate(`/admin/offers/${id}/edit`)}
                  />
                ))
              }
            </motion.div>
          ) : (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="list-card" style={{ ...cardStyle, overflow: 'hidden' }}>
              <div className="table-wrap" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      {['Offer','Category','Pricing','Discount','Capacity','Expires','Status','Actions'].map(h => (
                        <th key={h} style={{ padding: '13px 18px', textAlign: 'left', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.textMuted, whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading
                      ? [...Array(5)].map((_, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          {[40,20,25,15,30,20,15,20].map((w, j) => (
                            <td key={j} style={{ padding: '13px 18px' }}><div style={{ height: 12, borderRadius: 6, background: 'rgba(255,255,255,0.04)', width: `${w + j * 3}%` }} /></td>
                          ))}
                        </tr>
                      ))
                      : filtered.map((offer, i) => {
                        const s     = getStatus(offer.status);
                        const isFull = (offer.bookedCount ?? 0) >= (offer.totalCapacity ?? Infinity);
                        return (
                          <motion.tr key={offer.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }} transition={{ delay: i * 0.03 }}
                            style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.12s' }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(57,255,150,0.02)'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                            {/* Offer */}
                            <td style={{ padding: '13px 18px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 10, overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.greenDim, border: `1px solid ${T.greenBorder}` }}>
                                  {offer.imageUrl
                                    ? <img src={getImageUrl(offer.imageUrl)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                                    : <Zap size={13} color="rgba(57,255,150,0.4)" />}
                                </div>
                                <div>
                                  <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{offer.title}</div>
                                  {offer.couponCode && <div style={{ fontSize: 10, fontFamily: 'monospace', marginTop: 2, color: T.purple }}>🏷 {offer.couponCode}</div>}
                                </div>
                              </div>
                            </td>
                            {/* Category */}
                            <td style={{ padding: '13px 18px' }}>
                              <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 7, fontWeight: 600, background: 'rgba(255,255,255,0.04)', color: T.textSec, border: `1px solid ${T.border}` }}>{offer.category || 'Other'}</span>
                            </td>
                            {/* Pricing */}
                            <td style={{ padding: '13px 18px' }}>
                              <div style={{ fontSize: 12, fontWeight: 800, color: T.green, fontVariantNumeric: 'tabular-nums' }}>₹{offer.offerPrice.toFixed(0)}</div>
                              <div style={{ fontSize: 10, textDecoration: 'line-through', color: T.textMuted, fontVariantNumeric: 'tabular-nums' }}>₹{offer.originalPrice.toFixed(0)}</div>
                            </td>
                            {/* Discount */}
                            <td style={{ padding: '13px 18px' }}>
                              {offer.discountPercentage > 0 && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 7, background: T.greenDim, color: T.green, border: `1px solid ${T.greenBorder}` }}>
                                  <TrendingDown size={10} /> {Math.round(offer.discountPercentage)}%
                                </span>
                              )}
                            </td>
                            {/* Capacity */}
                            <td style={{ padding: '13px 18px', minWidth: 100 }}>
                              {(offer.totalCapacity ?? 0) > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: isFull ? T.amber : T.textMuted }}>
                                    <span>{isFull ? 'Full' : `${offer.bookedCount ?? 0}/${offer.totalCapacity}`}</span>
                                    {isFull && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><UserPlus size={9} /> Waitlist</span>}
                                  </div>
                                  <div style={{ height: 3, borderRadius: 99, overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
                                    <div style={{ height: '100%', borderRadius: 99, width: `${Math.min(((offer.bookedCount ?? 0) / (offer.totalCapacity ?? 1)) * 100, 100)}%`, background: isFull ? T.red : T.green }} />
                                  </div>
                                </div>
                              ) : <span style={{ color: T.textFaint }}>—</span>}
                            </td>
                            {/* Expires */}
                            <td style={{ padding: '13px 18px' }}><CountdownBadge endDate={offer.endDate} endTime={offer.endTime} /></td>
                            {/* Status */}
                            <td style={{ padding: '13px 18px' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 99, fontSize: 10, fontWeight: 600, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                                <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot }} /> {s.label}
                              </span>
                            </td>
                            {/* Actions */}
                            <td style={{ padding: '13px 18px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                {[
                                  { icon: Calendar, color: T.green,  title: 'Slots',         fn: () => navigate(`/admin/offers/${offer.id}/slots`) },
                                  { icon: Calendar, color: T.purple, title: 'Calendar View', fn: () => setCalendarOffer(offer) },
                                  { icon: QrCode,   color: T.cyan,   title: 'QR Code',       fn: () => setQrOffer(offer) },
                                  { icon: Edit2,    color: T.textSec,title: 'Edit',           fn: () => navigate(`/admin/offers/${offer.id}/edit`) },
                                  { icon: Trash2,   color: T.red,    title: 'Delete',         fn: () => setToDelete(offer) },
                                ].map(({ icon: Icon, color, title, fn }) => (
                                  <motion.button key={title} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.88 }}
                                    onClick={fn} title={title}
                                    style={{ padding: 6, borderRadius: 8, cursor: 'pointer', color: T.textMuted, background: 'none', border: 'none', transition: 'color 0.15s' }}
                                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = color}
                                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = T.textMuted}>
                                    <Icon size={14} />
                                  </motion.button>
                                ))}
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })
                    }
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!loading && filtered.length > 0 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ fontSize: 11, textAlign: 'center', color: T.textFaint, margin: 0 }}>
            Showing {filtered.length} of {offers.length} offers
          </motion.p>
        )}
      </div>

      <AnimatePresence>{qrOffer       && <QRModal       offer={qrOffer}       onClose={() => setQrOffer(null)}       />}</AnimatePresence>
      <AnimatePresence>{calendarOffer && <CalendarModal  offer={calendarOffer} onClose={() => setCalendarOffer(null)} />}</AnimatePresence>
      <AnimatePresence>{toDelete      && <DeleteModal    offer={toDelete}      onConfirm={handleDelete} onCancel={() => setToDelete(null)} loading={deleting} />}</AnimatePresence>
    </div>
  );
}