import React, { useEffect, useRef } from 'react';
import { cn } from './utils';
import GlassCard from './GlassCard';
import MaterialIcon from './MaterialIcon';
import { FEATURES } from './constants';

const FeaturesBento = ({ className = '' }) => {
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
      { threshold: 0.08 }
    );

    const features = sectionRef.current?.querySelectorAll('.feature-card');
    features?.forEach((feature) => observer.observe(feature));

    return () => observer.disconnect();
  }, []);

  return (
    <section id="solutions" className={cn('py-16 md:py-24 scroll-mt-28', className)} ref={sectionRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-center mb-20 md:mb-28">
          Everything You Need In One Product
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {FEATURES.map((feature, index) => (
            <GlassCard
              key={feature.title}
              className={cn(
                'group feature-card opacity-0 translate-y-8 transition-all duration-700',
                feature.span,
                `[&.animate-in]:opacity-100 [&.animate-in]:translate-y-0 [&.animate-in]:delay-[${Math.min(index * 80, 400)}ms]`
              )}
              glow
              padding="large"
            >
              <MaterialIcon
                icon={feature.icon}
                size={44}
                className={cn(
                  'mb-8 transition-all duration-500 group-hover:scale-125',
                  feature.color === 'primary' ? 'text-[#00f0ff]' : 'text-[#d0bcff]'
                )}
              />
              <h3 className={cn('font-semibold mb-5', feature.span ? 'text-2xl' : 'text-xl')}>
                {feature.title}
              </h3>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                {feature.description}
              </p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesBento;
