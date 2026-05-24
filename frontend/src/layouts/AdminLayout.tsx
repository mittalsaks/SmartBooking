import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Tags, Calendar, Settings,
  LogOut, Bell, ExternalLink, X, ChevronRight
} from 'lucide-react';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    const clock = setInterval(() => setTime(new Date()), 1000);
    return () => { window.removeEventListener('scroll', onScroll); clearInterval(clock); };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard',     path: '/admin',           icon: LayoutDashboard },
    { name: 'Manage Offers', path: '/admin/offers',    icon: Tags            },
    { name: 'Bookings',      path: '/admin/bookings',  icon: Calendar        },
    { name: 'Settings',      path: '/admin/settings',  icon: Settings        },
  ];

  const greetingHour = time.getHours();
  const greeting = greetingHour < 12 ? 'Good morning' : greetingHour < 17 ? 'Good afternoon' : 'Good evening';

  const currentTitle = navItems.find((item) =>
    location.pathname === item.path ||
    (item.path !== '/admin' && location.pathname.startsWith(item.path))
  )?.name || 'Admin Portal';

  const notifications = [
    { id: 1, title: 'New booking received', body: 'for "50% off Pizza"', time: '2m ago' },
    { id: 2, title: 'Offer filling up',     body: '"Masala Dosa" has 18 slots filled', time: '14m ago' },
    { id: 3, title: 'Offer expired',        body: '"50% off Pizza" has expired', time: '1h ago' },
  ];

  return (
    <div
      className="flex h-screen overflow-hidden text-white font-sans"
      style={{
        background: '#070D1A',
        fontFamily: "'Space Grotesk', 'Segoe UI', system-ui, sans-serif",
        colorScheme: 'dark',
      }}
    >
      {/* ── Ambient background ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.012) 1px,transparent 1px),' +
            'linear-gradient(90deg,rgba(255,255,255,0.012) 1px,transparent 1px)',
          backgroundSize: '40px 40px',
          zIndex: 0,
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          top: '10%', left: '15%', width: 500, height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle,rgba(57,255,150,0.04) 0%,transparent 70%)',
          filter: 'blur(40px)',
          zIndex: 0,
        }}
      />

      {/* ═══════════════════════════════
          SIDEBAR
      ═══════════════════════════════ */}
      <aside
        className="flex-shrink-0 flex flex-col relative z-20"
        style={{
          width: 248,
          background: 'rgba(7,13,26,0.96)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '4px 0 32px rgba(0,0,0,0.4)',
        }}
      >
        {/* Logo */}
        <div style={{ padding: '28px 24px 22px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div
            style={{
              fontSize: 22, fontWeight: 900, letterSpacing: -0.5,
              background: 'linear-gradient(135deg,#ffffff 30%,#39FF96 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              lineHeight: 1.1,
            }}
          >
            Smart<span style={{ fontWeight: 300 }}>Booking</span>
          </div>
          <div
            style={{
              fontSize: 10, color: 'rgba(57,255,150,0.55)', marginTop: 8,
              letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600,
              fontFamily: 'monospace',
            }}
          >
            {greeting}, Admin
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map(({ name, path, icon: Icon }) => {
            const isActive =
              location.pathname === path ||
              (path !== '/admin' && location.pathname.startsWith(path));
            return (
              <Link
                key={name}
                to={path}
                style={{
                  display: 'flex', alignItems: 'center', gap: 11,
                  padding: '11px 14px', borderRadius: 12,
                  border: isActive ? '1px solid rgba(57,255,150,0.25)' : '1px solid transparent',
                  background: isActive ? 'rgba(57,255,150,0.08)' : 'transparent',
                  color: isActive ? '#39FF96' : '#64748B',
                  fontWeight: 600, fontSize: 13, textDecoration: 'none',
                  transition: 'all 0.2s',
                  position: 'relative',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                    (e.currentTarget as HTMLElement).style.color = '#CBD5E1';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                    (e.currentTarget as HTMLElement).style.color = '#64748B';
                  }
                }}
              >
                <Icon
                  size={17}
                  color={isActive ? '#39FF96' : 'currentColor'}
                  style={{ flexShrink: 0 }}
                />
                <span style={{ flex: 1 }}>{name}</span>
                {isActive && (
                  <span
                    style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: '#39FF96',
                      boxShadow: '0 0 8px rgba(57,255,150,0.8)',
                      animation: 'pulse 2s infinite',
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '9px 14px', borderRadius: 12,
              background: 'rgba(57,255,150,0.08)',
              border: '1px solid rgba(57,255,150,0.22)',
              color: '#39FF96', fontWeight: 600, fontSize: 13,
              textDecoration: 'none', transition: 'all 0.15s',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(57,255,150,0.14)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(57,255,150,0.08)')}
          >
            <ExternalLink size={14} />
            View Public Portal
          </a>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '9px 14px', borderRadius: 12,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              color: '#64748B', fontWeight: 600, fontSize: 13,
              cursor: 'pointer', transition: 'all 0.15s',
              width: '100%', textAlign: 'left',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.08)';
              (e.currentTarget as HTMLElement).style.color = '#F87171';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(248,113,113,0.2)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
              (e.currentTarget as HTMLElement).style.color = '#64748B';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)';
            }}
          >
            <LogOut size={14} />
            Secure Logout
          </button>
        </div>
      </aside>

      {/* ═══════════════════════════════
          MAIN CONTENT
      ═══════════════════════════════ */}
      <div className="flex-1 flex flex-col relative z-10 overflow-hidden">

        {/* ── Topbar ── */}
        <header
          style={{
            height: 72,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 32px',
            background: scrolled ? 'rgba(7,13,26,0.92)' : 'transparent',
            borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
            backdropFilter: scrolled ? 'blur(20px)' : 'none',
            position: 'sticky', top: 0, zIndex: 30,
            transition: 'all 0.3s ease',
            flexShrink: 0,
          }}
        >
          {/* Left: breadcrumb + title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20, color: '#39FF96', filter: 'drop-shadow(0 0 8px rgba(57,255,150,0.5))' }}>
              ✨
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  fontSize: 10, fontWeight: 700, color: 'rgba(57,255,150,0.55)',
                  letterSpacing: '0.12em', textTransform: 'uppercase',
                }}
              >
                Admin
              </span>
              <ChevronRight size={12} color="rgba(255,255,255,0.2)" />
              <h1
                style={{
                  fontSize: 16, fontWeight: 900, color: '#F0FDF4',
                  margin: 0, letterSpacing: 0.5,
                }}
              >
                {currentTitle}
              </h1>
            </div>
          </div>

          {/* Right: clock + bell + avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>

            {/* Live clock */}
            <div
              style={{
                fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: '#39FF96',
                background: 'rgba(57,255,150,0.08)',
                border: '1px solid rgba(57,255,150,0.22)',
                borderRadius: 9, padding: '5px 12px',
                letterSpacing: 2,
              }}
            >
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>

            {/* Bell */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotifications(o => !o)}
                style={{
                  width: 40, height: 40, borderRadius: 11,
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${showNotifications ? 'rgba(57,255,150,0.3)' : 'rgba(255,255,255,0.08)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', position: 'relative', transition: 'all 0.2s',
                }}
              >
                <Bell size={17} color={showNotifications ? '#39FF96' : '#64748B'} />
                <span
                  style={{
                    position: 'absolute', top: 9, right: 9,
                    width: 8, height: 8,
                    background: '#39FF96', borderRadius: '50%',
                    border: '2px solid #070D1A',
                    boxShadow: '0 0 6px rgba(57,255,150,0.8)',
                  }}
                />
              </button>

              {showNotifications && (
                <div
                  style={{
                    position: 'absolute', top: 50, right: 0, width: 300,
                    background: 'rgba(11,20,38,0.97)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 16,
                    backdropFilter: 'blur(24px)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
                    padding: 16, zIndex: 100,
                  }}
                >
                  <div
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      marginBottom: 12, paddingBottom: 10,
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 800, fontSize: 11, letterSpacing: '0.1em',
                        textTransform: 'uppercase', color: '#F0FDF4',
                      }}
                    >
                      System Alerts
                    </span>
                    <button
                      onClick={() => setShowNotifications(false)}
                      style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: 2 }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {notifications.map(n => (
                      <div
                        key={n.id}
                        style={{
                          padding: '10px 12px', borderRadius: 10,
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.06)',
                          cursor: 'pointer', transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLElement).style.background = 'rgba(57,255,150,0.06)';
                          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(57,255,150,0.2)';
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
                          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)';
                        }}
                      >
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#F0FDF4', marginBottom: 2 }}>
                          {n.title}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 11, color: '#64748B' }}>{n.body}</span>
                          <span style={{ fontSize: 10, color: '#39FF96', fontFamily: 'monospace' }}>{n.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Avatar */}
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                paddingLeft: 16, borderLeft: '1px solid rgba(255,255,255,0.08)',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: 'linear-gradient(135deg,#39FF96,#22C55E)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 900, fontSize: 13, color: '#050D18',
                  boxShadow: '0 0 14px rgba(57,255,150,0.35)',
                  flexShrink: 0,
                }}
              >
                AU
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#F0FDF4' }}>Admin profile</div>
                <div style={{ fontSize: 10, color: '#64748B', fontFamily: 'monospace' }}>System Admin</div>
              </div>
            </div>
          </div>
        </header>

        {/* ── Page outlet ── */}
        <main
          style={{
            flex: 1, overflowY: 'auto',
            scrollbarWidth: 'thin',
            scrollbarColor: '#1E293B transparent',
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}