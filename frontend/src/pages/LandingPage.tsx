import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="landing-page"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #070D1A 0%, #0f1425 100%)',
        position: 'relative',
        overflow: 'hidden',
        paddingTop: 80,
      }}
    >
      <style>{`
        .landing-page {
          font-family: 'Space Grotesk', system-ui, sans-serif;
        }

        .hero {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          text-align: center;
          z-index: 10;
          position: relative;
        }

        .hero-title {
          font-family: 'Syne', sans-serif;
          font-size: 3.5rem;
          font-weight: 900;
          margin-bottom: 20px;
          color: #F0FDF4;
          line-height: 1.2;
        }

        .gradient-text {
          background: linear-gradient(135deg, #39FF96, #00ff88);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: #b4b4b4;
          margin-bottom: 40px;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .cta-buttons {
          display: flex;
          gap: 20px;
          justify-content: center;
          margin-bottom: 80px;
          flex-wrap: wrap;
        }

        .btn-primary {
          background: linear-gradient(135deg, #39FF96, #00ff88);
          color: #070D1A;
          padding: 14px 32px;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 600;
          font-size: 1rem;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(57, 255, 150, 0.3);
        }

        .btn-secondary {
          background: rgba(10, 20, 36, 0.5);
          color: #39FF96;
          padding: 14px 32px;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 600;
          font-size: 1rem;
          border: 1.5px solid #39FF96;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .btn-secondary:hover {
          background: rgba(57, 255, 150, 0.1);
          transform: translateY(-2px);
        }

        .how-it-works {
          max-width: 1200px;
          margin: 0 auto;
          padding: 80px 20px;
          position: relative;
          z-index: 10;
        }

        .how-title {
          font-family: 'Syne', sans-serif;
          font-size: 2.5rem;
          font-weight: 900;
          text-align: center;
          color: #F0FDF4;
          margin-bottom: 60px;
        }

        .steps {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 40px;
          margin-bottom: 80px;
        }

        .step {
          background: rgba(10, 20, 36, 0.4);
          border: 1px solid rgba(57, 255, 150, 0.2);
          padding: 30px;
          border-radius: 12px;
          text-align: center;
          transition: all 0.3s ease;
        }

        .step:hover {
          background: rgba(10, 20, 36, 0.6);
          border-color: rgba(57, 255, 150, 0.5);
          transform: translateY(-4px);
        }

        .step-number {
          font-size: 2.5rem;
          font-weight: 900;
          color: #39FF96;
          margin-bottom: 15px;
        }

        .step-title {
          font-size: 1.3rem;
          font-weight: 700;
          color: #F0FDF4;
          margin-bottom: 10px;
        }

        .step-desc {
          color: #b4b4b4;
          font-size: 0.95rem;
        }

        .cta-section {
          text-align: center;
          padding: 60px 20px;
          background: rgba(57, 255, 150, 0.05);
          border-radius: 16px;
          border: 1px solid rgba(57, 255, 150, 0.2);
          position: relative;
          z-index: 10;
          max-width: 600px;
          margin: 0 auto;
        }

        .cta-section-title {
          font-family: 'Syne', sans-serif;
          font-size: 2rem;
          font-weight: 900;
          color: #F0FDF4;
          margin-bottom: 15px;
        }

        .cta-section-desc {
          color: #b4b4b4;
          margin-bottom: 30px;
          font-size: 1rem;
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.2rem;
          }

          .how-title {
            font-size: 1.8rem;
          }

          .cta-section-title {
            font-size: 1.5rem;
          }

          .cta-buttons {
            flex-direction: column;
          }
        }
      `}</style>

      {/* Hero Section */}
      <motion.section className="hero" variants={itemVariants}>
        <h1 className="hero-title">
          Find & Book the<br />
          <span className="gradient-text">Best Local Offers</span>
        </h1>
        <p className="hero-subtitle">
          Discover amazing deals from local businesses near you. Reserve your spot in seconds.
        </p>

        <div className="cta-buttons">
          <Link to="/offers" className="btn-primary">
            Browse Offers <ChevronRight size={20} />
          </Link>
          <Link to="/admin/login" className="btn-secondary">
            Business Portal <ChevronRight size={20} />
          </Link>
        </div>
      </motion.section>

      {/* How It Works */}
      <motion.section className="how-it-works" variants={itemVariants}>
        <h2 className="how-title">How It Works</h2>

        <div className="steps">
          <motion.div className="step" whileHover={{ y: -4 }} transition={{ duration: 0.3 }}>
            <div className="step-number">1</div>
            <div className="step-title">Browse Offers</div>
            <p className="step-desc">Explore hundreds of exclusive deals from verified local businesses in your area.</p>
          </motion.div>

          <motion.div className="step" whileHover={{ y: -4 }} transition={{ duration: 0.3 }}>
            <div className="step-number">2</div>
            <div className="step-title">Select & Book</div>
            <p className="step-desc">Choose your preferred time slot and complete your booking instantly.</p>
          </motion.div>

          <motion.div className="step" whileHover={{ y: -4 }} transition={{ duration: 0.3 }}>
            <div className="step-number">3</div>
            <div className="step-title">Enjoy Your Offer</div>
            <p className="step-desc">Show your booking confirmation and enjoy your exclusive deal!</p>
          </motion.div>
        </div>
      </motion.section>

      {/* Final CTA */}
      <motion.section className="cta-section" variants={itemVariants}>
        <h2 className="cta-section-title">Ready to Get Started?</h2>
        <p className="cta-section-desc">Join thousands of happy customers discovering great local deals.</p>
        <Link to="/offers" className="btn-primary">
          Explore Now <ChevronRight size={20} />
        </Link>
      </motion.section>
    </motion.div>
  );
}
