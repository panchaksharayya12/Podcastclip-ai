import React, { useState } from 'react';
import { Flame, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { PerformanceBreakdown } from '../../types';

interface PerformanceBadgeProps {
  potential: 'High' | 'Very High' | 'Moderate';
  breakdown?: PerformanceBreakdown;
  disclaimer: string;
}

export const PerformanceBadge: React.FC<PerformanceBadgeProps> = ({
  potential,
  breakdown,
  disclaimer,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const potentialStyles = {
    'Very High': 'bg-[#C7F36B]/15 text-[#C7F36B] border-[#C7F36B]/30',
    'High': 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    'Moderate': 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  };

  const score = breakdown?.overallScore || (potential === 'Very High' ? 92 : potential === 'High' ? 84 : 76);

  return (
    <div className="relative inline-block text-xs">
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-semibold tracking-wide ${potentialStyles[potential]}`}
        >
          <Flame className="w-3 h-3 shrink-0" />
          <span>{potential} Potential</span>
          <span className="opacity-60 ml-0.5">• {score}/100</span>
        </span>

        {breakdown && (
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="text-neutral-400 hover:text-neutral-200 transition-colors p-1 rounded hover:bg-white/5 flex items-center gap-0.5 text-[11px]"
            title="View content potential breakdown"
          >
            <span>Score breakdown</span>
            {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}
      </div>

      {showDetails && breakdown && (
        <div className="mt-2.5 p-3 rounded-lg bg-[#111318] border border-white/10 text-neutral-300 shadow-xl w-72 z-20">
          <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
            <span className="font-medium text-white text-xs">AI Content Potential Breakdown</span>
            <span className="text-[#C7F36B] font-bold">{breakdown.overallScore}/100</span>
          </div>

          <div className="space-y-1.5 mb-2.5 text-[11px]">
            <div className="flex justify-between items-center">
              <span className="text-neutral-400">Hook Clarity</span>
              <span className="font-medium text-white">{breakdown.hookClarity}%</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
              <div className="bg-[#C7F36B] h-full rounded-full" style={{ width: `${breakdown.hookClarity}%` }} />
            </div>

            <div className="flex justify-between items-center pt-1">
              <span className="text-neutral-400">Standalone Context</span>
              <span className="font-medium text-white">{breakdown.standaloneMeaning}%</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
              <div className="bg-sky-400 h-full rounded-full" style={{ width: `${breakdown.standaloneMeaning}%` }} />
            </div>

            <div className="flex justify-between items-center pt-1">
              <span className="text-neutral-400">Insight & Emotion</span>
              <span className="font-medium text-white">{breakdown.educationalEmotionalValue}%</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
              <div className="bg-purple-400 h-full rounded-full" style={{ width: `${breakdown.educationalEmotionalValue}%` }} />
            </div>

            <div className="flex justify-between items-center pt-1">
              <span className="text-neutral-400">Pace & Conciseness</span>
              <span className="font-medium text-white">{breakdown.conciseness}%</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
              <div className="bg-amber-400 h-full rounded-full" style={{ width: `${breakdown.conciseness}%` }} />
            </div>
          </div>

          <div className="pt-2 border-t border-white/5 flex items-start gap-1.5 text-[10px] text-neutral-400 leading-tight">
            <Info className="w-3 h-3 text-[#C7F36B] shrink-0 mt-0.5" />
            <span>{disclaimer || 'Qualitative AI estimate, not measured platform analytics.'}</span>
          </div>
        </div>
      )}
    </div>
  );
};

