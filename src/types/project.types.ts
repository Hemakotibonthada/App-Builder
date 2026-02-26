/**
 * Project Type Definitions
 * 
 * All types related to the project model — the saved state of
 * an application being built, including settings, variables, 
 * API configurations, and more.
 */

import { AppPage } from './canvas.types';
import { WidgetConfig } from './widget.types';

/* ──────────────────────────────────────────────
 * Project Model
 * ────────────────────────────────────────────── */

/** The top-level project model saved/loaded from storage */
export interface Project {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly version: string;
  readonly createdAt: number;
  readonly updatedAt: number;
  readonly createdBy: string;
  readonly lastModifiedBy: string;

  /** All pages in the project */
  readonly pages: readonly AppPage[];

  /** All widget instances, keyed by ID */
  readonly widgets: Record<string, WidgetConfig>;

  /** Global variables store */
  readonly variables: readonly ProjectVariable[];

  /** API endpoint configurations */
  readonly apis: readonly ApiEndpoint[];

  /** Project-level settings */
  readonly settings: ProjectSettings;

  /** Global theme overrides */
  readonly theme: ProjectTheme;

  /** Custom assets uploaded to the project */
  readonly assets: readonly ProjectAsset[];

  /** Custom code snippets / functions */
  readonly customCode: readonly CustomCodeBlock[];

  /** Dependency snapshot */
  readonly dependencies: readonly ProjectDependency[];

  /** Collaboration state */
  readonly collaborators: readonly Collaborator[];
}

/* ──────────────────────────────────────────────
 * Project Settings
 * ────────────────────────────────────────────── */

export interface ProjectSettings {
  /** Target platforms */
  readonly platforms: readonly TargetPlatform[];

  /** Default language */
  readonly language: string;

  /** Supported locales */
  readonly locales: readonly string[];

  /** App icon URL */
  readonly appIcon: string;

  /** Splash screen config */
  readonly splashScreen: SplashScreenConfig;

  /** Bundle identifiers */
  readonly bundleId: BundleIdConfig;

  /** Version info */
  readonly versionCode: number;
  readonly versionName: string;

  /** Environment variables */
  readonly environments: readonly EnvironmentConfig[];

  /** Active environment */
  readonly activeEnvironment: string;

  /** SEO defaults */
  readonly seo: SEOConfig;

  /** Analytics integration */
  readonly analytics: AnalyticsConfig;

  /** Auth provider config */
  readonly auth: AuthConfig;
}

export enum TargetPlatform {
  Web = 'web',
  Android = 'android',
  IOS = 'ios',
  PWA = 'pwa',
  Desktop = 'desktop',
}

export interface SplashScreenConfig {
  readonly enabled: boolean;
  readonly backgroundColor: string;
  readonly logoUrl: string;
  readonly duration: number; // ms
  readonly animation: 'fade' | 'scale' | 'slide' | 'none';
}

export interface BundleIdConfig {
  readonly android: string; // e.g. "com.example.myapp"
  readonly ios: string;
  readonly web: string; // domain
}

export interface EnvironmentConfig {
  readonly id: string;
  readonly name: string;
  readonly variables: Record<string, string>;
  readonly apiBaseUrl: string;
  readonly isProduction: boolean;
}

export interface SEOConfig {
  readonly defaultTitle: string;
  readonly titleTemplate: string;
  readonly defaultDescription: string;
  readonly defaultOgImage: string;
  readonly siteName: string;
  readonly twitterHandle: string;
  readonly robotsTxt: string;
  readonly sitemapEnabled: boolean;
}

export interface AnalyticsConfig {
  readonly googleAnalyticsId: string;
  readonly mixpanelToken: string;
  readonly hotjarId: string;
  readonly customScript: string;
  readonly enabled: boolean;
}

export interface AuthConfig {
  readonly provider: 'firebase' | 'supabase' | 'auth0' | 'custom' | 'none';
  readonly apiKey: string;
  readonly domain: string;
  readonly projectId: string;
  readonly enabledMethods: readonly AuthMethod[];
}

export enum AuthMethod {
  Email = 'email',
  Google = 'google',
  Apple = 'apple',
  GitHub = 'github',
  Facebook = 'facebook',
  Twitter = 'twitter',
  Phone = 'phone',
  Anonymous = 'anonymous',
}

/* ──────────────────────────────────────────────
 * Variables
 * ────────────────────────────────────────────── */

export interface ProjectVariable {
  readonly id: string;
  readonly name: string;
  readonly type: VariableType;
  readonly defaultValue: unknown;
  readonly currentValue: unknown;
  readonly scope: 'global' | 'page' | 'component';
  readonly scopeId?: string; // Page or component ID
  readonly persistent: boolean; // Survives page navigation
  readonly description: string;
}

export enum VariableType {
  String = 'string',
  Number = 'number',
  Boolean = 'boolean',
  Object = 'object',
  Array = 'array',
  Date = 'date',
  File = 'file',
  Null = 'null',
}

/* ──────────────────────────────────────────────
 * API Endpoints
 * ────────────────────────────────────────────── */

export interface ApiEndpoint {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  readonly url: string;
  readonly headers: Record<string, string>;
  readonly queryParams: Record<string, string>;
  readonly body: ApiBody | null;
  readonly auth: ApiAuth | null;
  readonly timeout: number;
  readonly retryCount: number;
  readonly cacheDuration: number; // seconds, 0 = no cache
  readonly onSuccess: readonly string[]; // Action IDs
  readonly onError: readonly string[]; // Action IDs
  readonly responseMapping: readonly ResponseMapping[];
}

export interface ApiBody {
  readonly type: 'json' | 'form-data' | 'url-encoded' | 'raw' | 'binary';
  readonly content: string; // JSON string or template
}

export interface ApiAuth {
  readonly type: 'bearer' | 'basic' | 'api-key' | 'oauth2' | 'none';
  readonly token?: string;
  readonly username?: string;
  readonly password?: string;
  readonly headerName?: string;
  readonly headerValue?: string;
}

export interface ResponseMapping {
  readonly responsePath: string; // JSONPath
  readonly targetVariable: string; // Variable name
  readonly transform?: string; // Optional transform expression
}

/* ──────────────────────────────────────────────
 * Assets
 * ────────────────────────────────────────────── */

export interface ProjectAsset {
  readonly id: string;
  readonly name: string;
  readonly type: AssetType;
  readonly url: string;
  readonly size: number; // bytes
  readonly mimeType: string;
  readonly dimensions?: { width: number; height: number };
  readonly uploadedAt: number;
  readonly folder: string;
  readonly tags: readonly string[];
}

export enum AssetType {
  Image = 'image',
  Video = 'video',
  Audio = 'audio',
  Font = 'font',
  Icon = 'icon',
  Document = 'document',
  Lottie = 'lottie',
  SVG = 'svg',
  Other = 'other',
}

/* ──────────────────────────────────────────────
 * Custom Code
 * ────────────────────────────────────────────── */

export interface CustomCodeBlock {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly language: 'javascript' | 'typescript' | 'css' | 'html';
  readonly code: string;
  readonly scope: 'global' | 'page' | 'component';
  readonly scopeId?: string;
  readonly isAsync: boolean;
  readonly parameters: readonly CodeParameter[];
  readonly returnType: string;
}

export interface CodeParameter {
  readonly name: string;
  readonly type: string;
  readonly required: boolean;
  readonly defaultValue?: unknown;
  readonly description: string;
}

/* ──────────────────────────────────────────────
 * Dependencies
 * ────────────────────────────────────────────── */

export interface ProjectDependency {
  readonly name: string;
  readonly version: string;
  readonly latestVersion: string;
  readonly isOutdated: boolean;
  readonly platform: TargetPlatform;
  readonly type: 'runtime' | 'dev' | 'peer';
  readonly lastChecked: number;
}

/* ──────────────────────────────────────────────
 * Collaboration
 * ────────────────────────────────────────────── */

export interface Collaborator {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly avatarUrl: string;
  readonly role: 'owner' | 'editor' | 'viewer';
  readonly isOnline: boolean;
  readonly lastActiveAt: number;
  readonly cursorPosition?: { x: number; y: number };
  readonly activePageId?: string;
}

/* ──────────────────────────────────────────────
 * Project Theme
 * ────────────────────────────────────────────── */

export interface ProjectTheme {
  readonly primaryColor: string;
  readonly secondaryColor: string;
  readonly accentColor: string;
  readonly backgroundColor: string;
  readonly surfaceColor: string;
  readonly errorColor: string;
  readonly warningColor: string;
  readonly successColor: string;
  readonly infoColor: string;
  readonly textPrimary: string;
  readonly textSecondary: string;
  readonly textDisabled: string;
  readonly borderColor: string;
  readonly dividerColor: string;
  readonly fontFamily: string;
  readonly fontFamilyHeading: string;
  readonly fontFamilyMono: string;
  readonly borderRadius: number;
  readonly spacing: number;
  readonly shadows: boolean;
  readonly darkMode: boolean;
  readonly customCSS: string;
}

/** Default project theme */
export const DEFAULT_PROJECT_THEME: ProjectTheme = {
  primaryColor: '#6366f1',
  secondaryColor: '#8b5cf6',
  accentColor: '#06b6d4',
  backgroundColor: '#ffffff',
  surfaceColor: '#f8fafc',
  errorColor: '#ef4444',
  warningColor: '#f59e0b',
  successColor: '#22c55e',
  infoColor: '#3b82f6',
  textPrimary: '#0f172a',
  textSecondary: '#475569',
  textDisabled: '#94a3b8',
  borderColor: '#e2e8f0',
  dividerColor: '#f1f5f9',
  fontFamily: 'Inter, system-ui, sans-serif',
  fontFamilyHeading: 'Inter, system-ui, sans-serif',
  fontFamilyMono: 'JetBrains Mono, monospace',
  borderRadius: 8,
  spacing: 8,
  shadows: true,
  darkMode: false,
  customCSS: '',
};
