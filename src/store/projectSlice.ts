// @ts-nocheck — Immer draft types conflict with readonly interfaces; runtime is correct
/**
 * Project Slice
 * 
 * Manages the project-level state: settings, variables, APIs,
 * theme, assets, custom code, and dependencies.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  Project,
  ProjectSettings,
  ProjectTheme,
  DEFAULT_PROJECT_THEME,
  ProjectVariable,
  ApiEndpoint,
  ProjectAsset,
  CustomCodeBlock,
  ProjectDependency,
  EnvironmentConfig,
  TargetPlatform,
} from '@/types/project.types';
import { generateId } from '@/utils';

/* ──────────────────────────────────────────────
 * Initial State
 * ────────────────────────────────────────────── */

const defaultSettings: ProjectSettings = {
  platforms: [TargetPlatform.Web],
  language: 'en',
  locales: ['en'],
  appIcon: '',
  splashScreen: {
    enabled: false,
    backgroundColor: '#ffffff',
    logoUrl: '',
    duration: 2000,
    animation: 'fade',
  },
  bundleId: {
    android: 'com.example.app',
    ios: 'com.example.app',
    web: 'localhost',
  },
  versionCode: 1,
  versionName: '1.0.0',
  environments: [
    {
      id: 'dev',
      name: 'Development',
      variables: {},
      apiBaseUrl: 'http://localhost:3000/api',
      isProduction: false,
    },
    {
      id: 'prod',
      name: 'Production',
      variables: {},
      apiBaseUrl: 'https://api.example.com',
      isProduction: true,
    },
  ],
  activeEnvironment: 'dev',
  seo: {
    defaultTitle: 'My App',
    titleTemplate: '%s | My App',
    defaultDescription: '',
    defaultOgImage: '',
    siteName: 'My App',
    twitterHandle: '',
    robotsTxt: 'User-agent: *\nAllow: /',
    sitemapEnabled: true,
  },
  analytics: {
    googleAnalyticsId: '',
    mixpanelToken: '',
    hotjarId: '',
    customScript: '',
    enabled: false,
  },
  auth: {
    provider: 'none',
    apiKey: '',
    domain: '',
    projectId: '',
    enabledMethods: [],
  },
};

export interface ProjectState {
  readonly project: Project | null;
  readonly isLoading: boolean;
  readonly isSaving: boolean;
  readonly error: string | null;
  readonly lastSaved: number | null;
  readonly isDirty: boolean;
  readonly recentProjects: readonly ProjectSummary[];
}

export interface ProjectSummary {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly updatedAt: number;
  readonly thumbnail: string;
}

const initialState: ProjectState = {
  project: null,
  isLoading: false,
  isSaving: false,
  error: null,
  lastSaved: null,
  isDirty: false,
  recentProjects: [],
};

/* ──────────────────────────────────────────────
 * Slice
 * ────────────────────────────────────────────── */

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    /* ── Project Lifecycle ── */

    createProject(
      state,
      action: PayloadAction<{ name: string; description: string }>,
    ) {
      const now = Date.now();
      state.project = {
        id: generateId('proj'),
        name: action.payload.name,
        description: action.payload.description,
        version: '1.0.0',
        createdAt: now,
        updatedAt: now,
        createdBy: 'user',
        lastModifiedBy: 'user',
        pages: [],
        widgets: {},
        variables: [],
        apis: [],
        settings: defaultSettings,
        theme: DEFAULT_PROJECT_THEME,
        assets: [],
        customCode: [],
        dependencies: [],
        collaborators: [],
      };
      state.isDirty = true;
      state.error = null;
    },

    loadProject(state, action: PayloadAction<Project>) {
      state.project = action.payload;
      state.isLoading = false;
      state.isDirty = false;
      state.error = null;
    },

    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },

    setSaving(state, action: PayloadAction<boolean>) {
      state.isSaving = action.payload;
      if (!action.payload) {
        state.lastSaved = Date.now();
        state.isDirty = false;
      }
    },

    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.isLoading = false;
      state.isSaving = false;
    },

    markDirty(state) {
      state.isDirty = true;
    },

    closeProject(state) {
      state.project = null;
      state.isDirty = false;
      state.error = null;
    },

    /* ── Settings ── */

    updateSettings(state, action: PayloadAction<Partial<ProjectSettings>>) {
      if (!state.project) return;
      state.project = {
        ...state.project,
        settings: { ...state.project.settings, ...action.payload },
        updatedAt: Date.now(),
      };
      state.isDirty = true;
    },

    /* ── Theme ── */

    updateTheme(state, action: PayloadAction<Partial<ProjectTheme>>) {
      if (!state.project) return;
      state.project = {
        ...state.project,
        theme: { ...state.project.theme, ...action.payload },
        updatedAt: Date.now(),
      };
      state.isDirty = true;
    },

    resetTheme(state) {
      if (!state.project) return;
      state.project = {
        ...state.project,
        theme: DEFAULT_PROJECT_THEME,
        updatedAt: Date.now(),
      };
      state.isDirty = true;
    },

    /* ── Variables ── */

    addVariable(state, action: PayloadAction<Omit<ProjectVariable, 'id'>>) {
      if (!state.project) return;
      const variable: ProjectVariable = {
        ...action.payload,
        id: generateId('var'),
      };
      state.project = {
        ...state.project,
        variables: [...state.project.variables, variable],
        updatedAt: Date.now(),
      };
      state.isDirty = true;
    },

    updateVariable(
      state,
      action: PayloadAction<{ id: string; updates: Partial<ProjectVariable> }>,
    ) {
      if (!state.project) return;
      state.project = {
        ...state.project,
        variables: state.project.variables.map(v =>
          v.id === action.payload.id ? { ...v, ...action.payload.updates } : v,
        ),
        updatedAt: Date.now(),
      };
      state.isDirty = true;
    },

    removeVariable(state, action: PayloadAction<string>) {
      if (!state.project) return;
      state.project = {
        ...state.project,
        variables: state.project.variables.filter(v => v.id !== action.payload),
        updatedAt: Date.now(),
      };
      state.isDirty = true;
    },

    setVariableValue(
      state,
      action: PayloadAction<{ id: string; value: unknown }>,
    ) {
      if (!state.project) return;
      state.project = {
        ...state.project,
        variables: state.project.variables.map(v =>
          v.id === action.payload.id
            ? { ...v, currentValue: action.payload.value }
            : v,
        ),
      };
    },

    /* ── API Endpoints ── */

    addApiEndpoint(state, action: PayloadAction<Omit<ApiEndpoint, 'id'>>) {
      if (!state.project) return;
      const api: ApiEndpoint = {
        ...action.payload,
        id: generateId('api'),
      };
      state.project = {
        ...state.project,
        apis: [...state.project.apis, api],
        updatedAt: Date.now(),
      };
      state.isDirty = true;
    },

    updateApiEndpoint(
      state,
      action: PayloadAction<{ id: string; updates: Partial<ApiEndpoint> }>,
    ) {
      if (!state.project) return;
      state.project = {
        ...state.project,
        apis: state.project.apis.map(a =>
          a.id === action.payload.id ? { ...a, ...action.payload.updates } : a,
        ),
        updatedAt: Date.now(),
      };
      state.isDirty = true;
    },

    removeApiEndpoint(state, action: PayloadAction<string>) {
      if (!state.project) return;
      state.project = {
        ...state.project,
        apis: state.project.apis.filter(a => a.id !== action.payload),
        updatedAt: Date.now(),
      };
      state.isDirty = true;
    },

    /* ── Assets ── */

    addAsset(state, action: PayloadAction<Omit<ProjectAsset, 'id'>>) {
      if (!state.project) return;
      const asset: ProjectAsset = {
        ...action.payload,
        id: generateId('asset'),
      };
      state.project = {
        ...state.project,
        assets: [...state.project.assets, asset],
        updatedAt: Date.now(),
      };
      state.isDirty = true;
    },

    removeAsset(state, action: PayloadAction<string>) {
      if (!state.project) return;
      state.project = {
        ...state.project,
        assets: state.project.assets.filter(a => a.id !== action.payload),
        updatedAt: Date.now(),
      };
      state.isDirty = true;
    },

    /* ── Custom Code ── */

    addCustomCode(state, action: PayloadAction<Omit<CustomCodeBlock, 'id'>>) {
      if (!state.project) return;
      const code: CustomCodeBlock = {
        ...action.payload,
        id: generateId('code'),
      };
      state.project = {
        ...state.project,
        customCode: [...state.project.customCode, code],
        updatedAt: Date.now(),
      };
      state.isDirty = true;
    },

    updateCustomCode(
      state,
      action: PayloadAction<{ id: string; updates: Partial<CustomCodeBlock> }>,
    ) {
      if (!state.project) return;
      state.project = {
        ...state.project,
        customCode: state.project.customCode.map(c =>
          c.id === action.payload.id ? { ...c, ...action.payload.updates } : c,
        ),
        updatedAt: Date.now(),
      };
      state.isDirty = true;
    },

    removeCustomCode(state, action: PayloadAction<string>) {
      if (!state.project) return;
      state.project = {
        ...state.project,
        customCode: state.project.customCode.filter(c => c.id !== action.payload),
        updatedAt: Date.now(),
      };
      state.isDirty = true;
    },

    /* ── Environments ── */

    addEnvironment(state, action: PayloadAction<Omit<EnvironmentConfig, 'id'>>) {
      if (!state.project) return;
      const env: EnvironmentConfig = {
        ...action.payload,
        id: generateId('env'),
      };
      state.project = {
        ...state.project,
        settings: {
          ...state.project.settings,
          environments: [...state.project.settings.environments, env],
        },
        updatedAt: Date.now(),
      };
      state.isDirty = true;
    },

    setActiveEnvironment(state, action: PayloadAction<string>) {
      if (!state.project) return;
      state.project = {
        ...state.project,
        settings: {
          ...state.project.settings,
          activeEnvironment: action.payload,
        },
        updatedAt: Date.now(),
      };
      state.isDirty = true;
    },

    /* ── Dependencies ── */

    setDependencies(state, action: PayloadAction<readonly ProjectDependency[]>) {
      if (!state.project) return;
      state.project = {
        ...state.project,
        dependencies: action.payload,
        updatedAt: Date.now(),
      };
    },

    /* ── Recent Projects ── */

    setRecentProjects(state, action: PayloadAction<readonly ProjectSummary[]>) {
      state.recentProjects = action.payload;
    },

    addToRecentProjects(state, action: PayloadAction<ProjectSummary>) {
      const filtered = state.recentProjects.filter(
        p => p.id !== action.payload.id,
      );
      state.recentProjects = [action.payload, ...filtered].slice(0, 10);
    },
  },
});

export const {
  createProject,
  loadProject,
  setLoading,
  setSaving,
  setError,
  markDirty,
  closeProject,
  updateSettings,
  updateTheme,
  resetTheme,
  addVariable,
  updateVariable,
  removeVariable,
  setVariableValue,
  addApiEndpoint,
  updateApiEndpoint,
  removeApiEndpoint,
  addAsset,
  removeAsset,
  addCustomCode,
  updateCustomCode,
  removeCustomCode,
  addEnvironment,
  setActiveEnvironment,
  setDependencies,
  setRecentProjects,
  addToRecentProjects,
} = projectSlice.actions;

export default projectSlice.reducer;

/* ──────────────────────────────────────────────
 * Selectors
 * ────────────────────────────────────────────── */

export const selectProject = (state: { project: ProjectState }) =>
  state.project.project;

export const selectProjectName = (state: { project: ProjectState }) =>
  state.project.project?.name ?? 'Untitled';

export const selectIsDirty = (state: { project: ProjectState }) =>
  state.project.isDirty;

export const selectVariables = (state: { project: ProjectState }) =>
  state.project.project?.variables ?? [];

export const selectApis = (state: { project: ProjectState }) =>
  state.project.project?.apis ?? [];

export const selectTheme = (state: { project: ProjectState }) =>
  state.project.project?.theme ?? DEFAULT_PROJECT_THEME;

export const selectSettings = (state: { project: ProjectState }) =>
  state.project.project?.settings ?? null;

export const selectEnvironments = (state: { project: ProjectState }) =>
  state.project.project?.settings.environments ?? [];

export const selectActiveEnvironment = (state: { project: ProjectState }) => {
  const settings = state.project.project?.settings;
  if (!settings) return null;
  return settings.environments.find(e => e.id === settings.activeEnvironment) ?? null;
};

export const selectAssets = (state: { project: ProjectState }) =>
  state.project.project?.assets ?? [];

export const selectCustomCode = (state: { project: ProjectState }) =>
  state.project.project?.customCode ?? [];

export const selectDependencies = (state: { project: ProjectState }) =>
  state.project.project?.dependencies ?? [];
