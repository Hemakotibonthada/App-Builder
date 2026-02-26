/**
 * Layer Panel
 * 
 * Tree-view showing the widget hierarchy. Supports
 * drag-to-reorder, visibility toggle, lock toggle,
 * and selection.
 */

'use client';

import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import {
  useAppDispatch,
  useAppSelector,
  selectWidgetTree,
  WidgetTreeNode,
} from '@/store/store';
import {
  selectWidget,
  toggleWidgetLock,
  toggleWidgetVisibility,
  removeWidget,
} from '@/store/canvasSlice';

/* ──────────────────────────────────────────────
 * Tree Item Component
 * ────────────────────────────────────────────── */

interface TreeItemProps {
  node: WidgetTreeNode;
  selectedIds: readonly string[];
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
}

function TreeItem({
  node,
  selectedIds,
  expandedIds,
  onToggleExpand,
}: TreeItemProps) {
  const dispatch = useAppDispatch();
  const isSelected = selectedIds.includes(node.id);
  const isExpanded = expandedIds.has(node.id);
  const hasChildren = node.children.length > 0;

  const handleSelect = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      dispatch(selectWidget(node.id));
    },
    [dispatch, node.id],
  );

  const handleToggleLock = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      dispatch(toggleWidgetLock(node.id));
    },
    [dispatch, node.id],
  );

  const handleToggleVisibility = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      dispatch(toggleWidgetVisibility(node.id));
    },
    [dispatch, node.id],
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      dispatch(removeWidget(node.id));
    },
    [dispatch, node.id],
  );

  return (
    <div>
      {/* Item Row */}
      <motion.div
        className={clsx(
          'group flex items-center h-7 cursor-pointer transition-colors',
          'hover:bg-glass-white-10',
          isSelected && 'bg-builder-accent/10 border-l-2 border-builder-accent',
          !isSelected && 'border-l-2 border-transparent',
        )}
        style={{ paddingLeft: node.depth * 16 + 8 }}
        onClick={handleSelect}
        whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
      >
        {/* Expand toggle */}
        <button
          className={clsx(
            'w-4 h-4 flex items-center justify-center flex-shrink-0',
            hasChildren ? 'text-builder-text-dim hover:text-builder-text' : 'invisible',
          )}
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand(node.id);
          }}
        >
          <motion.svg
            className="w-3 h-3"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.15 }}
          >
            <path d="M9 18l6-6-6-6" />
          </motion.svg>
        </button>

        {/* Type icon */}
        <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mx-1">
          <div
            className={clsx(
              'w-3 h-3 rounded-sm',
              isSelected ? 'bg-builder-accent/40' : 'bg-builder-border/50',
            )}
          />
        </div>

        {/* Name */}
        <span
          className={clsx(
            'flex-1 text-[11px] truncate',
            isSelected ? 'text-builder-text font-medium' : 'text-builder-text-muted',
            !node.visible && 'opacity-40 line-through',
          )}
        >
          {node.name}
        </span>

        {/* Action buttons (show on hover) */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity pr-1">
          {/* Visibility toggle */}
          <button
            className={clsx(
              'w-5 h-5 flex items-center justify-center rounded text-builder-text-dim hover:text-builder-text',
              !node.visible && 'text-builder-error',
            )}
            onClick={handleToggleVisibility}
            title={node.visible ? 'Hide' : 'Show'}
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {node.visible ? (
                <>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </>
              ) : (
                <>
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </>
              )}
            </svg>
          </button>

          {/* Lock toggle */}
          <button
            className={clsx(
              'w-5 h-5 flex items-center justify-center rounded text-builder-text-dim hover:text-builder-text',
              node.locked && 'text-builder-warning',
            )}
            onClick={handleToggleLock}
            title={node.locked ? 'Unlock' : 'Lock'}
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {node.locked ? (
                <>
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </>
              ) : (
                <>
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 019.9-1" />
                </>
              )}
            </svg>
          </button>

          {/* Delete */}
          <button
            className="w-5 h-5 flex items-center justify-center rounded text-builder-text-dim hover:text-builder-error"
            onClick={handleDelete}
            title="Delete"
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
          </button>
        </div>
      </motion.div>

      {/* Children */}
      <AnimatePresence initial={false}>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            {node.children.map((child) => (
              <TreeItem
                key={child.id}
                node={child}
                selectedIds={selectedIds}
                expandedIds={expandedIds}
                onToggleExpand={onToggleExpand}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Layer Panel
 * ────────────────────────────────────────────── */

export function LayerPanel() {
  const tree = useAppSelector(selectWidgetTree);
  const selectedIds = useAppSelector((state) => state.canvas.selection.selectedIds);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleExpandAll = useCallback(() => {
    const allIds = new Set<string>();
    const collectIds = (nodes: readonly WidgetTreeNode[]) => {
      for (const node of nodes) {
        allIds.add(node.id);
        collectIds(node.children);
      }
    };
    collectIds(tree);
    setExpandedIds(allIds);
  }, [tree]);

  const handleCollapseAll = useCallback(() => {
    setExpandedIds(new Set());
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-builder-border/30">
        <span className="text-xs font-semibold text-builder-text-muted uppercase tracking-wider">
          Layers
        </span>
        <div className="flex items-center gap-1">
          <button
            className="w-5 h-5 flex items-center justify-center rounded text-builder-text-dim hover:text-builder-text"
            onClick={handleExpandAll}
            title="Expand All"
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 15l5 5 5-5M7 9l5-5 5 5" />
            </svg>
          </button>
          <button
            className="w-5 h-5 flex items-center justify-center rounded text-builder-text-dim hover:text-builder-text"
            onClick={handleCollapseAll}
            title="Collapse All"
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 20l5-5 5 5M7 4l5 5 5-5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Tree View */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-builder-border/30 py-1">
        {tree.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <p className="text-xs text-builder-text-dim">No widgets on this page</p>
            <p className="text-[10px] text-builder-text-dim mt-1">
              Drag widgets from the component panel
            </p>
          </div>
        ) : (
          tree.map((node) => (
            <TreeItem
              key={node.id}
              node={node}
              selectedIds={selectedIds}
              expandedIds={expandedIds}
              onToggleExpand={handleToggleExpand}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-builder-border/30 text-[10px] text-builder-text-dim">
        {Object.keys(useAppSelector((state) => state.canvas.widgets)).length} widgets
      </div>
    </div>
  );
}
