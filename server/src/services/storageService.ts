import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { UPLOADS_DIR, GENERATED_DIR, PROJECTS_DIR } from '../config.js';
import { ClipSuggestion } from './transcriptAnalysisService.js';

export interface UploadedMediaRecord {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  duration?: number;
  path: string;
  createdAt: string;
  isVideo: boolean;
  isAudio: boolean;
}

export interface ProjectRecord {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  media?: UploadedMediaRecord | null;
  transcript: string;
  analysisOptions: any;
  clips: ClipSuggestion[];
  analysisMode: 'ai' | 'transcript-based' | 'demo';
}

// In-memory media registry indexed by ID
const mediaRegistry = new Map<string, UploadedMediaRecord>();

export class StorageService {
  /**
   * Register newly uploaded media
   */
  public static registerMedia(record: UploadedMediaRecord): void {
    mediaRegistry.set(record.id, record);
  }

  /**
   * Get media record by ID
   */
  public static getMedia(id: string): UploadedMediaRecord | undefined {
    return mediaRegistry.get(id);
  }

  /**
   * Delete uploaded media by ID
   */
  public static deleteMedia(id: string): boolean {
    const record = mediaRegistry.get(id);
    if (record) {
      if (fs.existsSync(record.path)) {
        try {
          fs.unlinkSync(record.path);
        } catch (e) {
          console.error('Error deleting file:', e);
        }
      }
      mediaRegistry.delete(id);
      return true;
    }
    return false;
  }

  /**
   * Safely resolve path within uploads directory
   */
  public static resolveUploadPath(filename: string): string | null {
    const safePath = path.resolve(UPLOADS_DIR, path.basename(filename));
    if (!safePath.startsWith(UPLOADS_DIR)) {
      return null;
    }
    return safePath;
  }

  /**
   * Safely resolve path within generated directory
   */
  public static resolveGeneratedPath(filename: string): string | null {
    const safePath = path.resolve(GENERATED_DIR, path.basename(filename));
    if (!safePath.startsWith(GENERATED_DIR)) {
      return null;
    }
    return safePath;
  }

  /**
   * Save a project to disk
   */
  public static saveProject(project: Partial<ProjectRecord>): ProjectRecord {
    const id = project.id || uuidv4();
    const now = new Date().toISOString();

    const record: ProjectRecord = {
      id,
      name: project.name || 'Untitled ClipForge Project',
      createdAt: project.createdAt || now,
      updatedAt: now,
      media: project.media || null,
      transcript: project.transcript || '',
      analysisOptions: project.analysisOptions || {},
      clips: project.clips || [],
      analysisMode: project.analysisMode || 'transcript-based',
    };

    const filePath = path.join(PROJECTS_DIR, `${id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(record, null, 2), 'utf-8');
    return record;
  }

  /**
   * List all saved projects
   */
  public static listProjects(): ProjectRecord[] {
    try {
      const files = fs.readdirSync(PROJECTS_DIR).filter((f) => f.endsWith('.json'));
      const projects: ProjectRecord[] = [];

      for (const file of files) {
        try {
          const content = fs.readFileSync(path.join(PROJECTS_DIR, file), 'utf-8');
          projects.push(JSON.parse(content));
        } catch (e) {
          console.error(`Error reading project file ${file}:`, e);
        }
      }

      // Sort newest first
      return projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } catch {
      return [];
    }
  }

  /**
   * Get a single project by ID
   */
  public static getProject(id: string): ProjectRecord | null {
    const filePath = path.join(PROJECTS_DIR, `${path.basename(id)}.json`);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  /**
   * Delete a project by ID
   */
  public static deleteProject(id: string): boolean {
    const filePath = path.join(PROJECTS_DIR, `${path.basename(id)}.json`);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
}
