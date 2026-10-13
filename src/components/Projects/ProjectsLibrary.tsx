import React, { useState } from 'react';
import { X, FolderOpen, Calendar, Trash2, ArrowRight, Video, FileText, CheckCircle2 } from 'lucide-react';
import { Project } from '../../types';
import { deleteProject } from '../../utils/api';
import { useToast } from '../UI/Toast';

interface ProjectsLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onLoadProject: (project: Project) => void;
  onRefreshProjects: () => void;
}

export const ProjectsLibrary: React.FC<ProjectsLibraryProps> = ({
  isOpen,
  onClose,
  projects,
  onLoadProject,
  onRefreshProjects,
}) => {
  const { showToast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete project "${name}"?`)) return;

    setDeletingId(id);
    try {
      await deleteProject(id);
      showToast(`Deleted project "${name}"`, 'success');
      onRefreshProjects();
    } catch {
      showToast('Failed to delete project', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl glass-panel-elevated rounded-2xl border border-white/15 overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#111318]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#C7F36B]/15 text-[#C7F36B] flex items-center justify-center">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#C7F36B] uppercase tracking-wider">
                ClipForge Workspace
              </span>
              <h3 className="text-lg font-bold text-white">Project Library</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Project List */}
        <div className="p-6 overflow-y-auto space-y-3.5 flex-1">
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
              <p className="text-sm font-semibold text-neutral-300">No saved projects yet</p>
              <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
                After discovering moments in the Studio, click "Save Project" to keep your clips organized here.
              </p>
            </div>
          ) : (
            projects.map((proj) => (
              <div
                key={proj.id}
                className="p-4 rounded-xl bg-[#111318] border border-white/8 hover:border-white/20 transition-all flex items-center justify-between gap-4 group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-bold text-white truncate group-hover:text-[#C7F36B] transition-colors">
                      {proj.name}
                    </h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-neutral-400">
                      {proj.clips?.length || 0} clips
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-neutral-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-neutral-500" />
                      <span>{formatDate(proj.updatedAt || proj.createdAt)}</span>
                    </span>

                    {proj.media && (
                      <span className="flex items-center gap-1 text-neutral-400 truncate max-w-[140px]">
                        <Video className="w-3 h-3 text-[#C7F36B]" />
                        <span>{proj.media.originalName}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onLoadProject(proj);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#C7F36B]/15 hover:bg-[#C7F36B]/25 text-[#C7F36B] border border-[#C7F36B]/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <span>Open</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  <button
                    type="button"
                    disabled={deletingId === proj.id}
                    onClick={() => handleDelete(proj.id, proj.name)}
                    className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-white/5 transition-colors"
                    title="Delete project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#111318] border-t border-white/10 text-xs text-neutral-500 flex items-center justify-between">
          <span>{projects.length} Saved Projects</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 font-medium text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

