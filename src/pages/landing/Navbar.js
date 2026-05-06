import React, { useState, useEffect } from 'react';
import { cn } from './utils';
import { NAV_LINKS } from './constants';
import AnimatedButton from './AnimatedButton';
import MaterialIcon from './MaterialIcon';
import { BRAND_ASSETS } from '../../config/branding';

/**
 * Navbar - Fixed top navigation with mobile hamburger menu
 * Features: scroll-aware background, active link highlighting, mobile drawer
 */
const Navbar = ({ className = '', onSignIn, onSignUp, themeMode = 'dark', onToggleTheme }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('Platform');

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const nextIsScrolled = window.scrollY > 20;
        setIsScrolled((prev) => (prev === nextIsScrolled ? prev : nextIsScrolled));
        ticking = false;
      });
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const sectionMap = NAV_LINKS.reduce((acc, link) => {
      const id = link.href.startsWith('#') ? link.href.slice(1) : '';
      if (id) acc[id] = link.name;
      return acc;
    }, {});

    const getSections = () => Object.keys(sectionMap)
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    const updateActiveLink = () => {
      const sections = getSections();
      if (!sections.length) return;

      const marker = window.scrollY + 140;
      let current = sections[0];

      for (const section of sections) {
        if (section.offsetTop <= marker) current = section;
      }

      const nextName = sectionMap[current.id];
      if (nextName) {
        setActiveLink((prev) => (prev === nextName ? prev : nextName));
      }
    };

    updateActiveLink();
    window.addEventListener('scroll', updateActiveLink, { passive: true });
    window.addEventListener('resize', updateActiveLink);
    return () => {
      window.removeEventListener('scroll', updateActiveLink);
      window.removeEventListener('resize', updateActiveLink);
    };
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflowY = 'hidden';
      document.body.style.overflowX = 'hidden';
      document.documentElement.style.overflowY = 'hidden';
    } else {
      // Landing pages rely on document-level scroll
      document.body.style.overflowY = 'visible';
      document.body.style.overflowX = 'hidden';
      document.documentElement.style.overflowY = 'auto';
      document.documentElement.style.overflowX = 'hidden';
    }
    return () => {
      document.body.style.overflowY = 'visible';
      document.body.style.overflowX = 'hidden';
      document.documentElement.style.overflowY = 'auto';
      document.documentElement.style.overflowX = 'hidden';
    };
  }, [isMobileMenuOpen]);

  const scrollToSection = (href) => {
    const id = href?.startsWith('#') ? href.slice(1) : '';
    const element = id ? document.getElementById(id) : null;
    if (!element) return;

    // Use scrollIntoView with options for better browser compatibility
    element.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start' // Scroll to top of element
    });
  };

  const handleNavClick = (link) => {
    setActiveLink(link.name);
    setIsMobileMenuOpen(false);
    // Ensure document can scroll
    document.body.style.overflowY = 'visible';
    document.body.style.overflowX = 'hidden';
    document.documentElement.style.overflowY = 'auto';
    document.documentElement.style.overflowX = 'hidden';
    // Scroll to section immediately
    scrollToSection(link.href);
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    setActiveLink(NAV_LINKS[0]?.name || 'Platform');
    setIsMobileMenuOpen(false);
    scrollToSection('#hero');
  };

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          isScrolled
            ? (themeMode === 'dark'
              ? 'bg-[#051424]/90 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20'
              : 'bg-white/85 backdrop-blur-xl border-b border-slate-200 shadow-lg shadow-slate-200/40')
            : 'bg-transparent border-transparent',
          className
        )}
      >
        <nav className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8 h-20">
          {/* Logo */}
          <a href="#hero" onClick={handleLogoClick} className={cn('text-xl font-bold tracking-tighter flex items-center gap-2', themeMode === 'dark' ? 'text-white' : 'text-slate-900')}>
            <img src={themeMode === 'dark' ? BRAND_ASSETS.logoDark : BRAND_ASSETS.logoLight} alt="BeyondStrings logo" className="w-8 h-8 rounded-lg" loading="eager" />
            <span>BeyondStrings</span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link);
                }}
                className={cn(
                  'text-sm tracking-wide transition-all duration-300 pb-1 border-b-2',
                  activeLink === link.name
                    ? 'text-[#00f0ff] border-[#00f0ff]'
                    : (themeMode === 'dark'
                      ? 'text-zinc-400 border-transparent hover:text-white hover:border-white/30'
                      : 'text-slate-600 border-transparent hover:text-slate-900 hover:border-slate-300')
                )}
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <button
              className={cn('text-sm transition-colors px-2 py-2', themeMode === 'dark' ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')}
              onClick={onToggleTheme}
              aria-label={themeMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={themeMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <MaterialIcon icon={themeMode === 'dark' ? 'light_mode' : 'dark_mode'} size={20} />
            </button>
            <button className={cn('text-sm transition-colors px-4 py-2', themeMode === 'dark' ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')} onClick={onSignIn}>
              Sign In
            </button>
            <AnimatedButton variant="primary" size="sm" onClick={onSignUp}>
              Get Started
            </AnimatedButton>
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden flex items-center">
            <button
              className={cn('p-2', themeMode === 'dark' ? 'text-white' : 'text-slate-900')}
              onClick={onToggleTheme}
              aria-label={themeMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <MaterialIcon icon={themeMode === 'dark' ? 'light_mode' : 'dark_mode'} size={24} className="transition-transform duration-300" />
            </button>
            <button
              className={cn('p-2', themeMode === 'dark' ? 'text-white' : 'text-slate-900')}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <MaterialIcon
                icon={isMobileMenuOpen ? 'close' : 'menu'}
                size={28}
                className="transition-transform duration-300"
              />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 md:hidden transition-all duration-500',
          isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        )}
      >
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />

        <div
          className={cn(
            `absolute top-20 left-4 right-4 backdrop-blur-xl rounded-2xl p-6 shadow-2xl transition-all duration-500 ${themeMode === 'dark' ? 'bg-[#0d1c2d]/95 border border-white/10' : 'bg-white/95 border border-slate-200'
            }`,
            isMobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
          )}
        >
          <div className="flex flex-col gap-2">
            {NAV_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link);
                }}
                className={cn(
                  'px-4 py-3 rounded-lg text-base transition-all duration-300',
                  activeLink === link.name
                    ? 'bg-[#00f0ff]/10 text-[#00f0ff] border-l-2 border-[#00f0ff]'
                    : (themeMode === 'dark' ? 'text-zinc-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100')
                )}
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-white/10 flex flex-col gap-3">
            <button className={cn('w-full py-3 transition-colors text-center', themeMode === 'dark' ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')} onClick={onSignIn}>
              Sign In
            </button>
            <AnimatedButton variant="primary" fullWidth onClick={onSignUp}>
              Get Started
            </AnimatedButton>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
