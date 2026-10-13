import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { CONFIG, UPLOADS_DIR } from '../config.js';
import { StorageService } from '../services/storageService.js';
import { FFmpegService } from '../services/ffmpegService.js';

const router = Router();

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  'video/mp4',
  'video/quicktime', // MOV
  'video/webm',
  'audio/mpeg', // MP3
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/webm',
  'audio/mp4',
  'audio/x-m4a',
  'audio/m4a',
  'audio/aac',
];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const ext = path.extname(safeName) || '.mp4';
    const uniqueName = `${uuidv4()}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: CONFIG.MAX_UPLOAD_MB * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = ['.mp4', '.mov', '.webm', '.mp3', '.wav', '.m4a'];

    if (ALLOWED_MIME_TYPES.includes(file.mimetype) || allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype || ext}. Please upload MP4, MOV, WebM, MP3, WAV, or M4A.`));
    }
  },
});

router.post('/', (req: Request, res: Response, next: NextFunction) => {
  upload.single('media')(req, res, async (err: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: `File exceeds maximum allowed upload size of ${CONFIG.MAX_UPLOAD_MB} MB.`,
        });
      }
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No media file was uploaded.' });
    }

    try {
      const file = req.file;
      const mediaId = uuidv4();
      const isVideo = file.mimetype.startsWith('video/') || ['.mp4', '.mov', '.webm'].includes(path.extname(file.filename).toLowerCase());
      const isAudio = !isVideo;

      // Probe duration using FFmpeg
      let duration = 0;
      let width: number | undefined;
      let height: number | undefined;

      try {
        const probe = await FFmpegService.probeMedia(file.path);
        duration = probe.duration;
        width = probe.width;
        height = probe.height;
      } catch (probeErr) {
        console.warn('Could not probe media metadata:', probeErr);
      }

      const mediaRecord = {
        id: mediaId,
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        duration,
        path: file.path,
        createdAt: new Date().toISOString(),
        isVideo,
        isAudio,
      };

      StorageService.registerMedia(mediaRecord);

      // Return sanitized metadata (never exposing filesystem paths)
      res.status(201).json({
        id: mediaRecord.id,
        filename: mediaRecord.filename,
        originalName: mediaRecord.originalName,
        mimeType: mediaRecord.mimeType,
        size: mediaRecord.size,
        duration: mediaRecord.duration,
        url: `/api/media/${mediaRecord.id}`,
        isVideo: mediaRecord.isVideo,
        isAudio: mediaRecord.isAudio,
        width,
        height,
      });
    } catch (processErr: any) {
      next(processErr);
    }
  });
});

export default router;

