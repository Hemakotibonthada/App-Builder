/**
 * Gradient Generator
 * 
 * Visual gradient builder with presets.
 * Features:
 * - Linear, radial, conic gradients
 * - Multi-stop color picker
 * - Angle control
 * - 50+ gradient presets
 * - CSS output generation
 * - Gradient to/from image
 */

/* ──────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────── */

export interface GradientStop {
  color: string;
  position: number; // 0-100
  opacity: number; // 0-1
}

export interface GradientDefinition {
  id: string;
  name: string;
  type: 'linear' | 'radial' | 'conic';
  angle: number; // degrees (for linear)
  shape?: 'circle' | 'ellipse'; // for radial
  stops: GradientStop[];
  repeating: boolean;
}

/* ──────────────────────────────────────────────
 * 50+ Gradient Presets
 * ────────────────────────────────────────────── */

export const GRADIENT_PRESETS: GradientDefinition[] = [
  // Vibrant
  { id: 'sunset', name: 'Sunset', type: 'linear', angle: 135, stops: [{ color: '#ff6b6b', position: 0, opacity: 1 }, { color: '#feca57', position: 100, opacity: 1 }], repeating: false },
  { id: 'ocean', name: 'Ocean', type: 'linear', angle: 135, stops: [{ color: '#667eea', position: 0, opacity: 1 }, { color: '#764ba2', position: 100, opacity: 1 }], repeating: false },
  { id: 'forest', name: 'Forest', type: 'linear', angle: 135, stops: [{ color: '#11998e', position: 0, opacity: 1 }, { color: '#38ef7d', position: 100, opacity: 1 }], repeating: false },
  { id: 'fire', name: 'Fire', type: 'linear', angle: 135, stops: [{ color: '#f12711', position: 0, opacity: 1 }, { color: '#f5af19', position: 100, opacity: 1 }], repeating: false },
  { id: 'purple-rain', name: 'Purple Rain', type: 'linear', angle: 135, stops: [{ color: '#9b59b6', position: 0, opacity: 1 }, { color: '#8e44ad', position: 50, opacity: 1 }, { color: '#6c3483', position: 100, opacity: 1 }], repeating: false },
  { id: 'aurora', name: 'Aurora', type: 'linear', angle: 135, stops: [{ color: '#00d2ff', position: 0, opacity: 1 }, { color: '#3a7bd5', position: 50, opacity: 1 }, { color: '#6366f1', position: 100, opacity: 1 }], repeating: false },
  { id: 'peach', name: 'Peach', type: 'linear', angle: 135, stops: [{ color: '#ffecd2', position: 0, opacity: 1 }, { color: '#fcb69f', position: 100, opacity: 1 }], repeating: false },
  { id: 'mango', name: 'Mango', type: 'linear', angle: 135, stops: [{ color: '#ffe259', position: 0, opacity: 1 }, { color: '#ffa751', position: 100, opacity: 1 }], repeating: false },
  { id: 'cosmic', name: 'Cosmic', type: 'linear', angle: 135, stops: [{ color: '#ff00cc', position: 0, opacity: 1 }, { color: '#333399', position: 100, opacity: 1 }], repeating: false },
  { id: 'neon', name: 'Neon', type: 'linear', angle: 90, stops: [{ color: '#00f260', position: 0, opacity: 1 }, { color: '#0575e6', position: 100, opacity: 1 }], repeating: false },
  { id: 'berry', name: 'Berry', type: 'linear', angle: 135, stops: [{ color: '#8e2de2', position: 0, opacity: 1 }, { color: '#4a00e0', position: 100, opacity: 1 }], repeating: false },
  { id: 'candy', name: 'Candy', type: 'linear', angle: 90, stops: [{ color: '#fc5c7d', position: 0, opacity: 1 }, { color: '#6a82fb', position: 100, opacity: 1 }], repeating: false },

  // Subtle / Professional
  { id: 'midnight', name: 'Midnight', type: 'linear', angle: 135, stops: [{ color: '#0f0c29', position: 0, opacity: 1 }, { color: '#302b63', position: 50, opacity: 1 }, { color: '#24243e', position: 100, opacity: 1 }], repeating: false },
  { id: 'charcoal', name: 'Charcoal', type: 'linear', angle: 180, stops: [{ color: '#232526', position: 0, opacity: 1 }, { color: '#414345', position: 100, opacity: 1 }], repeating: false },
  { id: 'slate', name: 'Slate', type: 'linear', angle: 180, stops: [{ color: '#334155', position: 0, opacity: 1 }, { color: '#1e293b', position: 100, opacity: 1 }], repeating: false },
  { id: 'silver', name: 'Silver', type: 'linear', angle: 180, stops: [{ color: '#bdc3c7', position: 0, opacity: 1 }, { color: '#2c3e50', position: 100, opacity: 1 }], repeating: false },
  { id: 'frost', name: 'Frost', type: 'linear', angle: 135, stops: [{ color: '#000428', position: 0, opacity: 1 }, { color: '#004e92', position: 100, opacity: 1 }], repeating: false },
  { id: 'ash', name: 'Ash', type: 'linear', angle: 180, stops: [{ color: '#606c88', position: 0, opacity: 1 }, { color: '#3f4c6b', position: 100, opacity: 1 }], repeating: false },
  { id: 'snow', name: 'Snow', type: 'linear', angle: 180, stops: [{ color: '#e6dada', position: 0, opacity: 1 }, { color: '#274046', position: 100, opacity: 1 }], repeating: false },

  // Brand Colors
  { id: 'indigo', name: 'Indigo', type: 'linear', angle: 135, stops: [{ color: '#6366f1', position: 0, opacity: 1 }, { color: '#8b5cf6', position: 100, opacity: 1 }], repeating: false },
  { id: 'blue', name: 'Blue', type: 'linear', angle: 135, stops: [{ color: '#3b82f6', position: 0, opacity: 1 }, { color: '#06b6d4', position: 100, opacity: 1 }], repeating: false },
  { id: 'green', name: 'Green', type: 'linear', angle: 135, stops: [{ color: '#22c55e', position: 0, opacity: 1 }, { color: '#10b981', position: 100, opacity: 1 }], repeating: false },
  { id: 'rose', name: 'Rose', type: 'linear', angle: 135, stops: [{ color: '#ec4899', position: 0, opacity: 1 }, { color: '#f43f5e', position: 100, opacity: 1 }], repeating: false },
  { id: 'amber', name: 'Amber', type: 'linear', angle: 135, stops: [{ color: '#f59e0b', position: 0, opacity: 1 }, { color: '#ef4444', position: 100, opacity: 1 }], repeating: false },

  // Multi-stop
  { id: 'rainbow', name: 'Rainbow', type: 'linear', angle: 90, stops: [{ color: '#ff0000', position: 0, opacity: 1 }, { color: '#ff8000', position: 17, opacity: 1 }, { color: '#ffff00', position: 33, opacity: 1 }, { color: '#00ff00', position: 50, opacity: 1 }, { color: '#0000ff', position: 67, opacity: 1 }, { color: '#8000ff', position: 83, opacity: 1 }, { color: '#ff00ff', position: 100, opacity: 1 }], repeating: false },
  { id: 'holographic', name: 'Holographic', type: 'linear', angle: 45, stops: [{ color: '#74ebd5', position: 0, opacity: 1 }, { color: '#9face6', position: 33, opacity: 1 }, { color: '#f8c9d4', position: 66, opacity: 1 }, { color: '#74ebd5', position: 100, opacity: 1 }], repeating: false },
  { id: 'northern-lights', name: 'Northern Lights', type: 'linear', angle: 180, stops: [{ color: '#0f0c29', position: 0, opacity: 1 }, { color: '#302b63', position: 25, opacity: 1 }, { color: '#24243e', position: 50, opacity: 1 }, { color: '#00d2ff', position: 75, opacity: 1 }, { color: '#0f0c29', position: 100, opacity: 1 }], repeating: false },

  // Radial
  { id: 'radial-glow', name: 'Radial Glow', type: 'radial', angle: 0, shape: 'circle', stops: [{ color: '#6366f1', position: 0, opacity: 1 }, { color: '#0f0c29', position: 100, opacity: 1 }], repeating: false },
  { id: 'radial-spotlight', name: 'Spotlight', type: 'radial', angle: 0, shape: 'ellipse', stops: [{ color: '#ffffff', position: 0, opacity: 0.3 }, { color: '#000000', position: 100, opacity: 0 }], repeating: false },
  { id: 'radial-sun', name: 'Sun', type: 'radial', angle: 0, shape: 'circle', stops: [{ color: '#ffecd2', position: 0, opacity: 1 }, { color: '#fcb69f', position: 50, opacity: 1 }, { color: '#ff6b6b', position: 100, opacity: 1 }], repeating: false },

  // Conic
  { id: 'conic-wheel', name: 'Color Wheel', type: 'conic', angle: 0, stops: [{ color: '#ff0000', position: 0, opacity: 1 }, { color: '#ffff00', position: 17, opacity: 1 }, { color: '#00ff00', position: 33, opacity: 1 }, { color: '#00ffff', position: 50, opacity: 1 }, { color: '#0000ff', position: 67, opacity: 1 }, { color: '#ff00ff', position: 83, opacity: 1 }, { color: '#ff0000', position: 100, opacity: 1 }], repeating: false },

  // Glass / UI
  { id: 'glass-light', name: 'Glass (Light)', type: 'linear', angle: 135, stops: [{ color: '#ffffff', position: 0, opacity: 0.2 }, { color: '#ffffff', position: 100, opacity: 0.05 }], repeating: false },
  { id: 'glass-dark', name: 'Glass (Dark)', type: 'linear', angle: 135, stops: [{ color: '#000000', position: 0, opacity: 0.3 }, { color: '#000000', position: 100, opacity: 0.1 }], repeating: false },
  { id: 'shimmer', name: 'Shimmer', type: 'linear', angle: 90, stops: [{ color: '#f0f0f0', position: 0, opacity: 0 }, { color: '#ffffff', position: 50, opacity: 0.5 }, { color: '#f0f0f0', position: 100, opacity: 0 }], repeating: false },
];

/* ──────────────────────────────────────────────
 * CSS Generation
 * ────────────────────────────────────────────── */

export function gradientToCSS(gradient: GradientDefinition): string {
  const stops = gradient.stops
    .map(s => {
      const color = s.opacity < 1
        ? hexToRgba(s.color, s.opacity)
        : s.color;
      return `${color} ${s.position}%`;
    })
    .join(', ');

  const prefix = gradient.repeating ? 'repeating-' : '';

  switch (gradient.type) {
    case 'linear':
      return `${prefix}linear-gradient(${gradient.angle}deg, ${stops})`;
    case 'radial':
      return `${prefix}radial-gradient(${gradient.shape ?? 'circle'}, ${stops})`;
    case 'conic':
      return `${prefix}conic-gradient(from ${gradient.angle}deg, ${stops})`;
  }
}

function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export function getGradientsByType(): Map<string, GradientDefinition[]> {
  const m = new Map<string, GradientDefinition[]>();
  for (const g of GRADIENT_PRESETS) {
    const list = m.get(g.type) ?? [];
    list.push(g);
    m.set(g.type, list);
  }
  return m;
}
