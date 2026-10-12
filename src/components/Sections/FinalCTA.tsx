import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { WaveformCanvas } from '../UI/WaveformCanvas';

interface FinalCTAProps {
  onScrollToStudio: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onScrollToStudio }) => {
  return (
    <section className="relative py-24 sm:py-32 bg-[#08090B] border-t border-white/8 overflow-hidden text-center">
      {/* Background waveform */}
      <WaveformCanvas className="opacity-70" intensity="vibrant" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="w-14 h-14 rounded-2xl bg-[#191B21] border border-[#C7F36B]/30 flex items-center justify-center text-[#C7F36B] mx-auto mb-8 shadow-xl shadow-[#C7F36B]/10">
          <Sparkles className="w-7 h-7" />
        </div>

        <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6">
          Your next great clip is already in the conversation.
        </h2>

        <p className="text-lg text-neutral-400 max-w-2xl mx-auto mb-10 font-normal">
          Stop scrubbing through hours of audio and video. Let ClipForge discover, frame, and prepare your best segments.
        </p>

        <button
          onClick={onScrollToStudio}
          className="px-8 py-4 rounded-xl bg-[#C7F36B] hover:bg-[#b5e357] text-[#08090B] font-extrabold text-base transition-all duration-200 shadow-xl shadow-[#C7F36B]/25 inline-flex items-center gap-2 group active:scale-95"
        >
          <span>Find My Best Moments</span>
          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </section>
  );
};
