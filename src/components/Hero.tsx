import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, Wand2, Subtitles, Video, Play } from 'lucide-react';
import { WaveformCanvas } from './UI/WaveformCanvas';

interface HeroProps {
  onStartCreating: () => void;
  onTryDemo: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartCreating, onTryDemo }) => {
  // Split words for staggered word-by-word reveal
  const headlinePart1 = ['Your', 'best', 'moments'];
  const headlinePart2 = ['deserve', 'the', 'spotlight.'];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1], // ease-out cubic
      },
    },
  };

  return (
    <section id="hero" className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-[#08090B] pt-12 pb-20">
      {/* Background canvas effects */}
      <WaveformCanvas className="opacity-90" intensity="vibrant" />

      {/* Ambient background radial gradient */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#C7F36B]/5 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 left-1/4 w-[400px] h-[300px] bg-sky-500/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        {/* Status Badge */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#191B21]/90 border border-white/10 text-xs font-semibold tracking-wider uppercase text-neutral-300 mb-8 backdrop-blur-md shadow-lg"
        >
          <span className="w-2 h-2 rounded-full bg-[#C7F36B] shadow-[0_0_8px_#C7F36B]" />
          <span>AI-Powered Clip Discovery</span>
        </motion.div>

        {/* Word-by-word headline reveal */}
        <motion.h1
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.08] font-sans"
        >
          <span className="inline-block mr-3">
            {headlinePart1.map((word, i) => (
              <motion.span
                key={i}
                variants={wordVariants}
                className="inline-block mr-2 sm:mr-4.5"
              >
                {word}
              </motion.span>
            ))}
          </span>
          <br className="hidden sm:inline" />
          <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-[#C7F36B]">
            {headlinePart2.map((word, i) => (
              <motion.span
                key={i}
                variants={wordVariants}
                className={`inline-block mr-2 sm:mr-4.5 ${word === 'spotlight.' ? 'text-[#C7F36B]' : ''}`}
              >
                {word}
              </motion.span>
            ))}
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="max-w-2xl mx-auto text-lg sm:text-xl text-neutral-400 mb-10 leading-relaxed font-normal"
        >
          Turn long podcasts and videos into short, captioned clips ready for your next audience.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.75 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <button
            onClick={onStartCreating}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#C7F36B] hover:bg-[#b5e357] text-[#08090B] font-bold text-base transition-all duration-200 shadow-xl shadow-[#C7F36B]/20 flex items-center justify-center gap-2 group active:scale-95"
          >
            <Sparkles className="w-5 h-5 text-[#08090B]" />
            <span>Start Creating</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>

          <button
            onClick={onTryDemo}
            className="w-full sm:w-auto px-7 py-4 rounded-xl bg-[#191B21] hover:bg-[#22252E] border border-white/12 text-white font-semibold text-base transition-all duration-200 flex items-center justify-center gap-2.5 active:scale-95 hover:border-white/25"
          >
            <Play className="w-4 h-4 text-[#C7F36B] fill-[#C7F36B]" />
            <span>Try Sample Demo</span>
          </button>
        </motion.div>

        {/* Compact feature strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="inline-grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 pt-8 border-t border-white/10 text-neutral-300 text-sm"
        >
          <div className="flex items-center justify-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-white/5 text-[#C7F36B]">
              <Wand2 className="w-4 h-4" />
            </div>
            <span className="font-medium">Smart moment detection</span>
          </div>

          <div className="flex items-center justify-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-white/5 text-[#C7F36B]">
              <Subtitles className="w-4 h-4" />
            </div>
            <span className="font-medium">Animated captions</span>
          </div>

          <div className="flex items-center justify-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-white/5 text-[#C7F36B]">
              <Video className="w-4 h-4" />
            </div>
            <span className="font-medium">Vertical-ready exports (9:16)</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
