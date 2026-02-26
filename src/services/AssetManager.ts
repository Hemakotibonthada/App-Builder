// =============================================================================
// Asset Manager - Comprehensive digital asset management system
// Features: Upload, organize, transform, optimize, CDN, metadata, search
// =============================================================================

export interface Asset {
  id: string;
  name: string;
  originalName: string;
  type: AssetType;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  duration?: number;
  url: string;
  thumbnailUrl?: string;
  previewUrl?: string;
  folder: string;
  tags: string[];
  metadata: AssetMetadata;
  variants: AssetVariant[];
  status: AssetStatus;
  createdAt: number;
  updatedAt: number;
  usedBy: AssetUsage[];
  version: number;
  checksum: string;
  isPublic: boolean;
  permissions: AssetPermission[];
  alt?: string;
  caption?: string;
  credit?: string;
  license?: string;
}

export type AssetType = 
  | 'image' | 'video' | 'audio' | 'document' | 'font' 
  | 'icon' | 'svg' | 'animation' | 'model-3d' | 'archive'
  | 'code' | 'data' | 'other';

export type AssetStatus = 'uploading' | 'processing' | 'ready' | 'error' | 'archived' | 'deleted';

export interface AssetMetadata {
  title: string;
  description: string;
  author: string;
  copyright: string;
  keywords: string[];
  category: string;
  color: string;
  dominantColors: string[];
  exif?: Record<string, unknown>;
  codec?: string;
  bitrate?: number;
  sampleRate?: number;
  channels?: number;
  frameRate?: number;
  pages?: number;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  custom: Record<string, unknown>;
}

export interface AssetVariant {
  id: string;
  name: string;
  width?: number;
  height?: number;
  quality: number;
  format: string;
  size: number;
  url: string;
  suffix: string;
  transform: ImageTransform;
}

export interface AssetUsage {
  widgetId: string;
  pageId: string;
  propertyPath: string;
}

export interface AssetPermission {
  userId: string;
  role: 'viewer' | 'editor' | 'admin';
}

export interface AssetFolder {
  id: string;
  name: string;
  path: string;
  parentId: string | null;
  children: string[];
  assetCount: number;
  color: string;
  icon: string;
  createdAt: number;
  updatedAt: number;
  metadata: Record<string, unknown>;
}

// =============================================================================
// Image Transform Types
// =============================================================================

export interface ImageTransform {
  resize?: ResizeOptions;
  crop?: CropOptions;
  rotate?: number;
  flip?: 'horizontal' | 'vertical' | 'both';
  filter?: ImageFilter[];
  effects?: ImageEffect[];
  watermark?: WatermarkOptions;
  border?: BorderOptions;
  overlay?: OverlayOptions;
  format?: OutputFormat;
  quality?: number;
}

export interface ResizeOptions {
  width?: number;
  height?: number;
  mode: 'contain' | 'cover' | 'fill' | 'inside' | 'outside';
  background?: string;
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  upscale: boolean;
}

export interface CropOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  aspectRatio?: string;
}

export interface ImageFilter {
  type: 'brightness' | 'contrast' | 'saturation' | 'hue' | 'blur' | 'sharpen' | 'grayscale' | 'sepia' | 'invert' | 'opacity' | 'gamma' | 'threshold' | 'noise' | 'pixelate' | 'vignette';
  value: number;
}

export interface ImageEffect {
  type: 'shadow' | 'glow' | 'outline' | 'emboss' | 'sketch' | 'oil-paint' | 'mosaic' | 'posterize' | 'solarize' | 'halftone' | 'duotone' | 'gradient-map';
  config: Record<string, unknown>;
}

export interface WatermarkOptions {
  text?: string;
  image?: string;
  position: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  opacity: number;
  size: number;
  padding: number;
  repeat: boolean;
  rotation: number;
}

export interface BorderOptions {
  width: number;
  color: string;
  style: 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'ridge';
  radius: number;
}

export interface OverlayOptions {
  image: string;
  blend: 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'color-dodge' | 'color-burn' | 'hard-light' | 'soft-light';
  opacity: number;
  position: { x: number; y: number };
}

export type OutputFormat = 'jpeg' | 'png' | 'webp' | 'avif' | 'gif' | 'tiff' | 'svg' | 'ico';

// =============================================================================
// Upload Types
// =============================================================================

export interface UploadConfig {
  maxFileSize: number;
  maxTotalSize: number;
  allowedTypes: string[];
  allowedExtensions: string[];
  autoResize: boolean;
  maxDimensions: { width: number; height: number };
  generateThumbnails: boolean;
  thumbnailSizes: Array<{ width: number; height: number; suffix: string }>;
  preserveOriginal: boolean;
  autoOptimize: boolean;
  quality: number;
  defaultFormat: OutputFormat;
  naming: 'original' | 'uuid' | 'hash' | 'timestamp' | 'custom';
  namingTemplate?: string;
  folder: string;
  tags: string[];
  duplicate: 'overwrite' | 'rename' | 'skip' | 'version';
  metadata: boolean;
}

export interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  loaded: number;
  total: number;
  speed: number;
  eta: number;
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error' | 'cancelled';
  error?: string;
  thumbnail?: string;
}

export interface BatchUploadResult {
  successful: Asset[];
  failed: Array<{ file: string; error: string }>;
  skipped: string[];
  totalSize: number;
  duration: number;
}

// =============================================================================
// Search & Filter Types
// =============================================================================

export interface AssetSearchQuery {
  text?: string;
  type?: AssetType[];
  tags?: string[];
  folder?: string;
  recursive?: boolean;
  minSize?: number;
  maxSize?: number;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  dateFrom?: number;
  dateTo?: number;
  mimeType?: string[];
  status?: AssetStatus[];
  sortBy?: 'name' | 'date' | 'size' | 'type' | 'relevance';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
  color?: string;
  orientation?: 'landscape' | 'portrait' | 'square' | 'all';
  usedOnly?: boolean;
  unusedOnly?: boolean;
}

export interface AssetSearchResult {
  assets: Asset[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
  facets: SearchFacets;
}

export interface SearchFacets {
  types: Array<{ type: AssetType; count: number }>;
  tags: Array<{ tag: string; count: number }>;
  folders: Array<{ folder: string; count: number }>;
  sizes: { small: number; medium: number; large: number };
  dates: { today: number; week: number; month: number; older: number };
}

// =============================================================================
// Optimization Types
// =============================================================================

export interface OptimizationResult {
  original: { size: number; format: string; width: number; height: number };
  optimized: { size: number; format: string; width: number; height: number };
  savings: number;
  savingsPercent: number;
  duration: number;
  techniques: string[];
}

export interface OptimizationProfile {
  name: string;
  description: string;
  format: OutputFormat;
  quality: number;
  maxWidth: number;
  maxHeight: number;
  stripMetadata: boolean;
  progressive: boolean;
  interlace: boolean;
  lossless: boolean;
  filters: ImageFilter[];
}

export const OPTIMIZATION_PROFILES: Record<string, OptimizationProfile> = {
  web: {
    name: 'Web Optimized',
    description: 'Balanced quality and file size for web',
    format: 'webp',
    quality: 80,
    maxWidth: 2560,
    maxHeight: 2560,
    stripMetadata: true,
    progressive: true,
    interlace: false,
    lossless: false,
    filters: [],
  },
  thumbnail: {
    name: 'Thumbnail',
    description: 'Small preview images',
    format: 'webp',
    quality: 70,
    maxWidth: 256,
    maxHeight: 256,
    stripMetadata: true,
    progressive: false,
    interlace: false,
    lossless: false,
    filters: [],
  },
  retina: {
    name: 'Retina Display',
    description: 'High-DPI displays',
    format: 'webp',
    quality: 85,
    maxWidth: 5120,
    maxHeight: 5120,
    stripMetadata: true,
    progressive: true,
    interlace: false,
    lossless: false,
    filters: [],
  },
  print: {
    name: 'Print Quality',
    description: 'High quality for printing',
    format: 'png',
    quality: 100,
    maxWidth: 8192,
    maxHeight: 8192,
    stripMetadata: false,
    progressive: false,
    interlace: true,
    lossless: true,
    filters: [],
  },
  social: {
    name: 'Social Media',
    description: 'Optimized for social sharing',
    format: 'jpeg',
    quality: 85,
    maxWidth: 1200,
    maxHeight: 1200,
    stripMetadata: true,
    progressive: true,
    interlace: false,
    lossless: false,
    filters: [],
  },
  favicon: {
    name: 'Favicon',
    description: 'Browser favicon',
    format: 'ico',
    quality: 100,
    maxWidth: 64,
    maxHeight: 64,
    stripMetadata: true,
    progressive: false,
    interlace: false,
    lossless: true,
    filters: [],
  },
  avatar: {
    name: 'Avatar',
    description: 'User avatar',
    format: 'webp',
    quality: 85,
    maxWidth: 512,
    maxHeight: 512,
    stripMetadata: true,
    progressive: false,
    interlace: false,
    lossless: false,
    filters: [],
  },
  banner: {
    name: 'Banner',
    description: 'Website banner/hero image',
    format: 'webp',
    quality: 85,
    maxWidth: 1920,
    maxHeight: 600,
    stripMetadata: true,
    progressive: true,
    interlace: false,
    lossless: false,
    filters: [],
  },
};

// =============================================================================
// Asset Manager Class
// =============================================================================

export class AssetManager {
  private assets: Map<string, Asset> = new Map();
  private folders: Map<string, AssetFolder> = new Map();
  private uploadQueue: Map<string, UploadProgress> = new Map();
  private listeners: Map<string, Array<(data: unknown) => void>> = new Map();
  private config: UploadConfig;
  private clipboard: Asset[] = [];
  private recentAssets: string[] = [];
  private favorites: Set<string> = new Set();
  private collections: Map<string, AssetCollection> = new Map();

  constructor(config?: Partial<UploadConfig>) {
    this.config = {
      maxFileSize: 50 * 1024 * 1024, // 50MB
      maxTotalSize: 500 * 1024 * 1024, // 500MB
      allowedTypes: [
        'image/*', 'video/*', 'audio/*', 'font/*',
        'application/pdf', 'application/json', 'text/*',
        'application/zip', 'application/x-svg',
      ],
      allowedExtensions: [
        '.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg', '.ico', '.bmp', '.tiff',
        '.mp4', '.webm', '.mov', '.avi', '.mkv',
        '.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a',
        '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.csv',
        '.ttf', '.otf', '.woff', '.woff2', '.eot',
        '.json', '.xml', '.yaml', '.md', '.txt',
        '.zip', '.rar', '.7z', '.tar', '.gz',
        '.glb', '.gltf', '.obj', '.fbx',
        '.lottie', '.json',
      ],
      autoResize: true,
      maxDimensions: { width: 4096, height: 4096 },
      generateThumbnails: true,
      thumbnailSizes: [
        { width: 64, height: 64, suffix: 'xs' },
        { width: 128, height: 128, suffix: 'sm' },
        { width: 256, height: 256, suffix: 'md' },
        { width: 512, height: 512, suffix: 'lg' },
      ],
      preserveOriginal: true,
      autoOptimize: true,
      quality: 85,
      defaultFormat: 'webp',
      naming: 'original',
      folder: '/',
      tags: [],
      duplicate: 'rename',
      metadata: true,
      ...config,
    };

    // Initialize root folder
    this.folders.set('root', {
      id: 'root',
      name: 'Assets',
      path: '/',
      parentId: null,
      children: [],
      assetCount: 0,
      color: '#3b82f6',
      icon: 'folder',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      metadata: {},
    });

    // Create default folders
    this.createFolder('Images', '/images', 'root', '#f59e0b', 'image');
    this.createFolder('Videos', '/videos', 'root', '#ef4444', 'film');
    this.createFolder('Audio', '/audio', 'root', '#8b5cf6', 'music');
    this.createFolder('Documents', '/documents', 'root', '#10b981', 'file-text');
    this.createFolder('Fonts', '/fonts', 'root', '#ec4899', 'type');
    this.createFolder('Icons', '/icons', 'root', '#06b6d4', 'star');
    this.createFolder('Uploads', '/uploads', 'root', '#6b7280', 'upload');
  }

  // ---------------------------------------------------------------------------
  // Upload
  // ---------------------------------------------------------------------------

  async upload(file: File, options?: Partial<UploadConfig>): Promise<Asset> {
    const config = { ...this.config, ...options };
    const fileId = `asset_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 8)}`;

    // Validate
    this.validateFile(file, config);

    // Track progress
    const progress: UploadProgress = {
      fileId,
      fileName: file.name,
      progress: 0,
      loaded: 0,
      total: file.size,
      speed: 0,
      eta: 0,
      status: 'uploading',
    };
    this.uploadQueue.set(fileId, progress);
    this.emit('upload:started', progress);

    try {
      // Read file
      const buffer = await this.readFile(file);

      progress.progress = 30;
      progress.status = 'processing';
      this.emit('upload:progress', progress);

      // Detect asset type
      const assetType = this.detectAssetType(file);

      // Generate thumbnail
      let thumbnailUrl: string | undefined;
      if (config.generateThumbnails && assetType === 'image') {
        thumbnailUrl = await this.generateThumbnail(buffer, file.type);
      }

      progress.progress = 60;
      this.emit('upload:progress', progress);

      // Extract metadata
      const metadata = await this.extractMetadata(file, buffer, assetType);

      // Create data URL
      const url = URL.createObjectURL(new Blob([buffer], { type: file.type }));

      progress.progress = 80;
      this.emit('upload:progress', progress);

      // Create asset
      const asset: Asset = {
        id: fileId,
        name: this.generateName(file.name, config),
        originalName: file.name,
        type: assetType,
        mimeType: file.type,
        size: file.size,
        width: metadata.width,
        height: metadata.height,
        duration: metadata.duration,
        url,
        thumbnailUrl,
        previewUrl: url,
        folder: config.folder,
        tags: [...config.tags],
        metadata: {
          title: file.name.replace(/\.[^.]+$/, ''),
          description: '',
          author: '',
          copyright: '',
          keywords: [],
          category: assetType,
          color: '',
          dominantColors: [],
          custom: {},
          ...metadata.extra,
        },
        variants: [],
        status: 'ready',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        usedBy: [],
        version: 1,
        checksum: await this.computeChecksum(buffer),
        isPublic: false,
        permissions: [],
      };

      this.assets.set(fileId, asset);
      this.addToRecent(fileId);
      this.updateFolderCount(config.folder, 1);

      progress.progress = 100;
      progress.status = 'complete';
      this.emit('upload:completed', { ...progress, asset });

      return asset;
    } catch (e) {
      progress.status = 'error';
      progress.error = String(e);
      this.emit('upload:error', progress);
      throw e;
    }
  }

  async uploadBatch(files: File[], options?: Partial<UploadConfig>): Promise<BatchUploadResult> {
    const startTime = Date.now();
    const results: BatchUploadResult = {
      successful: [],
      failed: [],
      skipped: [],
      totalSize: 0,
      duration: 0,
    };

    this.emit('batch:started', { count: files.length });

    for (const file of files) {
      try {
        const asset = await this.upload(file, options);
        results.successful.push(asset);
        results.totalSize += file.size;
      } catch (e) {
        results.failed.push({ file: file.name, error: String(e) });
      }
    }

    results.duration = Date.now() - startTime;
    this.emit('batch:completed', results);
    return results;
  }

  // ---------------------------------------------------------------------------
  // Asset CRUD
  // ---------------------------------------------------------------------------

  getAsset(id: string): Asset | undefined {
    return this.assets.get(id);
  }

  updateAsset(id: string, updates: Partial<Asset>): Asset | null {
    const asset = this.assets.get(id);
    if (!asset) return null;

    Object.assign(asset, updates, { updatedAt: Date.now() });
    this.emit('asset:updated', { assetId: id });
    return asset;
  }

  deleteAsset(id: string, permanent = false): boolean {
    const asset = this.assets.get(id);
    if (!asset) return false;

    if (permanent) {
      if (asset.url) URL.revokeObjectURL(asset.url);
      if (asset.thumbnailUrl) URL.revokeObjectURL(asset.thumbnailUrl);
      this.assets.delete(id);
      this.favorites.delete(id);
      this.recentAssets = this.recentAssets.filter(a => a !== id);
    } else {
      asset.status = 'deleted';
      asset.updatedAt = Date.now();
    }

    this.updateFolderCount(asset.folder, -1);
    this.emit('asset:deleted', { assetId: id, permanent });
    return true;
  }

  restoreAsset(id: string): boolean {
    const asset = this.assets.get(id);
    if (!asset || asset.status !== 'deleted') return false;
    asset.status = 'ready';
    asset.updatedAt = Date.now();
    this.updateFolderCount(asset.folder, 1);
    this.emit('asset:restored', { assetId: id });
    return true;
  }

  duplicateAsset(id: string): Asset | null {
    const original = this.assets.get(id);
    if (!original) return null;

    const newId = `asset_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 8)}`;
    const copy: Asset = {
      ...JSON.parse(JSON.stringify(original)),
      id: newId,
      name: `${original.name} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      usedBy: [],
      version: 1,
    };

    this.assets.set(newId, copy);
    return copy;
  }

  // ---------------------------------------------------------------------------
  // Search & Browse
  // ---------------------------------------------------------------------------

  search(query: AssetSearchQuery): AssetSearchResult {
    let results = Array.from(this.assets.values())
      .filter(a => a.status !== 'deleted');

    // Text search
    if (query.text) {
      const text = query.text.toLowerCase();
      results = results.filter(a =>
        a.name.toLowerCase().includes(text) ||
        a.originalName.toLowerCase().includes(text) ||
        a.metadata.title.toLowerCase().includes(text) ||
        a.metadata.description.toLowerCase().includes(text) ||
        a.tags.some(t => t.toLowerCase().includes(text)) ||
        a.metadata.keywords.some(k => k.toLowerCase().includes(text))
      );
    }

    // Type filter
    if (query.type?.length) {
      results = results.filter(a => query.type!.includes(a.type));
    }

    // Tags filter
    if (query.tags?.length) {
      results = results.filter(a => query.tags!.some(t => a.tags.includes(t)));
    }

    // Folder filter
    if (query.folder) {
      if (query.recursive) {
        results = results.filter(a => a.folder.startsWith(query.folder!));
      } else {
        results = results.filter(a => a.folder === query.folder);
      }
    }

    // Size filters
    if (query.minSize) results = results.filter(a => a.size >= query.minSize!);
    if (query.maxSize) results = results.filter(a => a.size <= query.maxSize!);

    // Dimension filters
    if (query.minWidth) results = results.filter(a => (a.width || 0) >= query.minWidth!);
    if (query.maxWidth) results = results.filter(a => (a.width || 0) <= query.maxWidth!);
    if (query.minHeight) results = results.filter(a => (a.height || 0) >= query.minHeight!);
    if (query.maxHeight) results = results.filter(a => (a.height || 0) <= query.maxHeight!);

    // Date filters
    if (query.dateFrom) results = results.filter(a => a.createdAt >= query.dateFrom!);
    if (query.dateTo) results = results.filter(a => a.createdAt <= query.dateTo!);

    // MIME type filter
    if (query.mimeType?.length) {
      results = results.filter(a => query.mimeType!.includes(a.mimeType));
    }

    // Status filter
    if (query.status?.length) {
      results = results.filter(a => query.status!.includes(a.status));
    }

    // Orientation filter
    if (query.orientation && query.orientation !== 'all') {
      results = results.filter(a => {
        if (!a.width || !a.height) return false;
        switch (query.orientation) {
          case 'landscape': return a.width > a.height;
          case 'portrait': return a.height > a.width;
          case 'square': return Math.abs(a.width - a.height) < Math.min(a.width, a.height) * 0.1;
          default: return true;
        }
      });
    }

    // Usage filter
    if (query.usedOnly) results = results.filter(a => a.usedBy.length > 0);
    if (query.unusedOnly) results = results.filter(a => a.usedBy.length === 0);

    // Compute facets
    const facets = this.computeFacets(results);

    // Sort
    const sortBy = query.sortBy || 'date';
    const sortOrder = query.sortOrder || 'desc';
    const sortMultiplier = sortOrder === 'asc' ? 1 : -1;

    results.sort((a, b) => {
      switch (sortBy) {
        case 'name': return sortMultiplier * a.name.localeCompare(b.name);
        case 'size': return sortMultiplier * (a.size - b.size);
        case 'type': return sortMultiplier * a.type.localeCompare(b.type);
        case 'date':
        default: return sortMultiplier * (a.createdAt - b.createdAt);
      }
    });

    // Paginate
    const page = query.page || 1;
    const pageSize = query.pageSize || 50;
    const total = results.length;
    const startIdx = (page - 1) * pageSize;
    const paginatedResults = results.slice(startIdx, startIdx + pageSize);

    return {
      assets: paginatedResults,
      total,
      page,
      pageSize,
      pages: Math.ceil(total / pageSize),
      facets,
    };
  }

  // ---------------------------------------------------------------------------
  // Folder Management
  // ---------------------------------------------------------------------------

  createFolder(name: string, path: string, parentId: string, color = '#6b7280', icon = 'folder'): AssetFolder {
    const id = `folder_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 6)}`;
    const folder: AssetFolder = {
      id,
      name,
      path,
      parentId,
      children: [],
      assetCount: 0,
      color,
      icon,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      metadata: {},
    };

    this.folders.set(id, folder);

    // Add to parent
    if (parentId) {
      const parent = this.folders.get(parentId);
      if (parent) {
        parent.children.push(id);
      }
    }

    return folder;
  }

  deleteFolder(id: string, moveAssetsTo = '/'): boolean {
    const folder = this.folders.get(id);
    if (!folder || id === 'root') return false;

    // Move assets to target folder
    for (const asset of this.assets.values()) {
      if (asset.folder === folder.path) {
        asset.folder = moveAssetsTo;
      }
    }

    // Remove from parent
    if (folder.parentId) {
      const parent = this.folders.get(folder.parentId);
      if (parent) {
        parent.children = parent.children.filter(c => c !== id);
      }
    }

    // Delete child folders recursively
    for (const childId of folder.children) {
      this.deleteFolder(childId, moveAssetsTo);
    }

    this.folders.delete(id);
    return true;
  }

  renameFolder(id: string, name: string): boolean {
    const folder = this.folders.get(id);
    if (!folder) return false;
    folder.name = name;
    folder.updatedAt = Date.now();
    return true;
  }

  getFolderTree(): FolderTreeNode[] {
    const buildTree = (parentId: string | null): FolderTreeNode[] => {
      return Array.from(this.folders.values())
        .filter(f => f.parentId === parentId)
        .map(f => ({
          id: f.id,
          name: f.name,
          path: f.path,
          assetCount: f.assetCount,
          color: f.color,
          icon: f.icon,
          children: buildTree(f.id),
        }));
    };
    return buildTree(null);
  }

  moveAsset(assetId: string, targetFolder: string): boolean {
    const asset = this.assets.get(assetId);
    if (!asset) return false;

    const oldFolder = asset.folder;
    asset.folder = targetFolder;
    asset.updatedAt = Date.now();

    this.updateFolderCount(oldFolder, -1);
    this.updateFolderCount(targetFolder, 1);
    return true;
  }

  // ---------------------------------------------------------------------------
  // Tags & Organization
  // ---------------------------------------------------------------------------

  addTag(assetId: string, tag: string): boolean {
    const asset = this.assets.get(assetId);
    if (!asset) return false;
    if (asset.tags.includes(tag)) return false;
    asset.tags.push(tag);
    asset.updatedAt = Date.now();
    return true;
  }

  removeTag(assetId: string, tag: string): boolean {
    const asset = this.assets.get(assetId);
    if (!asset) return false;
    asset.tags = asset.tags.filter(t => t !== tag);
    asset.updatedAt = Date.now();
    return true;
  }

  getAllTags(): Array<{ tag: string; count: number }> {
    const tagMap = new Map<string, number>();
    for (const asset of this.assets.values()) {
      for (const tag of asset.tags) {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
      }
    }
    return Array.from(tagMap.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }

  batchTag(assetIds: string[], tags: string[]): number {
    let count = 0;
    for (const id of assetIds) {
      for (const tag of tags) {
        if (this.addTag(id, tag)) count++;
      }
    }
    return count;
  }

  // ---------------------------------------------------------------------------
  // Favorites & Collections
  // ---------------------------------------------------------------------------

  toggleFavorite(assetId: string): boolean {
    if (this.favorites.has(assetId)) {
      this.favorites.delete(assetId);
      return false;
    } else {
      this.favorites.add(assetId);
      return true;
    }
  }

  getFavorites(): Asset[] {
    return Array.from(this.favorites)
      .map(id => this.assets.get(id))
      .filter((a): a is Asset => a !== undefined);
  }

  createCollection(name: string, description = ''): AssetCollection {
    const id = `col_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 6)}`;
    const collection: AssetCollection = {
      id,
      name,
      description,
      assetIds: [],
      cover: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.collections.set(id, collection);
    return collection;
  }

  addToCollection(collectionId: string, assetId: string): boolean {
    const collection = this.collections.get(collectionId);
    if (!collection) return false;
    if (collection.assetIds.includes(assetId)) return false;
    collection.assetIds.push(assetId);
    collection.updatedAt = Date.now();
    return true;
  }

  removeFromCollection(collectionId: string, assetId: string): boolean {
    const collection = this.collections.get(collectionId);
    if (!collection) return false;
    collection.assetIds = collection.assetIds.filter(id => id !== assetId);
    collection.updatedAt = Date.now();
    return true;
  }

  getCollections(): AssetCollection[] {
    return Array.from(this.collections.values());
  }

  // ---------------------------------------------------------------------------
  // Image Transforms (Client-Side)
  // ---------------------------------------------------------------------------

  async applyTransform(assetId: string, transform: ImageTransform): Promise<Asset | null> {
    const asset = this.assets.get(assetId);
    if (!asset || asset.type !== 'image') return null;

    try {
      const img = await this.loadImage(asset.url);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      let width = img.width;
      let height = img.height;

      // Apply resize
      if (transform.resize) {
        const r = transform.resize;
        if (r.width && r.height) {
          if (r.mode === 'contain') {
            const ratio = Math.min(r.width / width, r.height / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          } else if (r.mode === 'cover') {
            const ratio = Math.max(r.width / width, r.height / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          } else {
            width = r.width;
            height = r.height;
          }
        } else if (r.width) {
          const ratio = r.width / width;
          width = r.width;
          height = Math.round(height * ratio);
        } else if (r.height) {
          const ratio = r.height / height;
          height = r.height;
          width = Math.round(width * ratio);
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Apply rotation
      if (transform.rotate) {
        const radians = (transform.rotate * Math.PI) / 180;
        ctx.translate(width / 2, height / 2);
        ctx.rotate(radians);
        ctx.translate(-width / 2, -height / 2);
      }

      // Apply flip
      if (transform.flip) {
        const sx = transform.flip === 'horizontal' || transform.flip === 'both' ? -1 : 1;
        const sy = transform.flip === 'vertical' || transform.flip === 'both' ? -1 : 1;
        ctx.scale(sx, sy);
        if (sx < 0) ctx.translate(-width, 0);
        if (sy < 0) ctx.translate(0, -height);
      }

      // Draw image
      ctx.drawImage(img, 0, 0, width, height);

      // Apply filters
      if (transform.filter?.length) {
        const filterStr = transform.filter.map(f => {
          switch (f.type) {
            case 'brightness': return `brightness(${f.value}%)`;
            case 'contrast': return `contrast(${f.value}%)`;
            case 'saturation': return `saturate(${f.value}%)`;
            case 'hue': return `hue-rotate(${f.value}deg)`;
            case 'blur': return `blur(${f.value}px)`;
            case 'grayscale': return `grayscale(${f.value}%)`;
            case 'sepia': return `sepia(${f.value}%)`;
            case 'invert': return `invert(${f.value}%)`;
            case 'opacity': return `opacity(${f.value}%)`;
            default: return '';
          }
        }).filter(Boolean).join(' ');

        if (filterStr) {
          ctx.filter = filterStr;
          ctx.drawImage(canvas, 0, 0);
          ctx.filter = 'none';
        }
      }

      // Apply crop
      if (transform.crop) {
        const { x, y, width: cw, height: ch } = transform.crop;
        const croppedData = ctx.getImageData(x, y, cw, ch);
        canvas.width = cw;
        canvas.height = ch;
        ctx.putImageData(croppedData, 0, 0);
        width = cw;
        height = ch;
      }

      // Export
      const format = transform.format || 'png';
      const quality = (transform.quality || 90) / 100;
      const mimeType = format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          b => (b ? resolve(b) : reject(new Error('Failed to export'))),
          mimeType,
          quality
        );
      });

      const url = URL.createObjectURL(blob);

      // Create variant
      const variantId = `var_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 6)}`;
      const variant: AssetVariant = {
        id: variantId,
        name: `${asset.name}_${format}_${width}x${height}`,
        width,
        height,
        quality: transform.quality || 90,
        format,
        size: blob.size,
        url,
        suffix: `_${width}x${height}`,
        transform,
      };

      asset.variants.push(variant);
      asset.updatedAt = Date.now();

      return asset;
    } catch (e) {
      console.error('Transform error:', e);
      return null;
    }
  }

  // ---------------------------------------------------------------------------
  // Optimization
  // ---------------------------------------------------------------------------

  async optimizeAsset(assetId: string, profile?: string): Promise<OptimizationResult | null> {
    const asset = this.assets.get(assetId);
    if (!asset || asset.type !== 'image') return null;

    const settings = profile ? OPTIMIZATION_PROFILES[profile] : OPTIMIZATION_PROFILES.web;
    if (!settings) return null;

    const startTime = Date.now();
    const originalSize = asset.size;

    const transform: ImageTransform = {
      resize: {
        width: settings.maxWidth,
        height: settings.maxHeight,
        mode: 'inside',
        upscale: false,
      },
      format: settings.format,
      quality: settings.quality,
      filter: settings.filters,
    };

    await this.applyTransform(assetId, transform);

    const lastVariant = asset.variants[asset.variants.length - 1];
    const optimizedSize = lastVariant?.size || originalSize;

    return {
      original: {
        size: originalSize,
        format: asset.mimeType.split('/')[1] || 'unknown',
        width: asset.width || 0,
        height: asset.height || 0,
      },
      optimized: {
        size: optimizedSize,
        format: settings.format,
        width: lastVariant?.width || asset.width || 0,
        height: lastVariant?.height || asset.height || 0,
      },
      savings: originalSize - optimizedSize,
      savingsPercent: ((originalSize - optimizedSize) / originalSize) * 100,
      duration: Date.now() - startTime,
      techniques: [`Converted to ${settings.format}`, `Quality: ${settings.quality}%`, `Max dimensions: ${settings.maxWidth}x${settings.maxHeight}`],
    };
  }

  // ---------------------------------------------------------------------------
  // Export & Import
  // ---------------------------------------------------------------------------

  exportManifest(): string {
    const manifest = {
      version: '1.0',
      exportedAt: Date.now(),
      assets: Array.from(this.assets.values()).map(a => ({
        ...a,
        url: undefined,
        thumbnailUrl: undefined,
        previewUrl: undefined,
      })),
      folders: Array.from(this.folders.values()),
      collections: Array.from(this.collections.values()),
    };
    return JSON.stringify(manifest, null, 2);
  }

  // ---------------------------------------------------------------------------
  // Statistics
  // ---------------------------------------------------------------------------

  getStats(): AssetStats {
    const allAssets = Array.from(this.assets.values()).filter(a => a.status !== 'deleted');
    
    const typeBreakdown: Record<AssetType, number> = {
      image: 0, video: 0, audio: 0, document: 0, font: 0,
      icon: 0, svg: 0, animation: 0, 'model-3d': 0, archive: 0,
      code: 0, data: 0, other: 0,
    };
    
    let totalSize = 0;
    let usedCount = 0;
    
    for (const asset of allAssets) {
      typeBreakdown[asset.type] = (typeBreakdown[asset.type] || 0) + 1;
      totalSize += asset.size;
      if (asset.usedBy.length > 0) usedCount++;
    }

    return {
      totalAssets: allAssets.length,
      totalSize,
      typeBreakdown,
      usedAssets: usedCount,
      unusedAssets: allAssets.length - usedCount,
      folderCount: this.folders.size,
      collectionCount: this.collections.size,
      favoriteCount: this.favorites.size,
      averageSize: allAssets.length > 0 ? totalSize / allAssets.length : 0,
      largestAsset: allAssets.reduce((max, a) => a.size > (max?.size || 0) ? a : max, allAssets[0]),
    };
  }

  getRecentAssets(limit = 20): Asset[] {
    return this.recentAssets
      .slice(0, limit)
      .map(id => this.assets.get(id))
      .filter((a): a is Asset => a !== undefined);
  }

  // ---------------------------------------------------------------------------
  // Events
  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------
  // Private Helpers
  // ---------------------------------------------------------------------------

  private validateFile(file: File, config: UploadConfig): void {
    if (file.size > config.maxFileSize) {
      throw new Error(`File "${file.name}" exceeds maximum size of ${this.formatBytes(config.maxFileSize)}`);
    }

    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (config.allowedExtensions.length > 0 && !config.allowedExtensions.includes(ext)) {
      throw new Error(`File extension "${ext}" is not allowed`);
    }

    if (config.allowedTypes.length > 0) {
      const typeMatch = config.allowedTypes.some(t => {
        if (t.endsWith('/*')) {
          return file.type.startsWith(t.replace('/*', '/'));
        }
        return file.type === t;
      });
      if (!typeMatch) {
        throw new Error(`File type "${file.type}" is not allowed`);
      }
    }
  }

  private detectAssetType(file: File): AssetType {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const type = file.type.split('/')[0];

    if (type === 'image') {
      if (ext === 'svg') return 'svg';
      if (ext === 'ico') return 'icon';
      return 'image';
    }
    if (type === 'video') return 'video';
    if (type === 'audio') return 'audio';
    if (type === 'font' || ['ttf', 'otf', 'woff', 'woff2', 'eot'].includes(ext)) return 'font';
    if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'csv', 'md', 'txt'].includes(ext)) return 'document';
    if (['json', 'xml', 'yaml', 'yml', 'lottie'].includes(ext)) return 'data';
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'archive';
    if (['glb', 'gltf', 'obj', 'fbx'].includes(ext)) return 'model-3d';
    if (['js', 'ts', 'css', 'html', 'py', 'java'].includes(ext)) return 'code';
    return 'other';
  }

  private async readFile(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  }

  private async generateThumbnail(buffer: ArrayBuffer, mimeType: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const blob = new Blob([buffer], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 128;
        const ratio = Math.min(size / img.width, size / img.height);
        canvas.width = Math.round(img.width * ratio);
        canvas.height = Math.round(img.height * ratio);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/webp', 0.7));
        }
        URL.revokeObjectURL(url);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to generate thumbnail'));
      };
      img.src = url;
    });
  }

  private async extractMetadata(file: File, _buffer: ArrayBuffer, type: AssetType): Promise<{ width?: number; height?: number; duration?: number; extra: Record<string, unknown> }> {
    const result: { width?: number; height?: number; duration?: number; extra: Record<string, unknown> } = { extra: {} };

    if (type === 'image') {
      try {
        const dimensions = await this.getImageDimensions(file);
        result.width = dimensions.width;
        result.height = dimensions.height;
      } catch { /* ignore */ }
    }

    if (type === 'video' || type === 'audio') {
      try {
        const mediaInfo = await this.getMediaDuration(file);
        result.duration = mediaInfo;
      } catch { /* ignore */ }
    }

    return result;
  }

  private async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
        URL.revokeObjectURL(url);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to get image dimensions'));
      };
      img.src = url;
    });
  }

  private async getMediaDuration(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const el = document.createElement(file.type.startsWith('video') ? 'video' : 'audio');
      el.onloadedmetadata = () => {
        resolve(el.duration);
        URL.revokeObjectURL(url);
      };
      el.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to get media duration'));
      };
      el.src = url;
    });
  }

  private async loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = url;
    });
  }

  private async computeChecksum(buffer: ArrayBuffer): Promise<string> {
    // Simple hash implementation for client-side
    const bytes = new Uint8Array(buffer);
    let hash = 0;
    for (let i = 0; i < bytes.length; i++) {
      const char = bytes[i] ?? 0;
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private generateName(originalName: string, config: UploadConfig): string {
    switch (config.naming) {
      case 'uuid': return `${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 8)}`;
      case 'hash': return `h_${Math.random().toString(36).substr(2, 12)}`;
      case 'timestamp': return `${Date.now()}_${originalName}`;
      case 'original':
      default: return originalName;
    }
  }

  private addToRecent(assetId: string): void {
    this.recentAssets = [assetId, ...this.recentAssets.filter(id => id !== assetId)].slice(0, 100);
  }

  private updateFolderCount(folderPath: string, delta: number): void {
    for (const folder of this.folders.values()) {
      if (folder.path === folderPath) {
        folder.assetCount += delta;
        break;
      }
    }
  }

  private computeFacets(assets: Asset[]): SearchFacets {
    const types = new Map<AssetType, number>();
    const tags = new Map<string, number>();
    const folders = new Map<string, number>();
    let small = 0, medium = 0, large = 0;
    let today = 0, week = 0, month = 0, older = 0;
    const now = Date.now();
    const dayMs = 86400000;

    for (const asset of assets) {
      types.set(asset.type, (types.get(asset.type) || 0) + 1);
      for (const tag of asset.tags) tags.set(tag, (tags.get(tag) || 0) + 1);
      folders.set(asset.folder, (folders.get(asset.folder) || 0) + 1);

      if (asset.size < 100 * 1024) small++;
      else if (asset.size < 1024 * 1024) medium++;
      else large++;

      const age = now - asset.createdAt;
      if (age < dayMs) today++;
      else if (age < 7 * dayMs) week++;
      else if (age < 30 * dayMs) month++;
      else older++;
    }

    return {
      types: Array.from(types.entries()).map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count),
      tags: Array.from(tags.entries()).map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count).slice(0, 50),
      folders: Array.from(folders.entries()).map(([folder, count]) => ({ folder, count })).sort((a, b) => b.count - a.count),
      sizes: { small, medium, large },
      dates: { today, week, month, older },
    };
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private emit(event: string, data: unknown): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      for (const handler of handlers) {
        try { handler(data); } catch (e) { console.error(`AssetManager event error (${event}):`, e); }
      }
    }
  }
}

// =============================================================================
// Additional Types
// =============================================================================

export interface FolderTreeNode {
  id: string;
  name: string;
  path: string;
  assetCount: number;
  color: string;
  icon: string;
  children: FolderTreeNode[];
}

export interface AssetCollection {
  id: string;
  name: string;
  description: string;
  assetIds: string[];
  cover: string;
  createdAt: number;
  updatedAt: number;
}

export interface AssetStats {
  totalAssets: number;
  totalSize: number;
  typeBreakdown: Record<AssetType, number>;
  usedAssets: number;
  unusedAssets: number;
  folderCount: number;
  collectionCount: number;
  favoriteCount: number;
  averageSize: number;
  largestAsset: Asset | undefined;
}

// =============================================================================
// Built-in Asset Presets
// =============================================================================

export const STOCK_IMAGES = [
  { name: 'Abstract Background', tags: ['abstract', 'background', 'colorful'], category: 'backgrounds' },
  { name: 'Nature Landscape', tags: ['nature', 'landscape', 'outdoor'], category: 'nature' },
  { name: 'City Skyline', tags: ['city', 'urban', 'architecture'], category: 'urban' },
  { name: 'Business Meeting', tags: ['business', 'people', 'office'], category: 'business' },
  { name: 'Technology', tags: ['tech', 'computer', 'digital'], category: 'technology' },
  { name: 'Food & Drink', tags: ['food', 'restaurant', 'cooking'], category: 'food' },
  { name: 'Travel', tags: ['travel', 'vacation', 'tourism'], category: 'travel' },
  { name: 'Sport', tags: ['sport', 'fitness', 'active'], category: 'sport' },
  { name: 'Education', tags: ['education', 'school', 'learning'], category: 'education' },
  { name: 'Healthcare', tags: ['health', 'medical', 'wellness'], category: 'healthcare' },
  { name: 'Pattern Geometric', tags: ['pattern', 'geometric', 'abstract'], category: 'patterns' },
  { name: 'Texture Wood', tags: ['texture', 'wood', 'natural'], category: 'textures' },
  { name: 'Texture Marble', tags: ['texture', 'marble', 'stone'], category: 'textures' },
  { name: 'Gradient Sunset', tags: ['gradient', 'sunset', 'warm'], category: 'gradients' },
  { name: 'Gradient Ocean', tags: ['gradient', 'ocean', 'cool'], category: 'gradients' },
];

export const PLACEHOLDER_SERVICES: Array<{
  name: string;
  urlTemplate: string;
  description: string;
}> = [
  { name: 'Placeholder.com', urlTemplate: 'https://via.placeholder.com/{width}x{height}/{bg}/{text}', description: 'Simple placeholder with custom colors' },
  { name: 'Lorem Picsum', urlTemplate: 'https://picsum.photos/{width}/{height}', description: 'Random professional photos' },
  { name: 'Placehold.co', urlTemplate: 'https://placehold.co/{width}x{height}/{bg}/{text}', description: 'Modern placeholder service' },
  { name: 'Dummyimage.com', urlTemplate: 'https://dummyimage.com/{width}x{height}/{bg}/{text}', description: 'Dummy images with text' },
  { name: 'PlaceKitten', urlTemplate: 'https://placekitten.com/{width}/{height}', description: 'Placeholder kitten images' },
];

// =============================================================================
// Singleton Instance
// =============================================================================

export const assetManager = new AssetManager();
