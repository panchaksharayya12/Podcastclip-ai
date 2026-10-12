import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Play,
  Edit3,
  Video,
  Copy,
  Check,
  Download,
  Trash2,
  Subtitles,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Share2,
} from 'lucide-react';
import { ClipSuggestion, UploadedMedia } from '../../types';
import { PerformanceBadge } from '../UI/PerformanceBadge';
import { generateVideoClip } from '../../utils/api';
import { useToast } from '../UI/Toast';

interface ClipCardProps {
  clip: ClipSuggestion;
  index: number;
  media: UploadedMedia | null;
  onPreview: (clip: ClipSuggestion) => void;
  onEdit: (clip: ClipSuggestion) => void;
  onCaptions: (clip: ClipSuggestion) => void;
  onRemove: (clipId: string) => void;
  onUpdateClip: (updated: ClipSuggestion) => void;
}

export const ClipCard: React.FC<ClipCardProps> = ({
  clip,
  index,
  media,
  onPreview,
  onEdit,
  onCaptions,
  onRemove,
  onUpdateClip,
}) => {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isRendering, setIsRendering] = useState(false);

  const formatSec = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(clip.caption);
    setCopied(true);
    showToast('Social media caption copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateClip = async () => {
    if (!media || !media.isVideo) {
      showToast(
        'Real video clipping requires an uploaded video file (MP4/MOV). Upload a video in the Studio above to render MP4 clips!',
        'info'
      );
      return;
    }

    setIsRendering(true);
    onUpdateClip({ ...clip, renderStatus: 'rendering' });

    try {
      showToast(`Rendering ${clip.aspectRatio || '9:16'} clip with FFmpeg...`, 'info');

      const result = await generateVideoClip({
        mediaId: media.id,
        startTime: clip.startTime,
        endTime: clip.endTime,
        clipTitle: clip.title,
        aspectRatio: clip.aspectRatio || '9:16',
      });

      onUpdateClip({
        ...clip,
        renderStatus: 'completed',
        generatedClipUrl: result.streamUrl,
        generatedClipId: result.clipId,
      });

      showToast(`Clip "${clip.title}" rendered successfully! Ready to download.`, 'success');
    } catch (err: any) {
      onUpdateClip({
        ...clip,
        renderStatus: 'failed',
        renderError: err.message || 'Rendering failed',
      });
      showToast(err.message || 'Video rendering failed', 'error');
    } finally {
      setIsRendering(false);
    }
  };

  const platformBadgeStyles: Record<string, string> = {
    'YouTube Shorts': 'bg-red-500/10 text-red-400 border-red-500/20',
    'Instagram Reels': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    'TikTok': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    'LinkedIn': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="glass-panel-elevated rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 flex flex-col justify-between group relative shadow-lg"
    >
      <div>
        {/* Top Badges & Timestamps */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-neutral-300 font-semibold">
              {formatSec(clip.startTime)} – {formatSec(clip.endTime)}
            </span>
            <span className="text-[11px] font-mono text-[#C7F36B] font-bold">
              {clip.duration}s
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                platformBadgeStyles[clip.platform] || 'bg-white/5 text-white border-white/10'
              }`}
            >
              {clip.platform}
            </span>

            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/8 text-neutral-400">
              {clip.aspectRatio || '9:16'}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-extrabold text-white tracking-tight mb-2 group-hover:text-[#C7F36B] transition-colors leading-snug">
          {clip.title}
        </h3>

        {/* Hook */}
        <div className="mb-3 p-2.5 rounded-lg bg-[#111318] border border-white/8 text-xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#C7F36B] font-semibold block mb-0.5">
            Opening Hook
          </span>
          <p className="text-neutral-200 italic font-medium leading-relaxed">
            {clip.hook}
          </p>
        </div>

        {/* Reason */}
        <p className="text-xs text-neutral-400 mb-3.5 leading-relaxed line-clamp-2" title={clip.reason}>
          <span className="text-neutral-300 font-medium">Why it works:</span> {clip.reason}
        </p>

        {/* Performance & Score */}
        <div className="mb-4 pt-3 border-t border-white/5 flex items-center justify-between">
          <PerformanceBadge
            potential={clip.engagementPotential}
            breakdown={clip.performanceBreakdown}
            disclaimer={clip.engagementEstimateDisclaimer}
          />
        </div>

        {/* Transcript Excerpt */}
        <div className="bg-[#111318]/70 rounded-lg p-3 text-xs text-neutral-300 border border-white/5 font-sans mb-4 max-h-24 overflow-y-auto leading-relaxed">
          <span className="text-[10px] text-neutral-500 font-mono block mb-1">TRANSCRIPT EXCERPT</span>
          {clip.transcriptExcerpt}
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="pt-4 border-t border-white/10 space-y-3">
        {/* Render status banner if generated */}
        {clip.renderStatus === 'completed' && clip.generatedClipId && (
          <div className="p-2.5 rounded-lg bg-[#C7F36B]/15 border border-[#C7F36B]/30 flex items-center justify-between text-xs text-[#C7F36B]">
            <span className="font-semibold flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>Rendered MP4 Ready</span>
            </span>
            <a
              href={`/api/clips/${clip.generatedClipId}/download`}
              className="px-2.5 py-1 rounded bg-[#C7F36B] text-[#08090B] font-bold hover:bg-[#b5e357] transition-all flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              <span>Download MP4</span>
            </a>
          </div>
        )}

        {clip.renderStatus === 'failed' && (
          <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-300">
            Render error: {clip.renderError}
          </div>
        )}

        {/* Buttons grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Preview Button */}
          <button
            type="button"
            onClick={() => onPreview(clip)}
            className="px-3 py-2 rounded-lg bg-[#191B21] hover:bg-[#22252E] border border-white/10 text-neutral-200 hover:text-white font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <Play className="w-3.5 h-3.5 text-[#C7F36B] fill-[#C7F36B]" />
            <span>Preview</span>
          </button>

          {/* Edit Button */}
          <button
            type="button"
            onClick={() => onEdit(clip)}
            className="px-3 py-2 rounded-lg bg-[#191B21] hover:bg-[#22252E] border border-white/10 text-neutral-200 hover:text-white font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5 text-neutral-400" />
            <span>Edit</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Generate Clip Button */}
          <button
            type="button"
            onClick={handleGenerateClip}
            disabled={isRendering}
            className="px-3 py-2 rounded-lg bg-[#C7F36B]/15 hover:bg-[#C7F36B]/25 border border-[#C7F36B]/30 text-[#C7F36B] font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
            title="Render MP4 video with FFmpeg"
          >
            {isRendering ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Video className="w-3.5 h-3.5" />
            )}
            <span>{isRendering ? 'Rendering...' : 'Generate Clip'}</span>
          </button>

          {/* Subtitles & Styling Button */}
          <button
            type="button"
            onClick={() => onCaptions(clip)}
            className="px-3 py-2 rounded-lg bg-[#191B21] hover:bg-[#22252E] border border-white/10 text-neutral-200 hover:text-white font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <Subtitles className="w-3.5 h-3.5 text-neutral-400" />
            <span>Captions</span>
          </button>
        </div>

        {/* Secondary utilities */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-neutral-400">
          <button
            type="button"
            onClick={handleCopyCaption}
            className="hover:text-white flex items-center gap-1 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#C7F36B]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Caption'}</span>
          </button>

          <button
            type="button"
            onClick={() => onRemove(clip.id)}
            className="hover:text-red-400 flex items-center gap-1 transition-colors"
            title="Remove suggestion"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
