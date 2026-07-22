import React from 'react';
import { motion } from 'framer-motion';

/**
 * ChatWorkspaceMockup - Static illustrative render of the live chat workspace.
 *
 * Entirely fabricated placeholder conversation (no real user data, no
 * screenshots of live accounts) — built to resemble the actual in-app bubble
 * language (rounded-2xl, gradient sent bubbles) for an authentic preview.
 */
const MOCK_MESSAGES = [
  { from: 'them', text: 'Hey! Did you get a chance to look at the Q3 report?', time: '10:41 AM' },
  { from: 'me', text: 'Yes, just finished — numbers look great this quarter 📈', time: '10:42 AM' },
  { from: 'them', text: 'Should we set up a call to walk through the roadmap?', time: '10:43 AM' },
  { from: 'me', text: "Works for me. I'll send an invite for tomorrow.", time: '10:44 AM' },
];

const ChatWorkspaceMockup = ({ className = '' }) => {
  return (
    <div className={`relative flex h-full w-full flex-col overflow-hidden rounded-xl bg-[#0a0f1a] ${className}`}>
      {/* Fake window chrome */}
      <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <div className="ml-3 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#00f0ff] to-[#d0bcff] text-[10px] font-bold text-[#00363a]">
            AR
          </span>
          <span className="text-xs font-semibold text-white/90">Alex Rivera</span>
          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-300/80">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Online
          </span>
        </div>
      </div>

      {/* Fabricated conversation */}
      <div className="flex flex-1 flex-col justify-end gap-2.5 px-4 py-4">
        {MOCK_MESSAGES.map((message, index) => (
          <motion.div
            key={message.text}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.08 }}
            className={`flex ${message.from === 'me' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-[13px] leading-snug shadow-lg ${
                message.from === 'me'
                  ? 'rounded-br-md bg-gradient-to-br from-[#00d9e6] to-[#00b8c4] text-[#00232a]'
                  : 'rounded-bl-md border border-white/10 bg-white/[0.06] text-white/90'
              }`}
            >
              {message.text}
              <span
                className={`mt-1 block text-right text-[10px] ${
                  message.from === 'me' ? 'text-[#00363a]/70' : 'text-white/40'
                }`}
              >
                {message.time}
              </span>
            </div>
          </motion.div>
        ))}

        {/* Typing indicator for a sense of liveness */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="flex justify-start"
        >
          <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.06] px-3 py-2">
            {[0, 1, 2].map((dot) => (
              <span
                key={dot}
                className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/50"
                style={{ animationDelay: `${dot * 0.15}s` }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ChatWorkspaceMockup;
