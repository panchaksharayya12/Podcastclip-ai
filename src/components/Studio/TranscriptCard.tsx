import React, { useRef, useState } from 'react';
import { FileText, Upload, Sparkles, RefreshCw, AlertCircle, Copy, Check } from 'lucide-react';
import { DEMO_TRANSCRIPT } from '../../utils/demoData';

interface TranscriptCardProps {
  transcript: string;
  onTranscriptChange: (text: string) => void;
  onAutoTranscribe?: () => Promise<void>;
  hasUploadedMedia: boolean;
  isTranscribing: boolean;
  transcriptionError?: string | null;
}

export const TranscriptCard: React.FC<TranscriptCardProps> = ({
  transcript,
  onTranscriptChange,
  onAutoTranscribe,
  hasUploadedMedia,
  isTranscribing,
  transcriptionError,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [copied, setCopied] = useState(false);

  // Calculate words and estimated reading time
  const wordCount = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;
  const estMinutes = Math.round((wordCount / 145) * 10) / 10;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onTranscriptChange(content);
      }
    };
    reader.readAsText(file);
  };

  const loadSample = () => {
    onTranscriptChange(DEMO_TRANSCRIPT);
  };

  const handleCopy = () => {
    if (!transcript) return;
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 sm:p-7 border border-white/10 flex flex-col justify-between h-full relative">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#C7F36B]">
              <span className="text-xs font-bold">B</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Use a Transcript</h3>
              <p className="text-xs text-neutral-400">Paste text or upload TXT / SRT subtitles</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadSample}
              className="text-xs px-2.5 py-1 rounded bg-[#C7F36B]/10 hover:bg-[#C7F36B]/20 text-[#C7F36B] border border-[#C7F36B]/25 font-medium transition-colors"
            >
              Load Sample
            </button>
          </div>
        </div>

        {/* Action ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import .TXT / .SRT</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.srt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </button>

            {hasUploadedMedia && onAutoTranscribe && (
              <button
                type="button"
                onClick={onAutoTranscribe}
                disabled={isTranscribing}
                className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[#C7F36B] hover:text-[#b5e357] flex items-center gap-1.5 transition-colors disabled:opacity-50"
                title="Transcribe using OpenAI Whisper API"
              >
                {isTranscribing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>{isTranscribing ? 'Transcribing...' : 'Auto-Transcribe Media'}</span>
              </button>
            )}
          </div>

          {wordCount > 0 && (
            <div className="flex items-center gap-2 text-neutral-400 text-[11px]">
              <span>{wordCount} words</span>
              <span>•</span>
              <span>~{estMinutes} min reading</span>
              <button
                type="button"
                onClick={handleCopy}
                className="ml-1 text-neutral-400 hover:text-white transition-colors"
                title="Copy transcript"
              >
                {copied ? <Check className="w-3 h-3 text-[#C7F36B]" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          )}
        </div>

        {/* Textarea */}
        <div className="relative">
          <textarea
            value={transcript}
            onChange={(e) => onTranscriptChange(e.target.value)}
            placeholder="Paste your conversation, interview, or podcast transcript here... Or click 'Load Sample' above to see ClipForge AI in action."
            rows={8}
            className="w-full rounded-xl bg-[#111318] border border-white/12 p-4 text-sm text-neutral-200 placeholder-neutral-500 focus:border-[#C7F36B] focus:ring-1 focus:ring-[#C7F36B] transition-all resize-y font-sans leading-relaxed min-h-[220px]"
          />

          {transcript && (
            <button
              type="button"
              onClick={() => onTranscriptChange('')}
              className="absolute bottom-3 right-3 text-xs text-neutral-500 hover:text-neutral-300 bg-[#191B21] px-2 py-1 rounded border border-white/10 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Transcription notice or error */}
        {transcriptionError && (
          <div className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-300">Transcription Notice</p>
              <p className="text-[11px] text-neutral-300 mt-0.5">{transcriptionError}</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-neutral-500 flex items-center justify-between">
        <span>SRT timestamp syntax recognized</span>
        <span>Works 100% without API key</span>
      </div>
    </div>
  );
};

