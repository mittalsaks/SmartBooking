import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Tags, CalendarCheck, Settings,
  ExternalLink, LogOut, Zap, ChevronRight, Shield
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard',      path: '/admin',          icon: LayoutDashboard, badge: null },
  { name: 'Manage Offers',  path: '/admin/offers',   icon: Tags,            badge: null },
  { name: 'Bookings',       path: '/admin/bookings', icon: CalendarCheck,   badge: 'NEW' },
  { name: 'Settings',       path: '/admin/settings', icon: Settings,        badge: null },
];

/* tiny animated dot used as decorative particles */
function SidebarParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-brandGreen/30"
          style={{ left: `${10 + i * 15}%`, top: `${15 + i * 12}%` }}
          animate={{ y: [0, -12, 0], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 3 + i * 0.7, repeat: Infinity, delay: i * 0.4, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

export default function Sidebar() {
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('token');
    window.location.href = '/admin/login';
  };

  return (
    <motion.aside
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
      className="relative w-64 min-h-screen flex flex-col overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, rgba(13,21,37,0.98) 0%, rgba(10,17,32,0.98) 100%)',
        borderRight: '1px solid rgba(57,255,150,0.08)',
        backdropFilter: 'blur(24px)',
      }}
    >
      {/* Decorative top glow */}
      <div
        className="absolute top-0 left-0 right-0 h-40 pointer-events-none"
        aria-hidden
        style={{
          background: 'radial-gradient(ellipse at 50% -20%, rgba(57,255,150,0.12) 0%, transparent 70%)',
        }}
      />

      {/* Decorative bottom glow */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        aria-hidden
        style={{
          background: 'radial-gradient(ellipse at 50% 120%, rgba(57,255,150,0.06) 0%, transparent 70%)',
        }}
      />

      <SidebarParticles />

      {/* ── Logo ── */}
      <div className="relative px-6 pt-7 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          <div className="flex items-center gap-2.5 mb-1">
            {/* Logo icon */}
            <motion.div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #22C55E 0%, #39FF96 100%)',
                boxShadow: '0 0 20px rgba(57,255,150,0.45)',
              }}
              animate={{ boxShadow: ['0 0 16px rgba(57,255,150,0.4)', '0 0 28px rgba(57,255,150,0.7)', '0 0 16px rgba(57,255,150,0.4)'] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Zap size={16} color="#050D18" strokeWidth={2.5} />
            </motion.div>

            <span
              className="text-xl font-bold tracking-tight"
              style={{
                background: 'linear-gradient(135deg, #fff 30%, #39FF96 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              SmartBooking
            </span>
          </div>

          <div className="flex items-center gap-1.5 ml-0.5">
            <Shield size={10} color="#39FF96" />
            <span
              className="text-[10px] font-semibold tracking-[0.18em] uppercase"
              style={{ color: 'rgba(57,255,150,0.7)' }}
            >
              Admin Portal
            </span>
          </div>
        </motion.div>
      </div>

      {/* ── Nav Items ── */}
      <nav className="flex-1 px-3 py-5 space-y-1" aria-label="Admin navigation">
        <p
          className="px-3 mb-3 text-[10px] font-semibold tracking-[0.14em] uppercase"
          style={{ color: 'rgba(100,116,139,0.7)' }}
        >
          Main Menu
        </p>

        {navItems.map((item, i) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.07, duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            >
              <Link
                to={item.path}
                className="group relative flex items-center gap-3 px-3 py-2.5 rounded-[14px] transition-all duration-200"
                style={isActive ? {
                  background: 'rgba(57,255,150,0.1)',
                  border: '1px solid rgba(57,255,150,0.25)',
                  boxShadow: 'inset 0 0 24px rgba(57,255,150,0.05), 0 0 16px rgba(57,255,150,0.12)',
                  color: '#39FF96',
                } : {
                  border: '1px solid transparent',
                  color: '#64748B',
                }}
              >
                {/* Active left bar */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="activeBar"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 rounded-r-full"
                      style={{
                        height: '60%',
                        background: 'linear-gradient(180deg, #22C55E, #39FF96)',
                        boxShadow: '0 0 8px rgba(57,255,150,0.8)',
                      }}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      exit={{ scaleY: 0 }}
                      transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
                    />
                  )}
                </AnimatePresence>

                {/* Icon */}
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-xl flex-shrink-0 transition-all duration-200"
                  style={isActive ? {
                    background: 'rgba(57,255,150,0.15)',
                    boxShadow: '0 0 12px rgba(57,255,150,0.3)',
                  } : {
                    background: 'rgba(255,255,255,0.04)',
                  }}
                >
                  <Icon
                    size={17}
                    strokeWidth={isActive ? 2.2 : 1.8}
                    style={{ color: isActive ? '#39FF96' : 'currentColor' }}
                  />
                </div>

                {/* Label */}
                <span
                  className="flex-1 text-sm font-medium tracking-[0.01em] transition-colors duration-200"
                  style={{ color: isActive ? '#39FF96' : undefined }}
                >
                  {item.name}
                </span>

                {/* Badge */}
                {item.badge && (
                  <span
                    className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded-full"
                    style={{
                      background: 'rgba(57,255,150,0.15)',
                      color: '#39FF96',
                      border: '1px solid rgba(57,255,150,0.3)',
                    }}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Hover arrow */}
                {!isActive && (
                  <ChevronRight
                    size={14}
                    className="opacity-0 group-hover:opacity-60 transition-opacity duration-200 -translate-x-1 group-hover:translate-x-0"
                    style={{ color: '#64748B' }}
                  />
                )}

                {/* Hover bg */}
                {!isActive && (
                  <div
                    className="absolute inset-0 rounded-[14px] opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                    aria-hidden
                  />
                )}
              </Link>
            </motion.div>
          );
        })}

        {/* ── Divider ── */}
        <div
          className="my-4 mx-3"
          style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(57,255,150,0.15), transparent)' }}
          aria-hidden
        />

        {/* ── View Public Deals ── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.42, duration: 0.35 }}
        >
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 px-3 py-2.5 rounded-[14px] transition-all duration-200"
            style={{
              border: '1px solid rgba(57,255,150,0.18)',
              background: 'rgba(57,255,150,0.04)',
              color: '#39FF96',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(57,255,150,0.1)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 0 16px rgba(57,255,150,0.15)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(57,255,150,0.04)';
              (e.currentTarget as HTMLElement).style.boxShadow = 'none';
            }}
          >
            <div
              className="flex items-center justify-center w-8 h-8 rounded-xl flex-shrink-0"
              style={{ background: 'rgba(57,255,150,0.12)' }}
            >
              <ExternalLink size={16} strokeWidth={2} />
            </div>
            <span className="flex-1 text-sm font-medium">Public Deals</span>
            <motion.div
              animate={{ x: [0, 3, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ExternalLink size={12} style={{ opacity: 0.5 }} />
            </motion.div>
          </Link>
        </motion.div>
      </nav>

      {/* ── User card + logout ── */}
      <motion.div
        className="px-3 pb-5 pt-3 space-y-2"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        {/* Admin identity chip */}
        <div
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-[14px] mb-1"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #22C55E, #39FF96)',
              color: '#050D18',
              boxShadow: '0 0 12px rgba(57,255,150,0.35)',
            }}
          >
            AD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">Administrator</p>
            <p className="text-[10px] truncate" style={{ color: 'rgba(57,255,150,0.7)' }}>
              admin@smartbooking
            </p>
          </div>
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{
              background: '#39FF96',
              boxShadow: '0 0 8px rgba(57,255,150,0.8)',
            }}
          />
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-[14px] transition-all duration-200"
          style={{ border: '1px solid transparent', color: '#64748B' }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.background = 'rgba(248,113,113,0.08)';
            el.style.borderColor = 'rgba(248,113,113,0.2)';
            el.style.color = '#F87171';
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.background = 'transparent';
            el.style.borderColor = 'transparent';
            el.style.color = '#64748B';
          }}
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-xl flex-shrink-0" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <LogOut size={16} strokeWidth={1.8} />
          </div>
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </motion.div>
    </motion.aside>
  );
}
