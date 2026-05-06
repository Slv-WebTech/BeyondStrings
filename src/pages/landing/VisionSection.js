import React from 'react';
import { cn } from './utils';

const VisionSection = ({ className = '' }) => {
  return (
    <section className={cn('py-20 md:py-32 text-center', className)}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight mb-6 md:mb-8">
          About & Vision
        </h2>
        <p className="text-base md:text-lg text-[#b9cacb] leading-relaxed">
          Founded in 2024, BeyondStrings was born from a simple observation: modern teams 
          generate massive amounts of data in their conversations, yet 90% of it is never used again. 
          Our mission is to build the semantic bridge between raw human dialogue and structured 
          machine intelligence, ensuring that every insight is captured and every decision is searchable.
        </p>
      </div>
    </section>
  );
};

export default VisionSection;
