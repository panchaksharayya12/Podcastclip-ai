export interface SrtCue {
  id: number;
  startTime: number; // in seconds
  endTime: number; // in seconds
  text: string;
}

/**
 * Converts seconds (e.g. 75.32) into SRT timestamp "00:01:15,320"
 */
export function secondsToSrtTime(sec: number): string {
  const safeSec = Math.max(0, sec);
  const hours = Math.floor(safeSec / 3600);
  const minutes = Math.floor((safeSec % 3600) / 60);
  const seconds = Math.floor(safeSec % 60);
  const milliseconds = Math.floor((safeSec % 1) * 1000);

  const pad = (n: number, z = 2) => String(n).padStart(z, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)},${pad(milliseconds, 3)}`;
}

/**
 * Converts SRT timestamp "00:01:15,320" into seconds
 */
export function srtTimeToSeconds(srtTime: string): number {
  const match = srtTime.trim().match(/(\d+):(\d+):(\d+)[,\.](\d+)/);
  if (!match) return 0;
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const seconds = parseInt(match[3], 10);
  const millis = parseInt(match[4].padEnd(3, '0').slice(0, 3), 10);
  return hours * 3600 + minutes * 60 + seconds + millis / 1000;
}

/**
 * Parses raw SRT file text into cues
 */
export function parseSrt(srtContent: string): SrtCue[] {
  const lines = srtContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const cues: SrtCue[] = [];
  let currentCue: Partial<SrtCue> | null = null;
  let textLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) {
      if (currentCue && currentCue.startTime !== undefined && textLines.length > 0) {
        currentCue.text = textLines.join(' ');
        cues.push(currentCue as SrtCue);
        currentCue = null;
        textLines = [];
      }
      continue;
    }

    if (!currentCue) {
      const idNum = parseInt(line, 10);
      if (!isNaN(idNum)) {
        currentCue = { id: idNum };
        continue;
      }
    }

    if (currentCue && currentCue.startTime === undefined) {
      const timeMatch = line.match(/(.*?)\s*-->\s*(.*)/);
      if (timeMatch) {
        currentCue.startTime = srtTimeToSeconds(timeMatch[1]);
        currentCue.endTime = srtTimeToSeconds(timeMatch[2]);
        continue;
      }
    }

    if (currentCue && currentCue.startTime !== undefined) {
      textLines.push(line);
    }
  }

  if (currentCue && currentCue.startTime !== undefined && textLines.length > 0) {
    currentCue.text = textLines.join(' ');
    cues.push(currentCue as SrtCue);
  }

  return cues;
}

/**
 * Generates an SRT subtitle string from an array of text cues or sentence breakdown
 */
export function generateSrtContent(cues: Array<{ startTime: number; endTime: number; text: string }>): string {
  return cues
    .map((cue, idx) => {
      const start = secondsToSrtTime(cue.startTime);
      const end = secondsToSrtTime(cue.endTime);
      return `${idx + 1}\n${start} --> ${end}\n${cue.text.trim()}\n`;
    })
    .join('\n');
}

