/**
 * Build Type Definitions
 * 
 * Types for the build pipeline, code generation,
 * export configuration, and version auditing.
 */

import { TargetPlatform } from './project.types';

/* ──────────────────────────────────────────────
 * Build Configuration
 * ────────────────────────────────────────────── */

/** Build configuration collected from the build modal */
export interface BuildConfig {
  readonly id: string;
  readonly projectId: string;
  readonly platform: TargetPlatform;
  readonly mode: BuildMode;
  readonly timestamp: number;

  // App metadata
  readonly appName: string;
  readonly appDescription: string;
  readonly appVersion: string;
  readonly buildNumber: number;

  // Platform-specific
  readonly android?: AndroidBuildConfig;
  readonly ios?: IOSBuildConfig;
  readonly web?: WebBuildConfig;

  // Common
  readonly environment: string;
  readonly envVariables: Record<string, string>;
  readonly apiKeys: Record<string, string>;
  readonly features: BuildFeatures;
  readonly optimization: OptimizationConfig;
}

export enum BuildMode {
  Debug = 'debug',
  Release = 'release',
  Profile = 'profile',
  Staging = 'staging',
}

export interface AndroidBuildConfig {
  readonly bundleId: string;
  readonly minSdkVersion: number;
  readonly targetSdkVersion: number;
  readonly compileSdkVersion: number;
  readonly keyAlias: string;
  readonly keystorePath: string;
  readonly buildType: 'apk' | 'aab';
  readonly signingConfig: 'debug' | 'release';
  readonly proguardEnabled: boolean;
  readonly permissions: readonly string[];
  readonly adaptiveIcon: {
    foreground: string;
    background: string;
  };
}

export interface IOSBuildConfig {
  readonly bundleId: string;
  readonly deploymentTarget: string;
  readonly teamId: string;
  readonly provisioningProfile: string;
  readonly entitlements: readonly string[];
  readonly capabilities: readonly string[];
  readonly deviceFamily: readonly ('iphone' | 'ipad')[];
  readonly infoPlistEntries: Record<string, string>;
}

export interface WebBuildConfig {
  readonly domain: string;
  readonly subdirectory: string;
  readonly buildTool: 'next' | 'vite' | 'webpack';
  readonly ssr: boolean;
  readonly pwa: PWAConfig;
  readonly cdn: CDNConfig;
  readonly outputDir: string;
}

export interface PWAConfig {
  readonly enabled: boolean;
  readonly name: string;
  readonly shortName: string;
  readonly themeColor: string;
  readonly backgroundColor: string;
  readonly display: 'fullscreen' | 'standalone' | 'minimal-ui' | 'browser';
  readonly orientation: 'any' | 'portrait' | 'landscape';
  readonly startUrl: string;
  readonly icons: readonly { src: string; sizes: string; type: string }[];
  readonly offlineSupport: boolean;
}

export interface CDNConfig {
  readonly enabled: boolean;
  readonly provider: 'cloudflare' | 'cloudfront' | 'fastly' | 'custom';
  readonly baseUrl: string;
  readonly cacheControl: string;
}

export interface BuildFeatures {
  readonly analytics: boolean;
  readonly crashReporting: boolean;
  readonly pushNotifications: boolean;
  readonly deepLinking: boolean;
  readonly internationalization: boolean;
  readonly darkMode: boolean;
  readonly accessibility: boolean;
  readonly performanceMonitoring: boolean;
}

export interface OptimizationConfig {
  readonly minify: boolean;
  readonly treeshake: boolean;
  readonly codeSplit: boolean;
  readonly lazyLoad: boolean;
  readonly imageOptimization: boolean;
  readonly compressionEnabled: boolean;
  readonly compressionType: 'gzip' | 'brotli' | 'both';
  readonly sourceMaps: boolean;
  readonly inlineStyles: boolean;
  readonly prefetch: boolean;
}

/* ──────────────────────────────────────────────
 * Build Pipeline
 * ────────────────────────────────────────────── */

export enum BuildStatus {
  Idle = 'idle',
  Validating = 'validating',
  Generating = 'generating',
  Compiling = 'compiling',
  Bundling = 'bundling',
  Optimizing = 'optimizing',
  Testing = 'testing',
  Packaging = 'packaging',
  Uploading = 'uploading',
  Complete = 'complete',
  Failed = 'failed',
  Cancelled = 'cancelled',
}

export interface BuildProgress {
  readonly status: BuildStatus;
  readonly step: number;
  readonly totalSteps: number;
  readonly message: string;
  readonly percentage: number;
  readonly startTime: number;
  readonly estimatedEndTime: number;
  readonly errors: readonly BuildError[];
  readonly warnings: readonly BuildWarning[];
  readonly logs: readonly BuildLog[];
}

export interface BuildError {
  readonly id: string;
  readonly severity: 'error' | 'fatal';
  readonly code: string;
  readonly message: string;
  readonly file?: string;
  readonly line?: number;
  readonly column?: number;
  readonly suggestion?: string;
  readonly widgetId?: string;
}

export interface BuildWarning {
  readonly id: string;
  readonly code: string;
  readonly message: string;
  readonly file?: string;
  readonly suggestion?: string;
  readonly widgetId?: string;
}

export interface BuildLog {
  readonly timestamp: number;
  readonly level: 'info' | 'debug' | 'warn' | 'error';
  readonly message: string;
  readonly source: string;
}

export interface BuildResult {
  readonly id: string;
  readonly buildConfig: BuildConfig;
  readonly status: BuildStatus;
  readonly startTime: number;
  readonly endTime: number;
  readonly duration: number;
  readonly errors: readonly BuildError[];
  readonly warnings: readonly BuildWarning[];
  readonly artifacts: readonly BuildArtifact[];
  readonly metrics: BuildMetrics;
}

export interface BuildArtifact {
  readonly name: string;
  readonly path: string;
  readonly size: number;
  readonly type: 'binary' | 'bundle' | 'source' | 'assets' | 'config';
  readonly downloadUrl?: string;
  readonly checksum: string;
}

export interface BuildMetrics {
  readonly totalSize: number;
  readonly jsSize: number;
  readonly cssSize: number;
  readonly imageSize: number;
  readonly fontSize: number;
  readonly pageCount: number;
  readonly componentCount: number;
  readonly routeCount: number;
  readonly dependencyCount: number;
  readonly compilationTime: number;
  readonly bundleTime: number;
  readonly optimizationTime: number;
}

/* ──────────────────────────────────────────────
 * Code Generation
 * ────────────────────────────────────────────── */

/** Generated code file */
export interface GeneratedFile {
  readonly path: string; // Relative path in output project
  readonly content: string;
  readonly language: 'typescript' | 'javascript' | 'dart' | 'css' | 'html' | 'json' | 'yaml' | 'xml';
  readonly type: GeneratedFileType;
  readonly sourceWidgetIds: readonly string[];
  readonly generated: boolean;
  readonly overwritable: boolean;
}

export enum GeneratedFileType {
  Component = 'component',
  Page = 'page',
  Layout = 'layout',
  Style = 'style',
  Config = 'config',
  Route = 'route',
  Model = 'model',
  Service = 'service',
  Utility = 'utility',
  Test = 'test',
  Asset = 'asset',
  Package = 'package',
  Manifest = 'manifest',
  README = 'readme',
}

/** Code generation options */
export interface CodeGenOptions {
  readonly platform: TargetPlatform;
  readonly language: 'typescript' | 'javascript' | 'dart';
  readonly framework: 'react' | 'next' | 'flutter' | 'react-native';
  readonly styling: 'css-modules' | 'tailwind' | 'styled-components' | 'emotion';
  readonly stateManagement: 'redux' | 'zustand' | 'bloc' | 'provider' | 'context';
  readonly testing: boolean;
  readonly comments: boolean;
  readonly formatCode: boolean;
  readonly generateTypes: boolean;
  readonly cleanArchitecture: boolean;
}

/* ──────────────────────────────────────────────
 * Version Auditor
 * ────────────────────────────────────────────── */

export interface VersionAuditResult {
  readonly timestamp: number;
  readonly dependencies: readonly DependencyAudit[];
  readonly hasVulnerabilities: boolean;
  readonly hasOutdated: boolean;
  readonly score: number; // 0-100
  readonly recommendations: readonly string[];
}

export interface DependencyAudit {
  readonly name: string;
  readonly currentVersion: string;
  readonly latestVersion: string;
  readonly latestStableVersion: string;
  readonly isOutdated: boolean;
  readonly hasVulnerabilities: boolean;
  readonly vulnerabilities: readonly Vulnerability[];
  readonly updateType: 'major' | 'minor' | 'patch' | 'none';
  readonly changelog?: string;
  readonly license: string;
  readonly size: number;
  readonly platform: TargetPlatform;
}

export interface Vulnerability {
  readonly id: string;
  readonly severity: 'low' | 'moderate' | 'high' | 'critical';
  readonly title: string;
  readonly description: string;
  readonly patchedVersion: string;
  readonly url: string;
}

/* ──────────────────────────────────────────────
 * Export Types
 * ────────────────────────────────────────────── */

export enum ExportFormat {
  SourceCode = 'source-code',
  ZIP = 'zip',
  Docker = 'docker',
  GitHub = 'github',
  GitLab = 'gitlab',
  Vercel = 'vercel',
  Netlify = 'netlify',
  Firebase = 'firebase',
  AWS = 'aws',
  Azure = 'azure',
}

export interface ExportConfig {
  readonly format: ExportFormat;
  readonly includeAssets: boolean;
  readonly includeTests: boolean;
  readonly includeDocumentation: boolean;
  readonly includeCICD: boolean;
  readonly includeDocker: boolean;
  readonly gitInit: boolean;
  readonly readme: boolean;
  readonly license: string;
}
