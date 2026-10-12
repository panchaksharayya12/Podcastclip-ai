import React, { useRef, useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, Volume2, VolumeX, AlertCircle } from 'lucide-react';
import { ClipSuggestion, UploadedMedia } from '../../types';

interface VideoPreviewModalProps {
  clip: ClipSuggestion | null;
  media: UploadedMedia | null;
  onClose: () => void;
}

export const VideoPreviewModal: React.FC<VideoPreviewModalProps> = ({
  clip,
  media,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [loopClip, setLoopClip] = useState(true);

  useEffect(() => {
    if (!clip || !videoRef.current) return;
    const video = videoRef.current;
    video.currentTime = clip.startTime;
    setCurrentTime(clip.startTime);
    video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  }, [clip]);

  if (!clip) return null;

  const handleTimeUpdate = () => {
    if (!videoRef.current || !clip) return;
    const current = videoRef.current.currentTime;
    setCurrentTime(current);

    // Stop or loop when end of clip is reached
    if (current >= clip.endTime) {
      if (loopClip) {
        videoRef.current.currentTime = clip.startTime;
        videoRef.current.play();
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      if (videoRef.current.currentTime >= clip.endTime) {
        videoRef.current.currentTime = clip.startTime;
      }
      videoRef.current.play().then(() => setIsPlaying(true));
    }
  };

  const restartClip = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = clip.startTime;
    videoRef.current.play().then(() => setIsPlaying(true));
  };

  const formatSec = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    const ms = Math.floor((s % 1) * 10);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms}`;
  };

  const clipProgress = Math.min(
    100,
    Math.max(0, ((currentTime - clip.startTime) / (clip.endTime - clip.startTime)) * 100)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-3xl glass-panel-elevated rounded-2xl border border-white/15 overflow-hidden shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-[#111318]">
          <div className="min-w-0 pr-4">
            <span className="text-[11px] font-mono text-[#C7F36B] uppercase tracking-wider">
              Preview Segment
            </span>
            <h3 className="text-lg font-bold text-white truncate">{clip.title}</h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video / Audio Player or Demo placeholder */}
        <div className="relative bg-black flex items-center justify-center min-h-[360px] max-h-[520px] overflow-hidden">
          {media && media.isVideo ? (
            <video
              ref={videoRef}
              src={media.url}
              onTimeUpdate={handleTimeUpdate}
              muted={isMuted}
              playsInline
              className="w-full h-full max-h-[500px] object-contain"
            />
          ) : media && media.isAudio ? (
            <div className="p-8 text-center flex flex-col items-center">
              <audio
                ref={videoRef as any}
                src={media.url}
                onTimeUpdate={handleTimeUpdate}
                muted={isMuted}
              />
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#C7F36B] mb-4">
                <Volume2 className="w-8 h-8" />
              </div>
              <p className="text-sm font-semibold text-white">Audio Preview</p>
              <p className="text-xs text-neutral-400 mt-1 max-w-sm">
                Playing audio from {formatSec(clip.startTime)} to {formatSec(clip.endTime)}
              </p>
            </div>
          ) : (
            <div className="p-10 text-center max-w-md">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto mb-4">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-white mb-1">Demo Mode Video Preview</h4>
              <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                This moment is timed from <span className="text-[#C7F36B] font-mono">{formatSec(clip.startTime)}</span> to <span className="text-[#C7F36B] font-mono">{formatSec(clip.endTime)}</span> ({clip.duration}s).
              </p>
              <div className="p-3 rounded-lg bg-white/5 text-[11px] text-neutral-300 text-left">
                To preview real media and render MP4 video files, upload your actual MP4/MOV recording in the Studio upload card above.
              </div>
            </div>
          )}

          {/* Hook banner overlay */}
          <div className="absolute top-4 left-4 right-4 pointer-events-none">
            <span className="inline-block px-3 py-1.5 rounded-lg bg-black/75 backdrop-blur-md border border-white/15 text-xs text-[#C7F36B] font-medium max-w-full truncate shadow-lg">
              Hook: {clip.hook}
            </span>
          </div>
        </div>

        {/* Player Controls Bar */}
        <div className="p-4 sm:p-5 bg-[#111318] border-t border-white/10 space-y-3">
          {/* Progress bar */}
          <div className="space-y-1">
            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[#C7F36B] h-full transition-all duration-100"
                style={{ width: `${clipProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-mono text-neutral-400">
              <span>{formatSec(currentTime)}</span>
              <span className="text-[#C7F36B]">Clip: {formatSec(clip.startTime)} – {formatSec(clip.endTime)} ({clip.duration}s)</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={togglePlay}
                className="w-9 h-9 rounded-lg bg-[#C7F36B] text-[#08090B] flex items-center justify-center font-bold hover:bg-[#b5e357] transition-all"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>

              <button
                type="button"
                onClick={restartClip}
                className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
                title="Restart clip from beginning"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs text-neutral-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={loopClip}
                  onChange={(e) => setLoopClip(e.target.checked)}
                  className="rounded border-white/20 text-[#C7F36B] focus:ring-0 bg-transparent"
                />
                <span>Loop segment</span>
              </label>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-white transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
