import { Router, Request, Response, NextFunction } from 'express';
import { StorageService } from '../services/storageService.js';

const router = Router();

// Save / Update project
router.post('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, media, transcript, analysisOptions, clips, analysisMode, id } = req.body;

    if (!transcript && (!clips || clips.length === 0)) {
      return res.status(400).json({ error: 'Cannot save an empty project without transcript or clips.' });
    }

    const saved = StorageService.saveProject({
      id,
      name: name || 'Untitled ClipForge Project',
      media,
      transcript: transcript || '',
      analysisOptions: analysisOptions || {},
      clips: clips || [],
      analysisMode: analysisMode || 'transcript-based',
    });

    res.status(201).json({
      success: true,
      project: saved,
    });
  } catch (err: any) {
    next(err);
  }
});

// List all projects
router.get('/', (req: Request, res: Response) => {
  const projects = StorageService.listProjects();
  res.json({
    success: true,
    projects,
  });
});

// Get project by ID
router.get('/:id', (req: Request, res: Response) => {
  const id = String(req.params.id);
  const project = StorageService.getProject(id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found.' });
  }
  res.json({
    success: true,
    project,
  });
});

// Delete project
router.delete('/:id', (req: Request, res: Response) => {
  const id = String(req.params.id);
  const deleted = StorageService.deleteProject(id);
  if (!deleted) {
    return res.status(404).json({ error: 'Project not found or already deleted.' });
  }
  res.json({
    success: true,
    message: 'Project deleted successfully.',
  });
});

export default router;
