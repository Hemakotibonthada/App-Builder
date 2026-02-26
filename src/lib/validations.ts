/**
 * Zod Validation Schemas
 * 
 * Comprehensive validation schemas for all API request bodies,
 * query parameters, and data models in the AppBuilder application.
 */

import { z } from 'zod';

// ─── Common Schemas ─────────────────────────────────────────

export const uuidSchema = z.string().uuid();
export const slugSchema = z.string().min(1).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format');
export const emailSchema = z.string().email().max(255);
export const passwordSchema = z.string().min(8).max(128);
export const urlSchema = z.string().url().max(2048).optional();
export const colorSchema = z.string().regex(/^#[0-9a-fA-F]{3,8}$/).optional();
export const jsonStringSchema = z.string().refine(
  (val) => { try { JSON.parse(val); return true; } catch { return false; } },
  'Must be valid JSON',
);

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().max(200).optional(),
});

// ─── Auth Schemas ───────────────────────────────────────────

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  avatarUrl: urlSchema,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordSchema,
});

export const createApiKeySchema = z.object({
  name: z.string().min(1).max(100),
  permissions: z.array(z.string()).default(['read']),
  expiresAt: z.string().datetime().optional(),
});

// ─── Project Schemas ────────────────────────────────────────

export const createProjectSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  isTemplate: z.boolean().default(false),
  templateId: z.string().uuid().optional(), // Clone from template
  settings: z.record(z.unknown()).optional(),
  theme: z.record(z.unknown()).optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  isPublished: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  settings: z.record(z.unknown()).optional(),
  theme: z.record(z.unknown()).optional(),
  customCode: z.record(z.unknown()).optional(),
  seoDefaults: z.record(z.unknown()).optional(),
  buildConfig: z.record(z.unknown()).optional(),
});

export const cloneProjectSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
});

// ─── Page Schemas ───────────────────────────────────────────

export const createPageSchema = z.object({
  name: z.string().min(1).max(100),
  path: z.string().min(1).max(500).regex(/^\//, 'Path must start with /'),
  title: z.string().max(200).optional(),
  description: z.string().max(1000).optional(),
  ogImage: urlSchema,
  isHomePage: z.boolean().default(false),
  layout: z.string().max(50).default('default'),
  customCSS: z.string().max(50000).optional(),
  customJS: z.string().max(50000).optional(),
});

export const updatePageSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  path: z.string().min(1).max(500).regex(/^\//, 'Path must start with /').optional(),
  title: z.string().max(200).optional(),
  description: z.string().max(1000).optional(),
  ogImage: urlSchema,
  isHomePage: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  layout: z.string().max(50).optional(),
  meta: z.record(z.unknown()).optional(),
  customCSS: z.string().max(50000).optional(),
  customJS: z.string().max(50000).optional(),
});

export const reorderPagesSchema = z.object({
  pages: z.array(z.object({
    id: uuidSchema,
    sortOrder: z.number().int(),
  })),
});

// ─── Widget Schemas ─────────────────────────────────────────

export const widgetTypeEnum = z.string().min(1).max(50); // flexible for extensibility

export const createWidgetSchema = z.object({
  pageId: uuidSchema.optional(),
  parentId: uuidSchema.optional().nullable(),
  name: z.string().min(1).max(100),
  type: widgetTypeEnum,
  props: z.record(z.unknown()).default({}),
  style: z.record(z.unknown()).default({}),
  responsive: z.record(z.unknown()).default({}),
  events: z.array(z.unknown()).default([]),
  bindings: z.array(z.unknown()).default([]),
  animations: z.array(z.unknown()).default([]),
  conditions: z.record(z.unknown()).default({}),
  accessibility: z.record(z.unknown()).default({}),
  sortOrder: z.number().int().default(0),
});

export const updateWidgetSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  parentId: uuidSchema.optional().nullable(),
  pageId: uuidSchema.optional().nullable(),
  props: z.record(z.unknown()).optional(),
  style: z.record(z.unknown()).optional(),
  responsive: z.record(z.unknown()).optional(),
  events: z.array(z.unknown()).optional(),
  bindings: z.array(z.unknown()).optional(),
  animations: z.array(z.unknown()).optional(),
  conditions: z.record(z.unknown()).optional(),
  accessibility: z.record(z.unknown()).optional(),
  locked: z.boolean().optional(),
  hidden: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const batchUpdateWidgetsSchema = z.object({
  widgets: z.array(z.object({
    id: uuidSchema,
    data: updateWidgetSchema,
  })),
});

export const moveWidgetSchema = z.object({
  parentId: uuidSchema.optional().nullable(),
  pageId: uuidSchema.optional().nullable(),
  sortOrder: z.number().int(),
});

export const duplicateWidgetSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  pageId: uuidSchema.optional(),
});

// ─── Asset Schemas ──────────────────────────────────────────

export const createAssetSchema = z.object({
  name: z.string().min(1).max(200),
  fileName: z.string().min(1).max(500),
  mimeType: z.string().min(1).max(100),
  fileSize: z.number().int().positive(),
  url: z.string().min(1).max(2048),
  thumbnailUrl: urlSchema,
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  alt: z.string().max(500).optional(),
  category: z.enum(['image', 'font', 'icon', 'video', 'document', 'general']).default('general'),
  tags: z.array(z.string()).default([]),
  isGlobal: z.boolean().default(false),
});

export const updateAssetSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  alt: z.string().max(500).optional(),
  category: z.enum(['image', 'font', 'icon', 'video', 'document', 'general']).optional(),
  tags: z.array(z.string()).optional(),
});

// ─── Variable Schemas ───────────────────────────────────────

export const createVariableSchema = z.object({
  name: z.string().min(1).max(100).regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, 'Invalid variable name'),
  type: z.enum(['string', 'number', 'boolean', 'object', 'array', 'color', 'url']),
  defaultValue: z.string().optional(),
  currentValue: z.string().optional(),
  scope: z.enum(['global', 'page', 'component']).default('global'),
  isComputed: z.boolean().default(false),
  expression: z.string().max(5000).optional(),
  description: z.string().max(500).optional(),
  group: z.string().max(50).optional(),
});

export const updateVariableSchema = createVariableSchema.partial();

// ─── API Endpoint Schemas ───────────────────────────────────

export const createApiEndpointSchema = z.object({
  name: z.string().min(1).max(100),
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).default('GET'),
  url: z.string().min(1).max(2048),
  headers: z.record(z.string()).default({}),
  queryParams: z.record(z.string()).default({}),
  body: z.string().max(50000).optional(),
  authType: z.enum(['none', 'bearer', 'apiKey', 'basic', 'oauth2']).default('none'),
  authConfig: z.record(z.unknown()).default({}),
  transform: z.string().max(5000).optional(),
  cacheTime: z.number().int().min(0).default(0),
  retryCount: z.number().int().min(0).max(5).default(0),
  timeout: z.number().int().min(1000).max(120000).default(30000),
});

export const updateApiEndpointSchema = createApiEndpointSchema.partial().extend({
  isActive: z.boolean().optional(),
});

// ─── Data Model Schemas ─────────────────────────────────────

export const fieldDefinitionSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['string', 'number', 'boolean', 'date', 'datetime', 'email', 'url', 'json', 'richtext', 'file', 'relation']),
  label: z.string().max(200).optional(),
  required: z.boolean().default(false),
  unique: z.boolean().default(false),
  defaultValue: z.unknown().optional(),
  validation: z.record(z.unknown()).optional(),
  options: z.array(z.unknown()).optional(), // For enum/select types
  relationTo: z.string().optional(), // For relation type
});

export const createDataModelSchema = z.object({
  name: z.string().min(1).max(100).regex(/^[A-Z][a-zA-Z0-9]*$/, 'Model name must start with uppercase'),
  description: z.string().max(500).optional(),
  fields: z.array(fieldDefinitionSchema).min(1),
  validations: z.array(z.unknown()).default([]),
  indexes: z.array(z.unknown()).default([]),
  relations: z.array(z.unknown()).default([]),
});

export const updateDataModelSchema = createDataModelSchema.partial();

export const createDataRecordSchema = z.object({
  data: z.record(z.unknown()),
});

export const updateDataRecordSchema = z.object({
  data: z.record(z.unknown()).optional(),
  status: z.enum(['active', 'archived', 'deleted']).optional(),
});

// ─── Template Schemas ───────────────────────────────────────

export const createTemplateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  category: z.enum(['landing', 'portfolio', 'ecommerce', 'blog', 'dashboard', 'form', 'general']).default('general'),
  tags: z.array(z.string()).default([]),
  thumbnailUrl: urlSchema,
  previewUrl: urlSchema,
  data: z.record(z.unknown()), // Full template data
  isOfficial: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
});

export const updateTemplateSchema = createTemplateSchema.partial();

// ─── Deployment Schemas ─────────────────────────────────────

export const createDeploymentSchema = z.object({
  environment: z.enum(['staging', 'production', 'preview']).default('production'),
  config: z.record(z.unknown()).default({}),
});

// ─── Collaboration Schemas ──────────────────────────────────

export const inviteCollaboratorSchema = z.object({
  email: emailSchema,
  role: z.enum(['admin', 'editor', 'viewer']).default('editor'),
  permissions: z.array(z.string()).default([]),
});

export const updateCollaboratorSchema = z.object({
  role: z.enum(['admin', 'editor', 'viewer']).optional(),
  permissions: z.array(z.string()).optional(),
});

// ─── Comment Schemas ────────────────────────────────────────

export const createCommentSchema = z.object({
  content: z.string().min(1).max(5000),
  parentId: uuidSchema.optional(),
  widgetId: z.string().max(100).optional(),
  pageId: uuidSchema.optional(),
  position: z.object({ x: z.number(), y: z.number() }).optional(),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1).max(5000).optional(),
  resolved: z.boolean().optional(),
});

// ─── Automation Schemas ─────────────────────────────────────

export const createAutomationSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  trigger: z.object({
    type: z.enum(['schedule', 'event', 'webhook']),
    config: z.record(z.unknown()),
  }),
  actions: z.array(z.object({
    type: z.string(),
    config: z.record(z.unknown()),
  })),
  conditions: z.array(z.unknown()).default([]),
  isActive: z.boolean().default(true),
});

export const updateAutomationSchema = createAutomationSchema.partial();

// ─── Webhook Schemas ────────────────────────────────────────

export const createWebhookSchema = z.object({
  name: z.string().min(1).max(200),
  url: z.string().url().max(2048),
  secret: z.string().max(256).optional(),
  events: z.array(z.string()).min(1),
  headers: z.record(z.string()).default({}),
  isActive: z.boolean().default(true),
});

export const updateWebhookSchema = createWebhookSchema.partial();

// ─── A/B Test Schemas ───────────────────────────────────────

export const createABTestSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  widgetId: z.string().min(1),
  variants: z.array(z.object({
    id: z.string(),
    name: z.string(),
    weight: z.number().min(0).max(100),
    config: z.record(z.unknown()),
  })).min(2),
  goalType: z.enum(['click', 'conversion', 'engagement', 'time']).default('click'),
  goalConfig: z.record(z.unknown()).default({}),
});

export const updateABTestSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  status: z.enum(['draft', 'running', 'paused', 'completed']).optional(),
  traffic: z.record(z.unknown()).optional(),
});

// ─── Analytics Schemas ──────────────────────────────────────

export const trackEventSchema = z.object({
  sessionId: z.string().min(1),
  eventType: z.enum(['pageview', 'click', 'scroll', 'form_submit', 'custom']),
  eventName: z.string().max(200).optional(),
  pageUrl: z.string().max(2048).optional(),
  widgetId: z.string().max(100).optional(),
  data: z.record(z.unknown()).default({}),
  referrer: z.string().max(2048).optional(),
  duration: z.number().int().min(0).optional(),
});

// ─── Full Project Import/Export Schema ──────────────────────

export const importProjectSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  data: z.object({
    pages: z.array(z.unknown()),
    widgets: z.array(z.unknown()),
    variables: z.array(z.unknown()).optional(),
    apiEndpoints: z.array(z.unknown()).optional(),
    dataModels: z.array(z.unknown()).optional(),
    assets: z.array(z.unknown()).optional(),
    settings: z.record(z.unknown()).optional(),
    theme: z.record(z.unknown()).optional(),
    customCode: z.record(z.unknown()).optional(),
  }),
});

// ─── Form Submission Schemas ────────────────────────────────

export const submitFormSchema = z.object({
  formId: z.string().min(1),
  data: z.record(z.unknown()),
});

export const updateFormSubmissionSchema = z.object({
  status: z.enum(['new', 'read', 'archived', 'spam']),
});

// ─── Plugin Schemas ─────────────────────────────────────────

export const installPluginSchema = z.object({
  pluginId: uuidSchema,
  config: z.record(z.unknown()).default({}),
});

export const updatePluginConfigSchema = z.object({
  config: z.record(z.unknown()),
  isActive: z.boolean().optional(),
});

// ─── Type exports ───────────────────────────────────────────

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type CreatePageInput = z.infer<typeof createPageSchema>;
export type UpdatePageInput = z.infer<typeof updatePageSchema>;
export type CreateWidgetInput = z.infer<typeof createWidgetSchema>;
export type UpdateWidgetInput = z.infer<typeof updateWidgetSchema>;
export type CreateAssetInput = z.infer<typeof createAssetSchema>;
export type CreateVariableInput = z.infer<typeof createVariableSchema>;
export type CreateApiEndpointInput = z.infer<typeof createApiEndpointSchema>;
export type CreateDataModelInput = z.infer<typeof createDataModelSchema>;
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type CreateDeploymentInput = z.infer<typeof createDeploymentSchema>;
export type InviteCollaboratorInput = z.infer<typeof inviteCollaboratorSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type CreateAutomationInput = z.infer<typeof createAutomationSchema>;
export type CreateWebhookInput = z.infer<typeof createWebhookSchema>;
export type CreateABTestInput = z.infer<typeof createABTestSchema>;
export type TrackEventInput = z.infer<typeof trackEventSchema>;
export type ImportProjectInput = z.infer<typeof importProjectSchema>;
