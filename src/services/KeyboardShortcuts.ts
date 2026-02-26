/**
 * Keyboard Shortcuts Manager
 * 
 * Centralized keyboard shortcut system for the builder.
 * Features:
 * - Global & context-aware shortcuts
 * - Modifier key combinations (Ctrl/Cmd, Shift, Alt)
 * - Shortcut groups (Canvas, Widget, View, File, Edit)
 * - Conflict detection
 * - Help overlay listing all shortcuts
 * - Custom shortcut remapping support
 */

/* ──────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────── */

export interface Shortcut {
  id: string;
  keys: string; // e.g. "ctrl+c", "ctrl+shift+z"
  label: string;
  description: string;
  group: ShortcutGroup;
  action: string; // Redux action type or callback ID
  enabled: boolean;
  when?: string; // Context condition
}

export type ShortcutGroup =
  | 'file'
  | 'edit'
  | 'view'
  | 'canvas'
  | 'widget'
  | 'tools'
  | 'navigation';

/* ──────────────────────────────────────────────
 * Default Shortcuts
 * ────────────────────────────────────────────── */

export const DEFAULT_SHORTCUTS: Shortcut[] = [
  // ── File ──
  { id: 'new-project', keys: 'ctrl+n', label: 'New Project', description: 'Create a new project', group: 'file', action: 'file/new', enabled: true },
  { id: 'save', keys: 'ctrl+s', label: 'Save', description: 'Save current project', group: 'file', action: 'file/save', enabled: true },
  { id: 'save-as', keys: 'ctrl+shift+s', label: 'Save As', description: 'Save project with new name', group: 'file', action: 'file/saveAs', enabled: true },
  { id: 'export', keys: 'ctrl+e', label: 'Export', description: 'Export project', group: 'file', action: 'file/export', enabled: true },
  { id: 'build', keys: 'ctrl+b', label: 'Build', description: 'Open build modal', group: 'file', action: 'file/build', enabled: true },
  { id: 'import', keys: 'ctrl+i', label: 'Import', description: 'Import project file', group: 'file', action: 'file/import', enabled: true },

  // ── Edit ──
  { id: 'undo', keys: 'ctrl+z', label: 'Undo', description: 'Undo last action', group: 'edit', action: 'edit/undo', enabled: true },
  { id: 'redo', keys: 'ctrl+shift+z', label: 'Redo', description: 'Redo last undone action', group: 'edit', action: 'edit/redo', enabled: true },
  { id: 'redo-alt', keys: 'ctrl+y', label: 'Redo', description: 'Redo (alt)', group: 'edit', action: 'edit/redo', enabled: true },
  { id: 'cut', keys: 'ctrl+x', label: 'Cut', description: 'Cut selected widget(s)', group: 'edit', action: 'edit/cut', enabled: true },
  { id: 'copy', keys: 'ctrl+c', label: 'Copy', description: 'Copy selected widget(s)', group: 'edit', action: 'edit/copy', enabled: true },
  { id: 'paste', keys: 'ctrl+v', label: 'Paste', description: 'Paste widget(s)', group: 'edit', action: 'edit/paste', enabled: true },
  { id: 'duplicate', keys: 'ctrl+d', label: 'Duplicate', description: 'Duplicate selected widget(s)', group: 'edit', action: 'edit/duplicate', enabled: true },
  { id: 'delete', keys: 'delete', label: 'Delete', description: 'Delete selected widget(s)', group: 'edit', action: 'edit/delete', enabled: true },
  { id: 'delete-alt', keys: 'backspace', label: 'Delete', description: 'Delete (alt)', group: 'edit', action: 'edit/delete', enabled: true },
  { id: 'select-all', keys: 'ctrl+a', label: 'Select All', description: 'Select all widgets on page', group: 'edit', action: 'edit/selectAll', enabled: true },
  { id: 'deselect', keys: 'escape', label: 'Deselect', description: 'Deselect all', group: 'edit', action: 'edit/deselect', enabled: true },
  { id: 'find', keys: 'ctrl+f', label: 'Find', description: 'Search widgets', group: 'edit', action: 'edit/find', enabled: true },

  // ── View ──
  { id: 'zoom-in', keys: 'ctrl+=', label: 'Zoom In', description: 'Zoom in canvas', group: 'view', action: 'view/zoomIn', enabled: true },
  { id: 'zoom-out', keys: 'ctrl+-', label: 'Zoom Out', description: 'Zoom out canvas', group: 'view', action: 'view/zoomOut', enabled: true },
  { id: 'zoom-reset', keys: 'ctrl+0', label: 'Zoom to 100%', description: 'Reset zoom to 100%', group: 'view', action: 'view/zoomReset', enabled: true },
  { id: 'zoom-fit', keys: 'ctrl+1', label: 'Zoom to Fit', description: 'Fit canvas in viewport', group: 'view', action: 'view/zoomFit', enabled: true },
  { id: 'toggle-grid', keys: 'ctrl+g', label: 'Toggle Grid', description: 'Show/hide grid', group: 'view', action: 'view/toggleGrid', enabled: true },
  { id: 'toggle-rulers', keys: 'ctrl+r', label: 'Toggle Rulers', description: 'Show/hide rulers', group: 'view', action: 'view/toggleRulers', enabled: true },
  { id: 'toggle-outlines', keys: 'ctrl+shift+o', label: 'Toggle Outlines', description: 'Show/hide widget outlines', group: 'view', action: 'view/toggleOutlines', enabled: true },
  { id: 'toggle-preview', keys: 'ctrl+p', label: 'Preview', description: 'Toggle preview mode', group: 'view', action: 'view/togglePreview', enabled: true },
  { id: 'toggle-dark-mode', keys: 'ctrl+shift+d', label: 'Dark Mode', description: 'Toggle dark/light mode', group: 'view', action: 'view/toggleDarkMode', enabled: true },
  { id: 'toggle-fullscreen', keys: 'f11', label: 'Fullscreen', description: 'Toggle fullscreen', group: 'view', action: 'view/fullscreen', enabled: true },
  { id: 'toggle-left-panel', keys: 'ctrl+[', label: 'Toggle Left Panel', description: 'Show/hide left sidebar', group: 'view', action: 'view/toggleLeftPanel', enabled: true },
  { id: 'toggle-right-panel', keys: 'ctrl+]', label: 'Toggle Right Panel', description: 'Show/hide right sidebar', group: 'view', action: 'view/toggleRightPanel', enabled: true },

  // ── Canvas / Widget ──
  { id: 'move-up', keys: 'arrowup', label: 'Move Up', description: 'Move widget up 1px', group: 'widget', action: 'widget/moveUp', enabled: true, when: 'widgetSelected' },
  { id: 'move-down', keys: 'arrowdown', label: 'Move Down', description: 'Move widget down 1px', group: 'widget', action: 'widget/moveDown', enabled: true, when: 'widgetSelected' },
  { id: 'move-left', keys: 'arrowleft', label: 'Move Left', description: 'Move widget left 1px', group: 'widget', action: 'widget/moveLeft', enabled: true, when: 'widgetSelected' },
  { id: 'move-right', keys: 'arrowright', label: 'Move Right', description: 'Move widget right 1px', group: 'widget', action: 'widget/moveRight', enabled: true, when: 'widgetSelected' },
  { id: 'move-up-10', keys: 'shift+arrowup', label: 'Move Up 10px', description: 'Move widget up 10px', group: 'widget', action: 'widget/moveUp10', enabled: true, when: 'widgetSelected' },
  { id: 'move-down-10', keys: 'shift+arrowdown', label: 'Move Down 10px', description: 'Move widget down 10px', group: 'widget', action: 'widget/moveDown10', enabled: true, when: 'widgetSelected' },
  { id: 'move-left-10', keys: 'shift+arrowleft', label: 'Move Left 10px', description: 'Move widget left 10px', group: 'widget', action: 'widget/moveLeft10', enabled: true, when: 'widgetSelected' },
  { id: 'move-right-10', keys: 'shift+arrowright', label: 'Move Right 10px', description: 'Move widget right 10px', group: 'widget', action: 'widget/moveRight10', enabled: true, when: 'widgetSelected' },
  { id: 'bring-forward', keys: 'ctrl+arrowup', label: 'Bring Forward', description: 'Increase z-index', group: 'widget', action: 'widget/bringForward', enabled: true, when: 'widgetSelected' },
  { id: 'send-backward', keys: 'ctrl+arrowdown', label: 'Send Backward', description: 'Decrease z-index', group: 'widget', action: 'widget/sendBackward', enabled: true, when: 'widgetSelected' },
  { id: 'bring-front', keys: 'ctrl+shift+arrowup', label: 'Bring to Front', description: 'Bring to front', group: 'widget', action: 'widget/bringToFront', enabled: true, when: 'widgetSelected' },
  { id: 'send-back', keys: 'ctrl+shift+arrowdown', label: 'Send to Back', description: 'Send to back', group: 'widget', action: 'widget/sendToBack', enabled: true, when: 'widgetSelected' },
  { id: 'lock', keys: 'ctrl+l', label: 'Lock/Unlock', description: 'Toggle widget lock', group: 'widget', action: 'widget/toggleLock', enabled: true, when: 'widgetSelected' },
  { id: 'hide', keys: 'ctrl+h', label: 'Hide/Show', description: 'Toggle widget visibility', group: 'widget', action: 'widget/toggleVisibility', enabled: true, when: 'widgetSelected' },
  { id: 'group', keys: 'ctrl+shift+g', label: 'Group', description: 'Group selected widgets', group: 'widget', action: 'widget/group', enabled: true, when: 'multiSelected' },
  { id: 'ungroup', keys: 'ctrl+shift+u', label: 'Ungroup', description: 'Ungroup widgets', group: 'widget', action: 'widget/ungroup', enabled: true, when: 'widgetSelected' },

  // ── Alignment ──
  { id: 'align-left', keys: 'alt+a', label: 'Align Left', description: 'Align widget(s) to left', group: 'widget', action: 'align/left', enabled: true, when: 'widgetSelected' },
  { id: 'align-center-h', keys: 'alt+c', label: 'Align Center H', description: 'Center horizontally', group: 'widget', action: 'align/centerH', enabled: true, when: 'widgetSelected' },
  { id: 'align-right', keys: 'alt+d', label: 'Align Right', description: 'Align widget(s) to right', group: 'widget', action: 'align/right', enabled: true, when: 'widgetSelected' },
  { id: 'align-top', keys: 'alt+w', label: 'Align Top', description: 'Align widget(s) to top', group: 'widget', action: 'align/top', enabled: true, when: 'widgetSelected' },
  { id: 'align-center-v', keys: 'alt+m', label: 'Align Center V', description: 'Center vertically', group: 'widget', action: 'align/centerV', enabled: true, when: 'widgetSelected' },
  { id: 'align-bottom', keys: 'alt+s', label: 'Align Bottom', description: 'Align widget(s) to bottom', group: 'widget', action: 'align/bottom', enabled: true, when: 'widgetSelected' },

  // ── Tools ──
  { id: 'hand-tool', keys: 'h', label: 'Hand Tool', description: 'Activate pan/hand tool', group: 'tools', action: 'tools/hand', enabled: true },
  { id: 'select-tool', keys: 'v', label: 'Select Tool', description: 'Activate select tool', group: 'tools', action: 'tools/select', enabled: true },
  { id: 'text-tool', keys: 't', label: 'Text Tool', description: 'Add text widget', group: 'tools', action: 'tools/text', enabled: true },
  { id: 'rectangle-tool', keys: 'r', label: 'Container Tool', description: 'Add container widget', group: 'tools', action: 'tools/container', enabled: true },
  { id: 'image-tool', keys: 'i', label: 'Image Tool', description: 'Add image widget', group: 'tools', action: 'tools/image', enabled: true },
  { id: 'command-palette', keys: 'ctrl+k', label: 'Command Palette', description: 'Open command palette', group: 'tools', action: 'tools/commandPalette', enabled: true },
  { id: 'shortcuts-help', keys: 'ctrl+/', label: 'Shortcuts', description: 'Show keyboard shortcuts', group: 'tools', action: 'tools/shortcuts', enabled: true },

  // ── Navigation ──
  { id: 'next-page', keys: 'ctrl+pagedown', label: 'Next Page', description: 'Switch to next page', group: 'navigation', action: 'nav/nextPage', enabled: true },
  { id: 'prev-page', keys: 'ctrl+pageup', label: 'Previous Page', description: 'Switch to previous page', group: 'navigation', action: 'nav/prevPage', enabled: true },
  { id: 'components-tab', keys: 'alt+1', label: 'Components', description: 'Switch to Components tab', group: 'navigation', action: 'nav/components', enabled: true },
  { id: 'templates-tab', keys: 'alt+2', label: 'Templates', description: 'Switch to Templates tab', group: 'navigation', action: 'nav/templates', enabled: true },
  { id: 'layers-tab', keys: 'alt+3', label: 'Layers', description: 'Switch to Layers tab', group: 'navigation', action: 'nav/layers', enabled: true },
  { id: 'pages-tab', keys: 'alt+4', label: 'Pages', description: 'Switch to Pages tab', group: 'navigation', action: 'nav/pages', enabled: true },
];

export const GROUP_LABELS: Record<ShortcutGroup, string> = {
  file: 'File',
  edit: 'Edit',
  view: 'View',
  canvas: 'Canvas',
  widget: 'Widget & Alignment',
  tools: 'Tools',
  navigation: 'Navigation',
};

/* ──────────────────────────────────────────────
 * Shortcut Helpers
 * ────────────────────────────────────────────── */

export function parseShortcutKeys(keys: string): { ctrl: boolean; shift: boolean; alt: boolean; meta: boolean; key: string } {
  const parts = keys.toLowerCase().split('+');
  return {
    ctrl: parts.includes('ctrl') || parts.includes('cmd'),
    shift: parts.includes('shift'),
    alt: parts.includes('alt'),
    meta: parts.includes('meta'),
    key: parts.filter(p => !['ctrl', 'cmd', 'shift', 'alt', 'meta'].includes(p)).join('+'),
  };
}

export function matchesShortcut(e: KeyboardEvent, shortcut: Shortcut): boolean {
  const parsed = parseShortcutKeys(shortcut.keys);
  const eventKey = e.key.toLowerCase();
  const eventCode = e.code.toLowerCase();

  const keyMatch = eventKey === parsed.key ||
    eventCode === parsed.key ||
    eventCode === `key${parsed.key}` ||
    eventCode === `digit${parsed.key}` ||
    eventKey === parsed.key.replace('arrow', '');

  return (
    keyMatch &&
    e.ctrlKey === parsed.ctrl &&
    e.shiftKey === parsed.shift &&
    e.altKey === parsed.alt
  );
}

export function formatShortcutKeys(keys: string): string {
  const isMac = typeof navigator !== 'undefined' && navigator.platform?.includes('Mac');
  return keys
    .replace(/ctrl/gi, isMac ? '⌘' : 'Ctrl')
    .replace(/shift/gi, isMac ? '⇧' : 'Shift')
    .replace(/alt/gi, isMac ? '⌥' : 'Alt')
    .replace(/meta/gi, isMac ? '⌘' : 'Win')
    .replace(/delete/gi, 'Del')
    .replace(/backspace/gi, '⌫')
    .replace(/arrowup/gi, '↑')
    .replace(/arrowdown/gi, '↓')
    .replace(/arrowleft/gi, '←')
    .replace(/arrowright/gi, '→')
    .replace(/escape/gi, 'Esc')
    .replace(/pagedown/gi, 'PgDn')
    .replace(/pageup/gi, 'PgUp')
    .replace(/\+/g, ' + ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

export function getShortcutsByGroup(): Map<ShortcutGroup, Shortcut[]> {
  const m = new Map<ShortcutGroup, Shortcut[]>();
  for (const s of DEFAULT_SHORTCUTS) {
    const list = m.get(s.group) ?? [];
    list.push(s);
    m.set(s.group, list);
  }
  return m;
}
