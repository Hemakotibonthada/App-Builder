// =============================================================================
// Database Service - Client-side database abstraction layer supporting
// IndexedDB, localStorage, sessionStorage, with migration and query support
// =============================================================================

// =============================================================================
// Database Types
// =============================================================================

export interface DBConfig {
  name: string;
  version: number;
  stores: StoreSchema[];
}

export interface StoreSchema {
  name: string;
  keyPath: string;
  autoIncrement?: boolean;
  indexes?: IndexSchema[];
}

export interface IndexSchema {
  name: string;
  keyPath: string | string[];
  unique?: boolean;
  multiEntry?: boolean;
}

export type StorageDriver = 'indexeddb' | 'localstorage' | 'sessionstorage' | 'memory';

export interface QueryOptions<T = unknown> {
  where?: Partial<T> | ((item: T) => boolean);
  orderBy?: keyof T | { field: keyof T; direction: 'asc' | 'desc' };
  limit?: number;
  offset?: number;
  select?: (keyof T)[];
}

export interface QueryResult<T> {
  items: T[];
  total: number;
  hasMore: boolean;
  executionTime: number;
}

export interface Migration {
  version: number;
  description: string;
  up: (db: IDBDatabase) => void | Promise<void>;
  down?: (db: IDBDatabase) => void | Promise<void>;
}

export interface DBStats {
  driver: StorageDriver;
  stores: { name: string; count: number; sizeEstimate: number }[];
  totalRecords: number;
  totalSizeEstimate: number;
  version: number;
}

// =============================================================================
// In-Memory Store
// =============================================================================

export class MemoryStore {
  private data: Map<string, Map<string, unknown>> = new Map();

  createStore(name: string): void {
    if (!this.data.has(name)) {
      this.data.set(name, new Map());
    }
  }

  async get<T>(store: string, key: string): Promise<T | undefined> {
    return this.data.get(store)?.get(key) as T | undefined;
  }

  async put<T>(store: string, key: string, value: T): Promise<void> {
    if (!this.data.has(store)) this.createStore(store);
    this.data.get(store)!.set(key, value);
  }

  async delete(store: string, key: string): Promise<void> {
    this.data.get(store)?.delete(key);
  }

  async getAll<T>(store: string): Promise<T[]> {
    const storeData = this.data.get(store);
    if (!storeData) return [];
    return Array.from(storeData.values()) as T[];
  }

  async clear(store: string): Promise<void> {
    this.data.get(store)?.clear();
  }

  async count(store: string): Promise<number> {
    return this.data.get(store)?.size || 0;
  }

  async keys(store: string): Promise<string[]> {
    const storeData = this.data.get(store);
    if (!storeData) return [];
    return Array.from(storeData.keys());
  }

  destroy(): void {
    this.data.clear();
  }
}

// =============================================================================
// LocalStorage Adapter
// =============================================================================

export class LocalStorageAdapter {
  private prefix: string;

  constructor(prefix: string = 'appbuilder') {
    this.prefix = prefix;
  }

  private getKey(store: string, key: string): string {
    return `${this.prefix}:${store}:${key}`;
  }

  private getStorePrefix(store: string): string {
    return `${this.prefix}:${store}:`;
  }

  async get<T>(store: string, key: string): Promise<T | undefined> {
    try {
      const raw = localStorage.getItem(this.getKey(store, key));
      return raw ? JSON.parse(raw) : undefined;
    } catch {
      return undefined;
    }
  }

  async put<T>(store: string, key: string, value: T): Promise<void> {
    try {
      localStorage.setItem(this.getKey(store, key), JSON.stringify(value));
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.error('LocalStorage quota exceeded');
        throw new Error('Storage quota exceeded. Try clearing some data.');
      }
      throw error;
    }
  }

  async delete(store: string, key: string): Promise<void> {
    localStorage.removeItem(this.getKey(store, key));
  }

  async getAll<T>(store: string): Promise<T[]> {
    const prefix = this.getStorePrefix(store);
    const items: T[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const storageKey = localStorage.key(i);
      if (storageKey?.startsWith(prefix)) {
        try {
          const value = localStorage.getItem(storageKey);
          if (value) items.push(JSON.parse(value));
        } catch { /* skip corrupted entries */ }
      }
    }

    return items;
  }

  async clear(store: string): Promise<void> {
    const prefix = this.getStorePrefix(store);
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }

    for (const key of keysToRemove) {
      localStorage.removeItem(key);
    }
  }

  async count(store: string): Promise<number> {
    const prefix = this.getStorePrefix(store);
    let count = 0;

    for (let i = 0; i < localStorage.length; i++) {
      if (localStorage.key(i)?.startsWith(prefix)) {
        count++;
      }
    }

    return count;
  }

  async keys(store: string): Promise<string[]> {
    const prefix = this.getStorePrefix(store);
    const keys: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(prefix)) {
        keys.push(key.slice(prefix.length));
      }
    }

    return keys;
  }

  getStorageSize(): { used: number; estimated: number } {
    let totalSize = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)!;
      totalSize += key.length + (localStorage.getItem(key)?.length || 0);
    }
    return {
      used: totalSize * 2, // UTF-16 = 2 bytes per char
      estimated: 5 * 1024 * 1024, // 5MB typical limit
    };
  }
}

// =============================================================================
// Query Engine
// =============================================================================

export class QueryEngine {
  static async query<T>(
    items: T[],
    options: QueryOptions<T> = {}
  ): Promise<QueryResult<T>> {
    const startTime = performance.now();

    let filteredItems = [...items];

    // Apply where filter
    if (options.where) {
      if (typeof options.where === 'function') {
        filteredItems = filteredItems.filter(options.where);
      } else {
        const conditions = options.where as Partial<T>;
        filteredItems = filteredItems.filter(item => {
          return Object.entries(conditions).every(([key, value]) => {
            return (item as Record<string, unknown>)[key] === value;
          });
        });
      }
    }

    const total = filteredItems.length;

    // Apply ordering
    if (options.orderBy) {
      let field: keyof T;
      let direction: 'asc' | 'desc' = 'asc';

      if (typeof options.orderBy === 'object' && 'field' in options.orderBy) {
        field = options.orderBy.field;
        direction = options.orderBy.direction;
      } else {
        field = options.orderBy as keyof T;
      }

      filteredItems.sort((a, b) => {
        const aVal = a[field];
        const bVal = b[field];

        let comparison = 0;
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          comparison = aVal.localeCompare(bVal);
        } else if (typeof aVal === 'number' && typeof bVal === 'number') {
          comparison = aVal - bVal;
        } else if (aVal instanceof Date && bVal instanceof Date) {
          comparison = aVal.getTime() - bVal.getTime();
        }

        return direction === 'desc' ? -comparison : comparison;
      });
    }

    // Apply offset and limit
    if (options.offset) {
      filteredItems = filteredItems.slice(options.offset);
    }

    const hasMore = options.limit ? filteredItems.length > options.limit : false;

    if (options.limit) {
      filteredItems = filteredItems.slice(0, options.limit);
    }

    // Apply select (field projection)
    if (options.select && options.select.length > 0) {
      filteredItems = filteredItems.map(item => {
        const projected = {} as T;
        for (const key of options.select!) {
          projected[key] = item[key];
        }
        return projected;
      });
    }

    const executionTime = performance.now() - startTime;

    return {
      items: filteredItems,
      total,
      hasMore,
      executionTime,
    };
  }

  static aggregate<T>(items: T[], field: keyof T): {
    count: number;
    sum: number;
    avg: number;
    min: unknown;
    max: unknown;
    distinct: unknown[];
  } {
    const values = items.map(item => item[field]);
    const numericValues = values.filter(v => typeof v === 'number') as number[];

    return {
      count: values.length,
      sum: numericValues.reduce((a, b) => a + b, 0),
      avg: numericValues.length > 0 ? numericValues.reduce((a, b) => a + b, 0) / numericValues.length : 0,
      min: numericValues.length > 0 ? Math.min(...numericValues) : values[0],
      max: numericValues.length > 0 ? Math.max(...numericValues) : values[values.length - 1],
      distinct: [...new Set(values)],
    };
  }

  static groupBy<T>(items: T[], field: keyof T): Map<unknown, T[]> {
    const groups = new Map<unknown, T[]>();

    for (const item of items) {
      const key = item[field];
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(item);
    }

    return groups;
  }
}

// =============================================================================
// Collection (High-level API)
// =============================================================================

export class Collection<T extends { id: string }> {
  private storeName: string;
  private store: MemoryStore;
  private onChange?: (items: T[]) => void;

  constructor(storeName: string, store: MemoryStore, onChange?: (items: T[]) => void) {
    this.storeName = storeName;
    this.store = store;
    this.onChange = onChange;
    this.store.createStore(storeName);
  }

  async findById(id: string): Promise<T | undefined> {
    return this.store.get<T>(this.storeName, id);
  }

  async findOne(where: Partial<T> | ((item: T) => boolean)): Promise<T | undefined> {
    const result = await this.find({ where, limit: 1 });
    return result.items[0];
  }

  async find(options?: QueryOptions<T>): Promise<QueryResult<T>> {
    const all = await this.store.getAll<T>(this.storeName);
    return QueryEngine.query(all, options);
  }

  async findAll(): Promise<T[]> {
    return this.store.getAll<T>(this.storeName);
  }

  async insert(item: T): Promise<T> {
    await this.store.put(this.storeName, item.id, item);
    this.notifyChange();
    return item;
  }

  async insertMany(items: T[]): Promise<T[]> {
    for (const item of items) {
      await this.store.put(this.storeName, item.id, item);
    }
    this.notifyChange();
    return items;
  }

  async update(id: string, updates: Partial<T>): Promise<T | undefined> {
    const existing = await this.findById(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...updates };
    await this.store.put(this.storeName, id, updated);
    this.notifyChange();
    return updated;
  }

  async upsert(item: T): Promise<T> {
    await this.store.put(this.storeName, item.id, item);
    this.notifyChange();
    return item;
  }

  async remove(id: string): Promise<boolean> {
    const exists = await this.findById(id);
    if (!exists) return false;

    await this.store.delete(this.storeName, id);
    this.notifyChange();
    return true;
  }

  async removeMany(ids: string[]): Promise<number> {
    let count = 0;
    for (const id of ids) {
      const removed = await this.remove(id);
      if (removed) count++;
    }
    return count;
  }

  async removeWhere(predicate: (item: T) => boolean): Promise<number> {
    const all = await this.findAll();
    const toRemove = all.filter(predicate);
    return this.removeMany(toRemove.map(item => item.id));
  }

  async count(): Promise<number> {
    return this.store.count(this.storeName);
  }

  async clear(): Promise<void> {
    await this.store.clear(this.storeName);
    this.notifyChange();
  }

  async exists(id: string): Promise<boolean> {
    const item = await this.findById(id);
    return item !== undefined;
  }

  async aggregate(field: keyof T) {
    const all = await this.findAll();
    return QueryEngine.aggregate(all, field);
  }

  async groupBy(field: keyof T) {
    const all = await this.findAll();
    return QueryEngine.groupBy(all, field);
  }

  private async notifyChange(): Promise<void> {
    if (this.onChange) {
      const all = await this.findAll();
      this.onChange(all);
    }
  }
}

// =============================================================================
// Database Schemas for AppBuilder
// =============================================================================

export const APP_BUILDER_SCHEMA: DBConfig = {
  name: 'appbuilder',
  version: 1,
  stores: [
    {
      name: 'projects',
      keyPath: 'id',
      indexes: [
        { name: 'name', keyPath: 'name' },
        { name: 'updatedAt', keyPath: 'updatedAt' },
        { name: 'createdAt', keyPath: 'createdAt' },
        { name: 'status', keyPath: 'status' },
      ],
    },
    {
      name: 'pages',
      keyPath: 'id',
      indexes: [
        { name: 'projectId', keyPath: 'projectId' },
        { name: 'name', keyPath: 'name' },
        { name: 'order', keyPath: 'order' },
        { name: 'slug', keyPath: 'slug', unique: true },
      ],
    },
    {
      name: 'widgets',
      keyPath: 'id',
      indexes: [
        { name: 'pageId', keyPath: 'pageId' },
        { name: 'type', keyPath: 'type' },
        { name: 'parentId', keyPath: 'parentId' },
        { name: 'name', keyPath: 'name' },
      ],
    },
    {
      name: 'assets',
      keyPath: 'id',
      indexes: [
        { name: 'projectId', keyPath: 'projectId' },
        { name: 'type', keyPath: 'type' },
        { name: 'name', keyPath: 'name' },
        { name: 'size', keyPath: 'size' },
      ],
    },
    {
      name: 'styles',
      keyPath: 'id',
      indexes: [
        { name: 'name', keyPath: 'name' },
        { name: 'category', keyPath: 'category' },
      ],
    },
    {
      name: 'components',
      keyPath: 'id',
      indexes: [
        { name: 'name', keyPath: 'name' },
        { name: 'category', keyPath: 'category' },
        { name: 'isGlobal', keyPath: 'isGlobal' },
      ],
    },
    {
      name: 'history',
      keyPath: 'id',
      autoIncrement: true,
      indexes: [
        { name: 'projectId', keyPath: 'projectId' },
        { name: 'timestamp', keyPath: 'timestamp' },
        { name: 'type', keyPath: 'type' },
      ],
    },
    {
      name: 'settings',
      keyPath: 'key',
    },
    {
      name: 'templates',
      keyPath: 'id',
      indexes: [
        { name: 'category', keyPath: 'category' },
        { name: 'name', keyPath: 'name' },
        { name: 'tags', keyPath: 'tags', multiEntry: true },
      ],
    },
    {
      name: 'versions',
      keyPath: 'id',
      indexes: [
        { name: 'projectId', keyPath: 'projectId' },
        { name: 'createdAt', keyPath: 'createdAt' },
        { name: 'label', keyPath: 'label' },
      ],
    },
  ],
};

// =============================================================================
// Data Import/Export
// =============================================================================

export interface ExportData {
  version: string;
  exportedAt: string;
  stores: Record<string, unknown[]>;
  metadata?: Record<string, unknown>;
}

export function exportToJSON(data: Record<string, unknown[]>, metadata?: Record<string, unknown>): string {
  const exportData: ExportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    stores: data,
    metadata,
  };

  return JSON.stringify(exportData, null, 2);
}

export function importFromJSON(json: string): ExportData | null {
  try {
    const data = JSON.parse(json) as ExportData;

    if (!data.version || !data.stores) {
      console.error('Invalid export format');
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to parse import data:', error);
    return null;
  }
}

export function generateCSVFromData<T extends Record<string, unknown>>(items: T[], fields?: string[]): string {
  if (items.length === 0) return '';

  const headers = fields || Object.keys(items[0]);
  const rows = items.map(item =>
    headers.map(header => {
      const value = item[header];
      if (value === null || value === undefined) return '';
      const str = String(value);
      // Escape quotes and wrap in quotes if contains comma, newline, or quote
      if (str.includes(',') || str.includes('\n') || str.includes('"')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }).join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}

export function parseCSVToData(csv: string): Record<string, string>[] {
  const lines = csv.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  const items: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const item: Record<string, string> = {};
    headers.forEach((header, index) => {
      item[header] = values[index] || '';
    });
    items.push(item);
  }

  return items;
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }
  }

  values.push(current);
  return values;
}

// =============================================================================
// Data Validation
// =============================================================================

export interface SchemaField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
  required?: boolean;
  default?: unknown;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  enum?: unknown[];
  validate?: (value: unknown) => boolean;
}

export function validateRecord(record: Record<string, unknown>, schema: SchemaField[]): {
  isValid: boolean;
  errors: { field: string; message: string }[];
} {
  const errors: { field: string; message: string }[] = [];

  for (const field of schema) {
    const value = record[field.name];

    // Required check
    if (field.required && (value === undefined || value === null || value === '')) {
      errors.push({ field: field.name, message: `${field.name} is required` });
      continue;
    }

    if (value === undefined || value === null) continue;

    // Type check
    switch (field.type) {
      case 'string':
        if (typeof value !== 'string') {
          errors.push({ field: field.name, message: `${field.name} must be a string` });
        } else {
          if (field.minLength && value.length < field.minLength) {
            errors.push({ field: field.name, message: `${field.name} must be at least ${field.minLength} characters` });
          }
          if (field.maxLength && value.length > field.maxLength) {
            errors.push({ field: field.name, message: `${field.name} must be at most ${field.maxLength} characters` });
          }
          if (field.pattern && !new RegExp(field.pattern).test(value)) {
            errors.push({ field: field.name, message: `${field.name} does not match required pattern` });
          }
        }
        break;
      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          errors.push({ field: field.name, message: `${field.name} must be a number` });
        } else {
          if (field.min !== undefined && value < field.min) {
            errors.push({ field: field.name, message: `${field.name} must be at least ${field.min}` });
          }
          if (field.max !== undefined && value > field.max) {
            errors.push({ field: field.name, message: `${field.name} must be at most ${field.max}` });
          }
        }
        break;
      case 'boolean':
        if (typeof value !== 'boolean') {
          errors.push({ field: field.name, message: `${field.name} must be a boolean` });
        }
        break;
      case 'array':
        if (!Array.isArray(value)) {
          errors.push({ field: field.name, message: `${field.name} must be an array` });
        }
        break;
      case 'object':
        if (typeof value !== 'object' || Array.isArray(value)) {
          errors.push({ field: field.name, message: `${field.name} must be an object` });
        }
        break;
    }

    // Enum check
    if (field.enum && !field.enum.includes(value)) {
      errors.push({ field: field.name, message: `${field.name} must be one of: ${field.enum.join(', ')}` });
    }

    // Custom validation
    if (field.validate && !field.validate(value)) {
      errors.push({ field: field.name, message: `${field.name} failed custom validation` });
    }
  }

  return { isValid: errors.length === 0, errors };
}
