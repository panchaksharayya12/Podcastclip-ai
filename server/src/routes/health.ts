import { Router, Request, Response } from 'express';
import { FFmpegService } from '../services/ffmpegService.js';
import { OpenAiService } from '../services/openAiService.js';
import { CONFIG } from '../config.js';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const ffmpegAvailable = await FFmpegService.isFFmpegAvailable();
  const openAiConfigured = OpenAiService.isConfigured();

  res.json({
    status: 'ok',
    version: '1.0.0',
    app: 'ClipForge AI',
    ffmpegAvailable,
    openAiConfigured,
    maxUploadMb: CONFIG.MAX_UPLOAD_MB,
    timestamp: new Date().toISOString(),
  });
});

export default router;
