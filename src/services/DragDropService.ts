// =============================================================================
// Drag & Drop UI Service - Advanced drag-and-drop component system with
// sortable lists, kanban boards, file upload zones, and tree views
// =============================================================================

// =============================================================================
// Drag & Drop Types
// =============================================================================

export interface DragItem {
  id: string;
  type: string;
  data: Record<string, unknown>;
  sourceId?: string;
  sourceIndex?: number;
  preview?: DragPreview;
}

export interface DropZone {
  id: string;
  accepts: string[];
  maxItems?: number;
  currentItems: string[];
  disabled?: boolean;
  placeholder?: string;
  orientation?: 'horizontal' | 'vertical' | 'grid';
}

export interface DragPreview {
  element?: HTMLElement;
  offsetX?: number;
  offsetY?: number;
  scale?: number;
  opacity?: number;
  className?: string;
}

export interface DragState {
  isDragging: boolean;
  dragItem: DragItem | null;
  sourceZone: string | null;
  targetZone: string | null;
  position: { x: number; y: number };
  offset: { x: number; y: number };
  hoveredIndex: number | null;
}

export interface DragEvent {
  type: DragEventType;
  item: DragItem;
  sourceZone?: string;
  targetZone?: string;
  sourceIndex?: number;
  targetIndex?: number;
  position?: { x: number; y: number };
}

export type DragEventType =
  | 'drag-start' | 'drag-move' | 'drag-enter'
  | 'drag-leave' | 'drag-over' | 'drag-end'
  | 'drop' | 'sort-change' | 'cancel';

export interface SortableConfig {
  id: string;
  items: SortableItem[];
  orientation: 'horizontal' | 'vertical' | 'grid';
  group?: string;
  handle?: string;
  ghostClass?: string;
  dragClass?: string;
  animation?: number;
  disabled?: boolean;
  lockAxis?: 'x' | 'y' | null;
  gridColumns?: number;
}

export interface SortableItem {
  id: string;
  order: number;
  data: Record<string, unknown>;
  disabled?: boolean;
  locked?: boolean;
}

// =============================================================================
// Drag & Drop Controller
// =============================================================================

export class DragDropController {
  private state: DragState = {
    isDragging: false,
    dragItem: null,
    sourceZone: null,
    targetZone: null,
    position: { x: 0, y: 0 },
    offset: { x: 0, y: 0 },
    hoveredIndex: null,
  };

  private dropZones: Map<string, DropZone> = new Map();
  private listeners: Map<string, Set<(event: DragEvent) => void>> = new Map();
  private cleanupFns: (() => void)[] = [];

  registerDropZone(zone: DropZone): void {
    this.dropZones.set(zone.id, zone);
  }

  unregisterDropZone(id: string): void {
    this.dropZones.delete(id);
  }

  startDrag(item: DragItem, position: { x: number; y: number }, offset?: { x: number; y: number }): void {
    this.state = {
      isDragging: true,
      dragItem: item,
      sourceZone: item.sourceId || null,
      targetZone: null,
      position,
      offset: offset || { x: 0, y: 0 },
      hoveredIndex: null,
    };

    this.emit('drag-start', {
      type: 'drag-start',
      item,
      sourceZone: item.sourceId,
      sourceIndex: item.sourceIndex,
      position,
    });

    // Add global listeners
    const onMouseMove = (e: MouseEvent) => this.onDragMove(e.clientX, e.clientY);
    const onMouseUp = (e: MouseEvent) => this.endDrag(e.clientX, e.clientY);
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') this.cancelDrag(); };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('keydown', onKeyDown);

    this.cleanupFns.push(() => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('keydown', onKeyDown);
    });
  }

  private onDragMove(x: number, y: number): void {
    if (!this.state.isDragging || !this.state.dragItem) return;

    this.state.position = { x, y };

    this.emit('drag-move', {
      type: 'drag-move',
      item: this.state.dragItem,
      position: { x, y },
    });

    // Check drop zone intersections
    const targetZone = this.findDropZone(x, y);
    if (targetZone !== this.state.targetZone) {
      if (this.state.targetZone) {
        this.emit('drag-leave', {
          type: 'drag-leave',
          item: this.state.dragItem,
          targetZone: this.state.targetZone,
        });
      }
      if (targetZone) {
        this.emit('drag-enter', {
          type: 'drag-enter',
          item: this.state.dragItem,
          targetZone,
        });
      }
      this.state.targetZone = targetZone;
    }
  }

  endDrag(x: number, y: number): void {
    if (!this.state.isDragging || !this.state.dragItem) return;

    const targetZone = this.findDropZone(x, y);

    if (targetZone) {
      const zone = this.dropZones.get(targetZone);
      if (zone && this.canDrop(this.state.dragItem, zone)) {
        this.emit('drop', {
          type: 'drop',
          item: this.state.dragItem,
          sourceZone: this.state.sourceZone || undefined,
          targetZone,
          targetIndex: this.state.hoveredIndex || undefined,
          position: { x, y },
        });
      }
    }

    this.emit('drag-end', {
      type: 'drag-end',
      item: this.state.dragItem,
      sourceZone: this.state.sourceZone || undefined,
      targetZone: targetZone || undefined,
    });

    this.cleanup();
  }

  cancelDrag(): void {
    if (!this.state.isDragging || !this.state.dragItem) return;

    this.emit('cancel', {
      type: 'cancel',
      item: this.state.dragItem,
    });

    this.cleanup();
  }

  private cleanup(): void {
    this.state = {
      isDragging: false,
      dragItem: null,
      sourceZone: null,
      targetZone: null,
      position: { x: 0, y: 0 },
      offset: { x: 0, y: 0 },
      hoveredIndex: null,
    };

    this.cleanupFns.forEach(fn => fn());
    this.cleanupFns = [];
  }

  private findDropZone(_x: number, _y: number): string | null {
    // In a real implementation, this would check element boundaries
    // Here we return the current target zone based on state
    return this.state.targetZone;
  }

  private canDrop(item: DragItem, zone: DropZone): boolean {
    if (zone.disabled) return false;
    if (!zone.accepts.includes(item.type) && !zone.accepts.includes('*')) return false;
    if (zone.maxItems !== undefined && zone.currentItems.length >= zone.maxItems) return false;
    return true;
  }

  on(event: DragEventType, handler: (event: DragEvent) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
    return () => { this.listeners.get(event)?.delete(handler); };
  }

  private emit(type: DragEventType, event: DragEvent): void {
    this.listeners.get(type)?.forEach(handler => handler(event));
  }

  getState(): Readonly<DragState> {
    return { ...this.state };
  }

  destroy(): void {
    this.cleanup();
    this.dropZones.clear();
    this.listeners.clear();
  }
}

// =============================================================================
// Sortable List Logic
// =============================================================================

export function reorderItems<T extends { id: string }>(
  items: T[],
  sourceIndex: number,
  destinationIndex: number
): T[] {
  const result = [...items];
  const [removed] = result.splice(sourceIndex, 1);
  result.splice(destinationIndex, 0, removed);
  return result;
}

export function moveItemBetweenLists<T extends { id: string }>(
  sourceItems: T[],
  destinationItems: T[],
  sourceIndex: number,
  destinationIndex: number
): { source: T[]; destination: T[] } {
  const source = [...sourceItems];
  const destination = [...destinationItems];
  const [removed] = source.splice(sourceIndex, 1);
  destination.splice(destinationIndex, 0, removed);
  return { source, destination };
}

export function insertItemInList<T>(
  items: T[],
  item: T,
  index: number
): T[] {
  const result = [...items];
  result.splice(index, 0, item);
  return result;
}

export function removeItemFromList<T extends { id: string }>(
  items: T[],
  itemId: string
): T[] {
  return items.filter(item => item.id !== itemId);
}

// =============================================================================
// Kanban Board Logic
// =============================================================================

export interface KanbanBoard {
  id: string;
  name: string;
  columns: KanbanColumn[];
}

export interface KanbanColumn {
  id: string;
  title: string;
  color?: string;
  maxItems?: number;
  items: KanbanItem[];
  collapsed?: boolean;
}

export interface KanbanItem {
  id: string;
  title: string;
  description?: string;
  labels?: KanbanLabel[];
  assignee?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  order: number;
  metadata?: Record<string, unknown>;
}

export interface KanbanLabel {
  id: string;
  name: string;
  color: string;
}

export function moveKanbanItem(
  board: KanbanBoard,
  itemId: string,
  sourceColumnId: string,
  targetColumnId: string,
  targetIndex: number
): KanbanBoard {
  const newBoard = { ...board, columns: board.columns.map(col => ({ ...col, items: [...col.items] })) };

  const sourceCol = newBoard.columns.find(c => c.id === sourceColumnId);
  const targetCol = newBoard.columns.find(c => c.id === targetColumnId);

  if (!sourceCol || !targetCol) return board;

  const itemIndex = sourceCol.items.findIndex(i => i.id === itemId);
  if (itemIndex === -1) return board;

  const [item] = sourceCol.items.splice(itemIndex, 1);
  targetCol.items.splice(targetIndex, 0, item);

  // Reorder
  targetCol.items.forEach((item, idx) => { item.order = idx; });
  if (sourceCol.id !== targetCol.id) {
    sourceCol.items.forEach((item, idx) => { item.order = idx; });
  }

  return newBoard;
}

// =============================================================================
// File Upload Drop Zone
// =============================================================================

export interface FileDropConfig {
  accept?: string[];       // MIME types
  maxFiles?: number;
  maxFileSize?: number;    // bytes
  multiple?: boolean;
  disabled?: boolean;
  onDrop?: (files: File[]) => void;
  onReject?: (files: FileRejection[]) => void;
}

export interface FileRejection {
  file: File;
  reason: 'type' | 'size' | 'count';
  message: string;
}

export function validateFiles(
  files: File[],
  config: FileDropConfig
): { accepted: File[]; rejected: FileRejection[] } {
  const accepted: File[] = [];
  const rejected: FileRejection[] = [];

  files.forEach(file => {
    if (config.accept && config.accept.length > 0) {
      const isAccepted = config.accept.some(type => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.replace('/*', ''));
        }
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        }
        return file.type === type;
      });

      if (!isAccepted) {
        rejected.push({
          file,
          reason: 'type',
          message: `File type "${file.type || 'unknown'}" is not accepted`,
        });
        return;
      }
    }

    if (config.maxFileSize && file.size > config.maxFileSize) {
      rejected.push({
        file,
        reason: 'size',
        message: `File size ${formatFileSize(file.size)} exceeds maximum ${formatFileSize(config.maxFileSize)}`,
      });
      return;
    }

    accepted.push(file);
  });

  if (config.maxFiles && accepted.length > config.maxFiles) {
    const excess = accepted.splice(config.maxFiles);
    excess.forEach(file => {
      rejected.push({
        file,
        reason: 'count',
        message: `Maximum ${config.maxFiles} files allowed`,
      });
    });
  }

  return { accepted, rejected };
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

// =============================================================================
// Drag & Drop CSS
// =============================================================================

export function generateDragDropCSS(theme: 'light' | 'dark' = 'light'): string {
  const isDark = theme === 'dark';

  return `/* Sortable List */
.sortable-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sortable-item {
  position: relative;
  padding: 12px 16px;
  margin-bottom: 4px;
  background: ${isDark ? '#1f2937' : '#ffffff'};
  border: 1px solid ${isDark ? '#374151' : '#e5e7eb'};
  border-radius: 8px;
  cursor: grab;
  transition: all 200ms ease;
  user-select: none;
}

.sortable-item:hover {
  border-color: ${isDark ? '#4b5563' : '#d1d5db'};
  box-shadow: 0 2px 8px rgba(0,0,0,${isDark ? '0.2' : '0.08'});
}

.sortable-item:active,
.sortable-item--dragging {
  cursor: grabbing;
  opacity: 0.9;
  box-shadow: 0 8px 24px rgba(0,0,0,${isDark ? '0.3' : '0.15'});
  transform: scale(1.02);
  z-index: 100;
}

.sortable-item--ghost {
  opacity: 0.3;
  border-style: dashed;
}

.sortable-item--locked {
  cursor: default;
  opacity: 0.6;
}

.sortable-handle {
  display: inline-flex;
  align-items: center;
  padding: 4px;
  margin-right: 8px;
  cursor: grab;
  color: ${isDark ? '#6b7280' : '#9ca3af'};
  border-radius: 4px;
}

.sortable-handle:hover {
  color: ${isDark ? '#9ca3af' : '#6b7280'};
  background: ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'};
}

/* Drop Zone */
.drop-zone {
  position: relative;
  min-height: 100px;
  padding: 24px;
  border: 2px dashed ${isDark ? '#374151' : '#d1d5db'};
  border-radius: 12px;
  background: ${isDark ? 'rgba(31,41,55,0.5)' : 'rgba(249,250,251,0.5)'};
  transition: all 200ms ease;
  text-align: center;
}

.drop-zone--active {
  border-color: #6366f1;
  background: ${isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.05)'};
}

.drop-zone--accept {
  border-color: #22c55e;
  background: ${isDark ? 'rgba(34,197,94,0.08)' : 'rgba(34,197,94,0.05)'};
}

.drop-zone--reject {
  border-color: #ef4444;
  background: ${isDark ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.05)'};
}

.drop-zone--disabled {
  opacity: 0.5;
  pointer-events: none;
}

.drop-zone__text {
  color: ${isDark ? '#9ca3af' : '#6b7280'};
  font-size: 14px;
}

.drop-zone__icon {
  color: ${isDark ? '#6b7280' : '#9ca3af'};
  margin-bottom: 8px;
}

/* Kanban Board */
.kanban-board {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding: 16px 0;
  min-height: 400px;
}

.kanban-column {
  flex: 0 0 300px;
  background: ${isDark ? '#111827' : '#f3f4f6'};
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
}

.kanban-column__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 4px;
  margin-bottom: 8px;
}

.kanban-column__title {
  font-weight: 600;
  font-size: 14px;
  color: ${isDark ? '#e5e7eb' : '#1f2937'};
}

.kanban-column__count {
  background: ${isDark ? '#374151' : '#e5e7eb'};
  color: ${isDark ? '#9ca3af' : '#6b7280'};
  font-size: 12px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 10px;
}

.kanban-column__items {
  flex: 1;
  overflow-y: auto;
  min-height: 50px;
}

.kanban-card {
  padding: 12px;
  background: ${isDark ? '#1f2937' : '#ffffff'};
  border: 1px solid ${isDark ? '#374151' : '#e5e7eb'};
  border-radius: 8px;
  cursor: grab;
  margin-bottom: 8px;
  transition: all 150ms ease;
}

.kanban-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,${isDark ? '0.2' : '0.08'});
  transform: translateY(-1px);
}

.kanban-card:active {
  cursor: grabbing;
  box-shadow: 0 8px 24px rgba(0,0,0,${isDark ? '0.3' : '0.12'});
}

.kanban-card__title {
  font-size: 14px;
  font-weight: 500;
  color: ${isDark ? '#e5e7eb' : '#1f2937'};
  margin-bottom: 4px;
}

.kanban-card__description {
  font-size: 13px;
  color: ${isDark ? '#9ca3af' : '#6b7280'};
  line-height: 1.4;
}

.kanban-card__labels {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 8px;
}

.kanban-card__label {
  font-size: 11px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 4px;
}

.kanban-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  font-size: 12px;
  color: ${isDark ? '#6b7280' : '#9ca3af'};
}

/* File Upload Zone */
.file-upload-zone {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 160px;
  padding: 32px;
  border: 2px dashed ${isDark ? '#4b5563' : '#d1d5db'};
  border-radius: 16px;
  background: ${isDark ? 'rgba(31,41,55,0.3)' : 'rgba(249,250,251,0.5)'};
  cursor: pointer;
  transition: all 250ms ease;
}

.file-upload-zone:hover {
  border-color: #6366f1;
  background: ${isDark ? 'rgba(99,102,241,0.05)' : 'rgba(99,102,241,0.03)'};
}

.file-upload-zone--active {
  border-color: #6366f1;
  background: ${isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.05)'};
  transform: scale(1.01);
}

.file-upload-zone__icon {
  width: 48px;
  height: 48px;
  color: ${isDark ? '#6b7280' : '#9ca3af'};
  margin-bottom: 12px;
}

.file-upload-zone__text {
  font-size: 15px;
  font-weight: 500;
  color: ${isDark ? '#d1d5db' : '#374151'};
  margin-bottom: 4px;
}

.file-upload-zone__subtext {
  font-size: 13px;
  color: ${isDark ? '#6b7280' : '#9ca3af'};
}

/* Tree View Drag */
.tree-item {
  position: relative;
  cursor: default;
  user-select: none;
}

.tree-item--draggable {
  cursor: grab;
}

.tree-item--drag-over-top::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #6366f1;
}

.tree-item--drag-over-bottom::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #6366f1;
}

.tree-item--drag-over-inside {
  background: ${isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.06)'};
  border-radius: 6px;
}`;
}

// =============================================================================
// Singleton instance
// =============================================================================

export const dragDropController = new DragDropController();
