import { Router, Request, Response, NextFunction } from 'express';
import { OpenAiService } from '../services/openAiService.js';
import { TranscriptAnalysisService, AnalysisOptions } from '../services/transcriptAnalysisService.js';
import { StorageService } from '../services/storageService.js';

const router = Router();

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      transcript,
      mediaId,
      targetDuration = '30-60',
      platform = 'YouTube Shorts',
      clipStyle = 'Educational',
      numberOfSuggestions = 10,
    } = req.body;

    if (!transcript || typeof transcript !== 'string' || transcript.trim().length === 0) {
      return res.status(400).json({ error: 'Please provide a transcript or upload an audio/video file with a transcript.' });
    }

    if (transcript.trim().length < 40) {
      return res.status(400).json({ error: 'Transcript is too short. Please provide at least a few sentences to discover meaningful moments.' });
    }

    let mediaDuration: number | undefined;
    if (mediaId) {
      const media = StorageService.getMedia(mediaId);
      if (media && media.duration && media.duration > 0) {
        mediaDuration = media.duration;
      }
    }

    const options: AnalysisOptions = {
      targetDuration: ['15-30', '30-60', '60-90'].includes(targetDuration) ? targetDuration : '30-60',
      platform: ['YouTube Shorts', 'Instagram Reels', 'TikTok', 'LinkedIn'].includes(platform) ? platform : 'YouTube Shorts',
      clipStyle: ['Educational', 'Entertaining', 'Inspirational', 'Controversial discussion', 'Storytelling', 'Podcast highlights'].includes(clipStyle)
        ? clipStyle
        : 'Educational',
      numberOfSuggestions: Math.min(15, Math.max(1, parseInt(String(numberOfSuggestions), 10) || 10)),
    };

    let clips: any[] = [];
    let analysisMode: 'ai' | 'transcript-based' = 'transcript-based';

    if (OpenAiService.isConfigured()) {
      try {
        clips = await OpenAiService.analyzeTranscriptWithAi(transcript, options, mediaDuration);
        analysisMode = 'ai';
      } catch (aiErr) {
        console.warn('AI analysis error, reverting to deterministic engine:', aiErr);
        clips = TranscriptAnalysisService.analyzeTranscript(transcript, options, mediaDuration);
        analysisMode = 'transcript-based';
      }
    } else {
      clips = TranscriptAnalysisService.analyzeTranscript(transcript, options, mediaDuration);
      analysisMode = 'transcript-based';
    }

    // Server-side validation of clips
    clips = clips.filter((c) => {
      const isValid = c && c.startTime >= 0 && c.endTime > c.startTime && c.duration > 0;
      if (mediaDuration && mediaDuration > 0) {
        return isValid && c.startTime <= mediaDuration;
      }
      return isValid;
    });

    // If mediaDuration is known, ensure endTime doesn't overshoot
    if (mediaDuration && mediaDuration > 0) {
      clips.forEach((c) => {
        if (c.endTime > mediaDuration!) {
          c.endTime = mediaDuration!;
          c.duration = Math.round((c.endTime - c.startTime) * 10) / 10;
        }
      });
    }

    // Sort by overall score descending
    clips.sort((a, b) => (b.performanceBreakdown?.overallScore || 0) - (a.performanceBreakdown?.overallScore || 0));

    res.json({
      success: true,
      analysisMode,
      totalSuggestions: clips.length,
      clips,
    });
  } catch (err: any) {
    next(err);
  }
});

export default router;

