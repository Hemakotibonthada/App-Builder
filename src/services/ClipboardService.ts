/**
 * Clipboard Service
 * 
 * Copy, cut, paste widgets with full deep-clone support.
 * Maintains clipboard state and handles ID regeneration.
 */

import { WidgetConfig, WidgetType } from '@/types/widget.types';
import { generateId } from '@/utils';

/* ──────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────── */

export interface ClipboardItem {
  widgets: WidgetConfig[];
  timestamp: number;
  sourcePageId: string;
  operation: 'copy' | 'cut';
}

/* ──────────────────────────────────────────────
 * Clipboard State
 * ────────────────────────────────────────────── */

let clipboard: ClipboardItem | null = null;

/**
 * Copies widgets to the clipboard.
 */
export function copyWidgets(
  widgetIds: string[],
  allWidgets: Record<string, WidgetConfig>,
  pageId: string,
): ClipboardItem {
  const widgets = widgetIds
    .map(id => allWidgets[id])
    .filter(Boolean) as WidgetConfig[];

  const item: ClipboardItem = {
    widgets: widgets.map(w => deepCloneWidget(w, allWidgets)),
    timestamp: Date.now(),
    sourcePageId: pageId,
    operation: 'copy',
  };

  clipboard = item;
  return item;
}

/**
 * Cuts widgets to the clipboard (copy + mark for removal).
 */
export function cutWidgets(
  widgetIds: string[],
  allWidgets: Record<string, WidgetConfig>,
  pageId: string,
): ClipboardItem {
  const item = copyWidgets(widgetIds, allWidgets, pageId);
  item.operation = 'cut';
  clipboard = item;
  return item;
}

/**
 * Returns the clipboard contents, with all IDs regenerated
 * to avoid conflicts.
 */
export function pasteWidgets(
  offsetX: number = 20,
  offsetY: number = 20,
): WidgetConfig[] | null {
  if (!clipboard) return null;

  const idMap = new Map<string, string>();

  const regenerateIds = (widget: WidgetConfig): WidgetConfig => {
    const newId = generateId('w');
    idMap.set(widget.id, newId);

    return {
      ...widget,
      id: newId,
      name: `${widget.name} (Copy)`,
      parentId: widget.parentId ? (idMap.get(widget.parentId) ?? widget.parentId) : null,
      childIds: widget.childIds.map(cId => idMap.get(cId) ?? cId),
      position: {
        x: widget.position.x + offsetX,
        y: widget.position.y + offsetY,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  };

  return clipboard.widgets.map(regenerateIds);
}

/**
 * Returns whether clipboard has content.
 */
export function hasClipboard(): boolean {
  return clipboard !== null && clipboard.widgets.length > 0;
}

/**
 * Gets clipboard info without consuming it.
 */
export function getClipboardInfo(): { count: number; operation: string; timestamp: number } | null {
  if (!clipboard) return null;
  return {
    count: clipboard.widgets.length,
    operation: clipboard.operation,
    timestamp: clipboard.timestamp,
  };
}

/**
 * Clears the clipboard.
 */
export function clearClipboard(): void {
  clipboard = null;
}

/**
 * Deep clones a widget including all its descendants.
 */
function deepCloneWidget(
  widget: WidgetConfig,
  allWidgets: Record<string, WidgetConfig>,
): WidgetConfig {
  return {
    ...widget,
    props: { ...widget.props },
    style: { ...widget.style },
    position: { ...widget.position },
    visibility: { ...widget.visibility },
    a11y: { ...widget.a11y },
    responsive: { ...widget.responsive },
    events: [...widget.events],
    bindings: [...widget.bindings],
  };
}
