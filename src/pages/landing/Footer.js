import React from 'react';
import { cn } from './utils';
import { FOOTER_LINKS } from './constants';
import { BRAND_ASSETS } from '../../config/branding';

const Footer = ({ className = '', themeMode = 'dark' }) => {
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

  const handleFooterClick = (e, href) => {
    if (!href?.startsWith('#')) return;
    e.preventDefault();
    scrollToSection(href);
  };

  const handleHomeClick = (e) => {
    e.preventDefault();
    const section = document.getElementById('hero');
    if (!section) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const top = Math.max(0, section.getBoundingClientRect().top + window.scrollY - 96);
    window.scrollTo({ top, behavior: reducedMotion ? 'auto' : 'smooth' });
  };

  return (
    <footer className={cn(themeMode === 'dark' ? 'bg-black/40 border-t border-white/5 py-12' : 'bg-white/70 border-t border-slate-200 py-12', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <a href="#hero" onClick={handleHomeClick} className={cn('text-lg font-bold flex items-center gap-2', themeMode === 'dark' ? 'text-white' : 'text-slate-900')}>
            <img src={themeMode === 'dark' ? BRAND_ASSETS.logoDark : BRAND_ASSETS.logoLight} alt="BeyondStrings logo" className="w-7 h-7 rounded-md" loading="lazy" />
            <span>BeyondStrings</span>
          </a>

          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            {FOOTER_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleFooterClick(e, link.href)}
                className={cn('text-xs uppercase tracking-widest transition-colors duration-300', themeMode === 'dark' ? 'text-zinc-500 hover:text-zinc-200' : 'text-slate-500 hover:text-slate-900')}
              >
                {link.name}
              </a>
            ))}
          </div>

          <p className={cn('text-xs uppercase tracking-widest text-center md:text-right', themeMode === 'dark' ? 'text-zinc-500' : 'text-slate-500')}>
            &copy; 2024 BeyondStrings AI. Engineered for precision.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
