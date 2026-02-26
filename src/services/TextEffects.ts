// =============================================================================
// Text Effects Service - Complete text styling system with shadows, gradients,
// strokes, animations, letterpress, 3D text, and advanced typography effects
// =============================================================================

// =============================================================================
// Text Effect Types
// =============================================================================

export interface TextEffectConfig {
  id: string;
  name: string;
  type: TextEffectType;
  styles: TextEffectStyles;
  animation?: TextAnimation;
}

export type TextEffectType =
  | 'gradient' | 'stroke' | 'shadow' | 'glow' | 'neon' | '3d'
  | 'emboss' | 'letterpress' | 'retro' | 'glitch' | 'metallic'
  | 'fire' | 'ice' | 'outline' | 'highlight' | 'underline-effect'
  | 'mask' | 'clipped' | 'animated' | 'handwritten';

export interface TextEffectStyles {
  color?: string;
  background?: string;
  backgroundClip?: string;
  webkitBackgroundClip?: string;
  webkitTextFillColor?: string;
  textShadow?: string;
  webkitTextStroke?: string;
  filter?: string;
  textDecoration?: string;
  textDecorationColor?: string;
  textDecorationStyle?: string;
  textDecorationThickness?: string;
  textUnderlineOffset?: string;
  letterSpacing?: string;
  fontWeight?: string;
  fontStyle?: string;
  textTransform?: string;
  mixBlendMode?: string;
  opacity?: string;
  [key: string]: string | undefined;
}

export interface TextAnimation {
  name: string;
  keyframes: string;
  duration: number;
  timingFunction: string;
  iterationCount: string;
  direction?: string;
  delay?: number;
}

export interface TextEffectPreset {
  id: string;
  name: string;
  category: TextEffectCategory;
  description: string;
  config: TextEffectConfig;
  tags: string[];
}

export type TextEffectCategory =
  | 'gradient' | 'shadow' | 'stroke' | 'neon' | '3d'
  | 'retro' | 'animated' | 'decorative' | 'utility';

// =============================================================================
// Text Gradient Generator
// =============================================================================

export function generateTextGradient(
  gradient: string,
  fallbackColor: string = '#333'
): TextEffectStyles {
  return {
    background: gradient,
    backgroundClip: 'text',
    webkitBackgroundClip: 'text',
    webkitTextFillColor: 'transparent',
    color: fallbackColor,
  };
}

export function generateAnimatedTextGradient(
  colors: string[],
  angle: number = 90,
  duration: number = 3
): { styles: TextEffectStyles; animation: TextAnimation } {
  const gradient = `linear-gradient(${angle}deg, ${colors.join(', ')}, ${colors[0]})`;
  const size = `${colors.length * 200}%`;

  return {
    styles: {
      background: gradient,
      backgroundSize: `${size} ${size}`,
      backgroundClip: 'text',
      webkitBackgroundClip: 'text',
      webkitTextFillColor: 'transparent',
    },
    animation: {
      name: 'text-gradient-shift',
      keyframes: `@keyframes text-gradient-shift {
  0% { background-position: 0% center; }
  100% { background-position: ${size} center; }
}`,
      duration: duration * 1000,
      timingFunction: 'linear',
      iterationCount: 'infinite',
    },
  };
}

// =============================================================================
// Text Stroke Generator
// =============================================================================

export function generateTextStroke(
  width: number = 1,
  color: string = '#000',
  fillColor: string = 'transparent'
): TextEffectStyles {
  return {
    webkitTextStroke: `${width}px ${color}`,
    webkitTextFillColor: fillColor,
    color: fillColor === 'transparent' ? color : fillColor,
  };
}

export function generateTextOutline(
  width: number = 2,
  color: string = '#000'
): TextEffectStyles {
  const shadows: string[] = [];
  for (let angle = 0; angle < 360; angle += 30) {
    const rad = (angle * Math.PI) / 180;
    const x = Math.round(Math.cos(rad) * width * 100) / 100;
    const y = Math.round(Math.sin(rad) * width * 100) / 100;
    shadows.push(`${x}px ${y}px 0 ${color}`);
  }
  return {
    textShadow: shadows.join(', '),
  };
}

// =============================================================================
// Text Shadow Effects
// =============================================================================

export function generateLongShadow(
  color: string = 'rgba(0,0,0,0.15)',
  length: number = 40,
  angle: number = 45
): TextEffectStyles {
  const shadows: string[] = [];
  const rad = (angle * Math.PI) / 180;
  for (let i = 1; i <= length; i++) {
    const x = Math.round(Math.cos(rad) * i);
    const y = Math.round(Math.sin(rad) * i);
    shadows.push(`${x}px ${y}px 0 ${color}`);
  }
  return { textShadow: shadows.join(', ') };
}

export function generateTextGlow(
  color: string = '#6366f1',
  intensity: number = 1
): TextEffectStyles {
  const blurs = [4, 8, 16, 32, 48].map(b => b * intensity);
  const shadows = blurs.map(b => `0 0 ${b}px ${color}`).join(', ');
  return {
    textShadow: shadows,
    color: '#fff',
  };
}

export function generateNeonText(
  color: string = '#ff00ff',
  bgColor: string = '#000'
): TextEffectStyles {
  return {
    color: '#fff',
    textShadow: [
      `0 0 7px #fff`,
      `0 0 10px #fff`,
      `0 0 21px #fff`,
      `0 0 42px ${color}`,
      `0 0 82px ${color}`,
      `0 0 92px ${color}`,
      `0 0 102px ${color}`,
      `0 0 151px ${color}`,
    ].join(', '),
  };
}

export function generateEmbossedText(
  lightColor: string = 'rgba(255,255,255,0.6)',
  darkColor: string = 'rgba(0,0,0,0.2)'
): TextEffectStyles {
  return {
    color: 'rgba(0,0,0,0.3)',
    textShadow: `0 1px 0 ${lightColor}, 0 -1px 0 ${darkColor}`,
  };
}

export function generateLetterpressText(): TextEffectStyles {
  return {
    color: 'transparent',
    textShadow: '0 2px 3px rgba(255,255,255,0.5)',
    webkitBackgroundClip: 'text',
    backgroundClip: 'text',
    background: '#666',
  };
}

export function generate3DText(
  color: string = '#333',
  depth: number = 6,
  shadowColor: string = ''
): TextEffectStyles {
  const shadows: string[] = [];
  for (let i = 1; i <= depth; i++) {
    const shade = shadowColor || darkenColor(color, i * 5);
    shadows.push(`${i}px ${i}px 0 ${shade}`);
  }
  shadows.push(`${depth + 2}px ${depth + 2}px ${depth}px rgba(0,0,0,0.4)`);
  return {
    color,
    textShadow: shadows.join(', '),
  };
}

function darkenColor(hex: string, amount: number): string {
  const clean = hex.replace('#', '');
  const r = Math.max(0, parseInt(clean.slice(0, 2), 16) - amount);
  const g = Math.max(0, parseInt(clean.slice(2, 4), 16) - amount);
  const b = Math.max(0, parseInt(clean.slice(4, 6), 16) - amount);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export function generateRetroText(
  color: string = '#f97316',
  shadowColor: string = '#7c2d12'
): TextEffectStyles {
  return {
    color,
    textShadow: [
      `3px 3px 0 ${shadowColor}`,
      `6px 6px 0 rgba(0,0,0,0.2)`,
    ].join(', '),
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };
}

export function generateGlitchText(
  color: string = '#ffffff',
  color1: string = '#ff0000',
  color2: string = '#00ffff'
): { styles: TextEffectStyles; animation: TextAnimation } {
  return {
    styles: {
      color,
      position: 'relative',
    },
    animation: {
      name: 'glitch',
      keyframes: `@keyframes glitch {
  0% { text-shadow: 2px 0 ${color1}, -2px 0 ${color2}; }
  20% { text-shadow: -2px 0 ${color1}, 2px 0 ${color2}; }
  40% { text-shadow: 2px -1px ${color1}, -2px 1px ${color2}; }
  60% { text-shadow: -1px 2px ${color1}, 1px -2px ${color2}; }
  80% { text-shadow: 2px 0 ${color1}, -2px 0 ${color2}; }
  100% { text-shadow: -2px 0 ${color1}, 2px 0 ${color2}; }
}`,
      duration: 500,
      timingFunction: 'steps(4)',
      iterationCount: 'infinite',
    },
  };
}

export function generateMetallicText(): TextEffectStyles {
  return {
    background: 'linear-gradient(180deg, #bdc3c7 0%, #2c3e50 50%, #bdc3c7 100%)',
    backgroundClip: 'text',
    webkitBackgroundClip: 'text',
    webkitTextFillColor: 'transparent',
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
    fontWeight: '900',
  };
}

export function generateFireText(): TextEffectStyles {
  return {
    color: '#fff',
    textShadow: [
      '0 0 4px #fefcc9',
      '2px -2px 6px #feec85',
      '-2px -4px 8px #ffae34',
      '2px -6px 10px #ec760c',
      '-2px -8px 12px #cd4606',
      '0 -10px 14px #973716',
      '1px -12px 16px #451b0e',
    ].join(', '),
  };
}

export function generateIceText(): TextEffectStyles {
  return {
    color: '#c7ecee',
    textShadow: [
      '0 0 5px rgba(199,236,238,0.5)',
      '0 0 10px rgba(104,167,187,0.3)',
      '0 0 20px rgba(104,167,187,0.2)',
      '0 0 40px rgba(104,167,187,0.1)',
    ].join(', '),
    fontWeight: '300',
    letterSpacing: '0.1em',
  };
}

// =============================================================================
// Underline Effects
// =============================================================================

export function generateFancyUnderline(
  color: string = '#6366f1',
  thickness: number = 3,
  offset: number = 4,
  style: 'solid' | 'wavy' | 'dashed' | 'dotted' | 'double' | 'gradient' = 'solid'
): TextEffectStyles {
  if (style === 'gradient') {
    return {
      textDecoration: 'none',
      backgroundImage: `linear-gradient(transparent calc(100% - ${thickness}px), ${color} ${thickness}px)`,
      backgroundRepeat: 'no-repeat',
      backgroundSize: '100% 100%',
    };
  }

  return {
    textDecoration: 'underline',
    textDecorationColor: color,
    textDecorationStyle: style,
    textDecorationThickness: `${thickness}px`,
    textUnderlineOffset: `${offset}px`,
  };
}

export function generateHighlightEffect(
  color: string = 'rgba(255, 255, 0, 0.3)',
  padding: string = '0 4px',
  angle: number = -2
): TextEffectStyles {
  return {
    backgroundImage: `linear-gradient(${angle}deg, transparent 0%, ${color} 0%)`,
    padding,
  };
}

export function generateStrikethroughEffect(
  color: string = '#ef4444',
  thickness: number = 2,
  style: 'solid' | 'wavy' | 'dashed' = 'solid'
): TextEffectStyles {
  return {
    textDecoration: 'line-through',
    textDecorationColor: color,
    textDecorationStyle: style,
    textDecorationThickness: `${thickness}px`,
  };
}

// =============================================================================
// Text Effect Presets
// =============================================================================

export const TEXT_EFFECT_PRESETS: TextEffectPreset[] = [
  // Gradient
  {
    id: 'gradient-sunset',
    name: 'Sunset Gradient',
    category: 'gradient',
    description: 'Warm sunset gradient text',
    tags: ['gradient', 'sunset', 'warm'],
    config: {
      id: 'grad-sunset', name: 'Sunset Gradient', type: 'gradient',
      styles: generateTextGradient('linear-gradient(90deg, #f97316, #ef4444, #ec4899)'),
    },
  },
  {
    id: 'gradient-ocean',
    name: 'Ocean Gradient',
    category: 'gradient',
    description: 'Cool ocean gradient text',
    tags: ['gradient', 'ocean', 'cool'],
    config: {
      id: 'grad-ocean', name: 'Ocean Gradient', type: 'gradient',
      styles: generateTextGradient('linear-gradient(90deg, #06b6d4, #3b82f6, #6366f1)'),
    },
  },
  {
    id: 'gradient-forest',
    name: 'Forest Gradient',
    category: 'gradient',
    description: 'Green forest gradient text',
    tags: ['gradient', 'forest', 'green'],
    config: {
      id: 'grad-forest', name: 'Forest Gradient', type: 'gradient',
      styles: generateTextGradient('linear-gradient(90deg, #22c55e, #10b981, #14b8a6)'),
    },
  },
  {
    id: 'gradient-galaxy',
    name: 'Galaxy Gradient',
    category: 'gradient',
    description: 'Purple galaxy gradient text',
    tags: ['gradient', 'galaxy', 'purple'],
    config: {
      id: 'grad-galaxy', name: 'Galaxy Gradient', type: 'gradient',
      styles: generateTextGradient('linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7, #d946ef)'),
    },
  },
  {
    id: 'gradient-gold',
    name: 'Gold Gradient',
    category: 'gradient',
    description: 'Metallic gold gradient text',
    tags: ['gradient', 'gold', 'metallic'],
    config: {
      id: 'grad-gold', name: 'Gold Gradient', type: 'gradient',
      styles: generateTextGradient('linear-gradient(135deg, #fbbf24, #f59e0b, #d97706, #f59e0b, #fbbf24)'),
    },
  },
  {
    id: 'gradient-silver',
    name: 'Silver Gradient',
    category: 'gradient',
    description: 'Metallic silver gradient text',
    tags: ['gradient', 'silver', 'metallic'],
    config: {
      id: 'grad-silver', name: 'Silver Gradient', type: 'gradient',
      styles: generateTextGradient('linear-gradient(135deg, #e5e7eb, #9ca3af, #6b7280, #9ca3af, #e5e7eb)'),
    },
  },
  {
    id: 'gradient-rainbow',
    name: 'Rainbow Gradient',
    category: 'gradient',
    description: 'Full rainbow gradient text',
    tags: ['gradient', 'rainbow', 'colorful'],
    config: {
      id: 'grad-rainbow', name: 'Rainbow Gradient', type: 'gradient',
      styles: generateTextGradient('linear-gradient(90deg, #ef4444, #f97316, #eab308, #22c55e, #3b82f6, #8b5cf6)'),
    },
  },

  // Shadow
  {
    id: 'shadow-subtle',
    name: 'Subtle Shadow',
    category: 'shadow',
    description: 'Subtle text shadow',
    tags: ['shadow', 'subtle', 'clean'],
    config: {
      id: 'sh-subtle', name: 'Subtle Shadow', type: 'shadow',
      styles: { textShadow: '0 1px 2px rgba(0,0,0,0.2)' },
    },
  },
  {
    id: 'shadow-long',
    name: 'Long Shadow',
    category: 'shadow',
    description: 'Long diagonal shadow effect',
    tags: ['shadow', 'long', 'flat'],
    config: {
      id: 'sh-long', name: 'Long Shadow', type: 'shadow',
      styles: generateLongShadow('rgba(0,0,0,0.1)', 30),
    },
  },
  {
    id: 'shadow-3d',
    name: '3D Text',
    category: '3d',
    description: '3D extruded text effect',
    tags: ['3d', 'depth', 'extrude'],
    config: {
      id: 'sh-3d', name: '3D Text', type: '3d',
      styles: generate3DText('#4338ca', 5),
    },
  },

  // Stroke
  {
    id: 'stroke-thin',
    name: 'Thin Stroke',
    category: 'stroke',
    description: 'Thin outlined text',
    tags: ['stroke', 'outline', 'thin'],
    config: {
      id: 'st-thin', name: 'Thin Stroke', type: 'stroke',
      styles: generateTextStroke(1, '#333', 'transparent'),
    },
  },
  {
    id: 'stroke-thick',
    name: 'Thick Stroke',
    category: 'stroke',
    description: 'Thick outlined text',
    tags: ['stroke', 'outline', 'thick', 'bold'],
    config: {
      id: 'st-thick', name: 'Thick Stroke', type: 'stroke',
      styles: generateTextStroke(2, '#1f2937', 'transparent'),
    },
  },
  {
    id: 'stroke-colored',
    name: 'Colored Stroke',
    category: 'stroke',
    description: 'Colored outline text',
    tags: ['stroke', 'outline', 'colored'],
    config: {
      id: 'st-colored', name: 'Colored Stroke', type: 'stroke',
      styles: generateTextStroke(1, '#6366f1', 'white'),
    },
  },

  // Neon
  {
    id: 'neon-pink',
    name: 'Neon Pink',
    category: 'neon',
    description: 'Pink neon glow text',
    tags: ['neon', 'pink', 'glow'],
    config: {
      id: 'neon-pink', name: 'Neon Pink', type: 'neon',
      styles: generateNeonText('#ff00ff'),
    },
  },
  {
    id: 'neon-cyan',
    name: 'Neon Cyan',
    category: 'neon',
    description: 'Cyan neon glow text',
    tags: ['neon', 'cyan', 'glow'],
    config: {
      id: 'neon-cyan', name: 'Neon Cyan', type: 'neon',
      styles: generateNeonText('#00ffff'),
    },
  },
  {
    id: 'neon-green',
    name: 'Neon Green',
    category: 'neon',
    description: 'Green neon glow text',
    tags: ['neon', 'green', 'glow', 'matrix'],
    config: {
      id: 'neon-green', name: 'Neon Green', type: 'neon',
      styles: generateNeonText('#39ff14'),
    },
  },
  {
    id: 'glow-blue',
    name: 'Blue Glow',
    category: 'neon',
    description: 'Blue soft glow text',
    tags: ['glow', 'blue', 'soft'],
    config: {
      id: 'glow-blue', name: 'Blue Glow', type: 'glow',
      styles: generateTextGlow('#3b82f6', 0.8),
    },
  },

  // Retro
  {
    id: 'retro-orange',
    name: 'Retro Orange',
    category: 'retro',
    description: 'Retro style orange text',
    tags: ['retro', 'vintage', 'orange'],
    config: {
      id: 'retro-orange', name: 'Retro Orange', type: 'retro',
      styles: generateRetroText('#f97316', '#7c2d12'),
    },
  },
  {
    id: 'embossed',
    name: 'Embossed',
    category: 'retro',
    description: 'Classic embossed text effect',
    tags: ['emboss', 'classic', 'letterpress'],
    config: {
      id: 'embossed', name: 'Embossed', type: 'emboss',
      styles: generateEmbossedText(),
    },
  },
  {
    id: 'metallic',
    name: 'Metallic',
    category: 'retro',
    description: 'Chrome/metallic text effect',
    tags: ['metallic', 'chrome', 'shiny'],
    config: {
      id: 'metallic', name: 'Metallic', type: 'metallic',
      styles: generateMetallicText(),
    },
  },

  // Decorative
  {
    id: 'fire-text',
    name: 'Fire Text',
    category: 'decorative',
    description: 'Fiery text with flame shadows',
    tags: ['fire', 'flame', 'hot'],
    config: {
      id: 'fire', name: 'Fire Text', type: 'fire',
      styles: generateFireText(),
    },
  },
  {
    id: 'ice-text',
    name: 'Ice Text',
    category: 'decorative',
    description: 'Frosty ice text effect',
    tags: ['ice', 'frost', 'cold'],
    config: {
      id: 'ice', name: 'Ice Text', type: 'ice',
      styles: generateIceText(),
    },
  },
  {
    id: 'highlight-yellow',
    name: 'Yellow Highlight',
    category: 'decorative',
    description: 'Text with yellow highlighter effect',
    tags: ['highlight', 'marker', 'yellow'],
    config: {
      id: 'highlight', name: 'Yellow Highlight', type: 'highlight',
      styles: generateHighlightEffect('rgba(255, 255, 0, 0.3)'),
    },
  },
  {
    id: 'underline-gradient',
    name: 'Gradient Underline',
    category: 'decorative',
    description: 'Gradient underline decoration',
    tags: ['underline', 'gradient', 'decoration'],
    config: {
      id: 'ul-grad', name: 'Gradient Underline', type: 'underline-effect',
      styles: generateFancyUnderline('#6366f1', 3, 4, 'gradient'),
    },
  },
  {
    id: 'underline-wavy',
    name: 'Wavy Underline',
    category: 'decorative',
    description: 'Wavy underline decoration',
    tags: ['underline', 'wavy', 'fun'],
    config: {
      id: 'ul-wavy', name: 'Wavy Underline', type: 'underline-effect',
      styles: generateFancyUnderline('#ef4444', 2, 4, 'wavy'),
    },
  },
];

// =============================================================================
// CSS Generation Utilities
// =============================================================================

export function textEffectToCSS(config: TextEffectConfig): string {
  const lines: string[] = [];
  for (const [prop, value] of Object.entries(config.styles)) {
    if (value) {
      const cssProperty = prop
        .replace(/webkit([A-Z])/g, '-webkit-$1')
        .replace(/([A-Z])/g, '-$1')
        .toLowerCase();
      lines.push(`${cssProperty}: ${value};`);
    }
  }

  if (config.animation) {
    lines.push(`animation: ${config.animation.name} ${config.animation.duration}ms ${config.animation.timingFunction} ${config.animation.iterationCount};`);
  }

  return lines.join('\n');
}

export function textEffectToClassCSS(className: string, config: TextEffectConfig): string {
  let css = `.${className} {\n`;
  const effectCSS = textEffectToCSS(config);
  css += effectCSS.split('\n').map(line => `  ${line}`).join('\n');
  css += '\n}';

  if (config.animation) {
    css += `\n\n${config.animation.keyframes}`;
  }

  return css;
}

export function getPresetsByCategory(category: TextEffectCategory): TextEffectPreset[] {
  return TEXT_EFFECT_PRESETS.filter(p => p.category === category);
}

export function searchTextEffects(query: string): TextEffectPreset[] {
  const lower = query.toLowerCase();
  return TEXT_EFFECT_PRESETS.filter(p =>
    p.name.toLowerCase().includes(lower) ||
    p.description.toLowerCase().includes(lower) ||
    p.tags.some(t => t.includes(lower))
  );
}

// =============================================================================
// Character-Level Animation Helpers
// =============================================================================

export function generateTypewriterCSS(
  className: string,
  text: string,
  speed: number = 100,
  cursorColor: string = '#333'
): string {
  const chars = text.length;
  const duration = chars * speed;

  return `.${className} {
  width: ${chars}ch;
  white-space: nowrap;
  overflow: hidden;
  border-right: 2px solid ${cursorColor};
  animation: 
    ${className}-type ${duration}ms steps(${chars}) 1s forwards,
    ${className}-blink 500ms step-end infinite;
}

@keyframes ${className}-type {
  from { width: 0; }
  to { width: ${chars}ch; }
}

@keyframes ${className}-blink {
  50% { border-color: transparent; }
}`;
}

export function generateCharacterStaggerCSS(
  className: string,
  effect: 'fadeIn' | 'bounceIn' | 'slideUp' | 'scaleIn' = 'fadeIn',
  staggerDelay: number = 50,
  maxChars: number = 50
): string {
  let keyframes = '';
  switch (effect) {
    case 'fadeIn':
      keyframes = `@keyframes ${className}-char {
  from { opacity: 0; }
  to { opacity: 1; }
}`;
      break;
    case 'bounceIn':
      keyframes = `@keyframes ${className}-char {
  0% { opacity: 0; transform: translateY(-20px); }
  60% { opacity: 1; transform: translateY(5px); }
  80% { transform: translateY(-2px); }
  100% { transform: translateY(0); }
}`;
      break;
    case 'slideUp':
      keyframes = `@keyframes ${className}-char {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}`;
      break;
    case 'scaleIn':
      keyframes = `@keyframes ${className}-char {
  from { opacity: 0; transform: scale(0); }
  to { opacity: 1; transform: scale(1); }
}`;
      break;
  }

  let delays = '';
  for (let i = 0; i < maxChars; i++) {
    delays += `.${className} span:nth-child(${i + 1}) { animation-delay: ${i * staggerDelay}ms; }\n`;
  }

  return `.${className} span {
  display: inline-block;
  opacity: 0;
  animation: ${className}-char 400ms ease forwards;
}

${delays}
${keyframes}`;
}

export function generateWavyTextCSS(
  className: string,
  amplitude: number = 10,
  frequency: number = 50,
  color: string = '#6366f1',
  charCount: number = 30
): string {
  let delays = '';
  for (let i = 0; i < charCount; i++) {
    delays += `.${className} span:nth-child(${i + 1}) { animation-delay: ${i * frequency}ms; }\n`;
  }

  return `.${className} {
  color: ${color};
}

.${className} span {
  display: inline-block;
  animation: ${className}-wave 1s ease-in-out infinite;
}

${delays}

@keyframes ${className}-wave {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-${amplitude}px); }
}`;
}
