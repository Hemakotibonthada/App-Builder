// =============================================================================
// DataStore Service - Client-side data management, caching, and state persistence
// Features: IndexedDB wrapper, in-memory cache, data synchronization, query engine
// =============================================================================

export interface DataRecord {
  id: string;
  collection: string;
  data: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
  version: number;
  tags: string[];
  metadata: Record<string, unknown>;
}

export interface DataCollection {
  name: string;
  schema: DataSchema;
  indexes: DataIndex[];
  records: Map<string, DataRecord>;
  validators: DataValidator[];
  hooks: DataHook[];
  options: CollectionOptions;
}

export interface DataSchema {
  fields: SchemaField[];
  required: string[];
  additionalProperties: boolean;
}

export interface SchemaField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object' | 'reference' | 'enum' | 'file' | 'geo' | 'json';
  required: boolean;
  defaultValue?: unknown;
  validators?: FieldValidator[];
  description?: string;
  enumValues?: string[];
  refCollection?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  unique?: boolean;
  indexed?: boolean;
  encrypted?: boolean;
  computed?: boolean;
  computeExpression?: string;
  immutable?: boolean;
  deprecated?: boolean;
  deprecationMessage?: string;
}

export interface FieldValidator {
  type: 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'custom' | 'email' | 'url' | 'phone' | 'enum' | 'range' | 'unique';
  value?: unknown;
  message: string;
  customFn?: (value: unknown) => boolean;
}

export interface DataIndex {
  name: string;
  fields: string[];
  unique: boolean;
  sparse: boolean;
  compound: boolean;
}

export interface DataValidator {
  name: string;
  validate: (record: DataRecord) => ValidationResult;
  phase: 'before-create' | 'before-update' | 'before-delete' | 'after-create' | 'after-update' | 'after-delete';
}

export interface DataHook {
  name: string;
  phase: 'before-create' | 'before-update' | 'before-delete' | 'after-create' | 'after-update' | 'after-delete';
  handler: (record: DataRecord, context: HookContext) => DataRecord | Promise<DataRecord>;
  priority: number;
  enabled: boolean;
}

export interface HookContext {
  collection: string;
  operation: 'create' | 'update' | 'delete';
  userId?: string;
  timestamp: number;
  previousData?: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: unknown;
}

export interface CollectionOptions {
  timestamps: boolean;
  softDelete: boolean;
  versioning: boolean;
  maxRecords: number;
  ttl: number; // Time to live in milliseconds, 0 = no expiry
  cacheEnabled: boolean;
  cacheTTL: number;
  syncEnabled: boolean;
  encryptionEnabled: boolean;
  compressionEnabled: boolean;
  auditLog: boolean;
}

export interface QueryFilter {
  field: string;
  operator: QueryOperator;
  value: unknown;
}

export type QueryOperator =
  | 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte'
  | 'in' | 'nin' | 'contains' | 'startsWith' | 'endsWith'
  | 'regex' | 'exists' | 'type' | 'between' | 'near'
  | 'arrayContains' | 'arrayContainsAny' | 'arrayLength';

export interface QuerySort {
  field: string;
  direction: 'asc' | 'desc';
}

export interface QueryOptions {
  filters: QueryFilter[];
  sort: QuerySort[];
  limit: number;
  offset: number;
  select: string[];
  populate: PopulateOption[];
  distinct: string | null;
  aggregate: AggregateOption[];
  groupBy: string | null;
  having: QueryFilter | null;
}

export interface PopulateOption {
  field: string;
  collection: string;
  select: string[];
  populate?: PopulateOption[];
}

export interface AggregateOption {
  type: 'count' | 'sum' | 'avg' | 'min' | 'max' | 'first' | 'last' | 'push' | 'addToSet';
  field: string;
  alias: string;
}

export interface QueryResult<T = DataRecord> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  executionTime: number;
  fromCache: boolean;
}

export interface CacheEntry {
  key: string;
  value: unknown;
  expiresAt: number;
  createdAt: number;
  accessCount: number;
  lastAccessed: number;
  size: number;
  tags: string[];
}

export interface CacheStats {
  hits: number;
  misses: number;
  entries: number;
  totalSize: number;
  hitRate: number;
  evictions: number;
  oldestEntry: number;
  newestEntry: number;
}

export interface DataMigration {
  version: number;
  name: string;
  description: string;
  up: (store: DataStoreManager) => Promise<void>;
  down: (store: DataStoreManager) => Promise<void>;
  timestamp: number;
}

export interface DataExportOptions {
  format: 'json' | 'csv' | 'xml' | 'yaml' | 'sql';
  collections: string[];
  includeMetadata: boolean;
  includeSchema: boolean;
  pretty: boolean;
  compress: boolean;
  encryptExport: boolean;
  dateFormat: string;
  delimiter: string;
  nullValue: string;
}

export interface DataImportOptions {
  format: 'json' | 'csv' | 'xml' | 'yaml' | 'sql';
  collection: string;
  mergeStrategy: 'replace' | 'merge' | 'skip' | 'error';
  validateSchema: boolean;
  batchSize: number;
  dryRun: boolean;
  onError: 'stop' | 'skip' | 'log';
  transformFn?: (record: Record<string, unknown>) => Record<string, unknown>;
}

export interface SyncConfig {
  endpoint: string;
  interval: number;
  batchSize: number;
  conflictResolution: 'client-wins' | 'server-wins' | 'merge' | 'manual';
  retryAttempts: number;
  retryDelay: number;
  compression: boolean;
  encryption: boolean;
  headers: Record<string, string>;
  auth: {
    type: 'none' | 'bearer' | 'basic' | 'apiKey' | 'oauth2';
    token?: string;
    username?: string;
    password?: string;
    apiKey?: string;
  };
}

export interface ChangeLog {
  id: string;
  collection: string;
  recordId: string;
  operation: 'create' | 'update' | 'delete';
  changes: FieldChange[];
  timestamp: number;
  userId?: string;
  version: number;
  synced: boolean;
}

export interface FieldChange {
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

// =============================================================================
// Cache Implementation
// =============================================================================

export class InMemoryCache {
  private cache: Map<string, CacheEntry> = new Map();
  private maxSize: number;
  private maxEntries: number;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    entries: 0,
    totalSize: 0,
    hitRate: 0,
    evictions: 0,
    oldestEntry: 0,
    newestEntry: 0,
  };
  private evictionPolicy: 'lru' | 'lfu' | 'fifo' | 'ttl' = 'lru';

  constructor(maxSize = 50 * 1024 * 1024, maxEntries = 10000) {
    this.maxSize = maxSize;
    this.maxEntries = maxEntries;
  }

  get(key: string): unknown | null {
    const entry = this.cache.get(key);
    if (!entry) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    if (entry.expiresAt > 0 && Date.now() > entry.expiresAt) {
      this.delete(key);
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.stats.hits++;
    this.updateHitRate();
    return entry.value;
  }

  set(key: string, value: unknown, ttl = 0, tags: string[] = []): void {
    const size = this.estimateSize(value);

    while (this.stats.totalSize + size > this.maxSize || this.cache.size >= this.maxEntries) {
      if (!this.evict()) break;
    }

    const now = Date.now();
    const entry: CacheEntry = {
      key,
      value,
      expiresAt: ttl > 0 ? now + ttl : 0,
      createdAt: now,
      accessCount: 1,
      lastAccessed: now,
      size,
      tags,
    };

    const existing = this.cache.get(key);
    if (existing) {
      this.stats.totalSize -= existing.size;
    }

    this.cache.set(key, entry);
    this.stats.totalSize += size;
    this.stats.entries = this.cache.size;
    this.stats.newestEntry = now;
    if (this.stats.oldestEntry === 0) {
      this.stats.oldestEntry = now;
    }
  }

  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    this.cache.delete(key);
    this.stats.totalSize -= entry.size;
    this.stats.entries = this.cache.size;
    return true;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (entry.expiresAt > 0 && Date.now() > entry.expiresAt) {
      this.delete(key);
      return false;
    }
    return true;
  }

  clear(): void {
    this.cache.clear();
    this.stats.totalSize = 0;
    this.stats.entries = 0;
    this.stats.oldestEntry = 0;
    this.stats.newestEntry = 0;
  }

  invalidateByTag(tag: string): number {
    let count = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.includes(tag)) {
        this.delete(key);
        count++;
      }
    }
    return count;
  }

  invalidateByPattern(pattern: string): number {
    const regex = new RegExp(pattern);
    let count = 0;
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.delete(key);
        count++;
      }
    }
    return count;
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  cleanup(): number {
    const now = Date.now();
    let count = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt > 0 && now > entry.expiresAt) {
        this.delete(key);
        count++;
      }
    }
    return count;
  }

  getKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  getEntries(): CacheEntry[] {
    return Array.from(this.cache.values());
  }

  setEvictionPolicy(policy: 'lru' | 'lfu' | 'fifo' | 'ttl'): void {
    this.evictionPolicy = policy;
  }

  private evict(): boolean {
    if (this.cache.size === 0) return false;

    let keyToEvict: string | null = null;

    switch (this.evictionPolicy) {
      case 'lru': {
        let oldestAccess = Infinity;
        for (const [key, entry] of this.cache.entries()) {
          if (entry.lastAccessed < oldestAccess) {
            oldestAccess = entry.lastAccessed;
            keyToEvict = key;
          }
        }
        break;
      }
      case 'lfu': {
        let lowestCount = Infinity;
        for (const [key, entry] of this.cache.entries()) {
          if (entry.accessCount < lowestCount) {
            lowestCount = entry.accessCount;
            keyToEvict = key;
          }
        }
        break;
      }
      case 'fifo': {
        let oldestCreated = Infinity;
        for (const [key, entry] of this.cache.entries()) {
          if (entry.createdAt < oldestCreated) {
            oldestCreated = entry.createdAt;
            keyToEvict = key;
          }
        }
        break;
      }
      case 'ttl': {
        let earliestExpiry = Infinity;
        for (const [key, entry] of this.cache.entries()) {
          if (entry.expiresAt > 0 && entry.expiresAt < earliestExpiry) {
            earliestExpiry = entry.expiresAt;
            keyToEvict = key;
          }
        }
        if (!keyToEvict) {
          // Fall back to LRU if no TTL entries
          let oldestAccess = Infinity;
          for (const [key, entry] of this.cache.entries()) {
            if (entry.lastAccessed < oldestAccess) {
              oldestAccess = entry.lastAccessed;
              keyToEvict = key;
            }
          }
        }
        break;
      }
    }

    if (keyToEvict) {
      this.delete(keyToEvict);
      this.stats.evictions++;
      return true;
    }
    return false;
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  private estimateSize(value: unknown): number {
    const str = JSON.stringify(value);
    return str ? str.length * 2 : 0;
  }
}

// =============================================================================
// Query Builder
// =============================================================================

export class QueryBuilder {
  private options: QueryOptions = {
    filters: [],
    sort: [],
    limit: 50,
    offset: 0,
    select: [],
    populate: [],
    distinct: null,
    aggregate: [],
    groupBy: null,
    having: null,
  };

  where(field: string, operator: QueryOperator, value: unknown): this {
    this.options.filters.push({ field, operator, value });
    return this;
  }

  eq(field: string, value: unknown): this {
    return this.where(field, 'eq', value);
  }

  neq(field: string, value: unknown): this {
    return this.where(field, 'neq', value);
  }

  gt(field: string, value: unknown): this {
    return this.where(field, 'gt', value);
  }

  gte(field: string, value: unknown): this {
    return this.where(field, 'gte', value);
  }

  lt(field: string, value: unknown): this {
    return this.where(field, 'lt', value);
  }

  lte(field: string, value: unknown): this {
    return this.where(field, 'lte', value);
  }

  in(field: string, values: unknown[]): this {
    return this.where(field, 'in', values);
  }

  notIn(field: string, values: unknown[]): this {
    return this.where(field, 'nin', values);
  }

  contains(field: string, value: string): this {
    return this.where(field, 'contains', value);
  }

  startsWith(field: string, value: string): this {
    return this.where(field, 'startsWith', value);
  }

  endsWith(field: string, value: string): this {
    return this.where(field, 'endsWith', value);
  }

  regex(field: string, pattern: string): this {
    return this.where(field, 'regex', pattern);
  }

  exists(field: string): this {
    return this.where(field, 'exists', true);
  }

  notExists(field: string): this {
    return this.where(field, 'exists', false);
  }

  between(field: string, min: unknown, max: unknown): this {
    return this.where(field, 'between', [min, max]);
  }

  arrayContains(field: string, value: unknown): this {
    return this.where(field, 'arrayContains', value);
  }

  orderBy(field: string, direction: 'asc' | 'desc' = 'asc'): this {
    this.options.sort.push({ field, direction });
    return this;
  }

  limitTo(n: number): this {
    this.options.limit = n;
    return this;
  }

  skip(n: number): this {
    this.options.offset = n;
    return this;
  }

  page(pageNum: number, pageSize: number): this {
    this.options.offset = (pageNum - 1) * pageSize;
    this.options.limit = pageSize;
    return this;
  }

  selectFields(...fields: string[]): this {
    this.options.select = fields;
    return this;
  }

  populateRef(field: string, collection: string, select: string[] = []): this {
    this.options.populate.push({ field, collection, select });
    return this;
  }

  distinctField(field: string): this {
    this.options.distinct = field;
    return this;
  }

  count(field = '*', alias = 'count'): this {
    this.options.aggregate.push({ type: 'count', field, alias });
    return this;
  }

  sum(field: string, alias?: string): this {
    this.options.aggregate.push({ type: 'sum', field, alias: alias || `sum_${field}` });
    return this;
  }

  avg(field: string, alias?: string): this {
    this.options.aggregate.push({ type: 'avg', field, alias: alias || `avg_${field}` });
    return this;
  }

  min(field: string, alias?: string): this {
    this.options.aggregate.push({ type: 'min', field, alias: alias || `min_${field}` });
    return this;
  }

  max(field: string, alias?: string): this {
    this.options.aggregate.push({ type: 'max', field, alias: alias || `max_${field}` });
    return this;
  }

  group(field: string): this {
    this.options.groupBy = field;
    return this;
  }

  havingFilter(field: string, operator: QueryOperator, value: unknown): this {
    this.options.having = { field, operator, value };
    return this;
  }

  build(): QueryOptions {
    return { ...this.options };
  }

  reset(): this {
    this.options = {
      filters: [],
      sort: [],
      limit: 50,
      offset: 0,
      select: [],
      populate: [],
      distinct: null,
      aggregate: [],
      groupBy: null,
      having: null,
    };
    return this;
  }
}

// =============================================================================
// DataStore Manager
// =============================================================================

export class DataStoreManager {
  private collections: Map<string, DataCollection> = new Map();
  private cache: InMemoryCache;
  private changeLogs: ChangeLog[] = [];
  private migrations: DataMigration[] = [];
  private currentVersion = 0;
  private listeners: Map<string, Array<(event: DataEvent) => void>> = new Map();
  private transactionStack: TransactionFrame[] = [];

  constructor(cacheSize?: number) {
    this.cache = new InMemoryCache(cacheSize);
  }

  // ---------------------------------------------------------------------------
  // Collection Management
  // ---------------------------------------------------------------------------

  createCollection(name: string, schema: DataSchema, options?: Partial<CollectionOptions>): DataCollection {
    if (this.collections.has(name)) {
      throw new Error(`Collection "${name}" already exists`);
    }

    const collection: DataCollection = {
      name,
      schema,
      indexes: [],
      records: new Map(),
      validators: [],
      hooks: [],
      options: {
        timestamps: true,
        softDelete: false,
        versioning: true,
        maxRecords: 100000,
        ttl: 0,
        cacheEnabled: true,
        cacheTTL: 300000, // 5 minutes
        syncEnabled: false,
        encryptionEnabled: false,
        compressionEnabled: false,
        auditLog: true,
        ...options,
      },
    };

    // Auto-create indexes for indexed fields
    for (const field of schema.fields) {
      if (field.indexed || field.unique) {
        collection.indexes.push({
          name: `idx_${name}_${field.name}`,
          fields: [field.name],
          unique: field.unique || false,
          sparse: false,
          compound: false,
        });
      }
    }

    this.collections.set(name, collection);
    this.emit('collection:created', { collection: name });
    return collection;
  }

  dropCollection(name: string): boolean {
    const collection = this.collections.get(name);
    if (!collection) return false;

    this.cache.invalidateByTag(`collection:${name}`);
    this.collections.delete(name);
    this.emit('collection:dropped', { collection: name });
    return true;
  }

  getCollection(name: string): DataCollection | undefined {
    return this.collections.get(name);
  }

  listCollections(): string[] {
    return Array.from(this.collections.keys());
  }

  // ---------------------------------------------------------------------------
  // CRUD Operations
  // ---------------------------------------------------------------------------

  create(collectionName: string, data: Record<string, unknown>): DataRecord {
    const collection = this.getCollectionOrThrow(collectionName);
    const now = Date.now();

    const record: DataRecord = {
      id: this.generateId(),
      collection: collectionName,
      data: { ...data },
      createdAt: now,
      updatedAt: now,
      version: 1,
      tags: [],
      metadata: {},
    };

    // Validate against schema
    const validationResult = this.validateRecord(collection, record);
    if (!validationResult.valid) {
      throw new DataValidationError('Validation failed', validationResult.errors);
    }

    // Apply default values
    for (const field of collection.schema.fields) {
      if (field.defaultValue !== undefined && record.data[field.name] === undefined) {
        record.data[field.name] = field.defaultValue;
      }
    }

    // Check unique constraints
    this.checkUniqueConstraints(collection, record);

    // Run before-create hooks
    const processedRecord = this.runHooks(collection, 'before-create', record);

    // Check max records
    if (collection.records.size >= collection.options.maxRecords) {
      throw new Error(`Collection "${collectionName}" has reached maximum capacity (${collection.options.maxRecords})`);
    }

    // Insert
    collection.records.set(processedRecord.id, processedRecord);

    // Log change
    if (collection.options.auditLog) {
      this.logChange(collectionName, processedRecord.id, 'create', [], processedRecord.version);
    }

    // Invalidate cache
    this.cache.invalidateByTag(`collection:${collectionName}`);

    // Run after-create hooks
    this.runHooks(collection, 'after-create', processedRecord);

    // Emit event
    this.emit('record:created', { collection: collectionName, record: processedRecord });

    return processedRecord;
  }

  read(collectionName: string, id: string): DataRecord | null {
    const collection = this.getCollectionOrThrow(collectionName);

    // Check cache first
    const cacheKey = `${collectionName}:${id}`;
    if (collection.options.cacheEnabled) {
      const cached = this.cache.get(cacheKey) as DataRecord | null;
      if (cached) return cached;
    }

    const record = collection.records.get(id) || null;

    // Cache the result
    if (record && collection.options.cacheEnabled) {
      this.cache.set(cacheKey, record, collection.options.cacheTTL, [`collection:${collectionName}`]);
    }

    return record;
  }

  update(collectionName: string, id: string, data: Partial<Record<string, unknown>>): DataRecord {
    const collection = this.getCollectionOrThrow(collectionName);
    const existing = collection.records.get(id);
    if (!existing) {
      throw new Error(`Record "${id}" not found in collection "${collectionName}"`);
    }

    const changes: FieldChange[] = [];
    for (const [key, value] of Object.entries(data)) {
      if (JSON.stringify(existing.data[key]) !== JSON.stringify(value)) {
        changes.push({
          field: key,
          oldValue: existing.data[key],
          newValue: value,
        });
      }
    }

    // Check immutable fields
    for (const field of collection.schema.fields) {
      if (field.immutable && data[field.name] !== undefined && existing.data[field.name] !== undefined) {
        throw new Error(`Field "${field.name}" is immutable and cannot be updated`);
      }
    }

    const updated: DataRecord = {
      ...existing,
      data: { ...existing.data, ...data },
      updatedAt: Date.now(),
      version: existing.version + 1,
    };

    // Validate
    const validationResult = this.validateRecord(collection, updated);
    if (!validationResult.valid) {
      throw new DataValidationError('Validation failed', validationResult.errors);
    }

    // Check unique constraints
    this.checkUniqueConstraints(collection, updated, existing.id);

    // Run before-update hooks
    const processed = this.runHooks(collection, 'before-update', updated);

    // Update
    collection.records.set(id, processed);

    // Log change
    if (collection.options.auditLog) {
      this.logChange(collectionName, id, 'update', changes, processed.version);
    }

    // Invalidate cache
    this.cache.delete(`${collectionName}:${id}`);
    this.cache.invalidateByTag(`collection:${collectionName}`);

    // Run after-update hooks
    this.runHooks(collection, 'after-update', processed);

    // Emit event
    this.emit('record:updated', { collection: collectionName, record: processed, changes });

    return processed;
  }

  delete(collectionName: string, id: string): boolean {
    const collection = this.getCollectionOrThrow(collectionName);
    const existing = collection.records.get(id);
    if (!existing) return false;

    // Run before-delete hooks
    this.runHooks(collection, 'before-delete', existing);

    if (collection.options.softDelete) {
      existing.metadata['_deleted'] = true;
      existing.metadata['_deletedAt'] = Date.now();
      existing.updatedAt = Date.now();
      collection.records.set(id, existing);
    } else {
      collection.records.delete(id);
    }

    // Log change
    if (collection.options.auditLog) {
      this.logChange(collectionName, id, 'delete', [], existing.version);
    }

    // Invalidate cache
    this.cache.delete(`${collectionName}:${id}`);
    this.cache.invalidateByTag(`collection:${collectionName}`);

    // Run after-delete hooks
    this.runHooks(collection, 'after-delete', existing);

    // Emit event
    this.emit('record:deleted', { collection: collectionName, recordId: id });

    return true;
  }

  // ---------------------------------------------------------------------------
  // Query Engine  
  // ---------------------------------------------------------------------------

  query(collectionName: string, options: QueryOptions): QueryResult {
    const startTime = performance.now();
    const collection = this.getCollectionOrThrow(collectionName);

    // Check cache
    const cacheKey = `query:${collectionName}:${JSON.stringify(options)}`;
    if (collection.options.cacheEnabled) {
      const cached = this.cache.get(cacheKey) as QueryResult | null;
      if (cached) {
        return { ...cached, fromCache: true };
      }
    }

    let records = Array.from(collection.records.values());

    // Filter soft-deleted
    if (collection.options.softDelete) {
      records = records.filter(r => !r.metadata['_deleted']);
    }

    // Apply filters
    records = this.applyFilters(records, options.filters);

    // Get total before pagination
    const total = records.length;

    // Apply sorting
    if (options.sort.length > 0) {
      records = this.applySorting(records, options.sort);
    }

    // Apply distinct
    if (options.distinct) {
      const seen = new Set();
      records = records.filter(r => {
        const val = this.getNestedValue(r.data, options.distinct!);
        if (seen.has(val)) return false;
        seen.add(val);
        return true;
      });
    }

    // Apply pagination
    records = records.slice(options.offset, options.offset + options.limit);

    // Apply field selection
    if (options.select.length > 0) {
      records = records.map(r => ({
        ...r,
        data: this.selectFields(r.data, options.select),
      }));
    }

    const executionTime = performance.now() - startTime;

    const result: QueryResult = {
      data: records,
      total,
      page: Math.floor(options.offset / options.limit) + 1,
      pageSize: options.limit,
      hasMore: options.offset + options.limit < total,
      executionTime,
      fromCache: false,
    };

    // Cache result
    if (collection.options.cacheEnabled) {
      this.cache.set(cacheKey, result, collection.options.cacheTTL, [`collection:${collectionName}`]);
    }

    return result;
  }

  queryBuilder(): QueryBuilder {
    return new QueryBuilder();
  }

  findOne(collectionName: string, filters: QueryFilter[]): DataRecord | null {
    const result = this.query(collectionName, {
      filters,
      sort: [],
      limit: 1,
      offset: 0,
      select: [],
      populate: [],
      distinct: null,
      aggregate: [],
      groupBy: null,
      having: null,
    });
    return result.data[0] || null;
  }

  findById(collectionName: string, id: string): DataRecord | null {
    return this.read(collectionName, id);
  }

  findByIds(collectionName: string, ids: string[]): DataRecord[] {
    const collection = this.getCollectionOrThrow(collectionName);
    return ids
      .map(id => collection.records.get(id))
      .filter((r): r is DataRecord => r !== undefined);
  }

  count(collectionName: string, filters: QueryFilter[] = []): number {
    const collection = this.getCollectionOrThrow(collectionName);
    let records = Array.from(collection.records.values());
    if (filters.length > 0) {
      records = this.applyFilters(records, filters);
    }
    return records.length;
  }

  aggregate(collectionName: string, options: AggregateOption[], filters: QueryFilter[] = []): Record<string, unknown> {
    const collection = this.getCollectionOrThrow(collectionName);
    let records = Array.from(collection.records.values());

    if (filters.length > 0) {
      records = this.applyFilters(records, filters);
    }

    const result: Record<string, unknown> = {};

    for (const agg of options) {
      const values = records
        .map(r => this.getNestedValue(r.data, agg.field))
        .filter((v): v is number => typeof v === 'number');

      switch (agg.type) {
        case 'count':
          result[agg.alias] = records.length;
          break;
        case 'sum':
          result[agg.alias] = values.reduce((a, b) => a + b, 0);
          break;
        case 'avg':
          result[agg.alias] = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
          break;
        case 'min':
          result[agg.alias] = values.length > 0 ? Math.min(...values) : null;
          break;
        case 'max':
          result[agg.alias] = values.length > 0 ? Math.max(...values) : null;
          break;
        case 'first':
          result[agg.alias] = records.length > 0 ? this.getNestedValue(records[0].data, agg.field) : null;
          break;
        case 'last':
          result[agg.alias] = records.length > 0 ? this.getNestedValue(records[records.length - 1].data, agg.field) : null;
          break;
      }
    }

    return result;
  }

  // ---------------------------------------------------------------------------
  // Bulk Operations
  // ---------------------------------------------------------------------------

  bulkCreate(collectionName: string, records: Record<string, unknown>[]): DataRecord[] {
    return records.map(data => this.create(collectionName, data));
  }

  bulkUpdate(collectionName: string, updates: Array<{ id: string; data: Partial<Record<string, unknown>> }>): DataRecord[] {
    return updates.map(({ id, data }) => this.update(collectionName, id, data));
  }

  bulkDelete(collectionName: string, ids: string[]): number {
    let count = 0;
    for (const id of ids) {
      if (this.delete(collectionName, id)) count++;
    }
    return count;
  }

  upsert(collectionName: string, id: string, data: Record<string, unknown>): DataRecord {
    const existing = this.read(collectionName, id);
    if (existing) {
      return this.update(collectionName, id, data);
    }
    const record = this.create(collectionName, data);
    return record;
  }

  // ---------------------------------------------------------------------------
  // Transactions
  // ---------------------------------------------------------------------------

  beginTransaction(): string {
    const txId = this.generateId();
    const frame: TransactionFrame = {
      id: txId,
      operations: [],
      snapshots: new Map(),
      startedAt: Date.now(),
    };
    this.transactionStack.push(frame);
    return txId;
  }

  commitTransaction(txId: string): void {
    const frameIndex = this.transactionStack.findIndex(f => f.id === txId);
    if (frameIndex === -1) {
      throw new Error(`Transaction "${txId}" not found`);
    }
    this.transactionStack.splice(frameIndex, 1);
    this.emit('transaction:committed', { transactionId: txId });
  }

  rollbackTransaction(txId: string): void {
    const frameIndex = this.transactionStack.findIndex(f => f.id === txId);
    if (frameIndex === -1) {
      throw new Error(`Transaction "${txId}" not found`);
    }

    const frame = this.transactionStack[frameIndex];

    // Restore snapshots
    for (const [key, snapshot] of frame.snapshots.entries()) {
      const [collectionName] = key.split(':');
      const collection = this.collections.get(collectionName);
      if (collection) {
        if (snapshot) {
          collection.records.set(snapshot.id, snapshot);
        }
      }
    }

    this.transactionStack.splice(frameIndex, 1);
    this.emit('transaction:rolledback', { transactionId: txId });
  }

  // ---------------------------------------------------------------------------
  // Data Export / Import
  // ---------------------------------------------------------------------------

  exportData(options: DataExportOptions): string {
    const collections = options.collections.length > 0
      ? options.collections
      : this.listCollections();

    const exportObj: Record<string, unknown> = {};

    if (options.includeSchema) {
      exportObj['_schemas'] = {};
      for (const name of collections) {
        const coll = this.collections.get(name);
        if (coll) {
          (exportObj['_schemas'] as Record<string, unknown>)[name] = coll.schema;
        }
      }
    }

    if (options.includeMetadata) {
      exportObj['_metadata'] = {
        exportedAt: new Date().toISOString(),
        version: this.currentVersion,
        collections: collections.length,
      };
    }

    for (const name of collections) {
      const coll = this.collections.get(name);
      if (coll) {
        exportObj[name] = Array.from(coll.records.values());
      }
    }

    switch (options.format) {
      case 'json':
        return options.pretty
          ? JSON.stringify(exportObj, null, 2)
          : JSON.stringify(exportObj);

      case 'csv':
        return this.exportToCSV(exportObj, options.delimiter || ',');

      case 'xml':
        return this.exportToXML(exportObj);

      case 'yaml':
        return this.exportToYAML(exportObj);

      case 'sql':
        return this.exportToSQL(exportObj);

      default:
        return JSON.stringify(exportObj);
    }
  }

  importData(rawData: string, options: DataImportOptions): { imported: number; skipped: number; errors: string[] } {
    const result = { imported: 0, skipped: 0, errors: [] as string[] };

    let records: Record<string, unknown>[];
    try {
      switch (options.format) {
        case 'json':
          records = JSON.parse(rawData);
          break;
        case 'csv':
          records = this.parseCSV(rawData);
          break;
        default:
          records = JSON.parse(rawData);
      }
    } catch (e) {
      result.errors.push(`Failed to parse input: ${e}`);
      return result;
    }

    if (!Array.isArray(records)) {
      result.errors.push('Input data must be an array of records');
      return result;
    }

    for (let i = 0; i < records.length; i++) {
      try {
        let record = records[i];
        if (options.transformFn) {
          record = options.transformFn(record);
        }
        this.create(options.collection, record);
        result.imported++;
      } catch (e) {
        const errorMsg = `Record ${i}: ${e}`;
        result.errors.push(errorMsg);
        if (options.onError === 'stop') break;
        result.skipped++;
      }
    }

    return result;
  }

  // ---------------------------------------------------------------------------
  // Change Log
  // ---------------------------------------------------------------------------

  getChangeLogs(collectionName?: string, limit = 100): ChangeLog[] {
    let logs = this.changeLogs;
    if (collectionName) {
      logs = logs.filter(l => l.collection === collectionName);
    }
    return logs.slice(-limit);
  }

  getRecordHistory(collectionName: string, recordId: string): ChangeLog[] {
    return this.changeLogs.filter(l => l.collection === collectionName && l.recordId === recordId);
  }

  clearChangeLogs(): void {
    this.changeLogs = [];
  }

  // ---------------------------------------------------------------------------
  // Schema Management
  // ---------------------------------------------------------------------------

  addField(collectionName: string, field: SchemaField): void {
    const collection = this.getCollectionOrThrow(collectionName);
    const existing = collection.schema.fields.find(f => f.name === field.name);
    if (existing) {
      throw new Error(`Field "${field.name}" already exists in collection "${collectionName}"`);
    }
    collection.schema.fields.push(field);

    // Apply default value to existing records
    if (field.defaultValue !== undefined) {
      for (const record of collection.records.values()) {
        if (record.data[field.name] === undefined) {
          record.data[field.name] = field.defaultValue;
        }
      }
    }

    this.emit('schema:updated', { collection: collectionName, field: field.name, action: 'add' });
  }

  removeField(collectionName: string, fieldName: string): void {
    const collection = this.getCollectionOrThrow(collectionName);
    collection.schema.fields = collection.schema.fields.filter(f => f.name !== fieldName);

    // Remove field from existing records
    for (const record of collection.records.values()) {
      delete record.data[fieldName];
    }

    this.emit('schema:updated', { collection: collectionName, field: fieldName, action: 'remove' });
  }

  // ---------------------------------------------------------------------------
  // Index Management
  // ---------------------------------------------------------------------------

  createIndex(collectionName: string, index: DataIndex): void {
    const collection = this.getCollectionOrThrow(collectionName);
    collection.indexes.push(index);
    this.emit('index:created', { collection: collectionName, index: index.name });
  }

  dropIndex(collectionName: string, indexName: string): void {
    const collection = this.getCollectionOrThrow(collectionName);
    collection.indexes = collection.indexes.filter(i => i.name !== indexName);
    this.emit('index:dropped', { collection: collectionName, index: indexName });
  }

  // ---------------------------------------------------------------------------
  // Hooks 
  // ---------------------------------------------------------------------------

  addHook(collectionName: string, hook: DataHook): void {
    const collection = this.getCollectionOrThrow(collectionName);
    collection.hooks.push(hook);
    collection.hooks.sort((a, b) => a.priority - b.priority);
  }

  removeHook(collectionName: string, hookName: string): void {
    const collection = this.getCollectionOrThrow(collectionName);
    collection.hooks = collection.hooks.filter(h => h.name !== hookName);
  }

  // ---------------------------------------------------------------------------
  // Events
  // ---------------------------------------------------------------------------

  on(event: string, handler: (data: DataEvent) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
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
  // Statistics
  // ---------------------------------------------------------------------------

  getCollectionStats(collectionName: string): CollectionStats {
    const collection = this.getCollectionOrThrow(collectionName);
    const records = Array.from(collection.records.values());

    return {
      name: collectionName,
      recordCount: records.length,
      totalSize: this.estimateCollectionSize(records),
      avgRecordSize: records.length > 0 ? this.estimateCollectionSize(records) / records.length : 0,
      indexCount: collection.indexes.length,
      oldestRecord: records.length > 0 ? Math.min(...records.map(r => r.createdAt)) : 0,
      newestRecord: records.length > 0 ? Math.max(...records.map(r => r.createdAt)) : 0,
      fieldCount: collection.schema.fields.length,
      hookCount: collection.hooks.length,
    };
  }

  getGlobalStats(): GlobalStats {
    const collections = this.listCollections();
    let totalRecords = 0;
    let totalSize = 0;

    for (const name of collections) {
      const stats = this.getCollectionStats(name);
      totalRecords += stats.recordCount;
      totalSize += stats.totalSize;
    }

    return {
      collections: collections.length,
      totalRecords,
      totalSize,
      cacheStats: this.cache.getStats(),
      changeLogSize: this.changeLogs.length,
      currentVersion: this.currentVersion,
    };
  }

  // ---------------------------------------------------------------------------
  // Migrations
  // ---------------------------------------------------------------------------

  registerMigration(migration: DataMigration): void {
    this.migrations.push(migration);
    this.migrations.sort((a, b) => a.version - b.version);
  }

  async runMigrations(): Promise<{ applied: number; errors: string[] }> {
    const result = { applied: 0, errors: [] as string[] };

    for (const migration of this.migrations) {
      if (migration.version > this.currentVersion) {
        try {
          await migration.up(this);
          this.currentVersion = migration.version;
          result.applied++;
        } catch (e) {
          result.errors.push(`Migration ${migration.version} (${migration.name}): ${e}`);
          break;
        }
      }
    }

    return result;
  }

  async rollbackMigration(): Promise<boolean> {
    const current = this.migrations.find(m => m.version === this.currentVersion);
    if (!current) return false;

    try {
      await current.down(this);
      const prevMigration = this.migrations.filter(m => m.version < this.currentVersion).pop();
      this.currentVersion = prevMigration ? prevMigration.version : 0;
      return true;
    } catch {
      return false;
    }
  }

  // ---------------------------------------------------------------------------
  // Persistence (localStorage fallback)
  // ---------------------------------------------------------------------------

  saveToLocalStorage(key = 'datastore'): void {
    if (typeof window === 'undefined') return;

    const data: Record<string, unknown> = {
      version: this.currentVersion,
      collections: {} as Record<string, unknown>,
    };

    for (const [name, coll] of this.collections.entries()) {
      (data.collections as Record<string, unknown>)[name] = {
        schema: coll.schema,
        options: coll.options,
        records: Array.from(coll.records.values()),
      };
    }

    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save DataStore to localStorage:', e);
    }
  }

  loadFromLocalStorage(key = 'datastore'): boolean {
    if (typeof window === 'undefined') return false;

    try {
      const raw = localStorage.getItem(key);
      if (!raw) return false;

      const data = JSON.parse(raw);
      this.currentVersion = data.version || 0;

      for (const [name, collData] of Object.entries(data.collections || {})) {
        const cd = collData as { schema: DataSchema; options: CollectionOptions; records: DataRecord[] };
        const collection = this.createCollection(name, cd.schema, cd.options);
        for (const record of cd.records) {
          collection.records.set(record.id, record);
        }
      }

      return true;
    } catch (e) {
      console.warn('Failed to load DataStore from localStorage:', e);
      return false;
    }
  }

  // ---------------------------------------------------------------------------
  // Private Helpers
  // ---------------------------------------------------------------------------

  private getCollectionOrThrow(name: string): DataCollection {
    const collection = this.collections.get(name);
    if (!collection) {
      throw new Error(`Collection "${name}" does not exist`);
    }
    return collection;
  }

  private generateId(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 10);
    const counter = (Math.floor(Math.random() * 0xffffff)).toString(16).padStart(6, '0');
    return `${timestamp}-${randomPart}-${counter}`;
  }

  private validateRecord(collection: DataCollection, record: DataRecord): ValidationResult {
    const errors: ValidationError[] = [];

    for (const field of collection.schema.fields) {
      const value = record.data[field.name];

      // Required check
      if (field.required && (value === undefined || value === null || value === '')) {
        errors.push({
          field: field.name,
          message: `Field "${field.name}" is required`,
          code: 'REQUIRED',
          value,
        });
        continue;
      }

      if (value === undefined || value === null) continue;

      // Type check
      const typeValid = this.checkFieldType(value, field.type);
      if (!typeValid) {
        errors.push({
          field: field.name,
          message: `Field "${field.name}" must be of type "${field.type}"`,
          code: 'TYPE_MISMATCH',
          value,
        });
      }

      // Min/Max for numbers
      if (typeof value === 'number') {
        if (field.min !== undefined && value < field.min) {
          errors.push({
            field: field.name,
            message: `Field "${field.name}" must be at least ${field.min}`,
            code: 'MIN',
            value,
          });
        }
        if (field.max !== undefined && value > field.max) {
          errors.push({
            field: field.name,
            message: `Field "${field.name}" must be at most ${field.max}`,
            code: 'MAX',
            value,
          });
        }
      }

      // String length
      if (typeof value === 'string') {
        if (field.minLength !== undefined && value.length < field.minLength) {
          errors.push({
            field: field.name,
            message: `Field "${field.name}" must be at least ${field.minLength} characters`,
            code: 'MIN_LENGTH',
            value,
          });
        }
        if (field.maxLength !== undefined && value.length > field.maxLength) {
          errors.push({
            field: field.name,
            message: `Field "${field.name}" must be at most ${field.maxLength} characters`,
            code: 'MAX_LENGTH',
            value,
          });
        }
        if (field.pattern) {
          const regex = new RegExp(field.pattern);
          if (!regex.test(value)) {
            errors.push({
              field: field.name,
              message: `Field "${field.name}" does not match pattern "${field.pattern}"`,
              code: 'PATTERN',
              value,
            });
          }
        }
      }

      // Enum check
      if (field.enumValues && !field.enumValues.includes(String(value))) {
        errors.push({
          field: field.name,
          message: `Field "${field.name}" must be one of: ${field.enumValues.join(', ')}`,
          code: 'ENUM',
          value,
        });
      }

      // Custom field validators
      if (field.validators) {
        for (const validator of field.validators) {
          if (validator.customFn && !validator.customFn(value)) {
            errors.push({
              field: field.name,
              message: validator.message,
              code: 'CUSTOM',
              value,
            });
          }
        }
      }
    }

    // Check for additional properties
    if (!collection.schema.additionalProperties) {
      const fieldNames = new Set(collection.schema.fields.map(f => f.name));
      for (const key of Object.keys(record.data)) {
        if (!fieldNames.has(key)) {
          errors.push({
            field: key,
            message: `Additional property "${key}" is not allowed`,
            code: 'ADDITIONAL_PROPERTY',
          });
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  private checkFieldType(value: unknown, type: string): boolean {
    switch (type) {
      case 'string': return typeof value === 'string';
      case 'number': return typeof value === 'number' && !isNaN(value);
      case 'boolean': return typeof value === 'boolean';
      case 'date': return value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)));
      case 'array': return Array.isArray(value);
      case 'object': return typeof value === 'object' && !Array.isArray(value) && value !== null;
      case 'reference': return typeof value === 'string';
      case 'enum': return typeof value === 'string';
      case 'file': return typeof value === 'string' || (typeof value === 'object' && value !== null);
      case 'geo': return typeof value === 'object' && value !== null;
      case 'json': return true;
      default: return true;
    }
  }

  private checkUniqueConstraints(collection: DataCollection, record: DataRecord, excludeId?: string): void {
    for (const index of collection.indexes) {
      if (!index.unique) continue;

      for (const existingRecord of collection.records.values()) {
        if (excludeId && existingRecord.id === excludeId) continue;

        const allFieldsMatch = index.fields.every(
          field => JSON.stringify(existingRecord.data[field]) === JSON.stringify(record.data[field])
        );

        if (allFieldsMatch) {
          throw new Error(
            `Unique constraint violation on index "${index.name}" for fields: ${index.fields.join(', ')}`
          );
        }
      }
    }
  }

  private runHooks(collection: DataCollection, phase: DataHook['phase'], record: DataRecord): DataRecord {
    let current = record;
    for (const hook of collection.hooks) {
      if (hook.phase === phase && hook.enabled) {
        const context: HookContext = {
          collection: collection.name,
          operation: phase.replace('before-', '').replace('after-', '') as HookContext['operation'],
          timestamp: Date.now(),
          metadata: {},
        };
        const result = hook.handler(current, context);
        if (result instanceof Promise) {
          // For sync processing, we can't handle async hooks inline
          console.warn(`Async hook "${hook.name}" used in sync context`);
        } else {
          current = result;
        }
      }
    }
    return current;
  }

  private logChange(collection: string, recordId: string, operation: ChangeLog['operation'], changes: FieldChange[], version: number): void {
    this.changeLogs.push({
      id: this.generateId(),
      collection,
      recordId,
      operation,
      changes,
      timestamp: Date.now(),
      version,
      synced: false,
    });

    // Trim logs if too large
    if (this.changeLogs.length > 10000) {
      this.changeLogs = this.changeLogs.slice(-5000);
    }
  }

  private applyFilters(records: DataRecord[], filters: QueryFilter[]): DataRecord[] {
    return records.filter(record => {
      return filters.every(filter => {
        const value = this.getNestedValue(record.data, filter.field);
        return this.evaluateFilter(value, filter.operator, filter.value);
      });
    });
  }

  private evaluateFilter(value: unknown, operator: QueryOperator, filterValue: unknown): boolean {
    switch (operator) {
      case 'eq':
        return JSON.stringify(value) === JSON.stringify(filterValue);
      case 'neq':
        return JSON.stringify(value) !== JSON.stringify(filterValue);
      case 'gt':
        return (value as number) > (filterValue as number);
      case 'gte':
        return (value as number) >= (filterValue as number);
      case 'lt':
        return (value as number) < (filterValue as number);
      case 'lte':
        return (value as number) <= (filterValue as number);
      case 'in':
        return Array.isArray(filterValue) && filterValue.includes(value);
      case 'nin':
        return Array.isArray(filterValue) && !filterValue.includes(value);
      case 'contains':
        return typeof value === 'string' && value.toLowerCase().includes(String(filterValue).toLowerCase());
      case 'startsWith':
        return typeof value === 'string' && value.toLowerCase().startsWith(String(filterValue).toLowerCase());
      case 'endsWith':
        return typeof value === 'string' && value.toLowerCase().endsWith(String(filterValue).toLowerCase());
      case 'regex': {
        if (typeof value !== 'string') return false;
        try {
          return new RegExp(String(filterValue), 'i').test(value);
        } catch {
          return false;
        }
      }
      case 'exists':
        return filterValue ? value !== undefined && value !== null : value === undefined || value === null;
      case 'between': {
        if (!Array.isArray(filterValue) || filterValue.length !== 2) return false;
        const num = value as number;
        return num >= (filterValue[0] as number) && num <= (filterValue[1] as number);
      }
      case 'arrayContains':
        return Array.isArray(value) && value.includes(filterValue);
      case 'arrayContainsAny':
        return Array.isArray(value) && Array.isArray(filterValue) && filterValue.some(v => value.includes(v));
      case 'arrayLength':
        return Array.isArray(value) && value.length === (filterValue as number);
      default:
        return true;
    }
  }

  private applySorting(records: DataRecord[], sort: QuerySort[]): DataRecord[] {
    return [...records].sort((a, b) => {
      for (const s of sort) {
        const aVal = this.getNestedValue(a.data, s.field);
        const bVal = this.getNestedValue(b.data, s.field);

        let cmp = 0;
        if (aVal === bVal) cmp = 0;
        else if (aVal === null || aVal === undefined) cmp = 1;
        else if (bVal === null || bVal === undefined) cmp = -1;
        else if (typeof aVal === 'string' && typeof bVal === 'string') cmp = aVal.localeCompare(bVal);
        else if (typeof aVal === 'number' && typeof bVal === 'number') cmp = aVal - bVal;
        else cmp = String(aVal).localeCompare(String(bVal));

        if (s.direction === 'desc') cmp = -cmp;
        if (cmp !== 0) return cmp;
      }
      return 0;
    });
  }

  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    const parts = path.split('.');
    let current: unknown = obj;
    for (const part of parts) {
      if (current === null || current === undefined) return undefined;
      current = (current as Record<string, unknown>)[part];
    }
    return current;
  }

  private selectFields(data: Record<string, unknown>, fields: string[]): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const field of fields) {
      result[field] = this.getNestedValue(data, field);
    }
    return result;
  }

  private estimateCollectionSize(records: DataRecord[]): number {
    return JSON.stringify(records).length * 2;
  }

  private emit(event: string, data: unknown): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(data as DataEvent);
        } catch (e) {
          console.error(`Error in DataStore event handler for "${event}":`, e);
        }
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Export Helpers
  // ---------------------------------------------------------------------------

  private exportToCSV(data: Record<string, unknown>, delimiter: string): string {
    const lines: string[] = [];

    for (const [name, records] of Object.entries(data)) {
      if (name.startsWith('_')) continue;
      if (!Array.isArray(records)) continue;

      lines.push(`# Collection: ${name}`);

      if (records.length > 0) {
        const firstRecord = records[0] as DataRecord;
        const fields = Object.keys(firstRecord.data);
        lines.push(['id', ...fields, 'createdAt', 'updatedAt'].join(delimiter));

        for (const record of records as DataRecord[]) {
          const values = [
            record.id,
            ...fields.map(f => this.csvEscape(String(record.data[f] ?? ''), delimiter)),
            new Date(record.createdAt).toISOString(),
            new Date(record.updatedAt).toISOString(),
          ];
          lines.push(values.join(delimiter));
        }
      }

      lines.push('');
    }

    return lines.join('\n');
  }

  private csvEscape(value: string, delimiter: string): string {
    if (value.includes(delimiter) || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  private exportToXML(data: Record<string, unknown>): string {
    const lines: string[] = ['<?xml version="1.0" encoding="UTF-8"?>', '<datastore>'];

    for (const [name, records] of Object.entries(data)) {
      if (!Array.isArray(records)) {
        lines.push(`  <${name}>${this.xmlEscape(JSON.stringify(records))}</${name}>`);
        continue;
      }

      lines.push(`  <collection name="${name}">`);
      for (const record of records as DataRecord[]) {
        lines.push('    <record>');
        lines.push(`      <id>${record.id}</id>`);
        for (const [key, value] of Object.entries(record.data)) {
          lines.push(`      <${key}>${this.xmlEscape(String(value ?? ''))}</${key}>`);
        }
        lines.push(`      <createdAt>${new Date(record.createdAt).toISOString()}</createdAt>`);
        lines.push(`      <updatedAt>${new Date(record.updatedAt).toISOString()}</updatedAt>`);
        lines.push('    </record>');
      }
      lines.push('  </collection>');
    }

    lines.push('</datastore>');
    return lines.join('\n');
  }

  private xmlEscape(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private exportToYAML(data: Record<string, unknown>): string {
    return this.toYAML(data, 0);
  }

  private toYAML(obj: unknown, indent: number): string {
    const prefix = '  '.repeat(indent);

    if (obj === null || obj === undefined) return `${prefix}null\n`;
    if (typeof obj === 'string') return `${prefix}"${obj}"\n`;
    if (typeof obj === 'number' || typeof obj === 'boolean') return `${prefix}${obj}\n`;

    if (Array.isArray(obj)) {
      if (obj.length === 0) return `${prefix}[]\n`;
      return obj.map(item => `${prefix}- ${this.toYAML(item, indent + 1).trim()}\n`).join('');
    }

    if (typeof obj === 'object') {
      const entries = Object.entries(obj as Record<string, unknown>);
      if (entries.length === 0) return `${prefix}{}\n`;
      return entries.map(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          return `${prefix}${key}:\n${this.toYAML(value, indent + 1)}`;
        }
        return `${prefix}${key}: ${this.toYAML(value, 0).trim()}\n`;
      }).join('');
    }

    return `${prefix}${String(obj)}\n`;
  }

  private exportToSQL(data: Record<string, unknown>): string {
    const lines: string[] = ['-- DataStore SQL Export', `-- Generated: ${new Date().toISOString()}`, ''];

    for (const [name, records] of Object.entries(data)) {
      if (name.startsWith('_') || !Array.isArray(records)) continue;
      if (records.length === 0) continue;

      const firstRecord = records[0] as DataRecord;
      const fields = Object.keys(firstRecord.data);

      // CREATE TABLE
      lines.push(`CREATE TABLE IF NOT EXISTS \`${name}\` (`);
      lines.push('  `id` VARCHAR(64) PRIMARY KEY,');
      for (const field of fields) {
        const value = firstRecord.data[field];
        const sqlType = this.inferSQLType(value);
        lines.push(`  \`${field}\` ${sqlType},`);
      }
      lines.push('  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,');
      lines.push('  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
      lines.push(');');
      lines.push('');

      // INSERT statements
      for (const record of records as DataRecord[]) {
        const values = [
          `'${record.id}'`,
          ...fields.map(f => this.sqlEscape(record.data[f])),
          `'${new Date(record.createdAt).toISOString()}'`,
          `'${new Date(record.updatedAt).toISOString()}'`,
        ];
        lines.push(
          `INSERT INTO \`${name}\` (\`id\`, ${fields.map(f => `\`${f}\``).join(', ')}, \`created_at\`, \`updated_at\`) VALUES (${values.join(', ')});`
        );
      }
      lines.push('');
    }

    return lines.join('\n');
  }

  private inferSQLType(value: unknown): string {
    if (typeof value === 'number') return Number.isInteger(value) ? 'INT' : 'DECIMAL(10,2)';
    if (typeof value === 'boolean') return 'BOOLEAN';
    if (typeof value === 'string') return value.length > 255 ? 'TEXT' : 'VARCHAR(255)';
    if (Array.isArray(value)) return 'JSON';
    if (typeof value === 'object') return 'JSON';
    return 'TEXT';
  }

  private sqlEscape(value: unknown): string {
    if (value === null || value === undefined) return 'NULL';
    if (typeof value === 'number') return String(value);
    if (typeof value === 'boolean') return value ? '1' : '0';
    if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
    return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
  }

  private parseCSV(raw: string): Record<string, unknown>[] {
    const lines = raw.split('\n').filter(l => l.trim() && !l.startsWith('#'));
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map(line => {
      const values = this.parseCSVLine(line);
      const record: Record<string, unknown> = {};
      headers.forEach((header, i) => {
        record[header] = values[i] || '';
      });
      return record;
    });
  }

  private parseCSVLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    return values;
  }
}

// =============================================================================
// Custom Error
// =============================================================================

export class DataValidationError extends Error {
  errors: ValidationError[];
  constructor(message: string, errors: ValidationError[]) {
    super(message);
    this.name = 'DataValidationError';
    this.errors = errors;
  }
}

// =============================================================================
// Types
// =============================================================================

export interface DataEvent {
  [key: string]: unknown;
}

export interface TransactionFrame {
  id: string;
  operations: Array<{ type: string; collectionName: string; recordId: string }>;
  snapshots: Map<string, DataRecord | null>;
  startedAt: number;
}

export interface CollectionStats {
  name: string;
  recordCount: number;
  totalSize: number;
  avgRecordSize: number;
  indexCount: number;
  oldestRecord: number;
  newestRecord: number;
  fieldCount: number;
  hookCount: number;
}

export interface GlobalStats {
  collections: number;
  totalRecords: number;
  totalSize: number;
  cacheStats: CacheStats;
  changeLogSize: number;
  currentVersion: number;
}

// =============================================================================
// Predefined Schemas
// =============================================================================

export const PREDEFINED_SCHEMAS: Record<string, DataSchema> = {
  users: {
    fields: [
      { name: 'email', type: 'string', required: true, unique: true, indexed: true, pattern: '^[^@]+@[^@]+\\.[^@]+$' },
      { name: 'username', type: 'string', required: true, unique: true, indexed: true, minLength: 3, maxLength: 30 },
      { name: 'displayName', type: 'string', required: false, maxLength: 100 },
      { name: 'avatar', type: 'file', required: false },
      { name: 'bio', type: 'string', required: false, maxLength: 500 },
      { name: 'role', type: 'enum', required: true, enumValues: ['admin', 'editor', 'viewer', 'guest'], defaultValue: 'viewer' },
      { name: 'isActive', type: 'boolean', required: false, defaultValue: true },
      { name: 'lastLogin', type: 'date', required: false },
      { name: 'preferences', type: 'object', required: false, defaultValue: {} },
      { name: 'tags', type: 'array', required: false, defaultValue: [] },
    ],
    required: ['email', 'username'],
    additionalProperties: false,
  },
  posts: {
    fields: [
      { name: 'title', type: 'string', required: true, minLength: 1, maxLength: 200, indexed: true },
      { name: 'slug', type: 'string', required: true, unique: true, indexed: true },
      { name: 'content', type: 'string', required: true },
      { name: 'excerpt', type: 'string', required: false, maxLength: 500 },
      { name: 'authorId', type: 'reference', required: true, refCollection: 'users', indexed: true },
      { name: 'status', type: 'enum', required: true, enumValues: ['draft', 'published', 'archived', 'scheduled'], defaultValue: 'draft' },
      { name: 'categories', type: 'array', required: false, defaultValue: [] },
      { name: 'tags', type: 'array', required: false, defaultValue: [] },
      { name: 'featuredImage', type: 'file', required: false },
      { name: 'publishedAt', type: 'date', required: false },
      { name: 'viewCount', type: 'number', required: false, defaultValue: 0, min: 0 },
      { name: 'likes', type: 'number', required: false, defaultValue: 0, min: 0 },
      { name: 'comments', type: 'array', required: false, defaultValue: [] },
      { name: 'seo', type: 'object', required: false },
    ],
    required: ['title', 'slug', 'content', 'authorId'],
    additionalProperties: false,
  },
  products: {
    fields: [
      { name: 'name', type: 'string', required: true, minLength: 1, maxLength: 200, indexed: true },
      { name: 'sku', type: 'string', required: true, unique: true, indexed: true },
      { name: 'description', type: 'string', required: false },
      { name: 'price', type: 'number', required: true, min: 0 },
      { name: 'compareAtPrice', type: 'number', required: false, min: 0 },
      { name: 'cost', type: 'number', required: false, min: 0 },
      { name: 'currency', type: 'string', required: false, defaultValue: 'USD' },
      { name: 'stock', type: 'number', required: true, min: 0, defaultValue: 0 },
      { name: 'category', type: 'string', required: false, indexed: true },
      { name: 'subcategory', type: 'string', required: false },
      { name: 'brand', type: 'string', required: false },
      { name: 'images', type: 'array', required: false, defaultValue: [] },
      { name: 'variants', type: 'array', required: false, defaultValue: [] },
      { name: 'attributes', type: 'object', required: false, defaultValue: {} },
      { name: 'weight', type: 'number', required: false },
      { name: 'dimensions', type: 'object', required: false },
      { name: 'isActive', type: 'boolean', required: false, defaultValue: true },
      { name: 'isFeatured', type: 'boolean', required: false, defaultValue: false },
      { name: 'rating', type: 'number', required: false, min: 0, max: 5 },
      { name: 'reviewCount', type: 'number', required: false, defaultValue: 0 },
    ],
    required: ['name', 'sku', 'price', 'stock'],
    additionalProperties: true,
  },
  orders: {
    fields: [
      { name: 'orderNumber', type: 'string', required: true, unique: true, indexed: true },
      { name: 'customerId', type: 'reference', required: true, refCollection: 'users', indexed: true },
      { name: 'items', type: 'array', required: true },
      { name: 'subtotal', type: 'number', required: true, min: 0 },
      { name: 'tax', type: 'number', required: false, min: 0, defaultValue: 0 },
      { name: 'shipping', type: 'number', required: false, min: 0, defaultValue: 0 },
      { name: 'discount', type: 'number', required: false, min: 0, defaultValue: 0 },
      { name: 'total', type: 'number', required: true, min: 0 },
      { name: 'currency', type: 'string', required: false, defaultValue: 'USD' },
      { name: 'status', type: 'enum', required: true, enumValues: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'], defaultValue: 'pending' },
      { name: 'paymentMethod', type: 'string', required: false },
      { name: 'paymentStatus', type: 'enum', required: false, enumValues: ['pending', 'paid', 'failed', 'refunded'] },
      { name: 'shippingAddress', type: 'object', required: false },
      { name: 'billingAddress', type: 'object', required: false },
      { name: 'notes', type: 'string', required: false },
      { name: 'trackingNumber', type: 'string', required: false },
    ],
    required: ['orderNumber', 'customerId', 'items', 'subtotal', 'total'],
    additionalProperties: true,
  },
  events: {
    fields: [
      { name: 'name', type: 'string', required: true, indexed: true },
      { name: 'type', type: 'enum', required: true, enumValues: ['click', 'view', 'purchase', 'signup', 'login', 'error', 'custom'] },
      { name: 'userId', type: 'reference', required: false, refCollection: 'users', indexed: true },
      { name: 'sessionId', type: 'string', required: false, indexed: true },
      { name: 'page', type: 'string', required: false },
      { name: 'properties', type: 'object', required: false, defaultValue: {} },
      { name: 'timestamp', type: 'date', required: true },
      { name: 'source', type: 'string', required: false },
      { name: 'device', type: 'object', required: false },
      { name: 'location', type: 'geo', required: false },
    ],
    required: ['name', 'type', 'timestamp'],
    additionalProperties: true,
  },
};

// =============================================================================
// Singleton Instance
// =============================================================================

export const dataStore = new DataStoreManager();
