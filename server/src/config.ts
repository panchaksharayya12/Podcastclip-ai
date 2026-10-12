import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables from .env if present
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Project root is two levels up from server/src
export const ROOT_DIR = path.resolve(__dirname, '../..');
export const SERVER_DIR = path.resolve(__dirname, '..');

export const UPLOADS_DIR = path.join(SERVER_DIR, 'uploads');
export const GENERATED_DIR = path.join(SERVER_DIR, 'generated');
export const PROJECTS_DIR = path.join(SERVER_DIR, 'projects');

// Ensure necessary directories exist
[UPLOADS_DIR, GENERATED_DIR, PROJECTS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

export const CONFIG = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  OPENAI_TRANSCRIPTION_MODEL: process.env.OPENAI_TRANSCRIPTION_MODEL || 'whisper-1',
  OPENAI_ANALYSIS_MODEL: process.env.OPENAI_ANALYSIS_MODEL || 'gpt-4o-mini',
  MAX_UPLOAD_MB: parseInt(process.env.MAX_UPLOAD_MB || '500', 10),
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
};
