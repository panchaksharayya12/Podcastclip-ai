# ClipForge AI

> **"One conversation. A hundred moments worth sharing."**

ClipForge AI is an AI-powered podcast-to-short-clips platform designed for creators, podcasters, interviewers, and educators. It transforms long-form video podcasts and recordings into short, captioned clips formatted for YouTube Shorts, Instagram Reels, TikTok, and LinkedIn.

---

## 🌟 Key Features

- **Full-Screen Cinematic Hero:** Motion background with real-time audio waveform canvas visualization and word-by-word headline typography reveal powered by Motion for React.
- **Dual-Input Studio Workspace:**
  - **Upload Media:** Drag-and-drop support for MP4, MOV, WebM, MP3, WAV, and M4A up to 500 MB with automatic duration probing.
  - **Use a Transcript:** Text area with manual paste, import for `.SRT` / `.TXT` subtitle files, and instant sample podcast loader.
- **AI Moment Discovery:**
  - Powered by OpenAI `gpt-4o-mini` with structured JSON output when configured.
  - Built-in **Deterministic Transcript Heuristic Engine** that runs offline with zero API keys required, scoring sentences for opening hooks, questions, and narrative punchlines.
- **Authentic Video Processing (FFmpeg):**
  - Renders true standalone MP4 clips.
  - Converts widescreen (16:9) to vertical (9:16) with blurred-background padding to prevent unnatural video stretching.
  - Also supports 1:1 square and 16:9 landscape framing.
- **Interactive Video Preview:** HTML5 player with timestamp-seeking, loop toggle, and audio waveform indicator.
- **Animated Caption Editor:** Customize font size, select electric lime keyword highlights, pick background styling, and export `.SRT` subtitle tracks.
- **Transparent Content Scoring:** AI-estimated content potential badge (0–100) with breakdown of hook clarity, standalone context, insight, and conciseness, accompanied by honest disclaimers.
- **Saved Project Library:** Save, rename, browse, reopen, and delete projects persisted on the server and in local storage.
- **Universal Exports:** Download rendered MP4 clips, `.SRT` subtitles, `.TXT` transcripts, or export all discovered moments to CSV and JSON.

---

## 📁 Folder Structure

```
podcastclip-ai/
├── package.json               # Root scripts and unified dependencies
├── vite.config.ts             # Vite configuration with proxy to port 5000
├── tailwind.config.js         # Cinematic palette (Deep Black, Charcoal, Electric Lime)
├── tsconfig.json              # Client TypeScript config
├── .env.example               # Environment variable template
├── test-suite.js              # Automated integration test runner
├── server/
│   ├── tsconfig.json          # Server TypeScript config
│   ├── src/
│   │   ├── index.ts           # Express server entry point & CORS configuration
│   │   ├── config.ts          # Storage directories and environment settings
│   │   ├── routes/
│   │   │   ├── health.ts      # GET /api/health (live engine diagnostics)
│   │   │   ├── upload.ts      # POST /api/upload (Multer validation & metadata probing)
│   │   │   ├── transcribe.ts  # POST /api/transcribe (Whisper transcription)
│   │   │   ├── analyze.ts     # POST /api/analyze (AI & deterministic moments engine)
│   │   │   ├── clips.ts       # POST /api/clips/generate & GET /api/clips/:id/download
│   │   │   ├── captions.ts    # POST /api/captions/export (SRT, CSV, JSON, TXT)
│   │   │   ├── projects.ts    # POST, GET, DELETE /api/projects
│   │   │   └── media.ts       # GET /api/media/:id (HTTP 206 range streaming for seeking)
│   │   ├── services/
│   │   │   ├── ffmpegService.ts  # Fluent-ffmpeg & ffmpeg-static processor
│   │   │   ├── openAiService.ts  # OpenAI Whisper and structured analysis
│   │   │   ├── transcriptAnalysisService.ts # Fallback scoring & hook finder
│   │   │   └── storageService.ts # Local disk file management & project records
│   │   └── utils/
│   │       └── srtParser.ts   # SRT parser and generator
│   ├── uploads/               # Uploaded video and audio files (local dev storage)
│   ├── generated/             # Rendered MP4 clips
│   └── projects/              # Persisted JSON project files
└── src/
    ├── main.tsx               # React DOM entry
    ├── App.tsx                # Application layout & state orchestrator
    ├── index.css              # Custom styling, film grain, and glassmorphism
    ├── types/
    │   └── index.ts           # Core TypeScript types and data models
    ├── components/
    │   ├── Navbar.tsx         # Glass header with navigation and engine status
    │   ├── Hero.tsx           # Full-screen cinematic hero with canvas wave
    │   ├── Studio/
    │   │   ├── StudioWorkspace.tsx   # Studio coordinator
    │   │   ├── UploadCard.tsx        # Drag & drop upload card
    │   │   ├── TranscriptCard.tsx    # Textarea, file import, and sample loader
    │   │   ├── AnalysisOptions.tsx   # Duration, platform, style controls
    │   │   └── AnalysisLoading.tsx   # 5-stage animated loading screen
    │   ├── Results/
    │   │   ├── ClipResultsDashboard.tsx # Results dashboard with filter & sort
    │   │   ├── ClipCard.tsx             # Card with preview, render, and caption copy
    │   │   ├── VideoPreviewModal.tsx    # Timestamp-accurate preview player
    │   │   ├── EditClipModal.tsx        # Timestamp & copy editor modal
    │   │   └── CaptionEditorModal.tsx   # 9:16 vertical caption customizer
    │   ├── Projects/
    │   │   └── ProjectsLibrary.tsx      # Saved projects drawer
    │   ├── Sections/
    │   │   ├── HowItWorks.tsx           # 4-step workflow
    │   │   ├── Features.tsx             # 10 capability cards
    │   │   ├── About.tsx                # Creator manifesto
    │   │   ├── FAQ.tsx                  # Interactive accordion
    │   │   ├── FinalCTA.tsx             # Animated CTA section
    │   │   └── Footer.tsx               # Footer & privacy disclosure
    │   └── UI/
    │       ├── WaveformCanvas.tsx       # Ambient audio curve canvas
    │       ├── Toast.tsx                # Notification toasts
    │       └── PerformanceBadge.tsx     # Score breakdown badge
    └── utils/
        ├── api.ts             # Type-safe API client
        └── demoData.ts        # Built-in sample podcast transcript and clips
```

---

## 🚀 Quick Start Guide

### Step 1: Install Dependencies
Open your terminal in VS Code inside the project directory:
```bash
npm install
```

### Step 2: Start the Application
Run one command that starts both the backend Express server (port 5000) and the Vite React frontend (port 5173):
```bash
npm run dev
```

You will see:
```
[SERVER] 🎬 ClipForge AI Backend Server running on port 5000
[SERVER] 🎥 FFmpeg video processor: READY (using ffmpeg-static)
[CLIENT] ➜  Local:   http://localhost:5173/
```

Open your browser to:
**http://localhost:5173**

---

## ⚙️ Environment Configuration

Copy the example file to create your local `.env`:
```bash
copy .env.example .env
```

### Environment Variables

| Variable | Description | Default | Required? |
|---|---|---|---|
| `PORT` | Backend server port | `5000` | Optional |
| `CLIENT_ORIGIN` | Allowed client URL for CORS | `http://localhost:5173` | Optional |
| `MAX_UPLOAD_MB` | Maximum file upload size in MB | `500` | Optional |
| `OPENAI_API_KEY` | OpenAI API key for Whisper and GPT-4o-mini | *(Empty)* | **Optional** |
| `OPENAI_TRANSCRIPTION_MODEL`| Whisper transcription model | `whisper-1` | Optional |
| `OPENAI_ANALYSIS_MODEL` | Analysis LLM model | `gpt-4o-mini` | Optional |
| `SUPABASE_URL` | Optional Supabase cloud storage URL | *(Empty)* | Optional |
| `SUPABASE_ANON_KEY` | Optional Supabase anonymous key | *(Empty)* | Optional |

> **Note on OpenAI API Key:**
> If `OPENAI_API_KEY` is not provided, ClipForge AI runs in full **Deterministic Transcript Analysis Mode**. You can upload/paste transcripts, customize clips, preview videos, render real MP4 video clips, edit captions, and export subtitle files without an OpenAI key!

---

## 🎥 Video Processing & FFmpeg

ClipForge AI bundles `ffmpeg-static`, which provides a precompiled `ffmpeg.exe` binary directly within `node_modules`.

- **Vertical 9:16 Conversion:** Uses a dual-stream FFmpeg filter graph that crops and blurs the background to 1080x1920 while scaling the sharp source video in the center.
- **Codecs:** Encodes with H.264 (`libx264`, yuv420p) and AAC audio for broad compatibility across web browsers, smartphones, and social platforms.
- **Fast Seeking:** Uses `-movflags +faststart` so web players can start playback immediately before the entire file finishes downloading.

---

## 🧪 Automated Testing

To run the complete automated test suite (verifying health diagnostics, deterministic transcript analysis, validation error cases, caption exports, project CRUD, and real FFmpeg video clipping):

```bash
# In one terminal, start the server:
npm run dev:server

# In a second terminal, execute the test suite:
node test-suite.js
```

All 44 automated test assertions will run and report status.

---

## 🛡️ Privacy & Local Storage

- All uploaded files are stored locally in `server/uploads/` on your computer.
- Rendered MP4 clips are stored locally in `server/generated/`.
- Project metadata is stored in `server/projects/` and synced with browser `localStorage`.
- Media files are not sent to any external server unless you configure an OpenAI key and trigger auto-transcription.

---

## 💡 Troubleshooting

- **Port 5000 or 5173 already in use:**
  Check if another process is using port 5000 or set `PORT=5001` in `.env`.
- **Large media file upload warning:**
  The default file size limit is 500 MB. You can adjust `MAX_UPLOAD_MB` in `.env`.
- **Browser video playback preview:**
  Ensure your browser supports the codec of the uploaded video (standard H.264 MP4 is recommended). If using demo mode, actual video playback requires an uploaded video file.
