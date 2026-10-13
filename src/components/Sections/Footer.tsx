import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#08090B] border-t border-white/10 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-12 border-b border-white/10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#191B21] border border-white/15 flex items-center justify-center text-[#C7F36B]">
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 10v4" />
                  <path d="M6 6v12" />
                  <path d="M10 3v18" />
                  <path d="M14 7v10" />
                  <path d="M18 5v14" />
                  <path d="M22 10v4" />
                </svg>
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                CLIPFORGE<span className="text-[#C7F36B] ml-1">AI</span>
              </span>
            </div>

            <p className="text-sm text-neutral-400 max-w-sm">
              "One conversation. A hundred moments worth sharing."
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-6 text-sm text-neutral-400">
            <button onClick={() => scrollTo('hero')} className="hover:text-white transition-colors">
              Home
            </button>
            <button onClick={() => scrollTo('studio')} className="hover:text-white transition-colors">
              Studio
            </button>
            <button onClick={() => scrollTo('how-it-works')} className="hover:text-white transition-colors">
              How It Works
            </button>
            <button onClick={() => scrollTo('features')} className="hover:text-white transition-colors">
              Features
            </button>
            <button onClick={() => scrollTo('faq')} className="hover:text-white transition-colors">
              FAQ
            </button>
          </nav>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#C7F36B]" />
            <span>
              Local Development Privacy Note: Media and generated clips are stored locally on your development server.
            </span>
          </div>

          <span>© {new Date().getFullYear()} ClipForge AI. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
};

