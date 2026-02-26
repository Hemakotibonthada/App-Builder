// =============================================================================
// Plugin System - Extensible plugin architecture for the builder
// Features: Plugin lifecycle, dependency resolution, sandboxing, hot-reload, API
// =============================================================================

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
  homepage?: string;
  repository?: string;
  icon?: string;
  category: PluginCategory;
  tags: string[];
  dependencies: PluginDependency[];
  permissions: PluginPermission[];
  entryPoint: string;
  settings: PluginSetting[];
  minAppVersion?: string;
  maxAppVersion?: string;
  isBuiltIn: boolean;
  size: number;
}

export type PluginCategory =
  | 'widgets' | 'themes' | 'integrations' | 'analytics' | 'seo'
  | 'performance' | 'accessibility' | 'collaboration' | 'ai'
  | 'animations' | 'data' | 'forms' | 'media' | 'security'
  | 'devtools' | 'export' | 'i18n' | 'layout' | 'navigation' | 'utility';

export interface PluginDependency {
  pluginId: string;
  version: string;
  optional: boolean;
}

export type PluginPermission =
  | 'read:widgets' | 'write:widgets' | 'delete:widgets'
  | 'read:pages' | 'write:pages' | 'delete:pages'
  | 'read:project' | 'write:project'
  | 'read:settings' | 'write:settings'
  | 'read:theme' | 'write:theme'
  | 'network:fetch' | 'network:websocket'
  | 'storage:local' | 'storage:session' | 'storage:indexeddb'
  | 'clipboard:read' | 'clipboard:write'
  | 'ui:toolbar' | 'ui:panel' | 'ui:modal' | 'ui:menu' | 'ui:notification'
  | 'canvas:render' | 'canvas:overlay'
  | 'export:html' | 'export:react' | 'export:vue' | 'export:custom'
  | 'code:execute' | 'code:generate'
  | 'dom:read' | 'dom:write'
  | 'events:emit' | 'events:listen'
  | 'system:info';

export interface PluginSetting {
  key: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'color' | 'file' | 'json' | 'code';
  label: string;
  description: string;
  defaultValue: unknown;
  options?: Array<{ label: string; value: unknown }>;
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  group?: string;
  advanced?: boolean;
}

export interface PluginInstance {
  manifest: PluginManifest;
  state: PluginState;
  settings: Record<string, unknown>;
  api: PluginAPI;
  installedAt: number;
  activatedAt: number;
  lastError?: string;
  loadTime: number;
  memoryUsage: number;
}

export type PluginState =
  | 'installed' | 'loading' | 'active' | 'inactive'
  | 'error' | 'disabled' | 'updating' | 'uninstalling';

export interface PluginAPI {
  // Widget API
  registerWidget: (config: PluginWidgetConfig) => void;
  unregisterWidget: (type: string) => void;

  // Panel API
  registerPanel: (config: PluginPanelConfig) => void;
  unregisterPanel: (id: string) => void;

  // Toolbar API
  registerToolbarItem: (config: PluginToolbarItem) => void;
  unregisterToolbarItem: (id: string) => void;

  // Menu API
  registerMenuItem: (config: PluginMenuItem) => void;
  unregisterMenuItem: (id: string) => void;

  // Context menu
  registerContextMenuItem: (config: PluginContextMenuItem) => void;
  unregisterContextMenuItem: (id: string) => void;

  // Theme API
  registerTheme: (config: PluginThemeConfig) => void;
  unregisterTheme: (id: string) => void;

  // Export API
  registerExporter: (config: PluginExporterConfig) => void;
  unregisterExporter: (id: string) => void;

  // Data API
  registerDataSource: (config: PluginDataSourceConfig) => void;
  unregisterDataSource: (id: string) => void;

  // Event API
  on: (event: string, handler: (...args: unknown[]) => void) => () => void;
  emit: (event: string, data?: unknown) => void;

  // Storage API
  getStorage: (key: string) => unknown;
  setStorage: (key: string, value: unknown) => void;
  removeStorage: (key: string) => void;

  // Settings API
  getSetting: (key: string) => unknown;
  setSetting: (key: string, value: unknown) => void;

  // Notification API
  showNotification: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;

  // Modal API
  showModal: (config: PluginModalConfig) => void;
  closeModal: (id: string) => void;

  // Logger
  log: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;

  // Utils
  generateId: () => string;
  getAppVersion: () => string;
  getLocale: () => string;
}

export interface PluginWidgetConfig {
  type: string;
  name: string;
  icon: string;
  category: string;
  description: string;
  defaultProps: Record<string, unknown>;
  defaultStyle: Record<string, unknown>;
  propSchema: PluginPropSchema[];
  render: (props: Record<string, unknown>, style: Record<string, unknown>) => string;
  preview?: string;
  resizable: boolean;
  draggable: boolean;
  selectable: boolean;
  hasChildren: boolean;
  allowedChildren?: string[];
  allowedParents?: string[];
}

export interface PluginPropSchema {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'color' | 'select' | 'array' | 'object' | 'file' | 'icon' | 'code' | 'richtext';
  label: string;
  defaultValue: unknown;
  description?: string;
  options?: Array<{ label: string; value: unknown }>;
  group?: string;
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  };
  conditional?: {
    field: string;
    value: unknown;
    operator?: 'eq' | 'neq' | 'gt' | 'lt' | 'in';
  };
}

export interface PluginPanelConfig {
  id: string;
  title: string;
  icon: string;
  position: 'left' | 'right' | 'bottom';
  width?: number;
  height?: number;
  render: () => string;
  onOpen?: () => void;
  onClose?: () => void;
  badge?: number;
  order?: number;
}

export interface PluginToolbarItem {
  id: string;
  label: string;
  icon: string;
  tooltip: string;
  position: 'left' | 'center' | 'right';
  type: 'button' | 'toggle' | 'dropdown' | 'separator';
  onClick?: () => void;
  items?: Array<{ label: string; icon?: string; onClick: () => void }>;
  order?: number;
  disabled?: boolean;
  active?: boolean;
}

export interface PluginMenuItem {
  id: string;
  label: string;
  icon?: string;
  shortcut?: string;
  menu: 'file' | 'edit' | 'view' | 'insert' | 'tools' | 'help';
  onClick: () => void;
  separator?: boolean;
  order?: number;
  disabled?: boolean;
  checked?: boolean;
}

export interface PluginContextMenuItem {
  id: string;
  label: string;
  icon?: string;
  shortcut?: string;
  context: 'widget' | 'canvas' | 'layer' | 'page';
  onClick: (target: unknown) => void;
  separator?: boolean;
  order?: number;
  disabled?: boolean;
  condition?: (target: unknown) => boolean;
}

export interface PluginThemeConfig {
  id: string;
  name: string;
  description: string;
  author: string;
  preview: string;
  colors: Record<string, string>;
  fonts: Record<string, string>;
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
  custom: Record<string, string>;
}

export interface PluginExporterConfig {
  id: string;
  name: string;
  format: string;
  description: string;
  icon: string;
  fileExtension: string;
  mimeType: string;
  export: (project: unknown) => string | Blob;
  options?: PluginSetting[];
}

export interface PluginDataSourceConfig {
  id: string;
  name: string;
  type: 'rest' | 'graphql' | 'websocket' | 'static' | 'custom';
  description: string;
  icon: string;
  configSchema: PluginPropSchema[];
  connect: (config: Record<string, unknown>) => Promise<boolean>;
  disconnect: () => Promise<void>;
  fetch: (query: Record<string, unknown>) => Promise<unknown>;
  subscribe?: (query: Record<string, unknown>, callback: (data: unknown) => void) => () => void;
}

export interface PluginModalConfig {
  id: string;
  title: string;
  width?: number;
  height?: number;
  content: string;
  actions?: Array<{
    label: string;
    type?: 'primary' | 'secondary' | 'danger';
    onClick: () => void;
  }>;
  closable?: boolean;
  overlay?: boolean;
}

export interface PluginHook {
  name: string;
  phase: 'before' | 'after';
  target: string;
  handler: (...args: unknown[]) => unknown;
  priority: number;
}

export interface PluginEvent {
  type: string;
  pluginId: string;
  data: unknown;
  timestamp: number;
}

export interface PluginRegistry {
  widgets: Map<string, PluginWidgetConfig>;
  panels: Map<string, PluginPanelConfig>;
  toolbarItems: Map<string, PluginToolbarItem>;
  menuItems: Map<string, PluginMenuItem>;
  contextMenuItems: Map<string, PluginContextMenuItem>;
  themes: Map<string, PluginThemeConfig>;
  exporters: Map<string, PluginExporterConfig>;
  dataSources: Map<string, PluginDataSourceConfig>;
  hooks: Map<string, PluginHook[]>;
}

// =============================================================================
// Plugin Manager
// =============================================================================

export class PluginManager {
  private plugins: Map<string, PluginInstance> = new Map();
  private registry: PluginRegistry = {
    widgets: new Map(),
    panels: new Map(),
    toolbarItems: new Map(),
    menuItems: new Map(),
    contextMenuItems: new Map(),
    themes: new Map(),
    exporters: new Map(),
    dataSources: new Map(),
    hooks: new Map(),
  };
  private eventListeners: Map<string, Array<{ pluginId: string; handler: (...args: unknown[]) => void }>> = new Map();
  private pluginStorage: Map<string, Map<string, unknown>> = new Map();
  private loadOrder: string[] = [];
  private appVersion = '1.0.0';

  // ---------------------------------------------------------------------------
  // Plugin Lifecycle
  // ---------------------------------------------------------------------------

  async install(manifest: PluginManifest): Promise<boolean> {
    if (this.plugins.has(manifest.id)) {
      console.warn(`Plugin "${manifest.id}" is already installed`);
      return false;
    }

    // Check app version compatibility
    if (manifest.minAppVersion && !this.isVersionCompatible(this.appVersion, manifest.minAppVersion, '>=')) {
      throw new PluginError(`Plugin requires app version >= ${manifest.minAppVersion}`, manifest.id);
    }

    // Check dependencies
    for (const dep of manifest.dependencies) {
      if (!dep.optional && !this.plugins.has(dep.pluginId)) {
        throw new PluginError(`Missing required dependency: ${dep.pluginId}`, manifest.id);
      }
    }

    // Create plugin instance
    const instance: PluginInstance = {
      manifest,
      state: 'installed',
      settings: this.getDefaultSettings(manifest),
      api: this.createPluginAPI(manifest.id, manifest.permissions),
      installedAt: Date.now(),
      activatedAt: 0,
      loadTime: 0,
      memoryUsage: 0,
    };

    this.plugins.set(manifest.id, instance);
    this.pluginStorage.set(manifest.id, new Map());

    this.emitPluginEvent('plugin:installed', manifest.id, { name: manifest.name });
    return true;
  }

  async activate(pluginId: string): Promise<boolean> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new PluginError(`Plugin "${pluginId}" not found`, pluginId);
    }

    if (plugin.state === 'active') return true;
    if (plugin.state === 'error') {
      console.warn(`Plugin "${pluginId}" is in error state. Reset first.`);
      return false;
    }

    const startTime = performance.now();
    plugin.state = 'loading';

    try {
      // Activate dependencies first
      for (const dep of plugin.manifest.dependencies) {
        if (!dep.optional) {
          const depPlugin = this.plugins.get(dep.pluginId);
          if (depPlugin && depPlugin.state !== 'active') {
            await this.activate(dep.pluginId);
          }
        }
      }

      plugin.state = 'active';
      plugin.activatedAt = Date.now();
      plugin.loadTime = performance.now() - startTime;

      // Add to load order
      if (!this.loadOrder.includes(pluginId)) {
        this.loadOrder.push(pluginId);
      }

      this.emitPluginEvent('plugin:activated', pluginId, { loadTime: plugin.loadTime });
      return true;
    } catch (e) {
      plugin.state = 'error';
      plugin.lastError = String(e);
      this.emitPluginEvent('plugin:error', pluginId, { error: String(e) });
      return false;
    }
  }

  async deactivate(pluginId: string): Promise<boolean> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return false;
    if (plugin.state !== 'active') return true;

    // Check if other plugins depend on this one
    const dependents = this.getDependents(pluginId);
    for (const depId of dependents) {
      const dep = this.plugins.get(depId);
      if (dep && dep.state === 'active') {
        await this.deactivate(depId);
      }
    }

    // Cleanup registrations
    this.cleanupPluginRegistrations(pluginId);

    // Remove event listeners
    this.removePluginEventListeners(pluginId);

    plugin.state = 'inactive';

    // Remove from load order
    const idx = this.loadOrder.indexOf(pluginId);
    if (idx >= 0) this.loadOrder.splice(idx, 1);

    this.emitPluginEvent('plugin:deactivated', pluginId, {});
    return true;
  }

  async uninstall(pluginId: string): Promise<boolean> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return false;

    if (plugin.state === 'active') {
      await this.deactivate(pluginId);
    }

    // Check dependents
    const dependents = this.getDependents(pluginId);
    if (dependents.length > 0) {
      throw new PluginError(
        `Cannot uninstall: other plugins depend on this (${dependents.join(', ')})`,
        pluginId
      );
    }

    this.plugins.delete(pluginId);
    this.pluginStorage.delete(pluginId);

    this.emitPluginEvent('plugin:uninstalled', pluginId, {});
    return true;
  }

  async reload(pluginId: string): Promise<boolean> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return false;

    const wasActive = plugin.state === 'active';

    if (wasActive) {
      await this.deactivate(pluginId);
    }

    plugin.state = 'installed';
    plugin.lastError = undefined;

    if (wasActive) {
      return this.activate(pluginId);
    }

    return true;
  }

  // ---------------------------------------------------------------------------
  // Plugin Queries
  // ---------------------------------------------------------------------------

  getPlugin(id: string): PluginInstance | undefined {
    return this.plugins.get(id);
  }

  getPlugins(filter?: { state?: PluginState; category?: PluginCategory }): PluginInstance[] {
    let plugins = Array.from(this.plugins.values());

    if (filter?.state) {
      plugins = plugins.filter(p => p.state === filter.state);
    }
    if (filter?.category) {
      plugins = plugins.filter(p => p.manifest.category === filter.category);
    }

    return plugins;
  }

  getActivePlugins(): PluginInstance[] {
    return this.getPlugins({ state: 'active' });
  }

  isInstalled(pluginId: string): boolean {
    return this.plugins.has(pluginId);
  }

  isActive(pluginId: string): boolean {
    const plugin = this.plugins.get(pluginId);
    return plugin?.state === 'active';
  }

  getPluginCount(): { total: number; active: number; inactive: number; error: number } {
    const plugins = Array.from(this.plugins.values());
    return {
      total: plugins.length,
      active: plugins.filter(p => p.state === 'active').length,
      inactive: plugins.filter(p => p.state === 'inactive' || p.state === 'installed').length,
      error: plugins.filter(p => p.state === 'error').length,
    };
  }

  // ---------------------------------------------------------------------------
  // Registry Queries
  // ---------------------------------------------------------------------------

  getRegisteredWidgets(): PluginWidgetConfig[] {
    return Array.from(this.registry.widgets.values());
  }

  getRegisteredPanels(): PluginPanelConfig[] {
    return Array.from(this.registry.panels.values());
  }

  getRegisteredToolbarItems(): PluginToolbarItem[] {
    return Array.from(this.registry.toolbarItems.values()).sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  getRegisteredMenuItems(menu?: string): PluginMenuItem[] {
    let items = Array.from(this.registry.menuItems.values());
    if (menu) {
      items = items.filter(i => i.menu === menu);
    }
    return items.sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  getRegisteredThemes(): PluginThemeConfig[] {
    return Array.from(this.registry.themes.values());
  }

  getRegisteredExporters(): PluginExporterConfig[] {
    return Array.from(this.registry.exporters.values());
  }

  getRegisteredDataSources(): PluginDataSourceConfig[] {
    return Array.from(this.registry.dataSources.values());
  }

  // ---------------------------------------------------------------------------
  // Settings
  // ---------------------------------------------------------------------------

  getPluginSettings(pluginId: string): Record<string, unknown> {
    const plugin = this.plugins.get(pluginId);
    return plugin ? { ...plugin.settings } : {};
  }

  setPluginSetting(pluginId: string, key: string, value: unknown): void {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return;

    const setting = plugin.manifest.settings.find(s => s.key === key);
    if (setting?.validation) {
      const valid = this.validateSetting(value, setting);
      if (!valid) {
        throw new PluginError(`Invalid value for setting "${key}"`, pluginId);
      }
    }

    plugin.settings[key] = value;
    this.emitPluginEvent('plugin:setting:changed', pluginId, { key, value });
  }

  resetPluginSettings(pluginId: string): void {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return;
    plugin.settings = this.getDefaultSettings(plugin.manifest);
    this.emitPluginEvent('plugin:settings:reset', pluginId, {});
  }

  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  registerHook(pluginId: string, hook: PluginHook): void {
    const key = `${hook.phase}:${hook.target}`;
    if (!this.registry.hooks.has(key)) {
      this.registry.hooks.set(key, []);
    }
    this.registry.hooks.get(key)!.push({ ...hook, name: `${pluginId}:${hook.name}` });
    this.registry.hooks.get(key)!.sort((a, b) => a.priority - b.priority);
  }

  async runHooks(phase: 'before' | 'after', target: string, ...args: unknown[]): Promise<unknown> {
    const key = `${phase}:${target}`;
    const hooks = this.registry.hooks.get(key) || [];

    let result = args[0];
    for (const hook of hooks) {
      try {
        const hookResult = await hook.handler(result, ...args.slice(1));
        if (hookResult !== undefined) {
          result = hookResult;
        }
      } catch (e) {
        console.error(`Plugin hook error (${hook.name}):`, e);
      }
    }

    return result;
  }

  // ---------------------------------------------------------------------------
  // Search & Filter
  // ---------------------------------------------------------------------------

  searchPlugins(query: string): PluginInstance[] {
    const q = query.toLowerCase();
    return Array.from(this.plugins.values()).filter(p => {
      const m = p.manifest;
      return (
        m.name.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.tags.some(t => t.toLowerCase().includes(q)) ||
        m.category.toLowerCase().includes(q) ||
        m.author.toLowerCase().includes(q)
      );
    });
  }

  getPluginsByCategory(): Map<PluginCategory, PluginInstance[]> {
    const categories = new Map<PluginCategory, PluginInstance[]>();
    for (const plugin of this.plugins.values()) {
      const cat = plugin.manifest.category;
      if (!categories.has(cat)) {
        categories.set(cat, []);
      }
      categories.get(cat)!.push(plugin);
    }
    return categories;
  }

  // ---------------------------------------------------------------------------
  // Import / Export
  // ---------------------------------------------------------------------------

  exportPluginConfig(pluginId: string): string {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) throw new PluginError(`Plugin "${pluginId}" not found`, pluginId);

    const storage = this.pluginStorage.get(pluginId);
    const storageObj: Record<string, unknown> = {};
    if (storage) {
      for (const [key, value] of storage.entries()) {
        storageObj[key] = value;
      }
    }

    return JSON.stringify({
      manifest: plugin.manifest,
      settings: plugin.settings,
      storage: storageObj,
    }, null, 2);
  }

  importPluginConfig(data: string): string {
    const config = JSON.parse(data);
    const manifest = config.manifest as PluginManifest;

    // Install if not already installed
    if (!this.plugins.has(manifest.id)) {
      this.install(manifest);
    }

    // Apply settings
    if (config.settings) {
      const plugin = this.plugins.get(manifest.id)!;
      plugin.settings = { ...plugin.settings, ...config.settings };
    }

    // Apply storage
    if (config.storage) {
      const storage = this.pluginStorage.get(manifest.id) || new Map();
      for (const [key, value] of Object.entries(config.storage)) {
        storage.set(key, value);
      }
      this.pluginStorage.set(manifest.id, storage);
    }

    return manifest.id;
  }

  // ---------------------------------------------------------------------------
  // Private Helpers
  // ---------------------------------------------------------------------------

  private createPluginAPI(pluginId: string, permissions: PluginPermission[]): PluginAPI {
    const self = this;

    const checkPermission = (required: PluginPermission) => {
      if (!permissions.includes(required)) {
        throw new PluginError(`Missing permission: ${required}`, pluginId);
      }
    };

    return {
      registerWidget: (config) => {
        checkPermission('write:widgets');
        self.registry.widgets.set(`${pluginId}:${config.type}`, config);
      },
      unregisterWidget: (type) => {
        self.registry.widgets.delete(`${pluginId}:${type}`);
      },
      registerPanel: (config) => {
        checkPermission('ui:panel');
        self.registry.panels.set(`${pluginId}:${config.id}`, config);
      },
      unregisterPanel: (id) => {
        self.registry.panels.delete(`${pluginId}:${id}`);
      },
      registerToolbarItem: (config) => {
        checkPermission('ui:toolbar');
        self.registry.toolbarItems.set(`${pluginId}:${config.id}`, config);
      },
      unregisterToolbarItem: (id) => {
        self.registry.toolbarItems.delete(`${pluginId}:${id}`);
      },
      registerMenuItem: (config) => {
        checkPermission('ui:menu');
        self.registry.menuItems.set(`${pluginId}:${config.id}`, config);
      },
      unregisterMenuItem: (id) => {
        self.registry.menuItems.delete(`${pluginId}:${id}`);
      },
      registerContextMenuItem: (config) => {
        checkPermission('ui:menu');
        self.registry.contextMenuItems.set(`${pluginId}:${config.id}`, config);
      },
      unregisterContextMenuItem: (id) => {
        self.registry.contextMenuItems.delete(`${pluginId}:${id}`);
      },
      registerTheme: (config) => {
        checkPermission('write:theme');
        self.registry.themes.set(`${pluginId}:${config.id}`, config);
      },
      unregisterTheme: (id) => {
        self.registry.themes.delete(`${pluginId}:${id}`);
      },
      registerExporter: (config) => {
        checkPermission('export:custom');
        self.registry.exporters.set(`${pluginId}:${config.id}`, config);
      },
      unregisterExporter: (id) => {
        self.registry.exporters.delete(`${pluginId}:${id}`);
      },
      registerDataSource: (config) => {
        checkPermission('read:project');
        self.registry.dataSources.set(`${pluginId}:${config.id}`, config);
      },
      unregisterDataSource: (id) => {
        self.registry.dataSources.delete(`${pluginId}:${id}`);
      },
      on: (event, handler) => {
        checkPermission('events:listen');
        if (!self.eventListeners.has(event)) {
          self.eventListeners.set(event, []);
        }
        self.eventListeners.get(event)!.push({ pluginId, handler });
        return () => {
          const listeners = self.eventListeners.get(event);
          if (listeners) {
            const idx = listeners.findIndex(l => l.pluginId === pluginId && l.handler === handler);
            if (idx >= 0) listeners.splice(idx, 1);
          }
        };
      },
      emit: (event, data) => {
        checkPermission('events:emit');
        self.emitPluginEvent(event, pluginId, data);
      },
      getStorage: (key) => {
        checkPermission('storage:local');
        return self.pluginStorage.get(pluginId)?.get(key);
      },
      setStorage: (key, value) => {
        checkPermission('storage:local');
        const storage = self.pluginStorage.get(pluginId) || new Map();
        storage.set(key, value);
        self.pluginStorage.set(pluginId, storage);
      },
      removeStorage: (key) => {
        checkPermission('storage:local');
        self.pluginStorage.get(pluginId)?.delete(key);
      },
      getSetting: (key) => {
        const plugin = self.plugins.get(pluginId);
        return plugin?.settings[key];
      },
      setSetting: (key, value) => {
        self.setPluginSetting(pluginId, key, value);
      },
      showNotification: (message, type = 'info') => {
        checkPermission('ui:notification');
        self.emitPluginEvent('ui:notification', pluginId, { message, type });
      },
      showModal: (config) => {
        checkPermission('ui:modal');
        self.emitPluginEvent('ui:modal:show', pluginId, config);
      },
      closeModal: (id) => {
        self.emitPluginEvent('ui:modal:close', pluginId, { id });
      },
      log: (...args) => console.log(`[Plugin: ${pluginId}]`, ...args),
      warn: (...args) => console.warn(`[Plugin: ${pluginId}]`, ...args),
      error: (...args) => console.error(`[Plugin: ${pluginId}]`, ...args),
      generateId: () => `${pluginId}_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 6)}`,
      getAppVersion: () => self.appVersion,
      getLocale: () => 'en',
    };
  }

  private getDefaultSettings(manifest: PluginManifest): Record<string, unknown> {
    const settings: Record<string, unknown> = {};
    for (const setting of manifest.settings) {
      settings[setting.key] = setting.defaultValue;
    }
    return settings;
  }

  private validateSetting(value: unknown, setting: PluginSetting): boolean {
    if (!setting.validation) return true;

    const v = setting.validation;

    if (v.required && (value === undefined || value === null || value === '')) return false;
    if (typeof value === 'number') {
      if (v.min !== undefined && value < v.min) return false;
      if (v.max !== undefined && value > v.max) return false;
    }
    if (typeof value === 'string') {
      if (v.minLength !== undefined && value.length < v.minLength) return false;
      if (v.maxLength !== undefined && value.length > v.maxLength) return false;
      if (v.pattern && !new RegExp(v.pattern).test(value)) return false;
    }

    return true;
  }

  private getDependents(pluginId: string): string[] {
    const dependents: string[] = [];
    for (const [id, plugin] of this.plugins.entries()) {
      if (plugin.manifest.dependencies.some(d => d.pluginId === pluginId && !d.optional)) {
        dependents.push(id);
      }
    }
    return dependents;
  }

  private cleanupPluginRegistrations(pluginId: string): void {
    const prefix = `${pluginId}:`;
    for (const map of [
      this.registry.widgets,
      this.registry.panels,
      this.registry.toolbarItems,
      this.registry.menuItems,
      this.registry.contextMenuItems,
      this.registry.themes,
      this.registry.exporters,
      this.registry.dataSources,
    ]) {
      for (const key of (map as Map<string, unknown>).keys()) {
        if (key.startsWith(prefix)) {
          (map as Map<string, unknown>).delete(key);
        }
      }
    }
  }

  private removePluginEventListeners(pluginId: string): void {
    for (const [event, listeners] of this.eventListeners.entries()) {
      const filtered = listeners.filter(l => l.pluginId !== pluginId);
      if (filtered.length === 0) {
        this.eventListeners.delete(event);
      } else {
        this.eventListeners.set(event, filtered);
      }
    }
  }

  private emitPluginEvent(type: string, pluginId: string, data: unknown): void {
    const listeners = this.eventListeners.get(type) || [];
    for (const listener of listeners) {
      try {
        listener.handler({ type, pluginId, data, timestamp: Date.now() });
      } catch (e) {
        console.error(`Plugin event error (${type}, ${listener.pluginId}):`, e);
      }
    }
  }

  private isVersionCompatible(current: string, required: string, op: '>=' | '<=' | '='): boolean {
    const parse = (v: string) => v.split('.').map(Number);
    const c = parse(current);
    const r = parse(required);

    for (let i = 0; i < 3; i++) {
      const cv = c[i] || 0;
      const rv = r[i] || 0;

      switch (op) {
        case '>=':
          if (cv > rv) return true;
          if (cv < rv) return false;
          break;
        case '<=':
          if (cv < rv) return true;
          if (cv > rv) return false;
          break;
        case '=':
          if (cv !== rv) return false;
          break;
      }
    }

    return true;
  }
}

// =============================================================================
// Plugin Error
// =============================================================================

export class PluginError extends Error {
  pluginId: string;
  constructor(message: string, pluginId: string) {
    super(message);
    this.name = 'PluginError';
    this.pluginId = pluginId;
  }
}

// =============================================================================
// Built-in Plugin Manifests
// =============================================================================

export const BUILT_IN_PLUGINS: PluginManifest[] = [
  {
    id: 'core-widgets',
    name: 'Core Widgets',
    version: '1.0.0',
    description: 'Essential building blocks: Text, Button, Image, Container, and more',
    author: 'System',
    license: 'MIT',
    category: 'widgets',
    tags: ['core', 'widgets', 'essential'],
    dependencies: [],
    permissions: ['write:widgets', 'read:widgets'],
    entryPoint: 'core-widgets',
    settings: [],
    isBuiltIn: true,
    size: 0,
  },
  {
    id: 'form-widgets',
    name: 'Form Widgets',
    version: '1.0.0',
    description: 'Form controls: Input, Select, Checkbox, Radio, Toggle, DatePicker',
    author: 'System',
    license: 'MIT',
    category: 'forms',
    tags: ['forms', 'input', 'widgets'],
    dependencies: [{ pluginId: 'core-widgets', version: '1.0.0', optional: false }],
    permissions: ['write:widgets', 'read:widgets'],
    entryPoint: 'form-widgets',
    settings: [],
    isBuiltIn: true,
    size: 0,
  },
  {
    id: 'layout-engine',
    name: 'Layout Engine',
    version: '1.0.0',
    description: 'Advanced layout tools: Grid, Flexbox, Auto-layout, Constraints',
    author: 'System',
    license: 'MIT',
    category: 'layout',
    tags: ['layout', 'grid', 'flexbox', 'responsive'],
    dependencies: [],
    permissions: ['read:widgets', 'write:widgets', 'canvas:render'],
    entryPoint: 'layout-engine',
    settings: [
      { key: 'defaultLayout', type: 'select', label: 'Default Layout', description: 'Default layout mode for new containers', defaultValue: 'flex', options: [{ label: 'Flex', value: 'flex' }, { label: 'Grid', value: 'grid' }, { label: 'Absolute', value: 'absolute' }] },
      { key: 'snapToGrid', type: 'boolean', label: 'Snap to Grid', description: 'Enable snap to grid by default', defaultValue: true },
      { key: 'gridSize', type: 'number', label: 'Grid Size', description: 'Grid cell size in pixels', defaultValue: 8, validation: { min: 1, max: 100 } },
    ],
    isBuiltIn: true,
    size: 0,
  },
  {
    id: 'animation-toolkit',
    name: 'Animation Toolkit',
    version: '1.0.0',
    description: 'Comprehensive animation system with 50+ presets and custom keyframes',
    author: 'System',
    license: 'MIT',
    category: 'animations',
    tags: ['animation', 'motion', 'transitions', 'keyframes'],
    dependencies: [],
    permissions: ['write:widgets', 'read:widgets', 'canvas:render'],
    entryPoint: 'animation-toolkit',
    settings: [
      { key: 'defaultDuration', type: 'number', label: 'Default Duration', description: 'Default animation duration (ms)', defaultValue: 300, validation: { min: 0, max: 10000 } },
      { key: 'defaultEasing', type: 'select', label: 'Default Easing', description: 'Default easing function', defaultValue: 'ease', options: [{ label: 'Ease', value: 'ease' }, { label: 'Linear', value: 'linear' }, { label: 'Ease In', value: 'ease-in' }, { label: 'Ease Out', value: 'ease-out' }, { label: 'Ease In Out', value: 'ease-in-out' }] },
      { key: 'reducedMotion', type: 'boolean', label: 'Respect Reduced Motion', description: 'Disable animations when user prefers reduced motion', defaultValue: true },
    ],
    isBuiltIn: true,
    size: 0,
  },
  {
    id: 'seo-tools',
    name: 'SEO Tools',
    version: '1.0.0',
    description: 'SEO optimization: meta tags, Open Graph, Twitter Cards, structured data, sitemap',
    author: 'System',
    license: 'MIT',
    category: 'seo',
    tags: ['seo', 'meta', 'opengraph', 'schema', 'sitemap'],
    dependencies: [],
    permissions: ['read:project', 'write:project', 'read:pages', 'write:pages'],
    entryPoint: 'seo-tools',
    settings: [
      { key: 'autoAudit', type: 'boolean', label: 'Auto SEO Audit', description: 'Automatically run SEO audit on save', defaultValue: true },
      { key: 'defaultRobots', type: 'string', label: 'Default Robots', description: 'Default robots meta tag', defaultValue: 'index, follow' },
    ],
    isBuiltIn: true,
    size: 0,
  },
  {
    id: 'accessibility-checker',
    name: 'Accessibility Checker',
    version: '1.0.0',
    description: 'WCAG 2.1 compliance checking with automated audits and suggestions',
    author: 'System',
    license: 'MIT',
    category: 'accessibility',
    tags: ['a11y', 'wcag', 'accessibility', 'aria'],
    dependencies: [],
    permissions: ['read:widgets', 'read:pages', 'ui:notification'],
    entryPoint: 'accessibility-checker',
    settings: [
      { key: 'wcagLevel', type: 'select', label: 'WCAG Level', description: 'Target WCAG compliance level', defaultValue: 'AA', options: [{ label: 'A', value: 'A' }, { label: 'AA', value: 'AA' }, { label: 'AAA', value: 'AAA' }] },
      { key: 'autoCheck', type: 'boolean', label: 'Auto Check', description: 'Run accessibility checks automatically', defaultValue: true },
    ],
    isBuiltIn: true,
    size: 0,
  },
  {
    id: 'theme-engine',
    name: 'Theme Engine',
    version: '1.0.0',
    description: 'Full theming system with 10 presets, CSS variables, and custom themes',
    author: 'System',
    license: 'MIT',
    category: 'themes',
    tags: ['theme', 'dark-mode', 'customization', 'colors'],
    dependencies: [],
    permissions: ['read:theme', 'write:theme', 'read:settings', 'write:settings'],
    entryPoint: 'theme-engine',
    settings: [
      { key: 'defaultTheme', type: 'select', label: 'Default Theme', description: 'Default theme for new projects', defaultValue: 'dark-indigo', options: [{ label: 'Dark Indigo', value: 'dark-indigo' }, { label: 'Light Clean', value: 'light-clean' }] },
      { key: 'syncWithSystem', type: 'boolean', label: 'Sync with System', description: 'Automatically switch between light and dark themes based on OS preference', defaultValue: false },
    ],
    isBuiltIn: true,
    size: 0,
  },
  {
    id: 'data-connector',
    name: 'Data Connector',
    version: '1.0.0',
    description: 'Connect to REST APIs, GraphQL endpoints, and static data sources',
    author: 'System',
    license: 'MIT',
    category: 'data',
    tags: ['data', 'api', 'rest', 'graphql', 'binding'],
    dependencies: [],
    permissions: ['network:fetch', 'read:project', 'write:project', 'storage:local'],
    entryPoint: 'data-connector',
    settings: [
      { key: 'timeout', type: 'number', label: 'Request Timeout', description: 'Default request timeout (ms)', defaultValue: 30000, validation: { min: 1000, max: 120000 } },
      { key: 'retryCount', type: 'number', label: 'Retry Count', description: 'Number of retries on failure', defaultValue: 3, validation: { min: 0, max: 10 } },
      { key: 'cacheResults', type: 'boolean', label: 'Cache Results', description: 'Cache API results', defaultValue: true },
    ],
    isBuiltIn: true,
    size: 0,
  },
  {
    id: 'export-html',
    name: 'HTML Exporter',
    version: '1.0.0',
    description: 'Export projects as clean, optimized HTML/CSS',
    author: 'System',
    license: 'MIT',
    category: 'export',
    tags: ['export', 'html', 'css', 'static'],
    dependencies: [],
    permissions: ['read:project', 'read:pages', 'read:widgets', 'export:html'],
    entryPoint: 'export-html',
    settings: [
      { key: 'minify', type: 'boolean', label: 'Minify Output', description: 'Minify HTML and CSS output', defaultValue: true },
      { key: 'inlineCSS', type: 'boolean', label: 'Inline CSS', description: 'Inline CSS instead of external stylesheet', defaultValue: false },
      { key: 'includeReset', type: 'boolean', label: 'Include CSS Reset', description: 'Include CSS reset/normalize', defaultValue: true },
    ],
    isBuiltIn: true,
    size: 0,
  },
  {
    id: 'export-react',
    name: 'React Exporter',
    version: '1.0.0',
    description: 'Export projects as React components with TypeScript support',
    author: 'System',
    license: 'MIT',
    category: 'export',
    tags: ['export', 'react', 'typescript', 'components'],
    dependencies: [],
    permissions: ['read:project', 'read:pages', 'read:widgets', 'export:react'],
    entryPoint: 'export-react',
    settings: [
      { key: 'typescript', type: 'boolean', label: 'TypeScript', description: 'Generate TypeScript files', defaultValue: true },
      { key: 'cssModule', type: 'boolean', label: 'CSS Modules', description: 'Use CSS Modules for styling', defaultValue: true },
      { key: 'stateManagement', type: 'select', label: 'State Management', description: 'State management library', defaultValue: 'hooks', options: [{ label: 'React Hooks', value: 'hooks' }, { label: 'Redux', value: 'redux' }, { label: 'Zustand', value: 'zustand' }, { label: 'None', value: 'none' }] },
    ],
    isBuiltIn: true,
    size: 0,
  },
];

// =============================================================================
// Category Labels
// =============================================================================

export const PLUGIN_CATEGORY_LABELS: Record<PluginCategory, string> = {
  widgets: 'Widgets',
  themes: 'Themes',
  integrations: 'Integrations',
  analytics: 'Analytics',
  seo: 'SEO',
  performance: 'Performance',
  accessibility: 'Accessibility',
  collaboration: 'Collaboration',
  ai: 'AI / ML',
  animations: 'Animations',
  data: 'Data',
  forms: 'Forms',
  media: 'Media',
  security: 'Security',
  devtools: 'Developer Tools',
  export: 'Export',
  i18n: 'Internationalization',
  layout: 'Layout',
  navigation: 'Navigation',
  utility: 'Utility',
};

// =============================================================================
// Singleton Instance
// =============================================================================

export const pluginManager = new PluginManager();
