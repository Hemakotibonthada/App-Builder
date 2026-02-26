// @ts-nocheck — Immer draft types conflict with readonly interfaces; runtime is correct
/**
 * History Slice
 * 
 * Manages undo/redo history for the builder.
 * Tracks mutations as patches that can be applied/reverted.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { HistoryEntry, HistoryState, MutationType, StatePatch } from '@/types/engine.types';
import { generateId } from '@/utils';

const MAX_HISTORY_SIZE = 200;

const initialState: HistoryState = {
  entries: [],
  currentIndex: -1,
  maxSize: MAX_HISTORY_SIZE,
  canUndo: false,
  canRedo: false,
  isSaved: true,
  lastSavedIndex: -1,
};

/**
 * Computes undo/redo availability.
 */
function computeFlags(state: HistoryState): HistoryState {
  return {
    ...state,
    canUndo: state.currentIndex >= 0,
    canRedo: state.currentIndex < state.entries.length - 1,
    isSaved: state.currentIndex === state.lastSavedIndex,
  };
}

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    /**
     * Records a new mutation in the history stack.
     * Discards any redo entries ahead of the current index.
     */
    recordMutation(
      state,
      action: PayloadAction<{
        type: MutationType;
        label: string;
        patches: readonly StatePatch[];
        inversePatch: readonly StatePatch[];
      }>,
    ) {
      const { type, label, patches, inversePatch } = action.payload;

      const entry: HistoryEntry = {
        id: generateId('hist'),
        type,
        label,
        timestamp: Date.now(),
        patches,
        inversePatch,
      };

      // Discard entries after current index (invalidate redo stack)
      const newEntries = state.entries.slice(0, state.currentIndex + 1);
      newEntries.push(entry);

      // Trim to max size
      if (newEntries.length > state.maxSize) {
        const trimCount = newEntries.length - state.maxSize;
        newEntries.splice(0, trimCount);
        // Adjust lastSavedIndex
        state.lastSavedIndex = Math.max(-1, state.lastSavedIndex - trimCount);
      }

      state.entries = newEntries;
      state.currentIndex = newEntries.length - 1;

      return computeFlags(state);
    },

    /**
     * Undoes the most recent mutation.
     * Returns the inverse patches to apply.
     */
    undo(state) {
      if (state.currentIndex < 0) return;
      state.currentIndex -= 1;
      return computeFlags(state);
    },

    /**
     * Redoes the most recently undone mutation.
     * Returns the forward patches to apply.
     */
    redo(state) {
      if (state.currentIndex >= state.entries.length - 1) return;
      state.currentIndex += 1;
      return computeFlags(state);
    },

    /**
     * Marks the current state as "saved."
     */
    markSaved(state) {
      state.lastSavedIndex = state.currentIndex;
      state.isSaved = true;
    },

    /**
     * Clears the entire history.
     */
    clearHistory(state) {
      state.entries = [];
      state.currentIndex = -1;
      state.lastSavedIndex = -1;
      return computeFlags(state);
    },

    /**
     * Sets the maximum number of history entries.
     */
    setMaxHistorySize(state, action: PayloadAction<number>) {
      state.maxSize = Math.max(10, action.payload);
      // Trim if needed
      if (state.entries.length > state.maxSize) {
        const trimCount = state.entries.length - state.maxSize;
        state.entries = state.entries.slice(trimCount);
        state.currentIndex = Math.max(-1, state.currentIndex - trimCount);
        state.lastSavedIndex = Math.max(-1, state.lastSavedIndex - trimCount);
      }
      return computeFlags(state);
    },

    /**
     * Batches multiple mutations into a single undo step.
     */
    batchMutations(
      state,
      action: PayloadAction<{
        label: string;
        mutations: readonly {
          type: MutationType;
          patches: readonly StatePatch[];
          inversePatch: readonly StatePatch[];
        }[];
      }>,
    ) {
      const { label, mutations } = action.payload;

      const allPatches: StatePatch[] = [];
      const allInverse: StatePatch[] = [];

      for (const m of mutations) {
        allPatches.push(...m.patches);
        allInverse.push(...m.inversePatch);
      }

      // Reverse the inverse patches so undo applies them in correct order
      allInverse.reverse();

      const entry: HistoryEntry = {
        id: generateId('hist'),
        type: MutationType.BatchMutation,
        label,
        timestamp: Date.now(),
        patches: allPatches,
        inversePatch: allInverse,
      };

      const newEntries = state.entries.slice(0, state.currentIndex + 1);
      newEntries.push(entry);

      if (newEntries.length > state.maxSize) {
        const trimCount = newEntries.length - state.maxSize;
        newEntries.splice(0, trimCount);
        state.lastSavedIndex = Math.max(-1, state.lastSavedIndex - trimCount);
      }

      state.entries = newEntries;
      state.currentIndex = newEntries.length - 1;
      return computeFlags(state);
    },
  },
});

export const {
  recordMutation,
  undo,
  redo,
  markSaved,
  clearHistory,
  setMaxHistorySize,
  batchMutations,
} = historySlice.actions;

export default historySlice.reducer;

/* ──────────────────────────────────────────────
 * Selectors
 * ────────────────────────────────────────────── */

export const selectCanUndo = (state: { history: HistoryState }) =>
  state.history.canUndo;

export const selectCanRedo = (state: { history: HistoryState }) =>
  state.history.canRedo;

export const selectIsSaved = (state: { history: HistoryState }) =>
  state.history.isSaved;

export const selectCurrentEntry = (state: { history: HistoryState }) =>
  state.history.currentIndex >= 0
    ? state.history.entries[state.history.currentIndex]
    : null;

export const selectUndoLabel = (state: { history: HistoryState }) =>
  state.history.currentIndex >= 0
    ? state.history.entries[state.history.currentIndex]?.label ?? null
    : null;

export const selectRedoLabel = (state: { history: HistoryState }) =>
  state.history.currentIndex < state.history.entries.length - 1
    ? state.history.entries[state.history.currentIndex + 1]?.label ?? null
    : null;

export const selectHistoryCount = (state: { history: HistoryState }) =>
  state.history.entries.length;
