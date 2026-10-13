import { Router, Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { StorageService } from '../services/storageService.js';
import { OpenAiService } from '../services/openAiService.js';
import { FFmpegService } from '../services/ffmpegService.js';
import { UPLOADS_DIR } from '../config.js';

const router = Router();

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { mediaId } = req.body;

    if (!mediaId) {
      return res.status(400).json({ error: 'mediaId is required for automatic transcription.' });
    }

    const media = StorageService.getMedia(mediaId);
    if (!media) {
      return res.status(404).json({ error: 'Uploaded media file not found or expired from server cache.' });
    }

    // Check if OpenAI key is configured
    if (!OpenAiService.isConfigured()) {
      return res.status(400).json({
        error: 'Automatic transcription requires an OpenAI API key (OPENAI_API_KEY in .env). Please provide an API key, or paste/upload a transcript manually to proceed.',
        requiresApiKey: true,
      });
    }

    // Extract 16kHz audio if input is video or large
    let audioPath = media.path;
    let tempExtracted = false;

    if (media.isVideo) {
      const extractedPath = path.join(UPLOADS_DIR, `audio_${media.id}.mp3`);
      await FFmpegService.extractAudio(media.path, extractedPath);
      audioPath = extractedPath;
      tempExtracted = true;
    }

    try {
      const result = await OpenAiService.transcribeAudio(audioPath);

      // Clean up temporary extracted audio file
      if (tempExtracted && fs.existsSync(audioPath)) {
        fs.unlinkSync(audioPath);
      }

      return res.json({
        success: true,
        transcript: result.text,
        segments: result.segments || [],
      });
    } catch (transcribeError: any) {
      if (tempExtracted && fs.existsSync(audioPath)) {
        try { fs.unlinkSync(audioPath); } catch {}
      }
      throw transcribeError;
    }
  } catch (err: any) {
    next(err);
  }
});

export default router;

