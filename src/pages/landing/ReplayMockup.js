import React from 'react';
import { motion } from 'framer-motion';

/**
 * ReplayMockup - Illustrative conversation-replay timeline preview.
 * Fabricated sample timeline markers — not tied to any real conversation.
 */
const ReplayMockup = ({ className = '' }) => {
  return (
    <div className={`relative flex h-full w-full flex-col gap-5 overflow-hidden rounded-xl bg-[#0a0f1a] p-5 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-white/50">Replay Timeline</span>
        <span className="rounded-full border border-[#00f0ff]/30 bg-[#00f0ff]/10 px-2 py-0.5 text-[10px] font-semibold text-[#00f0ff]">
          Sample data
        </span>
      </div>

      {/* Scrubber */}
      <div className="relative h-1.5 w-full rounded-full bg-white/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '58%' }}
          transition={{ duration: 0.8, ease: [0.2, 0.9, 0.2, 1] }}
          className="h-full rounded-full bg-gradient-to-r from-[#00f0ff] to-[#d0bcff]"
        />
        <motion.span
          initial={{ left: 0 }}
          animate={{ left: '58%' }}
          transition={{ duration: 0.8, ease: [0.2, 0.9, 0.2, 1] }}
          className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/80 bg-gradient-to-br from-[#00f0ff] to-[#d0bcff] shadow-lg"
        />
      </div>

      {/* Context summary callout */}
      <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
        <p className="mb-1 text-[10px] uppercase tracking-wide text-white/40">AI-generated summary</p>
        <p className="text-[13px] leading-relaxed text-white/80">
          Team aligned on the Q3 roadmap priorities and agreed to revisit pricing tiers after the pilot feedback comes in.
        </p>
      </div>

      {/* Date/context tags */}
      <div className="flex flex-wrap gap-2">
        {['Mar 12', 'Roadmap', 'Pricing', 'Decision'].map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[10px] font-medium text-white/60"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ReplayMockup;
