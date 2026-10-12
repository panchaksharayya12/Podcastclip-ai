import React, { useState } from 'react';
import { Sparkles, Download, Save, Filter, FileSpreadsheet, FileCode, CheckCircle2, AlertCircle } from 'lucide-react';
import { ClipSuggestion, UploadedMedia, AnalysisOptions, PlatformType } from '../../types';
import { ClipCard } from './ClipCard';
import { VideoPreviewModal } from './VideoPreviewModal';
import { EditClipModal } from './EditClipModal';
import { CaptionEditorModal } from './CaptionEditorModal';
import { exportCaptions } from '../../utils/api';
import { useToast } from '../UI/Toast';

interface ClipResultsDashboardProps {
  clips: ClipSuggestion[];
  setClips: React.Dispatch<React.SetStateAction<ClipSuggestion[]>>;
  media: UploadedMedia | null;
  analysisMode: 'ai' | 'transcript-based' | 'demo';
  analysisOptions: AnalysisOptions;
  onSaveProject: () => void;
}

export const ClipResultsDashboard: React.FC<ClipResultsDashboardProps> = ({
  clips,
  setClips,
  media,
  analysisMode,
  analysisOptions,
  onSaveProject,
}) => {
  const { showToast } = useToast();

  const [previewClip, setPreviewClip] = useState<ClipSuggestion | null>(null);
  const [editingClip, setEditingClip] = useState<ClipSuggestion | null>(null);
  const [captionClip, setCaptionClip] = useState<ClipSuggestion | null>(null);

  const [sortBy, setSortBy] = useState<'potential' | 'time' | 'duration'>('potential');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');

  if (!clips || clips.length === 0) {
    return null;
  }

  const handleUpdateClip = (updated: ClipSuggestion) => {
    setClips((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleRemoveClip = (clipId: string) => {
    setClips((prev) => prev.filter((c) => c.id !== clipId));
    showToast('Removed clip from dashboard.', 'info');
  };

  const handleExportCsv = async () => {
    try {
      await exportCaptions({
        format: 'csv',
        title: media ? media.originalName : 'clipforge-analysis',
        clips,
      });
      showToast('Exported clips to CSV!', 'success');
    } catch {
      showToast('Failed to export CSV', 'error');
    }
  };

  const handleExportJson = async () => {
    try {
      await exportCaptions({
        format: 'json',
        title: media ? media.originalName : 'clipforge-analysis',
        clips,
      });
      showToast('Exported clips to JSON!', 'success');
    } catch {
      showToast('Failed to export JSON', 'error');
    }
  };

  // Filter & Sort
  const filteredClips = clips.filter((c) => {
    if (filterPlatform === 'all') return true;
    return c.platform === filterPlatform;
  });

  const sortedClips = [...filteredClips].sort((a, b) => {
    if (sortBy === 'potential') {
      const scoreA = a.performanceBreakdown?.overallScore || 0;
      const scoreB = b.performanceBreakdown?.overallScore || 0;
      return scoreB - scoreA;
    }
    if (sortBy === 'time') {
      return a.startTime - b.startTime;
    }
    if (sortBy === 'duration') {
      return a.duration - b.duration;
    }
    return 0;
  });

  return (
    <section id="results" className="scroll-mt-20 py-16 sm:py-24 bg-[#08090B] border-t border-white/8 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Results Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C7F36B]/10 border border-[#C7F36B]/20 text-xs font-semibold text-[#C7F36B] uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Discovery Output</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              Your moments, discovered.
            </h2>
            <p className="text-base text-neutral-400 mt-2 font-normal">
              Review and export curated short-form segments ready for distribution.
            </p>
          </div>

          {/* Action triggers */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onSaveProject}
              className="px-4 py-2.5 rounded-xl bg-[#191B21] hover:bg-[#22252E] border border-white/12 text-xs font-semibold text-white flex items-center gap-2 transition-all active:scale-95 shadow-md"
            >
              <Save className="w-4 h-4 text-[#C7F36B]" />
              <span>Save Project</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2.5 rounded-xl bg-[#191B21] hover:bg-[#22252E] border border-white/10 text-xs font-medium text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors"
              title="Export all clips as CSV spreadsheet"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleExportJson}
              className="px-3.5 py-2.5 rounded-xl bg-[#191B21] hover:bg-[#22252E] border border-white/10 text-xs font-medium text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors"
              title="Export structured clip metadata as JSON"
            >
              <FileCode className="w-4 h-4 text-sky-400" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {/* Results Metadata & Filter Bar */}
        <div className="glass-panel rounded-xl p-4 sm:p-5 border border-white/10 mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs text-neutral-300">
            <div>
              <span className="text-neutral-500 block text-[10px] uppercase font-mono">Found Moments</span>
              <span className="font-bold text-white text-sm">{clips.length} Suggested Clips</span>
            </div>

            <div className="h-6 w-px bg-white/10 hidden sm:block" />

            <div>
              <span className="text-neutral-500 block text-[10px] uppercase font-mono">Source</span>
              <span className="font-medium text-white truncate max-w-[180px] inline-block">
                {media ? media.originalName : 'Imported Transcript'}
              </span>
            </div>

            <div className="h-6 w-px bg-white/10 hidden sm:block" />

            <div>
              <span className="text-neutral-500 block text-[10px] uppercase font-mono">Engine Mode</span>
              <span
                className={`font-semibold inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] ${
                  analysisMode === 'ai'
                    ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                    : analysisMode === 'demo'
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {analysisMode === 'ai'
                  ? 'OpenAI GPT-4o-mini'
                  : analysisMode === 'demo'
                  ? 'Sample Demo'
                  : 'Transcript Heuristic Engine'}
              </span>
            </div>
          </div>

          {/* Filter & Sort Controls */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#111318] border border-white/10 text-white rounded-lg px-2.5 py-1 text-xs focus:ring-0"
              >
                <option value="potential">Potential Score (High to Low)</option>
                <option value="time">Timeline (Chronological)</option>
                <option value="duration">Clip Duration (Shortest)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-neutral-400">Platform:</span>
              <select
                value={filterPlatform}
                onChange={(e) => setFilterPlatform(e.target.value)}
                className="bg-[#111318] border border-white/10 text-white rounded-lg px-2.5 py-1 text-xs focus:ring-0"
              >
                <option value="all">All Platforms</option>
                <option value="YouTube Shorts">YouTube Shorts</option>
                <option value="Instagram Reels">Instagram Reels</option>
                <option value="TikTok">TikTok</option>
                <option value="LinkedIn">LinkedIn</option>
              </select>
            </div>
          </div>
        </div>

        {/* Clip Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedClips.map((clip, idx) => (
            <ClipCard
              key={clip.id}
              clip={clip}
              index={idx}
              media={media}
              onPreview={(c) => setPreviewClip(c)}
              onEdit={(c) => setEditingClip(c)}
              onCaptions={(c) => setCaptionClip(c)}
              onRemove={handleRemoveClip}
              onUpdateClip={handleUpdateClip}
            />
          ))}
        </div>
      </div>

      {/* Video Preview Modal */}
      {previewClip && (
        <VideoPreviewModal
          clip={previewClip}
          media={media}
          onClose={() => setPreviewClip(null)}
        />
      )}

      {/* Edit Clip Modal */}
      {editingClip && (
        <EditClipModal
          clip={editingClip}
          maxDuration={media?.duration}
          onSave={handleUpdateClip}
          onClose={() => setEditingClip(null)}
        />
      )}

      {/* Caption Editor Modal */}
      {captionClip && (
        <CaptionEditorModal
          clip={captionClip}
          onClose={() => setCaptionClip(null)}
        />
      )}
    </section>
  );
};
