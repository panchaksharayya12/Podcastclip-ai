import React, { useState } from 'react';
import { Activity, FolderOpen, Menu, X, Sparkles } from 'lucide-react';
import { ServerHealth } from '../types';

interface NavbarProps {
  serverHealth: ServerHealth | null;
  onOpenProjects: () => void;
  savedProjectCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  serverHealth,
  onOpenProjects,
  savedProjectCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel-elevated border-b border-white/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => scrollTo('hero')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#191B21] to-[#111318] border border-white/15 flex items-center justify-center text-[#C7F36B] shadow-lg group-hover:border-[#C7F36B]/50 transition-colors">
            {/* Waveform icon */}
            <svg
              className="w-5 h-5 transition-transform group-hover:scale-110"
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
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-lg text-white font-sans">
                CLIPFORGE<span className="text-[#C7F36B] ml-1">AI</span>
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 font-medium tracking-wider uppercase -mt-1 hidden sm:block">
              Shorts Video Studio
            </p>
          </div>
        </div>

        {/* Center Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-8">
          <button
            onClick={() => scrollTo('hero')}
            className="text-sm font-medium text-neutral-300 hover:text-white transition-colors"
          >
            Home
          </button>
          <button
            onClick={() => scrollTo('studio')}
            className="text-sm font-medium text-neutral-300 hover:text-white transition-colors"
          >
            Studio
          </button>
          <button
            onClick={() => scrollTo('how-it-works')}
            className="text-sm font-medium text-neutral-300 hover:text-white transition-colors"
          >
            How It Works
          </button>
          <button
            onClick={() => scrollTo('features')}
            className="text-sm font-medium text-neutral-300 hover:text-white transition-colors"
          >
            Features
          </button>
          <button
            onClick={() => scrollTo('faq')}
            className="text-sm font-medium text-neutral-300 hover:text-white transition-colors"
          >
            FAQ
          </button>
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Server status badge */}
          {serverHealth && (
            <div
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-neutral-300"
              title={`Server online • FFmpeg: ${serverHealth.ffmpegAvailable ? 'Ready' : 'Missing'} • AI: ${serverHealth.openAiConfigured ? 'Connected' : 'Fallback'}`}
            >
              <span className="w-2 h-2 rounded-full bg-[#C7F36B] animate-pulse" />
              <span>Studio Engine</span>
              {serverHealth.ffmpegAvailable && (
                <span className="text-[#C7F36B] font-semibold">HD</span>
              )}
            </div>
          )}

          {/* Saved Projects Button */}
          <button
            onClick={onOpenProjects}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#191B21] border border-white/10 text-neutral-300 hover:text-white hover:border-white/20 transition-all text-sm font-medium"
            title="Saved Projects Library"
          >
            <FolderOpen className="w-4 h-4 text-neutral-400" />
            <span className="hidden sm:inline">Projects</span>
            {savedProjectCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/10 text-[10px] text-[#C7F36B] font-bold">
                {savedProjectCount}
              </span>
            )}
          </button>

          {/* Primary CTA button */}
          <button
            onClick={() => scrollTo('studio')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#C7F36B] hover:bg-[#b5e357] text-[#08090B] font-semibold text-sm transition-all shadow-md hover:shadow-[#C7F36B]/20 active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Create Clips</span>
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-white/5"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#111318] border-b border-white/10 px-4 pt-3 pb-6 space-y-3">
          <button
            onClick={() => scrollTo('hero')}
            className="block w-full text-left py-2 text-neutral-200 hover:text-[#C7F36B] font-medium"
          >
            Home
          </button>
          <button
            onClick={() => scrollTo('studio')}
            className="block w-full text-left py-2 text-neutral-200 hover:text-[#C7F36B] font-medium"
          >
            Studio
          </button>
          <button
            onClick={() => scrollTo('how-it-works')}
            className="block w-full text-left py-2 text-neutral-200 hover:text-[#C7F36B] font-medium"
          >
            How It Works
          </button>
          <button
            onClick={() => scrollTo('features')}
            className="block w-full text-left py-2 text-neutral-200 hover:text-[#C7F36B] font-medium"
          >
            Features
          </button>
          <button
            onClick={() => scrollTo('faq')}
            className="block w-full text-left py-2 text-neutral-200 hover:text-[#C7F36B] font-medium"
          >
            FAQ
          </button>
        </div>
      )}
    </header>
  );
};

