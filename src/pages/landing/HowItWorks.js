import React, { useEffect, useRef } from 'react';
import { cn } from './utils';
import { STEPS } from './constants';

const HowItWorks = ({ className = '' }) => {
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

    const steps = sectionRef.current?.querySelectorAll('.step-card');
    steps?.forEach((step) => observer.observe(step));

    return () => observer.disconnect();
  }, []);

  return (
    <section id="resources" className={cn('py-16 md:py-24 scroll-mt-28', className)} ref={sectionRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 lg:gap-20 relative">
          <div className="hidden md:block absolute top-16 left-0 w-full h-[1px]">
            <div className="w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>

          {STEPS.map((step, index) => (
            <div
              key={step.number}
              className={cn(
                'step-card opacity-0 translate-y-8 transition-all duration-700 flex flex-col items-center text-center group',
                `[&.animate-in]:opacity-100 [&.animate-in]:translate-y-0 [&.animate-in]:delay-[${index * 120}ms]`
              )}
            >
              <div className={cn(
                'w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center text-2xl md:text-3xl font-bold mb-8 md:mb-10 transition-all duration-500 group-hover:scale-120',
                step.color === 'primary'
                  ? 'bg-[#273647] border-2 border-[#00f0ff] text-[#00f0ff] shadow-[0_0_30px_rgba(0,240,255,0.3)] group-hover:shadow-[0_0_40px_rgba(0,240,255,0.5)]'
                  : 'bg-[#273647] border-2 border-[#d0bcff] text-[#d0bcff] shadow-[0_0_30px_rgba(208,188,255,0.3)] group-hover:shadow-[0_0_40px_rgba(208,188,255,0.5)]'
              )}>
                {step.number}
              </div>
              <h4 className="text-xl font-semibold mb-5 text-[var(--text-main)]">{step.title}</h4>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed max-w-xs">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
