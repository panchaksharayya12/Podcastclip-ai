import React from 'react';
import { Sparkles, Quote } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <section className="py-20 sm:py-28 bg-[#08090B] border-t border-white/8 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-[#191B21] border border-white/10 flex items-center justify-center text-[#C7F36B] mx-auto mb-8 shadow-xl">
          <Quote className="w-6 h-6" />
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-8 leading-tight">
          Built for creators who think in moments.
        </h2>

        <p className="text-lg sm:text-xl text-neutral-300 max-w-3xl mx-auto font-normal leading-relaxed mb-10">
          ClipForge AI helps podcasters, educators, interviewers, and creators turn long-form conversations into concise stories worth sharing.
        </p>

        <div className="inline-grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10 border-t border-white/10 text-left max-w-3xl mx-auto">
          <div className="p-4 rounded-xl bg-white/5 border border-white/5">
            <span className="text-[#C7F36B] font-mono font-bold text-xs block mb-1">01 / HONESTY</span>
            <p className="text-xs text-neutral-300">
              Clear qualitative analysis without fabricated virality guarantees or inflated follower claims.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/5">
            <span className="text-[#C7F36B] font-mono font-bold text-xs block mb-1">02 / LOCAL CONTROL</span>
            <p className="text-xs text-neutral-300">
              Files are processed on your development server with zero required cloud vendor lock-in.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/5">
            <span className="text-[#C7F36B] font-mono font-bold text-xs block mb-1">03 / CREATOR SPEED</span>
            <p className="text-xs text-neutral-300">
              From raw media upload to export-ready 9:16 vertical clips and SRT subtitles in seconds.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
