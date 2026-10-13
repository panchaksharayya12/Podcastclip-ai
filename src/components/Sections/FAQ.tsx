import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const FAQ: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What is ClipForge AI?',
      a: 'ClipForge AI is a complete full-stack platform designed to analyze long-form video podcasts and recordings, identify the most captivating short moments, format social-ready captions, and render short clips with FFmpeg.',
    },
    {
      q: 'Which file formats are supported?',
      a: 'ClipForge AI accepts video files in MP4, MOV, and WebM format, as well as audio files in MP3, WAV, and M4A up to 500 MB. Transcripts can be uploaded as .SRT subtitle files or plain text .TXT files.',
    },
    {
      q: 'Can I use it without an AI API key?',
      a: 'Yes, completely! When no OpenAI API key is configured, ClipForge AI runs an intelligent deterministic transcript analysis algorithm that extracts natural sentence boundaries, questions, and conversational hooks. Automatic Whisper transcription requires an OpenAI key, but you can always paste or upload a transcript file manually.',
    },
    {
      q: 'Does it create actual video clips?',
      a: 'Yes. When a video file is uploaded, clicking "Generate Clip" invokes the server-side FFmpeg engine to trim the exact timestamps, apply aspect ratio transforms (e.g. 9:16 vertical), and encode an authentic, standalone MP4 file ready for download.',
    },
    {
      q: 'Can I edit captions?',
      a: 'Yes. The Caption Studio allows you to customize font size, toggle electric lime keyword highlights, pick background styling, and export a standard .SRT subtitle file compatible with Premiere Pro, Final Cut, and CapCut.',
    },
    {
      q: 'Can I export vertical videos?',
      a: 'Yes. Our FFmpeg processing pipeline supports 9:16 vertical format (with cinematic blurred background padding that prevents image stretching), 1:1 square framing, and 16:9 widescreen.',
    },
    {
      q: 'Does it guarantee viral content?',
      a: 'No platform can guarantee virality or algorithmic views. Engagement depends on genuine audience interest, platform timing, and content value. ClipForge AI provides transparent qualitative potential estimates based on hook clarity, conciseness, and self-contained meaning, clearly marked as estimates rather than platform analytics.',
    },
    {
      q: 'Where are uploaded files stored?',
      a: 'In this local deployment, files are saved locally on your development server inside the server/uploads and server/generated directories. No recordings are sent to third parties unless you configure an OpenAI key and choose AI transcription.',
    },
  ];

  return (
    <section id="faq" className="scroll-mt-20 py-20 sm:py-28 bg-[#0B0D12] border-t border-white/8 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#C7F36B] uppercase tracking-wider mb-4">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Honest Answers</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-base text-neutral-400 mt-4 font-normal">
            Everything you need to know about formats, processing, and privacy.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="glass-panel rounded-xl border border-white/10 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-white/5 transition-colors"
                >
                  <span className="font-bold text-white text-base tracking-tight">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#C7F36B] transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 text-sm text-neutral-400 leading-relaxed border-t border-white/5 pt-3">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

