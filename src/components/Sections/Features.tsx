import React from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Mic,
  Lightbulb,
  Subtitles,
  Smartphone,
  PlaySquare,
  BarChart3,
  Share2,
  FolderOpen,
  FileDown,
} from 'lucide-react';

export const Features: React.FC = () => {
  const features = [
    {
      title: 'Smart Moment Discovery',
      desc: 'Algorithmically locates punchy statements, rhetorical questions, and emotional peaks without manual scrubbing.',
      icon: Sparkles,
    },
    {
      title: 'Automatic Transcription',
      desc: 'High-accuracy Whisper transcription with full offline fallback for uploaded .SRT and raw text transcripts.',
      icon: Mic,
    },
    {
      title: 'AI Hook Suggestions',
      desc: 'Crafts opening 3-second challenge hooks designed to stop thumb-scrolling across feed algorithms.',
      icon: Lightbulb,
    },
    {
      title: 'Animated Captions',
      desc: 'Dynamic subtitle styler with custom font sizing, electric lime keyword highlights, and mobile-safe padding.',
      icon: Subtitles,
    },
    {
      title: 'Vertical Video Export',
      desc: 'Server-side FFmpeg rendering converts widescreen 16:9 recordings into vertical 9:16 reels with blurred background fill.',
      icon: Smartphone,
    },
    {
      title: 'Clip Preview Player',
      desc: 'Built-in timestamp-accurate HTML5 player lets you review the exact segment before rendering.',
      icon: PlaySquare,
    },
    {
      title: 'Content Potential Scoring',
      desc: 'Transparent qualitative breakdown of hook clarity, standalone context, emotional weight, and conciseness.',
      icon: BarChart3,
    },
    {
      title: 'Multi-Platform Formatting',
      desc: 'Tailors captions, character counts, and hashtag presets for YouTube Shorts, Reels, TikTok, and LinkedIn.',
      icon: Share2,
    },
    {
      title: 'Project Library',
      desc: 'Organize your podcast episodes and save curated clip libraries locally on your development server.',
      icon: FolderOpen,
    },
    {
      title: 'Universal Caption Export',
      desc: 'Download universal .SRT subtitle files, plain text excerpts, or full metadata spreadsheets in CSV & JSON.',
      icon: FileDown,
    },
  ];

  return (
    <section id="features" className="scroll-mt-20 py-20 sm:py-28 bg-[#0B0D12] border-t border-white/8 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#C7F36B] uppercase tracking-wider mb-4">
            <span>Capabilities</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Engineered for modern short-form workflows.
          </h2>
          <p className="text-base sm:text-lg text-neutral-400 mt-4 leading-relaxed font-normal">
            Every tool you need to turn one recording into a full social distribution calendar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: (idx % 3) * 0.1 }}
                className="glass-panel rounded-2xl p-6 sm:p-7 border border-white/8 hover:border-[#C7F36B]/40 transition-all duration-300 flex flex-col justify-between group hover:shadow-xl hover:shadow-[#C7F36B]/5"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-[#191B21] border border-white/10 flex items-center justify-center text-[#C7F36B] mb-5 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 tracking-tight group-hover:text-[#C7F36B] transition-colors">
                    {feat.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-normal">
                    {feat.desc}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-neutral-500 font-mono">
                  <span>Feature 0{idx + 1}</span>
                  <span className="text-[#C7F36B] opacity-0 group-hover:opacity-100 transition-opacity">Included</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
