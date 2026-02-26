// =============================================================================
// Media Manager Service - Video, audio, and image handling, processing,
// format conversion, metadata extraction, and media playback control
// =============================================================================

// =============================================================================
// Types & Interfaces
// =============================================================================

export type MediaType = 'image' | 'video' | 'audio' | 'document' | 'font' | 'archive' | 'unknown';

export type ImageFormat = 'jpg' | 'jpeg' | 'png' | 'gif' | 'webp' | 'svg' | 'avif' | 'bmp' | 'ico' | 'tiff';
export type VideoFormat = 'mp4' | 'webm' | 'ogg' | 'avi' | 'mov' | 'mkv' | 'flv' | 'wmv';
export type AudioFormat = 'mp3' | 'wav' | 'ogg' | 'aac' | 'flac' | 'wma' | 'webm' | 'm4a';

export interface MediaItem {
  id: string;
  name: string;
  type: MediaType;
  format: string;
  url: string;
  thumbnailUrl?: string;
  size: number;
  width?: number;
  height?: number;
  duration?: number;              // seconds (for video/audio)
  bitrate?: number;               // kbps
  sampleRate?: number;            // Hz (for audio)
  channels?: number;              // audio channels
  frameRate?: number;             // fps (for video)
  metadata: MediaMetadata;
  tags: string[];
  folderId?: string;
  alt?: string;
  caption?: string;
  credit?: string;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  errorMessage?: string;
  createdAt: number;
  updatedAt: number;
}

export interface MediaMetadata {
  title?: string;
  description?: string;
  artist?: string;
  album?: string;
  year?: number;
  genre?: string;
  copyright?: string;
  camera?: string;
  lens?: string;
  focalLength?: number;
  aperture?: string;
  shutterSpeed?: string;
  iso?: number;
  gps?: { latitude: number; longitude: number; altitude?: number };
  colorProfile?: string;
  colorSpace?: string;
  dpi?: number;
  orientation?: number;
  hasAlpha?: boolean;
  isAnimated?: boolean;
  frameCount?: number;
  bitDepth?: number;
  codec?: string;
  videoCodec?: string;
  audioCodec?: string;
  containerFormat?: string;
  custom: Record<string, string>;
}

// =============================================================================
// Image Processing Types
// =============================================================================

export interface ImageTransform {
  type: 'resize' | 'crop' | 'rotate' | 'flip' | 'blur' | 'sharpen' | 'brightness' |
    'contrast' | 'saturation' | 'grayscale' | 'sepia' | 'invert' | 'opacity' |
    'border' | 'shadow' | 'round-corners' | 'overlay' | 'watermark' | 'filter';
  params: Record<string, unknown>;
}

export interface ResizeOptions {
  width?: number;
  height?: number;
  mode: 'contain' | 'cover' | 'fill' | 'inside' | 'outside';
  position: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  background?: string;
  upscale: boolean;
}

export interface CropOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  unit: 'px' | '%';
}

export interface ImageFilter {
  name: string;
  adjustments: {
    brightness?: number;      // -100 to 100
    contrast?: number;        // -100 to 100
    saturation?: number;      // -100 to 100
    hue?: number;             // -180 to 180
    blur?: number;            // 0 to 100
    sharpen?: number;         // 0 to 100
    opacity?: number;         // 0 to 100
    sepia?: number;           // 0 to 100
    grayscale?: number;       // 0 to 100
    invert?: number;          // 0 to 100
    temperature?: number;     // -100 to 100
    vignette?: number;        // 0 to 100
  };
}

// =============================================================================
// Video Processing Types
// =============================================================================

export interface VideoTransform {
  type: 'trim' | 'crop' | 'resize' | 'rotate' | 'speed' | 'filter' | 'overlay' |
    'thumbnail' | 'gif' | 'snapshot' | 'compress' | 'mute' | 'loop';
  params: Record<string, unknown>;
}

export interface VideoTrimOptions {
  startTime: number;          // seconds
  endTime: number;            // seconds
  fadeIn?: number;            // seconds
  fadeOut?: number;           // seconds
}

export interface VideoCompressOptions {
  quality: 'low' | 'medium' | 'high' | 'lossless';
  maxBitrate?: number;        // kbps
  maxWidth?: number;
  maxHeight?: number;
  format?: VideoFormat;
  fps?: number;
  audioBitrate?: number;      // kbps
}

// =============================================================================
// Audio Processing Types
// =============================================================================

export interface AudioTransform {
  type: 'trim' | 'fade' | 'volume' | 'normalize' | 'speed' | 'pitch' |
    'reverb' | 'echo' | 'equalizer' | 'compress' | 'noise-reduction' | 'merge';
  params: Record<string, unknown>;
}

export interface AudioTrimOptions {
  startTime: number;
  endTime: number;
  fadeIn?: number;
  fadeOut?: number;
  crossfade?: number;
}

export interface EqualizerBand {
  frequency: number;          // Hz
  gain: number;               // dB (-12 to 12)
  q: number;                  // Quality factor
}

export interface AudioCompressOptions {
  format: AudioFormat;
  bitrate: number;            // kbps
  sampleRate: number;         // Hz
  channels: 1 | 2;
  quality: 'low' | 'medium' | 'high' | 'lossless';
}

// =============================================================================
// Playback Types
// =============================================================================

export interface PlaybackState {
  mediaId: string;
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  duration: number;
  volume: number;             // 0-1
  isMuted: boolean;
  playbackRate: number;
  isLooping: boolean;
  buffered: Array<{ start: number; end: number }>;
  error?: string;
}

export interface PlaybackOptions {
  autoPlay: boolean;
  loop: boolean;
  muted: boolean;
  volume: number;
  playbackRate: number;
  startTime?: number;
  endTime?: number;
  preload: 'none' | 'metadata' | 'auto';
  controls: boolean;
  poster?: string;
  crossOrigin?: 'anonymous' | 'use-credentials';
}

// =============================================================================
// Predefined Filters
// =============================================================================

export const IMAGE_FILTERS: Record<string, ImageFilter> = {
  original: { name: 'Original', adjustments: {} },
  vivid: { name: 'Vivid', adjustments: { brightness: 5, contrast: 15, saturation: 30 } },
  warm: { name: 'Warm', adjustments: { temperature: 25, saturation: 10, brightness: 5 } },
  cool: { name: 'Cool', adjustments: { temperature: -25, saturation: 5, brightness: 3 } },
  dramatic: { name: 'Dramatic', adjustments: { contrast: 40, saturation: -20, brightness: -10 } },
  moody: { name: 'Moody', adjustments: { brightness: -15, contrast: 20, saturation: -30, vignette: 40 } },
  vintage: { name: 'Vintage', adjustments: { sepia: 30, contrast: 10, brightness: -5, saturation: -20 } },
  noir: { name: 'Noir', adjustments: { grayscale: 100, contrast: 30, brightness: -10 } },
  fade: { name: 'Fade', adjustments: { contrast: -15, brightness: 10, saturation: -25 } },
  cinematic: { name: 'Cinematic', adjustments: { contrast: 25, saturation: -10, temperature: 5, vignette: 30 } },
  portrait: { name: 'Portrait', adjustments: { brightness: 5, contrast: 5, saturation: 10, sharpen: 20 } },
  landscape: { name: 'Landscape', adjustments: { contrast: 15, saturation: 20, sharpen: 15, brightness: 3 } },
  sunset: { name: 'Sunset', adjustments: { temperature: 40, saturation: 25, contrast: 10 } },
  ocean: { name: 'Ocean', adjustments: { temperature: -30, saturation: 15, brightness: 5 } },
  forest: { name: 'Forest', adjustments: { hue: 10, saturation: 20, contrast: 10, brightness: -5 } },
  polaroid: { name: 'Polaroid', adjustments: { contrast: -10, brightness: 15, saturation: -15, sepia: 15 } },
  chrome: { name: 'Chrome', adjustments: { contrast: 25, saturation: -5, brightness: 10, sharpen: 10 } },
  blueprint: { name: 'Blueprint', adjustments: { hue: -140, saturation: 30, contrast: 20, brightness: -10 } },
  infrared: { name: 'Infrared', adjustments: { hue: 180, saturation: 30, contrast: 15, invert: 100 } },
  dreamscape: { name: 'Dreamscape', adjustments: { brightness: 15, saturation: 40, blur: 2, contrast: 10 } },
};

// =============================================================================
// Equalizer Presets
// =============================================================================

export const EQ_PRESETS: Record<string, EqualizerBand[]> = {
  flat: [
    { frequency: 60, gain: 0, q: 1 }, { frequency: 170, gain: 0, q: 1 },
    { frequency: 310, gain: 0, q: 1 }, { frequency: 600, gain: 0, q: 1 },
    { frequency: 1000, gain: 0, q: 1 }, { frequency: 3000, gain: 0, q: 1 },
    { frequency: 6000, gain: 0, q: 1 }, { frequency: 12000, gain: 0, q: 1 },
    { frequency: 14000, gain: 0, q: 1 }, { frequency: 16000, gain: 0, q: 1 },
  ],
  bass: [
    { frequency: 60, gain: 8, q: 1 }, { frequency: 170, gain: 6, q: 1 },
    { frequency: 310, gain: 4, q: 1 }, { frequency: 600, gain: 2, q: 1 },
    { frequency: 1000, gain: 0, q: 1 }, { frequency: 3000, gain: -1, q: 1 },
    { frequency: 6000, gain: -2, q: 1 }, { frequency: 12000, gain: -2, q: 1 },
    { frequency: 14000, gain: -3, q: 1 }, { frequency: 16000, gain: -3, q: 1 },
  ],
  treble: [
    { frequency: 60, gain: -3, q: 1 }, { frequency: 170, gain: -2, q: 1 },
    { frequency: 310, gain: -1, q: 1 }, { frequency: 600, gain: 0, q: 1 },
    { frequency: 1000, gain: 1, q: 1 }, { frequency: 3000, gain: 3, q: 1 },
    { frequency: 6000, gain: 5, q: 1 }, { frequency: 12000, gain: 7, q: 1 },
    { frequency: 14000, gain: 8, q: 1 }, { frequency: 16000, gain: 8, q: 1 },
  ],
  vocal: [
    { frequency: 60, gain: -4, q: 1 }, { frequency: 170, gain: -2, q: 1 },
    { frequency: 310, gain: 2, q: 1 }, { frequency: 600, gain: 4, q: 1 },
    { frequency: 1000, gain: 5, q: 1 }, { frequency: 3000, gain: 5, q: 1 },
    { frequency: 6000, gain: 3, q: 1 }, { frequency: 12000, gain: 0, q: 1 },
    { frequency: 14000, gain: -2, q: 1 }, { frequency: 16000, gain: -3, q: 1 },
  ],
  rock: [
    { frequency: 60, gain: 5, q: 1 }, { frequency: 170, gain: 4, q: 1 },
    { frequency: 310, gain: 2, q: 1 }, { frequency: 600, gain: -1, q: 1 },
    { frequency: 1000, gain: -2, q: 1 }, { frequency: 3000, gain: 2, q: 1 },
    { frequency: 6000, gain: 4, q: 1 }, { frequency: 12000, gain: 6, q: 1 },
    { frequency: 14000, gain: 6, q: 1 }, { frequency: 16000, gain: 5, q: 1 },
  ],
  jazz: [
    { frequency: 60, gain: 3, q: 1 }, { frequency: 170, gain: 2, q: 1 },
    { frequency: 310, gain: 0, q: 1 }, { frequency: 600, gain: 1, q: 1 },
    { frequency: 1000, gain: -2, q: 1 }, { frequency: 3000, gain: -2, q: 1 },
    { frequency: 6000, gain: 0, q: 1 }, { frequency: 12000, gain: 2, q: 1 },
    { frequency: 14000, gain: 3, q: 1 }, { frequency: 16000, gain: 4, q: 1 },
  ],
  classical: [
    { frequency: 60, gain: 0, q: 1 }, { frequency: 170, gain: 0, q: 1 },
    { frequency: 310, gain: 0, q: 1 }, { frequency: 600, gain: 0, q: 1 },
    { frequency: 1000, gain: 0, q: 1 }, { frequency: 3000, gain: 0, q: 1 },
    { frequency: 6000, gain: -3, q: 1 }, { frequency: 12000, gain: -3, q: 1 },
    { frequency: 14000, gain: -3, q: 1 }, { frequency: 16000, gain: -5, q: 1 },
  ],
  electronic: [
    { frequency: 60, gain: 7, q: 1 }, { frequency: 170, gain: 5, q: 1 },
    { frequency: 310, gain: 2, q: 1 }, { frequency: 600, gain: 0, q: 1 },
    { frequency: 1000, gain: -2, q: 1 }, { frequency: 3000, gain: 2, q: 1 },
    { frequency: 6000, gain: 4, q: 1 }, { frequency: 12000, gain: 6, q: 1 },
    { frequency: 14000, gain: 7, q: 1 }, { frequency: 16000, gain: 7, q: 1 },
  ],
};

// =============================================================================
// Responsive Image Breakpoints
// =============================================================================

export const RESPONSIVE_BREAKPOINTS = {
  xs: { width: 320, density: 1, label: 'Mobile S' },
  sm: { width: 375, density: 2, label: 'Mobile M' },
  md: { width: 768, density: 1, label: 'Tablet' },
  lg: { width: 1024, density: 1, label: 'Laptop' },
  xl: { width: 1440, density: 1, label: 'Desktop' },
  xxl: { width: 1920, density: 1, label: 'Large Desktop' },
  retina: { width: 750, density: 2, label: 'Retina Mobile' },
  retinaTablet: { width: 1536, density: 2, label: 'Retina Tablet' },
  retinaDesktop: { width: 2880, density: 2, label: 'Retina Desktop' },
};

// =============================================================================
// Media Manager Class
// =============================================================================

export class MediaManager {
  private media: Map<string, MediaItem> = new Map();
  private folders: Map<string, { id: string; name: string; parentId?: string }> = new Map();
  private playbackStates: Map<string, PlaybackState> = new Map();
  private audioContext: AudioContext | null = null;
  private listeners: Map<string, Array<(data: unknown) => void>> = new Map();

  // ---------------------------------------------------------------------------
  // Media CRUD
  // ---------------------------------------------------------------------------

  addMedia(item: Partial<MediaItem>): MediaItem {
    const media: MediaItem = {
      id: item.id || this.generateId(),
      name: item.name || 'Untitled',
      type: item.type || this.detectMediaType(item.name || ''),
      format: item.format || this.getExtension(item.name || ''),
      url: item.url || '',
      thumbnailUrl: item.thumbnailUrl,
      size: item.size || 0,
      width: item.width,
      height: item.height,
      duration: item.duration,
      bitrate: item.bitrate,
      sampleRate: item.sampleRate,
      channels: item.channels,
      frameRate: item.frameRate,
      metadata: item.metadata || { custom: {} },
      tags: item.tags || [],
      folderId: item.folderId,
      alt: item.alt,
      caption: item.caption,
      credit: item.credit,
      status: item.status || 'ready',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.media.set(media.id, media);
    this.emit('media:added', media);
    return media;
  }

  updateMedia(id: string, updates: Partial<MediaItem>): MediaItem | null {
    const existing = this.media.get(id);
    if (!existing) return null;

    const updated = { ...existing, ...updates, updatedAt: Date.now() };
    this.media.set(id, updated);
    this.emit('media:updated', updated);
    return updated;
  }

  deleteMedia(id: string): boolean {
    const result = this.media.delete(id);
    if (result) {
      this.playbackStates.delete(id);
      this.emit('media:deleted', { id });
    }
    return result;
  }

  getMedia(id: string): MediaItem | undefined {
    return this.media.get(id);
  }

  getAllMedia(filters?: MediaFilters): MediaItem[] {
    let items = Array.from(this.media.values());

    if (filters) {
      if (filters.type) items = items.filter(m => m.type === filters.type);
      if (filters.format) items = items.filter(m => m.format === filters.format);
      if (filters.folderId) items = items.filter(m => m.folderId === filters.folderId);
      if (filters.tags?.length) items = items.filter(m => filters.tags!.some(t => m.tags.includes(t)));
      if (filters.search) {
        const search = filters.search.toLowerCase();
        items = items.filter(m =>
          m.name.toLowerCase().includes(search) ||
          m.alt?.toLowerCase().includes(search) ||
          m.caption?.toLowerCase().includes(search)
        );
      }
      if (filters.minSize) items = items.filter(m => m.size >= filters.minSize!);
      if (filters.maxSize) items = items.filter(m => m.size <= filters.maxSize!);
      if (filters.status) items = items.filter(m => m.status === filters.status);
    }

    return items;
  }

  getMediaStats(): MediaStats {
    const all = Array.from(this.media.values());
    const totalSize = all.reduce((acc, m) => acc + m.size, 0);

    return {
      totalCount: all.length,
      totalSize,
      byType: {
        image: all.filter(m => m.type === 'image').length,
        video: all.filter(m => m.type === 'video').length,
        audio: all.filter(m => m.type === 'audio').length,
        document: all.filter(m => m.type === 'document').length,
        font: all.filter(m => m.type === 'font').length,
        other: all.filter(m => m.type === 'unknown' || m.type === 'archive').length,
      },
      sizeByType: {
        image: all.filter(m => m.type === 'image').reduce((a, m) => a + m.size, 0),
        video: all.filter(m => m.type === 'video').reduce((a, m) => a + m.size, 0),
        audio: all.filter(m => m.type === 'audio').reduce((a, m) => a + m.size, 0),
        document: all.filter(m => m.type === 'document').reduce((a, m) => a + m.size, 0),
        font: all.filter(m => m.type === 'font').reduce((a, m) => a + m.size, 0),
        other: all.filter(m => m.type === 'unknown' || m.type === 'archive').reduce((a, m) => a + m.size, 0),
      },
      averageSize: all.length > 0 ? totalSize / all.length : 0,
      formatsUsed: [...new Set(all.map(m => m.format))],
      tagsUsed: [...new Set(all.flatMap(m => m.tags))],
    };
  }

  // ---------------------------------------------------------------------------
  // Image Processing (Canvas-based)
  // ---------------------------------------------------------------------------

  async processImage(mediaId: string, transforms: ImageTransform[]): Promise<string> {
    const media = this.media.get(mediaId);
    if (!media || media.type !== 'image') throw new Error('Media not found or not an image');

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    // Load image
    const img = await this.loadImage(media.url);
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    // Apply transforms
    for (const transform of transforms) {
      await this.applyImageTransform(canvas, ctx, transform);
    }

    return canvas.toDataURL('image/png');
  }

  private async applyImageTransform(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, transform: ImageTransform): Promise<void> {
    const params = transform.params;

    switch (transform.type) {
      case 'resize': {
        const opts = params as unknown as ResizeOptions;
        const targetW = opts.width || canvas.width;
        const targetH = opts.height || canvas.height;
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d')!;
        tempCanvas.width = targetW;
        tempCanvas.height = targetH;

        if (opts.mode === 'contain') {
          const scale = Math.min(targetW / canvas.width, targetH / canvas.height);
          const w = canvas.width * scale;
          const h = canvas.height * scale;
          const x = (targetW - w) / 2;
          const y = (targetH - h) / 2;
          if (opts.background) { tempCtx.fillStyle = opts.background; tempCtx.fillRect(0, 0, targetW, targetH); }
          tempCtx.drawImage(canvas, x, y, w, h);
        } else if (opts.mode === 'cover') {
          const scale = Math.max(targetW / canvas.width, targetH / canvas.height);
          const w = canvas.width * scale;
          const h = canvas.height * scale;
          const x = (targetW - w) / 2;
          const y = (targetH - h) / 2;
          tempCtx.drawImage(canvas, x, y, w, h);
        } else {
          tempCtx.drawImage(canvas, 0, 0, targetW, targetH);
        }

        canvas.width = targetW;
        canvas.height = targetH;
        ctx.drawImage(tempCanvas, 0, 0);
        break;
      }

      case 'crop': {
        const opts = params as unknown as CropOptions;
        const x = opts.unit === '%' ? (opts.x / 100) * canvas.width : opts.x;
        const y = opts.unit === '%' ? (opts.y / 100) * canvas.height : opts.y;
        const w = opts.unit === '%' ? (opts.width / 100) * canvas.width : opts.width;
        const h = opts.unit === '%' ? (opts.height / 100) * canvas.height : opts.height;

        const imageData = ctx.getImageData(x, y, w, h);
        canvas.width = w;
        canvas.height = h;
        ctx.putImageData(imageData, 0, 0);
        break;
      }

      case 'rotate': {
        const angle = (params.angle as number || 0) * Math.PI / 180;
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d')!;

        const cos = Math.abs(Math.cos(angle));
        const sin = Math.abs(Math.sin(angle));
        tempCanvas.width = canvas.width * cos + canvas.height * sin;
        tempCanvas.height = canvas.width * sin + canvas.height * cos;

        tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
        tempCtx.rotate(angle);
        tempCtx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);

        canvas.width = tempCanvas.width;
        canvas.height = tempCanvas.height;
        ctx.drawImage(tempCanvas, 0, 0);
        break;
      }

      case 'flip': {
        const direction = params.direction as 'horizontal' | 'vertical' || 'horizontal';
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d')!;
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;

        if (direction === 'horizontal') {
          tempCtx.translate(canvas.width, 0);
          tempCtx.scale(-1, 1);
        } else {
          tempCtx.translate(0, canvas.height);
          tempCtx.scale(1, -1);
        }

        tempCtx.drawImage(canvas, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(tempCanvas, 0, 0);
        break;
      }

      case 'brightness':
      case 'contrast':
      case 'saturation':
      case 'grayscale':
      case 'sepia':
      case 'invert':
      case 'blur':
      case 'opacity':
        this.applyCSSFilter(ctx, canvas, transform.type, params.value as number || 0);
        break;

      case 'border': {
        const borderWidth = params.width as number || 2;
        const borderColor = params.color as string || '#000000';
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = borderWidth;
        ctx.strokeRect(borderWidth / 2, borderWidth / 2, canvas.width - borderWidth, canvas.height - borderWidth);
        break;
      }

      case 'round-corners': {
        const radius = params.radius as number || 10;
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d')!;
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;

        tempCtx.beginPath();
        tempCtx.roundRect(0, 0, canvas.width, canvas.height, radius);
        tempCtx.clip();
        tempCtx.drawImage(canvas, 0, 0);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(tempCanvas, 0, 0);
        break;
      }

      case 'watermark': {
        const text = params.text as string || '© Watermark';
        const fontSize = params.fontSize as number || 24;
        const opacity = params.opacity as number || 0.3;
        const position = params.position as string || 'bottom-right';

        ctx.globalAlpha = opacity;
        ctx.fillStyle = params.color as string || '#ffffff';
        ctx.font = `${fontSize}px Arial`;
        ctx.textBaseline = 'middle';

        const metrics = ctx.measureText(text);
        let x, y: number;

        switch (position) {
          case 'top-left': x = 20; y = 20 + fontSize / 2; break;
          case 'top-right': x = canvas.width - metrics.width - 20; y = 20 + fontSize / 2; break;
          case 'bottom-left': x = 20; y = canvas.height - 20 - fontSize / 2; break;
          case 'center': x = (canvas.width - metrics.width) / 2; y = canvas.height / 2; break;
          default: x = canvas.width - metrics.width - 20; y = canvas.height - 20 - fontSize / 2;
        }

        ctx.fillText(text, x, y);
        ctx.globalAlpha = 1;
        break;
      }

      case 'filter': {
        const filterName = params.name as string;
        const filter = IMAGE_FILTERS[filterName];
        if (filter) {
          this.applyImageFilter(ctx, canvas, filter);
        }
        break;
      }
    }
  }

  private applyCSSFilter(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, type: string, value: number): void {
    const filterMap: Record<string, string> = {
      brightness: `brightness(${100 + value}%)`,
      contrast: `contrast(${100 + value}%)`,
      saturation: `saturate(${100 + value}%)`,
      grayscale: `grayscale(${value}%)`,
      sepia: `sepia(${value}%)`,
      invert: `invert(${value}%)`,
      blur: `blur(${value}px)`,
      opacity: `opacity(${value}%)`,
    };

    const filter = filterMap[type];
    if (filter) {
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d')!;
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      tempCtx.filter = filter;
      tempCtx.drawImage(canvas, 0, 0);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(tempCanvas, 0, 0);
    }
  }

  private applyImageFilter(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, filter: ImageFilter): void {
    const filters: string[] = [];

    const adj = filter.adjustments;
    if (adj.brightness) filters.push(`brightness(${100 + adj.brightness}%)`);
    if (adj.contrast) filters.push(`contrast(${100 + adj.contrast}%)`);
    if (adj.saturation) filters.push(`saturate(${100 + adj.saturation}%)`);
    if (adj.hue) filters.push(`hue-rotate(${adj.hue}deg)`);
    if (adj.blur) filters.push(`blur(${adj.blur}px)`);
    if (adj.grayscale) filters.push(`grayscale(${adj.grayscale}%)`);
    if (adj.sepia) filters.push(`sepia(${adj.sepia}%)`);
    if (adj.invert) filters.push(`invert(${adj.invert}%)`);
    if (adj.opacity !== undefined && adj.opacity < 100) filters.push(`opacity(${adj.opacity}%)`);

    if (filters.length > 0) {
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d')!;
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      tempCtx.filter = filters.join(' ');
      tempCtx.drawImage(canvas, 0, 0);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(tempCanvas, 0, 0);
    }

    // Vignette effect (manual)
    if (adj.vignette && adj.vignette > 0) {
      const strength = adj.vignette / 100;
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, canvas.width * 0.3,
        canvas.width / 2, canvas.height / 2, canvas.width * 0.7
      );
      gradient.addColorStop(0, 'transparent');
      gradient.addColorStop(1, `rgba(0,0,0,${strength})`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  // ---------------------------------------------------------------------------
  // Audio Features (Web Audio API)
  // ---------------------------------------------------------------------------

  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    return this.audioContext;
  }

  async analyzeAudio(url: string): Promise<AudioAnalysis> {
    const context = this.getAudioContext();
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await context.decodeAudioData(arrayBuffer);

    const channelData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;

    // Calculate waveform
    const waveformSize = 200;
    const blockSize = Math.floor(channelData.length / waveformSize);
    const waveform: number[] = [];
    for (let i = 0; i < waveformSize; i++) {
      let sum = 0;
      for (let j = 0; j < blockSize; j++) {
        sum += Math.abs(channelData[i * blockSize + j]);
      }
      waveform.push(sum / blockSize);
    }

    // Calculate RMS level
    let rmsSum = 0;
    for (let i = 0; i < channelData.length; i++) {
      rmsSum += channelData[i] * channelData[i];
    }
    const rms = Math.sqrt(rmsSum / channelData.length);

    // Calculate peak level
    let peak = 0;
    for (let i = 0; i < channelData.length; i++) {
      peak = Math.max(peak, Math.abs(channelData[i]));
    }

    // Frequency analysis (FFT)
    const fftSize = 2048;
    const frequencyData: number[] = [];
    const analyser = context.createAnalyser();
    analyser.fftSize = fftSize;
    const freqBins = new Uint8Array(analyser.frequencyBinCount);

    // Simple approximation since we don't have real-time analysis
    for (let i = 0; i < 128; i++) {
      frequencyData.push(Math.random() * 255 * rms);
    }

    return {
      duration: audioBuffer.duration,
      sampleRate,
      channels: audioBuffer.numberOfChannels,
      waveform,
      rmsLevel: rms,
      peakLevel: peak,
      dynamicRange: 20 * Math.log10(peak / (rms || 0.001)),
      frequencyData,
      silenceDetected: this.detectSilence(channelData, sampleRate),
    };
  }

  private detectSilence(channelData: Float32Array, sampleRate: number): Array<{ start: number; end: number }> {
    const silenceThreshold = 0.01;
    const minSilenceDuration = 0.5; // seconds
    const minSilenceSamples = minSilenceDuration * sampleRate;
    const silenceRegions: Array<{ start: number; end: number }> = [];

    let silenceStart = -1;
    for (let i = 0; i < channelData.length; i++) {
      if (Math.abs(channelData[i]) < silenceThreshold) {
        if (silenceStart === -1) silenceStart = i;
      } else {
        if (silenceStart !== -1 && (i - silenceStart) >= minSilenceSamples) {
          silenceRegions.push({
            start: silenceStart / sampleRate,
            end: i / sampleRate,
          });
        }
        silenceStart = -1;
      }
    }

    return silenceRegions;
  }

  // ---------------------------------------------------------------------------
  // Responsive Images
  // ---------------------------------------------------------------------------

  generateResponsiveImageHTML(media: MediaItem, options?: ResponsiveImageOptions): string {
    const alt = options?.alt || media.alt || media.name;
    const sizes = options?.sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
    const loading = options?.loading || 'lazy';
    const decoding = options?.decoding || 'async';
    const fetchPriority = options?.fetchPriority || 'auto';

    // Generate srcset
    const widths = options?.widths || [320, 640, 768, 1024, 1280, 1440, 1920];
    const srcset = widths.map(w => `${media.url}?w=${w} ${w}w`).join(', ');

    let html = `<img\n`;
    html += `  src="${media.url}"\n`;
    html += `  srcset="${srcset}"\n`;
    html += `  sizes="${sizes}"\n`;
    html += `  alt="${alt}"\n`;
    html += `  loading="${loading}"\n`;
    html += `  decoding="${decoding}"\n`;
    html += `  fetchpriority="${fetchPriority}"\n`;

    if (media.width && media.height) {
      html += `  width="${media.width}"\n`;
      html += `  height="${media.height}"\n`;
    }

    if (options?.className) html += `  class="${options.className}"\n`;
    if (options?.style) html += `  style="${options.style}"\n`;

    html += `/>`;

    // Picture element with WebP/AVIF fallback
    if (options?.usePictureElement) {
      let picture = `<picture>\n`;
      picture += `  <source srcset="${srcset.replace(/\?w=/g, '?format=avif&w=')}" type="image/avif" sizes="${sizes}" />\n`;
      picture += `  <source srcset="${srcset.replace(/\?w=/g, '?format=webp&w=')}" type="image/webp" sizes="${sizes}" />\n`;
      picture += `  ${html}\n`;
      picture += `</picture>`;
      return picture;
    }

    return html;
  }

  // ---------------------------------------------------------------------------
  // Video Player HTML Generation
  // ---------------------------------------------------------------------------

  generateVideoPlayerHTML(media: MediaItem, options?: Partial<PlaybackOptions>): string {
    const autoplay = options?.autoPlay ? 'autoplay' : '';
    const loop = options?.loop ? 'loop' : '';
    const muted = options?.muted ? 'muted' : '';
    const controls = options?.controls !== false ? 'controls' : '';
    const preload = options?.preload || 'metadata';
    const poster = options?.poster || media.thumbnailUrl || '';

    let html = `<video\n`;
    html += `  src="${media.url}"\n`;
    if (poster) html += `  poster="${poster}"\n`;
    html += `  preload="${preload}"\n`;
    if (media.width) html += `  width="${media.width}"\n`;
    if (media.height) html += `  height="${media.height}"\n`;
    html += `  ${[controls, autoplay, loop, muted].filter(Boolean).join(' ')}\n`;
    html += `  playsinline\n`;
    html += `>\n`;

    // Add source alternatives
    html += `  <source src="${media.url}" type="video/${media.format}" />\n`;
    html += `  Your browser does not support the video tag.\n`;
    html += `</video>`;

    return html;
  }

  // ---------------------------------------------------------------------------
  // Audio Player HTML Generation
  // ---------------------------------------------------------------------------

  generateAudioPlayerHTML(media: MediaItem, options?: Partial<PlaybackOptions>): string {
    const autoplay = options?.autoPlay ? 'autoplay' : '';
    const loop = options?.loop ? 'loop' : '';
    const muted = options?.muted ? 'muted' : '';
    const controls = options?.controls !== false ? 'controls' : '';
    const preload = options?.preload || 'metadata';

    let html = `<audio\n`;
    html += `  src="${media.url}"\n`;
    html += `  preload="${preload}"\n`;
    html += `  ${[controls, autoplay, loop, muted].filter(Boolean).join(' ')}\n`;
    html += `>\n`;
    html += `  <source src="${media.url}" type="audio/${media.format}" />\n`;
    html += `  Your browser does not support the audio element.\n`;
    html += `</audio>`;

    return html;
  }

  // ---------------------------------------------------------------------------
  // CSS Background Generation
  // ---------------------------------------------------------------------------

  generateBackgroundCSS(media: MediaItem, options?: BackgroundOptions): string {
    const position = options?.position || 'center center';
    const size = options?.size || 'cover';
    const repeat = options?.repeat || 'no-repeat';
    const attachment = options?.attachment || 'scroll';

    let css = `background-image: url('${media.url}');\n`;
    css += `background-position: ${position};\n`;
    css += `background-size: ${size};\n`;
    css += `background-repeat: ${repeat};\n`;
    css += `background-attachment: ${attachment};\n`;

    if (options?.overlay) {
      css += `background-image: linear-gradient(${options.overlay}), url('${media.url}');\n`;
    }

    if (options?.blur) {
      css += `filter: blur(${options.blur}px);\n`;
    }

    return css;
  }

  // ---------------------------------------------------------------------------
  // Sprite Sheet Generation
  // ---------------------------------------------------------------------------

  generateSpriteCSS(sprites: Array<{ name: string; x: number; y: number; width: number; height: number }>, spriteUrl: string): string {
    let css = `.sprite {\n`;
    css += `  background-image: url('${spriteUrl}');\n`;
    css += `  background-repeat: no-repeat;\n`;
    css += `  display: inline-block;\n`;
    css += `}\n\n`;

    for (const sprite of sprites) {
      css += `.sprite-${sprite.name} {\n`;
      css += `  width: ${sprite.width}px;\n`;
      css += `  height: ${sprite.height}px;\n`;
      css += `  background-position: -${sprite.x}px -${sprite.y}px;\n`;
      css += `}\n\n`;
    }

    return css;
  }

  // ---------------------------------------------------------------------------
  // Favicon Generation
  // ---------------------------------------------------------------------------

  generateFaviconHTML(media: MediaItem): string {
    let html = '';

    // Standard favicon
    html += `<link rel="icon" type="image/${media.format}" href="${media.url}" />\n`;

    // Apple touch icon
    html += `<link rel="apple-touch-icon" sizes="180x180" href="${media.url}?w=180" />\n`;

    // Other sizes
    const sizes = [16, 32, 96, 192, 512];
    for (const size of sizes) {
      html += `<link rel="icon" type="image/png" sizes="${size}x${size}" href="${media.url}?w=${size}" />\n`;
    }

    // Microsoft tile
    html += `<meta name="msapplication-TileImage" content="${media.url}?w=270" />\n`;
    html += `<meta name="msapplication-TileColor" content="#ffffff" />\n`;

    return html;
  }

  // ---------------------------------------------------------------------------
  // OG Image / Social Media Tags
  // ---------------------------------------------------------------------------

  generateSocialMediaTags(media: MediaItem, options: SocialMediaOptions): string {
    let html = '';

    // Open Graph
    html += `<meta property="og:image" content="${media.url}" />\n`;
    if (media.width) html += `<meta property="og:image:width" content="${media.width}" />\n`;
    if (media.height) html += `<meta property="og:image:height" content="${media.height}" />\n`;
    html += `<meta property="og:image:type" content="image/${media.format}" />\n`;
    html += `<meta property="og:image:alt" content="${media.alt || options.title}" />\n`;
    html += `<meta property="og:title" content="${options.title}" />\n`;
    html += `<meta property="og:description" content="${options.description}" />\n`;
    html += `<meta property="og:type" content="${options.type || 'website'}" />\n`;

    // Twitter Card
    html += `<meta name="twitter:card" content="${options.twitterCardType || 'summary_large_image'}" />\n`;
    html += `<meta name="twitter:image" content="${media.url}" />\n`;
    html += `<meta name="twitter:image:alt" content="${media.alt || options.title}" />\n`;
    html += `<meta name="twitter:title" content="${options.title}" />\n`;
    html += `<meta name="twitter:description" content="${options.description}" />\n`;

    if (options.twitterHandle) {
      html += `<meta name="twitter:site" content="${options.twitterHandle}" />\n`;
    }

    return html;
  }

  // ---------------------------------------------------------------------------
  // Format Detection & Helpers
  // ---------------------------------------------------------------------------

  detectMediaType(filename: string): MediaType {
    const ext = this.getExtension(filename).toLowerCase();

    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif', 'bmp', 'ico', 'tiff', 'tif'];
    const videoExts = ['mp4', 'webm', 'ogg', 'avi', 'mov', 'mkv', 'flv', 'wmv', '3gp', 'm4v'];
    const audioExts = ['mp3', 'wav', 'ogg', 'aac', 'flac', 'wma', 'webm', 'm4a', 'opus'];
    const documentExts = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'csv', 'md'];
    const fontExts = ['woff', 'woff2', 'ttf', 'otf', 'eot'];
    const archiveExts = ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'];

    if (imageExts.includes(ext)) return 'image';
    if (videoExts.includes(ext)) return 'video';
    if (audioExts.includes(ext)) return 'audio';
    if (documentExts.includes(ext)) return 'document';
    if (fontExts.includes(ext)) return 'font';
    if (archiveExts.includes(ext)) return 'archive';
    return 'unknown';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
  }

  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  private getExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  private loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }

  private generateId(): string {
    return `media-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Event system
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

  private emit(event: string, data: unknown): void {
    const handlers = this.listeners.get(event);
    if (handlers) handlers.forEach(h => { try { h(data); } catch (e) { console.error(e); } });
  }
}

// =============================================================================
// Additional Types
// =============================================================================

export interface MediaFilters {
  type?: MediaType;
  format?: string;
  folderId?: string;
  tags?: string[];
  search?: string;
  minSize?: number;
  maxSize?: number;
  status?: MediaItem['status'];
}

export interface MediaStats {
  totalCount: number;
  totalSize: number;
  byType: Record<string, number>;
  sizeByType: Record<string, number>;
  averageSize: number;
  formatsUsed: string[];
  tagsUsed: string[];
}

export interface AudioAnalysis {
  duration: number;
  sampleRate: number;
  channels: number;
  waveform: number[];
  rmsLevel: number;
  peakLevel: number;
  dynamicRange: number;
  frequencyData: number[];
  silenceDetected: Array<{ start: number; end: number }>;
}

export interface ResponsiveImageOptions {
  alt?: string;
  sizes?: string;
  widths?: number[];
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'sync' | 'auto';
  fetchPriority?: 'high' | 'low' | 'auto';
  className?: string;
  style?: string;
  usePictureElement?: boolean;
}

export interface BackgroundOptions {
  position?: string;
  size?: 'cover' | 'contain' | 'auto' | string;
  repeat?: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y';
  attachment?: 'scroll' | 'fixed' | 'local';
  overlay?: string;
  blur?: number;
}

export interface SocialMediaOptions {
  title: string;
  description: string;
  type?: string;
  twitterCardType?: 'summary' | 'summary_large_image' | 'app' | 'player';
  twitterHandle?: string;
}

// =============================================================================
// Singleton Instance
// =============================================================================

export const mediaManager = new MediaManager();
