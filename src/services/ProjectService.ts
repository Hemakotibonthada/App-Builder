/**
 * Project Service
 * 
 * Handles project persistence: save, load, export, and import.
 * Uses localStorage for browser-based persistence and
 * generates downloadable project files.
 */

import { Project, ProjectTheme, DEFAULT_PROJECT_THEME } from '@/types/project.types';
import { CanvasState } from '@/types/canvas.types';

/* ──────────────────────────────────────────────
 * Storage Keys
 * ────────────────────────────────────────────── */

const PROJECTS_KEY = 'appbuilder_projects';
const ACTIVE_PROJECT_KEY = 'appbuilder_active_project';
const RECENT_PROJECTS_KEY = 'appbuilder_recent_projects';

/* ──────────────────────────────────────────────
 * Project Service
 * ────────────────────────────────────────────── */

export class ProjectService {
  /**
   * Saves a project to localStorage.
   */
  static saveProject(project: Project): void {
    try {
      const projects = this.getAllProjectIds();
      if (!projects.includes(project.id)) {
        projects.push(project.id);
        localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
      }

      localStorage.setItem(
        `project_${project.id}`,
        JSON.stringify(project),
      );

      localStorage.setItem(ACTIVE_PROJECT_KEY, project.id);

      // Update recent projects
      this.addToRecent(project);
    } catch (error) {
      console.error('Failed to save project:', error);
      throw new Error('Failed to save project. Storage may be full.');
    }
  }

  /**
   * Loads a project from localStorage.
   */
  static loadProject(projectId: string): Project | null {
    try {
      const data = localStorage.getItem(`project_${projectId}`);
      if (!data) return null;
      return JSON.parse(data) as Project;
    } catch (error) {
      console.error('Failed to load project:', error);
      return null;
    }
  }

  /**
   * Loads the most recently active project.
   */
  static loadActiveProject(): Project | null {
    const activeId = localStorage.getItem(ACTIVE_PROJECT_KEY);
    if (!activeId) return null;
    return this.loadProject(activeId);
  }

  /**
   * Deletes a project from localStorage.
   */
  static deleteProject(projectId: string): void {
    try {
      localStorage.removeItem(`project_${projectId}`);
      const projects = this.getAllProjectIds().filter(id => id !== projectId);
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));

      if (localStorage.getItem(ACTIVE_PROJECT_KEY) === projectId) {
        localStorage.removeItem(ACTIVE_PROJECT_KEY);
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  }

  /**
   * Returns all saved project IDs.
   */
  static getAllProjectIds(): string[] {
    try {
      const data = localStorage.getItem(PROJECTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Returns all saved projects (with basic info).
   */
  static getAllProjects(): { id: string; name: string; updatedAt: number }[] {
    const ids = this.getAllProjectIds();
    const projects: { id: string; name: string; updatedAt: number }[] = [];

    for (const id of ids) {
      const project = this.loadProject(id);
      if (project) {
        projects.push({
          id: project.id,
          name: project.name,
          updatedAt: project.updatedAt,
        });
      }
    }

    return projects.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  /**
   * Exports a project as a downloadable JSON file.
   */
  static exportProject(project: Project): void {
    const data = JSON.stringify(project, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.name.replace(/\s+/g, '-').toLowerCase()}.appbuilder.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Imports a project from a JSON file.
   */
  static async importProject(file: File): Promise<Project> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          // Validate basic structure
          if (!data.id || !data.name || !data.pages) {
            reject(new Error('Invalid project file format'));
            return;
          }
          resolve(data as Project);
        } catch (error) {
          reject(new Error('Failed to parse project file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  /**
   * Duplicates a project with a new ID.
   */
  static duplicateProject(project: Project, newName: string): Project {
    const now = Date.now();
    return {
      ...project,
      id: `proj_${now}_${Math.random().toString(36).substring(2, 8)}`,
      name: newName,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Merges canvas state into a project for saving.
   */
  static mergeCanvasState(project: Project, canvas: CanvasState): Project {
    return {
      ...project,
      widgets: canvas.widgets,
      pages: canvas.pages,
      updatedAt: Date.now(),
    };
  }

  /**
   * Adds a project to the recent projects list.
   */
  private static addToRecent(project: Project): void {
    try {
      const recent = this.getRecentProjects();
      const filtered = recent.filter(r => r.id !== project.id);
      filtered.unshift({
        id: project.id,
        name: project.name,
        updatedAt: project.updatedAt,
      });
      // Keep max 10 recent
      const trimmed = filtered.slice(0, 10);
      localStorage.setItem(RECENT_PROJECTS_KEY, JSON.stringify(trimmed));
    } catch (error) {
      console.error('Failed to update recent projects:', error);
    }
  }

  /**
   * Gets the list of recently opened projects.
   */
  static getRecentProjects(): { id: string; name: string; updatedAt: number }[] {
    try {
      const data = localStorage.getItem(RECENT_PROJECTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Calculates the storage usage of all projects.
   */
  static getStorageUsage(): {
    usedBytes: number;
    projectCount: number;
    largestProject: string | null;
  } {
    let totalSize = 0;
    let largestSize = 0;
    let largestProject: string | null = null;
    const ids = this.getAllProjectIds();

    for (const id of ids) {
      const data = localStorage.getItem(`project_${id}`);
      if (data) {
        const size = new Blob([data]).size;
        totalSize += size;
        if (size > largestSize) {
          largestSize = size;
          try {
            const project = JSON.parse(data);
            largestProject = project.name;
          } catch {
            largestProject = id;
          }
        }
      }
    }

    return {
      usedBytes: totalSize,
      projectCount: ids.length,
      largestProject,
    };
  }
}
