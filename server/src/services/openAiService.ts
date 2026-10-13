import OpenAI from 'openai';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { CONFIG } from '../config.js';
import { AnalysisOptions, ClipSuggestion, TranscriptAnalysisService } from './transcriptAnalysisService.js';

let openaiClient: OpenAI | null = null;
if (CONFIG.OPENAI_API_KEY && CONFIG.OPENAI_API_KEY.trim() !== '') {
  openaiClient = new OpenAI({
    apiKey: CONFIG.OPENAI_API_KEY,
  });
}

export class OpenAiService {
  /**
   * Check if OpenAI API key is set and client is initialized
   */
  public static isConfigured(): boolean {
    return !!(CONFIG.OPENAI_API_KEY && CONFIG.OPENAI_API_KEY.trim() !== '');
  }

  /**
   * Transcribe an audio file using OpenAI Whisper
   */
  public static async transcribeAudio(filePath: string): Promise<{ text: string; segments?: any[] }> {
    if (!OpenAiService.isConfigured() || !openaiClient) {
      throw new Error('OpenAI API key is not configured on this server. Automatic transcription requires OPENAI_API_KEY.');
    }

    if (!fs.existsSync(filePath)) {
      throw new Error(`Audio file not found: ${filePath}`);
    }

    try {
      const fileStream = fs.createReadStream(filePath);
      const response = await openaiClient.audio.transcriptions.create({
        file: fileStream,
        model: CONFIG.OPENAI_TRANSCRIPTION_MODEL || 'whisper-1',
        response_format: 'verbose_json',
        timestamp_granularities: ['segment'],
      });

      return {
        text: response.text,
        segments: (response as any).segments || [],
      };
    } catch (err: any) {
      console.error('OpenAI Whisper transcription error:', err);
      throw new Error(`OpenAI transcription failed: ${err.message || 'Unknown error'}`);
    }
  }

  /**
   * Analyze transcript using OpenAI GPT-4o-mini structured JSON to discover viral clips
   */
  public static async analyzeTranscriptWithAi(
    transcript: string,
    options: AnalysisOptions,
    mediaDuration?: number
  ): Promise<ClipSuggestion[]> {
    if (!OpenAiService.isConfigured() || !openaiClient) {
      // Fallback to deterministic algorithm
      return TranscriptAnalysisService.analyzeTranscript(transcript, options, mediaDuration);
    }

    const systemPrompt = `You are an elite short-form video editor and podcast strategist specializing in YouTube Shorts, Instagram Reels, and TikTok clips.
Your mission is to analyze the provided podcast transcript and identify exactly ${options.numberOfSuggestions} of the most engaging, self-contained, high-retention short clips.

Guidelines:
- Target Duration: ${options.targetDuration} seconds.
- Target Platform: ${options.platform}.
- Clip Style: ${options.clipStyle}.
- Look for: Strong opening hooks (first 3 seconds), surprising facts, emotional resonance, actionable wisdom, or memorable punchlines.
- Every clip must be self-contained (make sense on its own without needing prior context).
- Ensure startTime and endTime are realistic seconds (e.g. 15.0 to 52.0). If media length is ${mediaDuration ? mediaDuration + 's' : 'unknown'}, keep all timestamps within reasonable bounds.
- Provide a clear, catchy hook, social media caption with 3-5 hashtags, and honest reason why it engages.

You must respond with valid JSON containing an array of clips under the key "clips".
Schema for each clip:
{
  "id": "uuid-string",
  "title": "Short descriptive title (4-7 words)",
  "startTime": 12.5,
  "endTime": 48.0,
  "duration": 35.5,
  "transcriptExcerpt": "The exact verbatim text spoken during this segment",
  "hook": "Suggested opening hook or quote",
  "reason": "Why this moment could work as a short clip",
  "caption": "Social media caption ready to post with emojis",
  "hashtags": ["shorts", "podcast", "insights"],
  "platform": "${options.platform}",
  "engagementPotential": "High" | "Very High" | "Moderate",
  "engagementEstimateDisclaimer": "Qualitative AI estimate, not measured platform analytics.",
  "performanceBreakdown": {
    "hookClarity": 88,
    "standaloneMeaning": 92,
    "educationalEmotionalValue": 85,
    "conciseness": 90,
    "overallScore": 89,
    "explanation": "Score explanation"
  }
}`;

    try {
      const completion = await openaiClient.chat.completions.create({
        model: CONFIG.OPENAI_ANALYSIS_MODEL || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Transcript:\n\n${transcript.slice(0, 16000)}` },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Received empty response from OpenAI');
      }

      const parsed = JSON.parse(content);
      const rawClips = Array.isArray(parsed.clips) ? parsed.clips : parsed.suggestions || [];

      if (!rawClips || rawClips.length === 0) {
        console.warn('OpenAI returned zero clips, falling back to deterministic analysis');
        return TranscriptAnalysisService.analyzeTranscript(transcript, options, mediaDuration);
      }

      // Validate and sanitize each clip
      const validated: ClipSuggestion[] = rawClips.map((c: any, idx: number) => {
        const start = typeof c.startTime === 'number' && c.startTime >= 0 ? c.startTime : idx * 30;
        const end = typeof c.endTime === 'number' && c.endTime > start ? c.endTime : start + 35;
        const duration = Math.round((end - start) * 10) / 10;

        return {
          id: c.id || uuidv4(),
          title: c.title || `Viral Highlight #${idx + 1}`,
          startTime: Math.round(start * 10) / 10,
          endTime: Math.round(end * 10) / 10,
          duration,
          transcriptExcerpt: c.transcriptExcerpt || transcript.slice(0, 150),
          hook: c.hook || c.title || 'Must-watch moment',
          reason: c.reason || 'Strong conceptual hook and high conversational clarity.',
          caption: c.caption || `${c.title}\n\n#podcast #viral`,
          hashtags: Array.isArray(c.hashtags) ? c.hashtags : ['shorts', 'podcast'],
          platform: options.platform,
          engagementPotential: ['Very High', 'High', 'Moderate'].includes(c.engagementPotential)
            ? c.engagementPotential
            : 'High',
          engagementEstimateDisclaimer: 'Qualitative AI estimate, not measured platform analytics.',
          performanceBreakdown: {
            hookClarity: c.performanceBreakdown?.hookClarity || 85,
            standaloneMeaning: c.performanceBreakdown?.standaloneMeaning || 88,
            educationalEmotionalValue: c.performanceBreakdown?.educationalEmotionalValue || 84,
            conciseness: c.performanceBreakdown?.conciseness || 89,
            overallScore: c.performanceBreakdown?.overallScore || 87,
            explanation: c.performanceBreakdown?.explanation || 'High narrative coherence and hook clarity.',
          },
          aspectRatio: '9:16',
        };
      });

      return validated;
    } catch (err: any) {
      console.warn('OpenAI structured analysis encountered an error, using deterministic fallback:', err.message);
      return TranscriptAnalysisService.analyzeTranscript(transcript, options, mediaDuration);
    }
  }
}

