import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from './utils';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import ValueProps from './ValueProps';
import ProductShowcase from './ProductShowcase';
import FeaturesBento from './FeaturesBento';
import HowItWorks from './HowItWorks';
import WhyBeyondStrings from './WhyBeyondStrings';
import UseCases from './UseCases';
import Pricing from './Pricing';
import VisionSection from './VisionSection';
import Testimonials from './Testimonials';
import ContactSection from './ContactSection';
import FinalCTA from './FinalCTA';
import Footer from './Footer';
import AmbientGlow from './AmbientGlow';
import { BRAND, BRAND_ASSETS } from '../../config/branding';

/**
 * BeyondStringsLanding - Complete landing page
 * 
 * Drop this component into your React app as a route or page.
 * All sub-components are fully self-contained and reusable.
 * 
 * Usage:
 * import BeyondStringsLanding from './BeyondStringsLanding';
 * 
 * function App() {
 *   return <BeyondStringsLanding />;
 * }
 */
const BeyondStringsLanding = ({ onSignIn, onSignUp, onSelectAction, themeMode = 'dark', onToggleTheme }) => {
  const [contactForm, setContactForm] = useState({ name: '', message: '' });
  const [contactSent, setContactSent] = useState(false);

  useEffect(() => {
    // Force a single document-level vertical scrollbar on landing pages.
    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById('root');
    const prevHtmlOverflowY = html.style.overflowY;
    const prevHtmlOverflowX = html.style.overflowX;
    const prevBodyOverflowY = body.style.overflowY;
    const prevBodyOverflowX = body.style.overflowX;
    const prevRootOverflowX = root?.style.overflowX;

    html.style.overflowY = 'auto';
    html.style.overflowX = 'hidden';
    body.style.overflowY = 'visible';
    body.style.overflowX = 'hidden';
    if (root) root.style.overflowX = 'hidden';

    return () => {
      html.style.overflowY = prevHtmlOverflowY;
      html.style.overflowX = prevHtmlOverflowX;
      body.style.overflowY = prevBodyOverflowY;
      body.style.overflowX = prevBodyOverflowX;
      if (root) root.style.overflowX = prevRootOverflowX || '';
    };
  }, []);

  const handleSignUp = () => {
    if (onSignUp) {
      onSignUp();
      return;
    }
    onSelectAction?.('live');
  };

  return (
    <div
      className={cn(
        'landing-shell relative min-h-screen overflow-x-hidden font-sans selection:bg-[#00f0ff] selection:text-[#00363a] bg-[var(--page-bg)] text-[var(--text-main)]',
        themeMode === 'dark' ? 'landing-theme-dark' : 'landing-theme-light'
      )}
      aria-label={`${BRAND.name} landing page`}
      data-brand-logo={BRAND_ASSETS.logoDark}
    >
      {/* Load Google Fonts and Material Symbols */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        rel="stylesheet"
      />

      {/* Global Styles for Material Icons and Animations */}
      <style>{`
        .material-symbols-outlined {
          font-family: 'Material Symbols Outlined';
          font-weight: normal;
          font-style: normal;
          font-size: 24px;
          line-height: 1;
          letter-spacing: normal;
          text-transform: none;
          display: inline-block;
          white-space: nowrap;
          word-wrap: normal;
          direction: ltr;
          -webkit-font-feature-settings: 'liga';
          -webkit-font-smoothing: antialiased;
        }

        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .animate-gradient-shift {
          animation: gradient-shift 3s ease infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .landing-shell {
          background:
            radial-gradient(circle at 10% 12%, color-mix(in srgb, #22d3ee 16%, transparent) 0%, transparent 32%),
            radial-gradient(circle at 88% 8%, color-mix(in srgb, #a78bfa 14%, transparent) 0%, transparent 28%),
            linear-gradient(165deg, color-mix(in srgb, var(--page-bg) 95%, #0b1320 5%) 0%, var(--page-bg) 100%);
        }

        .landing-theme-light {
          --landing-panel: rgba(255, 255, 255, 0.74);
          --landing-panel-strong: rgba(255, 255, 255, 0.92);
          --landing-border: rgba(15, 23, 42, 0.12);
          --landing-muted: #425466;
          --landing-head: #0b1b2f;
        }

        .landing-theme-dark {
          --landing-panel: rgba(255, 255, 255, 0.04);
          --landing-panel-strong: rgba(13, 28, 45, 0.8);
          --landing-border: rgba(255, 255, 255, 0.1);
          --landing-muted: #b9cacb;
          --landing-head: #f8fbff;
        }

        .landing-heading {
          color: var(--landing-head);
        }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }

        .marquee-container {
          position: relative;
          overflow: hidden;
          width: 100%;
        }

        .marquee-content {
          display: flex;
          width: max-content;
          will-change: transform;
          animation: marquee 30s linear infinite;
          gap: 2rem;
        }

        .marquee-content:hover {
          animation-play-state: paused;
        }

        .marquee-item {
          flex-shrink: 0;
          min-width: max-content;
        }

        .landing-muted {
          color: var(--landing-muted);
        }

        .landing-panel {
          background: var(--landing-panel);
          border-color: var(--landing-border);
        }

        .landing-panel-strong {
          background: var(--landing-panel-strong);
          border-color: var(--landing-border);
        }
      `}</style>

      {/* Ambient Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={themeMode}
            className="relative w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <AmbientGlow color="primary" position="top-left" size={700} opacity={themeMode === 'dark' ? 0.12 : 0.08} />
            <AmbientGlow color="secondary" position="bottom-right" size={700} opacity={themeMode === 'dark' ? 0.1 : 0.06} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <Navbar onSignIn={onSignIn} onSignUp={handleSignUp} themeMode={themeMode} onToggleTheme={onToggleTheme} />

      {/* Main Content */}
      <motion.main className="relative overflow-x-hidden" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
        <HeroSection onSignIn={onSignIn} onSignUp={handleSignUp} themeMode={themeMode} />
        <ValueProps />

        {/* Product Showcase with dark background */}
        <div className={cn(
          'rounded-3xl mx-4 sm:mx-6 lg:mx-8 border landing-panel-strong',
          themeMode === 'dark' ? '' : 'shadow-[0_10px_40px_rgba(15,23,42,0.08)]'
        )}>
          <ProductShowcase />
        </div>

        <FeaturesBento />
        <HowItWorks />
        <WhyBeyondStrings />
        <UseCases />
        <Pricing />
        <VisionSection />
        <Testimonials />
        <ContactSection
          onContactFormChange={(payload) => setContactForm({ name: payload?.name || '', message: payload?.message || '' })}
          onContactSentChange={(sent) => setContactSent(Boolean(sent))}
        />
        <FinalCTA onSignIn={onSignIn} onSignUp={handleSignUp} contactForm={contactForm} contactSent={contactSent} />
      </motion.main>

      {/* Footer */}
      <Footer themeMode={themeMode} />
    </div>
  );
};

export default BeyondStringsLanding;
