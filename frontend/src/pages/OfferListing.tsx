import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Calendar, CheckCircle, X,
  ArrowUpDown, AlertCircle, RefreshCw, Sparkles,
  ChevronDown, SlidersHorizontal,
} from 'lucide-react';
import axiosClient from '../api/axiosClient';
import CountdownTimer from '../components/CountdownTimer';

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
  cardHover:   'rgba(14,26,46,0.95)',
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
   TYPES
───────────────────────────────────── */
interface Offer {
  id: number;
  title: string;
  businessName: string;
  businessType: string;
  category: string;
  originalPrice: number;
  offerPrice: number;
  discountPercentage: number;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  totalCapacity: number;
  maxBookingPerCustomer: number;
  availableSlotsCount: number;
  canBook: boolean;
  status: string;
  imageUrl?: string;
}

interface Filters {
  businessType: string[];
  category: string[];
  priceMin: number;
  priceMax: number;
  availableOnly: boolean;
}

type SortOption = 'newest' | 'discount' | 'price' | 'expiring' | 'popular';

const calculateDiscount = (original: number, offer: number) =>
  Math.round(((original - offer) / original) * 100);

/* ─────────────────────────────────────
   OFFER CARD
───────────────────────────────────── */
function OfferCard({ offer, index }: { offer: Offer; index: number }) {
  const discount = calculateDiscount(offer.originalPrice, offer.offerPrice);
  const imgUrl   = getImageUrl(offer.imageUrl);

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.34, 1.56, 0.64, 1] }}
      style={{
        ...cardStyle,
        overflow: 'hidden',
        transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
        cursor: 'pointer',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = T.borderHover;
        el.style.boxShadow   = `0 8px 40px rgba(0,0,0,0.4), 0 0 24px rgba(57,255,150,0.08)`;
        el.style.transform   = 'translateY(-3px)';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = T.border;
        el.style.boxShadow   = '0 4px 24px rgba(0,0,0,0.28)';
        el.style.transform   = 'translateY(0)';
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', height: 200, overflow: 'hidden', background: 'rgba(255,255,255,0.03)' }}>
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={offer.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.06)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, rgba(57,255,150,0.05), rgba(34,211,238,0.05))',
            fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.textMuted,
          }}>
            No Image
          </div>
        )}
        {/* Overlay gradient */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(7,13,26,0.85) 0%, rgba(7,13,26,0.1) 50%, transparent 100%)',
        }} />
        {/* Category pill */}
        <div style={{
          position: 'absolute', bottom: 12, left: 12,
          padding: '3px 10px', borderRadius: 99,
          background: 'rgba(7,13,26,0.75)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.12)',
          fontSize: 9, fontWeight: 700, letterSpacing: '0.15em',
          textTransform: 'uppercase', color: T.textSec,
        }}>
          {offer.category}
        </div>
        {/* Discount badge */}
        <div style={{
          position: 'absolute', top: 12, right: 12,
          padding: '4px 10px', borderRadius: 99,
          background: 'rgba(248,113,113,0.15)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(248,113,113,0.35)',
          fontSize: 11, fontWeight: 800, color: T.red,
        }}>
          -{discount}%
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '16px 18px 18px' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: T.text, margin: '0 0 3px', lineHeight: 1.3 }}>
          {offer.title}
        </h3>
        <p style={{ fontSize: 11, color: T.textMuted, margin: '0 0 12px' }}>
          {offer.businessName} · {offer.businessType}
        </p>

        {/* Pricing */}
        <div style={{
          padding: '10px 12px', borderRadius: 12, marginBottom: 12,
          background: T.greenDim, border: `1px solid ${T.greenBorder}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: T.green, fontVariantNumeric: 'tabular-nums' }}>
              ₹{offer.offerPrice.toFixed(2)}
            </span>
            <span style={{ fontSize: 12, color: T.textMuted, textDecoration: 'line-through' }}>
              ₹{offer.originalPrice.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Slots + Timer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle size={13} color={T.green} />
            <span style={{ fontSize: 11, color: T.textSec }}>
              <strong style={{ color: T.text }}>{offer.availableSlotsCount}</strong> slot{offer.availableSlotsCount !== 1 ? 's' : ''} available
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={13} color={T.amber} />
            <CountdownTimer targetDate={offer.endDate} />
          </div>
        </div>

        {!offer.canBook && (
          <div style={{
            marginBottom: 12, padding: '6px', borderRadius: 10, textAlign: 'center',
            background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.2)',
            fontSize: 11, fontWeight: 700, color: T.red,
          }}>
            Sold Out
          </div>
        )}

        <Link
          to={`/offers/${offer.id}`}
          onClick={e => !offer.canBook && e.preventDefault()}
          style={{
            display: 'block', width: '100%', textAlign: 'center',
            padding: '11px', borderRadius: 12,
            background: offer.canBook
              ? 'linear-gradient(135deg,#39FF96,#22C55E)'
              : 'rgba(255,255,255,0.05)',
            color: offer.canBook ? '#050D18' : T.textMuted,
            fontWeight: 700, fontSize: 13,
            textDecoration: 'none',
            cursor: offer.canBook ? 'pointer' : 'not-allowed',
            boxShadow: offer.canBook ? '0 0 20px rgba(57,255,150,0.22)' : 'none',
            transition: 'all 0.2s',
            border: offer.canBook ? 'none' : `1px solid ${T.border}`,
          }}
        >
          {offer.canBook ? 'Book Now' : 'Sold Out'}
        </Link>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════ */
export default function OfferListing() {
  const [allOffers,      setAllOffers]      = useState<Offer[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<Offer[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState<string | null>(null);
  const [showFilters,    setShowFilters]    = useState(false);
  const [searchQuery,    setSearchQuery]    = useState('');
  const [sortBy,         setSortBy]         = useState<SortOption>('newest');
  const [filters,        setFilters]        = useState<Filters>({
    businessType: [], category: [], priceMin: 0, priceMax: 5000, availableOnly: false,
  });
  const [businessTypes, setBusinessTypes] = useState<string[]>([]);
  const [categories,    setCategories]    = useState<string[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);

  const fetchOffers = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const response = await axiosClient.get('/offers');
      if (!Array.isArray(response.data)) {
        setAllOffers([]);
      } else {
        setAllOffers(response.data);
        setFilteredOffers(response.data);
        setBusinessTypes(Array.from(new Set(response.data.map((o: Offer) => o.businessType).filter(Boolean))) as string[]);
        setCategories(Array.from(new Set(response.data.map((o: Offer) => o.category).filter(Boolean))) as string[]);
      }
    } catch (err: any) {
      if (err.response?.status === 404)      setError('API endpoint not found. Check backend is running.');
      else if (err.response?.status === 500) setError('Server error. Check backend logs.');
      else if (!err.response)                setError('Unable to connect to API. Is the backend running on port 5237?');
      else                                   setError(err.response?.data?.message || err.message || 'Failed to fetch offers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOffers();
    const handleStorage    = (e: StorageEvent) => { if (e.key === 'afterOfferChange' && e.newValue) fetchOffers(); };
    const handleVisibility = () => { if (!document.hidden) fetchOffers(); };
    window.addEventListener('storage', handleStorage);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('storage', handleStorage);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [fetchOffers]);

  useEffect(() => {
    let result = allOffers;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(o => o.title.toLowerCase().includes(q) || o.businessName?.toLowerCase().includes(q));
    }
    if (filters.businessType.length > 0) result = result.filter(o => filters.businessType.includes(o.businessType));
    if (filters.category.length > 0)     result = result.filter(o => filters.category.includes(o.category));
    result = result.filter(o => o.offerPrice >= filters.priceMin && o.offerPrice <= filters.priceMax);
    if (filters.availableOnly) result = result.filter(o => o.canBook);
    result = applySorting(result, sortBy);
    setFilteredOffers(result);
  }, [filters, allOffers, searchQuery, sortBy]);

  const applySorting = (offers: Offer[], s: SortOption): Offer[] => {
    const r = [...offers];
    switch (s) {
      case 'discount':  return r.sort((a, b) => calculateDiscount(b.originalPrice, b.offerPrice) - calculateDiscount(a.originalPrice, a.offerPrice));
      case 'price':     return r.sort((a, b) => a.offerPrice - b.offerPrice);
      case 'expiring':  return r.sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
      case 'popular':   return r.sort((a, b) => b.availableSlotsCount - a.availableSlotsCount);
      default:          return r;
    }
  };

  const toggleBusinessType = (type: string) =>
    setFilters(prev => ({ ...prev, businessType: prev.businessType.includes(type) ? prev.businessType.filter(t => t !== type) : [...prev.businessType, type] }));

  const toggleCategory = (cat: string) =>
    setFilters(prev => ({ ...prev, category: prev.category.includes(cat) ? prev.category.filter(c => c !== cat) : [...prev.category, cat] }));

  const resetFilters = () => {
    setFilters({ businessType: [], category: [], priceMin: 0, priceMax: 5000, availableOnly: false });
    setSearchQuery(''); setSortBy('newest');
  };

  const activeFilterCount = filters.businessType.length + filters.category.length + (filters.availableOnly ? 1 : 0);

  /* ── Loading ── */
  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent' }}>
      <div style={{ textAlign: 'center' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${T.greenBorder}`, borderTopColor: T.green, margin: '0 auto 16px' }}
        />
        <p style={{ color: T.textMuted, fontSize: 13, fontWeight: 600 }}>Loading deals...</p>
      </div>
    </div>
  );

  /* ── Error ── */
  if (error) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <div style={{ ...cardStyle, padding: 32, textAlign: 'center', maxWidth: 420 }}>
        <AlertCircle size={36} color={T.red} style={{ margin: '0 auto 16px' }} />
        <p style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 8 }}>Error Loading Offers</p>
        <p style={{ fontSize: 12, color: T.textMuted, marginBottom: 20, lineHeight: 1.6 }}>{error}</p>
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={fetchOffers}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '10px 20px', borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg,#39FF96,#22C55E)',
            color: '#050D18', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          <RefreshCw size={14} /> Retry
        </motion.button>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px', position: 'relative' }}>

      {/* Ambient glow */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse 80% 40% at 50% -5%, rgba(57,255,150,0.05) 0%, transparent 70%)',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: T.greenDim, border: `1px solid ${T.greenBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Sparkles size={15} color={T.green} />
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(57,255,150,0.6)' }}>
                Live Deals
              </span>
            </div>
            <h1 style={{
              fontSize: 30, fontWeight: 800, margin: 0, letterSpacing: -0.5,
              background: 'linear-gradient(135deg, #F7FAFC 30%, #39FF96 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              Active <span style={{ fontWeight: 300 }}>Deals</span>
            </h1>
          </div>

          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowFilters(!showFilters)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '9px 18px', borderRadius: 12, border: 'none',
              background: showFilters ? T.greenDim : 'rgba(255,255,255,0.04)',
              border: `1px solid ${showFilters ? T.greenBorder : T.border}`,
              boxShadow: `inset 0 0 0 1px ${showFilters ? T.greenBorder : T.border}`,
              color: showFilters ? T.green : T.textSec,
              fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.2s',
            }}
          >
            <SlidersHorizontal size={15} />
            Filters
            {activeFilterCount > 0 && (
              <span style={{
                padding: '1px 6px', borderRadius: 99, fontSize: 10, fontWeight: 800,
                background: T.green, color: '#050D18',
              }}>
                {activeFilterCount}
              </span>
            )}
          </motion.button>
        </motion.div>

        {/* ── Search ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{ position: 'relative', marginBottom: 16 }}
        >
          <Search size={16} color={searchFocused ? T.green : T.textMuted} style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            transition: 'color 0.2s',
          }} />
          <input
            type="text"
            placeholder="Search by offer name or business..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{
              width: '100%', padding: '12px 14px 12px 42px',
              borderRadius: 14, fontSize: 13, fontWeight: 500,
              color: T.text, background: T.card,
              border: `1px solid ${searchFocused ? 'rgba(57,255,150,0.4)' : T.border}`,
              outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
              boxShadow: searchFocused ? '0 0 0 3px rgba(57,255,150,0.08)' : 'none',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', color: T.textMuted, padding: 2,
            }}>
              <X size={15} />
            </button>
          )}
        </motion.div>

        {/* ── Filters Panel ── */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              style={{ overflow: 'hidden', marginBottom: 16 }}
            >
              <div style={{ ...cardStyle, padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Filter Offers</span>
                  <button onClick={() => setShowFilters(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.textMuted }}>
                    <X size={18} />
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24 }}>
                  {/* Business Type */}
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.textMuted, marginBottom: 10 }}>Business Type</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {businessTypes.length === 0
                        ? <span style={{ fontSize: 11, color: T.textMuted }}>None available</span>
                        : businessTypes.map(type => (
                          <label key={type} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                            <input type="checkbox" checked={filters.businessType.includes(type)} onChange={() => toggleBusinessType(type)}
                              style={{ accentColor: T.green, width: 14, height: 14 }} />
                            <span style={{ fontSize: 12, color: T.textSec }}>{type}</span>
                          </label>
                        ))
                      }
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.textMuted, marginBottom: 10 }}>Category</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {categories.length === 0
                        ? <span style={{ fontSize: 11, color: T.textMuted }}>None available</span>
                        : categories.map(cat => (
                          <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                            <input type="checkbox" checked={filters.category.includes(cat)} onChange={() => toggleCategory(cat)}
                              style={{ accentColor: T.green, width: 14, height: 14 }} />
                            <span style={{ fontSize: 12, color: T.textSec }}>{cat}</span>
                          </label>
                        ))
                      }
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.textMuted, marginBottom: 10 }}>Price Range</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div>
                        <span style={{ fontSize: 11, color: T.textSec }}>Min: ₹{filters.priceMin}</span>
                        <input type="range" min="0" max="5000" step="10" value={filters.priceMin}
                          onChange={e => setFilters(p => ({ ...p, priceMin: parseInt(e.target.value) }))}
                          style={{ width: '100%', accentColor: T.green, marginTop: 4 }} />
                      </div>
                      <div>
                        <span style={{ fontSize: 11, color: T.textSec }}>Max: ₹{filters.priceMax}</span>
                        <input type="range" min="0" max="5000" step="10" value={filters.priceMax}
                          onChange={e => setFilters(p => ({ ...p, priceMax: parseInt(e.target.value) }))}
                          style={{ width: '100%', accentColor: T.green, marginTop: 4 }} />
                      </div>
                    </div>
                  </div>

                  {/* Availability */}
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.textMuted, marginBottom: 10 }}>Availability</p>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <input type="checkbox" checked={filters.availableOnly}
                        onChange={e => setFilters(p => ({ ...p, availableOnly: e.target.checked }))}
                        style={{ accentColor: T.green, width: 14, height: 14 }} />
                      <span style={{ fontSize: 12, color: T.textSec }}>Available Only</span>
                    </label>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={resetFilters}
                  style={{
                    marginTop: 20, padding: '8px 18px', borderRadius: 10, border: `1px solid ${T.border}`,
                    background: 'rgba(255,255,255,0.03)', color: T.textMuted,
                    fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  Reset Filters
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Sort & Count ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}
        >
          <p style={{ fontSize: 12, color: T.textMuted }}>
            <strong style={{ color: T.text }}>{filteredOffers.length}</strong> offer{filteredOffers.length !== 1 ? 's' : ''} found
            {(filters.businessType.length > 0 || filters.category.length > 0 || filters.availableOnly || searchQuery) && (
              <span style={{ color: T.green }}> (filtered)</span>
            )}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ArrowUpDown size={13} color={T.textMuted} />
            <div style={{ position: 'relative' }}>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as SortOption)}
                style={{
                  padding: '7px 32px 7px 12px', borderRadius: 10, fontSize: 12, fontWeight: 600,
                  color: T.text, background: T.card, border: `1px solid ${T.border}`,
                  outline: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  appearance: 'none',
                }}
              >
                <option value="newest" style={{ background: '#0d1b2e' }}>Newest</option>
                <option value="discount" style={{ background: '#0d1b2e' }}>Highest Discount</option>
                <option value="price" style={{ background: '#0d1b2e' }}>Lowest Price</option>
                <option value="expiring" style={{ background: '#0d1b2e' }}>Expiring Soon</option>
                <option value="popular" style={{ background: '#0d1b2e' }}>Most Popular</option>
              </select>
              <ChevronDown size={12} color={T.textMuted} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>
          </div>
        </motion.div>

        {/* ── Empty state ── */}
        {filteredOffers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{
              ...cardStyle, padding: '60px 24px', textAlign: 'center',
              border: `1px dashed ${T.border}`,
            }}
          >
            <Sparkles size={36} color="rgba(57,255,150,0.2)" style={{ margin: '0 auto 16px' }} />
            <p style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 6 }}>No offers match your filters.</p>
            <p style={{ fontSize: 12, color: T.textMuted, marginBottom: 20 }}>Try adjusting your search or filters.</p>
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={resetFilters}
              style={{
                padding: '9px 20px', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg,#39FF96,#22C55E)',
                color: '#050D18', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Reset Filters
            </motion.button>
          </motion.div>
        ) : (
          /* ── Grid ── */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {filteredOffers.map((offer, i) => (
              <OfferCard key={offer.id} offer={offer} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}