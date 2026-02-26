// =============================================================================
// TreeView Component - Hierarchical tree with expand/collapse, drag-drop,
// checkboxes, icons, search filtering, virtual scrolling, and keyboard nav
// =============================================================================

'use client';

import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';

// =============================================================================
// Types
// =============================================================================

export interface TreeNode {
  id: string;
  label: string;
  icon?: string;
  iconColor?: string;
  children?: TreeNode[];
  data?: Record<string, unknown>;
  disabled?: boolean;
  selectable?: boolean;
  draggable?: boolean;
  droppable?: boolean;
  badge?: string | number;
  badgeColor?: string;
  tooltip?: string;
  className?: string;
}

export interface TreeViewProps {
  nodes: TreeNode[];
  onSelect?: (node: TreeNode) => void;
  onExpand?: (nodeId: string, expanded: boolean) => void;
  onCheck?: (nodeId: string, checked: boolean) => void;
  onDrop?: (sourceId: string, targetId: string, position: DropPosition) => void;
  onContextMenu?: (node: TreeNode, event: React.MouseEvent) => void;
  onRename?: (nodeId: string, newLabel: string) => void;
  selectedId?: string;
  expandedIds?: Set<string>;
  checkedIds?: Set<string>;
  checkable?: boolean;
  draggable?: boolean;
  editable?: boolean;
  searchable?: boolean;
  multiSelect?: boolean;
  showLines?: boolean;
  showIcons?: boolean;
  indent?: number;
  maxHeight?: number;
  emptyMessage?: string;
  className?: string;
}

export type DropPosition = 'before' | 'after' | 'inside';

export interface TreeState {
  selectedIds: Set<string>;
  expandedIds: Set<string>;
  checkedIds: Set<string>;
  editingId: string | null;
  focusedId: string | null;
  searchQuery: string;
  dragSourceId: string | null;
  dragTargetId: string | null;
  dropPosition: DropPosition | null;
}

// =============================================================================
// Tree Utilities
// =============================================================================

export function flattenTree(nodes: TreeNode[], expandedIds: Set<string>, parentPath: string = ''): {
  node: TreeNode;
  depth: number;
  path: string;
  hasChildren: boolean;
  isExpanded: boolean;
  isLastChild: boolean;
}[] {
  const result: {
    node: TreeNode;
    depth: number;
    path: string;
    hasChildren: boolean;
    isExpanded: boolean;
    isLastChild: boolean;
  }[] = [];

  const traverse = (nodes: TreeNode[], depth: number, parentPath: string) => {
    nodes.forEach((node, index) => {
      const path = parentPath ? `${parentPath}/${node.id}` : node.id;
      const hasChildren = (node.children?.length ?? 0) > 0;
      const isExpanded = expandedIds.has(node.id);
      const isLastChild = index === nodes.length - 1;

      result.push({ node, depth, path, hasChildren, isExpanded, isLastChild });

      if (hasChildren && isExpanded) {
        traverse(node.children!, depth + 1, path);
      }
    });
  };

  traverse(nodes, 0, parentPath);
  return result;
}

export function findNodeById(nodes: TreeNode[], id: string): TreeNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

export function findNodePath(nodes: TreeNode[], id: string, path: string[] = []): string[] | null {
  for (const node of nodes) {
    const currentPath = [...path, node.id];
    if (node.id === id) return currentPath;
    if (node.children) {
      const found = findNodePath(node.children, id, currentPath);
      if (found) return found;
    }
  }
  return null;
}

export function getNodeParent(nodes: TreeNode[], id: string): TreeNode | null {
  for (const node of nodes) {
    if (node.children) {
      if (node.children.some(child => child.id === id)) return node;
      const found = getNodeParent(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

export function getAllDescendantIds(node: TreeNode): string[] {
  const ids: string[] = [];
  const traverse = (n: TreeNode) => {
    ids.push(n.id);
    n.children?.forEach(traverse);
  };
  traverse(node);
  return ids;
}

export function getAllNodeIds(nodes: TreeNode[]): string[] {
  const ids: string[] = [];
  const traverse = (ns: TreeNode[]) => {
    ns.forEach(n => {
      ids.push(n.id);
      if (n.children) traverse(n.children);
    });
  };
  traverse(nodes);
  return ids;
}

export function filterTree(nodes: TreeNode[], query: string): TreeNode[] {
  if (!query.trim()) return nodes;

  const lowerQuery = query.toLowerCase();

  return nodes.reduce<TreeNode[]>((filtered, node) => {
    const matchesLabel = node.label.toLowerCase().includes(lowerQuery);
    const filteredChildren = node.children ? filterTree(node.children, query) : [];

    if (matchesLabel || filteredChildren.length > 0) {
      filtered.push({
        ...node,
        children: filteredChildren.length > 0 ? filteredChildren : node.children,
      });
    }

    return filtered;
  }, []);
}

export function moveNode(
  nodes: TreeNode[],
  sourceId: string,
  targetId: string,
  position: DropPosition
): TreeNode[] {
  // Find and remove source node
  let sourceNode: TreeNode | null = null;

  const removeNode = (ns: TreeNode[]): TreeNode[] => {
    return ns.reduce<TreeNode[]>((acc, n) => {
      if (n.id === sourceId) {
        sourceNode = { ...n };
        return acc;
      }
      const newNode = { ...n };
      if (n.children) {
        newNode.children = removeNode(n.children);
      }
      acc.push(newNode);
      return acc;
    }, []);
  };

  const newNodes = removeNode(JSON.parse(JSON.stringify(nodes)));
  if (!sourceNode) return nodes;

  // Insert at target position
  const insertNode = (ns: TreeNode[]): TreeNode[] => {
    const result: TreeNode[] = [];

    for (const n of ns) {
      if (n.id === targetId) {
        switch (position) {
          case 'before':
            result.push(sourceNode!);
            result.push(n);
            break;
          case 'after':
            result.push(n);
            result.push(sourceNode!);
            break;
          case 'inside':
            result.push({
              ...n,
              children: [...(n.children ?? []), sourceNode!],
            });
            break;
        }
      } else {
        const newNode = { ...n };
        if (n.children) {
          newNode.children = insertNode(n.children);
        }
        result.push(newNode);
      }
    }

    return result;
  };

  return insertNode(newNodes);
}

export function sortTree(
  nodes: TreeNode[],
  compareFn: (a: TreeNode, b: TreeNode) => number,
  recursive: boolean = true
): TreeNode[] {
  const sorted = [...nodes].sort(compareFn);

  if (recursive) {
    return sorted.map(node => ({
      ...node,
      children: node.children ? sortTree(node.children, compareFn, true) : undefined,
    }));
  }

  return sorted;
}

export function countNodes(nodes: TreeNode[]): number {
  let count = 0;
  const traverse = (ns: TreeNode[]) => {
    count += ns.length;
    ns.forEach(n => { if (n.children) traverse(n.children); });
  };
  traverse(nodes);
  return count;
}

export function getMaxDepth(nodes: TreeNode[], currentDepth: number = 0): number {
  let maxDepth = currentDepth;
  for (const node of nodes) {
    if (node.children && node.children.length > 0) {
      const childDepth = getMaxDepth(node.children, currentDepth + 1);
      maxDepth = Math.max(maxDepth, childDepth);
    }
  }
  return maxDepth;
}

// =============================================================================
// Tree Node Component
// =============================================================================

interface TreeNodeComponentProps {
  node: TreeNode;
  depth: number;
  isExpanded: boolean;
  isSelected: boolean;
  isChecked: boolean;
  isIndeterminate: boolean;
  isFocused: boolean;
  isEditing: boolean;
  isDragTarget: boolean;
  dropPosition: DropPosition | null;
  hasChildren: boolean;
  showLines: boolean;
  showIcons: boolean;
  checkable: boolean;
  draggable: boolean;
  indent: number;
  onToggle: () => void;
  onSelect: () => void;
  onCheck: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onEditSubmit: (newLabel: string) => void;
  onEditCancel: () => void;
  onDragStart: () => void;
  onDragOver: (position: DropPosition) => void;
  onDragEnd: () => void;
}

const TreeNodeComponent: React.FC<TreeNodeComponentProps> = ({
  node,
  depth,
  isExpanded,
  isSelected,
  isChecked,
  isIndeterminate,
  isFocused,
  isEditing,
  isDragTarget,
  dropPosition,
  hasChildren,
  showLines,
  showIcons,
  checkable,
  draggable: isDraggable,
  indent,
  onToggle,
  onSelect,
  onCheck,
  onContextMenu,
  onEditSubmit,
  onEditCancel,
  onDragStart,
  onDragOver,
  onDragEnd,
}) => {
  const [editValue, setEditValue] = useState(node.label);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onEditSubmit(editValue);
    } else if (e.key === 'Escape') {
      setEditValue(node.label);
      onEditCancel();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;

    let position: DropPosition;
    if (y < height * 0.25) {
      position = 'before';
    } else if (y > height * 0.75) {
      position = 'after';
    } else {
      position = 'inside';
    }

    onDragOver(position);
  };

  const paddingLeft = depth * indent;

  const classNames = [
    'tree-node',
    isSelected && 'tree-node--selected',
    isFocused && 'tree-node--focused',
    isDragTarget && 'tree-node--drag-target',
    isDragTarget && dropPosition && `tree-node--drop-${dropPosition}`,
    node.disabled && 'tree-node--disabled',
    node.className,
  ].filter(Boolean).join(' ');

  return React.createElement('div', {
    className: classNames,
    style: { paddingLeft },
    onClick: onSelect,
    onContextMenu: onContextMenu,
    draggable: isDraggable && !isEditing,
    onDragStart: (e: React.DragEvent) => {
      e.dataTransfer.effectAllowed = 'move';
      onDragStart();
    },
    onDragOver: handleDragOver,
    onDragLeave: onDragEnd,
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      onDragEnd();
    },
    role: 'treeitem',
    'aria-expanded': hasChildren ? isExpanded : undefined,
    'aria-selected': isSelected,
    'aria-level': depth + 1,
    tabIndex: isFocused ? 0 : -1,
  },
    // Tree line connector
    showLines && depth > 0 && React.createElement('div', {
      className: 'tree-node__line',
      style: { left: (depth - 1) * indent + indent / 2 },
    }),

    // Expand toggle
    React.createElement('button', {
      className: `tree-node__toggle ${hasChildren ? '' : 'tree-node__toggle--hidden'}`,
      onClick: (e: React.MouseEvent) => { e.stopPropagation(); onToggle(); },
      tabIndex: -1,
    },
      hasChildren && React.createElement('span', {
        className: `tree-node__arrow ${isExpanded ? 'tree-node__arrow--expanded' : ''}`,
      }, '\u25B6'),
    ),

    // Checkbox
    checkable && React.createElement('label', {
      className: 'tree-node__checkbox-wrapper',
      onClick: (e: React.MouseEvent) => e.stopPropagation(),
    },
      React.createElement('input', {
        type: 'checkbox',
        className: 'tree-node__checkbox',
        checked: isChecked,
        ref: (el: HTMLInputElement | null) => { if (el) el.indeterminate = isIndeterminate; },
        onChange: onCheck,
        tabIndex: -1,
      }),
      React.createElement('span', { className: 'tree-node__checkmark' }),
    ),

    // Icon
    showIcons && node.icon && React.createElement('span', {
      className: 'tree-node__icon',
      style: node.iconColor ? { color: node.iconColor } : undefined,
    }, node.icon),

    // Label
    isEditing
      ? React.createElement('input', {
        ref: editInputRef,
        className: 'tree-node__edit-input',
        value: editValue,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => setEditValue(e.target.value),
        onKeyDown: handleEditKeyDown,
        onBlur: () => { onEditSubmit(editValue); },
        onClick: (e: React.MouseEvent) => e.stopPropagation(),
      })
      : React.createElement('span', {
        className: 'tree-node__label',
        title: node.tooltip,
      }, node.label),

    // Badge
    node.badge !== undefined && React.createElement('span', {
      className: 'tree-node__badge',
      style: node.badgeColor ? { backgroundColor: node.badgeColor } : undefined,
    }, node.badge),
  );
};

// =============================================================================
// TreeView Component
// =============================================================================

export const TreeView: React.FC<TreeViewProps> = ({
  nodes,
  onSelect,
  onExpand,
  onCheck,
  onDrop,
  onContextMenu,
  onRename,
  selectedId,
  expandedIds: controlledExpandedIds,
  checkedIds: controlledCheckedIds,
  checkable = false,
  draggable = false,
  editable = false,
  searchable = false,
  showLines = true,
  showIcons = true,
  indent = 24,
  maxHeight,
  emptyMessage = 'No items',
  className = '',
}) => {
  const [state, setState] = useState<TreeState>({
    selectedIds: new Set(selectedId ? [selectedId] : []),
    expandedIds: controlledExpandedIds ?? new Set<string>(),
    checkedIds: controlledCheckedIds ?? new Set<string>(),
    editingId: null,
    focusedId: null,
    searchQuery: '',
    dragSourceId: null,
    dragTargetId: null,
    dropPosition: null,
  });

  const containerRef = useRef<HTMLDivElement>(null);

  // Filter nodes based on search
  const filteredNodes = useMemo(
    () => searchable && state.searchQuery ? filterTree(nodes, state.searchQuery) : nodes,
    [nodes, state.searchQuery, searchable]
  );

  // Flatten visible nodes
  const flatNodes = useMemo(
    () => flattenTree(filteredNodes, state.expandedIds),
    [filteredNodes, state.expandedIds]
  );

  const handleToggle = useCallback((nodeId: string) => {
    setState(prev => {
      const newExpanded = new Set(prev.expandedIds);
      const isExpanded = newExpanded.has(nodeId);

      if (isExpanded) {
        newExpanded.delete(nodeId);
      } else {
        newExpanded.add(nodeId);
      }

      onExpand?.(nodeId, !isExpanded);
      return { ...prev, expandedIds: newExpanded };
    });
  }, [onExpand]);

  const handleSelect = useCallback((node: TreeNode) => {
    if (node.disabled || node.selectable === false) return;

    setState(prev => ({
      ...prev,
      selectedIds: new Set([node.id]),
      focusedId: node.id,
    }));
    onSelect?.(node);
  }, [onSelect]);

  const handleCheck = useCallback((nodeId: string) => {
    setState(prev => {
      const newChecked = new Set(prev.checkedIds);
      const node = findNodeById(nodes, nodeId);
      if (!node) return prev;

      const isChecked = newChecked.has(nodeId);

      if (isChecked) {
        // Uncheck node and all descendants
        getAllDescendantIds(node).forEach(id => newChecked.delete(id));
      } else {
        // Check node and all descendants
        getAllDescendantIds(node).forEach(id => newChecked.add(id));
      }

      onCheck?.(nodeId, !isChecked);
      return { ...prev, checkedIds: newChecked };
    });
  }, [nodes, onCheck]);

  const handleContextMenu = useCallback((node: TreeNode, event: React.MouseEvent) => {
    event.preventDefault();
    onContextMenu?.(node, event);
  }, [onContextMenu]);

  const handleEditSubmit = useCallback((nodeId: string, newLabel: string) => {
    setState(prev => ({ ...prev, editingId: null }));
    if (newLabel.trim()) {
      onRename?.(nodeId, newLabel.trim());
    }
  }, [onRename]);

  const handleDragStart = useCallback((nodeId: string) => {
    setState(prev => ({ ...prev, dragSourceId: nodeId }));
  }, []);

  const handleDragOver = useCallback((nodeId: string, position: DropPosition) => {
    setState(prev => ({
      ...prev,
      dragTargetId: nodeId,
      dropPosition: position,
    }));
  }, []);

  const handleDragEnd = useCallback(() => {
    setState(prev => {
      if (prev.dragSourceId && prev.dragTargetId && prev.dropPosition) {
        onDrop?.(prev.dragSourceId, prev.dragTargetId, prev.dropPosition);
      }
      return { ...prev, dragSourceId: null, dragTargetId: null, dropPosition: null };
    });
  }, [onDrop]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!state.focusedId) return;

    const currentIndex = flatNodes.findIndex(fn => fn.node.id === state.focusedId);
    if (currentIndex === -1) return;

    const current = flatNodes[currentIndex];
    if (!current) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (currentIndex < flatNodes.length - 1) {
          const nextItem = flatNodes[currentIndex + 1];
          if (nextItem) setState(prev => ({ ...prev, focusedId: nextItem.node.id }));
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (currentIndex > 0) {
          const prevItem = flatNodes[currentIndex - 1];
          if (prevItem) setState(prev => ({ ...prev, focusedId: prevItem.node.id }));
        }
        break;

      case 'ArrowRight':
        e.preventDefault();
        if (current.hasChildren && !current.isExpanded) {
          handleToggle(current.node.id);
        } else if (current.hasChildren && current.isExpanded && currentIndex < flatNodes.length - 1) {
          const nextItem = flatNodes[currentIndex + 1];
          if (nextItem) setState(prev => ({ ...prev, focusedId: nextItem.node.id }));
        }
        break;

      case 'ArrowLeft':
        e.preventDefault();
        if (current.hasChildren && current.isExpanded) {
          handleToggle(current.node.id);
        } else if (current.depth > 0) {
          const parent = getNodeParent(nodes, current.node.id);
          if (parent) {
            setState(prev => ({ ...prev, focusedId: parent.id }));
          }
        }
        break;

      case 'Enter':
        e.preventDefault();
        handleSelect(current.node);
        break;

      case ' ':
        e.preventDefault();
        if (checkable) handleCheck(current.node.id);
        break;

      case 'F2':
        e.preventDefault();
        if (editable) {
          setState(prev => ({ ...prev, editingId: current.node.id }));
        }
        break;

      case '*':
        e.preventDefault();
        // Expand all siblings
        const parent = getNodeParent(nodes, current.node.id);
        const siblings = parent?.children ?? nodes;
        setState(prev => {
          const newExpanded = new Set(prev.expandedIds);
          siblings.forEach(s => { if (s.children?.length) newExpanded.add(s.id); });
          return { ...prev, expandedIds: newExpanded };
        });
        break;

      case 'Home':
        e.preventDefault();
        {
          const first = flatNodes[0];
          if (first) setState(prev => ({ ...prev, focusedId: first.node.id }));
        }
        break;

      case 'End':
        e.preventDefault();
        {
          const last = flatNodes[flatNodes.length - 1];
          if (last) setState(prev => ({ ...prev, focusedId: last.node.id }));
        }
        break;
    }
  }, [state.focusedId, flatNodes, nodes, handleToggle, handleSelect, handleCheck, checkable, editable]);

  // Expand all / collapse all
  const expandAll = useCallback(() => {
    setState(prev => ({
      ...prev,
      expandedIds: new Set(getAllNodeIds(nodes).filter(id => {
        const node = findNodeById(nodes, id);
        return node?.children && node.children.length > 0;
      })),
    }));
  }, [nodes]);

  const collapseAll = useCallback(() => {
    setState(prev => ({ ...prev, expandedIds: new Set() }));
  }, []);

  // Check if a node is indeterminate
  const isNodeIndeterminate = useCallback((node: TreeNode): boolean => {
    if (!node.children || node.children.length === 0) return false;
    const descendantIds = getAllDescendantIds(node).slice(1);
    const checkedCount = descendantIds.filter(id => state.checkedIds.has(id)).length;
    return checkedCount > 0 && checkedCount < descendantIds.length;
  }, [state.checkedIds]);

  return React.createElement('div', {
    ref: containerRef,
    className: `tree-view ${className}`,
    role: 'tree',
    onKeyDown: handleKeyDown,
    style: maxHeight ? { maxHeight, overflowY: 'auto' } : undefined,
  },
    // Search bar
    searchable && React.createElement('div', { className: 'tree-view__search' },
      React.createElement('input', {
        className: 'tree-view__search-input',
        placeholder: 'Search...',
        value: state.searchQuery,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
          setState(prev => ({ ...prev, searchQuery: e.target.value })),
      }),
    ),

    // Toolbar
    React.createElement('div', { className: 'tree-view__toolbar' },
      React.createElement('button', {
        className: 'tree-view__toolbar-btn',
        onClick: expandAll,
        title: 'Expand All',
      }, '+'),
      React.createElement('button', {
        className: 'tree-view__toolbar-btn',
        onClick: collapseAll,
        title: 'Collapse All',
      }, '−'),
    ),

    // Nodes
    flatNodes.length > 0
      ? flatNodes.map(({ node, depth, hasChildren, isExpanded }) =>
        React.createElement(TreeNodeComponent, {
          key: node.id,
          node,
          depth,
          isExpanded,
          isSelected: state.selectedIds.has(node.id),
          isChecked: state.checkedIds.has(node.id),
          isIndeterminate: isNodeIndeterminate(node),
          isFocused: state.focusedId === node.id,
          isEditing: state.editingId === node.id,
          isDragTarget: state.dragTargetId === node.id,
          dropPosition: state.dragTargetId === node.id ? state.dropPosition : null,
          hasChildren,
          showLines,
          showIcons,
          checkable,
          draggable: draggable && (node.draggable !== false),
          indent,
          onToggle: () => handleToggle(node.id),
          onSelect: () => handleSelect(node),
          onCheck: () => handleCheck(node.id),
          onContextMenu: (e) => handleContextMenu(node, e),
          onEditSubmit: (label) => handleEditSubmit(node.id, label),
          onEditCancel: () => setState(prev => ({ ...prev, editingId: null })),
          onDragStart: () => handleDragStart(node.id),
          onDragOver: (pos) => handleDragOver(node.id, pos),
          onDragEnd: handleDragEnd,
        })
      )
      : React.createElement('div', { className: 'tree-view__empty' }, emptyMessage),
  );
};

// =============================================================================
// TreeView CSS Generation
// =============================================================================

export function generateTreeViewCSS(theme: 'light' | 'dark' = 'dark'): string {
  const isDark = theme === 'dark';

  return `.tree-view {
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 13px;
  position: relative;
  user-select: none;
}

.tree-view__search {
  padding: 8px;
  border-bottom: 1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'};
}

.tree-view__search-input {
  width: 100%;
  padding: 6px 10px;
  background: ${isDark ? '#2a2a3e' : '#f3f4f6'};
  border: 1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'};
  border-radius: 6px;
  color: ${isDark ? '#e5e7eb' : '#1f2937'};
  font-size: 12px;
  outline: none;
}

.tree-view__search-input:focus {
  border-color: #6366f1;
}

.tree-view__toolbar {
  display: flex;
  gap: 4px;
  padding: 4px 8px;
  border-bottom: 1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'};
}

.tree-view__toolbar-btn {
  padding: 2px 8px;
  background: none;
  border: none;
  color: ${isDark ? '#6b7280' : '#9ca3af'};
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
}

.tree-view__toolbar-btn:hover {
  background: ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'};
  color: ${isDark ? '#d1d5db' : '#374151'};
}

.tree-view__empty {
  padding: 24px;
  text-align: center;
  color: ${isDark ? '#6b7280' : '#9ca3af'};
  font-size: 12px;
}

/* Tree Node */
.tree-node {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  cursor: pointer;
  position: relative;
  min-height: 28px;
  transition: background 80ms ease;
}

.tree-node:hover {
  background: ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'};
}

.tree-node--selected {
  background: ${isDark ? 'rgba(99, 102, 241, 0.12)' : 'rgba(99, 102, 241, 0.08)'} !important;
}

.tree-node--focused {
  box-shadow: inset 0 0 0 1px ${isDark ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)'};
  border-radius: 4px;
}

.tree-node--disabled {
  opacity: 0.5;
  pointer-events: none;
}

.tree-node--drag-target.tree-node--drop-before {
  box-shadow: inset 0 2px 0 #6366f1;
}

.tree-node--drag-target.tree-node--drop-after {
  box-shadow: inset 0 -2px 0 #6366f1;
}

.tree-node--drag-target.tree-node--drop-inside {
  background: ${isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.1)'};
  border-radius: 4px;
}

/* Tree line */
.tree-node__line {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background: ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'};
}

/* Toggle arrow */
.tree-node__toggle {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  color: ${isDark ? '#6b7280' : '#9ca3af'};
  padding: 0;
  flex-shrink: 0;
  border-radius: 4px;
}

.tree-node__toggle:hover {
  background: ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'};
  color: ${isDark ? '#d1d5db' : '#374151'};
}

.tree-node__toggle--hidden {
  visibility: hidden;
}

.tree-node__arrow {
  font-size: 8px;
  transition: transform 150ms ease;
  display: inline-block;
}

.tree-node__arrow--expanded {
  transform: rotate(90deg);
}

/* Checkbox */
.tree-node__checkbox-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  cursor: pointer;
}

.tree-node__checkbox {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.tree-node__checkmark {
  width: 14px;
  height: 14px;
  border: 1.5px solid ${isDark ? '#6b7280' : '#9ca3af'};
  border-radius: 3px;
  transition: all 150ms ease;
  position: relative;
}

.tree-node__checkbox:checked + .tree-node__checkmark {
  background: #6366f1;
  border-color: #6366f1;
}

.tree-node__checkbox:checked + .tree-node__checkmark::after {
  content: '';
  position: absolute;
  left: 3.5px;
  top: 1px;
  width: 4px;
  height: 7px;
  border: solid white;
  border-width: 0 1.5px 1.5px 0;
  transform: rotate(45deg);
}

.tree-node__checkbox:indeterminate + .tree-node__checkmark {
  background: #6366f1;
  border-color: #6366f1;
}

.tree-node__checkbox:indeterminate + .tree-node__checkmark::after {
  content: '';
  position: absolute;
  left: 2px;
  top: 5px;
  width: 8px;
  height: 1.5px;
  background: white;
}

/* Icon */
.tree-node__icon {
  font-size: 14px;
  flex-shrink: 0;
  width: 18px;
  text-align: center;
}

/* Label */
.tree-node__label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${isDark ? '#e5e7eb' : '#1f2937'};
  font-size: 13px;
}

/* Edit input */
.tree-node__edit-input {
  flex: 1;
  min-width: 0;
  padding: 1px 4px;
  background: ${isDark ? '#2a2a3e' : '#ffffff'};
  border: 1px solid #6366f1;
  border-radius: 3px;
  color: ${isDark ? '#e5e7eb' : '#1f2937'};
  font-size: 13px;
  outline: none;
}

/* Badge */
.tree-node__badge {
  font-size: 10px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 10px;
  background: ${isDark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)'};
  color: #818cf8;
  flex-shrink: 0;
}

/* Scrollbar */
.tree-view::-webkit-scrollbar {
  width: 6px;
}

.tree-view::-webkit-scrollbar-track {
  background: transparent;
}

.tree-view::-webkit-scrollbar-thumb {
  background: ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'};
  border-radius: 3px;
}

.tree-view::-webkit-scrollbar-thumb:hover {
  background: ${isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)'};
}`;
}

// =============================================================================
// Sample Data Generator
// =============================================================================

export function generateSampleTree(depth: number = 3, breadth: number = 4): TreeNode[] {
  const icons = ['📁', '📄', '🎨', '⚙️', '📦', '🔧', '💾', '📊'];
  let counter = 0;

  const generate = (currentDepth: number): TreeNode[] => {
    if (currentDepth >= depth) return [];

    return Array.from({ length: breadth }, () => {
      counter++;
      const hasChildren = currentDepth < depth - 1;
      const icon = hasChildren ? '📁' : icons[counter % icons.length];

      return {
        id: `node-${counter}`,
        label: hasChildren ? `Folder ${counter}` : `File ${counter}`,
        icon,
        children: hasChildren ? generate(currentDepth + 1) : undefined,
        badge: hasChildren ? undefined : Math.random() > 0.7 ? Math.floor(Math.random() * 10) : undefined,
      };
    });
  };

  return generate(0);
}

export default TreeView;
