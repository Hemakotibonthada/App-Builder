// =============================================================================
// Transform Tools - Widget transform operations including resize, rotate,
// skew, flip, scale, and matrix transformations for the visual builder
// =============================================================================

// =============================================================================
// Transform Types
// =============================================================================

export interface Transform2D {
  translateX: number;
  translateY: number;
  rotate: number;       // degrees
  scaleX: number;
  scaleY: number;
  skewX: number;        // degrees
  skewY: number;        // degrees
  originX: number;      // 0-100 percentage
  originY: number;      // 0-100 percentage
}

export interface Transform3D extends Transform2D {
  translateZ: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  perspective: number;
  scaleZ: number;
}

export interface TransformMatrix {
  a: number; b: number;
  c: number; d: number;
  e: number; f: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface ResizeHandle {
  position: 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';
  cursor: string;
  x: number;
  y: number;
}

export interface TransformConstraints {
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
  lockAspectRatio: boolean;
  snapToGrid: boolean;
  gridSize: number;
  snapAngle: number;     // degrees for rotation snap
  preventOverlap: boolean;
  containInParent: boolean;
}

export interface TransformState {
  isDragging: boolean;
  isResizing: boolean;
  isRotating: boolean;
  activeHandle: ResizeHandle['position'] | null;
  startPoint: Point;
  currentPoint: Point;
  startBounds: BoundingBox;
  startTransform: Transform2D;
}

// =============================================================================
// Default Values
// =============================================================================

export const DEFAULT_TRANSFORM: Transform2D = {
  translateX: 0,
  translateY: 0,
  rotate: 0,
  scaleX: 1,
  scaleY: 1,
  skewX: 0,
  skewY: 0,
  originX: 50,
  originY: 50,
};

export const DEFAULT_3D_TRANSFORM: Transform3D = {
  ...DEFAULT_TRANSFORM,
  translateZ: 0,
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
  perspective: 0,
  scaleZ: 1,
};

export const DEFAULT_CONSTRAINTS: TransformConstraints = {
  minWidth: 10,
  minHeight: 10,
  maxWidth: 10000,
  maxHeight: 10000,
  lockAspectRatio: false,
  snapToGrid: false,
  gridSize: 8,
  snapAngle: 15,
  preventOverlap: false,
  containInParent: false,
};

// =============================================================================
// CSS Transform Generation
// =============================================================================

export function transformToCSS(transform: Transform2D): string {
  const parts: string[] = [];

  if (transform.translateX !== 0 || transform.translateY !== 0) {
    parts.push(`translate(${transform.translateX}px, ${transform.translateY}px)`);
  }

  if (transform.rotate !== 0) {
    parts.push(`rotate(${transform.rotate}deg)`);
  }

  if (transform.scaleX !== 1 || transform.scaleY !== 1) {
    if (transform.scaleX === transform.scaleY) {
      parts.push(`scale(${transform.scaleX})`);
    } else {
      parts.push(`scale(${transform.scaleX}, ${transform.scaleY})`);
    }
  }

  if (transform.skewX !== 0 || transform.skewY !== 0) {
    parts.push(`skew(${transform.skewX}deg, ${transform.skewY}deg)`);
  }

  return parts.length > 0 ? parts.join(' ') : 'none';
}

export function transform3DToCSS(transform: Transform3D): string {
  const parts: string[] = [];

  if (transform.perspective > 0) {
    parts.push(`perspective(${transform.perspective}px)`);
  }

  if (transform.translateX !== 0 || transform.translateY !== 0 || transform.translateZ !== 0) {
    parts.push(`translate3d(${transform.translateX}px, ${transform.translateY}px, ${transform.translateZ}px)`);
  }

  if (transform.rotateX !== 0) parts.push(`rotateX(${transform.rotateX}deg)`);
  if (transform.rotateY !== 0) parts.push(`rotateY(${transform.rotateY}deg)`);
  if (transform.rotateZ !== 0 || transform.rotate !== 0) {
    parts.push(`rotateZ(${transform.rotateZ || transform.rotate}deg)`);
  }

  if (transform.scaleX !== 1 || transform.scaleY !== 1 || transform.scaleZ !== 1) {
    parts.push(`scale3d(${transform.scaleX}, ${transform.scaleY}, ${transform.scaleZ})`);
  }

  if (transform.skewX !== 0 || transform.skewY !== 0) {
    parts.push(`skew(${transform.skewX}deg, ${transform.skewY}deg)`);
  }

  return parts.length > 0 ? parts.join(' ') : 'none';
}

export function transformOriginToCSS(transform: Transform2D): string {
  return `${transform.originX}% ${transform.originY}%`;
}

// =============================================================================
// Matrix Operations
// =============================================================================

export function identityMatrix(): TransformMatrix {
  return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
}

export function multiplyMatrices(m1: TransformMatrix, m2: TransformMatrix): TransformMatrix {
  return {
    a: m1.a * m2.a + m1.c * m2.b,
    b: m1.b * m2.a + m1.d * m2.b,
    c: m1.a * m2.c + m1.c * m2.d,
    d: m1.b * m2.c + m1.d * m2.d,
    e: m1.a * m2.e + m1.c * m2.f + m1.e,
    f: m1.b * m2.e + m1.d * m2.f + m1.f,
  };
}

export function invertMatrix(m: TransformMatrix): TransformMatrix | null {
  const det = m.a * m.d - m.b * m.c;
  if (Math.abs(det) < 1e-10) return null;

  const invDet = 1 / det;
  return {
    a: m.d * invDet,
    b: -m.b * invDet,
    c: -m.c * invDet,
    d: m.a * invDet,
    e: (m.c * m.f - m.d * m.e) * invDet,
    f: (m.b * m.e - m.a * m.f) * invDet,
  };
}

export function transformToMatrix(transform: Transform2D): TransformMatrix {
  const rad = (transform.rotate * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  // Translation
  const translate: TransformMatrix = {
    a: 1, b: 0, c: 0, d: 1,
    e: transform.translateX, f: transform.translateY,
  };

  // Rotation
  const rotation: TransformMatrix = {
    a: cos, b: sin, c: -sin, d: cos, e: 0, f: 0,
  };

  // Scale
  const scale: TransformMatrix = {
    a: transform.scaleX, b: 0, c: 0, d: transform.scaleY, e: 0, f: 0,
  };

  // Skew
  const skewXRad = (transform.skewX * Math.PI) / 180;
  const skewYRad = (transform.skewY * Math.PI) / 180;
  const skew: TransformMatrix = {
    a: 1, b: Math.tan(skewYRad), c: Math.tan(skewXRad), d: 1, e: 0, f: 0,
  };

  // Combine: T * R * Sk * S
  let result = translate;
  result = multiplyMatrices(result, rotation);
  result = multiplyMatrices(result, skew);
  result = multiplyMatrices(result, scale);

  return result;
}

export function matrixToCSS(matrix: TransformMatrix): string {
  return `matrix(${matrix.a}, ${matrix.b}, ${matrix.c}, ${matrix.d}, ${matrix.e}, ${matrix.f})`;
}

export function decomposeMatrix(matrix: TransformMatrix): Transform2D {
  const { a, b, c, d, e, f } = matrix;

  const scaleX = Math.sqrt(a * a + b * b);
  const scaleY = Math.sqrt(c * c + d * d);
  const rotation = Math.atan2(b, a) * (180 / Math.PI);
  const skewX = Math.atan2(a * c + b * d, a * d - b * c) * (180 / Math.PI);

  return {
    translateX: e,
    translateY: f,
    rotate: rotation,
    scaleX,
    scaleY,
    skewX,
    skewY: 0,
    originX: 50,
    originY: 50,
  };
}

// =============================================================================
// Point & Geometry Operations
// =============================================================================

export function transformPoint(point: Point, matrix: TransformMatrix): Point {
  return {
    x: matrix.a * point.x + matrix.c * point.y + matrix.e,
    y: matrix.b * point.x + matrix.d * point.y + matrix.f,
  };
}

export function rotatePoint(point: Point, center: Point, angleDeg: number): Point {
  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = point.x - center.x;
  const dy = point.y - center.y;

  return {
    x: center.x + dx * cos - dy * sin,
    y: center.y + dx * sin + dy * cos,
  };
}

export function distance(p1: Point, p2: Point): number {
  return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
}

export function midpoint(p1: Point, p2: Point): Point {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  };
}

export function angleBetween(p1: Point, p2: Point): number {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI);
}

export function getCorners(box: BoundingBox): Point[] {
  const center: Point = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  const corners: Point[] = [
    { x: box.x, y: box.y },                                       // top-left
    { x: box.x + box.width, y: box.y },                           // top-right
    { x: box.x + box.width, y: box.y + box.height },              // bottom-right
    { x: box.x, y: box.y + box.height },                          // bottom-left
  ];

  if (box.rotation !== 0) {
    return corners.map(c => rotatePoint(c, center, box.rotation));
  }

  return corners;
}

export function getBoundingBoxFromCorners(corners: Point[]): BoundingBox {
  const xs = corners.map(c => c.x);
  const ys = corners.map(c => c.y);

  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
    rotation: 0,
  };
}

export function getAxisAlignedBounds(box: BoundingBox): BoundingBox {
  if (box.rotation === 0) return { ...box };
  const corners = getCorners(box);
  return getBoundingBoxFromCorners(corners);
}

// =============================================================================
// Resize Operations
// =============================================================================

export function getResizeHandles(box: BoundingBox): ResizeHandle[] {
  const { x, y, width, height } = box;
  const halfW = width / 2;
  const halfH = height / 2;

  const handles: ResizeHandle[] = [
    { position: 'nw', cursor: 'nw-resize', x, y },
    { position: 'n', cursor: 'n-resize', x: x + halfW, y },
    { position: 'ne', cursor: 'ne-resize', x: x + width, y },
    { position: 'e', cursor: 'e-resize', x: x + width, y: y + halfH },
    { position: 'se', cursor: 'se-resize', x: x + width, y: y + height },
    { position: 's', cursor: 's-resize', x: x + halfW, y: y + height },
    { position: 'sw', cursor: 'sw-resize', x, y: y + height },
    { position: 'w', cursor: 'w-resize', x, y: y + halfH },
  ];

  // Rotate handles if needed
  if (box.rotation !== 0) {
    const center: Point = { x: x + halfW, y: y + halfH };
    return handles.map(h => ({
      ...h,
      ...rotatePoint({ x: h.x, y: h.y }, center, box.rotation),
    }));
  }

  return handles;
}

export function calculateResize(
  handle: ResizeHandle['position'],
  startBounds: BoundingBox,
  delta: Point,
  constraints: TransformConstraints
): BoundingBox {
  let { x, y, width, height, rotation } = { ...startBounds };
  const aspectRatio = startBounds.width / startBounds.height;

  switch (handle) {
    case 'se':
      width += delta.x;
      height += delta.y;
      break;
    case 'sw':
      x += delta.x;
      width -= delta.x;
      height += delta.y;
      break;
    case 'ne':
      y += delta.y;
      width += delta.x;
      height -= delta.y;
      break;
    case 'nw':
      x += delta.x;
      y += delta.y;
      width -= delta.x;
      height -= delta.y;
      break;
    case 'n':
      y += delta.y;
      height -= delta.y;
      break;
    case 's':
      height += delta.y;
      break;
    case 'e':
      width += delta.x;
      break;
    case 'w':
      x += delta.x;
      width -= delta.x;
      break;
  }

  // Lock aspect ratio
  if (constraints.lockAspectRatio) {
    if (['n', 's'].includes(handle)) {
      width = height * aspectRatio;
    } else if (['e', 'w'].includes(handle)) {
      height = width / aspectRatio;
    } else {
      // Corner handles - use the larger delta
      const newAspect = width / height;
      if (newAspect > aspectRatio) {
        width = height * aspectRatio;
      } else {
        height = width / aspectRatio;
      }
    }
  }

  // Apply constraints
  width = Math.max(constraints.minWidth, Math.min(constraints.maxWidth, width));
  height = Math.max(constraints.minHeight, Math.min(constraints.maxHeight, height));

  // Snap to grid
  if (constraints.snapToGrid) {
    x = Math.round(x / constraints.gridSize) * constraints.gridSize;
    y = Math.round(y / constraints.gridSize) * constraints.gridSize;
    width = Math.round(width / constraints.gridSize) * constraints.gridSize;
    height = Math.round(height / constraints.gridSize) * constraints.gridSize;
  }

  return { x, y, width, height, rotation };
}

// =============================================================================
// Rotation Operations
// =============================================================================

export function calculateRotation(
  center: Point,
  currentPoint: Point,
  startAngle: number,
  constraints: TransformConstraints
): number {
  const angle = angleBetween(center, currentPoint) - startAngle;
  let normalized = ((angle % 360) + 360) % 360;

  // Snap to angle increments
  if (constraints.snapAngle > 0) {
    normalized = Math.round(normalized / constraints.snapAngle) * constraints.snapAngle;
  }

  return normalized;
}

export function getRotationCursor(angle: number): string {
  // Rotate cursor based on angle
  const normalized = ((angle % 360) + 360) % 360;
  const cursors = ['n-resize', 'ne-resize', 'e-resize', 'se-resize', 's-resize', 'sw-resize', 'w-resize', 'nw-resize'];
  const index = Math.round(normalized / 45) % 8;
  return cursors[index];
}

// =============================================================================
// Flip Operations
// =============================================================================

export function flipHorizontal(transform: Transform2D): Transform2D {
  return {
    ...transform,
    scaleX: -transform.scaleX,
  };
}

export function flipVertical(transform: Transform2D): Transform2D {
  return {
    ...transform,
    scaleY: -transform.scaleY,
  };
}

export function flipBoth(transform: Transform2D): Transform2D {
  return {
    ...transform,
    scaleX: -transform.scaleX,
    scaleY: -transform.scaleY,
  };
}

// =============================================================================
// Transform Presets
// =============================================================================

export interface TransformPreset {
  id: string;
  name: string;
  description: string;
  transform: Partial<Transform2D>;
  category: string;
}

export const TRANSFORM_PRESETS: TransformPreset[] = [
  // Scale presets
  { id: 'scale-50', name: 'Scale 50%', description: 'Reduce to half size', transform: { scaleX: 0.5, scaleY: 0.5 }, category: 'scale' },
  { id: 'scale-75', name: 'Scale 75%', description: 'Reduce to 75%', transform: { scaleX: 0.75, scaleY: 0.75 }, category: 'scale' },
  { id: 'scale-125', name: 'Scale 125%', description: 'Enlarge to 125%', transform: { scaleX: 1.25, scaleY: 1.25 }, category: 'scale' },
  { id: 'scale-150', name: 'Scale 150%', description: 'Enlarge to 150%', transform: { scaleX: 1.5, scaleY: 1.5 }, category: 'scale' },
  { id: 'scale-200', name: 'Scale 200%', description: 'Double size', transform: { scaleX: 2, scaleY: 2 }, category: 'scale' },

  // Rotation presets
  { id: 'rotate-45', name: 'Rotate 45°', description: 'Rotate 45 degrees clockwise', transform: { rotate: 45 }, category: 'rotate' },
  { id: 'rotate-90', name: 'Rotate 90°', description: 'Rotate 90 degrees clockwise', transform: { rotate: 90 }, category: 'rotate' },
  { id: 'rotate-180', name: 'Rotate 180°', description: 'Rotate 180 degrees', transform: { rotate: 180 }, category: 'rotate' },
  { id: 'rotate-270', name: 'Rotate 270°', description: 'Rotate 270 degrees clockwise', transform: { rotate: 270 }, category: 'rotate' },
  { id: 'rotate-neg45', name: 'Rotate -45°', description: 'Rotate 45 degrees counter-clockwise', transform: { rotate: -45 }, category: 'rotate' },
  { id: 'rotate-neg90', name: 'Rotate -90°', description: 'Rotate 90 degrees counter-clockwise', transform: { rotate: -90 }, category: 'rotate' },

  // Skew presets
  { id: 'skew-x-10', name: 'Skew X 10°', description: 'Skew horizontally 10 degrees', transform: { skewX: 10 }, category: 'skew' },
  { id: 'skew-x-20', name: 'Skew X 20°', description: 'Skew horizontally 20 degrees', transform: { skewX: 20 }, category: 'skew' },
  { id: 'skew-x-neg10', name: 'Skew X -10°', description: 'Skew horizontally -10 degrees', transform: { skewX: -10 }, category: 'skew' },
  { id: 'skew-y-10', name: 'Skew Y 10°', description: 'Skew vertically 10 degrees', transform: { skewY: 10 }, category: 'skew' },
  { id: 'skew-y-20', name: 'Skew Y 20°', description: 'Skew vertically 20 degrees', transform: { skewY: 20 }, category: 'skew' },
  { id: 'skew-y-neg10', name: 'Skew Y -10°', description: 'Skew vertically -10 degrees', transform: { skewY: -10 }, category: 'skew' },

  // Flip presets
  { id: 'flip-h', name: 'Flip Horizontal', description: 'Mirror horizontally', transform: { scaleX: -1 }, category: 'flip' },
  { id: 'flip-v', name: 'Flip Vertical', description: 'Mirror vertically', transform: { scaleY: -1 }, category: 'flip' },
  { id: 'flip-both', name: 'Flip Both', description: 'Mirror both axes', transform: { scaleX: -1, scaleY: -1 }, category: 'flip' },

  // Combined presets
  { id: 'tilt-card', name: 'Card Tilt', description: 'Subtle card perspective effect', transform: { rotate: -3, scaleX: 1.02, scaleY: 1.02 }, category: 'effects' },
  { id: 'lean-right', name: 'Lean Right', description: 'Slight rightward lean', transform: { skewX: -5, rotate: 2 }, category: 'effects' },
  { id: 'italic-effect', name: 'Italic Effect', description: 'Simulated italic transform', transform: { skewX: -12 }, category: 'effects' },
  { id: 'perspective-left', name: 'Perspective Left', description: 'Perspective tilt to the left', transform: { skewY: 5, rotate: -5, scaleX: 0.95 }, category: 'effects' },
  { id: 'perspective-right', name: 'Perspective Right', description: 'Perspective tilt to the right', transform: { skewY: -5, rotate: 5, scaleX: 0.95 }, category: 'effects' },

  // Reset
  { id: 'reset', name: 'Reset', description: 'Reset all transforms', transform: { translateX: 0, translateY: 0, rotate: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0 }, category: 'reset' },
];

// =============================================================================
// Transform Origin Presets
// =============================================================================

export const TRANSFORM_ORIGINS: { id: string; name: string; x: number; y: number }[] = [
  { id: 'tl', name: 'Top Left', x: 0, y: 0 },
  { id: 'tc', name: 'Top Center', x: 50, y: 0 },
  { id: 'tr', name: 'Top Right', x: 100, y: 0 },
  { id: 'ml', name: 'Middle Left', x: 0, y: 50 },
  { id: 'mc', name: 'Center', x: 50, y: 50 },
  { id: 'mr', name: 'Middle Right', x: 100, y: 50 },
  { id: 'bl', name: 'Bottom Left', x: 0, y: 100 },
  { id: 'bc', name: 'Bottom Center', x: 50, y: 100 },
  { id: 'br', name: 'Bottom Right', x: 100, y: 100 },
];

// =============================================================================
// Collision Detection
// =============================================================================

export function boxesOverlap(a: BoundingBox, b: BoundingBox): boolean {
  // Simple AABB overlap for non-rotated boxes
  if (a.rotation === 0 && b.rotation === 0) {
    return !(
      a.x + a.width < b.x ||
      b.x + b.width < a.x ||
      a.y + a.height < b.y ||
      b.y + b.height < a.y
    );
  }

  // Use SAT (Separating Axis Theorem) for rotated boxes
  const cornersA = getCorners(a);
  const cornersB = getCorners(b);

  return satOverlap(cornersA, cornersB);
}

function satOverlap(cornersA: Point[], cornersB: Point[]): boolean {
  const axes = [
    ...getAxes(cornersA),
    ...getAxes(cornersB),
  ];

  for (const axis of axes) {
    const projA = projectOntoAxis(cornersA, axis);
    const projB = projectOntoAxis(cornersB, axis);

    if (projA.max < projB.min || projB.max < projA.min) {
      return false; // Separating axis found
    }
  }

  return true;
}

function getAxes(corners: Point[]): Point[] {
  const axes: Point[] = [];
  for (let i = 0; i < corners.length; i++) {
    const next = (i + 1) % corners.length;
    const edge = {
      x: corners[next].x - corners[i].x,
      y: corners[next].y - corners[i].y,
    };
    // Perpendicular
    const length = Math.sqrt(edge.x ** 2 + edge.y ** 2);
    axes.push({
      x: -edge.y / length,
      y: edge.x / length,
    });
  }
  return axes;
}

function projectOntoAxis(corners: Point[], axis: Point): { min: number; max: number } {
  const projections = corners.map(c => c.x * axis.x + c.y * axis.y);
  return {
    min: Math.min(...projections),
    max: Math.max(...projections),
  };
}

export function pointInBox(point: Point, box: BoundingBox): boolean {
  if (box.rotation === 0) {
    return (
      point.x >= box.x &&
      point.x <= box.x + box.width &&
      point.y >= box.y &&
      point.y <= box.y + box.height
    );
  }

  // Rotate point to box's local space
  const center: Point = {
    x: box.x + box.width / 2,
    y: box.y + box.height / 2,
  };

  const localPoint = rotatePoint(point, center, -box.rotation);

  return (
    localPoint.x >= box.x &&
    localPoint.x <= box.x + box.width &&
    localPoint.y >= box.y &&
    localPoint.y <= box.y + box.height
  );
}

// =============================================================================
// Snapping
// =============================================================================

export interface SnapLine {
  type: 'horizontal' | 'vertical';
  position: number;
  source: string;
}

export function findSnapLines(
  movingBox: BoundingBox,
  otherBoxes: BoundingBox[],
  threshold: number = 5
): { snapX: number | null; snapY: number | null; lines: SnapLine[] } {
  const lines: SnapLine[] = [];
  let snapX: number | null = null;
  let snapY: number | null = null;

  const movingEdges = {
    left: movingBox.x,
    right: movingBox.x + movingBox.width,
    top: movingBox.y,
    bottom: movingBox.y + movingBox.height,
    centerX: movingBox.x + movingBox.width / 2,
    centerY: movingBox.y + movingBox.height / 2,
  };

  for (const box of otherBoxes) {
    const edges = {
      left: box.x,
      right: box.x + box.width,
      top: box.y,
      bottom: box.y + box.height,
      centerX: box.x + box.width / 2,
      centerY: box.y + box.height / 2,
    };

    // Vertical snap lines
    const vSnaps = [
      { moving: movingEdges.left, target: edges.left },
      { moving: movingEdges.left, target: edges.right },
      { moving: movingEdges.right, target: edges.left },
      { moving: movingEdges.right, target: edges.right },
      { moving: movingEdges.centerX, target: edges.centerX },
      { moving: movingEdges.left, target: edges.centerX },
      { moving: movingEdges.right, target: edges.centerX },
      { moving: movingEdges.centerX, target: edges.left },
      { moving: movingEdges.centerX, target: edges.right },
    ];

    for (const snap of vSnaps) {
      if (Math.abs(snap.moving - snap.target) < threshold) {
        snapX = snap.target - (snap.moving - movingBox.x);
        lines.push({
          type: 'vertical',
          position: snap.target,
          source: 'element',
        });
      }
    }

    // Horizontal snap lines
    const hSnaps = [
      { moving: movingEdges.top, target: edges.top },
      { moving: movingEdges.top, target: edges.bottom },
      { moving: movingEdges.bottom, target: edges.top },
      { moving: movingEdges.bottom, target: edges.bottom },
      { moving: movingEdges.centerY, target: edges.centerY },
      { moving: movingEdges.top, target: edges.centerY },
      { moving: movingEdges.bottom, target: edges.centerY },
      { moving: movingEdges.centerY, target: edges.top },
      { moving: movingEdges.centerY, target: edges.bottom },
    ];

    for (const snap of hSnaps) {
      if (Math.abs(snap.moving - snap.target) < threshold) {
        snapY = snap.target - (snap.moving - movingBox.y);
        lines.push({
          type: 'horizontal',
          position: snap.target,
          source: 'element',
        });
      }
    }
  }

  return { snapX, snapY, lines };
}

// =============================================================================
// Measurement Helpers
// =============================================================================

export function measureDistance(box1: BoundingBox, box2: BoundingBox): {
  horizontal: number;
  vertical: number;
  diagonal: number;
} {
  const center1: Point = { x: box1.x + box1.width / 2, y: box1.y + box1.height / 2 };
  const center2: Point = { x: box2.x + box2.width / 2, y: box2.y + box2.height / 2 };

  return {
    horizontal: Math.abs(center2.x - center1.x),
    vertical: Math.abs(center2.y - center1.y),
    diagonal: distance(center1, center2),
  };
}

export function getSpacingBetween(box1: BoundingBox, box2: BoundingBox): {
  top: number | null;
  right: number | null;
  bottom: number | null;
  left: number | null;
} {
  return {
    top: box1.y > box2.y + box2.height ? box1.y - (box2.y + box2.height) : null,
    right: box2.x > box1.x + box1.width ? box2.x - (box1.x + box1.width) : null,
    bottom: box2.y > box1.y + box1.height ? box2.y - (box1.y + box1.height) : null,
    left: box1.x > box2.x + box2.width ? box1.x - (box2.x + box2.width) : null,
  };
}

export function getCombinedBounds(boxes: BoundingBox[]): BoundingBox | null {
  if (boxes.length === 0) return null;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  for (const box of boxes) {
    const aabb = getAxisAlignedBounds(box);
    minX = Math.min(minX, aabb.x);
    minY = Math.min(minY, aabb.y);
    maxX = Math.max(maxX, aabb.x + aabb.width);
    maxY = Math.max(maxY, aabb.y + aabb.height);
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
    rotation: 0,
  };
}
