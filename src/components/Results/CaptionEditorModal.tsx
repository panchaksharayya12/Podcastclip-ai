import React, { useState } from 'react';
import { X, Download, Sliders, Type, AlignVerticalJustifyCenter, Sparkles } from 'lucide-react';
import { ClipSuggestion, CaptionSettings } from '../../types';
import { exportCaptions } from '../../utils/api';
import { useToast } from '../UI/Toast';

interface CaptionEditorModalProps {
  clip: ClipSuggestion | null;
  onClose: () => void;
}

export const CaptionEditorModal: React.FC<CaptionEditorModalProps> = ({ clip, onClose }) => {
  const { showToast } = useToast();

  const [text, setText] = useState(clip?.transcriptExcerpt || '');
  const [settings, setSettings] = useState<CaptionSettings>({
    fontSize: 'medium',
    textColor: 'white',
    highlightKeyword: true,
    bgStyle: 'semi-dark',
    verticalPosition: 'bottom',
  });

  if (!clip) return null;

  const handleExportSrt = async () => {
    try {
      await exportCaptions({
        format: 'srt',
        title: clip.title,
        startTime: clip.startTime,
        endTime: clip.endTime,
        text,
      });
      showToast('Downloaded SRT subtitle file!', 'success');
    } catch {
      showToast('Failed to export SRT subtitles', 'error');
    }
  };

  const handleExportTxt = async () => {
    try {
      await exportCaptions({
        format: 'txt',
        title: clip.title,
        text,
      });
      showToast('Downloaded TXT transcript excerpt!', 'success');
    } catch {
      showToast('Failed to export TXT file', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl glass-panel-elevated rounded-2xl border border-white/15 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#111318]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#C7F36B]/15 text-[#C7F36B] flex items-center justify-center font-bold">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#C7F36B] uppercase tracking-wider">
                Visual Typography
              </span>
              <h3 className="text-lg font-bold text-white">Animated Captions & Subtitles</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body: Left Editor / Right Vertical Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-y-auto flex-1">
          {/* Controls Column */}
          <div className="lg:col-span-7 space-y-5">
            {/* Textarea */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Spoken Excerpt Text (Subtitles)
              </label>
              <textarea
                rows={4}
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#111318] border border-white/10 text-xs text-white focus:border-[#C7F36B] resize-y leading-relaxed"
              />
            </div>

            {/* Styling Options */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              {/* Font Size */}
              <div>
                <label className="font-semibold text-neutral-300 flex items-center gap-1.5 mb-2">
                  <Type className="w-3.5 h-3.5 text-[#C7F36B]" />
                  <span>Font Size</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['small', 'medium', 'large'] as const).map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSettings({ ...settings, fontSize: size })}
                      className={`py-1.5 capitalize rounded-lg border text-xs ${
                        settings.fontSize === size
                          ? 'bg-[#C7F36B] text-black font-bold border-[#C7F36B]'
                          : 'bg-[#111318] text-neutral-300 border-white/10'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Accent Color */}
              <div>
                <label className="font-semibold text-neutral-300 flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#C7F36B]" />
                  <span>Highlight Keyword</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, highlightKeyword: true })}
                    className={`py-1.5 rounded-lg border text-xs ${
                      settings.highlightKeyword
                        ? 'bg-[#C7F36B] text-black font-bold border-[#C7F36B]'
                        : 'bg-[#111318] text-neutral-300 border-white/10'
                    }`}
                  >
                    Electric Lime
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, highlightKeyword: false })}
                    className={`py-1.5 rounded-lg border text-xs ${
                      !settings.highlightKeyword
                        ? 'bg-white text-black font-bold border-white'
                        : 'bg-[#111318] text-neutral-300 border-white/10'
                    }`}
                  >
                    Monochrome
                  </button>
                </div>
              </div>

              {/* Background Style */}
              <div>
                <label className="font-semibold text-neutral-300 mb-2 block">Background Style</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['none', 'pill', 'semi-dark'] as const).map((bg) => (
                    <button
                      key={bg}
                      type="button"
                      onClick={() => setSettings({ ...settings, bgStyle: bg })}
                      className={`py-1.5 capitalize rounded-lg border text-xs ${
                        settings.bgStyle === bg
                          ? 'bg-[#C7F36B] text-black font-bold border-[#C7F36B]'
                          : 'bg-[#111318] text-neutral-300 border-white/10'
                      }`}
                    >
                      {bg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vertical Position */}
              <div>
                <label className="font-semibold text-neutral-300 flex items-center gap-1.5 mb-2">
                  <AlignVerticalJustifyCenter className="w-3.5 h-3.5 text-[#C7F36B]" />
                  <span>Position</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['top', 'center', 'bottom'] as const).map((pos) => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => setSettings({ ...settings, verticalPosition: pos })}
                      className={`py-1.5 capitalize rounded-lg border text-xs ${
                        settings.verticalPosition === pos
                          ? 'bg-[#C7F36B] text-black font-bold border-[#C7F36B]'
                          : 'bg-[#111318] text-neutral-300 border-white/10'
                      }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Note on sync */}
            <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-[11px] text-neutral-400 leading-relaxed">
              <span className="text-[#C7F36B] font-semibold">Subtitle Synchronization:</span>{' '}
              Sentences are aligned to clip bounds ({clip.startTime}s - {clip.endTime}s). When importing into CapCut, Premiere, or DaVinci Resolve, use the exported .SRT track for precise timeline snap.
            </div>

            {/* Exports */}
            <div className="flex items-center gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={handleExportSrt}
                className="px-4 py-2 rounded-lg bg-[#191B21] hover:bg-[#22252E] border border-white/15 text-xs text-white font-medium flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-[#C7F36B]" />
                <span>Export .SRT Subtitles</span>
              </button>

              <button
                type="button"
                onClick={handleExportTxt}
                className="px-4 py-2 rounded-lg bg-[#191B21] hover:bg-[#22252E] border border-white/15 text-xs text-white font-medium flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-neutral-400" />
                <span>Export .TXT</span>
              </button>
            </div>
          </div>

          {/* Right Column: 9:16 Vertical Mockup Preview */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="w-[220px] h-[390px] rounded-[32px] bg-[#08090B] border-4 border-white/20 shadow-2xl relative overflow-hidden flex flex-col justify-between p-4">
              {/* Top notch */}
              <div className="w-20 h-3.5 bg-black rounded-full mx-auto self-center mb-2" />

              {/* Faux podcast video graphic */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#111318] via-[#191B21] to-[#08090B] pointer-events-none opacity-80" />
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full bg-[#C7F36B]/10 blur-xl pointer-events-none" />

              {/* Positioned Subtitle overlay */}
              <div
                className={`relative z-10 text-center px-2 py-1 transition-all ${
                  settings.verticalPosition === 'top'
                    ? 'mt-8'
                    : settings.verticalPosition === 'center'
                    ? 'my-auto'
                    : 'mb-8'
                }`}
              >
                <div
                  className={`inline-block px-3 py-1.5 rounded-lg ${
                    settings.bgStyle === 'semi-dark'
                      ? 'bg-black/75 backdrop-blur-sm'
                      : settings.bgStyle === 'pill'
                      ? 'bg-[#191B21] border border-white/20'
                      : ''
                  }`}
                >
                  <p
                    className={`font-black uppercase tracking-tight leading-snug drop-shadow-md ${
                      settings.fontSize === 'small'
                        ? 'text-[11px]'
                        : settings.fontSize === 'medium'
                        ? 'text-xs'
                        : 'text-sm'
                    }`}
                  >
                    {settings.highlightKeyword ? (
                      <>
                        <span className="text-white">NO ONE IS EVER </span>
                        <span className="text-[#C7F36B] drop-shadow-[0_0_8px_#C7F36B]">INVITING YOU</span>
                      </>
                    ) : (
                      <span className="text-white">{text.slice(0, 36)}...</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Faux social icons on side */}
              <div className="absolute right-2 bottom-12 flex flex-col gap-2 z-10 text-[9px] text-white/70 items-center">
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">♥</span>
                <span>12.4k</span>
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">💬</span>
                <span>482</span>
              </div>
            </div>

            <p className="text-[11px] text-neutral-500 mt-3 font-mono">
              9:16 Vertical Safe Margin Preview
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-4 bg-[#111318] border-t border-white/10">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-[#C7F36B] hover:bg-[#b5e357] text-[#08090B] font-bold text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
