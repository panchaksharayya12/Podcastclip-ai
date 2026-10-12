import React, { useState } from 'react';
import { X, Save, AlertCircle, Clock, AspectRatio, Share2 } from 'lucide-react';
import { ClipSuggestion, PlatformType, AspectRatioType } from '../../types';

interface EditClipModalProps {
  clip: ClipSuggestion | null;
  maxDuration?: number;
  onSave: (updatedClip: ClipSuggestion) => void;
  onClose: () => void;
}

export const EditClipModal: React.FC<EditClipModalProps> = ({
  clip,
  maxDuration,
  onSave,
  onClose,
}) => {
  if (!clip) return null;

  const [title, setTitle] = useState(clip.title);
  const [startTime, setStartTime] = useState(clip.startTime);
  const [endTime, setEndTime] = useState(clip.endTime);
  const [hook, setHook] = useState(clip.hook);
  const [caption, setCaption] = useState(clip.caption);
  const [platform, setPlatform] = useState<PlatformType>(clip.platform);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>(clip.aspectRatio || '9:16');
  const [error, setError] = useState<string | null>(null);

  const duration = Math.max(0, Math.round((endTime - startTime) * 10) / 10);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (startTime < 0) {
      setError('Start time must be greater than or equal to 0.');
      return;
    }

    if (endTime <= startTime) {
      setError('End time must be greater than start time.');
      return;
    }

    if (maxDuration && maxDuration > 0 && endTime > maxDuration + 1) {
      setError(`End time cannot exceed source duration (${maxDuration}s).`);
      return;
    }

    onSave({
      ...clip,
      title: title.trim() || 'Untitled Clip',
      startTime,
      endTime,
      duration,
      hook: hook.trim(),
      caption: caption.trim(),
      platform,
      aspectRatio,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl glass-panel-elevated rounded-2xl border border-white/15 overflow-hidden shadow-2xl">
        <form onSubmit={handleSave}>
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#111318]">
            <div>
              <span className="text-[11px] font-mono text-[#C7F36B] uppercase tracking-wider">
                Moment Studio
              </span>
              <h3 className="text-lg font-bold text-white">Refine & Edit Clip</h3>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form fields */}
          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Clip Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#111318] border border-white/10 text-sm text-white focus:border-[#C7F36B] focus:ring-0 transition-colors"
                required
              />
            </div>

            {/* Start and End Timestamps */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5 mb-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#C7F36B]" />
                  <span>Start Time (seconds)</span>
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={startTime}
                  onChange={(e) => setStartTime(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 rounded-lg bg-[#111318] border border-white/10 text-sm text-white focus:border-[#C7F36B] focus:ring-0"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5 mb-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#C7F36B]" />
                  <span>End Time (seconds)</span>
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={endTime}
                  onChange={(e) => setEndTime(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 rounded-lg bg-[#111318] border border-white/10 text-sm text-white focus:border-[#C7F36B] focus:ring-0"
                  required
                />
              </div>
            </div>

            <div className="text-xs text-neutral-400 flex items-center justify-between px-1">
              <span>Calculated Clip Duration:</span>
              <span className="font-mono text-[#C7F36B] font-bold">{duration} seconds</span>
            </div>

            {/* Hook */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Opening Hook Quote</label>
              <input
                type="text"
                value={hook}
                onChange={(e) => setHook(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-[#111318] border border-white/10 text-sm text-white focus:border-[#C7F36B] focus:ring-0"
              />
            </div>

            {/* Platform & Aspect Ratio */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5 mb-1.5">
                  <Share2 className="w-3.5 h-3.5 text-[#C7F36B]" />
                  <span>Target Platform</span>
                </label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as PlatformType)}
                  className="w-full px-3 py-2 rounded-lg bg-[#111318] border border-white/10 text-xs text-white focus:border-[#C7F36B]"
                >
                  <option value="YouTube Shorts">YouTube Shorts</option>
                  <option value="Instagram Reels">Instagram Reels</option>
                  <option value="TikTok">TikTok</option>
                  <option value="LinkedIn">LinkedIn</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5 mb-1.5">
                  <span className="text-[#C7F36B]">📐</span>
                  <span>Aspect Ratio</span>
                </label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value as AspectRatioType)}
                  className="w-full px-3 py-2 rounded-lg bg-[#111318] border border-white/10 text-xs text-white focus:border-[#C7F36B]"
                >
                  <option value="9:16">9:16 (Vertical Short)</option>
                  <option value="1:1">1:1 (Square Feed)</option>
                  <option value="16:9">16:9 (Landscape Standard)</option>
                </select>
              </div>
            </div>

            {/* Social media caption */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Social Caption & Copy</label>
              <textarea
                rows={3}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#111318] border border-white/10 text-xs text-white focus:border-[#C7F36B] resize-y"
              />
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 p-4 bg-[#111318] border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-neutral-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#C7F36B] hover:bg-[#b5e357] text-[#08090B] font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
