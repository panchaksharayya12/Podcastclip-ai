import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { StorageService } from '../services/storageService.js';

const router = Router();

router.get('/:id', (req: Request, res: Response) => {
  const id = String(req.params.id);
  const media = StorageService.getMedia(id);

  if (!media || !fs.existsSync(media.path)) {
    return res.status(404).json({ error: 'Media file not found or expired.' });
  }

  const filePath = media.path;
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  // Set appropriate mime type
  const mimeType = media.mimeType || 'video/mp4';

  // Support range requests for HTML5 video player seeking
  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize) {
      res.status(416).setHeader('Content-Range', `bytes */${fileSize}`);
      return res.end();
    }

    const chunksize = end - start + 1;
    const fileStream = fs.createReadStream(filePath, { start, end });

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': mimeType,
    });

    fileStream.pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': mimeType,
      'Accept-Ranges': 'bytes',
    });

    fs.createReadStream(filePath).pipe(res);
  }
});

router.delete('/:id', (req: Request, res: Response) => {
  const id = String(req.params.id);
  const deleted = StorageService.deleteMedia(id);
  if (!deleted) {
    return res.status(404).json({ error: 'Media file not found or already deleted.' });
  }
  res.json({ success: true, message: 'Media file deleted.' });
});

export default router;
