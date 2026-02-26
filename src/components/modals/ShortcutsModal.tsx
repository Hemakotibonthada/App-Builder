/**
 * Keyboard Shortcuts Modal
 * 
 * Overlay showing all available keyboard shortcuts
 * grouped by category, with search.
 */

'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { useAppSelector, useAppDispatch } from '@/store/store';
import { closeModal } from '@/store/uiSlice';
import {
  DEFAULT_SHORTCUTS,
  getShortcutsByGroup,
  formatShortcutKeys,
  GROUP_LABELS,
  type ShortcutGroup,
} from '@/services/KeyboardShortcuts';

export function ShortcutsModal() {
  const isOpen = useAppSelector(s => s.ui.activeModal === 'shortcuts');
  const dispatch = useAppDispatch();
  const [search, setSearch] = useState('');

  const groups = useMemo(() => getShortcutsByGroup(), []);

  const filtered = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    return DEFAULT_SHORTCUTS.filter(
      s => s.label.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.keys.includes(q),
    );
  }, [search]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => dispatch(closeModal())} />
        <motion.div
          className="relative w-full max-w-2xl max-h-[80vh] bg-builder-surface border border-builder-border/40 rounded-2xl shadow-glass-lg overflow-hidden flex flex-col"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-builder-border/30">
            <h2 className="text-lg font-bold text-builder-text">Keyboard Shortcuts</h2>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-builder-text-muted hover:text-builder-text hover:bg-glass-white-10" onClick={() => dispatch(closeModal())}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Search */}
          <div className="px-6 py-3 border-b border-builder-border/20">
            <input
              type="text"
              placeholder="Search shortcuts..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-9 px-3 text-sm bg-builder-bg/60 border border-builder-border/40 rounded-lg text-builder-text placeholder:text-builder-text-dim focus:outline-none focus:border-builder-accent/50"
              autoFocus
            />
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-builder-border/30 px-6 py-4">
            {filtered ? (
              // Search results
              <div className="flex flex-col gap-1">
                <div className="text-[10px] text-builder-text-dim mb-2">{filtered.length} matching shortcuts</div>
                {filtered.map(s => (
                  <ShortcutRow key={s.id} label={s.label} description={s.description} keys={s.keys} />
                ))}
              </div>
            ) : (
              // Grouped
              Array.from(groups.entries()).map(([group, shortcuts]) => (
                <div key={group} className="mb-6 last:mb-0">
                  <h3 className="text-xs font-bold text-builder-text uppercase tracking-wider mb-2">{GROUP_LABELS[group]}</h3>
                  <div className="flex flex-col gap-0.5">
                    {shortcuts.map(s => (
                      <ShortcutRow key={s.id} label={s.label} description={s.description} keys={s.keys} />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-builder-border/30 text-[10px] text-builder-text-dim">
            {DEFAULT_SHORTCUTS.length} shortcuts available · Press <kbd className="px-1 py-0.5 rounded bg-builder-elevated text-builder-text-muted font-mono text-[9px]">Ctrl + /</kbd> to toggle
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function ShortcutRow({ label, description, keys }: { label: string; description: string; keys: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-glass-white-10/50 transition-colors">
      <div>
        <span className="text-xs text-builder-text">{label}</span>
        <span className="text-[10px] text-builder-text-dim ml-2">{description}</span>
      </div>
      <kbd className="text-[10px] px-2 py-0.5 rounded bg-builder-elevated border border-builder-border/30 text-builder-text-muted font-mono whitespace-nowrap">
        {formatShortcutKeys(keys)}
      </kbd>
    </div>
  );
}
