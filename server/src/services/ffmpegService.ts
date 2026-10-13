import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

// Resolve ffmpeg path
let ffmpegPath: string | null = null;
if (typeof ffmpegStatic === 'string') {
  ffmpegPath = ffmpegStatic;
} else if (ffmpegStatic && typeof (ffmpegStatic as any).default === 'string') {
  ffmpegPath = (ffmpegStatic as any).default;
}

if (ffmpegPath && fs.existsSync(ffmpegPath)) {
  ffmpeg.setFfmpegPath(ffmpegPath);
}

export interface MediaMetadata {
  duration: number; // in seconds
  hasVideo: boolean;
  hasAudio: boolean;
  width?: number;
  height?: number;
  format?: string;
  bitrate?: number;
}

export class FFmpegService {
  /**
   * Check whether FFmpeg executable is available and functional
   */
  public static async isFFmpegAvailable(): Promise<boolean> {
    if (!ffmpegPath) return false;
    try {
      if (!fs.existsSync(ffmpegPath)) return false;
      const { stdout } = await execFileAsync(ffmpegPath, ['-version']);
      return stdout.includes('ffmpeg version');
    } catch {
      return false;
    }
  }

  /**
   * Get FFmpeg executable path
   */
  public static getFFmpegPath(): string | null {
    return ffmpegPath;
  }

  /**
   * Probe media file to extract duration, video/audio tracks, resolution
   */
  public static async probeMedia(filePath: string): Promise<MediaMetadata> {
    if (!ffmpegPath) {
      throw new Error('FFmpeg binary is not available on this server.');
    }

    try {
      // Execute ffmpeg -i <filePath> to read media headers from stderr
      const result = await execFileAsync(ffmpegPath, ['-i', filePath]).catch((err) => err);
      const output = (result.stderr || '') + (result.stdout || '');

      let duration = 0;
      const durationMatch = output.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
      if (durationMatch) {
        const hours = parseFloat(durationMatch[1]);
        const minutes = parseFloat(durationMatch[2]);
        const seconds = parseFloat(durationMatch[3]);
        duration = Math.round((hours * 3600 + minutes * 60 + seconds) * 100) / 100;
      }

      const hasVideo = /Stream #.*Video:/.test(output);
      const hasAudio = /Stream #.*Audio:/.test(output);

      let width: number | undefined;
      let height: number | undefined;
      const resMatch = output.match(/Video:.*?(\d{3,4})x(\d{3,4})/);
      if (resMatch) {
        width = parseInt(resMatch[1], 10);
        height = parseInt(resMatch[2], 10);
      }

      return {
        duration,
        hasVideo,
        hasAudio,
        width,
        height,
      };
    } catch (err: any) {
      console.error('Error probing media:', err);
      return {
        duration: 0,
        hasVideo: false,
        hasAudio: false,
      };
    }
  }

  /**
   * Extract audio to 16kHz MP3 or WAV for Whisper transcription
   */
  public static async extractAudio(sourcePath: string, outputPath: string): Promise<string> {
    if (!ffmpegPath) {
      throw new Error('FFmpeg binary is not available.');
    }

    return new Promise((resolve, reject) => {
      ffmpeg(sourcePath)
        .noVideo()
        .audioCodec('libmp3lame')
        .audioBitrate('128k')
        .audioChannels(1)
        .audioFrequency(16000)
        .output(outputPath)
        .on('end', () => resolve(outputPath))
        .on('error', (err) => reject(new Error(`Failed to extract audio: ${err.message}`)))
        .run();
    });
  }

  /**
   * Generate video clip trimmed between startTime and endTime with chosen aspect ratio
   */
  public static async generateClip(params: {
    sourcePath: string;
    outputPath: string;
    startTime: number;
    endTime: number;
    aspectRatio: '9:16' | '1:1' | '16:9';
    subtitlesPath?: string;
  }): Promise<string> {
    if (!ffmpegPath) {
      throw new Error('FFmpeg binary is not configured or available.');
    }

    const { sourcePath, outputPath, startTime, endTime, aspectRatio, subtitlesPath } = params;

    if (!fs.existsSync(sourcePath)) {
      throw new Error(`Source media file not found: ${path.basename(sourcePath)}`);
    }

    const duration = endTime - startTime;
    if (duration <= 0) {
      throw new Error('Clip end time must be greater than start time.');
    }

    // Build FFmpeg command with complex filters depending on aspect ratio
    return new Promise((resolve, reject) => {
      const command = ffmpeg(sourcePath)
        .setStartTime(Math.max(0, startTime))
        .setDuration(duration);

      // Check aspect ratio filters
      if (aspectRatio === '9:16') {
        // Vertical video with blurred background and centered sharp foreground
        const filterStr = [
          '[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=20:20[bg]',
          '[0:v]scale=1080:1920:force_original_aspect_ratio=decrease[fg]',
          '[bg][fg]overlay=(W-w)/2:(H-h)/2[v]',
        ].join(';');

        command.complexFilter(filterStr, 'v');
      } else if (aspectRatio === '1:1') {
        // Square video with blurred background and centered sharp foreground
        const filterStr = [
          '[0:v]scale=1080:1080:force_original_aspect_ratio=increase,crop=1080:1080,boxblur=15:15[bg]',
          '[0:v]scale=1080:1080:force_original_aspect_ratio=decrease[fg]',
          '[bg][fg]overlay=(W-w)/2:(H-h)/2[v]',
        ].join(';');

        command.complexFilter(filterStr, 'v');
      } else {
        // 16:9 landscape standard
        command.videoFilter('scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2');
      }

      // Encode settings
      command
        .videoCodec('libx264')
        .audioCodec('aac')
        .audioBitrate('192k')
        .outputOptions([
          '-preset fast',
          '-crf 22',
          '-pix_fmt yuv420p',
          '-movflags +faststart',
        ])
        .output(outputPath)
        .on('start', (cmdline) => {
          console.log('[FFmpeg] Started rendering clip:', cmdline);
        })
        .on('end', () => {
          console.log('[FFmpeg] Clip rendering completed:', outputPath);
          resolve(outputPath);
        })
        .on('error', (err, stdout, stderr) => {
          console.error('[FFmpeg] Render error:', err.message, stderr);
          reject(new Error(`FFmpeg rendering failed: ${err.message}`));
        });

      command.run();
    });
  }
}

