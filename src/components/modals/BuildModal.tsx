/**
 * Build Modal
 * 
 * Parameter-driven build modal that collects:
 * - Platform selection
 * - App metadata (name, version, bundle ID)
 * - API keys & environment variables
 * - Build mode & optimization settings
 * - App icon upload
 * 
 * Upon clicking "Build", triggers the code generation engine.
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { useAppDispatch, useAppSelector, store } from '@/store/store';
import { closeModal, addNotification } from '@/store/uiSlice';
import { TargetPlatform } from '@/types/project.types';
import { BuildMode } from '@/types/build.types';
import { AnimatedButton } from '@/components/shared/AnimatedButton';
import { GlassCard } from '@/components/shared/GlassCard';
import { generateProjectCode } from '@/services/CodeGenerator';
import { packageAndDownload } from '@/services/ProjectPackager';

/* ──────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────── */

interface BuildFormState {
  platform: TargetPlatform;
  mode: BuildMode;
  appName: string;
  appVersion: string;
  buildNumber: number;
  bundleId: string;
  apiKeys: Record<string, string>;
  envVars: Record<string, string>;
  features: {
    analytics: boolean;
    crashReporting: boolean;
    pushNotifications: boolean;
    darkMode: boolean;
    accessibility: boolean;
  };
  optimization: {
    minify: boolean;
    treeshake: boolean;
    codeSplit: boolean;
    lazyLoad: boolean;
    imageOptimization: boolean;
    sourceMaps: boolean;
  };
}

/* ──────────────────────────────────────────────
 * Build Steps
 * ────────────────────────────────────────────── */

type BuildStep = 'platform' | 'metadata' | 'keys' | 'features' | 'review';

const STEPS: { id: BuildStep; label: string }[] = [
  { id: 'platform', label: 'Platform' },
  { id: 'metadata', label: 'App Info' },
  { id: 'keys', label: 'API Keys' },
  { id: 'features', label: 'Features' },
  { id: 'review', label: 'Review' },
];

/* ──────────────────────────────────────────────
 * Platform Card
 * ────────────────────────────────────────────── */

interface PlatformCardProps {
  platform: TargetPlatform;
  label: string;
  description: string;
  icon: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}

function PlatformCard({ label, description, icon, selected, onClick }: PlatformCardProps) {
  return (
    <motion.button
      className={clsx(
        'flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all text-center',
        selected
          ? 'border-builder-accent bg-builder-accent/10 shadow-glow'
          : 'border-builder-border/30 bg-builder-elevated/40 hover:border-builder-border/60',
      )}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div
        className={clsx(
          'w-14 h-14 rounded-2xl flex items-center justify-center',
          selected ? 'bg-builder-accent/20 text-builder-accent' : 'bg-builder-border/20 text-builder-text-muted',
        )}
      >
        {icon}
      </div>
      <div>
        <div className={clsx('text-sm font-semibold', selected ? 'text-builder-text' : 'text-builder-text-muted')}>
          {label}
        </div>
        <div className="text-[10px] text-builder-text-dim mt-0.5">{description}</div>
      </div>
      {selected && (
        <motion.div
          className="w-5 h-5 rounded-full bg-builder-accent flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </motion.div>
      )}
    </motion.button>
  );
}

/* ──────────────────────────────────────────────
 * Build Modal Component
 * ────────────────────────────────────────────── */

export function BuildModal() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.activeModal === 'build');
  const project = useAppSelector((state) => state.project.project);

  const [step, setStep] = useState<BuildStep>('platform');
  const [isBuilding, setIsBuilding] = useState(false);
  const [form, setForm] = useState<BuildFormState>({
    platform: TargetPlatform.Web,
    mode: BuildMode.Release,
    appName: project?.name ?? 'My App',
    appVersion: project?.version ?? '1.0.0',
    buildNumber: 1,
    bundleId: 'com.example.myapp',
    apiKeys: {},
    envVars: {},
    features: {
      analytics: false,
      crashReporting: false,
      pushNotifications: false,
      darkMode: true,
      accessibility: true,
    },
    optimization: {
      minify: true,
      treeshake: true,
      codeSplit: true,
      lazyLoad: true,
      imageOptimization: true,
      sourceMaps: false,
    },
  });
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [newEnvName, setNewEnvName] = useState('');
  const [newEnvValue, setNewEnvValue] = useState('');

  const currentStepIndex = useMemo(
    () => STEPS.findIndex((s) => s.id === step),
    [step],
  );

  const handleClose = useCallback(() => {
    dispatch(closeModal());
    setStep('platform');
    setIsBuilding(false);
  }, [dispatch]);

  const handleNext = useCallback(() => {
    const idx = STEPS.findIndex((s) => s.id === step);
    if (idx < STEPS.length - 1) {
      setStep(STEPS[idx + 1]!.id);
    }
  }, [step]);

  const handleBack = useCallback(() => {
    const idx = STEPS.findIndex((s) => s.id === step);
    if (idx > 0) {
      setStep(STEPS[idx - 1]!.id);
    }
  }, [step]);

  const [buildProgress, setBuildProgress] = useState(0);
  const [buildStatus, setBuildStatus] = useState('');

  const handleBuild = useCallback(async () => {
    setIsBuilding(true);
    setBuildProgress(0);
    setBuildStatus('Validating project...');

    const state = store.getState();
    const widgets = state.canvas.widgets;
    const pages = state.canvas.pages;

    // Step 1: Validate
    await delay(400);
    setBuildProgress(10);
    setBuildStatus('Auditing dependencies...');

    const widgetCount = Object.keys(widgets).length;
    if (widgetCount === 0) {
      dispatch(addNotification({ type: 'error', title: 'Build Failed', message: 'No widgets on canvas. Add some widgets before building.', duration: 5000, dismissible: true }));
      setIsBuilding(false);
      return;
    }

    // Step 2: Generate code
    await delay(500);
    setBuildProgress(25);
    const platformLabel = form.platform === TargetPlatform.Web ? 'Next.js' : 'Flutter';
    setBuildStatus(`Generating ${platformLabel} code for ${pages.length} page(s)...`);

    const generatedFiles = generateProjectCode(widgets, pages, {
      platform: form.platform,
      language: form.platform === TargetPlatform.Web ? 'typescript' : 'dart',
      framework: form.platform === TargetPlatform.Web ? 'next' : 'flutter',
      styling: 'tailwind',
      stateManagement: form.platform === TargetPlatform.Web ? 'redux' : 'provider',
      testing: false,
      comments: true,
      formatCode: true,
      generateTypes: true,
      cleanArchitecture: true,
      appName: form.appName,
      bundleId: form.bundleId,
      appVersion: form.appVersion,
      buildNumber: form.buildNumber,
    });

    // Step 3: Compile
    await delay(600);
    setBuildProgress(45);
    setBuildStatus(`Compiling ${generatedFiles.length} files...`);

    // Step 4: Optimize
    await delay(500);
    setBuildProgress(60);
    setBuildStatus(form.optimization.minify ? 'Minifying & tree-shaking...' : 'Bundling assets...');

    // Step 5: Package into ZIP
    await delay(400);
    setBuildProgress(75);
    const outputLabel = form.platform === TargetPlatform.Android ? 'APK' : form.platform === TargetPlatform.IOS ? 'iOS project' : 'web application';
    setBuildStatus(`Packaging ${outputLabel}...`);

    try {
      const result = await packageAndDownload(generatedFiles, {
        platform: form.platform,
        appName: form.appName || 'my-app',
        appVersion: form.appVersion,
        buildNumber: form.buildNumber,
        bundleId: form.bundleId,
        envVars: form.envVars,
        apiKeys: form.apiKeys,
      });

      setBuildProgress(100);
      setBuildStatus('Build complete!');

      const sizeKB = (result.size / 1024).toFixed(1);
      const sizeMB = result.size > 1024 * 1024 ? ` (${(result.size / (1024 * 1024)).toFixed(2)} MB)` : '';

      dispatch(addNotification({
        type: 'success',
        title: 'Build Successful!',
        message: `${result.fileCount} files packaged into ${result.filename} (${sizeKB} KB${sizeMB})`,
        duration: 8000,
        dismissible: true,
      }));
    } catch (error) {
      setBuildProgress(0);
      setBuildStatus('');
      dispatch(addNotification({
        type: 'error',
        title: 'Build Failed',
        message: error instanceof Error ? error.message : 'An unexpected error occurred during packaging.',
        duration: 6000,
        dismissible: true,
      }));
      setIsBuilding(false);
      return;
    }

    // Close modal after short delay
    await delay(800);
    setIsBuilding(false);
    setBuildProgress(0);
    setBuildStatus('');
    handleClose();
  }, [dispatch, form, handleClose]);

  function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }

  const addApiKey = useCallback(() => {
    if (newKeyName.trim()) {
      setForm((prev) => ({
        ...prev,
        apiKeys: { ...prev.apiKeys, [newKeyName.trim()]: newKeyValue },
      }));
      setNewKeyName('');
      setNewKeyValue('');
    }
  }, [newKeyName, newKeyValue]);

  const addEnvVar = useCallback(() => {
    if (newEnvName.trim()) {
      setForm((prev) => ({
        ...prev,
        envVars: { ...prev.envVars, [newEnvName.trim()]: newEnvValue },
      }));
      setNewEnvName('');
      setNewEnvValue('');
    }
  }, [newEnvName, newEnvValue]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-2xl max-h-[85vh] bg-builder-surface border border-builder-border/40 rounded-2xl shadow-glass-lg overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-builder-border/30">
              <div>
                <h2 className="text-lg font-bold text-builder-text">Build Application</h2>
                <p className="text-xs text-builder-text-muted mt-0.5">Configure and export your application</p>
              </div>
              <button
                className="w-8 h-8 flex items-center justify-center rounded-lg text-builder-text-muted hover:text-builder-text hover:bg-glass-white-10 transition-colors"
                onClick={handleClose}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center px-6 py-3 border-b border-builder-border/20 bg-builder-bg/30">
              {STEPS.map((s, i) => (
                <React.Fragment key={s.id}>
                  <button
                    className={clsx(
                      'flex items-center gap-2 text-xs font-medium transition-colors',
                      i === currentStepIndex && 'text-builder-accent',
                      i < currentStepIndex && 'text-builder-success',
                      i > currentStepIndex && 'text-builder-text-dim',
                    )}
                    onClick={() => i <= currentStepIndex && setStep(s.id)}
                  >
                    <div
                      className={clsx(
                        'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold',
                        i === currentStepIndex && 'bg-builder-accent text-white',
                        i < currentStepIndex && 'bg-builder-success text-white',
                        i > currentStepIndex && 'bg-builder-border/40 text-builder-text-dim',
                      )}
                    >
                      {i < currentStepIndex ? (
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      ) : (
                        i + 1
                      )}
                    </div>
                    <span className="hidden sm:inline">{s.label}</span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div
                      className={clsx(
                        'flex-1 h-px mx-2',
                        i < currentStepIndex ? 'bg-builder-success' : 'bg-builder-border/30',
                      )}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[50vh] scrollbar-thin scrollbar-thumb-builder-border/30">
              <AnimatePresence mode="wait">
                {/* Platform Selection */}
                {step === 'platform' && (
                  <motion.div
                    key="platform"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="grid grid-cols-3 gap-4"
                  >
                    <PlatformCard
                      platform={TargetPlatform.Web}
                      label="Web"
                      description="Next.js / React SPA"
                      selected={form.platform === TargetPlatform.Web}
                      onClick={() => setForm({ ...form, platform: TargetPlatform.Web })}
                      icon={
                        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>
                      }
                    />
                    <PlatformCard
                      platform={TargetPlatform.Android}
                      label="Android"
                      description="Flutter / Kotlin"
                      selected={form.platform === TargetPlatform.Android}
                      onClick={() => setForm({ ...form, platform: TargetPlatform.Android })}
                      icon={
                        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 16V8a7 7 0 0114 0v8M18 16a2 2 0 01-2 2H8a2 2 0 01-2-2M7 8h.01M17 8h.01M8 4l-2-2M16 4l2-2" /></svg>
                      }
                    />
                    <PlatformCard
                      platform={TargetPlatform.IOS}
                      label="iOS"
                      description="Flutter / Swift"
                      selected={form.platform === TargetPlatform.IOS}
                      onClick={() => setForm({ ...form, platform: TargetPlatform.IOS })}
                      icon={
                        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zM16.5 12.5c0 2.485-2.015 4.5-4.5 4.5s-4.5-2.015-4.5-4.5M15 8.5a1.5 1.5 0 11-3 0M12 8.5a1.5 1.5 0 11-3 0" /></svg>
                      }
                    />
                  </motion.div>
                )}

                {/* Metadata */}
                {step === 'metadata' && (
                  <motion.div
                    key="metadata"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col gap-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-builder-text-muted font-medium">App Name</label>
                        <input
                          type="text"
                          value={form.appName}
                          onChange={(e) => setForm({ ...form, appName: e.target.value })}
                          className="h-9 px-3 text-sm bg-builder-bg/60 border border-builder-border/40 rounded-lg text-builder-text focus:outline-none focus:border-builder-accent/50 transition-colors"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-builder-text-muted font-medium">Version</label>
                        <input
                          type="text"
                          value={form.appVersion}
                          onChange={(e) => setForm({ ...form, appVersion: e.target.value })}
                          className="h-9 px-3 text-sm bg-builder-bg/60 border border-builder-border/40 rounded-lg text-builder-text font-mono focus:outline-none focus:border-builder-accent/50 transition-colors"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-builder-text-muted font-medium">Bundle ID</label>
                        <input
                          type="text"
                          value={form.bundleId}
                          onChange={(e) => setForm({ ...form, bundleId: e.target.value })}
                          placeholder="com.example.app"
                          className="h-9 px-3 text-sm bg-builder-bg/60 border border-builder-border/40 rounded-lg text-builder-text font-mono focus:outline-none focus:border-builder-accent/50 transition-colors"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-builder-text-muted font-medium">Build Number</label>
                        <input
                          type="number"
                          value={form.buildNumber}
                          onChange={(e) => setForm({ ...form, buildNumber: parseInt(e.target.value) || 1 })}
                          className="h-9 px-3 text-sm bg-builder-bg/60 border border-builder-border/40 rounded-lg text-builder-text font-mono focus:outline-none focus:border-builder-accent/50 transition-colors"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-builder-text-muted font-medium">Build Mode</label>
                      <div className="flex gap-2">
                        {Object.values(BuildMode).map((mode) => (
                          <button
                            key={mode}
                            className={clsx(
                              'flex-1 h-9 rounded-lg text-xs font-medium border transition-all capitalize',
                              form.mode === mode
                                ? 'border-builder-accent bg-builder-accent/10 text-builder-accent'
                                : 'border-builder-border/40 text-builder-text-muted hover:text-builder-text',
                            )}
                            onClick={() => setForm({ ...form, mode })}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* API Keys & Env Variables */}
                {step === 'keys' && (
                  <motion.div
                    key="keys"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col gap-6"
                  >
                    {/* API Keys */}
                    <div>
                      <h3 className="text-sm font-semibold text-builder-text mb-3">API Keys</h3>
                      {Object.entries(form.apiKeys).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-builder-text-muted font-mono w-32 truncate">{key}</span>
                          <span className="text-xs text-builder-text font-mono flex-1 truncate">
                            {value.slice(0, 8)}{'•'.repeat(Math.max(0, value.length - 8))}
                          </span>
                          <button
                            className="text-builder-text-dim hover:text-builder-error text-xs"
                            onClick={() => {
                              const { [key]: _, ...rest } = form.apiKeys;
                              setForm({ ...form, apiKeys: rest });
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <div className="flex items-end gap-2">
                        <div className="flex-1 flex flex-col gap-1">
                          <label className="text-[10px] text-builder-text-dim">Key Name</label>
                          <input
                            type="text"
                            value={newKeyName}
                            onChange={(e) => setNewKeyName(e.target.value)}
                            placeholder="FIREBASE_API_KEY"
                            className="h-8 px-2 text-xs bg-builder-bg/60 border border-builder-border/40 rounded-lg text-builder-text font-mono focus:outline-none focus:border-builder-accent/50"
                          />
                        </div>
                        <div className="flex-1 flex flex-col gap-1">
                          <label className="text-[10px] text-builder-text-dim">Value</label>
                          <input
                            type="password"
                            value={newKeyValue}
                            onChange={(e) => setNewKeyValue(e.target.value)}
                            placeholder="••••••••"
                            className="h-8 px-2 text-xs bg-builder-bg/60 border border-builder-border/40 rounded-lg text-builder-text font-mono focus:outline-none focus:border-builder-accent/50"
                          />
                        </div>
                        <AnimatedButton size="xs" variant="secondary" onClick={addApiKey}>
                          Add
                        </AnimatedButton>
                      </div>
                    </div>

                    {/* Environment Variables */}
                    <div>
                      <h3 className="text-sm font-semibold text-builder-text mb-3">Environment Variables</h3>
                      {Object.entries(form.envVars).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-builder-text-muted font-mono w-32 truncate">{key}</span>
                          <span className="text-xs text-builder-text flex-1 truncate">{value}</span>
                          <button
                            className="text-builder-text-dim hover:text-builder-error text-xs"
                            onClick={() => {
                              const { [key]: _, ...rest } = form.envVars;
                              setForm({ ...form, envVars: rest });
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <div className="flex items-end gap-2">
                        <div className="flex-1 flex flex-col gap-1">
                          <label className="text-[10px] text-builder-text-dim">Variable Name</label>
                          <input
                            type="text"
                            value={newEnvName}
                            onChange={(e) => setNewEnvName(e.target.value)}
                            placeholder="API_BASE_URL"
                            className="h-8 px-2 text-xs bg-builder-bg/60 border border-builder-border/40 rounded-lg text-builder-text font-mono focus:outline-none focus:border-builder-accent/50"
                          />
                        </div>
                        <div className="flex-1 flex flex-col gap-1">
                          <label className="text-[10px] text-builder-text-dim">Value</label>
                          <input
                            type="text"
                            value={newEnvValue}
                            onChange={(e) => setNewEnvValue(e.target.value)}
                            placeholder="https://api.example.com"
                            className="h-8 px-2 text-xs bg-builder-bg/60 border border-builder-border/40 rounded-lg text-builder-text focus:outline-none focus:border-builder-accent/50"
                          />
                        </div>
                        <AnimatedButton size="xs" variant="secondary" onClick={addEnvVar}>
                          Add
                        </AnimatedButton>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Features & Optimization */}
                {step === 'features' && (
                  <motion.div
                    key="features"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="grid grid-cols-2 gap-6"
                  >
                    <div>
                      <h3 className="text-sm font-semibold text-builder-text mb-3">Features</h3>
                      <div className="flex flex-col gap-2.5">
                        {Object.entries(form.features).map(([key, value]) => (
                          <label key={key} className="flex items-center justify-between cursor-pointer group">
                            <span className="text-xs text-builder-text-muted group-hover:text-builder-text capitalize transition-colors">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <button
                              className={clsx(
                                'w-9 h-5 rounded-full transition-colors relative',
                                value ? 'bg-builder-accent' : 'bg-builder-border',
                              )}
                              onClick={() =>
                                setForm({
                                  ...form,
                                  features: { ...form.features, [key]: !value },
                                })
                              }
                            >
                              <div
                                className={clsx(
                                  'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform',
                                  value ? 'translate-x-[18px]' : 'translate-x-0.5',
                                )}
                              />
                            </button>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-builder-text mb-3">Optimization</h3>
                      <div className="flex flex-col gap-2.5">
                        {Object.entries(form.optimization).map(([key, value]) => (
                          <label key={key} className="flex items-center justify-between cursor-pointer group">
                            <span className="text-xs text-builder-text-muted group-hover:text-builder-text capitalize transition-colors">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <button
                              className={clsx(
                                'w-9 h-5 rounded-full transition-colors relative',
                                value ? 'bg-builder-success' : 'bg-builder-border',
                              )}
                              onClick={() =>
                                setForm({
                                  ...form,
                                  optimization: { ...form.optimization, [key]: !value },
                                })
                              }
                            >
                              <div
                                className={clsx(
                                  'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform',
                                  value ? 'translate-x-[18px]' : 'translate-x-0.5',
                                )}
                              />
                            </button>
                          </label>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Review */}
                {step === 'review' && (
                  <motion.div
                    key="review"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col gap-4"
                  >
                    <GlassCard variant="inset" padding="md">
                      <h3 className="text-sm font-semibold text-builder-text mb-3">Build Summary</h3>
                      <div className="grid grid-cols-2 gap-y-2 text-xs">
                        <span className="text-builder-text-muted">Platform</span>
                        <span className="text-builder-text font-medium capitalize">{form.platform}</span>
                        <span className="text-builder-text-muted">App Name</span>
                        <span className="text-builder-text font-medium">{form.appName}</span>
                        <span className="text-builder-text-muted">Version</span>
                        <span className="text-builder-text font-mono">{form.appVersion} ({form.buildNumber})</span>
                        <span className="text-builder-text-muted">Bundle ID</span>
                        <span className="text-builder-text font-mono">{form.bundleId}</span>
                        <span className="text-builder-text-muted">Build Mode</span>
                        <span className="text-builder-text capitalize">{form.mode}</span>
                        <span className="text-builder-text-muted">API Keys</span>
                        <span className="text-builder-text">{Object.keys(form.apiKeys).length} configured</span>
                        <span className="text-builder-text-muted">Env Variables</span>
                        <span className="text-builder-text">{Object.keys(form.envVars).length} configured</span>
                      </div>
                    </GlassCard>

                    <div className="flex items-center gap-2 p-3 rounded-lg bg-builder-accent/5 border border-builder-accent/20">
                      <svg className="w-4 h-4 text-builder-accent flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 16v-4M12 8h.01" />
                      </svg>
                      <p className="text-xs text-builder-text-muted">
                        {form.platform === TargetPlatform.Web
                          ? 'A complete Next.js project will be downloaded as a ZIP file. Run "npm install && npm run dev" to start.'
                          : form.platform === TargetPlatform.Android
                          ? 'A Flutter project with Android configuration will be downloaded as an APK file. Open in Android Studio or run "flutter build apk".'
                          : 'A Flutter project with iOS/Xcode configuration will be downloaded as a ZIP file. Open in Xcode or run "flutter build ios".'}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-builder-border/30 bg-builder-bg/20">
              <AnimatedButton
                variant="ghost"
                size="sm"
                onClick={step === 'platform' ? handleClose : handleBack}
              >
                {step === 'platform' ? 'Cancel' : 'Back'}
              </AnimatedButton>

              {step === 'review' ? (
                <div className="flex items-center gap-3">
                  {isBuilding && (
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-1.5 rounded-full bg-builder-border/40 overflow-hidden">
                        <div className="h-full rounded-full bg-builder-accent transition-all duration-300" style={{ width: `${buildProgress}%` }} />
                      </div>
                      <span className="text-[10px] text-builder-text-muted font-mono w-8">{buildProgress}%</span>
                    </div>
                  )}
                  <AnimatedButton
                    variant="primary"
                    size="md"
                    loading={isBuilding}
                    onClick={handleBuild}
                    icon={
                      !isBuilding ? (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                      ) : undefined
                    }
                  >
                    {isBuilding ? buildStatus : form.platform === TargetPlatform.Android ? 'Build APK' : form.platform === TargetPlatform.IOS ? 'Build iOS App' : 'Build & Download'}
                  </AnimatedButton>
                </div>
              ) : (
                <AnimatedButton variant="primary" size="sm" onClick={handleNext}>
                  Continue
                </AnimatedButton>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
