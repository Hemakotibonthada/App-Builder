// =============================================================================
// Context Menu Service - Dynamic context menu builder with nested submenus,
// separators, icons, keyboard shortcuts, and conditional visibility
// =============================================================================

// =============================================================================
// Context Menu Types
// =============================================================================

export interface ContextMenuItem {
  id: string;
  type: 'item' | 'separator' | 'submenu' | 'header' | 'checkbox' | 'radio';
  label?: string;
  icon?: string;
  shortcut?: string;
  disabled?: boolean;
  checked?: boolean;
  radioGroup?: string;
  danger?: boolean;
  description?: string;
  handler?: (context: ContextMenuContext) => void;
  children?: ContextMenuItem[];
  isVisible?: (context: ContextMenuContext) => boolean;
  isDisabled?: (context: ContextMenuContext) => boolean;
  isChecked?: (context: ContextMenuContext) => boolean;
}

export interface ContextMenuContext {
  targetId?: string;
  targetType?: string;
  position: { x: number; y: number };
  selectedIds?: string[];
  pageId?: string;
  canvasState?: {
    zoom: number;
    showGrid: boolean;
    showRulers: boolean;
    showGuides: boolean;
  };
  clipboard?: { hasContent: boolean; itemCount: number };
  history?: { canUndo: boolean; canRedo: boolean };
  customData?: Record<string, unknown>;
}

export interface ContextMenuConfig {
  minWidth: number;
  maxWidth: number;
  itemHeight: number;
  separatorHeight: number;
  headerHeight: number;
  borderRadius: number;
  animationDuration: number;
  submenuDelay: number;
  position: 'fixed' | 'absolute';
  theme: 'light' | 'dark' | 'auto';
  backdrop: boolean;
}

export interface ContextMenuPosition {
  top: number;
  left: number;
  transformOrigin: string;
}

// =============================================================================
// Default Config
// =============================================================================

export const DEFAULT_CONTEXT_MENU_CONFIG: ContextMenuConfig = {
  minWidth: 180,
  maxWidth: 320,
  itemHeight: 32,
  separatorHeight: 9,
  headerHeight: 28,
  borderRadius: 8,
  animationDuration: 150,
  submenuDelay: 200,
  position: 'fixed',
  theme: 'dark',
  backdrop: true,
};

// =============================================================================
// Menu Item Builders
// =============================================================================

export function menuItem(
  id: string,
  label: string,
  handler: (context: ContextMenuContext) => void,
  options?: Partial<Omit<ContextMenuItem, 'id' | 'label' | 'handler' | 'type'>>
): ContextMenuItem {
  return { id, type: 'item', label, handler, ...options };
}

export function separator(): ContextMenuItem {
  return { id: `sep-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, type: 'separator' };
}

export function submenu(id: string, label: string, children: ContextMenuItem[], icon?: string): ContextMenuItem {
  return { id, type: 'submenu', label, children, icon };
}

export function header(label: string): ContextMenuItem {
  return { id: `header-${Date.now()}`, type: 'header', label };
}

export function checkbox(
  id: string,
  label: string,
  handler: (context: ContextMenuContext) => void,
  options?: { checked?: boolean; isChecked?: (ctx: ContextMenuContext) => boolean; icon?: string; shortcut?: string }
): ContextMenuItem {
  return { id, type: 'checkbox', label, handler, checked: options?.checked, isChecked: options?.isChecked, icon: options?.icon, shortcut: options?.shortcut };
}

export function radio(
  id: string,
  label: string,
  radioGroup: string,
  handler: (context: ContextMenuContext) => void,
  options?: { checked?: boolean; isChecked?: (ctx: ContextMenuContext) => boolean; icon?: string; shortcut?: string }
): ContextMenuItem {
  return { id, type: 'radio', label, radioGroup, handler, checked: options?.checked, isChecked: options?.isChecked, icon: options?.icon, shortcut: options?.shortcut };
}

// =============================================================================
// Position Calculator
// =============================================================================

export function calculateMenuPosition(
  mousePosition: { x: number; y: number },
  menuSize: { width: number; height: number },
  viewport: { width: number; height: number },
  padding: number = 8
): ContextMenuPosition {
  let top = mousePosition.y;
  let left = mousePosition.x;
  let transformOrigin = 'top left';

  // Check if menu would overflow right edge
  if (left + menuSize.width > viewport.width - padding) {
    left = mousePosition.x - menuSize.width;
    transformOrigin = 'top right';
  }

  // Check if menu would overflow bottom edge
  if (top + menuSize.height > viewport.height - padding) {
    top = mousePosition.y - menuSize.height;
    transformOrigin = transformOrigin.replace('top', 'bottom');
  }

  // Prevent negative positions
  left = Math.max(padding, left);
  top = Math.max(padding, top);

  return { top, left, transformOrigin };
}

export function calculateSubmenuPosition(
  parentRect: { top: number; left: number; width: number; height: number },
  submenuSize: { width: number; height: number },
  viewport: { width: number; height: number },
  padding: number = 8
): ContextMenuPosition {
  let top = parentRect.top;
  let left = parentRect.left + parentRect.width;
  let transformOrigin = 'top left';

  // Check if submenu would overflow right edge
  if (left + submenuSize.width > viewport.width - padding) {
    left = parentRect.left - submenuSize.width;
    transformOrigin = 'top right';
  }

  // Check if submenu would overflow bottom edge
  if (top + submenuSize.height > viewport.height - padding) {
    top = viewport.height - submenuSize.height - padding;
    transformOrigin = transformOrigin.replace('top', 'bottom');
  }

  top = Math.max(padding, top);

  return { top, left, transformOrigin };
}

// =============================================================================
// Menu Resolution (apply visibility/disabled conditions)
// =============================================================================

export function resolveMenuItems(items: ContextMenuItem[], context: ContextMenuContext): ContextMenuItem[] {
  return items
    .filter(item => {
      if (item.isVisible) return item.isVisible(context);
      return true;
    })
    .map(item => {
      const resolved = { ...item };

      if (item.isDisabled) {
        resolved.disabled = item.isDisabled(context);
      }

      if (item.isChecked) {
        resolved.checked = item.isChecked(context);
      }

      if (item.children) {
        resolved.children = resolveMenuItems(item.children, context);
      }

      return resolved;
    });
}

// =============================================================================
// Built-in Context Menus
// =============================================================================

export const CANVAS_CONTEXT_MENU: ContextMenuItem[] = [
  menuItem('paste', 'Paste', () => {}, {
    shortcut: 'Ctrl+V',
    icon: 'clipboard',
    isDisabled: (ctx) => !ctx.clipboard?.hasContent,
  }),
  menuItem('paste-in-place', 'Paste in Place', () => {}, {
    shortcut: 'Ctrl+Shift+V',
    icon: 'clipboard',
    isDisabled: (ctx) => !ctx.clipboard?.hasContent,
  }),
  separator(),
  menuItem('select-all', 'Select All', () => {}, { shortcut: 'Ctrl+A', icon: 'check-square' }),
  separator(),
  submenu('insert', 'Insert...', [
    menuItem('insert-text', 'Text', () => {}, { icon: 'type' }),
    menuItem('insert-image', 'Image', () => {}, { icon: 'image' }),
    menuItem('insert-button', 'Button', () => {}, { icon: 'square' }),
    menuItem('insert-container', 'Container', () => {}, { icon: 'box' }),
    menuItem('insert-input', 'Input', () => {}, { icon: 'edit' }),
    separator(),
    menuItem('insert-section', 'Section', () => {}, { icon: 'layout' }),
    menuItem('insert-grid', 'Grid', () => {}, { icon: 'grid' }),
    menuItem('insert-flex', 'Flex Container', () => {}, { icon: 'columns' }),
  ], 'plus-square'),
  separator(),
  submenu('view-options', 'View', [
    checkbox('toggle-grid', 'Show Grid', () => {}, { isChecked: (ctx) => ctx.canvasState?.showGrid === true }),
    checkbox('toggle-rulers', 'Show Rulers', () => {}, { isChecked: (ctx) => ctx.canvasState?.showRulers === true }),
    checkbox('toggle-guides', 'Show Guides', () => {}, { isChecked: (ctx) => ctx.canvasState?.showGuides === true }),
    separator(),
    submenu('zoom', 'Zoom', [
      menuItem('zoom-50', '50%', () => {}),
      menuItem('zoom-75', '75%', () => {}),
      menuItem('zoom-100', '100%', () => {}),
      menuItem('zoom-125', '125%', () => {}),
      menuItem('zoom-150', '150%', () => {}),
      menuItem('zoom-200', '200%', () => {}),
      separator(),
      menuItem('zoom-fit', 'Fit to Canvas', () => {}),
    ]),
  ], 'eye'),
  separator(),
  menuItem('page-settings', 'Page Settings...', () => {}, { icon: 'settings' }),
];

export const WIDGET_CONTEXT_MENU: ContextMenuItem[] = [
  menuItem('cut', 'Cut', () => {}, { shortcut: 'Ctrl+X', icon: 'scissors' }),
  menuItem('copy', 'Copy', () => {}, { shortcut: 'Ctrl+C', icon: 'copy' }),
  menuItem('paste', 'Paste', () => {}, {
    shortcut: 'Ctrl+V',
    icon: 'clipboard',
    isDisabled: (ctx) => !ctx.clipboard?.hasContent,
  }),
  menuItem('duplicate', 'Duplicate', () => {}, { shortcut: 'Ctrl+D', icon: 'copy' }),
  menuItem('delete', 'Delete', () => {}, { shortcut: 'Delete', icon: 'trash', danger: true }),
  separator(),
  submenu('arrange', 'Arrange', [
    menuItem('bring-front', 'Bring to Front', () => {}, { shortcut: 'Ctrl+Shift+]', icon: 'chevrons-up' }),
    menuItem('bring-forward', 'Bring Forward', () => {}, { shortcut: 'Ctrl+]', icon: 'chevron-up' }),
    menuItem('send-backward', 'Send Backward', () => {}, { shortcut: 'Ctrl+[', icon: 'chevron-down' }),
    menuItem('send-back', 'Send to Back', () => {}, { shortcut: 'Ctrl+Shift+[', icon: 'chevrons-down' }),
  ], 'layers'),
  submenu('align', 'Align', [
    header('Horizontal'),
    menuItem('align-left', 'Align Left', () => {}, { icon: 'align-left' }),
    menuItem('align-center-h', 'Align Center', () => {}, { icon: 'align-center' }),
    menuItem('align-right', 'Align Right', () => {}, { icon: 'align-right' }),
    separator(),
    header('Vertical'),
    menuItem('align-top', 'Align Top', () => {}, { icon: 'align-start' }),
    menuItem('align-center-v', 'Align Middle', () => {}, { icon: 'align-center' }),
    menuItem('align-bottom', 'Align Bottom', () => {}, { icon: 'align-end' }),
    separator(),
    header('Distribute'),
    menuItem('distribute-h', 'Distribute Horizontally', () => {}, { icon: 'columns' }),
    menuItem('distribute-v', 'Distribute Vertically', () => {}, { icon: 'rows' }),
  ], 'align-center'),
  submenu('transform', 'Transform', [
    menuItem('flip-h', 'Flip Horizontal', () => {}, { icon: 'flip-horizontal' }),
    menuItem('flip-v', 'Flip Vertical', () => {}, { icon: 'flip-vertical' }),
    separator(),
    menuItem('rotate-cw', 'Rotate 90° CW', () => {}, { icon: 'rotate-cw' }),
    menuItem('rotate-ccw', 'Rotate 90° CCW', () => {}, { icon: 'rotate-ccw' }),
    separator(),
    menuItem('reset-transform', 'Reset Transforms', () => {}, { icon: 'refresh-cw' }),
  ], 'rotate-cw'),
  separator(),
  menuItem('group', 'Group', () => {}, {
    shortcut: 'Ctrl+G',
    icon: 'group',
    isVisible: (ctx) => (ctx.selectedIds?.length || 0) > 1,
  }),
  menuItem('ungroup', 'Ungroup', () => {}, {
    shortcut: 'Ctrl+Shift+G',
    icon: 'ungroup',
    isVisible: (ctx) => ctx.targetType === 'group',
  }),
  checkbox('lock', 'Lock', () => {}, { icon: 'lock' }),
  checkbox('hide', 'Hide', () => {}, { icon: 'eye-off' }),
  separator(),
  menuItem('inspect', 'Inspect Element', () => {}, { shortcut: 'F12', icon: 'code' }),
  menuItem('copy-css', 'Copy CSS', () => {}, { icon: 'copy' }),
  menuItem('copy-html', 'Copy HTML', () => {}, { icon: 'code' }),
];

export const LAYER_CONTEXT_MENU: ContextMenuItem[] = [
  menuItem('select', 'Select', () => {}, { icon: 'mouse-pointer' }),
  menuItem('rename', 'Rename', () => {}, { shortcut: 'F2', icon: 'edit' }),
  separator(),
  menuItem('duplicate-layer', 'Duplicate', () => {}, { shortcut: 'Ctrl+D', icon: 'copy' }),
  menuItem('delete-layer', 'Delete', () => {}, { shortcut: 'Delete', icon: 'trash', danger: true }),
  separator(),
  submenu('move', 'Move to...', [
    menuItem('move-up', 'Move Up', () => {}, { icon: 'arrow-up' }),
    menuItem('move-down', 'Move Down', () => {}, { icon: 'arrow-down' }),
    menuItem('move-top', 'Move to Top', () => {}, { icon: 'chevrons-up' }),
    menuItem('move-bottom', 'Move to Bottom', () => {}, { icon: 'chevrons-down' }),
  ], 'move'),
  separator(),
  checkbox('visibility', 'Visible', () => {}),
  checkbox('lockable', 'Locked', () => {}),
  separator(),
  menuItem('wrap-container', 'Wrap in Container', () => {}, { icon: 'box' }),
  menuItem('unwrap', 'Unwrap', () => {}, { icon: 'minimize' }),
  separator(),
  menuItem('copy-id', 'Copy Element ID', () => {}, { icon: 'hash' }),
  menuItem('scroll-to', 'Scroll to Element', () => {}, { icon: 'crosshair' }),
];

export const PAGE_CONTEXT_MENU: ContextMenuItem[] = [
  menuItem('open-page', 'Open', () => {}, { icon: 'external-link' }),
  menuItem('rename-page', 'Rename', () => {}, { shortcut: 'F2', icon: 'edit' }),
  separator(),
  menuItem('duplicate-page', 'Duplicate Page', () => {}, { icon: 'copy' }),
  menuItem('new-page', 'New Page', () => {}, { icon: 'file-plus' }),
  separator(),
  menuItem('page-settings', 'Page Settings', () => {}, { icon: 'settings' }),
  menuItem('page-seo', 'SEO Settings', () => {}, { icon: 'search' }),
  separator(),
  menuItem('set-home', 'Set as Home Page', () => {}, { icon: 'home' }),
  separator(),
  menuItem('delete-page', 'Delete Page', () => {}, { icon: 'trash', danger: true }),
];

export const ASSET_CONTEXT_MENU: ContextMenuItem[] = [
  menuItem('insert-asset', 'Insert on Canvas', () => {}, { icon: 'plus' }),
  menuItem('preview-asset', 'Preview', () => {}, { icon: 'eye' }),
  separator(),
  menuItem('rename-asset', 'Rename', () => {}, { icon: 'edit' }),
  menuItem('replace-asset', 'Replace', () => {}, { icon: 'refresh-cw' }),
  menuItem('download-asset', 'Download', () => {}, { icon: 'download' }),
  separator(),
  menuItem('copy-url', 'Copy URL', () => {}, { icon: 'link' }),
  menuItem('copy-path', 'Copy Path', () => {}, { icon: 'copy' }),
  separator(),
  menuItem('optimize-asset', 'Optimize', () => {}, { icon: 'zap' }),
  menuItem('resize-asset', 'Resize...', () => {}, { icon: 'maximize' }),
  separator(),
  menuItem('delete-asset', 'Delete', () => {}, { icon: 'trash', danger: true }),
];

// =============================================================================
// Context Menu CSS Generation
// =============================================================================

export function generateContextMenuCSS(config: ContextMenuConfig = DEFAULT_CONTEXT_MENU_CONFIG): string {
  const isDark = config.theme === 'dark';

  return `
.context-menu {
  position: ${config.position};
  min-width: ${config.minWidth}px;
  max-width: ${config.maxWidth}px;
  border-radius: ${config.borderRadius}px;
  padding: 4px;
  z-index: 10000;
  background: ${isDark ? 'rgba(30, 30, 40, 0.95)' : 'rgba(255, 255, 255, 0.98)'};
  border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, ${isDark ? '0.5' : '0.15'}),
              0 2px 8px rgba(0, 0, 0, ${isDark ? '0.3' : '0.08'});
  animation: contextMenuIn ${config.animationDuration}ms ease-out;
  overflow: hidden;
}

@keyframes contextMenuIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.context-menu-item {
  display: flex;
  align-items: center;
  height: ${config.itemHeight}px;
  padding: 0 12px;
  border-radius: ${config.borderRadius - 2}px;
  cursor: pointer;
  color: ${isDark ? '#e0e0e0' : '#333333'};
  font-size: 13px;
  gap: 8px;
  user-select: none;
  transition: background-color 100ms;
}

.context-menu-item:hover {
  background: ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'};
}

.context-menu-item--disabled {
  opacity: 0.4;
  pointer-events: none;
}

.context-menu-item--danger {
  color: #ef4444;
}

.context-menu-item--danger:hover {
  background: rgba(239, 68, 68, 0.1);
}

.context-menu-item__icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  opacity: 0.7;
}

.context-menu-item__label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.context-menu-item__shortcut {
  font-size: 11px;
  opacity: 0.5;
  margin-left: 16px;
  flex-shrink: 0;
}

.context-menu-item__arrow {
  width: 12px;
  height: 12px;
  opacity: 0.5;
  flex-shrink: 0;
}

.context-menu-item__check {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.context-menu-separator {
  height: 1px;
  margin: 4px 8px;
  background: ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'};
}

.context-menu-header {
  height: ${config.headerHeight}px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)'};
}

.context-menu-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
}
`;
}
