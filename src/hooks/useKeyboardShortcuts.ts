/**
 * Keyboard Shortcut Handler Hook
 * 
 * Listens for all registered keyboard shortcuts and
 * dispatches the appropriate Redux actions.
 * Integrates with Clipboard, Alignment, and all UI slices.
 */

'use client';

import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector, store } from '@/store/store';
import {
  zoomIn, zoomOut, resetZoom, zoomToFit,
  deleteSelected, selectAll, duplicateWidget,
  clearSelection, toggleWidgetLock, toggleWidgetVisibility,
  setInteractionMode, updateWidget, addWidget,
} from '@/store/canvasSlice';
import { undo, redo } from '@/store/historySlice';
import {
  toggleShowGrid, toggleShowOutlines, toggleShowRulers,
  togglePreviewMode, toggleDarkMode, toggleFullscreen,
  toggleLeftPanel, toggleRightPanel,
  setLeftPanelTab, toggleSearch, openModal,
  addNotification, ModalType, SidebarTab,
} from '@/store/uiSlice';
import { InteractionMode } from '@/types/canvas.types';
import { WidgetType } from '@/types/widget.types';
import { DEFAULT_SHORTCUTS, matchesShortcut } from '@/services/KeyboardShortcuts';
import { copyWidgets, cutWidgets, pasteWidgets, hasClipboard } from '@/services/ClipboardService';
import { alignWidgets, type AlignType } from '@/services/AlignmentTools';

export function useKeyboardShortcuts() {
  const dispatch = useAppDispatch();
  const selectedIds = useAppSelector(s => s.canvas.selection.selectedIds);
  const activePageId = useAppSelector(s => s.canvas.activePageId);
  const previewMode = useAppSelector(s => s.ui.previewMode);

  const handleAction = useCallback((action: string) => {
    const state = store.getState();
    const widgets = state.canvas.widgets;
    const pages = state.canvas.pages;
    const selectedWidgets = selectedIds.map(id => widgets[id]).filter(Boolean);

    switch (action) {
      // ── File ──
      case 'file/save':
        dispatch(addNotification({ type: 'success', title: 'Saved', message: 'Project saved successfully.', duration: 2000, dismissible: true }));
        break;
      case 'file/build':
        dispatch(openModal({ type: ModalType.Build }));
        break;
      case 'file/export':
        dispatch(openModal({ type: ModalType.Export }));
        break;

      // ── Edit ──
      case 'edit/undo': dispatch(undo()); break;
      case 'edit/redo': dispatch(redo()); break;
      case 'edit/delete': dispatch(deleteSelected()); break;
      case 'edit/selectAll': dispatch(selectAll()); break;
      case 'edit/deselect': dispatch(clearSelection()); break;
      case 'edit/duplicate':
        if (selectedIds[0]) dispatch(duplicateWidget(selectedIds[0]));
        break;
      case 'edit/copy':
        if (selectedIds.length > 0) {
          copyWidgets([...selectedIds], widgets, activePageId);
          dispatch(addNotification({ type: 'info', title: 'Copied', message: `${selectedIds.length} widget(s) copied`, duration: 1500, dismissible: true }));
        }
        break;
      case 'edit/cut':
        if (selectedIds.length > 0) {
          cutWidgets([...selectedIds], widgets, activePageId);
          dispatch(deleteSelected());
          dispatch(addNotification({ type: 'info', title: 'Cut', message: `${selectedIds.length} widget(s) cut`, duration: 1500, dismissible: true }));
        }
        break;
      case 'edit/paste':
        if (hasClipboard()) {
          const pasted = pasteWidgets(20, 20);
          if (pasted) {
            for (const w of pasted) {
              dispatch(addWidget({
                type: w.type,
                position: w.position,
                props: { ...w.props },
                style: { ...w.style },
                name: w.name,
                id: w.id,
              }));
            }
            dispatch(addNotification({ type: 'success', title: 'Pasted', message: `${pasted.length} widget(s) pasted`, duration: 1500, dismissible: true }));
          }
        }
        break;
      case 'edit/find':
        dispatch(toggleSearch());
        break;

      // ── View ──
      case 'view/zoomIn': dispatch(zoomIn()); break;
      case 'view/zoomOut': dispatch(zoomOut()); break;
      case 'view/zoomReset': dispatch(resetZoom()); break;
      case 'view/zoomFit': dispatch(zoomToFit()); break;
      case 'view/toggleGrid': dispatch(toggleShowGrid()); break;
      case 'view/toggleRulers': dispatch(toggleShowRulers()); break;
      case 'view/toggleOutlines': dispatch(toggleShowOutlines()); break;
      case 'view/togglePreview': dispatch(togglePreviewMode()); break;
      case 'view/toggleDarkMode': dispatch(toggleDarkMode()); break;
      case 'view/fullscreen': dispatch(toggleFullscreen()); break;
      case 'view/toggleLeftPanel': dispatch(toggleLeftPanel()); break;
      case 'view/toggleRightPanel': dispatch(toggleRightPanel()); break;

      // ── Widget Movement ──
      case 'widget/moveUp':
      case 'widget/moveDown':
      case 'widget/moveLeft':
      case 'widget/moveRight':
      case 'widget/moveUp10':
      case 'widget/moveDown10':
      case 'widget/moveLeft10':
      case 'widget/moveRight10': {
        const delta = action.includes('10') ? 10 : 1;
        const dir = action.replace('widget/move', '').replace('10', '').toLowerCase();
        for (const w of selectedWidgets) {
          if (!w) continue;
          const newPos = { ...w.position };
          if (dir === 'up') newPos.y -= delta;
          if (dir === 'down') newPos.y += delta;
          if (dir === 'left') newPos.x -= delta;
          if (dir === 'right') newPos.x += delta;
          dispatch(updateWidget({ id: w.id, position: newPos }));
        }
        break;
      }

      // ── Widget Lock/Visibility ──
      case 'widget/toggleLock':
        for (const id of selectedIds) dispatch(toggleWidgetLock(id));
        break;
      case 'widget/toggleVisibility':
        for (const id of selectedIds) dispatch(toggleWidgetVisibility(id));
        break;

      // ── Alignment ──
      case 'align/left':
      case 'align/centerH':
      case 'align/right':
      case 'align/top':
      case 'align/centerV':
      case 'align/bottom': {
        const alignMap: Record<string, AlignType> = {
          'align/left': 'left', 'align/centerH': 'center-h', 'align/right': 'right',
          'align/top': 'top', 'align/centerV': 'center-v', 'align/bottom': 'bottom',
        };
        const results = alignWidgets(
          selectedWidgets.filter(Boolean) as any[],
          alignMap[action]!,
          state.canvas.canvasWidth,
          state.canvas.canvasHeight,
        );
        for (const r of results) {
          dispatch(updateWidget({ id: r.id, position: { x: r.x, y: r.y } }));
        }
        break;
      }

      // ── Tools ──
      case 'tools/hand': dispatch(setInteractionMode(InteractionMode.Pan)); break;
      case 'tools/select': dispatch(setInteractionMode(InteractionMode.Select)); break;
      case 'tools/text': dispatch(addWidget({ type: WidgetType.Text, position: { x: 100, y: 100 } })); break;
      case 'tools/container': dispatch(addWidget({ type: WidgetType.Container, position: { x: 100, y: 100 } })); break;
      case 'tools/image': dispatch(addWidget({ type: WidgetType.Image, position: { x: 100, y: 100 } })); break;
      case 'tools/shortcuts':
        dispatch(openModal({ type: ModalType.Shortcuts }));
        break;
      case 'tools/commandPalette':
        dispatch(addNotification({ type: 'info', title: 'Command Palette', message: 'Press Ctrl+K to search commands', duration: 2000, dismissible: true }));
        break;

      // ── Navigation ──
      case 'nav/nextPage': {
        const idx = pages.findIndex(p => p.id === activePageId);
        if (idx < pages.length - 1) {
          dispatch({ type: 'canvas/setActivePage', payload: pages[idx + 1]!.id });
        }
        break;
      }
      case 'nav/prevPage': {
        const idx = pages.findIndex(p => p.id === activePageId);
        if (idx > 0) {
          dispatch({ type: 'canvas/setActivePage', payload: pages[idx - 1]!.id });
        }
        break;
      }
      case 'nav/components': dispatch(setLeftPanelTab(SidebarTab.Components)); break;
      case 'nav/templates': dispatch(setLeftPanelTab(SidebarTab.Templates)); break;
      case 'nav/layers': dispatch(setLeftPanelTab(SidebarTab.Layers)); break;
      case 'nav/pages': dispatch(setLeftPanelTab(SidebarTab.Pages)); break;
    }
  }, [dispatch, selectedIds, activePageId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't fire shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        // Allow Escape and some Ctrl shortcuts even in inputs
        if (e.key !== 'Escape' && !(e.ctrlKey && ['s', 'z', 'y'].includes(e.key.toLowerCase()))) {
          return;
        }
      }

      if (previewMode && e.key !== 'Escape' && !(e.ctrlKey && e.key.toLowerCase() === 'p')) {
        return;
      }

      for (const shortcut of DEFAULT_SHORTCUTS) {
        if (!shortcut.enabled) continue;
        if (matchesShortcut(e, shortcut)) {
          e.preventDefault();
          e.stopPropagation();
          handleAction(shortcut.action);
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAction, previewMode]);
}
