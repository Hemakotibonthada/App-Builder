// =============================================================================
// Typography Engine - Advanced typography system with font management,
// text styling, OpenType features, variable fonts, and text layout
// =============================================================================

// =============================================================================
// Font Types
// =============================================================================

export interface FontFamily {
  name: string;
  category: FontCategory;
  variants: FontVariant[];
  fallbacks: string[];
  source: FontSource;
  url?: string;
  license?: string;
  designer?: string;
  description?: string;
  subsets: string[];
  variable?: VariableFontAxis[];
}

export type FontCategory = 'serif' | 'sans-serif' | 'monospace' | 'display' | 'handwriting' | 'cursive' | 'fantasy' | 'system-ui';
export type FontSource = 'google' | 'custom' | 'system' | 'adobe' | 'uploaded' | 'variable';

export interface FontVariant {
  weight: number;
  style: 'normal' | 'italic' | 'oblique';
  stretch?: string;
  url?: string;
  format?: string;
}

export interface VariableFontAxis {
  tag: string;
  name: string;
  min: number;
  max: number;
  default: number;
  current: number;
}

// =============================================================================
// Text Style Types
// =============================================================================

export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  fontStyle: 'normal' | 'italic' | 'oblique';
  lineHeight: number | string;
  letterSpacing: number;
  wordSpacing: number;
  textAlign: TextAlignment;
  textTransform: TextTransform;
  textDecoration: TextDecoration;
  textDecorationColor?: string;
  textDecorationStyle?: 'solid' | 'double' | 'dotted' | 'dashed' | 'wavy';
  textDecorationThickness?: number;
  textIndent: number;
  textShadow?: TextShadow[];
  textStroke?: { width: number; color: string };
  color: string;
  opacity: number;
  whiteSpace: 'normal' | 'nowrap' | 'pre' | 'pre-wrap' | 'pre-line' | 'break-spaces';
  overflow: 'visible' | 'hidden' | 'ellipsis';
  direction: 'ltr' | 'rtl' | 'auto';
  writingMode: 'horizontal-tb' | 'vertical-rl' | 'vertical-lr';
  fontVariationSettings?: string;
  fontFeatureSettings?: string;
  columns?: number;
  columnGap?: number;
  hyphens: 'none' | 'manual' | 'auto';
  textOverflow: 'clip' | 'ellipsis' | 'fade';
  lineClamp?: number;
  tabSize: number;
  unicodeBidi: 'normal' | 'embed' | 'bidi-override' | 'isolate' | 'plaintext';
}

export type TextAlignment = 'left' | 'center' | 'right' | 'justify' | 'start' | 'end';
export type TextTransform = 'none' | 'capitalize' | 'uppercase' | 'lowercase' | 'full-width';
export type TextDecoration = 'none' | 'underline' | 'line-through' | 'overline' | 'underline line-through';

export interface TextShadow {
  x: number;
  y: number;
  blur: number;
  color: string;
}

// =============================================================================
// Type Scale Types
// =============================================================================

export interface TypeScale {
  name: string;
  baseSize: number;
  ratio: number;
  steps: TypeScaleStep[];
}

export interface TypeScaleStep {
  name: string;
  size: number;
  lineHeight: number;
  letterSpacing: number;
  weight: number;
  htmlTag?: string;
}

export type TypeScaleRatio =
  | 'minor-second'    // 1.067
  | 'major-second'    // 1.125
  | 'minor-third'     // 1.200
  | 'major-third'     // 1.250
  | 'perfect-fourth'  // 1.333
  | 'augmented-fourth' // 1.414
  | 'perfect-fifth'   // 1.500
  | 'minor-sixth'     // 1.600
  | 'golden-ratio'    // 1.618
  | 'major-sixth'     // 1.667
  | 'minor-seventh'   // 1.778
  | 'major-seventh'   // 1.875
  | 'octave'          // 2.000
  | 'custom';

export const TYPE_SCALE_RATIOS: Record<string, number> = {
  'minor-second': 1.067,
  'major-second': 1.125,
  'minor-third': 1.200,
  'major-third': 1.250,
  'perfect-fourth': 1.333,
  'augmented-fourth': 1.414,
  'perfect-fifth': 1.500,
  'minor-sixth': 1.600,
  'golden-ratio': 1.618,
  'major-sixth': 1.667,
  'minor-seventh': 1.778,
  'major-seventh': 1.875,
  'octave': 2.000,
};

// =============================================================================
// OpenType Features
// =============================================================================

export interface OpenTypeFeature {
  tag: string;
  name: string;
  description: string;
  category: string;
  enabled: boolean;
}

export const OPENTYPE_FEATURES: OpenTypeFeature[] = [
  // Ligatures
  { tag: 'liga', name: 'Standard Ligatures', description: 'Common ligatures like fi, fl', category: 'Ligatures', enabled: true },
  { tag: 'dlig', name: 'Discretionary Ligatures', description: 'Optional decorative ligatures', category: 'Ligatures', enabled: false },
  { tag: 'clig', name: 'Contextual Ligatures', description: 'Context-dependent ligatures', category: 'Ligatures', enabled: false },
  { tag: 'hlig', name: 'Historical Ligatures', description: 'Historical/archaic ligatures', category: 'Ligatures', enabled: false },

  // Numbers
  { tag: 'lnum', name: 'Lining Numerals', description: 'Full-height numerals', category: 'Numbers', enabled: false },
  { tag: 'onum', name: 'Old-style Numerals', description: 'Varying height numerals', category: 'Numbers', enabled: false },
  { tag: 'pnum', name: 'Proportional Numerals', description: 'Varying-width numerals', category: 'Numbers', enabled: false },
  { tag: 'tnum', name: 'Tabular Numerals', description: 'Fixed-width numerals', category: 'Numbers', enabled: false },
  { tag: 'frac', name: 'Fractions', description: 'Diagonal fractions', category: 'Numbers', enabled: false },
  { tag: 'afrc', name: 'Alternative Fractions', description: 'Stacked fractions', category: 'Numbers', enabled: false },
  { tag: 'sinf', name: 'Scientific Inferiors', description: 'Subscript numerals', category: 'Numbers', enabled: false },
  { tag: 'sups', name: 'Superscripts', description: 'Superscript characters', category: 'Numbers', enabled: false },
  { tag: 'subs', name: 'Subscripts', description: 'Subscript characters', category: 'Numbers', enabled: false },
  { tag: 'ordn', name: 'Ordinals', description: 'Ordinal indicators', category: 'Numbers', enabled: false },
  { tag: 'zero', name: 'Slashed Zero', description: 'Slashed zero character', category: 'Numbers', enabled: false },

  // Stylistic
  { tag: 'smcp', name: 'Small Caps', description: 'Small capital letters', category: 'Stylistic', enabled: false },
  { tag: 'c2sc', name: 'Caps to Small Caps', description: 'All letters to small caps', category: 'Stylistic', enabled: false },
  { tag: 'pcap', name: 'Petite Caps', description: 'Petite capital letters', category: 'Stylistic', enabled: false },
  { tag: 'unic', name: 'Unicase', description: 'Mixed case forms', category: 'Stylistic', enabled: false },
  { tag: 'titl', name: 'Titling', description: 'Titling alternates', category: 'Stylistic', enabled: false },
  { tag: 'calt', name: 'Contextual Alternates', description: 'Context-specific alternates', category: 'Stylistic', enabled: true },
  { tag: 'swsh', name: 'Swash', description: 'Decorative swash characters', category: 'Stylistic', enabled: false },
  { tag: 'salt', name: 'Stylistic Alternates', description: 'Alternative character forms', category: 'Stylistic', enabled: false },
  { tag: 'ss01', name: 'Stylistic Set 1', description: 'First stylistic set', category: 'Stylistic', enabled: false },
  { tag: 'ss02', name: 'Stylistic Set 2', description: 'Second stylistic set', category: 'Stylistic', enabled: false },
  { tag: 'ss03', name: 'Stylistic Set 3', description: 'Third stylistic set', category: 'Stylistic', enabled: false },

  // Spacing & Positioning
  { tag: 'kern', name: 'Kerning', description: 'Adjust letter spacing', category: 'Spacing', enabled: true },
  { tag: 'cpsp', name: 'Capital Spacing', description: 'Spacing for capitals', category: 'Spacing', enabled: false },
  { tag: 'case', name: 'Case-Sensitive Forms', description: 'Adjust glyph positions', category: 'Spacing', enabled: false },
];

// =============================================================================
// Typography Engine Class
// =============================================================================

export class TypographyEngine {
  private fonts: Map<string, FontFamily> = new Map();
  private textStyles: Map<string, TextStyle> = new Map();
  private typeScales: Map<string, TypeScale> = new Map();
  private fontPairings: FontPairing[] = [];
  private loadedFonts: Set<string> = new Set();
  private listeners: Map<string, Array<(data: unknown) => void>> = new Map();

  constructor() {
    this.initializeSystemFonts();
    this.initializeDefaultStyles();
    this.initializeFontPairings();
  }

  // ---------------------------------------------------------------------------
  // Font Management
  // ---------------------------------------------------------------------------

  registerFont(font: FontFamily): void {
    this.fonts.set(font.name, font);
    this.emit('font:registered', { font });
  }

  unregisterFont(name: string): boolean {
    const result = this.fonts.delete(name);
    if (result) this.emit('font:unregistered', { name });
    return result;
  }

  getFont(name: string): FontFamily | undefined {
    return this.fonts.get(name);
  }

  getAllFonts(): FontFamily[] {
    return Array.from(this.fonts.values());
  }

  getFontsByCategory(category: FontCategory): FontFamily[] {
    return this.getAllFonts().filter(f => f.category === category);
  }

  searchFonts(query: string): FontFamily[] {
    const lower = query.toLowerCase();
    return this.getAllFonts().filter(f =>
      f.name.toLowerCase().includes(lower) ||
      f.category.includes(lower) ||
      f.designer?.toLowerCase().includes(lower) ||
      f.description?.toLowerCase().includes(lower)
    );
  }

  async loadGoogleFont(fontName: string, weights: number[] = [400, 700]): Promise<void> {
    if (this.loadedFonts.has(fontName)) return;

    const weightsStr = weights.join(';');
    const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@${weightsStr}&display=swap`;

    if (typeof document !== 'undefined') {
      const link = document.createElement('link');
      link.href = url;
      link.rel = 'stylesheet';
      document.head.appendChild(link);

      this.loadedFonts.add(fontName);

      const variants: FontVariant[] = weights.map(w => ({
        weight: w,
        style: 'normal' as const,
      }));

      this.registerFont({
        name: fontName,
        category: 'sans-serif',
        variants,
        fallbacks: ['sans-serif'],
        source: 'google',
        url,
        subsets: ['latin'],
      });
    }
  }

  generateFontFaceCSS(font: FontFamily): string {
    let css = '';
    for (const variant of font.variants) {
      if (variant.url) {
        css += `@font-face {\n`;
        css += `  font-family: '${font.name}';\n`;
        css += `  font-style: ${variant.style};\n`;
        css += `  font-weight: ${variant.weight};\n`;
        if (variant.stretch) css += `  font-stretch: ${variant.stretch};\n`;
        css += `  src: url('${variant.url}') format('${variant.format || 'woff2'}');\n`;
        css += `  font-display: swap;\n`;
        css += `}\n\n`;
      }
    }

    // Variable font axes
    if (font.variable && font.variable.length > 0) {
      const axes = font.variable.map(a => `'${a.tag}' ${a.current}`).join(', ');
      css += `.font-${font.name.toLowerCase().replace(/\s+/g, '-')} {\n`;
      css += `  font-variation-settings: ${axes};\n`;
      css += `}\n\n`;
    }

    return css;
  }

  getFontStack(fontName: string): string {
    const font = this.fonts.get(fontName);
    if (!font) return `'${fontName}', sans-serif`;

    const stack = [`'${font.name}'`, ...font.fallbacks];
    return stack.join(', ');
  }

  // ---------------------------------------------------------------------------
  // Text Style Management
  // ---------------------------------------------------------------------------

  createTextStyle(name: string, style: Partial<TextStyle>): TextStyle {
    const fullStyle = this.mergeWithDefaults(style);
    this.textStyles.set(name, fullStyle);
    this.emit('style:created', { name, style: fullStyle });
    return fullStyle;
  }

  updateTextStyle(name: string, updates: Partial<TextStyle>): TextStyle | null {
    const existing = this.textStyles.get(name);
    if (!existing) return null;

    const updated = { ...existing, ...updates };
    this.textStyles.set(name, updated);
    this.emit('style:updated', { name, style: updated });
    return updated;
  }

  deleteTextStyle(name: string): boolean {
    const result = this.textStyles.delete(name);
    if (result) this.emit('style:deleted', { name });
    return result;
  }

  getTextStyle(name: string): TextStyle | undefined {
    return this.textStyles.get(name);
  }

  getAllTextStyles(): Array<{ name: string; style: TextStyle }> {
    return Array.from(this.textStyles.entries()).map(([name, style]) => ({ name, style }));
  }

  duplicateTextStyle(sourceName: string, newName: string): TextStyle | null {
    const source = this.textStyles.get(sourceName);
    if (!source) return null;

    const duplicate = { ...source };
    this.textStyles.set(newName, duplicate);
    return duplicate;
  }

  // ---------------------------------------------------------------------------
  // Type Scale
  // ---------------------------------------------------------------------------

  generateTypeScale(baseSize: number, ratio: number | TypeScaleRatio, name = 'Default'): TypeScale {
    const actualRatio = typeof ratio === 'string' ? (TYPE_SCALE_RATIOS[ratio] || 1.250) : ratio;

    const stepNames = [
      { name: 'xs', tag: 'small', weight: 400 },
      { name: 'sm', tag: 'small', weight: 400 },
      { name: 'base', tag: 'p', weight: 400 },
      { name: 'lg', tag: 'p', weight: 400 },
      { name: 'xl', tag: 'h6', weight: 500 },
      { name: '2xl', tag: 'h5', weight: 600 },
      { name: '3xl', tag: 'h4', weight: 600 },
      { name: '4xl', tag: 'h3', weight: 700 },
      { name: '5xl', tag: 'h2', weight: 700 },
      { name: '6xl', tag: 'h1', weight: 800 },
      { name: '7xl', tag: 'h1', weight: 800 },
      { name: '8xl', tag: 'h1', weight: 900 },
      { name: '9xl', tag: 'h1', weight: 900 },
    ];

    const baseIndex = 2; // 'base' is at index 2
    const steps: TypeScaleStep[] = stepNames.map((step, i) => {
      const power = i - baseIndex;
      const size = Math.round(baseSize * Math.pow(actualRatio, power) * 100) / 100;
      const lineHeight = size < 24 ? 1.6 : size < 40 ? 1.4 : size < 60 ? 1.2 : 1.1;

      return {
        name: step.name,
        size,
        lineHeight,
        letterSpacing: size > 32 ? -0.02 : size < 14 ? 0.01 : 0,
        weight: step.weight,
        htmlTag: step.tag,
      };
    });

    const scale: TypeScale = { name, baseSize, ratio: actualRatio, steps };
    this.typeScales.set(name, scale);
    return scale;
  }

  getTypeScale(name: string): TypeScale | undefined {
    return this.typeScales.get(name);
  }

  getAllTypeScales(): TypeScale[] {
    return Array.from(this.typeScales.values());
  }

  // ---------------------------------------------------------------------------
  // Font Pairings
  // ---------------------------------------------------------------------------

  getFontPairings(): FontPairing[] {
    return [...this.fontPairings];
  }

  suggestPairings(fontName: string): FontPairing[] {
    return this.fontPairings.filter(
      p => p.heading === fontName || p.body === fontName
    );
  }

  addFontPairing(pairing: FontPairing): void {
    this.fontPairings.push(pairing);
  }

  // ---------------------------------------------------------------------------
  // CSS Generation
  // ---------------------------------------------------------------------------

  textStyleToCSS(style: TextStyle): Record<string, string> {
    const css: Record<string, string> = {};

    css['font-family'] = this.getFontStack(style.fontFamily);
    css['font-size'] = `${style.fontSize}px`;
    css['font-weight'] = String(style.fontWeight);
    css['font-style'] = style.fontStyle;
    css['line-height'] = typeof style.lineHeight === 'number' ? String(style.lineHeight) : style.lineHeight;

    if (style.letterSpacing !== 0) css['letter-spacing'] = `${style.letterSpacing}em`;
    if (style.wordSpacing !== 0) css['word-spacing'] = `${style.wordSpacing}px`;
    if (style.textAlign !== 'left') css['text-align'] = style.textAlign;
    if (style.textTransform !== 'none') css['text-transform'] = style.textTransform;
    if (style.textDecoration !== 'none') css['text-decoration'] = style.textDecoration;
    if (style.textDecorationColor) css['text-decoration-color'] = style.textDecorationColor;
    if (style.textDecorationStyle) css['text-decoration-style'] = style.textDecorationStyle;
    if (style.textDecorationThickness) css['text-decoration-thickness'] = `${style.textDecorationThickness}px`;
    if (style.textIndent) css['text-indent'] = `${style.textIndent}px`;
    if (style.color) css.color = style.color;
    if (style.opacity < 1) css.opacity = String(style.opacity);
    if (style.whiteSpace !== 'normal') css['white-space'] = style.whiteSpace;
    if (style.direction !== 'ltr') css.direction = style.direction;
    if (style.writingMode !== 'horizontal-tb') css['writing-mode'] = style.writingMode;
    if (style.fontVariationSettings) css['font-variation-settings'] = style.fontVariationSettings;
    if (style.fontFeatureSettings) css['font-feature-settings'] = style.fontFeatureSettings;
    if (style.columns) css.columns = String(style.columns);
    if (style.columnGap) css['column-gap'] = `${style.columnGap}px`;
    if (style.hyphens !== 'none') css.hyphens = style.hyphens;
    if (style.lineClamp) {
      css.display = '-webkit-box';
      css['-webkit-line-clamp'] = String(style.lineClamp);
      css['-webkit-box-orient'] = 'vertical';
      css.overflow = 'hidden';
    }
    if (style.tabSize !== 4) css['tab-size'] = String(style.tabSize);

    // Text shadows
    if (style.textShadow && style.textShadow.length > 0) {
      css['text-shadow'] = style.textShadow
        .map(s => `${s.x}px ${s.y}px ${s.blur}px ${s.color}`)
        .join(', ');
    }

    // Text stroke
    if (style.textStroke) {
      css['-webkit-text-stroke-width'] = `${style.textStroke.width}px`;
      css['-webkit-text-stroke-color'] = style.textStroke.color;
    }

    return css;
  }

  generateTypeScaleCSS(scaleName: string): string {
    const scale = this.typeScales.get(scaleName);
    if (!scale) return '';

    let css = `/* Type Scale: ${scale.name} */\n`;
    css += `/* Base: ${scale.baseSize}px, Ratio: ${scale.ratio} */\n\n`;

    for (const step of scale.steps) {
      css += `.text-${step.name} {\n`;
      css += `  font-size: ${step.size}px;\n`;
      css += `  line-height: ${step.lineHeight};\n`;
      css += `  font-weight: ${step.weight};\n`;
      if (step.letterSpacing !== 0) {
        css += `  letter-spacing: ${step.letterSpacing}em;\n`;
      }
      css += `}\n\n`;
    }

    return css;
  }

  generateResponsiveTypeCSS(scaleName: string, breakpoints: Record<string, number>): string {
    const scale = this.typeScales.get(scaleName);
    if (!scale) return '';

    let css = this.generateTypeScaleCSS(scaleName);

    const sortedBreakpoints = Object.entries(breakpoints).sort(([, a], [, b]) => a - b);

    for (const [bpName, bpWidth] of sortedBreakpoints) {
      const factor = bpWidth < 768 ? 0.85 : bpWidth < 1024 ? 0.95 : 1.0;
      css += `@media (min-width: ${bpWidth}px) {\n`;

      for (const step of scale.steps) {
        const adjustedSize = Math.round(step.size * factor * 100) / 100;
        css += `  .text-${step.name} { font-size: ${adjustedSize}px; }\n`;
      }

      css += `}\n\n`;
    }

    return css;
  }

  // ---------------------------------------------------------------------------
  // Text Utilities
  // ---------------------------------------------------------------------------

  calculateOptimalLineLength(fontSize: number, containerWidth: number): { min: number; optimal: number; max: number } {
    // Optimal line length is 45-75 characters
    const charWidth = fontSize * 0.5; // Approximate average character width
    return {
      min: Math.round(45 * charWidth),
      optimal: Math.round(65 * charWidth),
      max: Math.round(75 * charWidth),
    };
  }

  calculateVerticalRhythm(baseSize: number, baseLineHeight: number): VerticalRhythm {
    const baseline = baseSize * baseLineHeight;

    return {
      baseline,
      spacings: {
        xs: baseline * 0.25,
        sm: baseline * 0.5,
        md: baseline,
        lg: baseline * 1.5,
        xl: baseline * 2,
        '2xl': baseline * 3,
        '3xl': baseline * 4,
      },
      marginBottom: (fontSize: number, lineHeight: number) => {
        const textBaseline = fontSize * lineHeight;
        const lines = Math.ceil(textBaseline / baseline);
        return lines * baseline - textBaseline + baseline;
      },
    };
  }

  measureText(text: string, style: Partial<TextStyle>): TextMetrics | null {
    if (typeof document === 'undefined') return null;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const fullStyle = this.mergeWithDefaults(style);
    ctx.font = `${fullStyle.fontStyle} ${fullStyle.fontWeight} ${fullStyle.fontSize}px ${fullStyle.fontFamily}`;

    const metrics = ctx.measureText(text);
    return {
      width: metrics.width,
      height: fullStyle.fontSize * (typeof fullStyle.lineHeight === 'number' ? fullStyle.lineHeight : 1.5),
      actualBoundingBoxLeft: metrics.actualBoundingBoxLeft,
      actualBoundingBoxRight: metrics.actualBoundingBoxRight,
      actualBoundingBoxAscent: metrics.actualBoundingBoxAscent,
      actualBoundingBoxDescent: metrics.actualBoundingBoxDescent,
      fontBoundingBoxAscent: metrics.fontBoundingBoxAscent,
      fontBoundingBoxDescent: metrics.fontBoundingBoxDescent,
      alphabeticBaseline: metrics.alphabeticBaseline,
    } as TextMetrics;
  }

  truncateText(text: string, maxWidth: number, style: Partial<TextStyle>, suffix = '...'): string {
    if (typeof document === 'undefined') return text;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return text;

    const fullStyle = this.mergeWithDefaults(style);
    ctx.font = `${fullStyle.fontStyle} ${fullStyle.fontWeight} ${fullStyle.fontSize}px ${fullStyle.fontFamily}`;

    if (ctx.measureText(text).width <= maxWidth) return text;

    let truncated = text;
    while (truncated.length > 0 && ctx.measureText(truncated + suffix).width > maxWidth) {
      truncated = truncated.slice(0, -1);
    }

    return truncated + suffix;
  }

  // ---------------------------------------------------------------------------
  // OpenType Features
  // ---------------------------------------------------------------------------

  getOpenTypeFeatures(): OpenTypeFeature[] {
    return [...OPENTYPE_FEATURES];
  }

  generateFeatureSettings(features: Record<string, boolean>): string {
    const settings: string[] = [];
    for (const [tag, enabled] of Object.entries(features)) {
      settings.push(`"${tag}" ${enabled ? 1 : 0}`);
    }
    return settings.join(', ');
  }

  // ---------------------------------------------------------------------------
  // Variable Font Support
  // ---------------------------------------------------------------------------

  generateVariationSettings(axes: VariableFontAxis[]): string {
    return axes.map(a => `"${a.tag}" ${a.current}`).join(', ');
  }

  getStandardAxes(): VariableFontAxis[] {
    return [
      { tag: 'wght', name: 'Weight', min: 100, max: 900, default: 400, current: 400 },
      { tag: 'wdth', name: 'Width', min: 75, max: 125, default: 100, current: 100 },
      { tag: 'ital', name: 'Italic', min: 0, max: 1, default: 0, current: 0 },
      { tag: 'slnt', name: 'Slant', min: -15, max: 0, default: 0, current: 0 },
      { tag: 'opsz', name: 'Optical Size', min: 8, max: 144, default: 14, current: 14 },
      { tag: 'GRAD', name: 'Grade', min: -200, max: 150, default: 0, current: 0 },
      { tag: 'XTRA', name: 'Counter Width', min: 323, max: 603, default: 468, current: 468 },
      { tag: 'YOPQ', name: 'Thin Stroke', min: 25, max: 135, default: 79, current: 79 },
    ];
  }

  // ---------------------------------------------------------------------------
  // Text Effects
  // ---------------------------------------------------------------------------

  generateTextGradient(text: string, colors: string[], angle = 90): Record<string, string> {
    return {
      background: `linear-gradient(${angle}deg, ${colors.join(', ')})`,
      '-webkit-background-clip': 'text',
      '-webkit-text-fill-color': 'transparent',
      'background-clip': 'text',
    };
  }

  generateTextMask(imageUrl: string): Record<string, string> {
    return {
      'background-image': `url(${imageUrl})`,
      'background-size': 'cover',
      'background-position': 'center',
      '-webkit-background-clip': 'text',
      '-webkit-text-fill-color': 'transparent',
      'background-clip': 'text',
    };
  }

  generateTextGlow(color: string, size = 10): Record<string, string> {
    return {
      'text-shadow': `0 0 ${size}px ${color}, 0 0 ${size * 2}px ${color}, 0 0 ${size * 4}px ${color}`,
    };
  }

  generateEmbossedText(lightColor = '#ffffff', darkColor = '#000000'): Record<string, string> {
    return {
      'text-shadow': `1px 1px 0 ${lightColor}, -1px -1px 0 ${darkColor}`,
    };
  }

  generateOutlineText(color: string, width = 1): Record<string, string> {
    return {
      '-webkit-text-stroke-width': `${width}px`,
      '-webkit-text-stroke-color': color,
      color: 'transparent',
    };
  }

  generate3DText(color: string, depth = 5): Record<string, string> {
    const shadows: string[] = [];
    for (let i = 1; i <= depth; i++) {
      shadows.push(`${i}px ${i}px 0 ${color}`);
    }
    return { 'text-shadow': shadows.join(', ') };
  }

  generateRetroText(colors: string[] = ['#ff0000', '#00ff00', '#0000ff']): Record<string, string> {
    const shadows = colors.map((c, i) => `${(i + 1) * 2}px ${(i + 1) * 2}px 0 ${c}`);
    return { 'text-shadow': shadows.join(', ') };
  }

  generateNeonText(color: string): Record<string, string> {
    return {
      'text-shadow': `0 0 7px ${color}, 0 0 10px ${color}, 0 0 21px ${color}, 0 0 42px ${color}, 0 0 82px ${color}, 0 0 92px ${color}, 0 0 102px ${color}, 0 0 151px ${color}`,
    };
  }

  // ---------------------------------------------------------------------------
  // Export
  // ---------------------------------------------------------------------------

  exportAllCSS(): string {
    let css = '/* =============================== */\n';
    css += '/* Typography System Styles         */\n';
    css += '/* =============================== */\n\n';

    // Font faces
    for (const font of this.fonts.values()) {
      css += this.generateFontFaceCSS(font);
    }

    // Text styles
    for (const [name, style] of this.textStyles) {
      const cssProps = this.textStyleToCSS(style);
      css += `.${name.toLowerCase().replace(/\s+/g, '-')} {\n`;
      for (const [prop, value] of Object.entries(cssProps)) {
        css += `  ${prop}: ${value};\n`;
      }
      css += '}\n\n';
    }

    // Type scales
    for (const [name] of this.typeScales) {
      css += this.generateTypeScaleCSS(name);
    }

    return css;
  }

  exportConfig(): object {
    const fonts: Record<string, FontFamily> = {};
    for (const [name, font] of this.fonts) {
      fonts[name] = font;
    }

    const styles: Record<string, TextStyle> = {};
    for (const [name, style] of this.textStyles) {
      styles[name] = style;
    }

    return { fonts, styles, typeScales: Object.fromEntries(this.typeScales), fontPairings: this.fontPairings };
  }

  // ---------------------------------------------------------------------------
  // Private
  // ---------------------------------------------------------------------------

  private mergeWithDefaults(style: Partial<TextStyle>): TextStyle {
    return {
      fontFamily: 'Inter',
      fontSize: 16,
      fontWeight: 400,
      fontStyle: 'normal',
      lineHeight: 1.5,
      letterSpacing: 0,
      wordSpacing: 0,
      textAlign: 'left',
      textTransform: 'none',
      textDecoration: 'none',
      textIndent: 0,
      color: '#000000',
      opacity: 1,
      whiteSpace: 'normal',
      overflow: 'visible',
      direction: 'ltr',
      writingMode: 'horizontal-tb',
      hyphens: 'none',
      textOverflow: 'clip',
      tabSize: 4,
      unicodeBidi: 'normal',
      ...style,
    };
  }

  private initializeSystemFonts(): void {
    const systemFonts: FontFamily[] = [
      { name: 'system-ui', category: 'system-ui', variants: [{ weight: 400, style: 'normal' }, { weight: 700, style: 'normal' }], fallbacks: ['-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'], source: 'system', subsets: ['latin'] },
      { name: 'Arial', category: 'sans-serif', variants: [{ weight: 400, style: 'normal' }, { weight: 700, style: 'normal' }, { weight: 400, style: 'italic' }], fallbacks: ['Helvetica', 'sans-serif'], source: 'system', subsets: ['latin'] },
      { name: 'Helvetica', category: 'sans-serif', variants: [{ weight: 300, style: 'normal' }, { weight: 400, style: 'normal' }, { weight: 700, style: 'normal' }], fallbacks: ['Arial', 'sans-serif'], source: 'system', subsets: ['latin'] },
      { name: 'Georgia', category: 'serif', variants: [{ weight: 400, style: 'normal' }, { weight: 700, style: 'normal' }, { weight: 400, style: 'italic' }], fallbacks: ['Times New Roman', 'serif'], source: 'system', subsets: ['latin'] },
      { name: 'Times New Roman', category: 'serif', variants: [{ weight: 400, style: 'normal' }, { weight: 700, style: 'normal' }], fallbacks: ['Georgia', 'serif'], source: 'system', subsets: ['latin'] },
      { name: 'Courier New', category: 'monospace', variants: [{ weight: 400, style: 'normal' }, { weight: 700, style: 'normal' }], fallbacks: ['Courier', 'monospace'], source: 'system', subsets: ['latin'] },
      { name: 'Verdana', category: 'sans-serif', variants: [{ weight: 400, style: 'normal' }, { weight: 700, style: 'normal' }], fallbacks: ['Geneva', 'sans-serif'], source: 'system', subsets: ['latin'] },
      { name: 'Trebuchet MS', category: 'sans-serif', variants: [{ weight: 400, style: 'normal' }, { weight: 700, style: 'normal' }], fallbacks: ['sans-serif'], source: 'system', subsets: ['latin'] },
      { name: 'Impact', category: 'display', variants: [{ weight: 400, style: 'normal' }], fallbacks: ['Haettenschweiler', 'sans-serif'], source: 'system', subsets: ['latin'] },
      { name: 'Comic Sans MS', category: 'cursive', variants: [{ weight: 400, style: 'normal' }, { weight: 700, style: 'normal' }], fallbacks: ['cursive'], source: 'system', subsets: ['latin'] },
    ];

    for (const font of systemFonts) {
      this.fonts.set(font.name, font);
    }
  }

  private initializeDefaultStyles(): void {
    this.createTextStyle('Heading 1', { fontFamily: 'system-ui', fontSize: 48, fontWeight: 800, lineHeight: 1.2, letterSpacing: -0.02 });
    this.createTextStyle('Heading 2', { fontFamily: 'system-ui', fontSize: 36, fontWeight: 700, lineHeight: 1.25, letterSpacing: -0.015 });
    this.createTextStyle('Heading 3', { fontFamily: 'system-ui', fontSize: 30, fontWeight: 700, lineHeight: 1.3, letterSpacing: -0.01 });
    this.createTextStyle('Heading 4', { fontFamily: 'system-ui', fontSize: 24, fontWeight: 600, lineHeight: 1.35 });
    this.createTextStyle('Heading 5', { fontFamily: 'system-ui', fontSize: 20, fontWeight: 600, lineHeight: 1.4 });
    this.createTextStyle('Heading 6', { fontFamily: 'system-ui', fontSize: 18, fontWeight: 600, lineHeight: 1.4 });
    this.createTextStyle('Body Large', { fontFamily: 'system-ui', fontSize: 18, fontWeight: 400, lineHeight: 1.6 });
    this.createTextStyle('Body', { fontFamily: 'system-ui', fontSize: 16, fontWeight: 400, lineHeight: 1.5 });
    this.createTextStyle('Body Small', { fontFamily: 'system-ui', fontSize: 14, fontWeight: 400, lineHeight: 1.5 });
    this.createTextStyle('Caption', { fontFamily: 'system-ui', fontSize: 12, fontWeight: 400, lineHeight: 1.4, letterSpacing: 0.01 });
    this.createTextStyle('Overline', { fontFamily: 'system-ui', fontSize: 12, fontWeight: 600, lineHeight: 1.4, letterSpacing: 0.08, textTransform: 'uppercase' });
    this.createTextStyle('Subtitle', { fontFamily: 'system-ui', fontSize: 16, fontWeight: 500, lineHeight: 1.4, letterSpacing: 0.01, color: '#666666' });
    this.createTextStyle('Lead', { fontFamily: 'system-ui', fontSize: 20, fontWeight: 300, lineHeight: 1.6 });
    this.createTextStyle('Quote', { fontFamily: 'Georgia', fontSize: 20, fontWeight: 400, fontStyle: 'italic', lineHeight: 1.6 });
    this.createTextStyle('Code', { fontFamily: 'Courier New', fontSize: 14, fontWeight: 400, lineHeight: 1.6 });
    this.createTextStyle('Label', { fontFamily: 'system-ui', fontSize: 14, fontWeight: 500, lineHeight: 1.3, letterSpacing: 0.01 });
    this.createTextStyle('Button Text', { fontFamily: 'system-ui', fontSize: 14, fontWeight: 600, lineHeight: 1.2, letterSpacing: 0.03, textTransform: 'uppercase' });
  }

  private initializeFontPairings(): void {
    this.fontPairings = [
      { heading: 'Playfair Display', body: 'Source Sans Pro', description: 'Elegant serif with clean sans-serif', mood: 'elegant' },
      { heading: 'Montserrat', body: 'Open Sans', description: 'Modern geometric with humanist', mood: 'modern' },
      { heading: 'Raleway', body: 'Lato', description: 'Thin elegance with friendly body', mood: 'clean' },
      { heading: 'Oswald', body: 'Roboto', description: 'Bold condensed with neutral body', mood: 'bold' },
      { heading: 'Libre Baskerville', body: 'Montserrat', description: 'Classic serif with modern sans', mood: 'classic' },
      { heading: 'Poppins', body: 'Inter', description: 'Geometric with modern neutral', mood: 'contemporary' },
      { heading: 'Merriweather', body: 'Roboto', description: 'Readable serif with neutral sans', mood: 'readable' },
      { heading: 'DM Serif Display', body: 'DM Sans', description: 'Matching serif and sans pair', mood: 'harmonious' },
      { heading: 'Space Grotesk', body: 'Space Mono', description: 'Tech-forward proportional and mono', mood: 'tech' },
      { heading: 'Fraunces', body: 'Commissioner', description: 'Variable serif with variable sans', mood: 'dynamic' },
      { heading: 'Sora', body: 'Inter', description: 'Geometric heading with versatile body', mood: 'minimal' },
      { heading: 'Clash Display', body: 'Satoshi', description: 'Bold display with clean body', mood: 'striking' },
    ];
  }

  private emit(event: string, data: unknown): void {
    const handlers = this.listeners.get(event);
    if (handlers) handlers.forEach(h => { try { h(data); } catch (e) { console.error(e); } });
  }

  on(event: string, handler: (data: unknown) => void): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push(handler);
    return () => {
      const handlers = this.listeners.get(event);
      if (handlers) {
        const idx = handlers.indexOf(handler);
        if (idx >= 0) handlers.splice(idx, 1);
      }
    };
  }
}

// =============================================================================
// Types
// =============================================================================

export interface FontPairing {
  heading: string;
  body: string;
  description: string;
  mood: string;
}

export interface VerticalRhythm {
  baseline: number;
  spacings: Record<string, number>;
  marginBottom: (fontSize: number, lineHeight: number) => number;
}

export interface TextMetrics {
  width: number;
  height: number;
  actualBoundingBoxLeft: number;
  actualBoundingBoxRight: number;
  actualBoundingBoxAscent: number;
  actualBoundingBoxDescent: number;
  fontBoundingBoxAscent: number;
  fontBoundingBoxDescent: number;
  alphabeticBaseline: number;
}

// =============================================================================
// Google Fonts Catalog (Popular Fonts)
// =============================================================================

export const POPULAR_GOOGLE_FONTS: Array<{ name: string; category: FontCategory; popularity: number }> = [
  { name: 'Roboto', category: 'sans-serif', popularity: 1 },
  { name: 'Open Sans', category: 'sans-serif', popularity: 2 },
  { name: 'Noto Sans', category: 'sans-serif', popularity: 3 },
  { name: 'Montserrat', category: 'sans-serif', popularity: 4 },
  { name: 'Lato', category: 'sans-serif', popularity: 5 },
  { name: 'Poppins', category: 'sans-serif', popularity: 6 },
  { name: 'Inter', category: 'sans-serif', popularity: 7 },
  { name: 'Roboto Condensed', category: 'sans-serif', popularity: 8 },
  { name: 'Source Sans Pro', category: 'sans-serif', popularity: 9 },
  { name: 'Oswald', category: 'sans-serif', popularity: 10 },
  { name: 'Raleway', category: 'sans-serif', popularity: 11 },
  { name: 'Nunito', category: 'sans-serif', popularity: 12 },
  { name: 'Ubuntu', category: 'sans-serif', popularity: 13 },
  { name: 'Playfair Display', category: 'serif', popularity: 14 },
  { name: 'Merriweather', category: 'serif', popularity: 15 },
  { name: 'PT Sans', category: 'sans-serif', popularity: 16 },
  { name: 'Rubik', category: 'sans-serif', popularity: 17 },
  { name: 'Work Sans', category: 'sans-serif', popularity: 18 },
  { name: 'Roboto Mono', category: 'monospace', popularity: 19 },
  { name: 'Fira Code', category: 'monospace', popularity: 20 },
  { name: 'Lora', category: 'serif', popularity: 21 },
  { name: 'Libre Baskerville', category: 'serif', popularity: 22 },
  { name: 'DM Sans', category: 'sans-serif', popularity: 23 },
  { name: 'Space Grotesk', category: 'sans-serif', popularity: 24 },
  { name: 'JetBrains Mono', category: 'monospace', popularity: 25 },
  { name: 'Barlow', category: 'sans-serif', popularity: 26 },
  { name: 'Manrope', category: 'sans-serif', popularity: 27 },
  { name: 'Sora', category: 'sans-serif', popularity: 28 },
  { name: 'Plus Jakarta Sans', category: 'sans-serif', popularity: 29 },
  { name: 'Cabin', category: 'sans-serif', popularity: 30 },
];

// =============================================================================
// Singleton Instance
// =============================================================================

export const typographyEngine = new TypographyEngine();
