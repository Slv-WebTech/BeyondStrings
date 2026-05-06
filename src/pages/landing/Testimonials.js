import React from 'react';
import { cn } from './utils';
import GlassCard from './GlassCard';
import MaterialIcon from './MaterialIcon';
import { TESTIMONIALS } from './constants';

const Testimonials = ({ className = '' }) => {
  return (
    <section className={cn('py-16 md:py-24', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-center mb-16 md:mb-20">
          What Teams Say
        </h2>

        <div className="marquee-container">
          <div className="marquee-content">
            {[...TESTIMONIALS, ...TESTIMONIALS].map((testimonial, index) => (
              <GlassCard
                key={`${index}-${testimonial.author}`}
                className="marquee-item min-w-[340px] md:min-w-[420px] transition-all duration-500"
                padding="large"
              >
                <div className="flex gap-1.5 text-[#00f0ff] mb-6">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <MaterialIcon key={i} icon="star" size={20} filled />
                  ))}
                </div>

                <p className="text-base md:text-lg mb-10 italic text-[var(--text-main)] leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#00f0ff] to-[#d0bcff] flex items-center justify-center text-[#00363a] font-bold text-sm">
                    {testimonial.author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--text-main)]">{testimonial.author}</p>
                    <p className="text-xs text-[var(--text-muted)]">{testimonial.role}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
};

export default Testimonials;
