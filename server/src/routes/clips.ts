import { Router, Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { GENERATED_DIR } from '../config.js';
import { StorageService } from '../services/storageService.js';
import { FFmpegService } from '../services/ffmpegService.js';

const router = Router();

// Track generated clips in memory for lookup
interface GeneratedClipRecord {
  id: string;
  filename: string;
  filePath: string;
  title: string;
  duration: number;
  aspectRatio: string;
  createdAt: string;
}

const generatedRegistry = new Map<string, GeneratedClipRecord>();

router.post('/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      mediaId,
      startTime,
      endTime,
      clipTitle = 'ClipForge Moment',
      aspectRatio = '9:16',
    } = req.body;

    const isFfmpegReady = await FFmpegService.isFFmpegAvailable();
    if (!isFfmpegReady) {
      return res.status(503).json({
        error: 'FFmpeg is not available on this server. To render video clips, ensure FFmpeg is installed or ffmpeg-static is configured.',
        ffmpegAvailable: false,
      });
    }

    if (!mediaId) {
      return res.status(400).json({
        error: 'Video rendering requires a real uploaded video file. In demo mode or transcript-only mode, please upload a video file first.',
      });
    }

    const media = StorageService.getMedia(mediaId);
    if (!media || !fs.existsSync(media.path)) {
      return res.status(404).json({
        error: 'Source media file not found on server or expired.',
      });
    }

    if (!media.isVideo) {
      return res.status(400).json({
        error: 'The uploaded file is an audio recording. Video clipping requires a video source (MP4, MOV, or WebM).',
      });
    }

    const start = parseFloat(String(startTime));
    const end = parseFloat(String(endTime));

    if (isNaN(start) || isNaN(end) || start < 0 || end <= start) {
      return res.status(400).json({
        error: 'Invalid start or end time. End time must be greater than start time, and start time must be >= 0.',
      });
    }

    const duration = end - start;
    if (duration > 180) {
      return res.status(400).json({
        error: 'Clip duration cannot exceed 180 seconds for short-form clips.',
      });
    }

    const safeAspect = ['9:16', '1:1', '16:9'].includes(aspectRatio) ? aspectRatio : '9:16';
    const clipId = uuidv4();
    const outputFilename = `clipforge_${clipId}.mp4`;
    const outputPath = path.join(GENERATED_DIR, outputFilename);

    console.log(`[ClipForge] Rendering clip ${clipId} (${start}s to ${end}s, ${safeAspect}) from ${media.filename}`);

    await FFmpegService.generateClip({
      sourcePath: media.path,
      outputPath,
      startTime: start,
      endTime: end,
      aspectRatio: safeAspect as any,
    });

    const clipRecord: GeneratedClipRecord = {
      id: clipId,
      filename: outputFilename,
      filePath: outputPath,
      title: clipTitle,
      duration: Math.round(duration * 10) / 10,
      aspectRatio: safeAspect,
      createdAt: new Date().toISOString(),
    };

    generatedRegistry.set(clipId, clipRecord);

    res.status(201).json({
      success: true,
      clipId,
      filename: outputFilename,
      downloadUrl: `/api/clips/${clipId}/download`,
      streamUrl: `/generated/${outputFilename}`,
      duration: clipRecord.duration,
      aspectRatio: safeAspect,
    });
  } catch (err: any) {
    next(err);
  }
});

router.get('/:id/download', (req: Request, res: Response) => {
  const id = String(req.params.id);
  const clip = generatedRegistry.get(id);

  if (!clip || !fs.existsSync(clip.filePath)) {
    // Also check if file exists directly in GENERATED_DIR with safe filename
    const fallbackPath = StorageService.resolveGeneratedPath(`clipforge_${path.basename(id)}.mp4`);
    if (fallbackPath && fs.existsSync(fallbackPath)) {
      const downloadName = `clipforge_${id.slice(0, 8)}.mp4`;
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
      return fs.createReadStream(fallbackPath).pipe(res);
    }
    return res.status(404).json({ error: 'Clip file not found or has been removed.' });
  }

  const safeTitle = (clip.title || 'moment')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')
    .slice(0, 30);
  const downloadName = `clipforge_${safeTitle}.mp4`;

  res.setHeader('Content-Type', 'video/mp4');
  res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);

  const fileStream = fs.createReadStream(clip.filePath);
  fileStream.pipe(res);
});

export default router;
