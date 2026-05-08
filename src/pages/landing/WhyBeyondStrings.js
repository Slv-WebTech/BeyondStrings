import React from 'react';
import { cn } from './utils';
import MaterialIcon from './MaterialIcon';
import GlassCard from './GlassCard';
import { CHECKLIST_ITEMS } from './constants';

const WhyBeyondStrings = ({ className = '' }) => {
  return (
    <section className={cn('py-16 md:py-24', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-28 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight mb-8 leading-tight">
              Designed as a conversation intelligence system
            </h2>
            <p className="text-base md:text-lg text-[var(--text-muted)] mb-10 leading-relaxed">
              BeyondStrings isn't just another chat tool. It's a strategic layer for your
              organization's most valuable asset: its knowledge.
            </p>

            <ul className="space-y-5">
              {CHECKLIST_ITEMS.map((item, index) => (
                <li key={index} className="flex items-center gap-3 group transition-all duration-300 hover:translate-x-2">
                  <span className="w-7 h-7 rounded-full bg-[#00f0ff]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#00f0ff]/30 transition-all duration-300 group-hover:scale-110">
                    <MaterialIcon icon="check_circle" size={20} className="text-[#00f0ff]" />
                  </span>
                  <span className="text-sm md:text-base text-[var(--text-main)]">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <GlassCard padding="small" className="group overflow-hidden transition-all duration-500 hover:shadow-[0_10px_40px_rgba(0,240,255,0.15)] hover:scale-105">
            <div className="relative overflow-hidden rounded-2xl">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAar46SyqID6MTSEZKHx_8vzrYcYaFYD_6clgMkmixFQk8WjH56WFt9Lk9kTujNFv-hRLQpU_QNDue92eLaJ8RWJYx2MpAtHnHx-gBYrQ8umdqo70xCshPxy2bx0Al327tJyd_wf4zpb9uZe93NE3zZaXet3z-mFM-jGRKkOhm6Ur_KzZvx0Q0m2gbS2J7x1aa5tuwilpZQwYF-BT6pMmGZgiLDUjvtnprZ1dLLYkXZIcsrbL1u_iRIFD0GXy1R1NBzgG3rVqY2XmC0"
                alt="Conversation intelligence visualization"
                className="w-full h-auto transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#051424]/60 via-transparent to-transparent" />
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  );
};

export default WhyBeyondStrings;
