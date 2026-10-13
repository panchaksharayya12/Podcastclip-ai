import { AnalysisOptions, ClipSuggestion, Project, ServerHealth, UploadedMedia } from '../types';

export class ApiError extends Error {
  status?: number;
  requiresApiKey?: boolean;
  constructor(message: string, status?: number, requiresApiKey?: boolean) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.requiresApiKey = requiresApiKey;
  }
}

export async function fetchHealth(): Promise<ServerHealth> {
  const res = await fetch('/api/health');
  if (!res.ok) {
    throw new ApiError('Failed to fetch server health', res.status);
  }
  return res.json();
}

export async function uploadMedia(
  file: File,
  onProgress?: (percent: number) => void
): Promise<UploadedMedia> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('media', file);

    xhr.open('POST', '/api/upload', true);

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(data);
        } else {
          reject(new ApiError(data.error || 'Upload failed', xhr.status));
        }
      } catch (err) {
        reject(new ApiError('Failed to parse server response', xhr.status));
      }
    };

    xhr.onerror = () => {
      reject(new ApiError('Network error during file upload'));
    };

    xhr.send(formData);
  });
}

export async function transcribeMedia(mediaId: string): Promise<{ transcript: string }> {
  const res = await fetch('/api/transcribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mediaId }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new ApiError(data.error || 'Transcription failed', res.status, data.requiresApiKey);
  }
  return data;
}

export async function analyzeContent(params: {
  transcript: string;
  mediaId?: string;
  options: AnalysisOptions;
}): Promise<{ clips: ClipSuggestion[]; analysisMode: 'ai' | 'transcript-based' }> {
  const res = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      transcript: params.transcript,
      mediaId: params.mediaId,
      targetDuration: params.options.targetDuration,
      platform: params.options.platform,
      clipStyle: params.options.clipStyle,
      numberOfSuggestions: params.options.numberOfSuggestions,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new ApiError(data.error || 'Analysis failed', res.status);
  }
  return { clips: data.clips, analysisMode: data.analysisMode };
}

export async function generateVideoClip(params: {
  mediaId: string;
  startTime: number;
  endTime: number;
  clipTitle: string;
  aspectRatio: '9:16' | '1:1' | '16:9';
}): Promise<{ clipId: string; filename: string; downloadUrl: string; streamUrl: string; duration: number }> {
  const res = await fetch('/api/clips/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new ApiError(data.error || 'Video rendering failed', res.status);
  }
  return data;
}

export async function saveProject(project: Partial<Project>): Promise<Project> {
  const res = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new ApiError(data.error || 'Failed to save project', res.status);
  }
  return data.project;
}

export async function fetchProjects(): Promise<Project[]> {
  const res = await fetch('/api/projects');
  const data = await res.json();
  if (!res.ok) {
    throw new ApiError(data.error || 'Failed to fetch projects', res.status);
  }
  return data.projects || [];
}

export async function deleteProject(id: string): Promise<void> {
  const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const data = await res.json();
    throw new ApiError(data.error || 'Failed to delete project', res.status);
  }
}

export async function exportCaptions(params: {
  format: 'srt' | 'txt' | 'csv' | 'json';
  title: string;
  startTime?: number;
  endTime?: number;
  text?: string;
  clips?: ClipSuggestion[];
}): Promise<void> {
  const res = await fetch('/api/captions/export', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    throw new ApiError('Failed to export captions/data');
  }

  const blob = await res.blob();
  const disposition = res.headers.get('Content-Disposition');
  let filename = `clipforge-export.${params.format}`;
  if (disposition && disposition.includes('filename=')) {
    const match = disposition.match(/filename="?([^"]+)"?/);
    if (match && match[1]) filename = match[1];
  }

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

