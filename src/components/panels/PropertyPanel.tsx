/**
 * Property Panel (Right Sidebar)
 * 
 * Displays and edits properties of the currently selected widget.
 * Dynamically renders property fields based on the widget's schema.
 */

'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { useAppDispatch, useAppSelector, selectPrimarySelectedWidget } from '@/store/store';
import { updateWidgetProps, updateWidget } from '@/store/canvasSlice';
import { getWidgetDefinition } from '@/components/widgets/WidgetRegistry';
import { PropertyFieldType, PropertyDefinition, WidgetType } from '@/types/widget.types';

/* ──────────────────────────────────────────────
 * Property Field Components
 * ────────────────────────────────────────────── */

interface FieldProps {
  definition: PropertyDefinition;
  value: unknown;
  onChange: (key: string, value: unknown) => void;
}

function TextField({ definition, value, onChange }: FieldProps) {
  return (
    <input
      type="text"
      value={(value as string) ?? definition.defaultValue ?? ''}
      onChange={(e) => onChange(definition.key, e.target.value)}
      placeholder={definition.placeholder}
      className="w-full h-8 px-2.5 text-xs bg-builder-bg/60 border border-builder-border/40 rounded-lg text-builder-text placeholder:text-builder-text-dim focus:outline-none focus:border-builder-accent/50 transition-colors"
    />
  );
}

function TextAreaField({ definition, value, onChange }: FieldProps) {
  return (
    <textarea
      value={(value as string) ?? definition.defaultValue ?? ''}
      onChange={(e) => onChange(definition.key, e.target.value)}
      placeholder={definition.placeholder}
      rows={3}
      className="w-full px-2.5 py-2 text-xs bg-builder-bg/60 border border-builder-border/40 rounded-lg text-builder-text placeholder:text-builder-text-dim focus:outline-none focus:border-builder-accent/50 transition-colors resize-none"
    />
  );
}

function NumberField({ definition, value, onChange }: FieldProps) {
  return (
    <input
      type="number"
      value={(value as number) ?? definition.defaultValue ?? 0}
      onChange={(e) => onChange(definition.key, parseFloat(e.target.value) || 0)}
      min={definition.min}
      max={definition.max}
      step={definition.step ?? 1}
      className="w-full h-8 px-2.5 text-xs bg-builder-bg/60 border border-builder-border/40 rounded-lg text-builder-text focus:outline-none focus:border-builder-accent/50 transition-colors font-mono"
    />
  );
}

function BooleanField({ definition, value, onChange }: FieldProps) {
  const checked = (value as boolean) ?? (definition.defaultValue as boolean) ?? false;

  return (
    <button
      className={clsx(
        'w-9 h-5 rounded-full transition-colors relative',
        checked ? 'bg-builder-accent' : 'bg-builder-border',
      )}
      onClick={() => onChange(definition.key, !checked)}
    >
      <motion.div
        className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm"
        animate={{ left: checked ? 18 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  );
}

function SelectField({ definition, value, onChange }: FieldProps) {
  return (
    <select
      value={(value as string) ?? (definition.defaultValue as string) ?? ''}
      onChange={(e) => onChange(definition.key, e.target.value)}
      className="w-full h-8 px-2 text-xs bg-builder-bg/60 border border-builder-border/40 rounded-lg text-builder-text focus:outline-none focus:border-builder-accent/50 transition-colors appearance-none cursor-pointer"
    >
      {definition.options?.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function ColorField({ definition, value, onChange }: FieldProps) {
  const colorValue = (value as string) ?? (definition.defaultValue as string) ?? '#000000';

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <input
          type="color"
          value={colorValue}
          onChange={(e) => onChange(definition.key, e.target.value)}
          className="w-8 h-8 rounded-lg border border-builder-border/40 cursor-pointer bg-transparent"
        />
      </div>
      <input
        type="text"
        value={colorValue}
        onChange={(e) => onChange(definition.key, e.target.value)}
        className="flex-1 h-8 px-2 text-xs bg-builder-bg/60 border border-builder-border/40 rounded-lg text-builder-text font-mono focus:outline-none focus:border-builder-accent/50 transition-colors"
      />
    </div>
  );
}

function SliderField({ definition, value, onChange }: FieldProps) {
  const numValue = (value as number) ?? (definition.defaultValue as number) ?? 0;
  const min = definition.min ?? 0;
  const max = definition.max ?? 100;

  return (
    <div className="flex items-center gap-2">
      <input
        type="range"
        value={numValue}
        onChange={(e) => onChange(definition.key, parseFloat(e.target.value))}
        min={min}
        max={max}
        step={definition.step ?? 1}
        className="flex-1 h-1.5 bg-builder-border/40 rounded-full appearance-none cursor-pointer accent-builder-accent"
      />
      <span className="w-10 text-right text-xs text-builder-text-muted font-mono">
        {numValue}
      </span>
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Field Renderer
 * ────────────────────────────────────────────── */

function PropertyField({ definition, value, onChange }: FieldProps) {
  const FieldComponent = (() => {
    switch (definition.type) {
      case PropertyFieldType.Text:
      case PropertyFieldType.Image:
      case PropertyFieldType.Icon:
        return TextField;
      case PropertyFieldType.TextArea:
      case PropertyFieldType.Code:
        return TextAreaField;
      case PropertyFieldType.Number:
      case PropertyFieldType.Dimension:
        return NumberField;
      case PropertyFieldType.Boolean:
        return BooleanField;
      case PropertyFieldType.Select:
        return SelectField;
      case PropertyFieldType.Color:
        return ColorField;
      case PropertyFieldType.Slider:
        return SliderField;
      default:
        return TextField;
    }
  })();

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[11px] text-builder-text-muted font-medium">
          {definition.label}
          {definition.required && <span className="text-builder-error ml-0.5">*</span>}
        </label>
        {definition.type === PropertyFieldType.Boolean && (
          <FieldComponent definition={definition} value={value} onChange={onChange} />
        )}
      </div>
      {definition.type !== PropertyFieldType.Boolean && (
        <FieldComponent definition={definition} value={value} onChange={onChange} />
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Property Panel
 * ────────────────────────────────────────────── */

export function PropertyPanel() {
  const dispatch = useAppDispatch();
  const selectedWidget = useAppSelector(selectPrimarySelectedWidget);

  const widgetDef = useMemo(() => {
    if (!selectedWidget) return null;
    return getWidgetDefinition(selectedWidget.type) ?? null;
  }, [selectedWidget]);

  const handlePropertyChange = useCallback(
    (key: string, value: unknown) => {
      if (!selectedWidget) return;
      dispatch(updateWidgetProps({ id: selectedWidget.id, props: { [key]: value } }));
    },
    [dispatch, selectedWidget],
  );

  const handleNameChange = useCallback(
    (name: string) => {
      if (!selectedWidget) return;
      dispatch(updateWidget({ id: selectedWidget.id, name }));
    },
    [dispatch, selectedWidget],
  );

  // Group properties by group name
  const groupedProperties = useMemo(() => {
    if (!widgetDef) return new Map<string, PropertyDefinition[]>();
    const groups = new Map<string, PropertyDefinition[]>();
    for (const prop of widgetDef.propertySchema) {
      const group = prop.group ?? 'General';
      const list = groups.get(group) ?? [];
      list.push(prop);
      groups.set(group, list);
    }
    return groups;
  }, [widgetDef]);

  if (!selectedWidget) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 px-4 text-center">
        <div className="w-12 h-12 rounded-xl bg-builder-elevated/60 flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-builder-text-dim" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
        </div>
        <p className="text-sm text-builder-text-muted font-medium">No widget selected</p>
        <p className="text-xs text-builder-text-dim mt-1">Click a widget on the canvas to view its properties</p>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={selectedWidget.id}
        className="flex flex-col h-full"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.15 }}
      >
        {/* Widget Header */}
        <div className="px-3 py-3 border-b border-builder-border/30">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded bg-builder-accent/20 flex items-center justify-center">
              <span className="text-builder-accent text-[10px] font-bold">
                {selectedWidget.type.charAt(0).toUpperCase()}
              </span>
            </div>
            <input
              type="text"
              value={selectedWidget.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="flex-1 text-sm font-semibold bg-transparent text-builder-text border-none outline-none focus:ring-0"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-builder-elevated text-builder-text-dim font-mono">
              {selectedWidget.type}
            </span>
            <span className="text-[10px] text-builder-text-dim">
              ID: {selectedWidget.id.slice(0, 12)}...
            </span>
          </div>
        </div>

        {/* Properties */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-builder-border/30">
          {Array.from(groupedProperties.entries()).map(([group, props]) => (
            <div key={group} className="border-b border-builder-border/20">
              <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-builder-text-dim">
                {group}
              </div>
              <div className="px-3 pb-3 flex flex-col gap-3">
                {props.map((prop) => (
                  <PropertyField
                    key={prop.key}
                    definition={prop}
                    value={selectedWidget.props[prop.key]}
                    onChange={handlePropertyChange}
                  />
                ))}
              </div>
            </div>
          ))}

          {groupedProperties.size === 0 && (
            <div className="p-3 text-xs text-builder-text-dim text-center">
              No configurable properties
            </div>
          )}

          {/* Link to Page Section */}
          <LinkToPageSection
            widget={selectedWidget}
            onPropertyChange={handlePropertyChange}
          />

          {/* Events / Actions Section */}
          <EventActionsSection
            widget={selectedWidget}
            onPropertyChange={handlePropertyChange}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ──────────────────────────────────────────────
 * Link to Page Section
 * 
 * Shows for: link, button, icon-button, nav items, FAB
 * Lets user pick a page from available pages
 * or enter a custom URL / external link.
 * ────────────────────────────────────────────── */

const LINKABLE_TYPES = new Set([
  WidgetType.Link,
  WidgetType.Button,
  WidgetType.IconButton,
  WidgetType.FloatingActionButton,
  WidgetType.Navbar,
  WidgetType.Breadcrumb,
  WidgetType.BottomNav,
]);

const LINK_ACTIONS = [
  { id: 'navigate', label: 'Navigate to Page', icon: '📄' },
  { id: 'url', label: 'Open External URL', icon: '🌐' },
  { id: 'scroll', label: 'Scroll to Section', icon: '⬇️' },
  { id: 'modal', label: 'Open Modal/Dialog', icon: '💬' },
  { id: 'none', label: 'No Action', icon: '⛔' },
] as const;

interface LinkSectionProps {
  widget: {
    id: string;
    type: string;
    props: Record<string, unknown>;
  };
  onPropertyChange: (key: string, value: unknown) => void;
}

function LinkToPageSection({ widget, onPropertyChange }: LinkSectionProps) {
  const pages = useAppSelector((state) => state.canvas.pages);
  const [showPagePicker, setShowPagePicker] = useState(false);

  // Determine if this widget type supports linking
  const isLinkable = LINKABLE_TYPES.has(widget.type as WidgetType);
  if (!isLinkable) return null;

  // Get current link value
  const currentUrl = (widget.props.url as string) ?? (widget.props._navigateTo as string) ?? '';
  const linkAction = (widget.props._linkAction as string) ?? (currentUrl ? (currentUrl.startsWith('http') ? 'url' : 'navigate') : 'none');

  // Determine which prop to update based on widget type
  const urlProp = widget.type === WidgetType.Link ? 'url' : '_navigateTo';

  // Find linked page
  const linkedPage = pages.find(p => p.path === currentUrl);

  const handleSelectPage = (pagePath: string) => {
    onPropertyChange(urlProp, pagePath);
    onPropertyChange('_linkAction', 'navigate');
    if (widget.type === WidgetType.Link) {
      onPropertyChange('url', pagePath);
    }
    setShowPagePicker(false);
  };

  const handleSetAction = (action: string) => {
    onPropertyChange('_linkAction', action);
    if (action === 'none') {
      onPropertyChange(urlProp, '');
      if (widget.type === WidgetType.Link) {
        onPropertyChange('url', '#');
      }
    }
  };

  return (
    <div className="border-b border-builder-border/20">
      <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-builder-text-dim flex items-center gap-1.5">
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
        </svg>
        Link & Navigation
      </div>
      <div className="px-3 pb-3 flex flex-col gap-2.5">

        {/* Click Action Selector */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-builder-text-dim">On Click Action</label>
          <div className="grid grid-cols-2 gap-1">
            {LINK_ACTIONS.filter(a => a.id === 'navigate' || a.id === 'url' || a.id === 'none').map(action => (
              <button
                key={action.id}
                className={clsx(
                  'flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[10px] border transition-all',
                  linkAction === action.id
                    ? 'border-builder-accent/50 bg-builder-accent/10 text-builder-accent'
                    : 'border-builder-border/30 text-builder-text-dim hover:text-builder-text hover:bg-glass-white-10',
                )}
                onClick={() => handleSetAction(action.id)}
              >
                <span className="text-xs">{action.icon}</span>
                <span className="truncate">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Page Navigation Picker */}
        {linkAction === 'navigate' && (
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-builder-text-dim">Target Page</label>

            {/* Current linked page indicator */}
            {linkedPage ? (
              <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg border border-builder-accent/30 bg-builder-accent/5">
                <div className="w-6 h-6 rounded bg-builder-accent/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-builder-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-medium text-builder-accent truncate">{linkedPage.name}</div>
                  <div className="text-[9px] text-builder-text-dim font-mono">{linkedPage.path}</div>
                </div>
                <button
                  className="text-builder-text-dim hover:text-builder-error transition-colors flex-shrink-0"
                  onClick={() => { onPropertyChange(urlProp, ''); if (widget.type === WidgetType.Link) onPropertyChange('url', '#'); }}
                  title="Remove link"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="text-[10px] text-builder-text-dim/60 italic px-1">No page linked</div>
            )}

            {/* Page picker button */}
            <button
              className="w-full flex items-center justify-center gap-1.5 h-8 text-[11px] font-medium rounded-lg border border-dashed border-builder-border/40 text-builder-text-muted hover:border-builder-accent/40 hover:text-builder-accent hover:bg-builder-accent/5 transition-all"
              onClick={() => setShowPagePicker(!showPagePicker)}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
              </svg>
              {linkedPage ? 'Change Page' : 'Link to Page'}
            </button>

            {/* Page list dropdown */}
            <AnimatePresence>
              {showPagePicker && (
                <motion.div
                  className="flex flex-col rounded-lg border border-builder-border/40 bg-builder-surface overflow-hidden"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {pages.length === 0 ? (
                    <div className="px-3 py-4 text-center text-[10px] text-builder-text-dim">
                      No pages available. Create a page first.
                    </div>
                  ) : (
                    <div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-builder-border/30">
                      {pages.map(page => (
                        <button
                          key={page.id}
                          className={clsx(
                            'w-full flex items-center gap-2 px-3 py-2 text-left transition-colors',
                            page.path === currentUrl
                              ? 'bg-builder-accent/10 text-builder-accent'
                              : 'text-builder-text-muted hover:bg-glass-white-10 hover:text-builder-text',
                          )}
                          onClick={() => handleSelectPage(page.path)}
                        >
                          <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                          <div className="flex-1 min-w-0">
                            <div className="text-[11px] font-medium truncate">{page.name}</div>
                            <div className="text-[8px] text-builder-text-dim font-mono">{page.path}</div>
                          </div>
                          {page.isHomePage && (
                            <span className="text-[7px] px-1 py-0.5 bg-builder-accent/20 text-builder-accent rounded font-bold flex-shrink-0">HOME</span>
                          )}
                          {page.path === currentUrl && (
                            <svg className="w-3.5 h-3.5 text-builder-accent flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Or enter path manually */}
            <div className="flex flex-col gap-1 mt-1">
              <label className="text-[9px] text-builder-text-dim">Or enter path manually</label>
              <input
                type="text"
                value={currentUrl}
                onChange={(e) => {
                  onPropertyChange(urlProp, e.target.value);
                  if (widget.type === WidgetType.Link) onPropertyChange('url', e.target.value);
                }}
                placeholder="/page-path or https://..."
                className="w-full h-7 px-2 text-[11px] bg-builder-bg/60 border border-builder-border/40 rounded-lg text-builder-text font-mono placeholder:text-builder-text-dim/40 focus:outline-none focus:border-builder-accent/50 transition-colors"
              />
            </div>

            {/* Open in new tab toggle (for links) */}
            {widget.type === WidgetType.Link && (
              <div className="flex items-center justify-between">
                <label className="text-[10px] text-builder-text-dim">Open in new tab</label>
                <button
                  className={clsx(
                    'w-9 h-5 rounded-full transition-colors relative',
                    (widget.props.openInNewTab as boolean) ? 'bg-builder-accent' : 'bg-builder-border',
                  )}
                  onClick={() => onPropertyChange('openInNewTab', !(widget.props.openInNewTab as boolean))}
                >
                  <div
                    className={clsx(
                      'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform',
                      (widget.props.openInNewTab as boolean) ? 'translate-x-[18px]' : 'translate-x-0.5',
                    )}
                  />
                </button>
              </div>
            )}
          </div>
        )}

        {/* External URL */}
        {linkAction === 'url' && (
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-builder-text-dim">External URL</label>
            <input
              type="url"
              value={currentUrl}
              onChange={(e) => {
                onPropertyChange(urlProp, e.target.value);
                if (widget.type === WidgetType.Link) onPropertyChange('url', e.target.value);
              }}
              placeholder="https://example.com"
              className="w-full h-8 px-2.5 text-xs bg-builder-bg/60 border border-builder-border/40 rounded-lg text-builder-text font-mono placeholder:text-builder-text-dim/40 focus:outline-none focus:border-builder-accent/50 transition-colors"
            />
            {widget.type === WidgetType.Link && (
              <div className="flex items-center justify-between mt-1">
                <label className="text-[10px] text-builder-text-dim">Open in new tab</label>
                <button
                  className={clsx(
                    'w-9 h-5 rounded-full transition-colors relative',
                    (widget.props.openInNewTab as boolean) ? 'bg-builder-accent' : 'bg-builder-border',
                  )}
                  onClick={() => onPropertyChange('openInNewTab', !(widget.props.openInNewTab as boolean))}
                >
                  <div
                    className={clsx(
                      'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform',
                      (widget.props.openInNewTab as boolean) ? 'translate-x-[18px]' : 'translate-x-0.5',
                    )}
                  />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Visual link indicator */}
        {currentUrl && linkAction !== 'none' && (
          <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-builder-success/5 border border-builder-success/20">
            <svg className="w-3 h-3 text-builder-success flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            <span className="text-[9px] text-builder-success">
              {linkAction === 'navigate' ? `Links to: ${currentUrl}` : `Opens: ${currentUrl}`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Event Actions Section
 * 
 * Quick actions for interactive widgets:
 * - On Click behavior
 * - Hover effects
 * - Visibility toggle
 * ────────────────────────────────────────────── */

const INTERACTIVE_TYPES = new Set([
  WidgetType.Button,
  WidgetType.IconButton,
  WidgetType.Link,
  WidgetType.FloatingActionButton,
  WidgetType.Card,
  WidgetType.Image,
  WidgetType.Checkbox,
  WidgetType.Toggle,
  WidgetType.Radio,
  WidgetType.Dropdown,
]);

function EventActionsSection({ widget, onPropertyChange }: LinkSectionProps) {
  const isInteractive = INTERACTIVE_TYPES.has(widget.type as WidgetType);
  if (!isInteractive) return null;

  // Skip if already shown in Link section
  if (LINKABLE_TYPES.has(widget.type as WidgetType)) return null;

  const currentAction = (widget.props._clickAction as string) ?? 'none';

  return (
    <div className="border-b border-builder-border/20">
      <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-builder-text-dim flex items-center gap-1.5">
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
        </svg>
        Interactions
      </div>
      <div className="px-3 pb-3 flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-builder-text-dim">On Click</label>
          <select
            value={currentAction}
            onChange={(e) => onPropertyChange('_clickAction', e.target.value)}
            className="w-full h-7 px-2 text-[11px] bg-builder-bg/60 border border-builder-border/40 rounded-lg text-builder-text focus:outline-none focus:border-builder-accent/50 transition-colors appearance-none cursor-pointer"
          >
            <option value="none">No action</option>
            <option value="toggle">Toggle state</option>
            <option value="show-toast">Show notification</option>
            <option value="set-variable">Set variable</option>
            <option value="submit-form">Submit form</option>
            <option value="reset-form">Reset form</option>
            <option value="custom">Custom function</option>
          </select>
        </div>

        {/* Hover effect */}
        <div className="flex items-center justify-between">
          <label className="text-[10px] text-builder-text-dim">Hover animation</label>
          <button
            className={clsx(
              'w-9 h-5 rounded-full transition-colors relative',
              (widget.props._hoverEffect as boolean) ? 'bg-builder-accent' : 'bg-builder-border',
            )}
            onClick={() => onPropertyChange('_hoverEffect', !(widget.props._hoverEffect as boolean))}
          >
            <div
              className={clsx(
                'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform',
                (widget.props._hoverEffect as boolean) ? 'translate-x-[18px]' : 'translate-x-0.5',
              )}
            />
          </button>
        </div>

        {/* Cursor style */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-builder-text-dim">Cursor</label>
          <select
            value={(widget.props._cursor as string) ?? 'pointer'}
            onChange={(e) => onPropertyChange('_cursor', e.target.value)}
            className="w-full h-7 px-2 text-[11px] bg-builder-bg/60 border border-builder-border/40 rounded-lg text-builder-text focus:outline-none focus:border-builder-accent/50 transition-colors appearance-none cursor-pointer"
          >
            <option value="pointer">Pointer</option>
            <option value="default">Default</option>
            <option value="not-allowed">Not allowed</option>
            <option value="grab">Grab</option>
            <option value="crosshair">Crosshair</option>
          </select>
        </div>
      </div>
    </div>
  );
}
