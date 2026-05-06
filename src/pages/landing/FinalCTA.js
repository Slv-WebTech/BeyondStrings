import React from 'react';
import { cn } from './utils';
import GlassCard from './GlassCard';
import GradientText from './GradientText';
import AnimatedButton from './AnimatedButton';

const FinalCTA = ({ className = '', onSignIn, onSignUp, contactForm, contactSent }) => {
  const handleBookDemo = () => {
    const section = document.getElementById('contact');
    if (!section) {
      onSignIn?.();
      return;
    }
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const top = Math.max(0, section.getBoundingClientRect().top + window.scrollY - 96);
    window.scrollTo({ top, behavior: reducedMotion ? 'auto' : 'smooth' });
  };

  return (
    <section className={cn('py-16 md:py-24', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <GlassCard
          padding="xl"
          className="relative overflow-hidden text-center border-white/10 transition-all duration-500"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00f0ff] rounded-full filter blur-[120px] opacity-10 pointer-events-none" />

          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight mb-8 leading-tight">
              Ready To Upgrade Your <br />
              <GradientText>Conversation Workflow?</GradientText>
            </h2>

            <p className="text-base md:text-lg text-[var(--text-muted)] max-w-2xl mx-auto mb-12 leading-relaxed">
              Join 10,000+ teams using BeyondStrings to build the future of collective intelligence.
            </p>

            {contactSent && (
              <div className="inline-block px-5 py-3 rounded-full bg-[#00f0ff]/10 border border-[#00f0ff]/30 mb-8">
                <p className="text-sm font-medium text-[#00f0ff]">
                  Thanks, <span className="font-semibold">{contactForm?.name || 'there'}</span>! Your message was received.
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-center gap-5">
              <AnimatedButton variant="secondary" size="xl" className="rounded-full" onClick={onSignUp}>
                Get Started Now
              </AnimatedButton>
              <AnimatedButton variant="ghost" size="xl" className="rounded-full border-white/20" onClick={handleBookDemo}>
                Book A Demo
              </AnimatedButton>
            </div>
          </div>
        </GlassCard>
      </div>
    </section>
  );
};

export default FinalCTA;
