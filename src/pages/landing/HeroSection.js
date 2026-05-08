import React, { useEffect, useRef } from 'react';
import { cn } from './utils';
import GradientText from './GradientText';
import AnimatedButton from './AnimatedButton';
import { TRUST_LOGOS } from './constants';

/**
 * HeroSection - Main hero with staggered animations and trust badges
 */
const HeroSection = ({ className = '', onSignIn, onSignUp, themeMode = 'dark' }) => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = sectionRef.current?.querySelectorAll('.reveal');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="hero"
      ref={sectionRef}
      aria-label="Hero — Go Beyond Conversations"
      className={cn('relative pt-24 pb-16 md:pt-32 md:pb-24', className)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className={cn(
          'reveal opacity-0 translate-y-6 scale-95 transition-all duration-700 [&.animate-in]:opacity-100 [&.animate-in]:translate-y-0 [&.animate-in]:scale-100 inline-flex items-center gap-2 px-4 py-2 rounded-full mb-10 border',
          themeMode === 'dark' ? 'bg-[#1c2b3c]/50 border-[#3b494b]' : 'bg-white/75 border-slate-300'
        )}>
          <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-widest text-[#00f0ff]">
            New Feature: AI Workspace V2
          </span>
        </div>

        {/* Heading */}
        <h1 className={cn(
          'reveal opacity-0 translate-y-8 scale-95 transition-all duration-700 delay-150 [&.animate-in]:opacity-100 [&.animate-in]:translate-y-0 [&.animate-in]:scale-100 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight mb-8',
          themeMode === 'dark' ? 'text-white' : 'text-slate-900'
        )}>
          Go Beyond <br className="sm:hidden" />
          <GradientText className="inline">Conversations</GradientText>
        </h1>

        {/* Subtitle */}
        <p className={cn(
          'reveal opacity-0 translate-y-8 transition-all duration-700 delay-300 [&.animate-in]:opacity-100 [&.animate-in]:translate-y-0 text-base md:text-lg max-w-2xl mx-auto mb-12 leading-relaxed',
          themeMode === 'dark' ? 'text-[#b9cacb]' : 'text-slate-600'
        )}>
          Understand, search, and extract value from your team communications.
          BeyondStrings turns raw dialogue into actionable intelligence.
        </p>

        {/* CTA Buttons */}
        <div className="reveal opacity-0 translate-y-8 transition-all duration-700 delay-450 [&.animate-in]:opacity-100 [&.animate-in]:translate-y-0 flex flex-col sm:flex-row justify-center gap-5 mb-24">
          <AnimatedButton variant="gradient" size="lg" onClick={onSignUp}>
            Get Started Free
          </AnimatedButton>
          <AnimatedButton variant="ghost" size="lg" onClick={onSignIn}>
            Login
          </AnimatedButton>
        </div>

        {/* Trust Badge */}
        <div className="reveal opacity-0 translate-y-8 transition-all duration-700 delay-600 [&.animate-in]:opacity-100 [&.animate-in]:translate-y-0">
          <p className={cn('text-xs font-semibold uppercase tracking-widest mb-8', themeMode === 'dark' ? 'text-zinc-500' : 'text-slate-500')}>
            Trusted by innovative teams worldwide
          </p>
          <div className={cn(
            'flex flex-wrap justify-center items-center gap-8 md:gap-12 transition-all duration-700',
            themeMode === 'dark' ? 'opacity-50 grayscale hover:grayscale-0' : 'opacity-80'
          )}>
            {TRUST_LOGOS.map((logo) => (
              <img
                key={logo.name}
                src={`https://cdn.simpleicons.org/${logo.slug}/${themeMode === 'dark' ? 'FFFFFF' : '1E293B'}`}
                alt={logo.name}
                className="h-6 md:h-8 object-contain hover:opacity-100 transition-opacity"
                loading="lazy"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
