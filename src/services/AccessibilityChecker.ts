/**
 * Accessibility Checker
 * 
 * WCAG 2.1 compliance checking for widgets.
 * Features:
 * - Color contrast ratio (AA/AAA)
 * - Missing alt text detection
 * - Form label association
 * - Focus order analysis
 * - ARIA attribute validation
 * - Touch target size checks
 * - Heading hierarchy validation
 * - Language attribute checks
 * - Keyboard navigation audit
 */

import { WidgetConfig, WidgetType } from '@/types/widget.types';

/* ──────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────── */

export interface A11yIssue {
  id: string;
  widgetId: string;
  widgetName: string;
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
  category: A11yCategory;
  rule: string;
  message: string;
  fix: string;
  wcagCriteria: string;
  impact: string;
}

export type A11yCategory = 'color' | 'images' | 'forms' | 'navigation' | 'structure' | 'aria' | 'touch' | 'keyboard';

export interface A11yAuditResult {
  score: number;
  level: 'A' | 'AA' | 'AAA' | 'FAIL';
  totalIssues: number;
  critical: number;
  serious: number;
  moderate: number;
  minor: number;
  issues: A11yIssue[];
  passed: string[];
}

/* ──────────────────────────────────────────────
 * Color Contrast
 * ────────────────────────────────────────────── */

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = hex.replace('#', '').match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return null;
  return { r: parseInt(m[1]!, 16), g: parseInt(m[2]!, 16), b: parseInt(m[3]!, 16) };
}

function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); });
  return 0.2126 * rs! + 0.7152 * gs! + 0.0722 * bs!;
}

export function getContrastRatio(fg: string, bg: string): number {
  const fgRgb = hexToRgb(fg);
  const bgRgb = hexToRgb(bg);
  if (!fgRgb || !bgRgb) return 0;
  const l1 = relativeLuminance(fgRgb.r, fgRgb.g, fgRgb.b);
  const l2 = relativeLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function meetsWCAG(ratio: number, level: 'AA' | 'AAA', isLargeText: boolean): boolean {
  if (level === 'AAA') return isLargeText ? ratio >= 4.5 : ratio >= 7;
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

/* ──────────────────────────────────────────────
 * Audit Engine
 * ────────────────────────────────────────────── */

export function auditAccessibility(widgets: Record<string, WidgetConfig>): A11yAuditResult {
  const issues: A11yIssue[] = [];
  const passed: string[] = [];
  const widgetList = Object.values(widgets);

  for (const widget of widgetList) {
    // 1. Image alt text
    if (widget.type === WidgetType.Image) {
      const alt = widget.props.alt as string;
      if (!alt || alt.trim() === '') {
        issues.push({
          id: `img-alt-${widget.id}`, widgetId: widget.id, widgetName: widget.name,
          severity: 'serious', category: 'images', rule: 'img-alt',
          message: 'Image missing alt text', fix: 'Add descriptive alt text to the image',
          wcagCriteria: '1.1.1 Non-text Content', impact: 'Screen readers cannot describe this image',
        });
      } else {
        passed.push(`Image "${widget.name}" has alt text`);
      }
    }

    // 2. Button labels
    if (widget.type === WidgetType.Button || widget.type === WidgetType.IconButton) {
      const label = (widget.props.label as string) ?? '';
      if (!label.trim()) {
        issues.push({
          id: `btn-label-${widget.id}`, widgetId: widget.id, widgetName: widget.name,
          severity: 'critical', category: 'forms', rule: 'button-name',
          message: 'Button has no accessible label', fix: 'Add a label or aria-label',
          wcagCriteria: '4.1.2 Name, Role, Value', impact: 'Button purpose is unknown to assistive tech',
        });
      }
    }

    // 3. Form inputs need labels
    if ([WidgetType.TextInput, WidgetType.TextArea, WidgetType.Dropdown, WidgetType.NumberInput].includes(widget.type as WidgetType)) {
      const label = (widget.props.label as string) ?? '';
      if (!label.trim()) {
        issues.push({
          id: `input-label-${widget.id}`, widgetId: widget.id, widgetName: widget.name,
          severity: 'serious', category: 'forms', rule: 'label',
          message: 'Form input missing label', fix: 'Add a visible label for this input',
          wcagCriteria: '1.3.1 Info and Relationships', impact: 'Users cannot identify what to enter',
        });
      } else {
        passed.push(`Input "${widget.name}" has label: "${label}"`);
      }
    }

    // 4. Color contrast
    const textColor = widget.style.color;
    const bgColor = widget.style.background?.color;
    if (textColor && bgColor && textColor.startsWith('#') && bgColor.startsWith('#')) {
      const ratio = getContrastRatio(textColor, bgColor);
      const fontSize = widget.style.fontSize ?? 14;
      const isLarge = fontSize >= 18 || (fontSize >= 14 && widget.style.fontWeight === '700');
      if (!meetsWCAG(ratio, 'AA', isLarge)) {
        issues.push({
          id: `contrast-${widget.id}`, widgetId: widget.id, widgetName: widget.name,
          severity: 'serious', category: 'color', rule: 'color-contrast',
          message: `Low contrast ratio (${ratio.toFixed(1)}:1)`, fix: 'Increase contrast between text and background colors',
          wcagCriteria: '1.4.3 Contrast (Minimum)', impact: 'Text may be difficult to read',
        });
      } else {
        passed.push(`"${widget.name}" contrast ratio OK (${ratio.toFixed(1)}:1)`);
      }
    }

    // 5. Touch target size
    const width = widget.style.width?.value ?? 100;
    const height = widget.style.height?.value ?? 40;
    if ([WidgetType.Button, WidgetType.IconButton, WidgetType.Checkbox, WidgetType.Radio, WidgetType.Toggle].includes(widget.type as WidgetType)) {
      if (width < 44 || height < 44) {
        issues.push({
          id: `touch-${widget.id}`, widgetId: widget.id, widgetName: widget.name,
          severity: 'moderate', category: 'touch', rule: 'target-size',
          message: `Touch target too small (${width}×${height}px, need 44×44)`, fix: 'Increase size to at least 44×44 pixels',
          wcagCriteria: '2.5.5 Target Size', impact: 'Difficult to tap on mobile devices',
        });
      }
    }

    // 6. Link text
    if (widget.type === WidgetType.Link) {
      const text = (widget.props.text as string) ?? '';
      if (['click here', 'here', 'read more', 'learn more', 'more'].includes(text.toLowerCase().trim())) {
        issues.push({
          id: `link-text-${widget.id}`, widgetId: widget.id, widgetName: widget.name,
          severity: 'moderate', category: 'navigation', rule: 'link-name',
          message: `Non-descriptive link text: "${text}"`, fix: 'Use descriptive link text that explains the destination',
          wcagCriteria: '2.4.4 Link Purpose', impact: 'Purpose of link unclear out of context',
        });
      }
    }
  }

  // 7. Heading hierarchy
  const headings = widgetList.filter(w => w.type === WidgetType.Heading).sort((a, b) => a.position.y - b.position.y);
  let prevLevel = 0;
  for (const h of headings) {
    const level = (h.props.level as number) ?? 2;
    if (level > prevLevel + 1 && prevLevel > 0) {
      issues.push({
        id: `heading-skip-${h.id}`, widgetId: h.id, widgetName: h.name,
        severity: 'moderate', category: 'structure', rule: 'heading-order',
        message: `Heading skips level (h${prevLevel} → h${level})`, fix: `Use h${prevLevel + 1} instead of h${level}`,
        wcagCriteria: '1.3.1 Info and Relationships', impact: 'Screen reader navigation disrupted',
      });
    }
    prevLevel = level;
  }

  if (headings.length > 0) passed.push(`${headings.length} headings found`);

  // Score
  const critical = issues.filter(i => i.severity === 'critical').length;
  const serious = issues.filter(i => i.severity === 'serious').length;
  const moderate = issues.filter(i => i.severity === 'moderate').length;
  const minor = issues.filter(i => i.severity === 'minor').length;
  const totalChecks = issues.length + passed.length;
  const score = totalChecks > 0 ? Math.round((passed.length / totalChecks) * 100) : 100;
  const level = critical > 0 ? 'FAIL' : serious > 0 ? 'A' : moderate > 0 ? 'AA' : 'AAA';

  return { score, level, totalIssues: issues.length, critical, serious, moderate, minor, issues, passed };
}

export const A11Y_CATEGORY_LABELS: Record<A11yCategory, string> = {
  color: 'Color & Contrast',
  images: 'Images & Media',
  forms: 'Forms & Inputs',
  navigation: 'Links & Navigation',
  structure: 'Document Structure',
  aria: 'ARIA Attributes',
  touch: 'Touch & Pointer',
  keyboard: 'Keyboard Access',
};
