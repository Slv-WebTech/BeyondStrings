import React from 'react';
import { motion } from 'framer-motion';

/**
 * AIInsightsMockup - Illustrative analytics dashboard preview.
 * Fabricated sample metrics — not tied to any real account or conversation.
 */
const TOPICS = [
  { label: 'Product roadmap', value: 82 },
  { label: 'Customer feedback', value: 64 },
  { label: 'Q3 planning', value: 47 },
];

const AIInsightsMockup = ({ className = '' }) => {
  return (
    <div className={`relative flex h-full w-full flex-col gap-4 overflow-hidden rounded-xl bg-[#0a0f1a] p-5 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-white/50">Conversation Insights</span>
        <span className="rounded-full border border-[#d0bcff]/30 bg-[#d0bcff]/10 px-2 py-0.5 text-[10px] font-semibold text-[#d0bcff]">
          Sample data
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
          <p className="text-[10px] uppercase tracking-wide text-white/40">Sentiment</p>
          <p className="mt-1 text-2xl font-bold text-emerald-300">Positive</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
          <p className="text-[10px] uppercase tracking-wide text-white/40">Messages analyzed</p>
          <p className="mt-1 text-2xl font-bold text-white/90">1,204</p>
        </div>
      </div>

      <div className="flex-1 rounded-lg border border-white/10 bg-white/[0.04] p-4">
        <p className="mb-3 text-[10px] uppercase tracking-wide text-white/40">Top topics</p>
        <div className="space-y-3">
          {TOPICS.map((topic, index) => (
            <div key={topic.label}>
              <div className="mb-1 flex items-center justify-between text-[11px] text-white/70">
                <span>{topic.label}</span>
                <span className="text-white/40">{topic.value}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${topic.value}%` }}
                  transition={{ duration: 0.6, delay: index * 0.12, ease: [0.2, 0.9, 0.2, 1] }}
                  className="h-full rounded-full bg-gradient-to-r from-[#00f0ff] to-[#d0bcff]"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIInsightsMockup;
