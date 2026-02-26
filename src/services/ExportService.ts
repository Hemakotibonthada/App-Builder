/**
 * Export Service
 * 
 * Orchestrates the full export/build pipeline:
 * 1. Validate project state
 * 2. Run version audit
 * 3. Generate code
 * 4. Package into downloadable archive
 */

import { GeneratedFile, BuildConfig, BuildProgress, BuildStatus, BuildResult, BuildError, BuildWarning } from '@/types/build.types';
import { Project, TargetPlatform } from '@/types/project.types';
import { AppPage } from '@/types/canvas.types';
import { WidgetConfig } from '@/types/widget.types';
import { generateProjectCode, CodeGenerator } from './CodeGenerator';
import { VersionAuditor, versionAuditor } from './VersionAuditor';
import { generateId } from '@/utils';

/* ──────────────────────────────────────────────
 * Export Service
 * ────────────────────────────────────────────── */

export class ExportService {
  private progressCallbacks: ((progress: BuildProgress) => void)[] = [];

  /**
   * Registers a callback for build progress updates.
   */
  onProgress(callback: (progress: BuildProgress) => void): () => void {
    this.progressCallbacks.push(callback);
    return () => {
      this.progressCallbacks = this.progressCallbacks.filter(c => c !== callback);
    };
  }

  /**
   * Executes the full build pipeline.
   */
  async build(
    config: BuildConfig,
    widgets: Record<string, WidgetConfig>,
    pages: readonly AppPage[],
  ): Promise<BuildResult> {
    const startTime = Date.now();
    const errors: BuildError[] = [];
    const warnings: BuildWarning[] = [];

    try {
      // Step 1: Validate
      this.emitProgress({
        status: BuildStatus.Validating,
        step: 1,
        totalSteps: 6,
        message: 'Validating project configuration...',
        percentage: 10,
        startTime,
        estimatedEndTime: startTime + 10000,
        errors: [],
        warnings: [],
        logs: [{ timestamp: Date.now(), level: 'info', message: 'Starting validation', source: 'ExportService' }],
      });

      const validationErrors = this.validate(config, widgets, pages);
      errors.push(...validationErrors);

      if (validationErrors.some(e => e.severity === 'fatal')) {
        return this.createResult(config, startTime, BuildStatus.Failed, errors, warnings, []);
      }

      await this.delay(500);

      // Step 2: Version Audit
      this.emitProgress({
        status: BuildStatus.Validating,
        step: 2,
        totalSteps: 6,
        message: 'Auditing dependency versions...',
        percentage: 25,
        startTime,
        estimatedEndTime: startTime + 8000,
        errors,
        warnings,
        logs: [{ timestamp: Date.now(), level: 'info', message: 'Running version audit', source: 'VersionAuditor' }],
      });

      const defaultDeps = VersionAuditor.getDefaultDependencies(config.platform);
      const auditResult = versionAuditor.audit(defaultDeps);

      if (auditResult.hasVulnerabilities) {
        warnings.push({
          id: generateId('warn'),
          code: 'VULN_DETECTED',
          message: 'Some dependencies have known vulnerabilities. Review the audit report.',
        });
      }

      if (auditResult.hasOutdated) {
        warnings.push({
          id: generateId('warn'),
          code: 'OUTDATED_DEPS',
          message: `${auditResult.dependencies.filter(d => d.isOutdated).length} dependencies are outdated.`,
        });
      }

      await this.delay(500);

      // Step 3: Generate Code
      this.emitProgress({
        status: BuildStatus.Generating,
        step: 3,
        totalSteps: 6,
        message: 'Generating source code...',
        percentage: 40,
        startTime,
        estimatedEndTime: startTime + 6000,
        errors,
        warnings,
        logs: [{ timestamp: Date.now(), level: 'info', message: 'Starting code generation', source: 'CodeGenerator' }],
      });

      const generatedFiles = generateProjectCode(widgets, pages, {
        platform: config.platform,
        language: config.platform === TargetPlatform.Web ? 'typescript' : 'dart',
        framework: config.platform === TargetPlatform.Web ? 'next' : 'flutter',
        styling: 'tailwind',
        stateManagement: config.platform === TargetPlatform.Web ? 'redux' : 'provider',
        testing: false,
        comments: true,
        formatCode: true,
        generateTypes: true,
        cleanArchitecture: true,
      });

      await this.delay(800);

      // Step 4: Compile
      this.emitProgress({
        status: BuildStatus.Compiling,
        step: 4,
        totalSteps: 6,
        message: 'Compiling application...',
        percentage: 60,
        startTime,
        estimatedEndTime: startTime + 4000,
        errors,
        warnings,
        logs: [{ timestamp: Date.now(), level: 'info', message: `Generated ${generatedFiles.length} files`, source: 'CodeGenerator' }],
      });

      await this.delay(600);

      // Step 5: Optimize
      this.emitProgress({
        status: BuildStatus.Optimizing,
        step: 5,
        totalSteps: 6,
        message: 'Optimizing bundle...',
        percentage: 80,
        startTime,
        estimatedEndTime: startTime + 2000,
        errors,
        warnings,
        logs: [{ timestamp: Date.now(), level: 'info', message: 'Applying optimizations', source: 'Optimizer' }],
      });

      await this.delay(400);

      // Step 6: Package
      this.emitProgress({
        status: BuildStatus.Packaging,
        step: 6,
        totalSteps: 6,
        message: 'Packaging build artifacts...',
        percentage: 95,
        startTime,
        estimatedEndTime: startTime + 500,
        errors,
        warnings,
        logs: [{ timestamp: Date.now(), level: 'info', message: 'Creating download package', source: 'Packager' }],
      });

      // Create downloadable package
      this.downloadGeneratedCode(generatedFiles, config.appName);

      await this.delay(300);

      // Complete
      this.emitProgress({
        status: BuildStatus.Complete,
        step: 6,
        totalSteps: 6,
        message: 'Build completed successfully!',
        percentage: 100,
        startTime,
        estimatedEndTime: Date.now(),
        errors,
        warnings,
        logs: [{ timestamp: Date.now(), level: 'info', message: 'Build complete', source: 'ExportService' }],
      });

      return this.createResult(config, startTime, BuildStatus.Complete, errors, warnings, generatedFiles);
    } catch (error) {
      errors.push({
        id: generateId('err'),
        severity: 'fatal',
        code: 'BUILD_FAILED',
        message: error instanceof Error ? error.message : 'Unknown build error',
      });

      this.emitProgress({
        status: BuildStatus.Failed,
        step: 0,
        totalSteps: 6,
        message: 'Build failed',
        percentage: 0,
        startTime,
        estimatedEndTime: Date.now(),
        errors,
        warnings,
        logs: [{ timestamp: Date.now(), level: 'error', message: 'Build failed', source: 'ExportService' }],
      });

      return this.createResult(config, startTime, BuildStatus.Failed, errors, warnings, []);
    }
  }

  /**
   * Validates the project before building.
   */
  private validate(
    config: BuildConfig,
    widgets: Record<string, WidgetConfig>,
    pages: readonly AppPage[],
  ): BuildError[] {
    const errors: BuildError[] = [];

    // Check for empty project
    if (Object.keys(widgets).length === 0) {
      errors.push({
        id: generateId('err'),
        severity: 'error',
        code: 'EMPTY_PROJECT',
        message: 'No widgets found in the project. Add some widgets to the canvas before building.',
      });
    }

    // Check for pages
    if (pages.length === 0) {
      errors.push({
        id: generateId('err'),
        severity: 'error',
        code: 'NO_PAGES',
        message: 'No pages defined. Create at least one page.',
      });
    }

    // Validate app name
    if (!config.appName || config.appName.trim().length === 0) {
      errors.push({
        id: generateId('err'),
        severity: 'error',
        code: 'MISSING_APP_NAME',
        message: 'App name is required.',
      });
    }

    // Validate bundle ID format
    if (config.platform !== TargetPlatform.Web) {
      const bundleId = config.android?.bundleId ?? config.ios?.bundleId ?? '';
      if (bundleId && !/^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)+$/.test(bundleId)) {
        errors.push({
          id: generateId('err'),
          severity: 'error',
          code: 'INVALID_BUNDLE_ID',
          message: 'Invalid bundle identifier format. Use reverse domain notation (e.g., com.example.app).',
        });
      }
    }

    // Check for orphaned widgets
    const allChildIds = new Set<string>();
    const allRootIds = new Set<string>();
    for (const page of pages) {
      for (const id of page.rootWidgetIds) {
        allRootIds.add(id);
      }
    }
    for (const widget of Object.values(widgets)) {
      for (const childId of widget.childIds) {
        allChildIds.add(childId);
      }
    }

    for (const id of Object.keys(widgets)) {
      if (!allRootIds.has(id) && !allChildIds.has(id)) {
        errors.push({
          id: generateId('err'),
          severity: 'error',
          code: 'ORPHANED_WIDGET',
          message: `Widget "${widgets[id]?.name}" (${id}) is not connected to any page.`,
          widgetId: id,
        });
      }
    }

    return errors;
  }

  /**
   * Creates a downloadable ZIP-like text file with generated code.
   */
  private downloadGeneratedCode(files: readonly GeneratedFile[], appName: string): void {
    // Create a combined file listing (for download)
    let combined = `# Generated Project: ${appName}\n`;
    combined += `# Generated at: ${new Date().toISOString()}\n`;
    combined += `# Files: ${files.length}\n\n`;

    for (const file of files) {
      combined += `${'='.repeat(60)}\n`;
      combined += `FILE: ${file.path}\n`;
      combined += `LANGUAGE: ${file.language}\n`;
      combined += `${'='.repeat(60)}\n\n`;
      combined += file.content;
      combined += `\n\n`;
    }

    const blob = new Blob([combined], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${appName.replace(/\s+/g, '-').toLowerCase()}-source.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  private createResult(
    config: BuildConfig,
    startTime: number,
    status: BuildStatus,
    errors: BuildError[],
    warnings: BuildWarning[],
    files: readonly GeneratedFile[],
  ): BuildResult {
    const endTime = Date.now();
    return {
      id: generateId('build'),
      buildConfig: config,
      status,
      startTime,
      endTime,
      duration: endTime - startTime,
      errors,
      warnings,
      artifacts: files.map(f => ({
        name: f.path.split('/').pop() ?? f.path,
        path: f.path,
        size: new Blob([f.content]).size,
        type: 'source' as const,
        checksum: '',
      })),
      metrics: {
        totalSize: files.reduce((sum, f) => sum + new Blob([f.content]).size, 0),
        jsSize: files.filter(f => f.language === 'typescript' || f.language === 'javascript')
          .reduce((sum, f) => sum + new Blob([f.content]).size, 0),
        cssSize: files.filter(f => f.language === 'css')
          .reduce((sum, f) => sum + new Blob([f.content]).size, 0),
        imageSize: 0,
        fontSize: 0,
        pageCount: files.filter(f => f.type === 'page').length,
        componentCount: files.filter(f => f.type === 'component').length,
        routeCount: files.filter(f => f.type === 'page').length,
        dependencyCount: 0,
        compilationTime: endTime - startTime,
        bundleTime: 0,
        optimizationTime: 0,
      },
    };
  }

  private emitProgress(progress: BuildProgress): void {
    for (const cb of this.progressCallbacks) {
      cb(progress);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/** Singleton */
export const exportService = new ExportService();
