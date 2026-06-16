import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Calendar, CheckCircle2 } from 'lucide-react';

const T = {
  bg: '#070D1A',
  card: 'rgba(10,20,36,0.82)',
  green: '#39FF96',
  greenBorder: 'rgba(57,255,150,0.22)',
  text: '#F0FDF4',
  textMuted: '#94A3B8',
};

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, overflow: 'hidden' }}>

      {/* ═══════════════════════════════
          HERO SECTION
      ═══════════════════════════════ */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px 60px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background orbs */}
        <div style={{
          position: 'absolute', top: '15%', left: '5%',
          width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(57,255,150,0.07) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'float 15s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '15%', right: '5%',
          width: 260, height: 260, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34,211,238,0.05) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'float 18s ease-in-out infinite 1s',
        }} />

        <style>{`
          @keyframes float {
            0%, 100% { transform: translate(0, 0); }
            33%       { transform: translate(20px, 30px); }
            66%       { transform: translate(-15px, 20px); }
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .hero-badge    { animation: slideUp 0.6s ease-out both; }
          .hero-title    { animation: slideUp 0.6s ease-out 0.15s both; }
          .hero-subtitle { animation: slideUp 0.6s ease-out 0.25s both; }
          .hero-buttons  { animation: slideUp 0.6s ease-out 0.35s both; }

          @media (max-width: 768px) {
            .hero-h1 { font-size: 32px !important; }
            .hero-sub { font-size: 14px !important; }
            .section-h2 { font-size: 26px !important; }
          }
        `}</style>

        <div style={{ position: 'relative', zIndex: 10, maxWidth: 780, textAlign: 'center', width: '100%' }}>

          {/* Badge */}
          <div className="hero-badge" style={{ marginBottom: 20 }}>
            <span style={{
              display: 'inline-block',
              padding: '6px 14px',
              borderRadius: 99,
              border: `1px solid ${T.greenBorder}`,
              background: 'rgba(57,255,150,0.07)',
              fontSize: 11,
              fontWeight: 700,
              color: T.green,
              letterSpacing: '0.1em',
            }}>
              ✨ WELCOME TO SMARTBOOKING
            </span>
          </div>

          {/* Headline — font reduced from 72 → 48px */}
          <h1 className="hero-title hero-h1" style={{
            fontSize: 48,
            fontWeight: 900,
            lineHeight: 1.15,
            marginBottom: 18,
            background: `linear-gradient(135deg, ${T.text} 30%, ${T.green} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontFamily: "'Syne', sans-serif",
            letterSpacing: '-0.5px',
          }}>
            Find & Book the Best<br />Local Offers
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle hero-sub" style={{
            fontSize: 15,
            color: T.textMuted,
            maxWidth: 520,
            margin: '0 auto 36px',
            lineHeight: 1.65,
          }}>
            Discover exclusive deals from local businesses. Book appointments in seconds. Manage your bookings effortlessly.
          </p>

          {/* CTA Buttons */}
          <div className="hero-buttons" style={{
            display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap',
          }}>
            <Link to="/offers" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 28px', borderRadius: 12,
              background: T.green, color: '#000',
              textDecoration: 'none', fontWeight: 700, fontSize: 14,
              transition: 'all 0.25s ease',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 28px rgba(57,255,150,0.3)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Browse Offers <ArrowRight size={16} strokeWidth={3} />
            </Link>

            <Link to="/admin/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 28px', borderRadius: 12,
              background: 'rgba(255,255,255,0.07)', color: T.text,
              textDecoration: 'none', fontWeight: 700, fontSize: 14,
              border: `1px solid ${T.greenBorder}`,
              transition: 'all 0.25s ease',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(57,255,150,0.08)';
                (e.currentTarget as HTMLElement).style.color = T.green;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                (e.currentTarget as HTMLElement).style.color = T.text;
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Business Portal <ArrowRight size={16} strokeWidth={3} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════ */}
      <section style={{ padding: '60px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 className="section-h2" style={{
            fontSize: 32, fontWeight: 900, marginBottom: 10,
            fontFamily: "'Syne', sans-serif",
          }}>
            How It Works
          </h2>
          <p style={{ color: T.textMuted, fontSize: 14, maxWidth: 480, margin: '0 auto' }}>
            Three simple steps to book your favourite local offers
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 20,
        }}>
          {[
            { icon: Zap,          title: 'Browse Offers',      description: 'Explore hundreds of exclusive deals from local restaurants, salons, spas, and more.', step: '01' },
            { icon: Calendar,     title: 'Book Appointment',   description: 'Select your preferred date and time. Reserve your spot in just a few clicks.',        step: '02' },
            { icon: CheckCircle2, title: 'Enjoy & Confirm',    description: 'Show your booking confirmation at the venue and enjoy your exclusive offer.',          step: '03' },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} style={{
                padding: '28px 24px', borderRadius: 16,
                background: T.card, border: '1px solid rgba(255,255,255,0.07)',
                transition: 'all 0.25s ease', cursor: 'pointer',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = T.greenBorder;
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(57,255,150,0.07)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  fontSize: 36, fontWeight: 900, color: T.green,
                  marginBottom: 12, fontFamily: "'Syne', sans-serif", opacity: 0.25,
                }}>
                  {item.step}
                </div>
                <Icon size={28} color={T.green} style={{ marginBottom: 12 }} />
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, fontFamily: "'Syne', sans-serif" }}>
                  {item.title}
                </h3>
                <p style={{ color: T.textMuted, fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══════════════════════════════
          BOTTOM CTA
      ═══════════════════════════════ */}
      <section style={{ padding: '60px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{
          padding: '48px 32px', borderRadius: 20, textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(57,255,150,0.07) 0%, rgba(34,211,238,0.04) 100%)',
          border: `1px solid ${T.greenBorder}`,
        }}>
          <h2 className="section-h2" style={{
            fontSize: 30, fontWeight: 900, marginBottom: 12,
            fontFamily: "'Syne', sans-serif",
          }}>
            Ready to Get Started?
          </h2>
          <p style={{
            fontSize: 14, color: T.textMuted, marginBottom: 28,
            maxWidth: 480, margin: '0 auto 28px',
          }}>
            Browse amazing offers now or register your business to start accepting bookings today.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/offers" style={{
              padding: '12px 28px', borderRadius: 12,
              background: T.green, color: '#000',
              textDecoration: 'none', fontWeight: 700, fontSize: 14,
              transition: 'all 0.25s ease',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 28px rgba(57,255,150,0.28)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Explore Offers
            </Link>
            <Link to="/admin/register" style={{
              padding: '12px 28px', borderRadius: 12,
              background: 'rgba(255,255,255,0.07)', color: T.text,
              textDecoration: 'none', fontWeight: 700, fontSize: 14,
              border: `1px solid ${T.greenBorder}`,
              transition: 'all 0.25s ease',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(57,255,150,0.08)';
                (e.currentTarget as HTMLElement).style.color = T.green;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                (e.currentTarget as HTMLElement).style.color = T.text;
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Register Business
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}