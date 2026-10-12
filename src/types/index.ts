export type PlatformType = 'YouTube Shorts' | 'Instagram Reels' | 'TikTok' | 'LinkedIn';

export type ClipStyleType = 
  | 'Educational' 
  | 'Entertaining' 
  | 'Inspirational' 
  | 'Controversial discussion' 
  | 'Storytelling' 
  | 'Podcast highlights';

export type DurationOption = '15-30' | '30-60' | '60-90';

export type AspectRatioType = '9:16' | '1:1' | '16:9';

export interface PerformanceBreakdown {
  hookClarity: number; // 0-100
  standaloneMeaning: number; // 0-100
  educationalEmotionalValue: number; // 0-100
  conciseness: number; // 0-100
  overallScore: number; // 0-100
  explanation: string;
}

export interface ClipSuggestion {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  duration: number;
  transcriptExcerpt: string;
  hook: string;
  reason: string;
  caption: string;
  hashtags: string[];
  platform: PlatformType;
  engagementPotential: 'High' | 'Very High' | 'Moderate';
  engagementEstimateDisclaimer: string;
  performanceBreakdown?: PerformanceBreakdown;
  aspectRatio?: AspectRatioType;
  generatedClipUrl?: string;
  generatedClipId?: string;
  renderStatus?: 'idle' | 'rendering' | 'completed' | 'failed';
  renderError?: string;
}

export interface AnalysisOptions {
  targetDuration: DurationOption;
  platform: PlatformType;
  clipStyle: ClipStyleType;
  numberOfSuggestions: number;
}

export interface UploadedMedia {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  duration?: number;
  url: string;
  isVideo: boolean;
  isAudio: boolean;
}

export interface CaptionSettings {
  fontSize: 'small' | 'medium' | 'large';
  textColor: 'white' | 'accent';
  highlightKeyword: boolean;
  bgStyle: 'none' | 'outline' | 'pill' | 'semi-dark';
  verticalPosition: 'bottom' | 'center' | 'top';
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  media?: UploadedMedia | null;
  transcript: string;
  analysisOptions: AnalysisOptions;
  clips: ClipSuggestion[];
  analysisMode: 'ai' | 'transcript-based' | 'demo';
}

export interface ServerHealth {
  status: string;
  version: string;
  ffmpegAvailable: boolean;
  openAiConfigured: boolean;
  timestamp: string;
}
