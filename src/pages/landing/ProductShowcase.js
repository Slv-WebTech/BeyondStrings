import React, { useState } from 'react';
import { cn } from './utils';
import GlassCard from './GlassCard';
import { MODULES } from './constants';

/**
 * ProductShowcase - Interactive tabbed product showcase
 * Features: Animated tab switching, image transitions, content reveal
 */
const ProductShowcase = ({ className = '' }) => {
  const [activeModule, setActiveModule] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleTabChange = (index) => {
    if (index === activeModule || isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveModule(index);
      setIsTransitioning(false);
    }, 300);
  };

  const currentModule = MODULES[activeModule];

  return (
    <section id="platform" className={cn('py-16 md:py-24 scroll-mt-28', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20 md:mb-24">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight mb-6">
            See The Product
          </h2>
          <p className="text-[var(--text-muted)] max-w-2xl mx-auto text-lg">
            Experience the precision of BeyondStrings' three core modules.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Tab Buttons */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {MODULES.map((module, index) => (
              <button
                key={module.id}
                onClick={() => handleTabChange(index)}
                className={cn(
                  'p-7 text-left rounded-xl transition-all duration-500 border-l-4 group',
                  activeModule === index
                    ? 'bg-white/[0.08] border-l-[#00f0ff] shadow-lg shadow-[#00f0ff]/10 scale-105'
                    : 'bg-transparent border-l-transparent hover:bg-white/[0.05] hover:scale-102'
                )}
              >
                <span className={cn(
                  'text-xs font-semibold uppercase tracking-widest mb-3 block transition-all duration-300',
                  activeModule === index ? 'text-[#00f0ff]' : 'text-zinc-500 group-hover:text-zinc-400'
                )}>
                  {module.label}
                </span>
                <h3 className={cn(
                  'text-lg font-semibold mb-3 transition-all duration-300',
                  activeModule === index ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)]'
                )}>
                  {module.title}
                </h3>
                <p className={cn(
                  'text-sm transition-all duration-300 leading-relaxed',
                  activeModule === index ? 'text-[var(--text-muted)]' : 'text-zinc-500 group-hover:text-zinc-400'
                )}>
                  {module.description}
                </p>
              </button>
            ))}
          </div>

          {/* Showcase Display */}
          <div className="lg:col-span-8">
            <GlassCard
              padding="small"
              className="min-h-[400px] md:min-h-[500px] flex items-center justify-center relative overflow-hidden transition-all duration-500"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#00f0ff]/8 via-transparent to-[#d0bcff]/8" />

              <div className={cn(
                'relative w-full h-full transition-all duration-500',
                isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
              )}>
                <img
                  src={currentModule.image}
                  alt={currentModule.alt}
                  className="w-full h-full object-cover rounded-xl shadow-2xl border border-white/10"
                />

                <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md rounded-lg p-4 border border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00f0ff] to-[#d0bcff] flex items-center justify-center text-[#00363a] font-bold text-sm">
                      {currentModule.id}
                    </span>
                    <div>
                      <p className="text-white font-semibold text-sm">{currentModule.title}</p>
                      <p className="text-zinc-400 text-xs">{currentModule.description}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute top-4 right-4 flex gap-2">
                <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <span className="w-3 h-3 rounded-full bg-[#28c840]" />
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;
