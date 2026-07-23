import React from 'react';
import { motion } from 'framer-motion';
import { cn } from './utils';
import SectionHeading from './SectionHeading';
import { PRESET_CHAT_BACKGROUNDS } from '../../utils/chatBackgrounds';

/**
 * WallpaperGallery - Showcases a curated set of the built-in chat wallpaper
 * presets users can pick from in-app. All images are the same publicly
 * hosted stock wallpapers already used live in the product's Appearance
 * settings — no user data of any kind.
 */
const FEATURED_WALLPAPER_IDS = [
  'moody-pinterest-romance',
  'dark-rose-neon',
  'forest-nature',
  'anime-moon',
  'night-ocean',
  'romantic-aurora-1697',
  'minimalism-4k',
  'brand-flowers',
];

const featuredWallpapers = FEATURED_WALLPAPER_IDS
  .map((id) => PRESET_CHAT_BACKGROUNDS.find((item) => item.id === id))
  .filter(Boolean);

const WallpaperGallery = ({ className = '' }) => {
  return (
    <section id="wallpapers" aria-labelledby="wallpapers-heading" className={cn('py-16 md:py-24 scroll-mt-28', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          className="mb-14 md:mb-16"
          title={<span id="wallpapers-heading">Make every chat feel like yours</span>}
          subtitle="Dozens of built-in wallpapers across casual, romantic, and professional themes — switch anytime from Appearance settings."
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
          {featuredWallpapers.map((wallpaper, index) => (
            <motion.div
              key={wallpaper.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: Math.min(index, 6) * 0.05 }}
              className="group relative aspect-[4/5] overflow-hidden rounded-xl border border-[var(--border-soft)] shadow-lg"
            >
              <img
                src={wallpaper.url}
                alt={wallpaper.label}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3">
                <p className="truncate text-xs font-semibold text-white">{wallpaper.label}</p>
                <span className="mt-0.5 inline-block rounded-full border border-white/20 bg-white/10 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-white/70 backdrop-blur">
                  {wallpaper.chatMode === 'casual' ? 'Romantic' : 'Professional'} · {wallpaper.mode}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WallpaperGallery;
