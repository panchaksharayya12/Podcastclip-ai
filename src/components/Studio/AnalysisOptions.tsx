import React from 'react';
import { Sparkles, Clock, Share2, Compass, Layers } from 'lucide-react';
import { AnalysisOptions, DurationOption, PlatformType, ClipStyleType } from '../../types';

interface AnalysisOptionsProps {
  options: AnalysisOptions;
  onChange: (options: AnalysisOptions) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  disabled: boolean;
}

export const AnalysisOptionsPanel: React.FC<AnalysisOptionsProps> = ({
  options,
  onChange,
  onAnalyze,
  isLoading,
  disabled,
}) => {
  const durations: { label: string; value: DurationOption }[] = [
    { label: '15–30 sec', value: '15-30' },
    { label: '30–60 sec', value: '30-60' },
    { label: '60–90 sec', value: '60-90' },
  ];

  const platforms: PlatformType[] = [
    'YouTube Shorts',
    'Instagram Reels',
    'TikTok',
    'LinkedIn',
  ];

  const styles: ClipStyleType[] = [
    'Educational',
    'Entertaining',
    'Inspirational',
    'Controversial discussion',
    'Storytelling',
    'Podcast highlights',
  ];

  const quantities = [5, 10, 15];

  return (
    <div className="glass-panel-elevated rounded-2xl p-6 sm:p-8 border border-white/12 shadow-2xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Discovery Parameters</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#C7F36B]/15 text-[#C7F36B] border border-[#C7F36B]/30 font-medium">
              Step 2
            </span>
          </h3>
          <p className="text-xs text-neutral-400 mt-1">
            Tailor AI moment detection for your target audience, platform algorithm, and clip pacing.
          </p>
        </div>

        <button
          onClick={onAnalyze}
          disabled={disabled || isLoading}
          className="px-8 py-4 rounded-xl bg-[#C7F36B] hover:bg-[#b5e357] disabled:opacity-40 disabled:cursor-not-allowed text-[#08090B] font-extrabold text-base transition-all duration-200 flex items-center justify-center gap-2.5 shadow-lg shadow-[#C7F36B]/15 active:scale-95 shrink-0"
        >
          <Sparkles className="w-5 h-5" />
          <span>{isLoading ? 'Analyzing...' : 'Find My Best Moments'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
        {/* Target Duration */}
        <div>
          <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5 mb-2.5">
            <Clock className="w-3.5 h-3.5 text-[#C7F36B]" />
            <span>Target Duration</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {durations.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => onChange({ ...options, targetDuration: d.value })}
                className={`py-2 px-1 text-center rounded-lg text-xs font-medium transition-all ${
                  options.targetDuration === d.value
                    ? 'bg-[#C7F36B] text-[#08090B] font-bold shadow-sm'
                    : 'bg-[#111318] hover:bg-[#191B21] text-neutral-300 border border-white/8'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Platform */}
        <div>
          <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5 mb-2.5">
            <Share2 className="w-3.5 h-3.5 text-[#C7F36B]" />
            <span>Target Platform</span>
          </label>
          <select
            value={options.platform}
            onChange={(e) => onChange({ ...options, platform: e.target.value as PlatformType })}
            className="w-full py-2.5 px-3 rounded-lg bg-[#111318] border border-white/10 text-xs text-white focus:border-[#C7F36B] focus:ring-0 transition-colors"
          >
            {platforms.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Clip Style */}
        <div>
          <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5 mb-2.5">
            <Compass className="w-3.5 h-3.5 text-[#C7F36B]" />
            <span>Moment Archetype / Style</span>
          </label>
          <select
            value={options.clipStyle}
            onChange={(e) => onChange({ ...options, clipStyle: e.target.value as ClipStyleType })}
            className="w-full py-2.5 px-3 rounded-lg bg-[#111318] border border-white/10 text-xs text-white focus:border-[#C7F36B] focus:ring-0 transition-colors"
          >
            {styles.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Number of suggestions */}
        <div>
          <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5 mb-2.5">
            <Layers className="w-3.5 h-3.5 text-[#C7F36B]" />
            <span>Number of Clips</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {quantities.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => onChange({ ...options, numberOfSuggestions: q })}
                className={`py-2 px-1 text-center rounded-lg text-xs font-medium transition-all ${
                  options.numberOfSuggestions === q
                    ? 'bg-[#C7F36B] text-[#08090B] font-bold shadow-sm'
                    : 'bg-[#111318] hover:bg-[#191B21] text-neutral-300 border border-white/8'
                }`}
              >
                {q} clips
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
