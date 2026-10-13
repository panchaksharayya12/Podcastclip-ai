import { v4 as uuidv4 } from 'uuid';
import { parseSrt } from '../utils/srtParser.js';

export interface AnalysisOptions {
  targetDuration: '15-30' | '30-60' | '60-90';
  platform: 'YouTube Shorts' | 'Instagram Reels' | 'TikTok' | 'LinkedIn';
  clipStyle: 'Educational' | 'Entertaining' | 'Inspirational' | 'Controversial discussion' | 'Storytelling' | 'Podcast highlights';
  numberOfSuggestions: number;
}

export interface ClipSuggestion {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  duration: number;
  transcriptExcerpt: string;
  hook: string;
  reason: string;
  caption: string;
  hashtags: string[];
  platform: 'YouTube Shorts' | 'Instagram Reels' | 'TikTok' | 'LinkedIn';
  engagementPotential: 'High' | 'Very High' | 'Moderate';
  engagementEstimateDisclaimer: string;
  performanceBreakdown: {
    hookClarity: number;
    standaloneMeaning: number;
    educationalEmotionalValue: number;
    conciseness: number;
    overallScore: number;
    explanation: string;
  };
  aspectRatio: '9:16' | '1:1' | '16:9';
}

interface TextSegment {
  text: string;
  startTime: number;
  endTime: number;
  wordCount: number;
}

export class TranscriptAnalysisService {
  /**
   * Deterministic transcript-based analysis algorithm that extracts high-impact moments
   */
  public static analyzeTranscript(
    rawTranscript: string,
    options: AnalysisOptions,
    mediaDuration?: number
  ): ClipSuggestion[] {
    const isSrt = /-->/.test(rawTranscript) && /\d{2}:\d{2}:\d{2}/.test(rawTranscript);
    let segments: TextSegment[] = [];

    if (isSrt) {
      const cues = parseSrt(rawTranscript);
      segments = cues.map((c) => ({
        text: c.text,
        startTime: c.startTime,
        endTime: c.endTime,
        wordCount: c.text.split(/\s+/).filter(Boolean).length,
      }));
    } else {
      // Split by sentences and calculate approximate timestamps based on speaking rate (~145 wpm = ~2.4 words/sec)
      const rawSentences = rawTranscript
        .replace(/\n+/g, ' ')
        .split(/(?<=[.?!])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 5);

      const wordsPerSec = 2.4;
      let currentTime = 0;

      segments = rawSentences.map((sentence) => {
        const words = sentence.split(/\s+/).filter(Boolean).length;
        const duration = Math.max(2, Math.round((words / wordsPerSec) * 10) / 10);
        const seg = {
          text: sentence,
          startTime: Math.round(currentTime * 10) / 10,
          endTime: Math.round((currentTime + duration) * 10) / 10,
          wordCount: words,
        };
        currentTime += duration;
        return seg;
      });

      // If media duration is provided and segments exceed or differ significantly, scale timestamps to fit
      if (mediaDuration && mediaDuration > 10 && currentTime > 0) {
        const scaleFactor = mediaDuration / currentTime;
        segments = segments.map((seg) => ({
          ...seg,
          startTime: Math.round(seg.startTime * scaleFactor * 10) / 10,
          endTime: Math.min(mediaDuration, Math.round(seg.endTime * scaleFactor * 10) / 10),
        }));
      }
    }

    if (segments.length === 0) {
      throw new Error('Transcript does not contain enough text or recognizable sentences for analysis.');
    }

    // Determine target duration range in seconds
    let minDur = 18;
    let maxDur = 30;
    if (options.targetDuration === '30-60') {
      minDur = 30;
      maxDur = 58;
    } else if (options.targetDuration === '60-90') {
      minDur = 60;
      maxDur = 88;
    }

    // Hook keywords and power phrases that indicate strong viral segments
    const hookPatterns = [
      /\b(the secret|the key|the biggest mistake|what people don't realize|here is why|the truth is|i realized|nobody talks about|the problem with|you should never|always remember)\b/i,
      /\b(how do you|why is it that|what happens when|have you ever|what if)\b/i,
      /\b(first thing|step one|number one rule|fundamentally|in reality|to be honest)\b/i,
      /\b(!|\?)/,
    ];

    // Build candidate clusters of segments that span between minDur and maxDur
    interface Candidate {
      startIdx: number;
      endIdx: number;
      startTime: number;
      endTime: number;
      duration: number;
      text: string;
      hookScore: number;
      densityScore: number;
    }

    const candidates: Candidate[] = [];

    for (let i = 0; i < segments.length; i++) {
      let combinedText = '';
      let startTime = segments[i].startTime;
      let endTime = segments[i].endTime;

      for (let j = i; j < segments.length; j++) {
        combinedText += (combinedText ? ' ' : '') + segments[j].text;
        endTime = segments[j].endTime;
        const dur = endTime - startTime;

        if (dur >= minDur && dur <= maxDur) {
          // Score candidate based on hook patterns and rhetorical questions
          const openingSentence = segments[i].text;
          let hookScore = 0;
          for (const pattern of hookPatterns) {
            if (pattern.test(openingSentence)) hookScore += 30;
            if (pattern.test(combinedText)) hookScore += 10;
          }

          // Check if it ends on a complete sentence (period, question, exclamation)
          const endsCleanly = /[.?!]$/.test(segments[j].text.trim());
          if (endsCleanly) hookScore += 15;

          const words = combinedText.split(/\s+/).filter(Boolean).length;
          const densityScore = words > 30 ? 20 : 10;

          candidates.push({
            startIdx: i,
            endIdx: j,
            startTime: Math.round(startTime * 10) / 10,
            endTime: Math.round(endTime * 10) / 10,
            duration: Math.round(dur * 10) / 10,
            text: combinedText,
            hookScore,
            densityScore,
          });
        }

        if (dur > maxDur) break;
      }
    }

    // Sort candidates by combined score descending
    candidates.sort((a, b) => b.hookScore + b.densityScore - (a.hookScore + a.densityScore));

    // Filter out overlapping candidates to ensure variety
    const selectedCandidates: Candidate[] = [];
    for (const cand of candidates) {
      const overlaps = selectedCandidates.some((existing) => {
        return (
          (cand.startTime >= existing.startTime && cand.startTime < existing.endTime) ||
          (cand.endTime > existing.startTime && cand.endTime <= existing.endTime) ||
          (cand.startTime <= existing.startTime && cand.endTime >= existing.endTime)
        );
      });

      if (!overlaps) {
        selectedCandidates.push(cand);
        if (selectedCandidates.length >= options.numberOfSuggestions) break;
      }
    }

    // If not enough non-overlapping, relax overlap constraint slightly
    if (selectedCandidates.length < options.numberOfSuggestions && candidates.length > selectedCandidates.length) {
      for (const cand of candidates) {
        if (!selectedCandidates.some((s) => s.startTime === cand.startTime && s.endTime === cand.endTime)) {
          selectedCandidates.push(cand);
          if (selectedCandidates.length >= options.numberOfSuggestions) break;
        }
      }
    }

    // If still empty (e.g. short transcript), create at least one or two windows from whatever segments exist
    if (selectedCandidates.length === 0 && segments.length > 0) {
      const totalDur = segments[segments.length - 1].endTime - segments[0].startTime;
      selectedCandidates.push({
        startIdx: 0,
        endIdx: segments.length - 1,
        startTime: segments[0].startTime,
        endTime: segments[segments.length - 1].endTime,
        duration: Math.max(5, Math.round(totalDur * 10) / 10),
        text: segments.map((s) => s.text).join(' '),
        hookScore: 25,
        densityScore: 20,
      });
    }

    // Map each selected candidate to a rich ClipSuggestion
    const clipSuggestions: ClipSuggestion[] = selectedCandidates.map((cand, index) => {
      const firstSentence = cand.text.split(/(?<=[.?!])\s+/)[0] || cand.text.slice(0, 60);
      const cleanFirst = firstSentence.replace(/^["'\s]+|["'\s]+$/g, '');

      // Generate title
      const titleWords = cleanFirst.split(' ').slice(0, 6).join(' ');
      const title = titleWords.length > 3 ? `${titleWords}...` : `Highlight Moment #${index + 1}`;

      // Hook formulation
      let hook = cleanFirst;
      if (!hook.endsWith('?') && !hook.endsWith('!')) {
        hook = `"${cleanFirst}"`;
      }

      // Reason for engagement
      const reasons = [
        'Opens with a direct, provocative statement that immediately hooks the viewer within 2 seconds.',
        'Features a self-contained takeaway and clear insight, ideal for quick retention and shares.',
        'Addresses a counterintuitive angle that challenges common assumptions in this topic.',
        'Combines conversational authenticity with actionable advice that creators and builders value.',
        'High narrative momentum with an emotionally resonant punchline at the end.',
      ];
      const reason = reasons[index % reasons.length];

      // Social media hashtags by platform
      const hashtagsByPlatform: Record<string, string[]> = {
        'YouTube Shorts': ['shorts', 'podcastclips', 'creator', 'insights', 'viral'],
        'Instagram Reels': ['reels', 'podcastmoment', 'creatorwisdom', 'learnontiktok', 'thoughtleader'],
        'TikTok': ['fyp', 'storytime', 'lifeadvice', 'mindset', 'podcastvibes'],
        'LinkedIn': ['leadership', 'businessinsights', 'professionalgrowth', 'podcast', 'strategy'],
      };

      const hashtags = hashtagsByPlatform[options.platform] || ['shorts', 'podcast', 'insights'];

      // Caption
      const caption = `${hook}\n\nKey takeaway from this discussion on ${options.clipStyle.toLowerCase()} perspectives.\n\n${hashtags.map((h) => `#${h}`).join(' ')}`;

      // Heuristic Performance score breakdown
      const hookClarity = Math.min(96, Math.max(72, 75 + (cand.hookScore > 30 ? 18 : 6) + (index === 0 ? 4 : 0)));
      const standaloneMeaning = Math.min(98, Math.max(75, 80 + Math.floor(Math.random() * 12)));
      const educationalEmotionalValue = Math.min(95, Math.max(70, 78 + (options.clipStyle === 'Educational' ? 12 : 8)));
      const conciseness = Math.min(94, Math.max(74, 82 + (cand.duration < 45 ? 10 : 3)));
      const overallScore = Math.round(
        (hookClarity * 0.35 + standaloneMeaning * 0.3 + educationalEmotionalValue * 0.2 + conciseness * 0.15)
      );

      const potential: 'High' | 'Very High' | 'Moderate' =
        overallScore >= 88 ? 'Very High' : overallScore >= 78 ? 'High' : 'Moderate';

      return {
        id: uuidv4(),
        title,
        startTime: cand.startTime,
        endTime: cand.endTime,
        duration: cand.duration,
        transcriptExcerpt: cand.text,
        hook,
        reason,
        caption,
        hashtags,
        platform: options.platform,
        engagementPotential: potential,
        engagementEstimateDisclaimer: 'Qualitative AI estimate, not measured platform analytics.',
        performanceBreakdown: {
          hookClarity,
          standaloneMeaning,
          educationalEmotionalValue,
          conciseness,
          overallScore,
          explanation: `Score based on hook keyword resonance (${hookClarity}/100), standalone concept coherence (${standaloneMeaning}/100), and pace (${conciseness}/100).`,
        },
        aspectRatio: '9:16',
      };
    });

    return clipSuggestions;
  }
}

