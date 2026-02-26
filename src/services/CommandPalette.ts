// =============================================================================
// Command Palette Service - Unified command system with search, keyboard
// shortcuts, categories, history, and extensible command registration
// =============================================================================

// =============================================================================
// Command Types
// =============================================================================

export interface Command {
  id: string;
  title: string;
  description?: string;
  category: CommandCategory;
  icon?: string;
  shortcut?: string;
  keywords?: string[];
  handler: (context?: CommandContext) => void | Promise<void>;
  isAvailable?: (context?: CommandContext) => boolean;
  isChecked?: (context?: CommandContext) => boolean;
  priority?: number;
  group?: string;
  submenu?: Command[];
}

export type CommandCategory =
  | 'file' | 'edit' | 'view' | 'insert' | 'format' | 'tools'
  | 'layout' | 'style' | 'widget' | 'page' | 'navigation'
  | 'help' | 'debug' | 'plugin' | 'project' | 'export';

export interface CommandContext {
  selectedWidgetIds?: string[];
  currentPageId?: string;
  projectId?: string;
  canvasZoom?: number;
  clipboard?: boolean;
  undoAvailable?: boolean;
  redoAvailable?: boolean;
  activePanel?: string;
  user?: { role: string; permissions: string[] };
  extraData?: Record<string, unknown>;
}

export interface CommandSearchResult {
  command: Command;
  score: number;
  matchedTitle: string;
  matchedDescription?: string;
  highlights: { start: number; end: number }[];
}

export interface CommandHistoryEntry {
  commandId: string;
  timestamp: number;
  context?: Record<string, unknown>;
}

// =============================================================================
// Command Registry
// =============================================================================

export class CommandRegistry {
  private commands: Map<string, Command> = new Map();
  private history: CommandHistoryEntry[] = [];
  private maxHistory: number;
  private listeners: Map<string, ((command: Command) => void)[]> = new Map();

  constructor(maxHistory: number = 100) {
    this.maxHistory = maxHistory;
  }

  register(command: Command): void {
    this.commands.set(command.id, command);
  }

  registerMany(commands: Command[]): void {
    for (const cmd of commands) {
      this.register(cmd);
    }
  }

  unregister(commandId: string): void {
    this.commands.delete(commandId);
  }

  get(commandId: string): Command | undefined {
    return this.commands.get(commandId);
  }

  getAll(): Command[] {
    return Array.from(this.commands.values());
  }

  getByCategory(category: CommandCategory): Command[] {
    return this.getAll().filter(cmd => cmd.category === category);
  }

  getByGroup(group: string): Command[] {
    return this.getAll().filter(cmd => cmd.group === group);
  }

  getAvailable(context?: CommandContext): Command[] {
    return this.getAll().filter(cmd => !cmd.isAvailable || cmd.isAvailable(context));
  }

  async execute(commandId: string, context?: CommandContext): Promise<void> {
    const command = this.commands.get(commandId);
    if (!command) {
      console.warn(`Command not found: ${commandId}`);
      return;
    }

    if (command.isAvailable && !command.isAvailable(context)) {
      console.warn(`Command not available: ${commandId}`);
      return;
    }

    try {
      await command.handler(context);

      this.history.push({
        commandId,
        timestamp: Date.now(),
        context: context ? { ...context } as Record<string, unknown> : undefined,
      });

      if (this.history.length > this.maxHistory) {
        this.history = this.history.slice(-this.maxHistory);
      }

      // Notify listeners
      const handlers = this.listeners.get(commandId) || [];
      for (const handler of handlers) {
        try { handler(command); } catch (e) { console.error(e); }
      }

      const allHandlers = this.listeners.get('*') || [];
      for (const handler of allHandlers) {
        try { handler(command); } catch (e) { console.error(e); }
      }
    } catch (error) {
      console.error(`Error executing command ${commandId}:`, error);
      throw error;
    }
  }

  onExecute(commandId: string, handler: (command: Command) => void): () => void {
    if (!this.listeners.has(commandId)) {
      this.listeners.set(commandId, []);
    }
    this.listeners.get(commandId)!.push(handler);

    return () => {
      const handlers = this.listeners.get(commandId);
      if (handlers) {
        this.listeners.set(commandId, handlers.filter(h => h !== handler));
      }
    };
  }

  search(query: string, context?: CommandContext, limit: number = 20): CommandSearchResult[] {
    if (!query.trim()) {
      // Return recent commands
      return this.getRecentCommands(limit).map(entry => {
        const cmd = this.commands.get(entry.commandId)!;
        return {
          command: cmd,
          score: 100,
          matchedTitle: cmd.title,
          highlights: [],
        };
      }).filter(r => r.command);
    }

    const lowerQuery = query.toLowerCase();
    const results: CommandSearchResult[] = [];

    const available = this.getAvailable(context);

    for (const cmd of available) {
      let score = 0;
      const highlights: { start: number; end: number }[] = [];

      // Title match
      const titleLower = cmd.title.toLowerCase();
      const titleIndex = titleLower.indexOf(lowerQuery);
      if (titleIndex !== -1) {
        score += 100 - titleIndex; // Prefer matches at start
        highlights.push({ start: titleIndex, end: titleIndex + query.length });
      }

      // Exact title match bonus
      if (titleLower === lowerQuery) {
        score += 200;
      }

      // Word start match bonus
      if (titleLower.startsWith(lowerQuery)) {
        score += 50;
      }

      // ID match
      if (cmd.id.toLowerCase().includes(lowerQuery)) {
        score += 30;
      }

      // Description match
      const descMatch = cmd.description?.toLowerCase().includes(lowerQuery);
      if (descMatch) {
        score += 20;
      }

      // Keywords match
      const keywordMatch = cmd.keywords?.some(k => k.toLowerCase().includes(lowerQuery));
      if (keywordMatch) {
        score += 40;
      }

      // Category match
      if (cmd.category.toLowerCase().includes(lowerQuery)) {
        score += 15;
      }

      // Fuzzy match
      if (score === 0) {
        const fuzzyScore = fuzzyMatch(lowerQuery, titleLower);
        if (fuzzyScore > 0) {
          score = fuzzyScore;
        }
      }

      // Recent usage bonus
      const recentIndex = this.history.findIndex(h => h.commandId === cmd.id);
      if (recentIndex !== -1) {
        score += 10 + Math.max(0, 10 - recentIndex);
      }

      // Priority bonus
      if (cmd.priority) {
        score += cmd.priority;
      }

      if (score > 0) {
        results.push({
          command: cmd,
          score,
          matchedTitle: cmd.title,
          matchedDescription: descMatch ? cmd.description : undefined,
          highlights,
        });
      }
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  getRecentCommands(limit: number = 10): CommandHistoryEntry[] {
    const seen = new Set<string>();
    const recent: CommandHistoryEntry[] = [];

    for (let i = this.history.length - 1; i >= 0 && recent.length < limit; i--) {
      const entry = this.history[i];
      if (!seen.has(entry.commandId)) {
        seen.add(entry.commandId);
        recent.push(entry);
      }
    }

    return recent;
  }

  getFrequentCommands(limit: number = 10): { commandId: string; count: number }[] {
    const counts = new Map<string, number>();
    for (const entry of this.history) {
      counts.set(entry.commandId, (counts.get(entry.commandId) || 0) + 1);
    }

    return Array.from(counts.entries())
      .map(([commandId, count]) => ({ commandId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  clearHistory(): void {
    this.history = [];
  }

  getCategories(): { category: CommandCategory; count: number }[] {
    const cats = new Map<CommandCategory, number>();
    for (const cmd of this.commands.values()) {
      cats.set(cmd.category, (cats.get(cmd.category) || 0) + 1);
    }
    return Array.from(cats.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => a.category.localeCompare(b.category));
  }
}

// =============================================================================
// Fuzzy Matching
// =============================================================================

function fuzzyMatch(query: string, target: string): number {
  const queryLen = query.length;
  const targetLen = target.length;

  if (queryLen > targetLen) return 0;
  if (queryLen === targetLen) return query === target ? 100 : 0;

  let queryIndex = 0;
  let score = 0;
  let consecutive = 0;
  let prevMatchIndex = -2;

  for (let i = 0; i < targetLen && queryIndex < queryLen; i++) {
    if (query[queryIndex] === target[i]) {
      queryIndex++;
      score += 1;

      if (i === prevMatchIndex + 1) {
        consecutive++;
        score += consecutive * 2;
      } else {
        consecutive = 0;
      }

      // Bonus for matching at word start
      if (i === 0 || target[i - 1] === ' ' || target[i - 1] === '-' || target[i - 1] === '_') {
        score += 5;
      }

      prevMatchIndex = i;
    }
  }

  return queryIndex === queryLen ? score : 0;
}

// =============================================================================
// Built-in Commands
// =============================================================================

export const BUILT_IN_COMMANDS: Command[] = [
  // File commands
  { id: 'file.new', title: 'New Project', category: 'file', shortcut: 'Ctrl+N', icon: 'plus', keywords: ['create', 'new', 'project'], handler: () => {}, priority: 10 },
  { id: 'file.open', title: 'Open Project', category: 'file', shortcut: 'Ctrl+O', icon: 'folder-open', keywords: ['load', 'open'], handler: () => {}, priority: 10 },
  { id: 'file.save', title: 'Save', category: 'file', shortcut: 'Ctrl+S', icon: 'save', keywords: ['save', 'store'], handler: () => {}, priority: 10 },
  { id: 'file.saveAs', title: 'Save As...', category: 'file', shortcut: 'Ctrl+Shift+S', icon: 'save', keywords: ['save', 'copy'], handler: () => {} },
  { id: 'file.export', title: 'Export Project', category: 'file', shortcut: 'Ctrl+E', icon: 'download', keywords: ['export', 'download'], handler: () => {} },
  { id: 'file.import', title: 'Import', category: 'file', icon: 'upload', keywords: ['import', 'upload', 'load'], handler: () => {} },
  { id: 'file.publish', title: 'Publish', category: 'file', shortcut: 'Ctrl+Shift+P', icon: 'cloud-upload', keywords: ['publish', 'deploy', 'live'], handler: () => {} },
  { id: 'file.preview', title: 'Preview', category: 'file', shortcut: 'Ctrl+Shift+Enter', icon: 'eye', keywords: ['preview', 'view'], handler: () => {} },

  // Edit commands
  { id: 'edit.undo', title: 'Undo', category: 'edit', shortcut: 'Ctrl+Z', icon: 'undo', handler: () => {}, isAvailable: (ctx) => ctx?.undoAvailable !== false },
  { id: 'edit.redo', title: 'Redo', category: 'edit', shortcut: 'Ctrl+Shift+Z', icon: 'redo', handler: () => {}, isAvailable: (ctx) => ctx?.redoAvailable !== false },
  { id: 'edit.cut', title: 'Cut', category: 'edit', shortcut: 'Ctrl+X', icon: 'scissors', handler: () => {}, isAvailable: (ctx) => (ctx?.selectedWidgetIds?.length || 0) > 0 },
  { id: 'edit.copy', title: 'Copy', category: 'edit', shortcut: 'Ctrl+C', icon: 'copy', handler: () => {}, isAvailable: (ctx) => (ctx?.selectedWidgetIds?.length || 0) > 0 },
  { id: 'edit.paste', title: 'Paste', category: 'edit', shortcut: 'Ctrl+V', icon: 'clipboard', handler: () => {}, isAvailable: (ctx) => ctx?.clipboard === true },
  { id: 'edit.delete', title: 'Delete Selected', category: 'edit', shortcut: 'Delete', icon: 'trash', handler: () => {}, isAvailable: (ctx) => (ctx?.selectedWidgetIds?.length || 0) > 0 },
  { id: 'edit.selectAll', title: 'Select All', category: 'edit', shortcut: 'Ctrl+A', icon: 'select-all', handler: () => {} },
  { id: 'edit.deselectAll', title: 'Deselect All', category: 'edit', shortcut: 'Escape', icon: 'x', handler: () => {} },
  { id: 'edit.duplicate', title: 'Duplicate', category: 'edit', shortcut: 'Ctrl+D', icon: 'copy', keywords: ['clone', 'duplicate'], handler: () => {} },
  { id: 'edit.findReplace', title: 'Find & Replace', category: 'edit', shortcut: 'Ctrl+H', icon: 'search', handler: () => {} },

  // View commands
  { id: 'view.zoomIn', title: 'Zoom In', category: 'view', shortcut: 'Ctrl+=', icon: 'zoom-in', handler: () => {} },
  { id: 'view.zoomOut', title: 'Zoom Out', category: 'view', shortcut: 'Ctrl+-', icon: 'zoom-out', handler: () => {} },
  { id: 'view.zoomFit', title: 'Zoom to Fit', category: 'view', shortcut: 'Ctrl+0', icon: 'maximize', handler: () => {} },
  { id: 'view.zoom100', title: 'Zoom to 100%', category: 'view', shortcut: 'Ctrl+1', icon: 'maximize', handler: () => {} },
  { id: 'view.toggleGrid', title: 'Toggle Grid', category: 'view', shortcut: "Ctrl+'", icon: 'grid', handler: () => {} },
  { id: 'view.toggleRulers', title: 'Toggle Rulers', category: 'view', shortcut: 'Ctrl+R', icon: 'ruler', handler: () => {} },
  { id: 'view.toggleGuides', title: 'Toggle Smart Guides', category: 'view', icon: 'align-left', handler: () => {} },
  { id: 'view.toggleOutlines', title: 'Toggle Outlines', category: 'view', icon: 'square', handler: () => {} },
  { id: 'view.fullscreen', title: 'Toggle Fullscreen', category: 'view', shortcut: 'F11', icon: 'maximize', handler: () => {} },
  { id: 'view.toggleDarkMode', title: 'Toggle Dark Mode', category: 'view', icon: 'moon', keywords: ['dark', 'light', 'theme'], handler: () => {} },
  { id: 'view.toggleLeftPanel', title: 'Toggle Left Panel', category: 'view', shortcut: 'Ctrl+[', icon: 'sidebar', handler: () => {} },
  { id: 'view.toggleRightPanel', title: 'Toggle Right Panel', category: 'view', shortcut: 'Ctrl+]', icon: 'sidebar', handler: () => {} },

  // Insert commands
  { id: 'insert.text', title: 'Insert Text', category: 'insert', shortcut: 'T', icon: 'type', keywords: ['text', 'heading', 'paragraph'], handler: () => {} },
  { id: 'insert.image', title: 'Insert Image', category: 'insert', icon: 'image', keywords: ['image', 'photo', 'picture'], handler: () => {} },
  { id: 'insert.button', title: 'Insert Button', category: 'insert', shortcut: 'B', icon: 'square', keywords: ['button', 'cta'], handler: () => {} },
  { id: 'insert.container', title: 'Insert Container', category: 'insert', shortcut: 'D', icon: 'box', keywords: ['div', 'container', 'section'], handler: () => {} },
  { id: 'insert.input', title: 'Insert Input', category: 'insert', icon: 'edit', keywords: ['input', 'field', 'form'], handler: () => {} },
  { id: 'insert.video', title: 'Insert Video', category: 'insert', icon: 'video', keywords: ['video', 'media', 'embed'], handler: () => {} },
  { id: 'insert.icon', title: 'Insert Icon', category: 'insert', icon: 'star', keywords: ['icon', 'symbol'], handler: () => {} },
  { id: 'insert.form', title: 'Insert Form', category: 'insert', icon: 'file-text', keywords: ['form', 'signup', 'contact'], handler: () => {} },
  { id: 'insert.navbar', title: 'Insert Navigation', category: 'insert', icon: 'menu', keywords: ['nav', 'menu', 'header'], handler: () => {} },
  { id: 'insert.footer', title: 'Insert Footer', category: 'insert', icon: 'layout', keywords: ['footer', 'bottom'], handler: () => {} },
  { id: 'insert.grid', title: 'Insert Grid Layout', category: 'insert', icon: 'grid', keywords: ['grid', 'columns', 'layout'], handler: () => {} },
  { id: 'insert.flex', title: 'Insert Flex Layout', category: 'insert', icon: 'columns', keywords: ['flex', 'row', 'column'], handler: () => {} },
  { id: 'insert.map', title: 'Insert Map', category: 'insert', icon: 'map', keywords: ['map', 'location', 'google'], handler: () => {} },
  { id: 'insert.chart', title: 'Insert Chart', category: 'insert', icon: 'bar-chart', keywords: ['chart', 'graph', 'data'], handler: () => {} },
  { id: 'insert.table', title: 'Insert Table', category: 'insert', icon: 'table', keywords: ['table', 'data', 'grid'], handler: () => {} },
  { id: 'insert.carousel', title: 'Insert Carousel', category: 'insert', icon: 'layers', keywords: ['carousel', 'slider', 'slideshow'], handler: () => {} },
  { id: 'insert.modal', title: 'Insert Modal', category: 'insert', icon: 'maximize', keywords: ['modal', 'dialog', 'popup'], handler: () => {} },
  { id: 'insert.accordion', title: 'Insert Accordion', category: 'insert', icon: 'chevrons-down', keywords: ['accordion', 'collapse', 'faq'], handler: () => {} },
  { id: 'insert.tabs', title: 'Insert Tabs', category: 'insert', icon: 'columns', keywords: ['tabs', 'panel'], handler: () => {} },

  // Format commands
  { id: 'format.bold', title: 'Bold', category: 'format', shortcut: 'Ctrl+B', icon: 'bold', handler: () => {} },
  { id: 'format.italic', title: 'Italic', category: 'format', shortcut: 'Ctrl+I', icon: 'italic', handler: () => {} },
  { id: 'format.underline', title: 'Underline', category: 'format', shortcut: 'Ctrl+U', icon: 'underline', handler: () => {} },
  { id: 'format.strikethrough', title: 'Strikethrough', category: 'format', icon: 'strikethrough', handler: () => {} },
  { id: 'format.alignLeft', title: 'Align Left', category: 'format', icon: 'align-left', handler: () => {} },
  { id: 'format.alignCenter', title: 'Align Center', category: 'format', icon: 'align-center', handler: () => {} },
  { id: 'format.alignRight', title: 'Align Right', category: 'format', icon: 'align-right', handler: () => {} },
  { id: 'format.alignJustify', title: 'Justify', category: 'format', icon: 'align-justify', handler: () => {} },

  // Layout commands
  { id: 'layout.alignLeft', title: 'Align Left Edges', category: 'layout', icon: 'align-left', handler: () => {} },
  { id: 'layout.alignRight', title: 'Align Right Edges', category: 'layout', icon: 'align-right', handler: () => {} },
  { id: 'layout.alignTop', title: 'Align Top Edges', category: 'layout', icon: 'align-start', handler: () => {} },
  { id: 'layout.alignBottom', title: 'Align Bottom Edges', category: 'layout', icon: 'align-end', handler: () => {} },
  { id: 'layout.alignCenterH', title: 'Align Center Horizontal', category: 'layout', icon: 'align-center', handler: () => {} },
  { id: 'layout.alignCenterV', title: 'Align Center Vertical', category: 'layout', icon: 'align-center', handler: () => {} },
  { id: 'layout.distributeH', title: 'Distribute Horizontally', category: 'layout', icon: 'columns', handler: () => {} },
  { id: 'layout.distributeV', title: 'Distribute Vertically', category: 'layout', icon: 'rows', handler: () => {} },
  { id: 'layout.bringForward', title: 'Bring Forward', category: 'layout', shortcut: 'Ctrl+]', icon: 'arrow-up', handler: () => {} },
  { id: 'layout.sendBackward', title: 'Send Backward', category: 'layout', shortcut: 'Ctrl+[', icon: 'arrow-down', handler: () => {} },
  { id: 'layout.bringToFront', title: 'Bring to Front', category: 'layout', shortcut: 'Ctrl+Shift+]', icon: 'chevrons-up', handler: () => {} },
  { id: 'layout.sendToBack', title: 'Send to Back', category: 'layout', shortcut: 'Ctrl+Shift+[', icon: 'chevrons-down', handler: () => {} },
  { id: 'layout.group', title: 'Group', category: 'layout', shortcut: 'Ctrl+G', icon: 'group', handler: () => {} },
  { id: 'layout.ungroup', title: 'Ungroup', category: 'layout', shortcut: 'Ctrl+Shift+G', icon: 'ungroup', handler: () => {} },
  { id: 'layout.lock', title: 'Lock', category: 'layout', shortcut: 'Ctrl+L', icon: 'lock', handler: () => {} },
  { id: 'layout.unlock', title: 'Unlock', category: 'layout', icon: 'unlock', handler: () => {} },

  // Tools commands
  { id: 'tools.pointer', title: 'Pointer Tool', category: 'tools', shortcut: 'V', icon: 'pointer', handler: () => {} },
  { id: 'tools.hand', title: 'Hand Tool', category: 'tools', shortcut: 'H', icon: 'hand', keywords: ['pan', 'drag', 'move'], handler: () => {} },
  { id: 'tools.text', title: 'Text Tool', category: 'tools', shortcut: 'T', icon: 'type', handler: () => {} },
  { id: 'tools.rectangle', title: 'Rectangle Tool', category: 'tools', shortcut: 'R', icon: 'square', handler: () => {} },
  { id: 'tools.ellipse', title: 'Ellipse Tool', category: 'tools', shortcut: 'O', icon: 'circle', handler: () => {} },
  { id: 'tools.line', title: 'Line Tool', category: 'tools', shortcut: 'L', icon: 'minus', handler: () => {} },
  { id: 'tools.pen', title: 'Pen Tool', category: 'tools', shortcut: 'P', icon: 'pen-tool', handler: () => {} },
  { id: 'tools.eyedropper', title: 'Eyedropper', category: 'tools', shortcut: 'I', icon: 'droplet', keywords: ['color', 'pick'], handler: () => {} },
  { id: 'tools.measure', title: 'Measure Tool', category: 'tools', shortcut: 'M', icon: 'ruler', handler: () => {} },
  { id: 'tools.crop', title: 'Crop Tool', category: 'tools', shortcut: 'C', icon: 'crop', handler: () => {} },

  // Page commands
  { id: 'page.new', title: 'New Page', category: 'page', icon: 'file-plus', keywords: ['add', 'page'], handler: () => {} },
  { id: 'page.duplicate', title: 'Duplicate Page', category: 'page', icon: 'copy', handler: () => {} },
  { id: 'page.delete', title: 'Delete Page', category: 'page', icon: 'trash', handler: () => {} },
  { id: 'page.rename', title: 'Rename Page', category: 'page', icon: 'edit', handler: () => {} },
  { id: 'page.reorder', title: 'Reorder Pages', category: 'page', icon: 'move', handler: () => {} },

  // Help commands
  { id: 'help.shortcuts', title: 'Keyboard Shortcuts', category: 'help', shortcut: 'Ctrl+/', icon: 'keyboard', handler: () => {} },
  { id: 'help.docs', title: 'Documentation', category: 'help', icon: 'book', keywords: ['docs', 'help'], handler: () => {} },
  { id: 'help.tutorial', title: 'Interactive Tutorial', category: 'help', icon: 'play', keywords: ['learn', 'tutorial'], handler: () => {} },
  { id: 'help.feedback', title: 'Send Feedback', category: 'help', icon: 'message-square', handler: () => {} },
  { id: 'help.changelog', title: 'What\'s New', category: 'help', icon: 'bell', keywords: ['changelog', 'updates'], handler: () => {} },
  { id: 'help.about', title: 'About', category: 'help', icon: 'info', handler: () => {} },

  // Debug commands
  { id: 'debug.inspector', title: 'Toggle Inspector', category: 'debug', shortcut: 'F12', icon: 'code', handler: () => {} },
  { id: 'debug.console', title: 'Toggle Console', category: 'debug', icon: 'terminal', handler: () => {} },
  { id: 'debug.performance', title: 'Performance Monitor', category: 'debug', icon: 'activity', handler: () => {} },
  { id: 'debug.accessibility', title: 'Accessibility Audit', category: 'debug', icon: 'shield', handler: () => {} },
  { id: 'debug.seo', title: 'SEO Audit', category: 'debug', icon: 'search', handler: () => {} },
  { id: 'debug.clearCache', title: 'Clear Cache', category: 'debug', icon: 'trash', handler: () => {} },
];

// =============================================================================
// Category Display Info
// =============================================================================

export const CATEGORY_INFO: Record<CommandCategory, { label: string; icon: string; description: string }> = {
  file: { label: 'File', icon: 'file', description: 'File operations' },
  edit: { label: 'Edit', icon: 'edit', description: 'Edit operations' },
  view: { label: 'View', icon: 'eye', description: 'View settings and zoom' },
  insert: { label: 'Insert', icon: 'plus-square', description: 'Insert elements' },
  format: { label: 'Format', icon: 'type', description: 'Text formatting' },
  tools: { label: 'Tools', icon: 'tool', description: 'Design tools' },
  layout: { label: 'Layout', icon: 'layout', description: 'Alignment and ordering' },
  style: { label: 'Style', icon: 'paint-bucket', description: 'Styling options' },
  widget: { label: 'Widget', icon: 'box', description: 'Widget operations' },
  page: { label: 'Page', icon: 'file-text', description: 'Page management' },
  navigation: { label: 'Navigation', icon: 'navigation', description: 'Navigation settings' },
  help: { label: 'Help', icon: 'help-circle', description: 'Help and documentation' },
  debug: { label: 'Debug', icon: 'bug', description: 'Debugging tools' },
  plugin: { label: 'Plugin', icon: 'puzzle', description: 'Plugin management' },
  project: { label: 'Project', icon: 'folder', description: 'Project settings' },
  export: { label: 'Export', icon: 'download', description: 'Export options' },
};
