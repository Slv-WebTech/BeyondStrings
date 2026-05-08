import React, { useEffect, useRef } from 'react';
import { cn } from './utils';
import GlassCard from './GlassCard';
import { USE_CASES } from './constants';

const UseCases = ({ className = '' }) => {
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

    const cases = sectionRef.current?.querySelectorAll('.usecase-card');
    cases?.forEach((caseCard) => observer.observe(caseCard));

    return () => observer.disconnect();
  }, []);

  return (
    <section className={cn('py-16 md:py-24', className)} ref={sectionRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-center mb-16 md:mb-20">
          Built For Real-World Use Cases
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {USE_CASES.map((useCase, index) => (
            <GlassCard
              key={useCase.title}
              glow
              className={cn(
                'group usecase-card opacity-0 translate-y-8 transition-all duration-700',
                `[&.animate-in]:opacity-100 [&.animate-in]:translate-y-0 [&.animate-in]:delay-[${Math.min(index * 80, 300)}ms]`
              )}
            >
              <h3 className={cn(
                'text-lg font-semibold mb-5 transition-colors duration-300',
                useCase.color === 'primary' ? 'text-[#00f0ff]' : 'text-[#d0bcff]'
              )}>
                {useCase.title}
              </h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                {useCase.description}
              </p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCases;
