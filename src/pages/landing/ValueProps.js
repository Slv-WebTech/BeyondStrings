import React, { useEffect, useRef } from 'react';
import { cn } from './utils';
import GlassCard from './GlassCard';
import MaterialIcon from './MaterialIcon';

const VALUE_PROPS = [
  {
    icon: 'security',
    title: 'Zero-knowledge privacy',
    description: "Your data remains yours. We use enterprise-grade encryption where even we can't see your data.",
    color: 'text-[#00f0ff]',
    bgColor: 'bg-[#00f0ff]/10',
  },
  {
    icon: 'speed',
    title: '< 2 minutes setup',
    description: 'Connect your workspace and start extracting value immediately. No complex engineering required.',
    color: 'text-[#d0bcff]',
    bgColor: 'bg-[#d0bcff]/10',
  },
  {
    icon: 'sync',
    title: 'Live + Imported workspace',
    description: 'Sync live conversations or import historical data to create a unified intelligence hub.',
    color: 'text-[#00f0ff]',
    bgColor: 'bg-[#00f0ff]/10',
  },
];

const ValueProps = ({ className = '' }) => {
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

    const cards = sectionRef.current?.querySelectorAll('.reveal-card');
    cards?.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  return (
    <section className={cn('py-16 md:py-24', className)} ref={sectionRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          {VALUE_PROPS.map((prop, index) => (
            <GlassCard
              key={prop.title}
              glow
              className={cn(
                'group reveal-card opacity-0 translate-y-8 transition-all duration-700',
                `[&.animate-in]:opacity-100 [&.animate-in]:translate-y-0 [&.animate-in]:delay-[${index * 100}ms]`
              )}
            >
              <div className={cn(
                'w-14 h-14 rounded-full flex items-center justify-center mb-8 transition-all duration-500 group-hover:scale-125',
                prop.bgColor
              )}>
                <MaterialIcon icon={prop.icon} className={prop.color} size={28} />
              </div>
              <h2 className="text-xl font-semibold mb-4 text-[var(--text-main)]">{prop.title}</h2>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed">{prop.description}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValueProps;
