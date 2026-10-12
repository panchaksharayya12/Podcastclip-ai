import React from 'react';
import { motion } from 'motion/react';
import { UploadCloud, Sparkles, SlidersHorizontal, Download } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Upload',
      desc: 'Bring your podcast or video into the studio. We accept MP4, MOV, WebM, or audio recordings up to 500 MB.',
      icon: UploadCloud,
    },
    {
      number: '02',
      title: 'Analyze',
      desc: 'Find memorable, informative, and engaging moments using our structured AI hook detection algorithm.',
      icon: Sparkles,
    },
    {
      number: '03',
      title: 'Refine',
      desc: 'Edit the clip boundaries, adjust animated typography captions, and choose vertical 9:16 or square 1:1 framing.',
      icon: SlidersHorizontal,
    },
    {
      number: '04',
      title: 'Export',
      desc: 'Generate and download clips rendered with FFmpeg, or export clean .SRT subtitles and CSV metadata.',
      icon: Download,
    },
  ];

  return (
    <section id="how-it-works" className="scroll-mt-20 py-20 sm:py-28 bg-[#08090B] border-t border-white/8 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#C7F36B] uppercase tracking-wider mb-4">
            <span>Workflow Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            From long-form to ready-to-share.
          </h2>
          <p className="text-base sm:text-lg text-neutral-400 mt-4 leading-relaxed font-normal">
            A frictionless pipeline engineered to transform hours of dialogue into high-retention short videos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.12 }}
                className="glass-panel rounded-2xl p-7 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Step number watermark */}
                <div className="absolute top-4 right-4 text-4xl font-black font-mono text-white/5 group-hover:text-[#C7F36B]/15 transition-colors">
                  {step.number}
                </div>

                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#191B21] border border-white/10 flex items-center justify-center text-[#C7F36B] mb-6 group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>

                  <span className="text-xs font-mono text-[#C7F36B] font-bold tracking-wider uppercase block mb-1">
                    Step {step.number}
                  </span>

                  <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
                    {step.title}
                  </h3>

                  <p className="text-sm text-neutral-400 leading-relaxed font-normal">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-neutral-500 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C7F36B]" />
                  <span>Cinematic pipeline</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
