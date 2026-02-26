/**
 * Version Auditor Service
 * 
 * Ensures every exported module uses the latest stable versions
 * of libraries. Checks for outdated dependencies, known
 * vulnerabilities, and provides upgrade recommendations.
 */

import {
  VersionAuditResult,
  DependencyAudit,
  Vulnerability,
} from '@/types/build.types';
import { ProjectDependency, TargetPlatform } from '@/types/project.types';

/* ──────────────────────────────────────────────
 * Known Latest Stable Versions
 * ────────────────────────────────────────────── */

const LATEST_VERSIONS: Record<string, { version: string; platform: TargetPlatform }> = {
  // Web dependencies
  'next': { version: '15.1.0', platform: TargetPlatform.Web },
  'react': { version: '19.0.0', platform: TargetPlatform.Web },
  'react-dom': { version: '19.0.0', platform: TargetPlatform.Web },
  'typescript': { version: '5.7.2', platform: TargetPlatform.Web },
  'tailwindcss': { version: '3.4.16', platform: TargetPlatform.Web },
  '@reduxjs/toolkit': { version: '2.3.0', platform: TargetPlatform.Web },
  'react-redux': { version: '9.1.2', platform: TargetPlatform.Web },
  'framer-motion': { version: '11.12.0', platform: TargetPlatform.Web },
  'zod': { version: '3.23.8', platform: TargetPlatform.Web },
  'firebase': { version: '11.1.0', platform: TargetPlatform.Web },
  '@supabase/supabase-js': { version: '2.47.0', platform: TargetPlatform.Web },
  'axios': { version: '1.7.9', platform: TargetPlatform.Web },
  'lucide-react': { version: '0.460.0', platform: TargetPlatform.Web },
  'clsx': { version: '2.1.1', platform: TargetPlatform.Web },
  'zustand': { version: '5.0.0', platform: TargetPlatform.Web },

  // Flutter / Dart dependencies  
  'flutter': { version: '3.27.0', platform: TargetPlatform.Android },
  'provider': { version: '6.1.2', platform: TargetPlatform.Android },
  'go_router': { version: '14.6.0', platform: TargetPlatform.Android },
  'dio': { version: '5.7.0', platform: TargetPlatform.Android },
  'riverpod': { version: '2.6.1', platform: TargetPlatform.Android },
  'bloc': { version: '8.1.4', platform: TargetPlatform.Android },
  'flutter_bloc': { version: '8.1.6', platform: TargetPlatform.Android },
  'firebase_core': { version: '3.8.0', platform: TargetPlatform.Android },
  'firebase_auth': { version: '5.3.3', platform: TargetPlatform.Android },
  'cloud_firestore': { version: '5.5.0', platform: TargetPlatform.Android },
  'google_fonts': { version: '6.2.1', platform: TargetPlatform.Android },
  'cached_network_image': { version: '3.4.1', platform: TargetPlatform.Android },
  'shared_preferences': { version: '2.3.3', platform: TargetPlatform.Android },
};

/* ──────────────────────────────────────────────
 * Version Comparison Utilities
 * ────────────────────────────────────────────── */

interface ParsedVersion {
  major: number;
  minor: number;
  patch: number;
  prerelease: string;
}

/**
 * Parses a semantic version string into components.
 */
function parseVersion(version: string): ParsedVersion {
  const cleaned = version.replace(/^[~^>=<]+/, '');
  const [main, prerelease] = cleaned.split('-');
  const parts = (main ?? '0.0.0').split('.').map(Number);
  return {
    major: parts[0] ?? 0,
    minor: parts[1] ?? 0,
    patch: parts[2] ?? 0,
    prerelease: prerelease ?? '',
  };
}

/**
 * Compares two versions. Returns:
 * -1 if a < b, 0 if equal, 1 if a > b
 */
function compareVersions(a: string, b: string): -1 | 0 | 1 {
  const va = parseVersion(a);
  const vb = parseVersion(b);

  if (va.major !== vb.major) return va.major < vb.major ? -1 : 1;
  if (va.minor !== vb.minor) return va.minor < vb.minor ? -1 : 1;
  if (va.patch !== vb.patch) return va.patch < vb.patch ? -1 : 1;
  return 0;
}

/**
 * Determines the type of version update needed.
 */
function getUpdateType(current: string, latest: string): 'major' | 'minor' | 'patch' | 'none' {
  const vc = parseVersion(current);
  const vl = parseVersion(latest);

  if (vc.major !== vl.major) return 'major';
  if (vc.minor !== vl.minor) return 'minor';
  if (vc.patch !== vl.patch) return 'patch';
  return 'none';
}

/* ──────────────────────────────────────────────
 * Version Auditor Class
 * ────────────────────────────────────────────── */

export class VersionAuditor {
  private auditCache: Map<string, DependencyAudit> = new Map();

  /**
   * Audits a list of project dependencies against known latest versions.
   */
  audit(dependencies: readonly ProjectDependency[]): VersionAuditResult {
    const audits: DependencyAudit[] = [];
    let hasVulnerabilities = false;
    let hasOutdated = false;
    const recommendations: string[] = [];

    for (const dep of dependencies) {
      const audit = this.auditDependency(dep);
      audits.push(audit);

      if (audit.hasVulnerabilities) hasVulnerabilities = true;
      if (audit.isOutdated) hasOutdated = true;
    }

    // Generate recommendations
    const majorUpdates = audits.filter(a => a.updateType === 'major');
    const minorUpdates = audits.filter(a => a.updateType === 'minor');
    const patchUpdates = audits.filter(a => a.updateType === 'patch');
    const vulnerable = audits.filter(a => a.hasVulnerabilities);

    if (majorUpdates.length > 0) {
      recommendations.push(
        `${majorUpdates.length} package(s) have major updates available. Review breaking changes before upgrading: ${majorUpdates.map(a => a.name).join(', ')}.`,
      );
    }

    if (minorUpdates.length > 0) {
      recommendations.push(
        `${minorUpdates.length} package(s) have minor updates. These are generally safe to upgrade: ${minorUpdates.map(a => a.name).join(', ')}.`,
      );
    }

    if (patchUpdates.length > 0) {
      recommendations.push(
        `${patchUpdates.length} package(s) have patch updates available. Apply these for bug fixes and security patches.`,
      );
    }

    if (vulnerable.length > 0) {
      recommendations.push(
        `WARNING: ${vulnerable.length} package(s) have known vulnerabilities. Update immediately: ${vulnerable.map(a => a.name).join(', ')}.`,
      );
    }

    if (!hasOutdated && !hasVulnerabilities) {
      recommendations.push('All dependencies are up to date. No action required.');
    }

    // Calculate score (0-100)
    const totalDeps = audits.length || 1;
    const outdatedPenalty = audits.filter(a => a.isOutdated).length * 5;
    const vulnPenalty = audits.filter(a => a.hasVulnerabilities).length * 15;
    const majorPenalty = majorUpdates.length * 10;
    const score = Math.max(0, Math.min(100, 100 - outdatedPenalty - vulnPenalty - majorPenalty));

    return {
      timestamp: Date.now(),
      dependencies: audits,
      hasVulnerabilities,
      hasOutdated,
      score,
      recommendations,
    };
  }

  /**
   * Audits a single dependency.
   */
  private auditDependency(dep: ProjectDependency): DependencyAudit {
    // Check cache
    const cacheKey = `${dep.name}@${dep.version}`;
    const cached = this.auditCache.get(cacheKey);
    if (cached) return cached;

    const knownLatest = LATEST_VERSIONS[dep.name];
    const latestVersion = knownLatest?.version ?? dep.version;
    const isOutdated = compareVersions(dep.version, latestVersion) === -1;
    const updateType = getUpdateType(dep.version, latestVersion);

    // Simulate vulnerability check
    const vulnerabilities = this.checkVulnerabilities(dep.name, dep.version);

    const audit: DependencyAudit = {
      name: dep.name,
      currentVersion: dep.version,
      latestVersion,
      latestStableVersion: latestVersion,
      isOutdated,
      hasVulnerabilities: vulnerabilities.length > 0,
      vulnerabilities,
      updateType,
      license: this.getLicense(dep.name),
      size: this.estimateSize(dep.name),
      platform: dep.platform,
    };

    this.auditCache.set(cacheKey, audit);
    return audit;
  }

  /**
   * Checks for known vulnerabilities in a package version.
   * In production, this would call an API like Snyk or GitHub Advisory.
   */
  private checkVulnerabilities(name: string, version: string): Vulnerability[] {
    // Known vulnerability database (simplified)
    const knownVulnerabilities: Record<string, { maxVersion: string; vuln: Vulnerability }[]> = {
      'axios': [
        {
          maxVersion: '1.6.0',
          vuln: {
            id: 'CVE-2023-45857',
            severity: 'moderate',
            title: 'Cross-Site Request Forgery in Axios',
            description: 'Axios vulnerable to CSRF with specific config.',
            patchedVersion: '1.6.1',
            url: 'https://github.com/advisories/GHSA-wf5p-g6vw-rhqq',
          },
        },
      ],
    };

    const vulns = knownVulnerabilities[name];
    if (!vulns) return [];

    return vulns
      .filter(v => compareVersions(version, v.maxVersion) <= 0)
      .map(v => v.vuln);
  }

  /**
   * Returns the license for a known package.
   */
  private getLicense(name: string): string {
    const licenses: Record<string, string> = {
      'react': 'MIT',
      'next': 'MIT',
      'typescript': 'Apache-2.0',
      'tailwindcss': 'MIT',
      'framer-motion': 'MIT',
      'firebase': 'Apache-2.0',
      'flutter': 'BSD-3-Clause',
      'zod': 'MIT',
    };
    return licenses[name] ?? 'MIT';
  }

  /**
   * Estimates the install size of a package (in bytes).
   */
  private estimateSize(name: string): number {
    const sizes: Record<string, number> = {
      'react': 310000,
      'react-dom': 4200000,
      'next': 15000000,
      'typescript': 62000000,
      'tailwindcss': 8500000,
      'framer-motion': 2100000,
      'firebase': 8000000,
      '@reduxjs/toolkit': 1800000,
      'zod': 680000,
    };
    return sizes[name] ?? 500000;
  }

  /**
   * Generates the default set of dependencies for a target platform.
   */
  static getDefaultDependencies(platform: TargetPlatform): ProjectDependency[] {
    const deps: ProjectDependency[] = [];

    if (platform === TargetPlatform.Web) {
      const webDeps = [
        'next', 'react', 'react-dom', 'typescript', 'tailwindcss',
        '@reduxjs/toolkit', 'react-redux', 'framer-motion', 'zod',
        'lucide-react', 'clsx',
      ];
      for (const name of webDeps) {
        const info = LATEST_VERSIONS[name];
        if (info) {
          deps.push({
            name,
            version: info.version,
            latestVersion: info.version,
            isOutdated: false,
            platform: TargetPlatform.Web,
            type: 'runtime',
            lastChecked: Date.now(),
          });
        }
      }
    }

    if (platform === TargetPlatform.Android || platform === TargetPlatform.IOS) {
      const flutterDeps = [
        'flutter', 'provider', 'go_router', 'google_fonts',
        'cached_network_image', 'shared_preferences',
      ];
      for (const name of flutterDeps) {
        const info = LATEST_VERSIONS[name];
        if (info) {
          deps.push({
            name,
            version: info.version,
            latestVersion: info.version,
            isOutdated: false,
            platform,
            type: 'runtime',
            lastChecked: Date.now(),
          });
        }
      }
    }

    return deps;
  }

  /**
   * Clears the audit cache.
   */
  clearCache(): void {
    this.auditCache.clear();
  }
}

/** Singleton instance */
export const versionAuditor = new VersionAuditor();
