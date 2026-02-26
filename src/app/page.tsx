/**
 * Home Page
 * 
 * Landing page with project selection.
 * Redirects to the builder when a project is opened/created.
 */

'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/store';
import { createProject } from '@/store/projectSlice';
import { addPage } from '@/store/canvasSlice';
import { AnimatedButton } from '@/components/shared/AnimatedButton';
import { GlassCard } from '@/components/shared/GlassCard';
import { ProjectService } from '@/services/ProjectService';

/* ──────────────────────────────────────────────
 * Component
 * ────────────────────────────────────────────── */

export default function HomePage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [recentProjects, setRecentProjects] = useState<
    { id: string; name: string; updatedAt: number }[]
  >([]);
  const [projectName, setProjectName] = useState('');

  useEffect(() => {
    setRecentProjects(ProjectService.getRecentProjects());
  }, []);

  const handleCreateProject = useCallback(() => {
    const name = projectName.trim() || 'Untitled Project';
    dispatch(createProject({ name, description: '' }));
    dispatch(addPage({ name: 'Home', path: '/' }));
    router.push('/builder');
  }, [dispatch, router, projectName]);

  const handleOpenProject = useCallback(
    (projectId: string) => {
      // Load from storage and navigate
      const project = ProjectService.loadProject(projectId);
      if (project) {
        dispatch(createProject({ name: project.name, description: project.description }));
        router.push('/builder');
      }
    },
    [dispatch, router],
  );

  return (
    <div className="min-h-screen bg-builder-bg flex items-center justify-center p-8">
      {/* Background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-builder-accent/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-purple-500/5 rounded-full blur-[100px]" />
      </div>

      <motion.div
        className="relative z-10 w-full max-w-3xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-builder-accent to-purple-500 shadow-glow mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
          >
            <span className="text-white text-2xl font-black">AB</span>
          </motion.div>
          <motion.h1
            className="text-4xl font-bold text-builder-text mb-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            AppBuilder
          </motion.h1>
          <motion.p
            className="text-builder-text-muted text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Build production-ready apps with drag & drop
          </motion.p>
        </div>

        {/* New Project */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard variant="elevated" padding="lg" className="mb-6">
            <h2 className="text-lg font-semibold text-builder-text mb-4">New Project</h2>
            <div className="flex gap-3">
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Project name..."
                className="flex-1 h-11 px-4 text-sm bg-builder-bg/60 border border-builder-border/40 rounded-xl text-builder-text placeholder:text-builder-text-dim focus:outline-none focus:border-builder-accent/50 focus:ring-2 focus:ring-builder-accent/20 transition-all"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
              />
              <AnimatedButton
                variant="primary"
                size="lg"
                onClick={handleCreateProject}
                icon={
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                }
              >
                Create
              </AnimatedButton>
            </div>
          </GlassCard>
        </motion.div>

        {/* Recent Projects */}
        {recentProjects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <GlassCard variant="elevated" padding="lg">
              <h2 className="text-lg font-semibold text-builder-text mb-4">Recent Projects</h2>
              <div className="flex flex-col gap-2">
                {recentProjects.map((project) => (
                  <motion.button
                    key={project.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-glass-white-10 transition-colors text-left group"
                    onClick={() => handleOpenProject(project.id)}
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-builder-accent/10 flex items-center justify-center">
                        <svg className="w-4 h-4 text-builder-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-builder-text">{project.name}</div>
                        <div className="text-[10px] text-builder-text-dim">
                          {new Date(project.updatedAt).toLocaleDateString()} at{' '}
                          {new Date(project.updatedAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <svg
                      className="w-4 h-4 text-builder-text-dim group-hover:text-builder-text transition-colors"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </motion.button>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Platform badges */}
        <motion.div
          className="flex items-center justify-center gap-4 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {['Web', 'Android', 'iOS'].map((platform) => (
            <div
              key={platform}
              className="flex items-center gap-1.5 text-[11px] text-builder-text-dim"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-builder-success" />
              {platform}
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
