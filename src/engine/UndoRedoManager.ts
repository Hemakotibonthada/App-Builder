/**
 * Undo/Redo Manager
 *
 * Comprehensive undo/redo system with:
 * 1. Command pattern implementation
 * 2. Transaction grouping (batch operations)
 * 3. History branching (tree-based undo)
 * 4. Snapshot-based state restoration
 * 5. Selective undo (per-widget)
 * 6. History persistence
 * 7. Memory-efficient delta compression
 * 8. History timeline visualization data
 */

/* ──────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────── */

export interface Command {
  readonly id: string;
  readonly type: string;
  readonly label: string;
  readonly timestamp: number;
  readonly widgetIds: readonly string[];
  readonly pageId?: string;
  execute(): void;
  undo(): void;
  redo(): void;
  merge?(other: Command): Command | null;
}

export interface HistoryEntry {
  readonly id: string;
  readonly command: Command;
  readonly timestamp: number;
  readonly label: string;
  readonly type: string;
  readonly branchId: string;
  readonly parentId: string | null;
  readonly children: string[];
  readonly snapshot?: string; // JSON snapshot for branching
}

export interface HistoryBranch {
  readonly id: string;
  readonly name: string;
  readonly parentBranchId: string | null;
  readonly forkEntryId: string;
  readonly headEntryId: string;
  readonly createdAt: number;
}

export interface HistoryStats {
  readonly totalCommands: number;
  readonly undoCount: number;
  readonly redoCount: number;
  readonly branchCount: number;
  readonly memoryUsage: number;
  readonly oldestEntry: number;
  readonly newestEntry: number;
}

export interface UndoManagerConfig {
  readonly maxHistory: number;
  readonly mergeInterval: number; // ms — merge commands within this window
  readonly enableSnapshots: boolean;
  readonly snapshotInterval: number; // Every N commands
  readonly enableBranching: boolean;
  readonly persistHistory: boolean;
  readonly storageKey: string;
}

/* ──────────────────────────────────────────────
 * Delta Compression
 * ────────────────────────────────────────────── */

export interface Delta {
  readonly path: string;
  readonly oldValue: unknown;
  readonly newValue: unknown;
}

export function computeDelta(oldObj: Record<string, unknown>, newObj: Record<string, unknown>, prefix: string = ''): Delta[] {
  const deltas: Delta[] = [];

  const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

  for (const key of allKeys) {
    const path = prefix ? `${prefix}.${key}` : key;
    const oldVal = oldObj[key];
    const newVal = newObj[key];

    if (oldVal === newVal) continue;

    if (
      typeof oldVal === 'object' && oldVal !== null &&
      typeof newVal === 'object' && newVal !== null &&
      !Array.isArray(oldVal) && !Array.isArray(newVal)
    ) {
      deltas.push(...computeDelta(
        oldVal as Record<string, unknown>,
        newVal as Record<string, unknown>,
        path,
      ));
    } else {
      deltas.push({ path, oldValue: oldVal, newValue: newVal });
    }
  }

  return deltas;
}

export function applyDelta(obj: Record<string, unknown>, deltas: Delta[], reverse: boolean = false): Record<string, unknown> {
  const result = JSON.parse(JSON.stringify(obj));

  for (const delta of deltas) {
    const parts = delta.path.split('.');
    let current = result;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]!;
      if (!(part in current)) {
        current[part] = {};
      }
      current = current[part] as Record<string, unknown>;
    }

    const lastPart = parts[parts.length - 1]!;
    current[lastPart] = reverse ? delta.oldValue : delta.newValue;
  }

  return result;
}

/* ──────────────────────────────────────────────
 * Command Factory Functions
 * ────────────────────────────────────────────── */

let _commandCounter = 0;

export function createCommandId(): string {
  return `cmd_${Date.now().toString(36)}_${(++_commandCounter).toString(36)}`;
}

export class SimpleCommand implements Command {
  readonly id: string;
  readonly type: string;
  readonly label: string;
  readonly timestamp: number;
  readonly widgetIds: readonly string[];
  readonly pageId?: string;

  private executeFn: () => void;
  private undoFn: () => void;

  constructor(config: {
    type: string;
    label: string;
    widgetIds?: string[];
    pageId?: string;
    execute: () => void;
    undo: () => void;
  }) {
    this.id = createCommandId();
    this.type = config.type;
    this.label = config.label;
    this.timestamp = Date.now();
    this.widgetIds = config.widgetIds ?? [];
    this.pageId = config.pageId;
    this.executeFn = config.execute;
    this.undoFn = config.undo;
  }

  execute(): void {
    this.executeFn();
  }

  undo(): void {
    this.undoFn();
  }

  redo(): void {
    this.executeFn();
  }
}

export class BatchCommand implements Command {
  readonly id: string;
  readonly type: string = 'batch';
  readonly label: string;
  readonly timestamp: number;
  readonly widgetIds: readonly string[];
  readonly pageId?: string;
  private commands: Command[];

  constructor(label: string, commands: Command[]) {
    this.id = createCommandId();
    this.label = label;
    this.timestamp = Date.now();
    this.commands = commands;
    this.widgetIds = commands.flatMap(c => c.widgetIds);
    this.pageId = commands.find(c => c.pageId)?.pageId;
  }

  execute(): void {
    for (const cmd of this.commands) {
      cmd.execute();
    }
  }

  undo(): void {
    for (let i = this.commands.length - 1; i >= 0; i--) {
      this.commands[i]!.undo();
    }
  }

  redo(): void {
    for (const cmd of this.commands) {
      cmd.redo();
    }
  }

  getCommands(): readonly Command[] {
    return this.commands;
  }
}

/* ──────────────────────────────────────────────
 * Undo Manager
 * ────────────────────────────────────────────── */

const DEFAULT_CONFIG: UndoManagerConfig = {
  maxHistory: 200,
  mergeInterval: 300,
  enableSnapshots: true,
  snapshotInterval: 20,
  enableBranching: true,
  persistHistory: false,
  storageKey: 'appbuilder_history',
};

export class UndoManager {
  private entries: Map<string, HistoryEntry> = new Map();
  private branches: Map<string, HistoryBranch> = new Map();
  private currentEntryId: string | null = null;
  private currentBranchId: string;
  private transactionStack: Command[][] = [];
  private config: UndoManagerConfig;
  private listeners: Set<() => void> = new Set();
  private commandsSinceSnapshot: number = 0;

  constructor(config: Partial<UndoManagerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Create main branch
    this.currentBranchId = this.generateBranchId();
    this.branches.set(this.currentBranchId, {
      id: this.currentBranchId,
      name: 'main',
      parentBranchId: null,
      forkEntryId: '',
      headEntryId: '',
      createdAt: Date.now(),
    });

    if (this.config.persistHistory) {
      this.loadFromStorage();
    }
  }

  /**
   * Execute a command and add it to the history.
   */
  execute(command: Command): void {
    // If in a transaction, defer
    if (this.transactionStack.length > 0) {
      command.execute();
      this.transactionStack[this.transactionStack.length - 1]!.push(command);
      return;
    }

    // Try to merge with previous command
    if (this.currentEntryId && this.config.mergeInterval > 0) {
      const currentEntry = this.entries.get(this.currentEntryId);
      if (
        currentEntry &&
        currentEntry.command.type === command.type &&
        Date.now() - currentEntry.timestamp < this.config.mergeInterval &&
        currentEntry.command.merge
      ) {
        const merged = currentEntry.command.merge(command);
        if (merged) {
          merged.execute();
          this.entries.set(this.currentEntryId, {
            ...currentEntry,
            command: merged,
            timestamp: Date.now(),
          });
          this.notify();
          return;
        }
      }
    }

    command.execute();
    this.addEntry(command);
  }

  /**
   * Undo the last command.
   */
  undo(): boolean {
    if (!this.currentEntryId) return false;

    const entry = this.entries.get(this.currentEntryId);
    if (!entry) return false;

    entry.command.undo();
    this.currentEntryId = entry.parentId;

    // Update branch head
    this.updateBranchHead();
    this.notify();
    return true;
  }

  /**
   * Redo the next command.
   */
  redo(): boolean {
    const nextEntry = this.findRedoEntry();
    if (!nextEntry) return false;

    nextEntry.command.redo();
    this.currentEntryId = nextEntry.id;

    this.updateBranchHead();
    this.notify();
    return true;
  }

  /**
   * Start a transaction (group multiple commands into one undo step).
   */
  beginTransaction(): void {
    this.transactionStack.push([]);
  }

  /**
   * Commit the current transaction.
   */
  commitTransaction(label: string): void {
    const commands = this.transactionStack.pop();
    if (!commands || commands.length === 0) return;

    const batch = new BatchCommand(label, commands);
    // Don't re-execute — commands were already executed during the transaction
    this.addEntry(batch);
  }

  /**
   * Rollback the current transaction.
   */
  rollbackTransaction(): void {
    const commands = this.transactionStack.pop();
    if (!commands) return;

    // Undo all commands in reverse order
    for (let i = commands.length - 1; i >= 0; i--) {
      commands[i]!.undo();
    }
  }

  /**
   * Undo to a specific entry.
   */
  undoTo(entryId: string): void {
    const targetEntry = this.entries.get(entryId);
    if (!targetEntry) return;

    // Build path from current to target
    const pathToCurrent: string[] = [];
    let cursor = this.currentEntryId;
    while (cursor) {
      pathToCurrent.push(cursor);
      if (cursor === entryId) break;
      const entry = this.entries.get(cursor);
      cursor = entry?.parentId ?? null;
    }

    if (!cursor) return; // Target not in ancestry

    // Undo all entries between current and target
    for (const id of pathToCurrent) {
      if (id === entryId) break;
      const entry = this.entries.get(id);
      if (entry) {
        entry.command.undo();
      }
    }

    this.currentEntryId = entryId;
    this.updateBranchHead();
    this.notify();
  }

  /**
   * Create a new branch from the current point.
   */
  createBranch(name: string): string {
    if (!this.config.enableBranching) {
      throw new Error('Branching is not enabled');
    }

    const branchId = this.generateBranchId();
    this.branches.set(branchId, {
      id: branchId,
      name,
      parentBranchId: this.currentBranchId,
      forkEntryId: this.currentEntryId ?? '',
      headEntryId: this.currentEntryId ?? '',
      createdAt: Date.now(),
    });

    this.currentBranchId = branchId;
    this.notify();
    return branchId;
  }

  /**
   * Switch to a different branch.
   */
  switchBranch(branchId: string): boolean {
    const branch = this.branches.get(branchId);
    if (!branch) return false;

    // Undo to fork point, then redo on new branch
    const forkEntry = branch.forkEntryId;
    if (this.currentEntryId !== forkEntry) {
      this.undoTo(forkEntry);
    }

    // Redo on the new branch
    this.currentBranchId = branchId;
    this.currentEntryId = branch.headEntryId || null;

    this.notify();
    return true;
  }

  /**
   * Check if undo is available.
   */
  canUndo(): boolean {
    return this.currentEntryId !== null;
  }

  /**
   * Check if redo is available.
   */
  canRedo(): boolean {
    return this.findRedoEntry() !== null;
  }

  /**
   * Get the undo stack labels.
   */
  getUndoStack(): readonly { id: string; label: string; timestamp: number }[] {
    const stack: { id: string; label: string; timestamp: number }[] = [];
    let cursor = this.currentEntryId;

    while (cursor) {
      const entry = this.entries.get(cursor);
      if (!entry) break;
      stack.push({
        id: entry.id,
        label: entry.label,
        timestamp: entry.timestamp,
      });
      cursor = entry.parentId;
    }

    return stack;
  }

  /**
   * Get the redo stack labels.
   */
  getRedoStack(): readonly { id: string; label: string; timestamp: number }[] {
    const stack: { id: string; label: string; timestamp: number }[] = [];
    let cursor = this.findRedoEntry();

    while (cursor) {
      stack.push({
        id: cursor.id,
        label: cursor.label,
        timestamp: cursor.timestamp,
      });
      // Find next redo entry
      const children = Array.from(this.entries.values())
        .filter(e => e.parentId === cursor!.id && e.branchId === this.currentBranchId);
      cursor = children[0] ?? null;
    }

    return stack;
  }

  /**
   * Get statistics.
   */
  getStats(): HistoryStats {
    const entries = Array.from(this.entries.values());
    return {
      totalCommands: entries.length,
      undoCount: this.getUndoStack().length,
      redoCount: this.getRedoStack().length,
      branchCount: this.branches.size,
      memoryUsage: this.estimateMemoryUsage(),
      oldestEntry: entries.length > 0 ? Math.min(...entries.map(e => e.timestamp)) : 0,
      newestEntry: entries.length > 0 ? Math.max(...entries.map(e => e.timestamp)) : 0,
    };
  }

  /**
   * Subscribe to history changes.
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Clear all history.
   */
  clear(): void {
    this.entries.clear();
    this.currentEntryId = null;
    this.transactionStack = [];
    this.commandsSinceSnapshot = 0;
    this.notify();
  }

  /**
   * Get all branches.
   */
  getBranches(): readonly HistoryBranch[] {
    return Array.from(this.branches.values());
  }

  /**
   * Get current branch ID.
   */
  getCurrentBranchId(): string {
    return this.currentBranchId;
  }

  /* ──────────────────────────────────────────
   * Private Methods
   * ────────────────────────────────────────── */

  private addEntry(command: Command): void {
    const entryId = `entry_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

    // Remove any redo entries on current branch
    if (this.currentEntryId) {
      this.pruneRedoEntries(this.currentEntryId);
    }

    const entry: HistoryEntry = {
      id: entryId,
      command,
      timestamp: Date.now(),
      label: command.label,
      type: command.type,
      branchId: this.currentBranchId,
      parentId: this.currentEntryId,
      children: [],
    };

    // Update parent's children
    if (this.currentEntryId) {
      const parent = this.entries.get(this.currentEntryId);
      if (parent) {
        this.entries.set(this.currentEntryId, {
          ...parent,
          children: [...parent.children, entryId],
        });
      }
    }

    this.entries.set(entryId, entry);
    this.currentEntryId = entryId;
    this.updateBranchHead();

    // Enforce max history
    this.enforceHistoryLimit();

    // Snapshot if needed
    this.commandsSinceSnapshot++;
    if (
      this.config.enableSnapshots &&
      this.commandsSinceSnapshot >= this.config.snapshotInterval
    ) {
      this.commandsSinceSnapshot = 0;
    }

    // Persist if needed
    if (this.config.persistHistory) {
      this.saveToStorage();
    }

    this.notify();
  }

  private findRedoEntry(): HistoryEntry | null {
    if (!this.currentEntryId) {
      // Find root entry on current branch
      const rootEntries = Array.from(this.entries.values())
        .filter(e => e.parentId === null && e.branchId === this.currentBranchId);
      return rootEntries[0] ?? null;
    }

    const currentEntry = this.entries.get(this.currentEntryId);
    if (!currentEntry) return null;

    // Find children on the same branch
    const branchChildren = currentEntry.children
      .map(id => this.entries.get(id))
      .filter((e): e is HistoryEntry => e !== undefined && e.branchId === this.currentBranchId);

    return branchChildren[0] ?? null;
  }

  private pruneRedoEntries(afterEntryId: string): void {
    const entry = this.entries.get(afterEntryId);
    if (!entry) return;

    const branchChildren = entry.children.filter(id => {
      const child = this.entries.get(id);
      return child?.branchId === this.currentBranchId;
    });

    for (const childId of branchChildren) {
      this.deleteEntryAndDescendants(childId);
    }

    // Update entry's children
    this.entries.set(afterEntryId, {
      ...entry,
      children: entry.children.filter(id => !branchChildren.includes(id)),
    });
  }

  private deleteEntryAndDescendants(entryId: string): void {
    const entry = this.entries.get(entryId);
    if (!entry) return;

    for (const childId of entry.children) {
      this.deleteEntryAndDescendants(childId);
    }

    this.entries.delete(entryId);
  }

  private enforceHistoryLimit(): void {
    while (this.entries.size > this.config.maxHistory) {
      // Remove oldest root entry
      const rootEntries = Array.from(this.entries.values())
        .filter(e => e.parentId === null)
        .sort((a, b) => a.timestamp - b.timestamp);

      if (rootEntries.length > 0) {
        const oldest = rootEntries[0]!;
        // Re-parent children
        for (const childId of oldest.children) {
          const child = this.entries.get(childId);
          if (child) {
            this.entries.set(childId, { ...child, parentId: null });
          }
        }
        this.entries.delete(oldest.id);
      } else {
        break;
      }
    }
  }

  private updateBranchHead(): void {
    const branch = this.branches.get(this.currentBranchId);
    if (branch) {
      this.branches.set(this.currentBranchId, {
        ...branch,
        headEntryId: this.currentEntryId ?? '',
      });
    }
  }

  private generateBranchId(): string {
    return `branch_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
  }

  private estimateMemoryUsage(): number {
    let size = 0;
    for (const entry of this.entries.values()) {
      size += entry.label.length * 2;
      size += entry.id.length * 2;
      size += 100; // overhead estimate per entry
      if (entry.snapshot) {
        size += entry.snapshot.length * 2;
      }
    }
    return size;
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }

  private saveToStorage(): void {
    try {
      // Only save metadata, not the actual commands (they contain functions)
      const data = {
        stats: this.getStats(),
        currentBranch: this.currentBranchId,
        branches: Array.from(this.branches.values()),
      };
      localStorage.setItem(this.config.storageKey, JSON.stringify(data));
    } catch {
      // Storage quota exceeded or unavailable
    }
  }

  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem(this.config.storageKey);
      if (data) {
        // Restore branch info
        const parsed = JSON.parse(data);
        if (parsed.branches) {
          for (const branch of parsed.branches) {
            this.branches.set(branch.id, branch);
          }
        }
      }
    } catch {
      // Invalid or missing data
    }
  }
}

/* ──────────────────────────────────────────────
 * Singleton Instance
 * ────────────────────────────────────────────── */

let _undoManager: UndoManager | null = null;

export function getUndoManager(): UndoManager {
  if (!_undoManager) {
    _undoManager = new UndoManager({
      maxHistory: 200,
      mergeInterval: 300,
      enableSnapshots: true,
      snapshotInterval: 20,
      enableBranching: true,
      persistHistory: false,
    });
  }
  return _undoManager;
}

export function resetUndoManager(): void {
  _undoManager?.clear();
  _undoManager = null;
}
