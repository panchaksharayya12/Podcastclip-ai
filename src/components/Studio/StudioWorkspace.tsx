import React, { useState } from 'react';
import { UploadCard } from './UploadCard';
import { TranscriptCard } from './TranscriptCard';
import { AnalysisOptionsPanel } from './AnalysisOptions';
import { AnalysisLoading } from './AnalysisLoading';
import { UploadedMedia, AnalysisOptions, ClipSuggestion } from '../../types';
import { uploadMedia, transcribeMedia, analyzeContent } from '../../utils/api';
import { useToast } from '../UI/Toast';
import { Play, Sparkles } from 'lucide-react';
import { DEMO_TRANSCRIPT, DEMO_CLIPS } from '../../utils/demoData';

interface StudioWorkspaceProps {
  media: UploadedMedia | null;
  setMedia: React.Dispatch<React.SetStateAction<UploadedMedia | null>>;
  transcript: string;
  setTranscript: React.Dispatch<React.SetStateAction<string>>;
  analysisOptions: AnalysisOptions;
  setAnalysisOptions: React.Dispatch<React.SetStateAction<AnalysisOptions>>;
  onAnalysisComplete: (clips: ClipSuggestion[], mode: 'ai' | 'transcript-based' | 'demo') => void;
  onLoadDemo: () => void;
}

export const StudioWorkspace: React.FC<StudioWorkspaceProps> = ({
  media,
  setMedia,
  transcript,
  setTranscript,
  analysisOptions,
  setAnalysisOptions,
  onAnalysisComplete,
  onLoadDemo,
}) => {
  const { showToast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    try {
      const uploaded = await uploadMedia(file, (percent) => setUploadProgress(percent));
      setMedia(uploaded);
      showToast(`Uploaded ${uploaded.originalName} successfully!`, 'success');

      // If no transcript is entered yet, notify that auto-transcription or manual entry is available
      if (!transcript.trim()) {
        showToast('You can now click "Auto-Transcribe Media" or paste a transcript to begin.', 'info');
      }
    } catch (err: any) {
      showToast(err.message || 'File upload failed', 'error');
      throw err;
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const handleRemoveMedia = () => {
    setMedia(null);
    showToast('Media removed from current session.', 'info');
  };

  const handleAutoTranscribe = async () => {
    if (!media) return;
    setIsTranscribing(true);
    setTranscriptionError(null);
    try {
      const res = await transcribeMedia(media.id);
      setTranscript(res.transcript);
      showToast('Media transcribed successfully via Whisper!', 'success');
    } catch (err: any) {
      if (err.requiresApiKey) {
        setTranscriptionError(
          'OpenAI API key (OPENAI_API_KEY) is not configured in .env. You can still paste or import a transcript to use ClipForge AI!'
        );
        showToast('Auto-transcription requires an OpenAI key. Please paste transcript manually.', 'info');
      } else {
        setTranscriptionError(err.message || 'Transcription failed.');
        showToast(err.message || 'Transcription error', 'error');
      }
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleAnalyze = async () => {
    if (!transcript.trim() && !media) {
      showToast('Please upload a video/audio file or paste a transcript to discover clips.', 'error');
      return;
    }

    if (!transcript.trim() && media) {
      showToast('Please auto-transcribe the media or paste a transcript before analyzing.', 'error');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const result = await analyzeContent({
        transcript,
        mediaId: media?.id,
        options: analysisOptions,
      });

      onAnalysisComplete(result.clips, result.analysisMode);
      showToast(`Discovered ${result.clips.length} moments! Mode: ${result.analysisMode.toUpperCase()}`, 'success');

      // Scroll to results dashboard
      setTimeout(() => {
        const resultsEl = document.getElementById('results');
        if (resultsEl) {
          resultsEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 250);
    } catch (err: any) {
      setAnalysisError(err.message || 'Analysis failed. Please check inputs and try again.');
      showToast(err.message || 'Analysis failed', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <section id="studio" className="relative scroll-mt-20 py-16 sm:py-24 bg-[#0B0D12] border-t border-white/8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Studio Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold uppercase tracking-wider text-[#C7F36B] mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ClipForge Studio</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Turn one recording into a library of clips.
            </h2>
            <p className="text-base sm:text-lg text-neutral-400 mt-2 max-w-2xl font-normal">
              Upload your content, discover the strongest moments, and prepare them for social media.
            </p>
          </div>

          {/* Quick Demo Trigger */}
          <button
            onClick={onLoadDemo}
            className="self-start md:self-auto px-4 py-2.5 rounded-xl bg-[#191B21] hover:bg-[#22252E] border border-white/12 text-xs font-semibold text-neutral-200 hover:text-white flex items-center gap-2 transition-all active:scale-95 shadow-sm hover:border-[#C7F36B]/40"
          >
            <Play className="w-3.5 h-3.5 text-[#C7F36B] fill-[#C7F36B]" />
            <span>Load Fictional Podcast Demo</span>
          </button>
        </div>

        {/* Two Main Cards: Upload Media + Use Transcript */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <UploadCard
            media={media}
            uploadProgress={uploadProgress}
            isUploading={isUploading}
            onUpload={handleUpload}
            onRemove={handleRemoveMedia}
          />

          <TranscriptCard
            transcript={transcript}
            onTranscriptChange={setTranscript}
            onAutoTranscribe={handleAutoTranscribe}
            hasUploadedMedia={!!media}
            isTranscribing={isTranscribing}
            transcriptionError={transcriptionError}
          />
        </div>

        {/* Discovery Parameters Panel */}
        <AnalysisOptionsPanel
          options={analysisOptions}
          onChange={setAnalysisOptions}
          onAnalyze={handleAnalyze}
          isLoading={isAnalyzing}
          disabled={!transcript.trim()}
        />

        {/* Analysis loading state */}
        {isAnalyzing && (
          <AnalysisLoading
            error={analysisError}
            onRetry={handleAnalyze}
          />
        )}
      </div>
    </section>
  );
};

