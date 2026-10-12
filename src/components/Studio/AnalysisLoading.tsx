import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { WaveformCanvas } from '../UI/WaveformCanvas';

interface AnalysisLoadingProps {
  onCancel?: () => void;
  error?: string | null;
  onRetry?: () => void;
}

export const AnalysisLoading: React.FC<AnalysisLoadingProps> = ({ error, onRetry }) => {
  const [currentStage, setCurrentStage] = useState(0);

  const stages = [
    { title: 'Reading the transcript', desc: 'Parsing sentence structure and cadence' },
    { title: 'Finding strong moments', desc: 'Detecting hooks, punchlines, and high-impact takeaways' },
    { title: 'Evaluating clip boundaries', desc: 'Optimizing start and end timestamps for natural narrative flow' },
    { title: 'Preparing captions', desc: 'Generating platform-optimized subtitles and hashtags' },
    { title: 'Building the results', desc: 'Scoring viral potential and structuring studio dashboard' },
  ];

  useEffect(() => {
    if (error) return;

    const interval = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev < stages.length - 1) return prev + 1;
        return prev;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [error, stages.length]);

  return (
    <div className="relative glass-panel-elevated rounded-2xl p-8 sm:p-12 border border-white/15 overflow-hidden shadow-2xl my-8">
      {/* Waveform canvas */}
      <WaveformCanvas className="opacity-40" intensity="vibrant" />

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        {!error ? (
          <>
            <div className="w-16 h-16 rounded-2xl bg-[#191B21] border border-[#C7F36B]/30 flex items-center justify-center mx-auto mb-6 text-[#C7F36B] shadow-[0_0_30px_rgba(199,243,107,0.2)]">
              <Sparkles className="w-8 h-8 animate-pulse" />
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">
              Discovering Your Strongest Moments
            </h3>
            <p className="text-sm text-neutral-400 mb-8">
              ClipForge engine is scanning narrative hooks and retention triggers...
            </p>

            {/* Stages Timeline */}
            <div className="space-y-3 mb-8 text-left bg-[#111318]/90 rounded-xl p-5 border border-white/8 backdrop-blur-md">
              {stages.map((stage, idx) => {
                const isCompleted = idx < currentStage;
                const isCurrent = idx === currentStage;

                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 transition-opacity duration-300 ${
                      isCurrent ? 'opacity-100' : isCompleted ? 'opacity-70' : 'opacity-30'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-[#C7F36B]" />
                      ) : isCurrent ? (
                        <div className="w-4 h-4 rounded-full border-2 border-[#C7F36B] border-t-transparent animate-spin" />
                      ) : (
                        <span className="text-neutral-500 font-mono text-[11px]">{idx + 1}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-semibold tracking-tight ${
                          isCurrent ? 'text-[#C7F36B]' : 'text-white'
                        }`}
                      >
                        {stage.title}
                      </p>
                      <p className="text-xs text-neutral-400 truncate">{stage.desc}</p>
                    </div>

                    {isCurrent && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#C7F36B]/15 text-[#C7F36B]">
                        Active
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Progress bar */}
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden mb-4">
              <motion.div
                className="bg-[#C7F36B] h-full rounded-full"
                animate={{ width: `${Math.min(96, (currentStage + 1) * 20)}%` }}
                transition={{ duration: 0.6 }}
              />
            </div>

            <p className="text-[11px] text-neutral-500 font-medium">
              Staged analysis visualization while processing transcript and video bounds
            </p>
          </>
        ) : (
          <div className="py-6">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4 text-red-400">
              <AlertCircle className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">Analysis Failed</h3>
            <p className="text-sm text-red-300 max-w-md mx-auto mb-6">{error}</p>

            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="px-6 py-2.5 rounded-xl bg-[#C7F36B] hover:bg-[#b5e357] text-[#08090B] font-bold text-sm inline-flex items-center gap-2 transition-all shadow-md active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Analysis</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
