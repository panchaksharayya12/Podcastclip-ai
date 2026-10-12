import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { CONFIG, GENERATED_DIR, UPLOADS_DIR } from './config.js';
import healthRoute from './routes/health.js';
import uploadRoute from './routes/upload.js';
import transcribeRoute from './routes/transcribe.js';
import analyzeRoute from './routes/analyze.js';
import clipsRoute from './routes/clips.js';
import captionsRoute from './routes/captions.js';
import projectsRoute from './routes/projects.js';
import mediaRoute from './routes/media.js';
import { FFmpegService } from './services/ffmpegService.js';
import { OpenAiService } from './services/openAiService.js';

const app = express();

// CORS configuration for local development and specified client origin
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        return callback(null, true);
      }
      if (CONFIG.CLIENT_ORIGIN && origin === CONFIG.CLIENT_ORIGIN) {
        return callback(null, true);
      }
      callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Serve static generated clips with proper mime types and range headers
app.use('/generated', express.static(GENERATED_DIR));

// API Routes
app.use('/api/health', healthRoute);
app.use('/api/upload', uploadRoute);
app.use('/api/transcribe', transcribeRoute);
app.use('/api/analyze', analyzeRoute);
app.use('/api/clips', clipsRoute);
app.use('/api/captions', captionsRoute);
app.use('/api/projects', projectsRoute);
app.use('/api/media', mediaRoute);

// 404 handler for API routes
app.use('/api/*', (req: Request, res: Response) => {
  res.status(404).json({ error: `Endpoint ${req.originalUrl} not found.` });
});

// Centralized error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Server Error]', err);
  const status = typeof err.status === 'number' ? err.status : 500;
  res.status(status).json({
    error: err.message || 'Internal server error occurred.',
    ...(process.env.NODE_ENV !== 'production' ? { stack: err.stack } : {}),
  });
});

// Start listening
const server = app.listen(CONFIG.PORT, async () => {
  const ffmpegReady = await FFmpegService.isFFmpegAvailable();
  const openAiReady = OpenAiService.isConfigured();

  console.log('====================================================');
  console.log(`🎬 ClipForge AI Backend Server running on port ${CONFIG.PORT}`);
  console.log(`📡 URL: http://localhost:${CONFIG.PORT}`);
  console.log(`🎥 FFmpeg video processor: ${ffmpegReady ? 'READY (using ffmpeg-static)' : 'NOT FOUND (install FFmpeg)'}`);
  console.log(`🧠 OpenAI AI Integration: ${openAiReady ? 'CONFIGURED' : 'UNCONFIGURED (using deterministic fallback)'}`);
  console.log('====================================================');
});

export default app;
