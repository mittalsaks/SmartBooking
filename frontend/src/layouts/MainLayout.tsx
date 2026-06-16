import { Link, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function MainLayout() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@700;800;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #070D1A;
          min-height: 100vh;
          font-family: 'Space Grotesk', system-ui, sans-serif;
          color: #F0FDF4;
        }

        /* ── Root ── */
        .public-root {
          min-height: 100vh;
          background: #070D1A;
          position: relative;
          overflow-x: hidden;
        }

        /* ── Mesh background ── */
        .mesh-bg {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }
        .mesh-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.013) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.013) 1px, transparent 1px);
          background-size: 50px 50px;
        }
        .mesh-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
        }
        .mesh-orb-1 {
          width: 680px; height: 500px;
          top: -180px; left: -180px;
          background: radial-gradient(circle, rgba(57,255,150,0.07) 0%, transparent 70%);
          animation: orbit1 22s ease-in-out infinite;
        }
        .mesh-orb-2 {
          width: 560px; height: 560px;
          top: 45%; right: -160px;
          background: radial-gradient(circle, rgba(34,211,238,0.05) 0%, transparent 70%);
          animation: orbit2 28s ease-in-out infinite;
        }
        .mesh-orb-3 {
          width: 480px; height: 380px;
          bottom: -80px; left: 28%;
          background: radial-gradient(circle, rgba(167,139,250,0.05) 0%, transparent 70%);
          animation: orbit3 20s ease-in-out infinite;
        }
        @keyframes orbit1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(90px, 70px) scale(1.08); }
          66%       { transform: translate(-50px, 130px) scale(0.93); }
        }
        @keyframes orbit2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%       { transform: translate(-70px, -90px) scale(1.15); }
        }
        @keyframes orbit3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          40%       { transform: translate(50px, -50px) scale(1.04); }
          80%       { transform: translate(-35px, 35px) scale(0.96); }
        }

        /* ── Navbar ── */
        .navbar {
          position: sticky;
          top: 0;
          z-index: 100;
          height: 64px;
          display: flex;
          align-items: center;
          padding: 0 48px;
          justify-content: space-between;
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .navbar.scrolled {
          background: rgba(7,13,26,0.9);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-bottom: 1px solid rgba(255,255,255,0.07);
          box-shadow: 0 8px 40px rgba(0,0,0,0.45);
        }
        /* animated gradient underline when scrolled */
        .navbar::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(57,255,150,0.4),
            rgba(34,211,238,0.3),
            transparent
          );
          opacity: 0;
          transition: opacity 0.35s ease;
        }
        .navbar.scrolled::after { opacity: 1; }

        /* ── Logo ── */
        .nav-logo {
          font-family: 'Syne', sans-serif;
          font-size: 21px;
          font-weight: 900;
          text-decoration: none;
          background: linear-gradient(135deg, #ffffff 30%, #39FF96 100%);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: logoShift 6s ease infinite;
          letter-spacing: -0.5px;
          transition: opacity 0.2s ease;
        }
        .nav-logo:hover { opacity: 0.8; }
        @keyframes logoShift {
          0%, 100% { background-position: 0% 50%; }
          50%       { background-position: 100% 50%; }
        }

        /* ── Nav pills ── */
        .nav-pill {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 18px;
          border-radius: 99px;
          border: 1px solid rgba(255,255,255,0.09);
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.58);
          font-family: 'Space Grotesk', sans-serif;
          font-size: 12.5px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.22s ease;
          backdrop-filter: blur(10px);
          cursor: pointer;
          letter-spacing: 0.01em;
        }
        .nav-pill:hover {
          background: rgba(57,255,150,0.08);
          border-color: rgba(57,255,150,0.28);
          color: #39FF96;
          transform: translateY(-1px);
          box-shadow: 0 4px 18px rgba(57,255,150,0.12);
        }
        .nav-pill-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: linear-gradient(135deg, #39FF96, #22D3EE);
          box-shadow: 0 0 7px rgba(57,255,150,0.6);
          animation: dotPulse 2.6s ease-in-out infinite;
          flex-shrink: 0;
        }
        @keyframes dotPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%       { transform: scale(0.65); opacity: 0.55; }
        }

        /* ── Main content ── */
        .public-main {
          position: relative;
          z-index: 10;
          max-width: 1280px;
          margin: 0 auto;
          padding: 40px 48px 90px;
        }

        /* ── Page-enter animation ── */
        .page-enter {
          animation: pageIn 0.38s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes pageIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Custom scrollbar ── */
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(57,255,150,0.25); }
        * { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.08) transparent; }

        /* ── Selection ── */
        ::selection { background: rgba(57,255,150,0.25); color: #F0FDF4; }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .navbar { padding: 0 20px; }
          .public-main { padding: 24px 20px 60px; }
        }
      `}</style>

      <div className="public-root">

        {/* ── Animated mesh background ── */}
        <div className="mesh-bg">
          <div className="mesh-grid" />
          <div className="mesh-orb mesh-orb-1" />
          <div className="mesh-orb mesh-orb-2" />
          <div className="mesh-orb mesh-orb-3" />
        </div>

        {/* ── Navbar ── */}
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
          <Link to="/" className="nav-logo">
            <img src="/logo.jpg" alt="SmartBooking" className="h-8 w-auto" />
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link to="/" className="nav-pill">
              Home
            </Link>
            <Link to="/offers" className="nav-pill">
              Browse Offers
            </Link>
            <Link to="/admin/login" className="nav-pill">
              <span className="nav-pill-dot" />
              Business Portal
            </Link>
          </div>
        </nav>

        {/* ── Page content ── */}
        <main className="public-main">
          <div className="page-enter" key={location.pathname}>
            <Outlet />
          </div>
        </main>

      </div>
    </>
  );
}