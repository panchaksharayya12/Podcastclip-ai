import { Router, Request, Response } from 'express';
import { generateSrtContent, secondsToSrtTime } from '../utils/srtParser.js';

const router = Router();

router.post('/export', (req: Request, res: Response) => {
  const { format = 'srt', title = 'clip-captions', startTime = 0, endTime = 30, text = '', clips = [] } = req.body;

  const safeTitle = (title || 'clipforge-export')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')
    .slice(0, 40);

  if (format === 'srt') {
    // Generate SRT from sentence chunks or provided text
    const sentences = (text || '')
      .split(/(?<=[.?!])\s+/)
      .map((s: string) => s.trim())
      .filter(Boolean);

    let content = '';
    if (sentences.length > 0) {
      const dur = Math.max(1, (endTime - startTime) / sentences.length);
      const cues = sentences.map((sentence: string, i: number) => ({
        startTime: startTime + i * dur,
        endTime: Math.min(endTime, startTime + (i + 1) * dur),
        text: sentence,
      }));
      content = generateSrtContent(cues);
    } else {
      content = `1\n${secondsToSrtTime(startTime)} --> ${secondsToSrtTime(endTime)}\n${text}\n`;
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}.srt"`);
    return res.send(content);
  }

  if (format === 'txt') {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}.txt"`);
    return res.send(text);
  }

  if (format === 'csv') {
    // Export clips array as CSV
    const headers = ['Title', 'Start Time (s)', 'End Time (s)', 'Duration (s)', 'Hook', 'Platform', 'Engagement Potential', 'Caption'];
    const rows = (clips || []).map((c: any) => [
      `"${(c.title || '').replace(/"/g, '""')}"`,
      c.startTime,
      c.endTime,
      c.duration,
      `"${(c.hook || '').replace(/"/g, '""')}"`,
      `"${(c.platform || '').replace(/"/g, '""')}"`,
      `"${(c.engagementPotential || '').replace(/"/g, '""')}"`,
      `"${(c.caption || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r: string[]) => r.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}-clips.csv"`);
    return res.send(csvContent);
  }

  if (format === 'json') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}-clips.json"`);
    return res.send(JSON.stringify(clips, null, 2));
  }

  res.status(400).json({ error: `Unsupported export format: ${format}` });
});

export default router;

