import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, ChevronRight, X, Zap, TrendingUp, Calendar, Tag } from 'lucide-react';

/* ── Route label map ── */
const routeLabels: Record<string, { label: string; sub: string }> = {
  '/admin':           { label: 'Dashboard',      sub: 'Overview & analytics' },
  '/admin/offers':    { label: 'Manage Offers',  sub: 'Create & edit deals'  },
  '/admin/bookings':  { label: 'Bookings',       sub: 'All reservations'     },
  '/admin/settings':  { label: 'Settings',       sub: 'Configure your portal'},
};

/* ── Mock notifications ── */
const mockNotifs = [
  { id: 1, icon: Calendar, color: '#39FF96', text: 'New booking confirmed',       time: '2m ago',  unread: true },
  { id: 2, icon: Tag,      color: '#22D3EE', text: 'Offer "Dosa Fest" goes live', time: '18m ago', unread: true },
  { id: 3, icon: TrendingUp, color: '#A78BFA', text: 'Revenue up 12% this week',  time: '1h ago',  unread: false },
];

export default function Topbar() {
  const location = useLocation();
  const route = routeLabels[location.pathname] ?? { label: 'Admin Portal', sub: '' };

  const [searchOpen,   setSearchOpen]   = useState(false);
  const [searchVal,    setSearchVal]    = useState('');
  const [notifOpen,    setNotifOpen]    = useState(false);
  const [notifications, setNotifications] = useState(mockNotifs);

  const unreadCount = notifications.filter(n => n.unread).length;

  /* close notif panel on outside click */
  useEffect(() => {
    if (!notifOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#notif-panel') && !target.closest('#notif-btn')) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [notifOpen]);

  const markAllRead = () =>
    setNotifications(ns => ns.map(n => ({ ...n, unread: false })));

  return (
    <header
      className="relative z-30 h-16 flex items-center justify-between px-6 gap-4"
      style={{
        background: 'rgba(7, 13, 26, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(57,255,150,0.07)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.03), 0 4px 24px rgba(0,0,0,0.4)',
      }}
    >
      {/* ── Left: breadcrumb ── */}
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="flex items-center gap-2 min-w-0"
      >
        <div
          className="flex items-center justify-center w-8 h-8 rounded-xl flex-shrink-0"
          style={{
            background: 'rgba(57,255,150,0.1)',
            border: '1px solid rgba(57,255,150,0.2)',
          }}
        >
          <Zap size={14} color="#39FF96" strokeWidth={2.5} />
        </div>

        <div className="flex items-center gap-1.5 text-sm" style={{ color: '#475569' }}>
          <span>Admin</span>
          <ChevronRight size={13} />
        </div>

        <div className="min-w-0">
          <span
            className="text-sm font-semibold truncate block"
            style={{ color: '#F0FDF4' }}
          >
            {route.label}
          </span>
        </div>
      </motion.div>

      {/* ── Right: actions ── */}
      <div className="flex items-center gap-2 flex-shrink-0">

        {/* Search */}
        <AnimatePresence mode="wait">
          {searchOpen ? (
            <motion.div
              key="search-open"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 220, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="relative overflow-hidden"
            >
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: '#39FF96' }}
              />
              <input
                autoFocus
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                placeholder="Search…"
                className="w-full pl-8 pr-8 py-2 text-sm rounded-xl"
                style={{
                  background: 'rgba(57,255,150,0.06)',
                  border: '1px solid rgba(57,255,150,0.25)',
                  color: '#F0FDF4',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
                onKeyDown={e => e.key === 'Escape' && setSearchOpen(false)}
              />
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => { setSearchOpen(false); setSearchVal(''); }}
              >
                <X size={13} style={{ color: '#64748B' }} />
              </button>
            </motion.div>
          ) : (
            <motion.button
              key="search-icon"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSearchOpen(true)}
              className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200"
              style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)', color: '#64748B' }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.color = '#39FF96';
                el.style.borderColor = 'rgba(57,255,150,0.25)';
                el.style.background = 'rgba(57,255,150,0.06)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.color = '#64748B';
                el.style.borderColor = 'rgba(255,255,255,0.06)';
                el.style.background = 'rgba(255,255,255,0.03)';
              }}
              title="Search"
            >
              <Search size={16} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Notification bell */}
        <div className="relative">
          <motion.button
            id="notif-btn"
            whileTap={{ scale: 0.92 }}
            onClick={() => setNotifOpen(v => !v)}
            className="relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200"
            style={{
              border: `1px solid ${notifOpen ? 'rgba(57,255,150,0.3)' : 'rgba(255,255,255,0.06)'}`,
              background: notifOpen ? 'rgba(57,255,150,0.08)' : 'rgba(255,255,255,0.03)',
              color: notifOpen ? '#39FF96' : '#64748B',
            }}
            aria-label="Notifications"
          >
            <motion.div
              animate={unreadCount > 0 ? { rotate: [0, -12, 12, -8, 8, 0] } : {}}
              transition={{ duration: 0.5, delay: 1.5 }}
            >
              <Bell size={16} strokeWidth={1.8} />
            </motion.div>

            {/* Badge */}
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold"
                style={{
                  background: 'linear-gradient(135deg, #22C55E, #39FF96)',
                  color: '#050D18',
                  boxShadow: '0 0 8px rgba(57,255,150,0.6)',
                }}
              >
                {unreadCount}
              </motion.span>
            )}
          </motion.button>

          {/* Notification dropdown */}
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                id="notif-panel"
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
                className="absolute right-0 mt-2 w-80 rounded-2xl overflow-hidden"
                style={{
                  background: 'rgba(10, 17, 32, 0.97)',
                  border: '1px solid rgba(57,255,150,0.15)',
                  boxShadow: '0 24px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
                  backdropFilter: 'blur(24px)',
                  top: '100%',
                }}
              >
                {/* Header */}
                <div
                  className="flex items-center justify-between px-4 py-3"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <span className="text-sm font-semibold" style={{ color: '#F0FDF4' }}>
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs font-medium transition-colors"
                      style={{ color: '#39FF96' }}
                      onMouseEnter={e => ((e.target as HTMLElement).style.color = '#86EFAC')}
                      onMouseLeave={e => ((e.target as HTMLElement).style.color = '#39FF96')}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Items */}
                <div className="py-1">
                  {notifications.map((n, i) => {
                    const Icon = n.icon;
                    return (
                      <motion.div
                        key={n.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors duration-150"
                        style={{ background: n.unread ? 'rgba(57,255,150,0.03)' : 'transparent' }}
                        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)')}
                        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = n.unread ? 'rgba(57,255,150,0.03)' : 'transparent')}
                        onClick={() => setNotifications(ns => ns.map(x => x.id === n.id ? { ...x, unread: false } : x))}
                      >
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: `${n.color}18`, border: `1px solid ${n.color}30` }}
                        >
                          <Icon size={14} style={{ color: n.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium leading-snug" style={{ color: n.unread ? '#F0FDF4' : '#94A3B8' }}>
                            {n.text}
                          </p>
                          <p className="text-[10px] mt-0.5" style={{ color: '#475569' }}>{n.time}</p>
                        </div>
                        {n.unread && (
                          <div
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
                            style={{ background: '#39FF96', boxShadow: '0 0 6px rgba(57,255,150,0.7)' }}
                          />
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                {/* Footer */}
                <div
                  className="px-4 py-2.5"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <button
                    className="w-full text-xs font-medium py-1.5 rounded-xl transition-colors duration-150"
                    style={{ color: '#64748B' }}
                    onMouseEnter={e => ((e.target as HTMLElement).style.color = '#39FF96')}
                    onMouseLeave={e => ((e.target as HTMLElement).style.color = '#64748B')}
                  >
                    View all notifications
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Admin avatar chip */}
        <motion.div
          whileTap={{ scale: 0.96 }}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl cursor-pointer transition-all duration-200"
          style={{
            border: '1px solid rgba(255,255,255,0.07)',
            background: 'rgba(255,255,255,0.03)',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.borderColor = 'rgba(57,255,150,0.2)';
            el.style.background = 'rgba(57,255,150,0.05)';
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.borderColor = 'rgba(255,255,255,0.07)';
            el.style.background = 'rgba(255,255,255,0.03)';
          }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #22C55E, #39FF96)',
              color: '#050D18',
              boxShadow: '0 0 10px rgba(57,255,150,0.4)',
            }}
          >
            AD
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold leading-none mb-0.5" style={{ color: '#F0FDF4' }}>Admin</p>
            <p className="text-[10px] leading-none" style={{ color: '#39FF96', opacity: 0.8 }}>Online</p>
          </div>
        </motion.div>
      </div>
    </header>
  );
}
