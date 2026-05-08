import React, { useEffect, useRef } from 'react';
import { cn } from './utils';
import GlassCard from './GlassCard';
import MaterialIcon from './MaterialIcon';
import AnimatedButton from './AnimatedButton';
import { PRICING_PLANS } from './constants';

const Pricing = ({ className = '' }) => {
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

    const plans = sectionRef.current?.querySelectorAll('.pricing-card');
    plans?.forEach((plan) => observer.observe(plan));

    return () => observer.disconnect();
  }, []);

  return (
    <section id="pricing" className={cn('py-16 md:py-24 scroll-mt-28', className)} ref={sectionRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-center mb-16 md:mb-20">
          Simple Pricing
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 items-start">
          {PRICING_PLANS.map((plan, index) => (
            <div
              key={plan.name}
              className={cn(
                'pricing-card opacity-0 translate-y-8 transition-all duration-700 relative',
                plan.highlighted && 'md:-mt-6 md:mb-6',
                `[&.animate-in]:opacity-100 [&.animate-in]:translate-y-0 [&.animate-in]:delay-[${index * 100}ms]`
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <span className="bg-[#00f0ff] text-[#00363a] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                    Most Popular
                  </span>
                </div>
              )}

              <GlassCard
                className={cn(
                  'h-full flex flex-col transition-all duration-500 hover:scale-105',
                  plan.highlighted && 'border-[#00f0ff]/40 shadow-[0_0_40px_rgba(0,240,255,0.15)]'
                )}
                padding="large"
              >
                <h3 className="text-xl font-semibold mb-3">{plan.name}</h3>

                <div className="flex items-baseline gap-1 mb-10">
                  <span className="text-4xl md:text-5xl font-bold">{plan.price}</span>
                  <span className="text-[var(--text-muted)]">{plan.period}</span>
                </div>

                <ul className="space-y-4 mb-10 flex-grow">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center gap-3 group/item">
                      <MaterialIcon
                        icon="check"
                        size={18}
                        className={cn(
                          'transition-all duration-300 group-hover/item:scale-125',
                          plan.highlighted ? 'text-[#00f0ff]' : 'text-zinc-500'
                        )}
                      />
                      <span className="text-sm text-[var(--text-main)]">{feature}</span>
                    </li>
                  ))}
                </ul>

                <AnimatedButton
                  variant={plan.highlighted ? 'primary' : 'ghost'}
                  fullWidth
                  className="mt-auto"
                >
                  {plan.cta}
                </AnimatedButton>
              </GlassCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
