/**
 * Canvas Layer
 * 
 * Recursively renders widgets on the canvas artboard.
 * Each widget is rendered with its computed styles and
 * can contain child widgets.
 */

'use client';

import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { selectWidget, addToSelection, setHoveredWidget } from '@/store/canvasSlice';
import { WidgetConfig, WidgetType } from '@/types/widget.types';
import { widgetStyleToCSS } from '@/utils';

/* ──────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────── */

interface CanvasLayerProps {
  widgetIds: string[];
  widgets: Record<string, WidgetConfig>;
}

interface WidgetRendererProps {
  widget: WidgetConfig;
  widgets: Record<string, WidgetConfig>;
}

/* ──────────────────────────────────────────────
 * Widget Content Renderers
 * ────────────────────────────────────────────── */

function renderWidgetContent(widget: WidgetConfig): React.ReactNode {
  const props = widget.props;

  switch (widget.type) {
    /* ── Navigation ── */
    case WidgetType.Button:
      return (
        <button className="w-full h-full flex items-center justify-center gap-2 rounded-lg font-medium text-sm transition-colors" style={{ background: widget.style.background?.color ?? '#6366f1', color: widget.style.color ?? '#ffffff', borderRadius: widget.style.borderRadius ? `${widget.style.borderRadius.topLeft}px` : '8px' }}>
          {(props.label as string) ?? 'Button'}
        </button>
      );

    case WidgetType.IconButton:
      return (
        <div className="w-full h-full flex items-center justify-center rounded-lg bg-glass-white-10 hover:bg-glass-white-20 text-builder-text-muted transition-colors cursor-pointer">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
        </div>
      );

    case WidgetType.Link:
      return (
        <span className="text-sm underline cursor-pointer" style={{ color: widget.style.color ?? '#6366f1' }}>
          {(props.text as string) ?? 'Click here'}
        </span>
      );

    case WidgetType.Navbar:
      if (widget.childIds.length === 0) {
        return (
          <div className="w-full h-full flex items-center justify-between px-4" style={{ background: widget.style.background?.color ?? '#13131a' }}>
            <span className="text-sm font-semibold text-builder-text">{(props.title as string) ?? 'My App'}</span>
            <div className="flex items-center gap-3 text-builder-text-muted text-xs">
              <span>Home</span><span>About</span><span>Contact</span>
            </div>
          </div>
        );
      }
      return null;

    case WidgetType.Sidebar:
      if (widget.childIds.length === 0) {
        return (
          <div className="w-full h-full flex flex-col gap-1 p-3" style={{ background: widget.style.background?.color ?? '#13131a' }}>
            {['Dashboard', 'Projects', 'Settings', 'Profile'].map(item => (
              <div key={item} className="px-3 py-2 text-xs text-builder-text-muted rounded-md hover:bg-glass-white-10">{item}</div>
            ))}
          </div>
        );
      }
      return null;

    case WidgetType.Breadcrumb: {
      const items = (props.items as { label: string }[]) ?? [{ label: 'Home' }, { label: 'Page' }];
      const sep = (props.separator as string) ?? '/';
      return (
        <div className="flex items-center gap-1.5 text-xs text-builder-text-muted">
          {items.map((item, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="text-builder-text-dim">{sep}</span>}
              <span className={i === items.length - 1 ? 'text-builder-text' : 'hover:text-builder-text cursor-pointer'}>{item.label}</span>
            </React.Fragment>
          ))}
        </div>
      );
    }

    case WidgetType.Pagination:
      return (
        <div className="flex items-center gap-1">
          <div className="w-7 h-7 flex items-center justify-center rounded text-[10px] text-builder-text-dim border border-builder-border/40">&lt;</div>
          {[1, 2, 3, '...', (props.totalPages as number) ?? 10].map((p, i) => (
            <div key={i} className={`w-7 h-7 flex items-center justify-center rounded text-[10px] ${p === 1 ? 'bg-builder-accent text-white' : 'text-builder-text-muted border border-builder-border/40'}`}>{p}</div>
          ))}
          <div className="w-7 h-7 flex items-center justify-center rounded text-[10px] text-builder-text-dim border border-builder-border/40">&gt;</div>
        </div>
      );

    case WidgetType.BottomNav: {
      const navItems = (props.items as { label: string; icon: string }[]) ?? [{ label: 'Home', icon: 'Home' }, { label: 'Search', icon: 'Search' }, { label: 'Profile', icon: 'User' }];
      const activeIdx = (props.activeIndex as number) ?? 0;
      return (
        <div className="w-full h-full flex items-center justify-around" style={{ background: widget.style.background?.color ?? '#13131a' }}>
          {navItems.map((item, i) => (
            <div key={i} className={`flex flex-col items-center gap-0.5 ${i === activeIdx ? 'text-builder-accent' : 'text-builder-text-dim'}`}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /></svg>
              <span className="text-[8px]">{item.label}</span>
            </div>
          ))}
        </div>
      );
    }

    case WidgetType.Drawer:
    case WidgetType.FloatingActionButton:
      if (widget.type === WidgetType.FloatingActionButton) {
        return (
          <div className="w-full h-full flex items-center justify-center rounded-full text-white shadow-lg" style={{ background: (props.color as string) ?? '#6366f1' }}>
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
          </div>
        );
      }
      if (widget.childIds.length === 0) {
        return <div className="w-full h-full flex items-center justify-center border border-dashed border-builder-border/40 rounded-lg text-builder-text-dim text-[11px]">Drawer</div>;
      }
      return null;

    /* ── Display / Typography ── */
    case WidgetType.Text:
      return <span className="block w-full" style={{ fontSize: widget.style.fontSize ?? 14, fontWeight: widget.style.fontWeight ?? '400', color: widget.style.color ?? '#e2e8f0', textAlign: widget.style.textAlign ?? 'left' }}>{(props.content as string) ?? 'Text content'}</span>;

    case WidgetType.Paragraph:
      return <p className="w-full" style={{ fontSize: widget.style.fontSize ?? 14, color: widget.style.color ?? '#94a3b8', lineHeight: widget.style.lineHeight ?? 1.6 }}>{(props.content as string) ?? 'Lorem ipsum dolor sit amet...'}</p>;

    case WidgetType.Heading: {
      const lvl = (props.level as number) ?? 2;
      const sizes: Record<number, string> = { 1: '2.25rem', 2: '1.875rem', 3: '1.5rem', 4: '1.25rem', 5: '1.125rem', 6: '1rem' };
      const headingStyle = { fontSize: sizes[lvl] ?? '1.5rem', fontWeight: (widget.style.fontWeight ?? '700') as string, color: widget.style.color ?? '#e2e8f0', margin: 0 };
      const content = (props.content as string) ?? `Heading ${lvl}`;
      if (lvl === 1) return <h1 style={headingStyle}>{content}</h1>;
      if (lvl === 3) return <h3 style={headingStyle}>{content}</h3>;
      if (lvl === 4) return <h4 style={headingStyle}>{content}</h4>;
      if (lvl === 5) return <h5 style={headingStyle}>{content}</h5>;
      if (lvl === 6) return <h6 style={headingStyle}>{content}</h6>;
      return <h2 style={headingStyle}>{content}</h2>;
    }

    case WidgetType.Badge:
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: (props.color as string) ?? '#6366f1', color: '#fff' }}>{(props.content as string) ?? 'Badge'}</span>;

    case WidgetType.Tag:
      return (
        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border" style={{ borderColor: `${(props.color as string) ?? '#6366f1'}50`, color: (props.color as string) ?? '#6366f1', background: `${(props.color as string) ?? '#6366f1'}10` }}>
          {(props.label as string) ?? 'Tag'}
          {(props.removable as boolean) !== false && <span className="text-[10px] cursor-pointer opacity-60 hover:opacity-100">&times;</span>}
        </div>
      );

    case WidgetType.Chip:
      return (
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${(props.selected as boolean) ? 'bg-builder-accent/20 border-builder-accent text-builder-accent' : 'bg-builder-elevated border-builder-border/40 text-builder-text-muted'}`}>
          {(props.label as string) ?? 'Chip'}
        </div>
      );

    case WidgetType.Avatar: {
      const name = (props.name as string) ?? 'JD';
      const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      const shape = (props.shape as string) ?? 'circle';
      return (
        <div className={`w-full h-full flex items-center justify-center bg-builder-accent/20 text-builder-accent text-sm font-bold ${shape === 'circle' ? 'rounded-full' : shape === 'rounded' ? 'rounded-lg' : 'rounded-sm'}`}>
          {initials}
          {(props.showStatus as boolean) && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-builder-success border-2 border-builder-surface" />}
        </div>
      );
    }

    case WidgetType.Icon:
      return (
        <div className="flex items-center justify-center" style={{ width: (props.size as number) ?? 24, height: (props.size as number) ?? 24, color: (props.color as string) ?? '#94a3b8' }}>
          <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={(props.strokeWidth as number) ?? 2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
        </div>
      );

    case WidgetType.Tooltip:
      if (widget.childIds.length === 0) {
        return <div className="w-full h-full flex items-center justify-center text-xs text-builder-text-muted bg-builder-elevated rounded-md border border-builder-border/30 relative">{(props.text as string) ?? 'Tooltip'}</div>;
      }
      return null;

    case WidgetType.ProgressBar: {
      const val = (props.value as number) ?? 60;
      const max = (props.max as number) ?? 100;
      const pct = (val / max) * 100;
      return (
        <div className="w-full flex flex-col gap-1">
          <div className="w-full h-2 rounded-full bg-builder-border/40 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: (props.color as string) ?? '#6366f1' }} />
          </div>
          {(props.showLabel as boolean) && <span className="text-[10px] text-builder-text-muted">{Math.round(pct)}%</span>}
        </div>
      );
    }

    /* ── Input & Forms ── */
    case WidgetType.TextInput:
      return (
        <div className="w-full flex flex-col gap-1">
          {(props.label as string) && <label className="text-[11px] text-builder-text-muted font-medium">{props.label as string}</label>}
          <div className="flex items-center h-9 px-3 rounded-lg border border-builder-border bg-builder-bg/50 text-builder-text-muted text-sm">{(props.placeholder as string) ?? 'Enter text...'}</div>
          {(props.helperText as string) && <span className="text-[10px] text-builder-text-dim">{props.helperText as string}</span>}
        </div>
      );

    case WidgetType.TextArea:
      return (
        <div className="w-full flex flex-col gap-1">
          {(props.label as string) && <label className="text-[11px] text-builder-text-muted font-medium">{props.label as string}</label>}
          <div className="w-full flex-1 px-3 py-2 rounded-lg border border-builder-border bg-builder-bg/50 text-builder-text-muted text-sm min-h-[60px]">{(props.placeholder as string) ?? 'Enter long text...'}</div>
        </div>
      );

    case WidgetType.NumberInput:
      return (
        <div className="w-full flex flex-col gap-1">
          {(props.label as string) && <label className="text-[11px] text-builder-text-muted font-medium">{props.label as string}</label>}
          <div className="flex items-center h-9 rounded-lg border border-builder-border bg-builder-bg/50 overflow-hidden">
            <div className="w-8 h-full flex items-center justify-center border-r border-builder-border text-builder-text-dim text-xs cursor-pointer hover:bg-glass-white-10">−</div>
            <div className="flex-1 text-center text-sm text-builder-text">{(props.value as number) ?? 0}</div>
            <div className="w-8 h-full flex items-center justify-center border-l border-builder-border text-builder-text-dim text-xs cursor-pointer hover:bg-glass-white-10">+</div>
          </div>
        </div>
      );

    case WidgetType.Checkbox:
      return (
        <label className="flex items-center gap-2 text-sm text-builder-text cursor-pointer">
          <div className="w-4 h-4 rounded border border-builder-border bg-builder-bg/50 flex items-center justify-center">
            {(props.checked as boolean) && <svg className="w-3 h-3 text-builder-accent" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
          </div>
          {(props.label as string) ?? 'Checkbox'}
        </label>
      );

    case WidgetType.Radio:
      return (
        <label className="flex items-center gap-2 text-sm text-builder-text cursor-pointer">
          <div className="w-4 h-4 rounded-full border border-builder-border bg-builder-bg/50 flex items-center justify-center">
            {(props.checked as boolean) && <div className="w-2 h-2 rounded-full bg-builder-accent" />}
          </div>
          {(props.label as string) ?? 'Option'}
        </label>
      );

    case WidgetType.Toggle:
      return (
        <label className="flex items-center gap-2 text-sm text-builder-text cursor-pointer">
          <div className={`w-10 h-5 rounded-full transition-colors ${(props.checked as boolean) ? 'bg-builder-accent' : 'bg-builder-border'}`}>
            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform mt-0.5 ${(props.checked as boolean) ? 'translate-x-5 ml-0.5' : 'translate-x-0.5'}`} />
          </div>
          {(props.label as string) ?? 'Toggle'}
        </label>
      );

    case WidgetType.Dropdown:
      return (
        <div className="w-full flex flex-col gap-1">
          {(props.label as string) && <label className="text-[11px] text-builder-text-muted font-medium">{props.label as string}</label>}
          <div className="flex items-center justify-between h-9 px-3 rounded-lg border border-builder-border bg-builder-bg/50 text-builder-text-muted text-sm cursor-pointer">
            <span>{(props.placeholder as string) ?? 'Choose...'}</span>
            <svg className="w-3.5 h-3.5 text-builder-text-dim" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
          </div>
        </div>
      );

    case WidgetType.Slider: {
      const sliderVal = (props.value as number) ?? 50;
      const sliderMax = (props.max as number) ?? 100;
      const sliderMin = (props.min as number) ?? 0;
      const pct = ((sliderVal - sliderMin) / (sliderMax - sliderMin)) * 100;
      return (
        <div className="w-full flex flex-col gap-1">
          {(props.label as string) && <div className="flex justify-between text-[11px]"><span className="text-builder-text-muted">{props.label as string}</span>{(props.showValue as boolean) !== false && <span className="text-builder-text font-mono">{sliderVal}</span>}</div>}
          <div className="w-full h-1.5 rounded-full bg-builder-border/40 relative">
            <div className="h-full rounded-full bg-builder-accent" style={{ width: `${pct}%` }} />
            <div className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-builder-accent shadow-sm" style={{ left: `calc(${pct}% - 7px)` }} />
          </div>
        </div>
      );
    }

    case WidgetType.DatePicker:
      return (
        <div className="w-full flex flex-col gap-1">
          {(props.label as string) && <label className="text-[11px] text-builder-text-muted font-medium">{props.label as string}</label>}
          <div className="flex items-center justify-between h-9 px-3 rounded-lg border border-builder-border bg-builder-bg/50 text-builder-text-muted text-sm">
            <span>{(props.placeholder as string) ?? 'Select date...'}</span>
            <svg className="w-4 h-4 text-builder-text-dim" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
          </div>
        </div>
      );

    case WidgetType.TimePicker:
      return (
        <div className="w-full flex flex-col gap-1">
          {(props.label as string) && <label className="text-[11px] text-builder-text-muted font-medium">{props.label as string}</label>}
          <div className="flex items-center justify-between h-9 px-3 rounded-lg border border-builder-border bg-builder-bg/50 text-builder-text-muted text-sm">
            <span>{(props.placeholder as string) ?? 'Select time...'}</span>
            <svg className="w-4 h-4 text-builder-text-dim" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
          </div>
        </div>
      );

    case WidgetType.FilePicker:
      return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-builder-border/40 rounded-lg bg-builder-bg/30 cursor-pointer hover:border-builder-accent/30 transition-colors">
          <svg className="w-6 h-6 text-builder-text-dim" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
          <span className="text-[10px] text-builder-text-dim">{(props.label as string) ?? 'Click or drag file'}</span>
        </div>
      );

    case WidgetType.ColorPicker:
      return (
        <div className="w-full flex flex-col gap-1">
          {(props.label as string) && <label className="text-[11px] text-builder-text-muted font-medium">{props.label as string}</label>}
          <div className="flex items-center gap-2 h-9 px-2 rounded-lg border border-builder-border bg-builder-bg/50">
            <div className="w-6 h-6 rounded border border-builder-border/50" style={{ background: (props.value as string) ?? '#6366f1' }} />
            <span className="text-xs text-builder-text font-mono">{(props.value as string) ?? '#6366f1'}</span>
          </div>
        </div>
      );

    /* ── Media ── */
    case WidgetType.Image:
      return (
        <div className="w-full h-full flex items-center justify-center bg-builder-elevated/50 rounded overflow-hidden" style={{ borderRadius: widget.style.borderRadius ? `${widget.style.borderRadius.topLeft}px` : '0' }}>
          {(props.src as string) ? (
            <img src={props.src as string} alt={(props.alt as string) ?? ''} className="w-full h-full" style={{ objectFit: (props.objectFit as string) as React.CSSProperties['objectFit'] ?? 'cover' }} />
          ) : (
            <div className="flex flex-col items-center gap-1 text-builder-text-dim">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <span className="text-[10px]">Image</span>
            </div>
          )}
        </div>
      );

    case WidgetType.Video:
      return (
        <div className="w-full h-full flex items-center justify-center bg-builder-elevated/60 rounded-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-builder-bg/20 to-transparent" />
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center cursor-pointer">
            <svg className="w-5 h-5 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
          </div>
          <span className="absolute bottom-2 left-3 text-[9px] text-white/60">Video Player</span>
        </div>
      );

    case WidgetType.Audio:
      return (
        <div className="w-full h-full flex items-center gap-3 px-3 bg-builder-elevated/60 rounded-lg border border-builder-border/30">
          <div className="w-8 h-8 rounded-full bg-builder-accent/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-builder-accent ml-0.5" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <div className="w-full h-1 rounded-full bg-builder-border/40"><div className="w-1/3 h-full rounded-full bg-builder-accent" /></div>
            <div className="flex justify-between text-[8px] text-builder-text-dim"><span>0:00</span><span>3:45</span></div>
          </div>
        </div>
      );

    case WidgetType.Carousel:
      if (widget.childIds.length === 0) {
        return (
          <div className="w-full h-full flex items-center justify-center bg-builder-elevated/40 rounded-lg relative overflow-hidden">
            <div className="flex gap-2">
              {[1, 2, 3].map(i => <div key={i} className={`w-16 h-20 rounded-md ${i === 2 ? 'bg-builder-accent/20 border border-builder-accent/40' : 'bg-builder-border/20'}`} />)}
            </div>
            {(props.showArrows as boolean) !== false && (
              <>
                <div className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white/60 text-xs">&lt;</div>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white/60 text-xs">&gt;</div>
              </>
            )}
            {(props.showDots as boolean) !== false && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {[0, 1, 2].map(i => <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === 1 ? 'bg-builder-accent' : 'bg-white/20'}`} />)}
              </div>
            )}
          </div>
        );
      }
      return null;

    case WidgetType.Map:
      return (
        <div className="w-full h-full flex items-center justify-center bg-builder-elevated/40 rounded-lg relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(99,102,241,0.1) 20px, rgba(99,102,241,0.1) 21px), repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(99,102,241,0.1) 20px, rgba(99,102,241,0.1) 21px)' }} />
          <div className="flex flex-col items-center gap-1 text-builder-text-dim z-10">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
            <span className="text-[9px]">Map</span>
          </div>
        </div>
      );

    /* ── Data ── */
    case WidgetType.Table: {
      const cols = (props.columns as { header: string }[]) ?? [{ header: 'Name' }, { header: 'Email' }, { header: 'Status' }];
      return (
        <div className="w-full h-full overflow-hidden rounded-lg border border-builder-border/30">
          <div className="flex bg-builder-elevated/60 border-b border-builder-border/30">
            {cols.map((c, i) => <div key={i} className="flex-1 px-3 py-2 text-[10px] font-semibold text-builder-text-muted uppercase tracking-wider">{c.header}</div>)}
          </div>
          {[0, 1, 2].map(row => (
            <div key={row} className={`flex border-b border-builder-border/20 ${(props.striped as boolean) && row % 2 === 1 ? 'bg-glass-white-10/30' : ''}`}>
              {cols.map((_, i) => <div key={i} className="flex-1 px-3 py-2 text-[10px] text-builder-text-dim">Data {row + 1}</div>)}
            </div>
          ))}
        </div>
      );
    }

    case WidgetType.Chart: {
      const chartType = (props.chartType as string) ?? 'bar';
      const title = (props.title as string) ?? 'Chart';
      return (
        <div className="w-full h-full flex flex-col p-3 bg-builder-elevated/30 rounded-lg border border-builder-border/20">
          <span className="text-[11px] font-semibold text-builder-text mb-2">{title}</span>
          <div className="flex-1 flex items-end gap-2 pb-1">
            {chartType === 'bar' || chartType === 'line' ? (
              [65, 45, 80, 55, 90, 40, 70].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t" style={{ height: `${h}%`, background: `hsl(${240 + i * 15}, 70%, 65%)` }} />
                </div>
              ))
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-20 h-20 rounded-full border-8 border-builder-accent border-t-purple-500 border-r-pink-500 border-b-blue-400" />
              </div>
            )}
          </div>
        </div>
      );
    }

    case WidgetType.Form:
    case WidgetType.List:
      if (widget.childIds.length === 0) {
        return <div className="w-full h-full flex items-center justify-center border border-dashed border-builder-border/40 rounded-lg text-builder-text-dim text-[11px]">{widget.type === 'form' ? 'Drop form fields here' : 'List (empty)'}</div>;
      }
      return null;

    /* ── Layout containers ── */
    case WidgetType.Container:
    case WidgetType.Row:
    case WidgetType.Column:
    case WidgetType.Stack:
    case WidgetType.ScrollView:
      if (widget.childIds.length === 0) {
        return <div className="w-full h-full flex items-center justify-center border border-dashed border-builder-border/40 rounded-lg"><span className="text-builder-text-dim text-[11px]">Drop widgets here</span></div>;
      }
      return null;

    case WidgetType.Card:
      if (widget.childIds.length === 0) {
        return <div className="w-full h-full flex items-center justify-center"><span className="text-builder-text-dim text-[11px]">Card</span></div>;
      }
      return null;

    case WidgetType.Grid:
      if (widget.childIds.length === 0) {
        const gridCols = (props.columns as number) ?? 2;
        return (
          <div className="w-full h-full p-2" style={{ display: 'grid', gridTemplateColumns: `repeat(${gridCols}, 1fr)`, gap: '4px' }}>
            {Array.from({ length: gridCols * 2 }).map((_, i) => <div key={i} className="border border-dashed border-builder-border/30 rounded-md flex items-center justify-center text-[8px] text-builder-text-dim/40">{i + 1}</div>)}
          </div>
        );
      }
      return null;

    case WidgetType.Accordion: {
      const accItems = (props.items as { title: string }[]) ?? [{ title: 'Section 1' }, { title: 'Section 2' }];
      return (
        <div className="w-full flex flex-col border border-builder-border/30 rounded-lg overflow-hidden">
          {accItems.map((item, i) => (
            <div key={i} className="border-b border-builder-border/20 last:border-0">
              <div className="flex items-center justify-between px-3 py-2 bg-builder-elevated/30 cursor-pointer hover:bg-builder-elevated/50 transition-colors">
                <span className="text-xs text-builder-text">{item.title}</span>
                <svg className="w-3 h-3 text-builder-text-dim" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
              </div>
              {i === 0 && <div className="px-3 py-2 text-[10px] text-builder-text-dim bg-builder-bg/30">Content area...</div>}
            </div>
          ))}
        </div>
      );
    }

    case WidgetType.Tabs: {
      const tabItems = (props.tabs as { label: string }[]) ?? [{ label: 'Tab 1' }, { label: 'Tab 2' }, { label: 'Tab 3' }];
      const activeTab = (props.activeTab as number) ?? 0;
      return (
        <div className="w-full h-full flex flex-col">
          <div className="flex border-b border-builder-border/30">
            {tabItems.map((tab, i) => (
              <div key={i} className={`px-4 py-2 text-xs cursor-pointer transition-colors ${i === activeTab ? 'text-builder-accent border-b-2 border-builder-accent font-medium' : 'text-builder-text-dim hover:text-builder-text-muted'}`}>{tab.label}</div>
            ))}
          </div>
          <div className="flex-1 flex items-center justify-center text-[10px] text-builder-text-dim">
            {widget.childIds.length === 0 ? 'Tab content area' : null}
          </div>
        </div>
      );
    }

    case WidgetType.Divider:
      return <hr className="w-full border-t border-builder-border/50" />;

    case WidgetType.Spacer:
      return <div className="w-full h-full" />;

    /* ── Feedback ── */
    case WidgetType.Alert: {
      const sevColors: Record<string, string> = { info: '#3b82f6', success: '#22c55e', warning: '#f59e0b', error: '#ef4444' };
      const sev = (props.severity as string) ?? 'info';
      return (
        <div className="w-full flex items-start gap-2 p-3 rounded-lg border text-sm" style={{ borderColor: `${sevColors[sev]}40`, background: `${sevColors[sev]}10`, color: sevColors[sev] }}>
          <div className="flex-1">
            {(props.title as string) && <div className="font-semibold mb-0.5">{props.title as string}</div>}
            <div className="opacity-80 text-xs">{(props.message as string) ?? 'Alert message'}</div>
          </div>
        </div>
      );
    }

    case WidgetType.Toast: {
      const toastColors: Record<string, string> = { success: '#22c55e', error: '#ef4444', warning: '#f59e0b', info: '#3b82f6' };
      const tType = (props.type as string) ?? 'success';
      return (
        <div className="w-full h-full flex items-center gap-2 px-3 rounded-lg border" style={{ borderColor: `${toastColors[tType]}30`, background: `${toastColors[tType]}08` }}>
          <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${toastColors[tType]}20`, color: toastColors[tType] }}>
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>
          </div>
          <span className="text-xs text-builder-text">{(props.message as string) ?? 'Notification'}</span>
        </div>
      );
    }

    case WidgetType.Modal:
    case WidgetType.Dialog:
      if (widget.childIds.length === 0) {
        return (
          <div className="w-full h-full flex flex-col rounded-xl overflow-hidden" style={{ background: widget.style.background?.color ?? '#1a1a25' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-builder-border/20">
              <span className="text-sm font-semibold text-builder-text">{(props.title as string) ?? 'Dialog'}</span>
              <div className="w-5 h-5 rounded flex items-center justify-center text-builder-text-dim hover:text-builder-text cursor-pointer text-xs">&times;</div>
            </div>
            <div className="flex-1 flex items-center justify-center text-xs text-builder-text-dim p-4">
              {(props.message as string) ?? 'Content area'}
            </div>
            {widget.type === WidgetType.Dialog && (
              <div className="flex justify-end gap-2 px-4 py-3 border-t border-builder-border/20">
                <div className="px-3 py-1.5 text-[10px] rounded border border-builder-border/40 text-builder-text-muted cursor-pointer">{(props.cancelLabel as string) ?? 'Cancel'}</div>
                <div className="px-3 py-1.5 text-[10px] rounded bg-builder-accent text-white cursor-pointer">{(props.confirmLabel as string) ?? 'Confirm'}</div>
              </div>
            )}
          </div>
        );
      }
      return null;

    case WidgetType.Skeleton:
      return <div className="w-full h-full bg-builder-border/20 rounded animate-pulse" />;

    case WidgetType.Spinner:
      return (
        <div className="flex items-center justify-center">
          <div className="border-2 border-t-transparent rounded-full animate-spin" style={{ width: (props.size as number) ?? 24, height: (props.size as number) ?? 24, borderColor: `${(props.color as string) ?? '#6366f1'}40`, borderTopColor: 'transparent', borderRightColor: (props.color as string) ?? '#6366f1' }} />
        </div>
      );

    /* ── Fallback ── */
    default:
      return <div className="w-full h-full flex items-center justify-center text-builder-text-dim text-xs">{widget.type}</div>;
  }
}

/* ──────────────────────────────────────────────
 * Widget Renderer Component
 * ────────────────────────────────────────────── */

function WidgetRenderer({ widget, widgets }: WidgetRendererProps) {
  const dispatch = useAppDispatch();
  const selectedIds = useAppSelector((state) => state.canvas.selection.selectedIds);
  const isSelected = selectedIds.includes(widget.id);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (e.shiftKey) {
        dispatch(addToSelection(widget.id));
      } else {
        dispatch(selectWidget(widget.id));
      }
    },
    [dispatch, widget.id],
  );

  const handleMouseEnter = useCallback(() => {
    dispatch(setHoveredWidget(widget.id));
  }, [dispatch, widget.id]);

  const handleMouseLeave = useCallback(() => {
    dispatch(setHoveredWidget(null));
  }, [dispatch]);

  if (!widget.visibility.visible) return null;

  const computedStyle = widgetStyleToCSS(widget.style);

  const defaultWidth = widget.style.width?.value ?? 100;
  const defaultHeight = widget.style.height?.value ?? 40;

  return (
    <div
      data-widget-id={widget.id}
      data-widget-type={widget.type}
      className="absolute"
      style={{
        left: widget.position.x,
        top: widget.position.y,
        width: defaultWidth,
        height: defaultHeight,
        opacity: widget.locked ? 0.7 : 1,
        pointerEvents: widget.locked ? 'none' : 'auto',
        ...computedStyle,
      }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Widget content */}
      {renderWidgetContent(widget)}

      {/* Recursive children */}
      {widget.childIds.length > 0 && (
        <CanvasLayer
          widgetIds={widget.childIds as string[]}
          widgets={widgets}
        />
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Canvas Layer Component
 * ────────────────────────────────────────────── */

export function CanvasLayer({ widgetIds, widgets }: CanvasLayerProps) {
  return (
    <>
      {widgetIds.map((id) => {
        const widget = widgets[id];
        if (!widget) return null;
        return (
          <WidgetRenderer
            key={id}
            widget={widget}
            widgets={widgets}
          />
        );
      })}
    </>
  );
}
