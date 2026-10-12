import React, { useState, useRef } from 'react';
import { UploadCloud, FileVideo, Music, Trash2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { UploadedMedia } from '../../types';

interface UploadCardProps {
  media: UploadedMedia | null;
  uploadProgress: number | null;
  isUploading: boolean;
  onUpload: (file: File) => Promise<void>;
  onRemove: () => void;
}

export const UploadCard: React.FC<UploadCardProps> = ({
  media,
  uploadProgress,
  isUploading,
  onUpload,
  onRemove,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDuration = (seconds?: number): string => {
    if (!seconds || seconds <= 0) return 'Duration unknown';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  const validateAndUpload = (file: File) => {
    setError(null);
    const validExtensions = ['.mp4', '.mov', '.webm', '.mp3', '.wav', '.m4a'];
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();

    if (!validExtensions.includes(ext) && !file.type.startsWith('video/') && !file.type.startsWith('audio/')) {
      setError(`Unsupported file type (${ext || file.type}). Please select an MP4, MOV, WebM, MP3, WAV, or M4A file.`);
      return;
    }

    if (file.size > 500 * 1024 * 1024) {
      setError('File exceeds 500 MB limit. Please choose a smaller file.');
      return;
    }

    onUpload(file).catch((err: any) => {
      setError(err.message || 'Upload failed. Please try again.');
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndUpload(e.target.files[0]);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 sm:p-7 border border-white/10 flex flex-col justify-between h-full relative overflow-hidden">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#C7F36B]">
              <span className="text-xs font-bold">A</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Upload Media</h3>
              <p className="text-xs text-neutral-400">Video or audio recording</p>
            </div>
          </div>

          <span className="text-[11px] font-medium text-neutral-400 px-2 py-0.5 rounded bg-white/5 border border-white/5">
            MP4, MOV, WebM, MP3, WAV
          </span>
        </div>

        {/* Drop zone / Uploading state / Uploaded file card */}
        {!media && !isUploading && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[220px] ${
              isDragging
                ? 'border-[#C7F36B] bg-[#C7F36B]/5 scale-[0.99]'
                : 'border-white/15 hover:border-white/30 bg-[#111318]/50 hover:bg-[#111318]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".mp4,.mov,.webm,.mp3,.wav,.m4a,video/mp4,video/quicktime,video/webm,audio/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-13 h-13 rounded-2xl bg-[#191B21] border border-white/10 flex items-center justify-center text-[#C7F36B] mb-4 shadow-md group-hover:scale-105 transition-transform">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-white mb-1">
              Drag and drop your recording here
            </p>
            <p className="text-xs text-neutral-400 mb-4">
              or click to browse from your computer
            </p>
            <span className="text-[11px] text-neutral-500">
              Max file size: 500 MB • Real video required for video exports
            </span>
          </div>
        )}

        {/* Uploading progress indicator */}
        {isUploading && (
          <div className="border border-white/10 rounded-xl p-8 text-center bg-[#111318] min-h-[220px] flex flex-col items-center justify-center">
            <RefreshCw className="w-8 h-8 text-[#C7F36B] animate-spin mb-4" />
            <p className="text-sm font-semibold text-white mb-1">Uploading media to studio...</p>
            <p className="text-xs text-neutral-400 mb-4">Validating format and probing timestamps</p>

            <div className="w-full max-w-xs bg-white/10 rounded-full h-2 overflow-hidden mb-2">
              <div
                className="bg-[#C7F36B] h-full transition-all duration-200 rounded-full"
                style={{ width: `${uploadProgress || 15}%` }}
              />
            </div>
            <span className="text-xs font-mono text-[#C7F36B]">{uploadProgress || 15}%</span>
          </div>
        )}

        {/* Uploaded media confirmation card */}
        {media && !isUploading && (
          <div className="border border-white/15 rounded-xl p-5 bg-[#111318] min-h-[200px] flex flex-col justify-between">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#191B21] border border-white/10 flex items-center justify-center text-[#C7F36B]">
                  {media.isVideo ? <FileVideo className="w-6 h-6" /> : <Music className="w-6 h-6" />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-xs" title={media.originalName}>
                    {media.originalName}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
                    <span>{formatFileSize(media.size)}</span>
                    <span>•</span>
                    <span className="text-[#C7F36B] font-medium">{formatDuration(media.duration)}</span>
                  </div>
                </div>
              </div>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#C7F36B]/15 border border-[#C7F36B]/30 text-[11px] text-[#C7F36B] font-semibold">
                <CheckCircle2 className="w-3 h-3" />
                <span>Ready</span>
              </span>
            </div>

            <div className="bg-[#191B21]/60 rounded-lg p-3 border border-white/5 text-xs text-neutral-400 space-y-1 mb-4">
              <div className="flex justify-between">
                <span>Media Type:</span>
                <span className="text-neutral-200 font-medium">{media.isVideo ? 'Video (MP4/WebM)' : 'Audio Recording'}</span>
              </div>
              <div className="flex justify-between">
                <span>Clip Generation:</span>
                <span className={media.isVideo ? 'text-[#C7F36B] font-medium' : 'text-amber-400'}>
                  {media.isVideo ? 'Full MP4 Video Output' : 'Audio/Transcript only'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".mp4,.mov,.webm,.mp3,.wav,.m4a"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Replace file</span>
              </button>

              <button
                type="button"
                onClick={onRemove}
                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        )}

        {/* Error notification */}
        {error && (
          <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-neutral-500 flex items-center justify-between">
        <span>Storage: Local Studio Server</span>
        <span>Secure & Private</span>
      </div>
    </div>
  );
};
