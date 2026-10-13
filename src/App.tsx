import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { StudioWorkspace } from './components/Studio/StudioWorkspace';
import { ClipResultsDashboard } from './components/Results/ClipResultsDashboard';
import { ProjectsLibrary } from './components/Projects/ProjectsLibrary';
import { HowItWorks } from './components/Sections/HowItWorks';
import { Features } from './components/Sections/Features';
import { About } from './components/Sections/About';
import { FAQ } from './components/Sections/FAQ';
import { FinalCTA } from './components/Sections/FinalCTA';
import { Footer } from './components/Sections/Footer';
import { ToastProvider, useToast } from './components/UI/Toast';
import {
  UploadedMedia,
  AnalysisOptions,
  ClipSuggestion,
  Project,
  ServerHealth,
} from './types';
import { fetchHealth, fetchProjects, saveProject } from './utils/api';
import { DEMO_TRANSCRIPT, DEMO_CLIPS } from './utils/demoData';

const MainAppContent: React.FC = () => {
  const { showToast } = useToast();

  const [serverHealth, setServerHealth] = useState<ServerHealth | null>(null);
  const [media, setMedia] = useState<UploadedMedia | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  const [analysisOptions, setAnalysisOptions] = useState<AnalysisOptions>({
    targetDuration: '30-60',
    platform: 'YouTube Shorts',
    clipStyle: 'Educational',
    numberOfSuggestions: 10,
  });
  const [clips, setClips] = useState<ClipSuggestion[]>([]);
  const [analysisMode, setAnalysisMode] = useState<'ai' | 'transcript-based' | 'demo'>('transcript-based');

  const [savedProjects, setSavedProjects] = useState<Project[]>([]);
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  // Probe server health and load projects on initial load
  useEffect(() => {
    fetchHealth()
      .then((health) => {
        setServerHealth(health);
      })
      .catch((err) => {
        console.warn('Backend server not connected yet:', err);
      });

    loadSavedProjects();
  }, []);

  const loadSavedProjects = async () => {
    try {
      const projs = await fetchProjects();
      setSavedProjects(projs);
    } catch {
      // Fallback: check localStorage if server fails
      const local = localStorage.getItem('clipforge_projects');
      if (local) {
        try {
          setSavedProjects(JSON.parse(local));
        } catch {}
      }
    }
  };

  const handleStartCreating = () => {
    const el = document.getElementById('studio');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLoadDemo = () => {
    setTranscript(DEMO_TRANSCRIPT);
    setClips(DEMO_CLIPS);
    setAnalysisMode('demo');
    setMedia(null);
    setCurrentProjectId(null);

    showToast('Loaded sample podcast demo! Scored 4 high-retention moments.', 'success');

    setTimeout(() => {
      const resultsEl = document.getElementById('results');
      if (resultsEl) {
        resultsEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 200);
  };

  const handleAnalysisComplete = (
    discoveredClips: ClipSuggestion[],
    mode: 'ai' | 'transcript-based' | 'demo'
  ) => {
    setClips(discoveredClips);
    setAnalysisMode(mode);
  };

  const handleSaveProject = async () => {
    const defaultName = media?.originalName
      ? `Project: ${media.originalName.slice(0, 25)}`
      : `Podcast Highlights (${new Date().toLocaleDateString()})`;

    const name = window.prompt('Enter project name:', defaultName);
    if (!name) return;

    try {
      const saved = await saveProject({
        id: currentProjectId || undefined,
        name,
        media,
        transcript,
        analysisOptions,
        clips,
        analysisMode,
      });

      setCurrentProjectId(saved.id);
      showToast(`Saved project "${saved.name}" successfully!`, 'success');

      // Update in local state & localStorage backup
      setSavedProjects((prev) => [saved, ...prev.filter((p) => p.id !== saved.id)]);
      try {
        localStorage.setItem(
          'clipforge_projects',
          JSON.stringify([saved, ...savedProjects.filter((p) => p.id !== saved.id)].slice(0, 20))
        );
      } catch {}
    } catch (err: any) {
      showToast(err.message || 'Failed to save project', 'error');
    }
  };

  const handleOpenProject = (project: Project) => {
    setCurrentProjectId(project.id);
    setTranscript(project.transcript || '');
    setClips(project.clips || []);
    setAnalysisOptions(project.analysisOptions || analysisOptions);
    setAnalysisMode(project.analysisMode || 'transcript-based');
    if (project.media) {
      setMedia(project.media);
    } else {
      setMedia(null);
    }

    showToast(`Loaded project "${project.name}"!`, 'success');

    setTimeout(() => {
      const resultsEl = document.getElementById('results');
      if (resultsEl && project.clips && project.clips.length > 0) {
        resultsEl.scrollIntoView({ behavior: 'smooth' });
      } else {
        const studioEl = document.getElementById('studio');
        if (studioEl) studioEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 200);
  };

  return (
    <div className="min-h-screen bg-[#08090B] text-white flex flex-col selection:bg-[#C7F36B] selection:text-black">
      {/* Navigation bar */}
      <Navbar
        serverHealth={serverHealth}
        onOpenProjects={() => setIsProjectsOpen(true)}
        savedProjectCount={savedProjects.length}
      />

      {/* Hero section */}
      <Hero
        onStartCreating={handleStartCreating}
        onTryDemo={handleLoadDemo}
      />

      {/* Main Studio Workspace */}
      <StudioWorkspace
        media={media}
        setMedia={setMedia}
        transcript={transcript}
        setTranscript={setTranscript}
        analysisOptions={analysisOptions}
        setAnalysisOptions={setAnalysisOptions}
        onAnalysisComplete={handleAnalysisComplete}
        onLoadDemo={handleLoadDemo}
      />

      {/* Results Dashboard (Appears when clips exist) */}
      {clips.length > 0 && (
        <ClipResultsDashboard
          clips={clips}
          setClips={setClips}
          media={media}
          analysisMode={analysisMode}
          analysisOptions={analysisOptions}
          onSaveProject={handleSaveProject}
        />
      )}

      {/* Workflow steps */}
      <HowItWorks />

      {/* Capabilities */}
      <Features />

      {/* Creator Manifesto / About */}
      <About />

      {/* FAQ Accordion */}
      <FAQ />

      {/* Final Action Trigger */}
      <FinalCTA onScrollToStudio={handleStartCreating} />

      {/* Footer */}
      <Footer />

      {/* Saved Projects Library Drawer */}
      <ProjectsLibrary
        isOpen={isProjectsOpen}
        onClose={() => setIsProjectsOpen(false)}
        projects={savedProjects}
        onLoadProject={handleOpenProject}
        onRefreshProjects={loadSavedProjects}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <MainAppContent />
    </ToastProvider>
  );
};

export default App;

