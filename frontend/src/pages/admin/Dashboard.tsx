import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Tags, CalendarCheck, Users, Activity,
  ArrowUpRight, AlertCircle, TrendingUp, Zap,
  Clock, ChevronRight, RefreshCw, Bell,
  Mail, MessageSquare, Smartphone,
  BarChart2, Download,
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';

/* ─────────────────────────────────────
   TYPES
───────────────────────────────────── */
interface RecentBooking {
  id: number;
  bookingReference: string;
  customerName: string;
  customerEmail: string;
  offerTitle: string;
  slotTime: string;
  peopleCount: number;
  status: string;
  bookedAt: string;
}
interface DashboardStats {
  totalOffers: number;
  activeOffers: number;
  totalBookings: number;
  todaysBookings: number;
  totalCapacity: number;
  bookedSeats: number;
  availableSeats: number;
  conversionRate: number;
  recentBookings: RecentBooking[];
}

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

const STATUS: Record<string, { bg: string; color: string; border: string; label: string }> = {
  Confirmed: { bg: 'rgba(57,255,150,0.09)',  color: T.green,  border: 'rgba(57,255,150,0.28)',  label: 'Confirmed' },
  Cancelled: { bg: 'rgba(248,113,113,0.09)', color: T.red,    border: 'rgba(248,113,113,0.28)', label: 'Cancelled' },
  Pending:   { bg: 'rgba(252,211,77,0.09)',  color: T.amber,  border: 'rgba(252,211,77,0.28)',  label: 'Pending'   },
  Completed: { bg: 'rgba(34,211,238,0.09)',  color: T.cyan,   border: 'rgba(34,211,238,0.28)',  label: 'Completed' },
  NoShow:    { bg: 'rgba(100,116,139,0.09)', color: '#94A3B8', border: 'rgba(100,116,139,0.22)', label: 'No-Show'  },
};

/* shared card style */
const cardStyle: React.CSSProperties = {
  background: T.card,
  border: `1px solid ${T.border}`,
  borderRadius: 18,
  backdropFilter: 'blur(20px)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.28)',
};

/* ─────────────────────────────────────
   ANIMATED COUNTER
───────────────────────────────────── */
function useCountUp(target: number, duration = 1400) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setCount(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return count;
}

/* ─────────────────────────────────────
   MOCK NOTIFICATION DATA
───────────────────────────────────── */
const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'email',    customer: 'Priya Sharma',  msg: 'Booking confirmed — Masala Dosa Feast',      time: '2m ago',  status: 'sent'   },
  { id: 2, type: 'sms',      customer: 'Rahul Verma',   msg: 'Reminder: Slot at 7:00 PM today',            time: '18m ago', status: 'sent'   },
  { id: 3, type: 'whatsapp', customer: 'Anjali Singh',  msg: 'Your booking #2037 has been confirmed',      time: '45m ago', status: 'sent'   },
  { id: 4, type: 'email',    customer: 'Karan Mehta',   msg: 'Cancellation processed — refund initiated',  time: '1h ago',  status: 'failed' },
  { id: 5, type: 'sms',      customer: 'Deepa Nair',    msg: 'Booking confirmed — Gourmet Dosa Fest',      time: '2h ago',  status: 'sent'   },
  { id: 6, type: 'whatsapp', customer: 'Amit Patel',    msg: 'New offer: 50% Off Spa Sunday',              time: '3h ago',  status: 'sent'   },
];

/* ─────────────────────────────────────
   CSV EXPORT
───────────────────────────────────── */
function exportBookingsCSV(bookings: RecentBooking[]) {
  const headers = ['ID', 'Reference', 'Customer', 'Email', 'Offer', 'Slot', 'People', 'Status', 'Booked At'];
  const rows = bookings.map(b => [
    b.id, b.bookingReference, `"${b.customerName}"`, b.customerEmail,
    `"${b.offerTitle}"`, b.slotTime, b.peopleCount, b.status,
    new Date(b.bookedAt).toLocaleDateString(),
  ]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `bookings_${Date.now()}.csv`; a.click();
  URL.revokeObjectURL(url);
}

/* ─────────────────────────────────────
   SKELETON ROW
───────────────────────────────────── */
function SkeletonRow() {
  return (
    <tr>
      {[55, 65, 40, 20, 45, 20].map((w, i) => (
        <td key={i} style={{ padding: '14px 20px' }}>
          <div style={{
            height: 13, borderRadius: 8,
            width: `${w}%`,
            background: 'rgba(255,255,255,0.04)',
            animation: 'pulse 1.6s ease infinite',
          }} />
        </td>
      ))}
    </tr>
  );
}

/* ─────────────────────────────────────
   SPARKLINE CHART
───────────────────────────────────── */
function SparkChart({ data, loading }: { data: number[]; loading: boolean }) {
  const max = Math.max(...data, 1);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 64 }}>
      {data.map((v, i) => {
        const h = loading ? 12 : Math.max((v / max) * 100, 8);
        const isToday = i === data.length - 1;
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ duration: 0.55, delay: i * 0.06, ease: [0.34, 1.56, 0.64, 1] }}
              style={{
                width: '100%',
                borderRadius: '3px 3px 0 0',
                alignSelf: 'flex-end',
                background: loading
                  ? 'rgba(255,255,255,0.04)'
                  : isToday
                  ? 'linear-gradient(180deg,#39FF96,#22C55E)'
                  : 'rgba(57,255,150,0.22)',
                boxShadow: isToday ? '0 0 10px rgba(57,255,150,0.4)' : 'none',
                minHeight: 4,
              }}
              title={`${days[i]}: ${v} bookings`}
            />
            <span style={{ fontSize: 8, fontWeight: 600, color: isToday ? T.green : T.textFaint }}>
              {days[i]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────
   STAT CARD
───────────────────────────────────── */
interface StatCardProps {
  title: string; value: number; icon: any;
  loading: boolean; delay: number;
  accent?: string; trend?: number; subtext?: string;
}
function StatCard({ title, value, icon: Icon, loading, delay, accent = T.green, trend, subtext }: StatCardProps) {
  const count = useCountUp(loading ? 0 : value);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: delay / 1000, ease: [0.34, 1.56, 0.64, 1] }}
      style={{ ...cardStyle, padding: 20, position: 'relative', overflow: 'hidden', cursor: 'default', transition: 'border-color 0.2s, box-shadow 0.2s' }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = `${accent}30`;
        (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 36px rgba(0,0,0,0.35), 0 0 24px ${accent}0f`;
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = T.border;
        (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 24px rgba(0,0,0,0.28)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
      }}
    >
      {/* Glow blob */}
      <div style={{
        position: 'absolute', top: -24, right: -24, width: 80, height: 80,
        borderRadius: '50%', background: accent, opacity: 0.06,
        filter: 'blur(18px)', pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 13, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `${accent}13`, border: `1px solid ${accent}26`,
        }}>
          <Icon size={19} color={accent} strokeWidth={1.8} />
        </div>
        {trend !== undefined && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay / 1000 + 0.3 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 3,
              padding: '2px 8px', borderRadius: 99,
              fontSize: 10, fontWeight: 700,
              background: trend >= 0 ? 'rgba(57,255,150,0.09)' : 'rgba(248,113,113,0.09)',
              color: trend >= 0 ? T.green : T.red,
              border: `1px solid ${trend >= 0 ? 'rgba(57,255,150,0.2)' : 'rgba(248,113,113,0.2)'}`,
            }}
          >
            <TrendingUp size={9} style={{ transform: trend < 0 ? 'rotate(180deg)' : 'none' }} />
            {trend >= 0 ? '+' : ''}{trend}%
          </motion.div>
        )}
      </div>

      {loading ? (
        <div style={{ height: 32, width: 80, borderRadius: 8, background: 'rgba(255,255,255,0.05)', marginBottom: 6 }} />
      ) : (
        <div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1, color: T.text, marginBottom: 4, fontVariantNumeric: 'tabular-nums' }}>
          {count.toLocaleString()}
        </div>
      )}

      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.textMuted, margin: 0 }}>
        {title}
      </p>
      {subtext && <p style={{ fontSize: 10, color: T.textFaint, marginTop: 2 }}>{subtext}</p>}

      {/* Bottom glow line */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
        borderRadius: '0 0 18px 18px',
        background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
        opacity: 0, transition: 'opacity 0.2s',
      }} className="card-glow-line" />
    </motion.div>
  );
}

/* ─────────────────────────────────────
   OCCUPANCY RING
───────────────────────────────────── */
function OccupancyRing({ booked, total, loading }: { booked: number; total: number; loading: boolean }) {
  const pct = total > 0 ? Math.min((booked / total) * 100, 100) : 0;
  const r = 40, circ = 2 * Math.PI * r;
  const ringColor = pct > 80 ? T.red : pct > 60 ? T.amber : T.green;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.93 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, delay: 0.3 }}
      style={{ ...cardStyle, padding: 20 }}
    >
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.textMuted, marginBottom: 14 }}>
        Seat Occupancy
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <svg width={92} height={92} viewBox="0 0 100 100">
            <circle cx={50} cy={50} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={10} />
            <motion.circle
              cx={50} cy={50} r={r} fill="none"
              stroke={ringColor} strokeWidth={10} strokeLinecap="round"
              strokeDasharray={circ}
              initial={{ strokeDashoffset: circ }}
              animate={{ strokeDashoffset: loading ? circ : circ - (pct / 100) * circ }}
              transition={{ duration: 1.3, ease: [0.4, 0, 0.2, 1], delay: 0.5 }}
              transform="rotate(-90 50 50)"
              style={{ filter: `drop-shadow(0 0 6px ${ringColor}70)` }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 17, fontWeight: 800, color: T.text }}>
              {loading ? '–' : `${Math.round(pct)}%`}
            </span>
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { label: 'Booked',    val: booked,                  color: ringColor },
            { label: 'Available', val: Math.max(total - booked, 0), color: T.textMuted },
            { label: 'Total',     val: total,                   color: T.textFaint },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: T.textMuted }}>{label}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: loading ? T.textFaint : color }}>{loading ? '–' : val}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────
   NOTIFICATION LOG
───────────────────────────────────── */
function NotificationLog() {
  const iconMap: Record<string, any>    = { email: Mail, sms: Smartphone, whatsapp: MessageSquare };
  const colorMap: Record<string, string> = { email: T.cyan, sms: T.purple, whatsapp: T.green };
  const [filter, setFilter] = useState<'all' | 'email' | 'sms' | 'whatsapp'>('all');
  const filtered = MOCK_NOTIFICATIONS.filter(n => filter === 'all' || n.type === filter);

  return (
    <div>
      {/* Filter bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        {(['all', 'email', 'sms', 'whatsapp'] as const).map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            style={{
              padding: '5px 12px', borderRadius: 8,
              fontSize: 10, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.07em',
              cursor: 'pointer', transition: 'all 0.15s',
              background: filter === t ? T.greenDim : 'transparent',
              border: `1px solid ${filter === t ? T.greenBorder : 'transparent'}`,
              color: filter === t ? T.green : T.textMuted,
              fontFamily: 'inherit',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Entries */}
      <div>
        {filtered.map((n, i) => {
          const Icon  = iconMap[n.type];
          const color = colorMap[n.type];
          return (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i }}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                padding: '12px 20px',
                borderBottom: '1px solid rgba(255,255,255,0.03)',
                cursor: 'pointer', transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(57,255,150,0.025)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
            >
              <div style={{
                width: 30, height: 30, borderRadius: 9, flexShrink: 0, marginTop: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `${color}10`, border: `1px solid ${color}20`,
              }}>
                <Icon size={13} color={color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{n.customer}</span>
                  <span style={{
                    padding: '1px 7px', borderRadius: 99, fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
                    background: n.status === 'sent' ? 'rgba(57,255,150,0.1)' : 'rgba(248,113,113,0.1)',
                    color: n.status === 'sent' ? T.green : T.red,
                  }}>{n.status}</span>
                </div>
                <p style={{ fontSize: 11, color: T.textMuted, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.msg}</p>
              </div>
              <span style={{ fontSize: 10, color: T.textFaint, flexShrink: 0, fontFamily: 'monospace' }}>{n.time}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   MAIN DASHBOARD
═══════════════════════════════════════ */
export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalOffers: 0, activeOffers: 0, totalBookings: 0,
    todaysBookings: 0, totalCapacity: 0, bookedSeats: 0,
    availableSeats: 0, conversionRate: 0, recentBookings: [],
  });
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab,  setActiveTab]  = useState<'bookings' | 'notifications'>('bookings');

  const sparkData = useMemo(() => {
    const b = stats.totalBookings;
    return [
      Math.round(b * 0.09), Math.round(b * 0.12), Math.round(b * 0.08),
      Math.round(b * 0.15), Math.round(b * 0.11), Math.round(b * 0.18),
      stats.todaysBookings || Math.round(b * 0.14),
    ];
  }, [stats.totalBookings, stats.todaysBookings]);

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    setError(null);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      const res = await axiosClient.get('/bookings/dashboard-stats', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setStats(res.data);
    } catch {
      setError('Could not load dashboard data. Check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const topCards = [
    { title: 'Total Offers',      value: stats.totalOffers,    icon: Tags,          accent: T.green,  trend: 8,  subtext: `${stats.activeOffers} active` },
    { title: 'Active Offers',     value: stats.activeOffers,   icon: Activity,      accent: T.cyan,   trend: 5,  subtext: 'Live now' },
    { title: 'Total Bookings',    value: stats.totalBookings,  icon: Users,         accent: T.purple, trend: 12, subtext: 'All time' },
    { title: "Today's Bookings",  value: stats.todaysBookings, icon: CalendarCheck, accent: T.amber,  trend: 3,  subtext: 'Last 24h' },
  ];

  return (
    <div style={{ minHeight: '100%', background: 'transparent' }}>

      {/* Ambient top glow */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse 80% 40% at 50% -5%, rgba(57,255,150,0.06) 0%, transparent 70%)',
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1600, margin: '0 auto', padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(57,255,150,0.6)' }}>
                Admin Portal
              </span>
              <ChevronRight size={11} color={T.textFaint} />
              <span style={{ fontSize: 10, color: T.textMuted }}>Overview</span>
            </div>
            <h1 style={{
              fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: -0.5, lineHeight: 1.15,
              background: 'linear-gradient(135deg, #F7FAFC 30%, #39FF96 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              Dashboard <span style={{ fontWeight: 300 }}>Overview</span>
            </h1>
            <p style={{ fontSize: 11, color: T.textMuted, marginTop: 5 }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Refresh */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => fetchData(true)}
              title="Refresh"
              style={{
                width: 40, height: 40, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.03)', border: `1px solid ${T.border}`, color: T.textMuted, cursor: 'pointer',
              }}
            >
              <motion.div animate={refreshing ? { rotate: 360 } : {}} transition={{ duration: 0.7, repeat: refreshing ? Infinity : 0, ease: 'linear' }}>
                <RefreshCw size={15} />
              </motion.div>
            </motion.button>

            {/* New offer */}
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/admin/offers/new')}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '9px 18px', borderRadius: 12,
                background: 'linear-gradient(135deg,#39FF96,#22C55E)',
                color: '#050D18', fontWeight: 700, fontSize: 13, border: 'none',
                cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: '0 0 22px rgba(57,255,150,0.3)',
              }}
            >
              <Plus size={15} strokeWidth={2.5} /> New Offer
            </motion.button>
          </div>
        </motion.div>

        {/* ── Error banner ── */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 18px', borderRadius: 14, fontSize: 13, fontWeight: 500,
                background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.25)', color: T.red,
              }}
            >
              <AlertCircle size={17} />
              {error}
              <button
                onClick={() => fetchData()}
                style={{ marginLeft: 'auto', fontSize: 12, textDecoration: 'underline', background: 'none', border: 'none', color: T.red, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Retry
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── KPI cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14 }}>
          {topCards.map((c, i) => (
            <StatCard key={i} {...c} loading={loading} delay={i * 70} />
          ))}
          <OccupancyRing booked={stats.bookedSeats} total={stats.totalCapacity} loading={loading} />
        </div>

        {/* ── Middle row: spark / conversion / quick actions ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>

          {/* 7-day spark */}
          <motion.div
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.38 }}
            style={{ ...cardStyle, padding: 20 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 12, fontWeight: 700, color: T.text, margin: 0 }}>7-Day Bookings</h3>
                <p style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>This week's activity</p>
              </div>
              <div style={{
                width: 30, height: 30, borderRadius: 9,
                background: T.greenDim, border: `1px solid ${T.greenBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <BarChart2 size={14} color={T.green} />
              </div>
            </div>
            <SparkChart data={sparkData} loading={loading} />
          </motion.div>

          {/* Conversion rate */}
          <motion.div
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.44 }}
            style={{ ...cardStyle, padding: 20 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <h3 style={{ fontSize: 12, fontWeight: 700, color: T.text, margin: 0 }}>Conversion Rate</h3>
                <p style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>Bookings vs capacity</p>
              </div>
              <div style={{
                width: 30, height: 30, borderRadius: 9,
                background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <TrendingUp size={14} color={T.purple} />
              </div>
            </div>
            {loading
              ? <div style={{ height: 36, width: 90, borderRadius: 10, background: 'rgba(255,255,255,0.05)', marginBottom: 16 }} />
              : <div style={{ fontSize: '2.2rem', fontWeight: 800, color: T.text, marginBottom: 14, fontVariantNumeric: 'tabular-nums' }}>
                  {stats.conversionRate.toFixed(1)}%
                </div>
            }
            <div style={{ height: 6, borderRadius: 99, overflow: 'hidden', background: 'rgba(255,255,255,0.05)', marginBottom: 8 }}>
              <motion.div
                style={{ height: '100%', borderRadius: 99, background: 'linear-gradient(90deg,#A78BFA,#22D3EE)' }}
                initial={{ width: 0 }}
                animate={{ width: loading ? '0%' : `${Math.min(stats.conversionRate, 100)}%` }}
                transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1], delay: 0.6 }}
              />
            </div>
            <p style={{ fontSize: 10, color: T.textMuted }}>
              {stats.bookedSeats} booked of {stats.totalCapacity} total seats
            </p>
          </motion.div>

          {/* Quick actions */}
          <motion.div
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.50 }}
            style={{ ...cardStyle, padding: 20 }}
          >
            <p style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 14 }}>Quick Actions</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { label: 'New Offer',    icon: Plus,          path: '/admin/offers/new', accent: T.green  },
                { label: 'All Bookings', icon: CalendarCheck, path: '/admin/bookings',   accent: T.purple },
                { label: 'Manage Deals', icon: Tags,          path: '/admin/offers',     accent: T.cyan   },
                { label: 'Settings',     icon: Zap,           path: '/admin/settings',   accent: T.amber  },
              ].map((a, i) => (
                <motion.button
                  key={i}
                  whileHover={{ y: -2, scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(a.path)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    padding: '14px 8px', borderRadius: 12, cursor: 'pointer',
                    background: `${a.accent}09`, border: `1px solid ${a.accent}1c`,
                    transition: 'all 0.15s', fontFamily: 'inherit',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = `${a.accent}16`;
                    (e.currentTarget as HTMLElement).style.borderColor = `${a.accent}38`;
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 0 16px ${a.accent}18`;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = `${a.accent}09`;
                    (e.currentTarget as HTMLElement).style.borderColor = `${a.accent}1c`;
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  }}
                >
                  <a.icon size={18} strokeWidth={1.7} color={a.accent} />
                  <span style={{ fontSize: 10, fontWeight: 600, color: T.textSec }}>{a.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Bookings / Notifications panel ── */}
        <motion.div
          initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.56 }}
          style={{ ...cardStyle, overflow: 'hidden' }}
        >
          {/* Tab bar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}>
            <div style={{
              display: 'flex', gap: 4, padding: 4, borderRadius: 11,
              background: 'rgba(255,255,255,0.03)',
            }}>
              {[
                { key: 'bookings',      label: 'Recent Bookings',  icon: CalendarCheck },
                { key: 'notifications', label: 'Notification Log', icon: Bell },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 14px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
                    background: activeTab === key ? T.greenDim : 'transparent',
                    border: `1px solid ${activeTab === key ? T.greenBorder : 'transparent'}`,
                    color: activeTab === key ? T.green : T.textMuted,
                  }}
                >
                  <Icon size={12} /> {label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {activeTab === 'bookings' && (
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => exportBookingsCSV(stats.recentBookings)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 12px', borderRadius: 10, fontSize: 12, fontWeight: 600,
                    background: 'rgba(255,255,255,0.03)', border: `1px solid ${T.border}`,
                    color: T.textMuted, cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  <Download size={12} /> Export
                </motion.button>
              )}
              <motion.button
                whileHover={{ x: 2 }}
                onClick={() => navigate('/admin/bookings')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  fontSize: 11, fontWeight: 600, color: T.green,
                  background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                View all <ArrowUpRight size={13} />
              </motion.button>
            </div>
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            {activeTab === 'bookings' ? (
              <motion.div
                key="bookings"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        {['Customer', 'Offer', 'Slot Time', 'People', 'Status', 'Action'].map(h => (
                          <th key={h} style={{
                            padding: '12px 20px', textAlign: 'left',
                            fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
                            textTransform: 'uppercase', color: T.textMuted,
                          }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {loading
                        ? [...Array(4)].map((_, i) => <SkeletonRow key={i} />)
                        : stats.recentBookings.length === 0
                        ? (
                          <tr>
                            <td colSpan={6}>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0', gap: 8 }}>
                                <CalendarCheck size={32} strokeWidth={1} color="rgba(57,255,150,0.2)" />
                                <p style={{ fontSize: 13, fontWeight: 600, color: T.text, margin: 0 }}>No bookings yet</p>
                                <p style={{ fontSize: 11, color: T.textMuted, margin: 0 }}>Create an offer to start receiving bookings</p>
                              </div>
                            </td>
                          </tr>
                        )
                        : stats.recentBookings.map((b, i) => {
                          const s = STATUS[b.status] ?? STATUS['Pending'];
                          return (
                            <motion.tr
                              key={b.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.04 * i }}
                              style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.12s' }}
                              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(57,255,150,0.02)'}
                              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                            >
                              {/* Customer */}
                              <td style={{ padding: '14px 20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <div style={{
                                    width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 11, fontWeight: 800, color: T.green,
                                    background: T.greenDim, border: `1px solid ${T.greenBorder}`,
                                  }}>
                                    {b.customerName?.[0]?.toUpperCase() ?? '?'}
                                  </div>
                                  <div>
                                    <p style={{ fontSize: 12, fontWeight: 600, color: T.text, margin: 0 }}>{b.customerName}</p>
                                    <p style={{ fontSize: 10, color: T.textMuted, margin: 0 }}>{b.customerEmail}</p>
                                  </div>
                                </div>
                              </td>
                              {/* Offer */}
                              <td style={{ padding: '14px 20px' }}>
                                <span style={{ fontSize: 12, color: T.textSec }}>{b.offerTitle}</span>
                              </td>
                              {/* Slot */}
                              <td style={{ padding: '14px 20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                  <Clock size={11} color={T.textMuted} />
                                  <span style={{ fontSize: 11, fontFamily: 'monospace', color: T.textSec }}>{b.slotTime}</span>
                                </div>
                              </td>
                              {/* People */}
                              <td style={{ padding: '14px 20px' }}>
                                <span style={{ fontSize: 11, color: T.textMuted }}>× {b.peopleCount}</span>
                              </td>
                              {/* Status */}
                              <td style={{ padding: '14px 20px' }}>
                                <span style={{
                                  display: 'inline-flex', alignItems: 'center', gap: 6,
                                  padding: '3px 10px', borderRadius: 99, fontSize: 10, fontWeight: 700,
                                  textTransform: 'uppercase', letterSpacing: '0.06em',
                                  background: s.bg, color: s.color, border: `1px solid ${s.border}`,
                                }}>
                                  <motion.span
                                    animate={{ opacity: [1, 0.4, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    style={{ width: 5, height: 5, borderRadius: '50%', background: s.color, boxShadow: `0 0 5px ${s.border}`, flexShrink: 0 }}
                                  />
                                  {s.label}
                                </span>
                              </td>
                              {/* Action */}
                              <td style={{ padding: '14px 20px' }}>
                                <motion.button
                                  whileHover={{ scale: 1.15 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => navigate('/admin/bookings')}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.textMuted, padding: 4 }}
                                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = T.green}
                                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = T.textMuted}
                                >
                                  <ArrowUpRight size={15} />
                                </motion.button>
                              </td>
                            </motion.tr>
                          );
                        })
                      }
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                <NotificationLog />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

      </div>
    </div>
  );
}