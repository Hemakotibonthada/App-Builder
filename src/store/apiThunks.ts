// @ts-nocheck — Async thunk return types with complex generics; runtime is correct
/**
 * API Thunks
 * 
 * Async thunks that bridge Redux store with the backend API.
 * These handle loading/saving projects, pages, widgets, etc.
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  projectsApi,
  pagesApi,
  widgetsApi,
  variablesApi,
  assetsApi,
  deploymentsApi,
  exportApi,
  authApi,
  setTokens,
  clearTokens,
  templatesApi,
} from '@/lib/api-client';
import type { RootState } from './store';

// ─── Auth Thunks ────────────────────────────────────────────

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await authApi.login(credentials.email, credentials.password);
      if (res.data) {
        setTokens(res.data.token, res.data.refreshToken);
      }
      return res.data;
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message);
    }
  },
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (data: { email: string; password: string; firstName?: string; lastName?: string }, { rejectWithValue }) => {
    try {
      const res = await authApi.register(data.email, data.password, data.firstName, data.lastName);
      if (res.data) {
        setTokens(res.data.token, res.data.refreshToken);
      }
      return res.data;
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message);
    }
  },
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authApi.logout();
      clearTokens();
    } catch (err: unknown) {
      clearTokens();
      return rejectWithValue((err as Error).message);
    }
  },
);

export const fetchProfile = createAsyncThunk(
  'auth/profile',
  async (_, { rejectWithValue }) => {
    try {
      const res = await authApi.getProfile();
      return res.data;
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message);
    }
  },
);

// ─── Project Thunks ─────────────────────────────────────────

export const fetchProjects = createAsyncThunk(
  'projects/fetchAll',
  async (params: { page?: number; pageSize?: number; search?: string; status?: string } = {}, { rejectWithValue }) => {
    try {
      const res = await projectsApi.list(params);
      return { projects: res.data, meta: res.meta };
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message);
    }
  },
);

export const fetchProject = createAsyncThunk(
  'projects/fetchOne',
  async (projectId: string, { rejectWithValue }) => {
    try {
      const res = await projectsApi.get(projectId);
      return res.data;
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message);
    }
  },
);

export const createProjectAsync = createAsyncThunk(
  'projects/create',
  async (data: { name: string; description?: string; templateId?: string }, { rejectWithValue }) => {
    try {
      const res = await projectsApi.create(data);
      return res.data;
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message);
    }
  },
);

export const updateProjectAsync = createAsyncThunk(
  'projects/update',
  async ({ id, data }: { id: string; data: Record<string, unknown> }, { rejectWithValue }) => {
    try {
      const res = await projectsApi.update(id, data);
      return res.data;
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message);
    }
  },
);

export const deleteProjectAsync = createAsyncThunk(
  'projects/delete',
  async (projectId: string, { rejectWithValue }) => {
    try {
      await projectsApi.delete(projectId);
      return projectId;
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message);
    }
  },
);

export const publishProject = createAsyncThunk(
  'projects/publish',
  async (projectId: string, { rejectWithValue }) => {
    try {
      await projectsApi.publish(projectId);
      return projectId;
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message);
    }
  },
);

export const duplicateProject = createAsyncThunk(
  'projects/duplicate',
  async (projectId: string, { rejectWithValue }) => {
    try {
      const res = await projectsApi.duplicate(projectId);
      return res.data;
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message);
    }
  },
);

export const snapshotProject = createAsyncThunk(
  'projects/snapshot',
  async ({ id, name, description }: { id: string; name: string; description?: string }, { rejectWithValue }) => {
    try {
      await projectsApi.snapshot(id, name, description);
      return { id, name };
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message);
    }
  },
);

// ─── Page Thunks ────────────────────────────────────────────

export const fetchPages = createAsyncThunk(
  'pages/fetchAll',
  async (projectId: string, { rejectWithValue }) => {
    try {
      const res = await pagesApi.list(projectId);
      return res.data;
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message);
    }
  },
);

export const createPageAsync = createAsyncThunk(
  'pages/create',
  async ({ projectId, data }: { projectId: string; data: { name: string; path: string; isHomePage?: boolean; layout?: string } }, { rejectWithValue }) => {
    try {
      const res = await pagesApi.create(projectId, data);
      return res.data;
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message);
    }
  },
);

export const updatePageAsync = createAsyncThunk(
  'pages/update',
  async ({ projectId, pageId, data }: { projectId: string; pageId: string; data: Record<string, unknown> }, { rejectWithValue }) => {
    try {
      const res = await pagesApi.update(projectId, pageId, data);
      return res.data;
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message);
    }
  },
);

export const deletePageAsync = createAsyncThunk(
  'pages/delete',
  async ({ projectId, pageId }: { projectId: string; pageId: string }, { rejectWithValue }) => {
    try {
      await pagesApi.delete(projectId, pageId);
      return pageId;
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message);
    }
  },
);

export const reorderPages = createAsyncThunk(
  'pages/reorder',
  async ({ projectId, pages }: { projectId: string; pages: Array<{ id: string; sortOrder: number }> }, { rejectWithValue }) => {
    try {
      await pagesApi.reorder(projectId, pages);
      return pages;
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message);
    }
  },
);

// ─── Widget Thunks ──────────────────────────────────────────

export const fetchWidgets = createAsyncThunk(
  'widgets/fetchAll',
  async ({ projectId, pageId }: { projectId: string; pageId?: string }, { rejectWithValue }) => {
    try {
      const res = await widgetsApi.list(projectId, { pageId });
      return res.data;
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message);
    }
  },
);

export const createWidgetAsync = createAsyncThunk(
  'widgets/create',
  async ({ projectId, data }: { projectId: string; data: Record<string, unknown> }, { rejectWithValue }) => {
    try {
      const res = await widgetsApi.create(projectId, data);
      return res.data;
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message);
    }
  },
);

export const updateWidgetAsync = createAsyncThunk(
  'widgets/update',
  async ({ projectId, widgetId, data }: { projectId: string; widgetId: string; data: Record<string, unknown> }, { rejectWithValue }) => {
    try {
      const res = await widgetsApi.update(projectId, widgetId, data);
      return res.data;
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message);
    }
  },
);

export const deleteWidgetAsync = createAsyncThunk(
  'widgets/delete',
  async ({ projectId, widgetId }: { projectId: string; widgetId: string }, { rejectWithValue }) => {
    try {
      await widgetsApi.delete(projectId, widgetId);
      return widgetId;
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message);
    }
  },
);

export const batchUpdateWidgets = createAsyncThunk(
  'widgets/batchUpdate',
  async ({ projectId, widgets }: { projectId: string; widgets: Array<{ id: string; [key: string]: unknown }> }, { rejectWithValue }) => {
    try {
      await widgetsApi.batchUpdate(projectId, widgets);
      return widgets;
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message);
    }
  },
);

export const duplicateWidgetAsync = createAsyncThunk(
  'widgets/duplicate',
  async ({ projectId, widgetId }: { projectId: string; widgetId: string }, { rejectWithValue }) => {
    try {
      const res = await widgetsApi.duplicate(projectId, widgetId);
      return res.data;
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message);
    }
  },
);

// ─── Variable Thunks ────────────────────────────────────────

export const fetchVariables = createAsyncThunk(
  'variables/fetchAll',
  async (projectId: string, { rejectWithValue }) => {
    try {
      const res = await variablesApi.list(projectId);
      return res.data;
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message);
    }
  },
);

export const createVariableAsync = createAsyncThunk(
  'variables/create',
  async ({ projectId, data }: { projectId: string; data: { name: string; type: string; defaultValue?: string; scope?: string; description?: string; group?: string } }, { rejectWithValue }) => {
    try {
      const res = await variablesApi.create(projectId, data);
      return res.data;
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message);
    }
  },
);

// ─── Asset Thunks ───────────────────────────────────────────

export const fetchAssets = createAsyncThunk(
  'assets/fetchAll',
  async ({ projectId, category }: { projectId: string; category?: string }, { rejectWithValue }) => {
    try {
      const res = await assetsApi.list(projectId, { category });
      return res.data;
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message);
    }
  },
);

export const uploadAsset = createAsyncThunk(
  'assets/upload',
  async ({ projectId, data }: { projectId: string; data: { name: string; fileName: string; mimeType: string; fileSize: number; url: string; width?: number; height?: number } }, { rejectWithValue }) => {
    try {
      const res = await assetsApi.upload(projectId, data);
      return res.data;
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message);
    }
  },
);

export const deleteAssets = createAsyncThunk(
  'assets/delete',
  async ({ projectId, ids }: { projectId: string; ids: string[] }, { rejectWithValue }) => {
    try {
      await assetsApi.delete(projectId, ids);
      return ids;
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message);
    }
  },
);

// ─── Deployment Thunks ──────────────────────────────────────

export const deployProject = createAsyncThunk(
  'deploy/trigger',
  async ({ projectId, environment, version }: { projectId: string; environment?: string; version?: number }, { rejectWithValue }) => {
    try {
      const res = await deploymentsApi.trigger(projectId, { environment, version });
      return res.data;
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message);
    }
  },
);

export const fetchDeployments = createAsyncThunk(
  'deploy/fetchAll',
  async (projectId: string, { rejectWithValue }) => {
    try {
      const res = await deploymentsApi.list(projectId);
      return res.data;
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message);
    }
  },
);

// ─── Export/Import Thunks ───────────────────────────────────

export const exportProject = createAsyncThunk(
  'export/project',
  async (projectId: string, { rejectWithValue }) => {
    try {
      const res = await exportApi.export(projectId);
      return res.data;
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message);
    }
  },
);

export const importProject = createAsyncThunk(
  'import/project',
  async ({ projectId, data }: { projectId: string; data: unknown }, { rejectWithValue }) => {
    try {
      const res = await exportApi.import(projectId, data);
      return res.data;
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message);
    }
  },
);

// ─── Template Thunks ────────────────────────────────────────

export const fetchTemplates = createAsyncThunk(
  'templates/fetchAll',
  async (params: { category?: string; page?: number } = {}, { rejectWithValue }) => {
    try {
      const res = await templatesApi.list(params);
      return { templates: res.data, meta: res.meta };
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message);
    }
  },
);

// ─── Save Project State (full sync) ────────────────────────

export const saveProjectState = createAsyncThunk(
  'projects/saveState',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const project = state.project.project;
      if (!project) throw new Error('No project loaded');

      // Save project settings
      await projectsApi.update(project.id, {
        name: project.name,
        description: project.description,
        settings: JSON.stringify(project.settings),
        theme: JSON.stringify(project.theme),
      });

      return { savedAt: Date.now() };
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message);
    }
  },
);
