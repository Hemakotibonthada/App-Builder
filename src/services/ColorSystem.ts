// =============================================================================
// Color System - Advanced color manipulation, palettes, and accessibility
// Features: Color math, palette generation, contrast checks, color spaces,
//           gradient builder, color blindness simulation, harmony algorithms
// =============================================================================

// =============================================================================
// Color Types
// =============================================================================

export interface RGBColor {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
  a: number; // 0-1
}

export interface HSLColor {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
  a: number; // 0-1
}

export interface HSVColor {
  h: number; // 0-360
  s: number; // 0-100
  v: number; // 0-100
  a: number; // 0-1
}

export interface HSBColor {
  h: number;
  s: number;
  b: number;
  a: number;
}

export interface LABColor {
  l: number; // 0-100
  a: number; // -128 to 127
  b: number; // -128 to 127
  alpha: number;
}

export interface LCHColor {
  l: number;
  c: number;
  h: number;
  a: number;
}

export interface CMYKColor {
  c: number; // 0-100
  m: number; // 0-100
  y: number; // 0-100
  k: number; // 0-100
}

export interface XYZColor {
  x: number;
  y: number;
  z: number;
}

export type ColorFormat = 'hex' | 'hex8' | 'rgb' | 'rgba' | 'hsl' | 'hsla' | 'hsv' | 'hsb' | 'lab' | 'lch' | 'cmyk' | 'xyz' | 'named';

// =============================================================================
// Color Class
// =============================================================================

export class Color {
  private _r: number;
  private _g: number;
  private _b: number;
  private _a: number;

  constructor(r = 0, g = 0, b = 0, a = 1) {
    this._r = Math.max(0, Math.min(255, Math.round(r)));
    this._g = Math.max(0, Math.min(255, Math.round(g)));
    this._b = Math.max(0, Math.min(255, Math.round(b)));
    this._a = Math.max(0, Math.min(1, a));
  }

  // Static constructors
  static fromHex(hex: string): Color {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length === 4) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    }
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const a = hex.length === 8 ? parseInt(hex.substring(6, 8), 16) / 255 : 1;
    return new Color(r, g, b, a);
  }

  static fromRGB(r: number, g: number, b: number, a = 1): Color {
    return new Color(r, g, b, a);
  }

  static fromHSL(h: number, s: number, l: number, a = 1): Color {
    h = ((h % 360) + 360) % 360;
    s = Math.max(0, Math.min(100, s)) / 100;
    l = Math.max(0, Math.min(100, l)) / 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;

    let r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; }
    else if (h < 120) { r = x; g = c; }
    else if (h < 180) { g = c; b = x; }
    else if (h < 240) { g = x; b = c; }
    else if (h < 300) { r = x; b = c; }
    else { r = c; b = x; }

    return new Color((r + m) * 255, (g + m) * 255, (b + m) * 255, a);
  }

  static fromHSV(h: number, s: number, v: number, a = 1): Color {
    h = ((h % 360) + 360) % 360;
    s = Math.max(0, Math.min(100, s)) / 100;
    v = Math.max(0, Math.min(100, v)) / 100;

    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;

    let r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; }
    else if (h < 120) { r = x; g = c; }
    else if (h < 180) { g = c; b = x; }
    else if (h < 240) { g = x; b = c; }
    else if (h < 300) { r = x; b = c; }
    else { r = c; b = x; }

    return new Color((r + m) * 255, (g + m) * 255, (b + m) * 255, a);
  }

  static fromLAB(l: number, a: number, b: number, alpha = 1): Color {
    // LAB to XYZ
    let y = (l + 16) / 116;
    let x = a / 500 + y;
    let z = y - b / 200;

    const y3 = y * y * y;
    const x3 = x * x * x;
    const z3 = z * z * z;

    y = y3 > 0.008856 ? y3 : (y - 16 / 116) / 7.787;
    x = x3 > 0.008856 ? x3 : (x - 16 / 116) / 7.787;
    z = z3 > 0.008856 ? z3 : (z - 16 / 116) / 7.787;

    // D65 reference white
    x *= 95.047;
    y *= 100.0;
    z *= 108.883;

    // XYZ to RGB
    let r = x * 3.2406 + y * -1.5372 + z * -0.4986;
    let g = x * -0.9689 + y * 1.8758 + z * 0.0415;
    let bVal = x * 0.0557 + y * -0.2040 + z * 1.0570;

    r = r > 0.0031308 ? 1.055 * Math.pow(r / 100, 1 / 2.4) - 0.055 : 12.92 * (r / 100);
    g = g > 0.0031308 ? 1.055 * Math.pow(g / 100, 1 / 2.4) - 0.055 : 12.92 * (g / 100);
    bVal = bVal > 0.0031308 ? 1.055 * Math.pow(bVal / 100, 1 / 2.4) - 0.055 : 12.92 * (bVal / 100);

    return new Color(r * 255, g * 255, bVal * 255, alpha);
  }

  static fromCMYK(c: number, m: number, y: number, k: number): Color {
    c = c / 100;
    m = m / 100;
    y = y / 100;
    k = k / 100;

    const r = 255 * (1 - c) * (1 - k);
    const g = 255 * (1 - m) * (1 - k);
    const b = 255 * (1 - y) * (1 - k);

    return new Color(r, g, b);
  }

  static fromString(str: string): Color | null {
    str = str.trim().toLowerCase();

    // Check named colors
    const named = NAMED_COLORS[str];
    if (named) return Color.fromHex(named);

    // Hex format
    if (str.startsWith('#')) return Color.fromHex(str);

    // RGB/RGBA format
    const rgbMatch = str.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/);
    if (rgbMatch) {
      return new Color(
        parseInt(rgbMatch[1]),
        parseInt(rgbMatch[2]),
        parseInt(rgbMatch[3]),
        rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1
      );
    }

    // HSL/HSLA format
    const hslMatch = str.match(/hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%?\s*,\s*([\d.]+)%?\s*(?:,\s*([\d.]+))?\s*\)/);
    if (hslMatch) {
      return Color.fromHSL(
        parseFloat(hslMatch[1]),
        parseFloat(hslMatch[2]),
        parseFloat(hslMatch[3]),
        hslMatch[4] ? parseFloat(hslMatch[4]) : 1
      );
    }

    return null;
  }

  static random(): Color {
    return new Color(
      Math.floor(Math.random() * 256),
      Math.floor(Math.random() * 256),
      Math.floor(Math.random() * 256)
    );
  }

  // Getters
  get r(): number { return this._r; }
  get g(): number { return this._g; }
  get b(): number { return this._b; }
  get a(): number { return this._a; }

  // Conversion methods
  toRGB(): RGBColor {
    return { r: this._r, g: this._g, b: this._b, a: this._a };
  }

  toHSL(): HSLColor {
    const r = this._r / 255;
    const g = this._g / 255;
    const b = this._b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    let h = 0;
    let s = 0;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      else if (max === g) h = ((b - r) / d + 2) / 6;
      else h = ((r - g) / d + 4) / 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
      a: this._a,
    };
  }

  toHSV(): HSVColor {
    const r = this._r / 255;
    const g = this._g / 255;
    const b = this._b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    let h = 0;
    const s = max === 0 ? 0 : d / max;

    if (max !== min) {
      if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      else if (max === g) h = ((b - r) / d + 2) / 6;
      else h = ((r - g) / d + 4) / 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      v: Math.round(max * 100),
      a: this._a,
    };
  }

  toLAB(): LABColor {
    // RGB to XYZ
    let r = this._r / 255;
    let g = this._g / 255;
    let b = this._b / 255;

    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

    r *= 100;
    g *= 100;
    b *= 100;

    let x = r * 0.4124 + g * 0.3576 + b * 0.1805;
    let y = r * 0.2126 + g * 0.7152 + b * 0.0722;
    let z = r * 0.0193 + g * 0.1192 + b * 0.9505;

    // D65 reference white
    x /= 95.047;
    y /= 100.0;
    z /= 108.883;

    x = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
    y = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
    z = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;

    return {
      l: 116 * y - 16,
      a: 500 * (x - y),
      b: 200 * (y - z),
      alpha: this._a,
    };
  }

  toLCH(): LCHColor {
    const lab = this.toLAB();
    const c = Math.sqrt(lab.a * lab.a + lab.b * lab.b);
    let h = Math.atan2(lab.b, lab.a) * (180 / Math.PI);
    if (h < 0) h += 360;

    return { l: lab.l, c, h, a: this._a };
  }

  toCMYK(): CMYKColor {
    const r = this._r / 255;
    const g = this._g / 255;
    const b = this._b / 255;

    const k = 1 - Math.max(r, g, b);
    if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };

    return {
      c: Math.round(((1 - r - k) / (1 - k)) * 100),
      m: Math.round(((1 - g - k) / (1 - k)) * 100),
      y: Math.round(((1 - b - k) / (1 - k)) * 100),
      k: Math.round(k * 100),
    };
  }

  toXYZ(): XYZColor {
    let r = this._r / 255;
    let g = this._g / 255;
    let b = this._b / 255;

    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

    return {
      x: r * 0.4124564 + g * 0.3575761 + b * 0.1804375,
      y: r * 0.2126729 + g * 0.7151522 + b * 0.0721750,
      z: r * 0.0193339 + g * 0.1191920 + b * 0.9503041,
    };
  }

  toHex(): string {
    const r = this._r.toString(16).padStart(2, '0');
    const g = this._g.toString(16).padStart(2, '0');
    const b = this._b.toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }

  toHex8(): string {
    const a = Math.round(this._a * 255).toString(16).padStart(2, '0');
    return `${this.toHex()}${a}`;
  }

  toRGBString(): string {
    if (this._a < 1) {
      return `rgba(${this._r}, ${this._g}, ${this._b}, ${this._a})`;
    }
    return `rgb(${this._r}, ${this._g}, ${this._b})`;
  }

  toHSLString(): string {
    const hsl = this.toHSL();
    if (this._a < 1) {
      return `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${this._a})`;
    }
    return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
  }

  toString(format: ColorFormat = 'hex'): string {
    switch (format) {
      case 'hex': return this.toHex();
      case 'hex8': return this.toHex8();
      case 'rgb':
      case 'rgba': return this.toRGBString();
      case 'hsl':
      case 'hsla': return this.toHSLString();
      case 'hsv': {
        const hsv = this.toHSV();
        return `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`;
      }
      case 'lab': {
        const lab = this.toLAB();
        return `lab(${lab.l.toFixed(1)}, ${lab.a.toFixed(1)}, ${lab.b.toFixed(1)})`;
      }
      case 'cmyk': {
        const cmyk = this.toCMYK();
        return `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`;
      }
      default: return this.toHex();
    }
  }

  // Manipulation methods
  lighten(amount: number): Color {
    const hsl = this.toHSL();
    return Color.fromHSL(hsl.h, hsl.s, Math.min(100, hsl.l + amount), this._a);
  }

  darken(amount: number): Color {
    const hsl = this.toHSL();
    return Color.fromHSL(hsl.h, hsl.s, Math.max(0, hsl.l - amount), this._a);
  }

  saturate(amount: number): Color {
    const hsl = this.toHSL();
    return Color.fromHSL(hsl.h, Math.min(100, hsl.s + amount), hsl.l, this._a);
  }

  desaturate(amount: number): Color {
    const hsl = this.toHSL();
    return Color.fromHSL(hsl.h, Math.max(0, hsl.s - amount), hsl.l, this._a);
  }

  rotate(degrees: number): Color {
    const hsl = this.toHSL();
    return Color.fromHSL((hsl.h + degrees) % 360, hsl.s, hsl.l, this._a);
  }

  complement(): Color {
    return this.rotate(180);
  }

  grayscale(): Color {
    const gray = Math.round(this._r * 0.299 + this._g * 0.587 + this._b * 0.114);
    return new Color(gray, gray, gray, this._a);
  }

  invert(): Color {
    return new Color(255 - this._r, 255 - this._g, 255 - this._b, this._a);
  }

  setAlpha(alpha: number): Color {
    return new Color(this._r, this._g, this._b, alpha);
  }

  mix(other: Color, weight = 0.5): Color {
    const w = Math.max(0, Math.min(1, weight));
    return new Color(
      Math.round(this._r * (1 - w) + other._r * w),
      Math.round(this._g * (1 - w) + other._g * w),
      Math.round(this._b * (1 - w) + other._b * w),
      this._a * (1 - w) + other._a * w
    );
  }

  tint(amount: number): Color {
    return this.mix(new Color(255, 255, 255), amount / 100);
  }

  shade(amount: number): Color {
    return this.mix(new Color(0, 0, 0), amount / 100);
  }

  tone(amount: number): Color {
    return this.mix(new Color(128, 128, 128), amount / 100);
  }

  adjustHue(amount: number): Color {
    return this.rotate(amount);
  }

  warmth(amount: number): Color {
    const warm = new Color(
      Math.min(255, this._r + amount),
      this._g,
      Math.max(0, this._b - amount),
      this._a
    );
    return warm;
  }

  cool(amount: number): Color {
    return new Color(
      Math.max(0, this._r - amount),
      this._g,
      Math.min(255, this._b + amount),
      this._a
    );
  }

  // Analysis methods
  luminance(): number {
    const r = this._r / 255;
    const g = this._g / 255;
    const b = this._b / 255;

    const rLin = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    const gLin = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
    const bLin = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

    return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
  }

  brightness(): number {
    return (this._r * 299 + this._g * 587 + this._b * 114) / 1000;
  }

  isLight(): boolean {
    return this.brightness() > 128;
  }

  isDark(): boolean {
    return this.brightness() <= 128;
  }

  contrastRatio(other: Color): number {
    const l1 = Math.max(this.luminance(), other.luminance());
    const l2 = Math.min(this.luminance(), other.luminance());
    return (l1 + 0.05) / (l2 + 0.05);
  }

  meetsWCAG(other: Color, level: 'AA' | 'AAA' = 'AA', size: 'normal' | 'large' = 'normal'): boolean {
    const ratio = this.contrastRatio(other);
    if (level === 'AAA') {
      return size === 'large' ? ratio >= 4.5 : ratio >= 7;
    }
    return size === 'large' ? ratio >= 3 : ratio >= 4.5;
  }

  // Distance
  deltaE(other: Color): number {
    const lab1 = this.toLAB();
    const lab2 = other.toLAB();
    return Math.sqrt(
      Math.pow(lab1.l - lab2.l, 2) +
      Math.pow(lab1.a - lab2.a, 2) +
      Math.pow(lab1.b - lab2.b, 2)
    );
  }

  equals(other: Color): boolean {
    return this._r === other._r && this._g === other._g && this._b === other._b && this._a === other._a;
  }

  clone(): Color {
    return new Color(this._r, this._g, this._b, this._a);
  }
}

// =============================================================================
// Color System Manager
// =============================================================================

export class ColorSystem {
  private palettes: Map<string, ColorPalette> = new Map();
  private variables: Map<string, Color> = new Map();
  private history: Color[] = [];
  private maxHistory = 100;

  // ===========================================================================
  // Harmony Generation
  // ===========================================================================

  complementary(base: Color): Color[] {
    return [base, base.complement()];
  }

  analogous(base: Color, angle = 30): Color[] {
    return [base.rotate(-angle), base, base.rotate(angle)];
  }

  triadic(base: Color): Color[] {
    return [base, base.rotate(120), base.rotate(240)];
  }

  tetradic(base: Color): Color[] {
    return [base, base.rotate(90), base.rotate(180), base.rotate(270)];
  }

  splitComplementary(base: Color, angle = 30): Color[] {
    return [base, base.rotate(180 - angle), base.rotate(180 + angle)];
  }

  doubleSplitComplementary(base: Color, angle = 30): Color[] {
    return [
      base,
      base.rotate(angle),
      base.rotate(180 - angle),
      base.rotate(180 + angle),
    ];
  }

  square(base: Color): Color[] {
    return [base, base.rotate(90), base.rotate(180), base.rotate(270)];
  }

  monochromatic(base: Color, count = 5): Color[] {
    const result: Color[] = [];
    const hsl = base.toHSL();
    const step = 100 / (count + 1);

    for (let i = 1; i <= count; i++) {
      result.push(Color.fromHSL(hsl.h, hsl.s, step * i, hsl.a));
    }
    return result;
  }

  shades(base: Color, count = 10): Color[] {
    const result: Color[] = [];
    for (let i = 0; i < count; i++) {
      result.push(base.shade((i / (count - 1)) * 100));
    }
    return result;
  }

  tints(base: Color, count = 10): Color[] {
    const result: Color[] = [];
    for (let i = 0; i < count; i++) {
      result.push(base.tint((i / (count - 1)) * 100));
    }
    return result;
  }

  tones(base: Color, count = 10): Color[] {
    const result: Color[] = [];
    for (let i = 0; i < count; i++) {
      result.push(base.tone((i / (count - 1)) * 100));
    }
    return result;
  }

  // ===========================================================================
  // Palette Generation
  // ===========================================================================

  generateMaterialPalette(base: Color): ColorPalette {
    const hsl = base.toHSL();
    const shades: Record<string, Color> = {};

    const weights = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
    const lightnesses = [95, 90, 80, 70, 60, 50, 40, 30, 20, 10];

    for (let i = 0; i < weights.length; i++) {
      shades[String(weights[i])] = Color.fromHSL(hsl.h, hsl.s, lightnesses[i], 1);
    }

    // Accent shades
    const accentWeights = ['A100', 'A200', 'A400', 'A700'];
    const accentData = [
      { l: 85, s: Math.min(100, hsl.s + 20) },
      { l: 70, s: Math.min(100, hsl.s + 30) },
      { l: 55, s: Math.min(100, hsl.s + 40) },
      { l: 40, s: Math.min(100, hsl.s + 50) },
    ];

    for (let i = 0; i < accentWeights.length; i++) {
      shades[accentWeights[i]] = Color.fromHSL(hsl.h, accentData[i].s, accentData[i].l, 1);
    }

    return {
      name: `Material ${base.toHex()}`,
      description: 'Material Design palette',
      colors: shades,
      base: base.toHex(),
      type: 'material',
    };
  }

  generateTailwindPalette(base: Color): ColorPalette {
    const hsl = base.toHSL();
    const shades: Record<string, Color> = {};

    const weights = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
    const lightnesses = [97, 93, 85, 75, 62, 50, 42, 35, 25, 18, 10];

    for (let i = 0; i < weights.length; i++) {
      const satAdjust = i > 5 ? (i - 5) * 3 : 0;
      shades[String(weights[i])] = Color.fromHSL(
        hsl.h,
        Math.min(100, hsl.s + satAdjust),
        lightnesses[i],
        1
      );
    }

    return {
      name: `Tailwind ${base.toHex()}`,
      description: 'Tailwind CSS palette',
      colors: shades,
      base: base.toHex(),
      type: 'tailwind',
    };
  }

  generateAccessiblePalette(base: Color, bgColor: Color = new Color(255, 255, 255)): ColorPalette {
    const shades: Record<string, Color> = {};
    const hsl = base.toHSL();
    const labels = ['lightest', 'lighter', 'light', 'base', 'dark', 'darker', 'darkest'];
    const lightnesses = [90, 80, 65, 50, 35, 25, 15];

    for (let i = 0; i < labels.length; i++) {
      let color = Color.fromHSL(hsl.h, hsl.s, lightnesses[i], 1);
      
      // Ensure at least AA contrast with background
      let attempts = 0;
      while (color.contrastRatio(bgColor) < 4.5 && attempts < 20) {
        if (bgColor.isLight()) {
          color = color.darken(2);
        } else {
          color = color.lighten(2);
        }
        attempts++;
      }
      shades[labels[i]] = color;
    }

    return {
      name: `Accessible ${base.toHex()}`,
      description: 'WCAG AA compliant palette',
      colors: shades,
      base: base.toHex(),
      type: 'accessible',
    };
  }

  generateGradientPalette(startColor: Color, endColor: Color, steps = 10): ColorPalette {
    const shades: Record<string, Color> = {};

    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      shades[String(i)] = startColor.mix(endColor, t);
    }

    return {
      name: `Gradient ${startColor.toHex()} → ${endColor.toHex()}`,
      description: 'Gradient-based palette',
      colors: shades,
      base: startColor.toHex(),
      type: 'gradient',
    };
  }

  generateNaturePalette(theme: 'ocean' | 'forest' | 'sunset' | 'desert' | 'arctic' | 'volcanic' | 'meadow' | 'autumn'): ColorPalette {
    const themes: Record<string, string[]> = {
      ocean: ['#006994', '#0099CC', '#33CCFF', '#66D9FF', '#99E6FF', '#CCF2FF', '#004466', '#002233'],
      forest: ['#228B22', '#006400', '#32CD32', '#90EE90', '#556B2F', '#8FBC8F', '#2E8B57', '#3CB371'],
      sunset: ['#FF6B35', '#FF8C42', '#FFD166', '#FF4E50', '#FC913A', '#F9D423', '#E94560', '#533483'],
      desert: ['#EDC9AF', '#D2691E', '#DEB887', '#F4A460', '#CD853F', '#A0522D', '#8B4513', '#C4A882'],
      arctic: ['#E8F4FD', '#B3D9F2', '#7FC4E6', '#4AAFDB', '#1A9ACF', '#0085C3', '#006FA6', '#005A8A'],
      volcanic: ['#1A1A2E', '#16213E', '#0F3460', '#E94560', '#FF6B6B', '#FFE66D', '#A12568', '#4A0E0E'],
      meadow: ['#7CB342', '#8BC34A', '#9CCC65', '#AED581', '#C5E1A5', '#DCEDC8', '#558B2F', '#33691E'],
      autumn: ['#D4381E', '#E65100', '#FF8F00', '#FFB300', '#8D6E63', '#795548', '#4E342E', '#BF360C'],
    };

    const hexColors = themes[theme] || themes.ocean;
    const shades: Record<string, Color> = {};

    hexColors.forEach((hex, i) => {
      shades[String(i)] = Color.fromHex(hex);
    });

    return {
      name: `Nature: ${theme}`,
      description: `Colors inspired by ${theme}`,
      colors: shades,
      base: hexColors[0],
      type: 'nature',
    };
  }

  // ===========================================================================
  // Color Blindness Simulation
  // ===========================================================================

  simulateColorBlindness(color: Color, type: ColorBlindnessType): Color {
    const r = color.r / 255;
    const g = color.g / 255;
    const b = color.b / 255;

    const matrices: Record<ColorBlindnessType, number[][]> = {
      protanopia: [
        [0.567, 0.433, 0.000],
        [0.558, 0.442, 0.000],
        [0.000, 0.242, 0.758],
      ],
      deuteranopia: [
        [0.625, 0.375, 0.000],
        [0.700, 0.300, 0.000],
        [0.000, 0.300, 0.700],
      ],
      tritanopia: [
        [0.950, 0.050, 0.000],
        [0.000, 0.433, 0.567],
        [0.000, 0.475, 0.525],
      ],
      protanomaly: [
        [0.817, 0.183, 0.000],
        [0.333, 0.667, 0.000],
        [0.000, 0.125, 0.875],
      ],
      deuteranomaly: [
        [0.800, 0.200, 0.000],
        [0.258, 0.742, 0.000],
        [0.000, 0.142, 0.858],
      ],
      tritanomaly: [
        [0.967, 0.033, 0.000],
        [0.000, 0.733, 0.267],
        [0.000, 0.183, 0.817],
      ],
      achromatopsia: [
        [0.299, 0.587, 0.114],
        [0.299, 0.587, 0.114],
        [0.299, 0.587, 0.114],
      ],
      achromatomaly: [
        [0.618, 0.320, 0.062],
        [0.163, 0.775, 0.062],
        [0.163, 0.320, 0.516],
      ],
    };

    const m = matrices[type];
    const newR = m[0][0] * r + m[0][1] * g + m[0][2] * b;
    const newG = m[1][0] * r + m[1][1] * g + m[1][2] * b;
    const newB = m[2][0] * r + m[2][1] * g + m[2][2] * b;

    return new Color(newR * 255, newG * 255, newB * 255, color.a);
  }

  simulatePaletteBlindness(palette: Color[], type: ColorBlindnessType): Color[] {
    return palette.map(c => this.simulateColorBlindness(c, type));
  }

  // ===========================================================================
  // Gradient Builder
  // ===========================================================================

  buildLinearGradient(stops: GradientStop[], angle = 180): string {
    const sortedStops = [...stops].sort((a, b) => a.position - b.position);
    const stopsCSS = sortedStops.map(s => `${s.color.toRGBString()} ${s.position}%`).join(', ');
    return `linear-gradient(${angle}deg, ${stopsCSS})`;
  }

  buildRadialGradient(stops: GradientStop[], shape: 'circle' | 'ellipse' = 'circle', position = 'center'): string {
    const sortedStops = [...stops].sort((a, b) => a.position - b.position);
    const stopsCSS = sortedStops.map(s => `${s.color.toRGBString()} ${s.position}%`).join(', ');
    return `radial-gradient(${shape} at ${position}, ${stopsCSS})`;
  }

  buildConicGradient(stops: GradientStop[], from = 0, position = 'center'): string {
    const sortedStops = [...stops].sort((a, b) => a.position - b.position);
    const stopsCSS = sortedStops.map(s => `${s.color.toRGBString()} ${s.position}%`).join(', ');
    return `conic-gradient(from ${from}deg at ${position}, ${stopsCSS})`;
  }

  generateMeshGradient(colors: Color[], rows = 2, cols = 2): string {
    const gradients: string[] = [];
    const cellWidth = 100 / cols;
    const cellHeight = 100 / rows;

    for (let i = 0; i < Math.min(colors.length, rows * cols); i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const x = col * cellWidth + cellWidth / 2;
      const y = row * cellHeight + cellHeight / 2;

      gradients.push(
        `radial-gradient(at ${x}% ${y}%, ${colors[i].setAlpha(0.8).toRGBString()} 0px, transparent 50%)`
      );
    }

    return gradients.join(', ');
  }

  interpolateGradient(start: Color, end: Color, steps: number, mode: 'rgb' | 'hsl' | 'lab' = 'rgb'): Color[] {
    const result: Color[] = [];

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;

      switch (mode) {
        case 'rgb':
          result.push(start.mix(end, t));
          break;
        case 'hsl': {
          const hsl1 = start.toHSL();
          const hsl2 = end.toHSL();
          let hDiff = hsl2.h - hsl1.h;
          if (Math.abs(hDiff) > 180) {
            hDiff = hDiff > 0 ? hDiff - 360 : hDiff + 360;
          }
          const h = hsl1.h + hDiff * t;
          const s = hsl1.s + (hsl2.s - hsl1.s) * t;
          const l = hsl1.l + (hsl2.l - hsl1.l) * t;
          result.push(Color.fromHSL(h, s, l));
          break;
        }
        case 'lab': {
          const lab1 = start.toLAB();
          const lab2 = end.toLAB();
          const l = lab1.l + (lab2.l - lab1.l) * t;
          const a = lab1.a + (lab2.a - lab1.a) * t;
          const b = lab1.b + (lab2.b - lab1.b) * t;
          result.push(Color.fromLAB(l, a, b));
          break;
        }
      }
    }

    return result;
  }

  // ===========================================================================
  // Palette Management
  // ===========================================================================

  savePalette(palette: ColorPalette): void {
    this.palettes.set(palette.name, palette);
  }

  getPalette(name: string): ColorPalette | undefined {
    return this.palettes.get(name);
  }

  deletePalette(name: string): boolean {
    return this.palettes.delete(name);
  }

  getAllPalettes(): ColorPalette[] {
    return Array.from(this.palettes.values());
  }

  // Color Variables
  setVariable(name: string, color: Color): void {
    this.variables.set(name, color);
  }

  getVariable(name: string): Color | undefined {
    return this.variables.get(name);
  }

  getAllVariables(): Map<string, Color> {
    return new Map(this.variables);
  }

  generateCSSVariables(): string {
    let css = ':root {\n';
    for (const [name, color] of this.variables) {
      css += `  --color-${name}: ${color.toHex()};\n`;
      css += `  --color-${name}-rgb: ${color.r}, ${color.g}, ${color.b};\n`;
    }
    css += '}\n';
    return css;
  }

  generateSCSSVariables(): string {
    let scss = '';
    for (const [name, color] of this.variables) {
      scss += `$color-${name}: ${color.toHex()};\n`;
    }
    return scss;
  }

  // History
  addToHistory(color: Color): void {
    this.history.unshift(color);
    if (this.history.length > this.maxHistory) {
      this.history.pop();
    }
  }

  getHistory(): Color[] {
    return [...this.history];
  }

  clearHistory(): void {
    this.history = [];
  }

  // ===========================================================================
  // Color Extraction & Analysis
  // ===========================================================================

  extractDominantColors(imageData: Uint8ClampedArray, width: number, height: number, count = 5): Color[] {
    // Simple k-means color quantization
    const pixels: Array<[number, number, number]> = [];
    const step = Math.max(1, Math.floor((width * height) / 10000));

    for (let i = 0; i < imageData.length; i += 4 * step) {
      if (imageData[i + 3] > 128) { // Skip transparent pixels
        pixels.push([imageData[i], imageData[i + 1], imageData[i + 2]]);
      }
    }

    if (pixels.length === 0) return [];

    // Initialize centroids randomly
    const centroids: Array<[number, number, number]> = [];
    const usedIndices = new Set<number>();
    for (let i = 0; i < Math.min(count, pixels.length); i++) {
      let idx: number;
      do {
        idx = Math.floor(Math.random() * pixels.length);
      } while (usedIndices.has(idx));
      usedIndices.add(idx);
      centroids.push([...pixels[idx]]);
    }

    // K-means iterations
    for (let iter = 0; iter < 20; iter++) {
      const clusters: Array<Array<[number, number, number]>> = centroids.map(() => []);

      for (const pixel of pixels) {
        let minDist = Infinity;
        let closest = 0;
        for (let c = 0; c < centroids.length; c++) {
          const dist = Math.pow(pixel[0] - centroids[c][0], 2) +
                      Math.pow(pixel[1] - centroids[c][1], 2) +
                      Math.pow(pixel[2] - centroids[c][2], 2);
          if (dist < minDist) {
            minDist = dist;
            closest = c;
          }
        }
        clusters[closest].push(pixel);
      }

      let changed = false;
      for (let c = 0; c < centroids.length; c++) {
        if (clusters[c].length === 0) continue;
        const avg: [number, number, number] = [0, 0, 0];
        for (const p of clusters[c]) {
          avg[0] += p[0];
          avg[1] += p[1];
          avg[2] += p[2];
        }
        avg[0] = Math.round(avg[0] / clusters[c].length);
        avg[1] = Math.round(avg[1] / clusters[c].length);
        avg[2] = Math.round(avg[2] / clusters[c].length);

        if (centroids[c][0] !== avg[0] || centroids[c][1] !== avg[1] || centroids[c][2] !== avg[2]) {
          centroids[c] = avg;
          changed = true;
        }
      }

      if (!changed) break;
    }

    return centroids.map(c => new Color(c[0], c[1], c[2]));
  }

  analyzeContrast(foreground: Color, background: Color): ContrastAnalysis {
    const ratio = foreground.contrastRatio(background);

    return {
      ratio,
      wcagAA: ratio >= 4.5,
      wcagAALarge: ratio >= 3,
      wcagAAA: ratio >= 7,
      wcagAAALarge: ratio >= 4.5,
      score: ratio >= 7 ? 'excellent' : ratio >= 4.5 ? 'good' : ratio >= 3 ? 'fair' : 'poor',
      suggestedForeground: ratio < 4.5 ? this.findAccessibleColor(foreground, background) : foreground,
    };
  }

  findAccessibleColor(color: Color, background: Color, targetRatio = 4.5): Color {
    let current = color.clone();
    const isLightBg = background.isLight();

    for (let i = 0; i < 100; i++) {
      if (current.contrastRatio(background) >= targetRatio) return current;
      current = isLightBg ? current.darken(1) : current.lighten(1);
    }

    return isLightBg ? new Color(0, 0, 0) : new Color(255, 255, 255);
  }

  // ===========================================================================
  // Export
  // ===========================================================================

  exportPaletteCSS(palette: ColorPalette): string {
    let css = `/* Palette: ${palette.name} */\n:root {\n`;
    for (const [key, color] of Object.entries(palette.colors)) {
      const hex = color instanceof Color ? color.toHex() : String(color);
      css += `  --${palette.name.toLowerCase().replace(/\s+/g, '-')}-${key}: ${hex};\n`;
    }
    css += '}\n';
    return css;
  }

  exportPaletteSCSS(palette: ColorPalette): string {
    let scss = `// Palette: ${palette.name}\n`;
    for (const [key, color] of Object.entries(palette.colors)) {
      const hex = color instanceof Color ? color.toHex() : String(color);
      scss += `$${palette.name.toLowerCase().replace(/\s+/g, '-')}-${key}: ${hex};\n`;
    }
    return scss;
  }

  exportPaletteJSON(palette: ColorPalette): string {
    const colors: Record<string, string> = {};
    for (const [key, color] of Object.entries(palette.colors)) {
      colors[key] = color instanceof Color ? color.toHex() : String(color);
    }
    return JSON.stringify({ name: palette.name, description: palette.description, colors }, null, 2);
  }

  exportPaletteASE(palette: ColorPalette): ArrayBuffer {
    // Adobe Swatch Exchange format (simplified)
    const colors = Object.entries(palette.colors);
    const buffer = new ArrayBuffer(4 + 4 + colors.length * 48);
    const view = new DataView(buffer);

    view.setUint32(0, 0x41534546); // ASEF signature
    view.setUint32(4, colors.length);

    return buffer;
  }
}

// =============================================================================
// Types
// =============================================================================

export interface ColorPalette {
  name: string;
  description: string;
  colors: Record<string, Color>;
  base: string;
  type: string;
}

export type ColorBlindnessType =
  | 'protanopia' | 'deuteranopia' | 'tritanopia'
  | 'protanomaly' | 'deuteranomaly' | 'tritanomaly'
  | 'achromatopsia' | 'achromatomaly';

export interface GradientStop {
  color: Color;
  position: number;
}

export interface ContrastAnalysis {
  ratio: number;
  wcagAA: boolean;
  wcagAALarge: boolean;
  wcagAAA: boolean;
  wcagAAALarge: boolean;
  score: 'excellent' | 'good' | 'fair' | 'poor';
  suggestedForeground: Color;
}

// =============================================================================
// Named Colors (CSS Level 4)
// =============================================================================

export const NAMED_COLORS: Record<string, string> = {
  aliceblue: '#f0f8ff', antiquewhite: '#faebd7', aqua: '#00ffff', aquamarine: '#7fffd4',
  azure: '#f0ffff', beige: '#f5f5dc', bisque: '#ffe4c4', black: '#000000',
  blanchedalmond: '#ffebcd', blue: '#0000ff', blueviolet: '#8a2be2', brown: '#a52a2a',
  burlywood: '#deb887', cadetblue: '#5f9ea0', chartreuse: '#7fff00', chocolate: '#d2691e',
  coral: '#ff7f50', cornflowerblue: '#6495ed', cornsilk: '#fff8dc', crimson: '#dc143c',
  cyan: '#00ffff', darkblue: '#00008b', darkcyan: '#008b8b', darkgoldenrod: '#b8860b',
  darkgray: '#a9a9a9', darkgreen: '#006400', darkgrey: '#a9a9a9', darkkhaki: '#bdb76b',
  darkmagenta: '#8b008b', darkolivegreen: '#556b2f', darkorange: '#ff8c00', darkorchid: '#9932cc',
  darkred: '#8b0000', darksalmon: '#e9967a', darkseagreen: '#8fbc8f', darkslateblue: '#483d8b',
  darkslategray: '#2f4f4f', darkslategrey: '#2f4f4f', darkturquoise: '#00ced1', darkviolet: '#9400d3',
  deeppink: '#ff1493', deepskyblue: '#00bfff', dimgray: '#696969', dimgrey: '#696969',
  dodgerblue: '#1e90ff', firebrick: '#b22222', floralwhite: '#fffaf0', forestgreen: '#228b22',
  fuchsia: '#ff00ff', gainsboro: '#dcdcdc', ghostwhite: '#f8f8ff', gold: '#ffd700',
  goldenrod: '#daa520', gray: '#808080', green: '#008000', greenyellow: '#adff2f',
  grey: '#808080', honeydew: '#f0fff0', hotpink: '#ff69b4', indianred: '#cd5c5c',
  indigo: '#4b0082', ivory: '#fffff0', khaki: '#f0e68c', lavender: '#e6e6fa',
  lavenderblush: '#fff0f5', lawngreen: '#7cfc00', lemonchiffon: '#fffacd', lightblue: '#add8e6',
  lightcoral: '#f08080', lightcyan: '#e0ffff', lightgoldenrodyellow: '#fafad2', lightgray: '#d3d3d3',
  lightgreen: '#90ee90', lightgrey: '#d3d3d3', lightpink: '#ffb6c1', lightsalmon: '#ffa07a',
  lightseagreen: '#20b2aa', lightskyblue: '#87cefa', lightslategray: '#778899', lightslategrey: '#778899',
  lightsteelblue: '#b0c4de', lightyellow: '#ffffe0', lime: '#00ff00', limegreen: '#32cd32',
  linen: '#faf0e6', magenta: '#ff00ff', maroon: '#800000', mediumaquamarine: '#66cdaa',
  mediumblue: '#0000cd', mediumorchid: '#ba55d3', mediumpurple: '#9370db', mediumseagreen: '#3cb371',
  mediumslateblue: '#7b68ee', mediumspringgreen: '#00fa9a', mediumturquoise: '#48d1cc', mediumvioletred: '#c71585',
  midnightblue: '#191970', mintcream: '#f5fffa', mistyrose: '#ffe4e1', moccasin: '#ffe4b5',
  navajowhite: '#ffdead', navy: '#000080', oldlace: '#fdf5e6', olive: '#808000',
  olivedrab: '#6b8e23', orange: '#ffa500', orangered: '#ff4500', orchid: '#da70d6',
  palegoldenrod: '#eee8aa', palegreen: '#98fb98', paleturquoise: '#afeeee', palevioletred: '#db7093',
  papayawhip: '#ffefd5', peachpuff: '#ffdab9', peru: '#cd853f', pink: '#ffc0cb',
  plum: '#dda0dd', powderblue: '#b0e0e6', purple: '#800080', rebeccapurple: '#663399',
  red: '#ff0000', rosybrown: '#bc8f8f', royalblue: '#4169e1', saddlebrown: '#8b4513',
  salmon: '#fa8072', sandybrown: '#f4a460', seagreen: '#2e8b57', seashell: '#fff5ee',
  sienna: '#a0522d', silver: '#c0c0c0', skyblue: '#87ceeb', slateblue: '#6a5acd',
  slategray: '#708090', slategrey: '#708090', snow: '#fffafa', springgreen: '#00ff7f',
  steelblue: '#4682b4', tan: '#d2b48c', teal: '#008080', thistle: '#d8bfd8',
  tomato: '#ff6347', turquoise: '#40e0d0', violet: '#ee82ee', wheat: '#f5deb3',
  white: '#ffffff', whitesmoke: '#f5f5f5', yellow: '#ffff00', yellowgreen: '#9acd32',
};

// =============================================================================
// Brand Color Presets
// =============================================================================

export const BRAND_COLORS: Record<string, string> = {
  'Google Blue': '#4285F4',
  'Google Red': '#EA4335',
  'Google Yellow': '#FBBC05',
  'Google Green': '#34A853',
  'Facebook Blue': '#1877F2',
  'Twitter Blue': '#1DA1F2',
  'Instagram Purple': '#E4405F',
  'LinkedIn Blue': '#0A66C2',
  'YouTube Red': '#FF0000',
  'Spotify Green': '#1DB954',
  'Slack Purple': '#4A154B',
  'Discord Purple': '#5865F2',
  'Figma Red': '#F24E1E',
  'Figma Orange': '#FF7262',
  'Figma Violet': '#A259FF',
  'Figma Blue': '#1ABCFE',
  'Figma Green': '#0ACF83',
  'GitHub Black': '#181717',
  'Dribbble Pink': '#EA4C89',
  'Notion Black': '#000000',
  'Vercel Black': '#000000',
  'Next.js Black': '#000000',
  'React Blue': '#61DAFB',
  'Vue Green': '#4FC08D',
  'Angular Red': '#DD0031',
  'Svelte Orange': '#FF3E00',
  'Tailwind Blue': '#06B6D4',
  'TypeScript Blue': '#3178C6',
  'Python Yellow': '#3776AB',
  'Rust Orange': '#DEA584',
};

// =============================================================================
// Singleton Instance
// =============================================================================

export const colorSystem = new ColorSystem();
