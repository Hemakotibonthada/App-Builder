/**
 * Client-Side API Client
 * 
 * Type-safe fetch wrapper for all AppBuilder API endpoints.
 * Handles authentication tokens, error handling, pagination, and retries.
 */

// ─── Types ──────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;
  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

// ─── Token Management ───────────────────────────────────────

const TOKEN_KEY = 'appbuilder_token';
const REFRESH_KEY = 'appbuilder_refresh_token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setTokens(token: string, refreshToken?: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function clearTokens() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_KEY);
}

// ─── Base Fetch ─────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

async function baseFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle 401 — try token refresh once
  if (response.status === 401 && !endpoint.includes('/auth')) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${getToken()}`;
      const retryResponse = await fetch(url, { ...options, headers });
      return processResponse<T>(retryResponse);
    }
    clearTokens();
    window.dispatchEvent(new Event('auth:logout'));
  }

  return processResponse<T>(response);
}

async function processResponse<T>(response: Response): Promise<ApiResponse<T>> {
  if (response.status === 204) {
    return { success: true };
  }

  const body: ApiResponse<T> = await response.json();

  if (!response.ok) {
    throw new ApiError(
      body.error || `Request failed (${response.status})`,
      response.status,
      body.errors,
    );
  }

  return body;
}

async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${BASE_URL}/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'refresh', refreshToken }),
    });

    if (!response.ok) return false;

    const body: ApiResponse<{ token: string; refreshToken: string }> = await response.json();
    if (body.success && body.data) {
      setTokens(body.data.token, body.data.refreshToken);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// ─── Convenience Methods ────────────────────────────────────

function buildQuery(params?: Record<string, string | number | boolean | undefined>): string {
  if (!params) return '';
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== '');
  if (entries.length === 0) return '';
  return '?' + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString();
}

async function get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<ApiResponse<T>> {
  return baseFetch<T>(endpoint + buildQuery(params), { method: 'GET' });
}

async function post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
  return baseFetch<T>(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

async function put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
  return baseFetch<T>(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

async function patch<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
  return baseFetch<T>(endpoint, {
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  });
}

async function del<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
  return baseFetch<T>(endpoint, {
    method: 'DELETE',
    body: data ? JSON.stringify(data) : undefined,
  });
}

// ─── Auth API ───────────────────────────────────────────────

export const authApi = {
  register(email: string, password: string, firstName?: string, lastName?: string) {
    return post<{ user: unknown; token: string; refreshToken: string }>(
      '/auth',
      { action: 'register', email, password, firstName, lastName },
    );
  },
  login(email: string, password: string) {
    return post<{ user: unknown; token: string; refreshToken: string }>(
      '/auth',
      { action: 'login', email, password },
    );
  },
  logout() {
    return post('/auth', { action: 'logout' });
  },
  getProfile() {
    return get<{ id: string; email: string; firstName?: string; lastName?: string; role: string }>('/auth');
  },
  updateProfile(data: { firstName?: string; lastName?: string; avatarUrl?: string }) {
    return put('/auth', data);
  },
  changePassword(currentPassword: string, newPassword: string) {
    return post('/auth', { action: 'password', currentPassword, newPassword });
  },
};

// ─── Projects API ───────────────────────────────────────────

export const projectsApi = {
  list(params?: PaginationParams & { status?: string }) {
    return get<unknown[]>('/projects', params as Record<string, string | number>);
  },
  create(data: { name: string; description?: string; templateId?: string }) {
    return post<unknown>('/projects', data);
  },
  get(id: string) {
    return get<unknown>(`/projects/${id}`);
  },
  update(id: string, data: Record<string, unknown>) {
    return put<unknown>(`/projects/${id}`, data);
  },
  delete(id: string) {
    return del(`/projects/${id}`);
  },
  publish(id: string) {
    return patch(`/projects/${id}`, { action: 'publish' });
  },
  unpublish(id: string) {
    return patch(`/projects/${id}`, { action: 'unpublish' });
  },
  archive(id: string) {
    return patch(`/projects/${id}`, { action: 'archive' });
  },
  duplicate(id: string) {
    return patch<unknown>(`/projects/${id}`, { action: 'duplicate' });
  },
  snapshot(id: string, name: string, description?: string) {
    return patch(`/projects/${id}`, { action: 'snapshot', name, description });
  },
};

// ─── Pages API ──────────────────────────────────────────────

export const pagesApi = {
  list(projectId: string) {
    return get<unknown[]>(`/projects/${projectId}/pages`);
  },
  create(projectId: string, data: { name: string; path: string; isHomePage?: boolean; layout?: string }) {
    return post<unknown>(`/projects/${projectId}/pages`, data);
  },
  get(projectId: string, pageId: string) {
    return get<unknown>(`/projects/${projectId}/pages/${pageId}`);
  },
  update(projectId: string, pageId: string, data: Record<string, unknown>) {
    return put<unknown>(`/projects/${projectId}/pages/${pageId}`, data);
  },
  delete(projectId: string, pageId: string) {
    return del(`/projects/${projectId}/pages/${pageId}`);
  },
  reorder(projectId: string, pages: Array<{ id: string; sortOrder: number }>) {
    return put(`/projects/${projectId}/pages`, { pages });
  },
};

// ─── Widgets API ────────────────────────────────────────────

export const widgetsApi = {
  list(projectId: string, params?: { pageId?: string; type?: string; parentId?: string }) {
    return get<unknown[]>(`/projects/${projectId}/widgets`, params);
  },
  create(projectId: string, data: Record<string, unknown>) {
    return post<unknown>(`/projects/${projectId}/widgets`, data);
  },
  get(projectId: string, widgetId: string) {
    return get<unknown>(`/projects/${projectId}/widgets/${widgetId}`);
  },
  update(projectId: string, widgetId: string, data: Record<string, unknown>) {
    return put<unknown>(`/projects/${projectId}/widgets/${widgetId}`, data);
  },
  delete(projectId: string, widgetId: string) {
    return del(`/projects/${projectId}/widgets/${widgetId}`);
  },
  batchUpdate(projectId: string, widgets: Array<{ id: string; [key: string]: unknown }>) {
    return put(`/projects/${projectId}/widgets`, { widgets });
  },
  batchDelete(projectId: string, ids: string[]) {
    return del(`/projects/${projectId}/widgets`, { ids });
  },
  move(projectId: string, widgetId: string, parentId: string | null, sortOrder?: number) {
    return patch(`/projects/${projectId}/widgets/${widgetId}`, {
      action: 'move', parentId, sortOrder,
    });
  },
  duplicate(projectId: string, widgetId: string) {
    return patch<unknown>(`/projects/${projectId}/widgets/${widgetId}`, { action: 'duplicate' });
  },
  lock(projectId: string, widgetId: string) {
    return patch(`/projects/${projectId}/widgets/${widgetId}`, { action: 'lock' });
  },
  unlock(projectId: string, widgetId: string) {
    return patch(`/projects/${projectId}/widgets/${widgetId}`, { action: 'unlock' });
  },
};

// ─── Assets API ─────────────────────────────────────────────

export const assetsApi = {
  list(projectId: string, params?: PaginationParams & { category?: string }) {
    return get<unknown[]>(`/projects/${projectId}/assets`, params as Record<string, string | number>);
  },
  upload(projectId: string, data: { name: string; fileName: string; mimeType: string; fileSize: number; url: string; width?: number; height?: number; alt?: string; category?: string }) {
    return post<unknown>(`/projects/${projectId}/assets`, data);
  },
  delete(projectId: string, ids: string[]) {
    return del(`/projects/${projectId}/assets`, { ids });
  },
};

// ─── Variables API ──────────────────────────────────────────

export const variablesApi = {
  list(projectId: string) {
    return get<unknown[]>(`/projects/${projectId}/variables`);
  },
  create(projectId: string, data: { name: string; type: string; defaultValue?: string; scope?: string; description?: string; group?: string }) {
    return post<unknown>(`/projects/${projectId}/variables`, data);
  },
  batchUpdate(projectId: string, variables: Array<{ id: string; currentValue: string }>) {
    return put(`/projects/${projectId}/variables`, { variables });
  },
};

// ─── Data Models API ────────────────────────────────────────

export const dataModelsApi = {
  list(projectId: string) {
    return get<unknown[]>(`/projects/${projectId}/data-models`);
  },
  create(projectId: string, data: { name: string; description?: string; fields: unknown[] }) {
    return post<unknown>(`/projects/${projectId}/data-models`, data);
  },
  records: {
    list(projectId: string, modelId: string, params?: PaginationParams & { status?: string }) {
      return get<unknown[]>(`/projects/${projectId}/data-models/${modelId}/records`, params as Record<string, string | number>);
    },
    create(projectId: string, modelId: string, data: Record<string, unknown>) {
      return post<unknown>(`/projects/${projectId}/data-models/${modelId}/records`, { data });
    },
    update(projectId: string, modelId: string, recordId: string, data: Record<string, unknown>) {
      return put<unknown>(`/projects/${projectId}/data-models/${modelId}/records`, { id: recordId, data });
    },
    delete(projectId: string, modelId: string, ids: string[]) {
      return del(`/projects/${projectId}/data-models/${modelId}/records`, { ids });
    },
  },
};

// ─── Deployments API ────────────────────────────────────────

export const deploymentsApi = {
  list(projectId: string) {
    return get<unknown[]>(`/projects/${projectId}/deploy`);
  },
  trigger(projectId: string, data: { environment?: string; version?: number }) {
    return post<unknown>(`/projects/${projectId}/deploy`, data);
  },
};

// ─── Export / Import API ────────────────────────────────────

export const exportApi = {
  export(projectId: string) {
    return post<unknown>(`/projects/${projectId}/export`);
  },
  import(projectId: string, data: unknown) {
    return put<unknown>(`/projects/${projectId}/export`, data);
  },
};

// ─── Collaborators API ──────────────────────────────────────

export const collaboratorsApi = {
  list(projectId: string) {
    return get<unknown[]>(`/projects/${projectId}/collaborators`);
  },
  invite(projectId: string, email: string, role?: string) {
    return post<unknown>(`/projects/${projectId}/collaborators`, { email, role });
  },
  remove(projectId: string, collaboratorId: string) {
    return del(`/projects/${projectId}/collaborators`, { id: collaboratorId });
  },
};

// ─── Comments API ───────────────────────────────────────────

export const commentsApi = {
  list(projectId: string, params?: { pageId?: string; widgetId?: string; resolved?: boolean }) {
    return get<unknown[]>(`/projects/${projectId}/comments`, params as Record<string, string | boolean>);
  },
  create(projectId: string, data: { content: string; pageId?: string; widgetId?: string; parentId?: string; position?: { x: number; y: number } }) {
    return post<unknown>(`/projects/${projectId}/comments`, data);
  },
  update(projectId: string, commentId: string, data: { content?: string; resolved?: boolean }) {
    return put(`/projects/${projectId}/comments`, { id: commentId, ...data });
  },
  delete(projectId: string, commentId: string) {
    return del(`/projects/${projectId}/comments`, { id: commentId });
  },
};

// ─── Templates API ──────────────────────────────────────────

export const templatesApi = {
  list(params?: PaginationParams & { category?: string; official?: boolean; featured?: boolean }) {
    return get<unknown[]>('/templates', params as Record<string, string | number | boolean>);
  },
  create(data: { name: string; description?: string; category?: string; data: unknown }) {
    return post<unknown>('/templates', data);
  },
};

// ─── Plugins API ────────────────────────────────────────────

export const pluginsApi = {
  list(params?: PaginationParams & { category?: string }) {
    return get<unknown[]>('/plugins', params as Record<string, string | number>);
  },
  install(projectId: string, pluginId: string, config?: Record<string, unknown>) {
    return post<unknown>('/plugins', { projectId, pluginId, config });
  },
};

// ─── Analytics API ──────────────────────────────────────────

export const analyticsApi = {
  get(projectId: string, params?: { startDate?: string; endDate?: string; period?: string }) {
    return get<unknown>(`/projects/${projectId}/analytics`, params);
  },
  track(projectId: string, event: { eventType: string; eventName?: string; pageUrl?: string; widgetId?: string; data?: Record<string, unknown> }) {
    return post(`/projects/${projectId}/analytics`, event);
  },
};

// ─── Automations API ────────────────────────────────────────

export const automationsApi = {
  list(projectId: string) {
    return get<unknown[]>(`/projects/${projectId}/automations`);
  },
  create(projectId: string, data: { name: string; description?: string; trigger: unknown; actions: unknown[]; conditions?: unknown[]; isActive?: boolean }) {
    return post<unknown>(`/projects/${projectId}/automations`, data);
  },
  update(projectId: string, automationId: string, data: Record<string, unknown>) {
    return put<unknown>(`/projects/${projectId}/automations`, { id: automationId, ...data });
  },
  delete(projectId: string, automationId: string) {
    return del(`/projects/${projectId}/automations`, { id: automationId });
  },
  run(projectId: string, automationId: string) {
    return patch<{ run: boolean; results: unknown[] }>(`/projects/${projectId}/automations`, { id: automationId, action: 'run' });
  },
  enable(projectId: string, automationId: string) {
    return patch(`/projects/${projectId}/automations`, { id: automationId, action: 'enable' });
  },
  disable(projectId: string, automationId: string) {
    return patch(`/projects/${projectId}/automations`, { id: automationId, action: 'disable' });
  },
};

// ─── Health API ─────────────────────────────────────────────

export const healthApi = {
  check() {
    return get<{ status: string; uptime: number; database: string }>('/health');
  },
};

// ─── Unified API Client ────────────────────────────────────

const api = {
  auth: authApi,
  projects: projectsApi,
  pages: pagesApi,
  widgets: widgetsApi,
  assets: assetsApi,
  variables: variablesApi,
  dataModels: dataModelsApi,
  deployments: deploymentsApi,
  export: exportApi,
  collaborators: collaboratorsApi,
  comments: commentsApi,
  templates: templatesApi,
  plugins: pluginsApi,
  analytics: analyticsApi,
  automations: automationsApi,
  health: healthApi,
};

export default api;
