// =============================================================================
// API Connector Service - REST/GraphQL API integration, request management,
// rate limiting, caching, retry logic, mock server, and API documentation
// =============================================================================

// =============================================================================
// Types & Interfaces
// =============================================================================

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export type ContentType = 'application/json' | 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain' | 'text/xml' | 'application/xml' | 'application/octet-stream';

export type AuthType = 'none' | 'basic' | 'bearer' | 'api-key' | 'oauth2' | 'digest' | 'custom';

export interface APIEndpoint {
  id: string;
  name: string;
  description: string;
  baseUrl: string;
  path: string;
  method: HttpMethod;
  headers: Record<string, string>;
  queryParams: QueryParam[];
  pathParams: PathParam[];
  body?: RequestBody;
  auth: AuthConfig;
  timeout: number;
  retryConfig: RetryConfig;
  cacheConfig: CacheConfig;
  rateLimit?: RateLimitConfig;
  validation?: ResponseValidation;
  transform?: ResponseTransform;
  mock?: MockConfig;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface QueryParam {
  key: string;
  value: string;
  description?: string;
  required: boolean;
  type: 'string' | 'number' | 'boolean' | 'array';
  enabled: boolean;
}

export interface PathParam {
  key: string;
  value: string;
  description?: string;
  required: boolean;
}

export interface RequestBody {
  contentType: ContentType;
  data: string | Record<string, unknown> | FormDataField[];
  schema?: JSONSchema;
}

export interface FormDataField {
  key: string;
  value: string;
  type: 'text' | 'file';
  filename?: string;
  contentType?: string;
}

export interface JSONSchema {
  type: string;
  properties?: Record<string, JSONSchema>;
  items?: JSONSchema;
  required?: string[];
  enum?: unknown[];
  description?: string;
  format?: string;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

export interface AuthConfig {
  type: AuthType;
  basic?: { username: string; password: string };
  bearer?: { token: string; prefix?: string };
  apiKey?: { key: string; value: string; location: 'header' | 'query' | 'cookie' };
  oauth2?: {
    grantType: 'authorization_code' | 'client_credentials' | 'password' | 'implicit';
    clientId: string;
    clientSecret?: string;
    tokenUrl: string;
    authUrl?: string;
    redirectUri?: string;
    scope?: string;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
  };
  custom?: { headers: Record<string, string> };
}

export interface RetryConfig {
  enabled: boolean;
  maxRetries: number;
  baseDelay: number;          // ms
  maxDelay: number;           // ms
  strategy: 'fixed' | 'exponential' | 'linear';
  retryOnStatus: number[];
  retryOnNetworkError: boolean;
}

export interface CacheConfig {
  enabled: boolean;
  ttl: number;               // ms
  strategy: 'memory' | 'localStorage' | 'sessionStorage';
  maxEntries: number;
  keyGenerator?: (url: string, options: RequestInit) => string;
  invalidateOn?: string[];   // Events that invalidate cache
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  strategy: 'sliding-window' | 'fixed-window' | 'token-bucket';
  queueExcess: boolean;
}

export interface ResponseValidation {
  schema?: JSONSchema;
  statusCodes: number[];
  contentType?: string;
  customValidator?: (response: APIResponse) => boolean;
}

export interface ResponseTransform {
  type: 'jmespath' | 'jsonpath' | 'custom';
  expression?: string;
  mapping?: Record<string, string>;
}

export interface MockConfig {
  enabled: boolean;
  statusCode: number;
  headers: Record<string, string>;
  body: unknown;
  delay: number;             // ms
  dynamic?: boolean;         // Generate dynamic data
}

// =============================================================================
// Response Types
// =============================================================================

export interface APIResponse<T = unknown> {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: T;
  duration: number;
  size: number;
  cached: boolean;
  retryCount: number;
  timestamp: number;
  url: string;
  method: HttpMethod;
}

export interface APIError {
  message: string;
  status?: number;
  code: string;
  details?: unknown;
  endpoint: string;
  timestamp: number;
  retryable: boolean;
}

export interface RequestLog {
  id: string;
  endpoint: string;
  method: HttpMethod;
  url: string;
  requestHeaders: Record<string, string>;
  requestBody?: unknown;
  responseStatus: number;
  responseHeaders: Record<string, string>;
  responseBody: unknown;
  duration: number;
  timestamp: number;
  cached: boolean;
  retryCount: number;
  error?: string;
}

// =============================================================================
// GraphQL Types
// =============================================================================

export interface GraphQLConfig {
  endpoint: string;
  headers: Record<string, string>;
  auth: AuthConfig;
}

export interface GraphQLQuery {
  id: string;
  name: string;
  query: string;
  variables?: Record<string, unknown>;
  operationName?: string;
}

export interface GraphQLIntrospection {
  types: GraphQLType[];
  queryType: string;
  mutationType?: string;
  subscriptionType?: string;
}

export interface GraphQLType {
  name: string;
  kind: 'OBJECT' | 'SCALAR' | 'ENUM' | 'INPUT_OBJECT' | 'INTERFACE' | 'UNION' | 'LIST' | 'NON_NULL';
  fields?: GraphQLField[];
  enumValues?: string[];
  interfaces?: string[];
  inputFields?: GraphQLField[];
  description?: string;
}

export interface GraphQLField {
  name: string;
  type: string;
  args?: Array<{ name: string; type: string; defaultValue?: string }>;
  description?: string;
  isDeprecated?: boolean;
  deprecationReason?: string;
}

// =============================================================================
// API Collection & Environment
// =============================================================================

export interface APICollection {
  id: string;
  name: string;
  description: string;
  endpoints: APIEndpoint[];
  environments: APIEnvironment[];
  activeEnvironment?: string;
  variables: Record<string, string>;
  auth?: AuthConfig;
  createdAt: number;
  updatedAt: number;
}

export interface APIEnvironment {
  id: string;
  name: string;
  variables: Record<string, string>;
  isActive: boolean;
}

// =============================================================================
// API Connector Class
// =============================================================================

export class APIConnector {
  private collections: Map<string, APICollection> = new Map();
  private endpoints: Map<string, APIEndpoint> = new Map();
  private requestLog: RequestLog[] = [];
  private cache: Map<string, { data: APIResponse; expiresAt: number }> = new Map();
  private rateLimitState: Map<string, { tokens: number; lastRefill: number; queue: Array<() => void> }> = new Map();
  private interceptors: {
    request: Array<(config: RequestConfig) => RequestConfig | Promise<RequestConfig>>;
    response: Array<(response: APIResponse) => APIResponse | Promise<APIResponse>>;
    error: Array<(error: APIError) => APIError | Promise<APIError>>;
  } = { request: [], response: [], error: [] };
  private listeners: Map<string, Array<(data: unknown) => void>> = new Map();
  private maxLogSize = 1000;

  // ---------------------------------------------------------------------------
  // Collection Management
  // ---------------------------------------------------------------------------

  createCollection(name: string, description: string = ''): APICollection {
    const collection: APICollection = {
      id: this.generateId(),
      name,
      description,
      endpoints: [],
      environments: [
        { id: this.generateId(), name: 'Development', variables: { BASE_URL: 'http://localhost:3000' }, isActive: true },
        { id: this.generateId(), name: 'Staging', variables: { BASE_URL: 'https://staging.api.example.com' }, isActive: false },
        { id: this.generateId(), name: 'Production', variables: { BASE_URL: 'https://api.example.com' }, isActive: false },
      ],
      variables: {},
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.collections.set(collection.id, collection);
    this.emit('collection:created', collection);
    return collection;
  }

  updateCollection(id: string, updates: Partial<APICollection>): APICollection | null {
    const collection = this.collections.get(id);
    if (!collection) return null;

    const updated = { ...collection, ...updates, updatedAt: Date.now() };
    this.collections.set(id, updated);
    this.emit('collection:updated', updated);
    return updated;
  }

  deleteCollection(id: string): boolean {
    const result = this.collections.delete(id);
    if (result) this.emit('collection:deleted', { id });
    return result;
  }

  getCollection(id: string): APICollection | undefined {
    return this.collections.get(id);
  }

  getAllCollections(): APICollection[] {
    return Array.from(this.collections.values());
  }

  // ---------------------------------------------------------------------------
  // Endpoint Management
  // ---------------------------------------------------------------------------

  createEndpoint(collectionId: string, config: Partial<APIEndpoint>): APIEndpoint {
    const endpoint: APIEndpoint = {
      id: config.id || this.generateId(),
      name: config.name || 'New Endpoint',
      description: config.description || '',
      baseUrl: config.baseUrl || '{{BASE_URL}}',
      path: config.path || '/',
      method: config.method || 'GET',
      headers: config.headers || { 'Content-Type': 'application/json' },
      queryParams: config.queryParams || [],
      pathParams: config.pathParams || [],
      body: config.body,
      auth: config.auth || { type: 'none' },
      timeout: config.timeout || 30000,
      retryConfig: config.retryConfig || {
        enabled: true,
        maxRetries: 3,
        baseDelay: 1000,
        maxDelay: 10000,
        strategy: 'exponential',
        retryOnStatus: [408, 429, 500, 502, 503, 504],
        retryOnNetworkError: true,
      },
      cacheConfig: config.cacheConfig || {
        enabled: false,
        ttl: 60000,
        strategy: 'memory',
        maxEntries: 100,
      },
      rateLimit: config.rateLimit,
      validation: config.validation,
      transform: config.transform,
      mock: config.mock,
      tags: config.tags || [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.endpoints.set(endpoint.id, endpoint);

    const collection = this.collections.get(collectionId);
    if (collection) {
      collection.endpoints.push(endpoint);
      collection.updatedAt = Date.now();
    }

    this.emit('endpoint:created', endpoint);
    return endpoint;
  }

  updateEndpoint(id: string, updates: Partial<APIEndpoint>): APIEndpoint | null {
    const endpoint = this.endpoints.get(id);
    if (!endpoint) return null;

    const updated = { ...endpoint, ...updates, updatedAt: Date.now() };
    this.endpoints.set(id, updated);
    this.emit('endpoint:updated', updated);
    return updated;
  }

  deleteEndpoint(id: string): boolean {
    const result = this.endpoints.delete(id);
    if (result) {
      for (const collection of this.collections.values()) {
        collection.endpoints = collection.endpoints.filter(e => e.id !== id);
      }
      this.emit('endpoint:deleted', { id });
    }
    return result;
  }

  duplicateEndpoint(id: string): APIEndpoint | null {
    const endpoint = this.endpoints.get(id);
    if (!endpoint) return null;

    const duplicate: APIEndpoint = {
      ...JSON.parse(JSON.stringify(endpoint)),
      id: this.generateId(),
      name: `${endpoint.name} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.endpoints.set(duplicate.id, duplicate);
    return duplicate;
  }

  // ---------------------------------------------------------------------------
  // Request Execution
  // ---------------------------------------------------------------------------

  async executeRequest(endpointId: string, overrides?: Partial<APIEndpoint>): Promise<APIResponse> {
    const endpoint = this.endpoints.get(endpointId);
    if (!endpoint) {
      throw this.createError('Endpoint not found', 'ENDPOINT_NOT_FOUND', endpointId);
    }

    const config = { ...endpoint, ...overrides };

    // Check for mock
    if (config.mock?.enabled) {
      return this.executeMock(config);
    }

    // Check rate limit
    if (config.rateLimit) {
      await this.checkRateLimit(endpointId, config.rateLimit);
    }

    // Check cache
    const cacheKey = this.getCacheKey(config);
    if (config.cacheConfig.enabled && config.method === 'GET') {
      const cached = this.getFromCache(cacheKey);
      if (cached) return { ...cached, cached: true };
    }

    // Build request
    let requestConfig = this.buildRequestConfig(config);

    // Run request interceptors
    for (const interceptor of this.interceptors.request) {
      requestConfig = await interceptor(requestConfig);
    }

    // Execute with retry
    let lastError: APIError | null = null;
    let retryCount = 0;
    const maxRetries = config.retryConfig.enabled ? config.retryConfig.maxRetries : 0;

    while (retryCount <= maxRetries) {
      try {
        const startTime = performance.now();
        const response = await this.performFetch(requestConfig, config.timeout);
        const duration = performance.now() - startTime;

        let apiResponse: APIResponse = {
          status: response.status,
          statusText: response.statusText,
          headers: this.headersToRecord(response.headers),
          data: await this.parseResponseBody(response),
          duration,
          size: parseInt(response.headers.get('content-length') || '0') || 0,
          cached: false,
          retryCount,
          timestamp: Date.now(),
          url: requestConfig.url,
          method: config.method,
        };

        // Validate response
        if (config.validation) {
          this.validateResponse(apiResponse, config.validation);
        }

        // Run response interceptors
        for (const interceptor of this.interceptors.response) {
          apiResponse = await interceptor(apiResponse);
        }

        // Cache successful GET responses
        if (config.cacheConfig.enabled && config.method === 'GET' && apiResponse.status >= 200 && apiResponse.status < 300) {
          this.setCache(cacheKey, apiResponse, config.cacheConfig.ttl);
        }

        // Log request
        this.logRequest(config, requestConfig, apiResponse, retryCount);

        this.emit('request:success', { endpoint: endpointId, response: apiResponse });
        return apiResponse;

      } catch (error) {
        lastError = this.createError(
          error instanceof Error ? error.message : 'Request failed',
          'REQUEST_FAILED',
          endpointId,
          undefined,
          config.retryConfig.retryOnStatus ? true : false
        );

        if (retryCount < maxRetries) {
          const delay = this.calculateRetryDelay(retryCount, config.retryConfig);
          await this.sleep(delay);
          retryCount++;
          this.emit('request:retry', { endpoint: endpointId, attempt: retryCount, delay });
        } else {
          break;
        }
      }
    }

    // Run error interceptors
    if (lastError) {
      for (const interceptor of this.interceptors.error) {
        lastError = await interceptor(lastError);
      }
    }

    this.emit('request:error', { endpoint: endpointId, error: lastError });
    throw lastError;
  }

  async executeBatch(endpointIds: string[], options?: { parallel?: boolean; stopOnError?: boolean }): Promise<{
    results: Array<{ endpointId: string; response?: APIResponse; error?: APIError }>;
    duration: number;
    successCount: number;
    errorCount: number;
  }> {
    const startTime = performance.now();
    const results: Array<{ endpointId: string; response?: APIResponse; error?: APIError }> = [];
    const parallel = options?.parallel ?? false;
    const stopOnError = options?.stopOnError ?? false;

    if (parallel) {
      const promises = endpointIds.map(async (id) => {
        try {
          const response = await this.executeRequest(id);
          return { endpointId: id, response };
        } catch (error) {
          return { endpointId: id, error: error as APIError };
        }
      });

      results.push(...await Promise.all(promises));
    } else {
      for (const id of endpointIds) {
        try {
          const response = await this.executeRequest(id);
          results.push({ endpointId: id, response });
        } catch (error) {
          results.push({ endpointId: id, error: error as APIError });
          if (stopOnError) break;
        }
      }
    }

    return {
      results,
      duration: performance.now() - startTime,
      successCount: results.filter(r => r.response).length,
      errorCount: results.filter(r => r.error).length,
    };
  }

  // ---------------------------------------------------------------------------
  // GraphQL
  // ---------------------------------------------------------------------------

  async executeGraphQL(config: GraphQLConfig, query: GraphQLQuery): Promise<APIResponse> {
    const endpoint = this.createEndpoint('__graphql', {
      name: query.name,
      baseUrl: config.endpoint,
      path: '',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...config.headers },
      auth: config.auth,
      body: {
        contentType: 'application/json',
        data: {
          query: query.query,
          variables: query.variables || {},
          operationName: query.operationName,
        },
      },
    });

    return this.executeRequest(endpoint.id);
  }

  async introspectSchema(config: GraphQLConfig): Promise<GraphQLIntrospection> {
    const introspectionQuery = `
      query IntrospectionQuery {
        __schema {
          queryType { name }
          mutationType { name }
          subscriptionType { name }
          types {
            name
            kind
            description
            fields(includeDeprecated: true) {
              name
              description
              isDeprecated
              deprecationReason
              args {
                name
                type { name kind ofType { name kind } }
                defaultValue
              }
              type { name kind ofType { name kind ofType { name kind } } }
            }
            enumValues(includeDeprecated: true) { name }
            inputFields {
              name
              type { name kind ofType { name kind } }
            }
            interfaces { name }
          }
        }
      }
    `;

    const response = await this.executeGraphQL(config, {
      id: '__introspection',
      name: 'Introspection',
      query: introspectionQuery,
    });

    const schema = (response.data as Record<string, unknown>)?.data as Record<string, unknown>;
    const schemaData = (schema?.__schema || schema) as Record<string, unknown>;

    return {
      types: ((schemaData?.types || []) as GraphQLType[]).map(t => ({
        name: t.name,
        kind: t.kind,
        fields: t.fields,
        enumValues: t.enumValues,
        interfaces: t.interfaces,
        inputFields: t.inputFields,
        description: t.description,
      })),
      queryType: (schemaData?.queryType as Record<string, string>)?.name || 'Query',
      mutationType: (schemaData?.mutationType as Record<string, string>)?.name,
      subscriptionType: (schemaData?.subscriptionType as Record<string, string>)?.name,
    };
  }

  // ---------------------------------------------------------------------------
  // Mock Server
  // ---------------------------------------------------------------------------

  private async executeMock(config: APIEndpoint): Promise<APIResponse> {
    const mock = config.mock!;

    // Simulate network delay
    if (mock.delay > 0) {
      await this.sleep(mock.delay);
    }

    let body = mock.body;

    // Generate dynamic mock data
    if (mock.dynamic) {
      body = this.generateMockData(config.path);
    }

    return {
      status: mock.statusCode,
      statusText: this.getStatusText(mock.statusCode),
      headers: mock.headers,
      data: body,
      duration: mock.delay,
      size: JSON.stringify(body).length,
      cached: false,
      retryCount: 0,
      timestamp: Date.now(),
      url: `${config.baseUrl}${config.path}`,
      method: config.method,
    };
  }

  private generateMockData(path: string): unknown {
    const faker = new MockDataGenerator();

    if (path.includes('users')) {
      return {
        data: Array.from({ length: 10 }, (_, i) => ({
          id: i + 1,
          name: faker.name(),
          email: faker.email(),
          avatar: faker.avatar(),
          role: faker.pick(['admin', 'user', 'editor', 'viewer']),
          createdAt: faker.date(),
          isActive: faker.boolean(),
        })),
        total: 100,
        page: 1,
        pageSize: 10,
      };
    }

    if (path.includes('products')) {
      return {
        data: Array.from({ length: 10 }, (_, i) => ({
          id: i + 1,
          name: faker.product(),
          price: faker.number(10, 1000),
          category: faker.pick(['Electronics', 'Clothing', 'Books', 'Home', 'Sports']),
          stock: faker.number(0, 500),
          rating: faker.number(1, 5),
          image: faker.image(),
        })),
      };
    }

    return {
      status: 'ok',
      data: { id: faker.number(1, 10000), timestamp: Date.now() },
    };
  }

  // ---------------------------------------------------------------------------
  // Interceptors
  // ---------------------------------------------------------------------------

  addRequestInterceptor(fn: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>): () => void {
    this.interceptors.request.push(fn);
    return () => {
      const idx = this.interceptors.request.indexOf(fn);
      if (idx >= 0) this.interceptors.request.splice(idx, 1);
    };
  }

  addResponseInterceptor(fn: (response: APIResponse) => APIResponse | Promise<APIResponse>): () => void {
    this.interceptors.response.push(fn);
    return () => {
      const idx = this.interceptors.response.indexOf(fn);
      if (idx >= 0) this.interceptors.response.splice(idx, 1);
    };
  }

  addErrorInterceptor(fn: (error: APIError) => APIError | Promise<APIError>): () => void {
    this.interceptors.error.push(fn);
    return () => {
      const idx = this.interceptors.error.indexOf(fn);
      if (idx >= 0) this.interceptors.error.splice(idx, 1);
    };
  }

  // ---------------------------------------------------------------------------
  // Cache Management
  // ---------------------------------------------------------------------------

  private getCacheKey(config: APIEndpoint): string {
    const url = `${config.baseUrl}${config.path}`;
    const params = config.queryParams.filter(p => p.enabled).map(p => `${p.key}=${p.value}`).join('&');
    return `${config.method}:${url}${params ? '?' + params : ''}`;
  }

  private getFromCache(key: string): APIResponse | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  private setCache(key: string, data: APIResponse, ttl: number): void {
    this.cache.set(key, { data, expiresAt: Date.now() + ttl });
  }

  clearCache(pattern?: string): number {
    if (!pattern) {
      const count = this.cache.size;
      this.cache.clear();
      return count;
    }

    let cleared = 0;
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        cleared++;
      }
    }
    return cleared;
  }

  getCacheStats(): { size: number; entries: number; hitRate: number } {
    return {
      size: Array.from(this.cache.values()).reduce((acc, v) => acc + JSON.stringify(v.data).length, 0),
      entries: this.cache.size,
      hitRate: 0, // Would track hits/misses in production
    };
  }

  // ---------------------------------------------------------------------------
  // Rate Limiting
  // ---------------------------------------------------------------------------

  private async checkRateLimit(endpointId: string, config: RateLimitConfig): Promise<void> {
    let state = this.rateLimitState.get(endpointId);

    if (!state) {
      state = { tokens: config.maxRequests, lastRefill: Date.now(), queue: [] };
      this.rateLimitState.set(endpointId, state);
    }

    // Refill tokens
    const now = Date.now();
    const elapsed = now - state.lastRefill;
    const refillCount = Math.floor(elapsed / config.windowMs) * config.maxRequests;
    state.tokens = Math.min(config.maxRequests, state.tokens + refillCount);
    state.lastRefill = now;

    if (state.tokens > 0) {
      state.tokens--;
      return;
    }

    if (config.queueExcess) {
      return new Promise<void>((resolve) => {
        state!.queue.push(resolve);
        setTimeout(() => {
          const idx = state!.queue.indexOf(resolve);
          if (idx >= 0) {
            state!.queue.splice(idx, 1);
            resolve();
          }
        }, config.windowMs);
      });
    }

    throw this.createError('Rate limit exceeded', 'RATE_LIMIT', endpointId, 429, true);
  }

  // ---------------------------------------------------------------------------
  // Request Building
  // ---------------------------------------------------------------------------

  private buildRequestConfig(endpoint: APIEndpoint): RequestConfig {
    let url = this.resolveVariables(`${endpoint.baseUrl}${endpoint.path}`);

    // Replace path params
    for (const param of endpoint.pathParams) {
      url = url.replace(`:${param.key}`, encodeURIComponent(param.value));
      url = url.replace(`{${param.key}}`, encodeURIComponent(param.value));
    }

    // Add query params
    const queryParams = endpoint.queryParams.filter(p => p.enabled);
    if (queryParams.length > 0) {
      const params = new URLSearchParams();
      for (const p of queryParams) {
        params.append(p.key, this.resolveVariables(p.value));
      }
      url += `?${params.toString()}`;
    }

    // Build headers
    const headers: Record<string, string> = { ...endpoint.headers };
    this.applyAuth(headers, endpoint.auth, url);

    // Build body
    let body: string | undefined;
    if (endpoint.body && endpoint.method !== 'GET' && endpoint.method !== 'HEAD') {
      if (typeof endpoint.body.data === 'string') {
        body = endpoint.body.data;
      } else if (Array.isArray(endpoint.body.data)) {
        // FormData fields - serialize as JSON for simplicity
        const formData: Record<string, string> = {};
        for (const field of endpoint.body.data) {
          formData[field.key] = field.value;
        }
        body = JSON.stringify(formData);
      } else {
        body = JSON.stringify(endpoint.body.data);
      }
    }

    return { url, method: endpoint.method, headers, body };
  }

  private applyAuth(headers: Record<string, string>, auth: AuthConfig, _url: string): void {
    switch (auth.type) {
      case 'basic':
        if (auth.basic) {
          const encoded = btoa(`${auth.basic.username}:${auth.basic.password}`);
          headers['Authorization'] = `Basic ${encoded}`;
        }
        break;
      case 'bearer':
        if (auth.bearer) {
          const prefix = auth.bearer.prefix || 'Bearer';
          headers['Authorization'] = `${prefix} ${auth.bearer.token}`;
        }
        break;
      case 'api-key':
        if (auth.apiKey && auth.apiKey.location === 'header') {
          headers[auth.apiKey.key] = auth.apiKey.value;
        }
        break;
      case 'oauth2':
        if (auth.oauth2?.accessToken) {
          headers['Authorization'] = `Bearer ${auth.oauth2.accessToken}`;
        }
        break;
      case 'custom':
        if (auth.custom) {
          Object.assign(headers, auth.custom.headers);
        }
        break;
    }
  }

  // ---------------------------------------------------------------------------
  // Request Execution Helpers
  // ---------------------------------------------------------------------------

  private async performFetch(config: RequestConfig, timeout: number): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(config.url, {
        method: config.method,
        headers: config.headers,
        body: config.body,
        signal: controller.signal,
      });

      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async parseResponseBody(response: Response): Promise<unknown> {
    const contentType = response.headers.get('content-type') || '';

    try {
      if (contentType.includes('application/json')) {
        return await response.json();
      } else if (contentType.includes('text/')) {
        return await response.text();
      } else if (contentType.includes('application/xml') || contentType.includes('text/xml')) {
        return await response.text();
      } else {
        return await response.text();
      }
    } catch {
      return null;
    }
  }

  private headersToRecord(headers: Headers): Record<string, string> {
    const record: Record<string, string> = {};
    headers.forEach((value, key) => {
      record[key] = value;
    });
    return record;
  }

  private validateResponse(response: APIResponse, validation: ResponseValidation): void {
    if (validation.statusCodes.length > 0 && !validation.statusCodes.includes(response.status)) {
      throw this.createError(
        `Unexpected status code: ${response.status}`,
        'VALIDATION_FAILED',
        response.url,
        response.status
      );
    }

    if (validation.customValidator && !validation.customValidator(response)) {
      throw this.createError('Custom validation failed', 'VALIDATION_FAILED', response.url);
    }
  }

  // ---------------------------------------------------------------------------
  // Retry Logic
  // ---------------------------------------------------------------------------

  private calculateRetryDelay(attempt: number, config: RetryConfig): number {
    let delay: number;

    switch (config.strategy) {
      case 'fixed':
        delay = config.baseDelay;
        break;
      case 'linear':
        delay = config.baseDelay * (attempt + 1);
        break;
      case 'exponential':
        delay = config.baseDelay * Math.pow(2, attempt);
        break;
      default:
        delay = config.baseDelay;
    }

    // Add jitter
    delay += Math.random() * delay * 0.1;
    return Math.min(delay, config.maxDelay);
  }

  // ---------------------------------------------------------------------------
  // Request Logging
  // ---------------------------------------------------------------------------

  private logRequest(endpoint: APIEndpoint, request: RequestConfig, response: APIResponse, retryCount: number): void {
    const log: RequestLog = {
      id: this.generateId(),
      endpoint: endpoint.id,
      method: endpoint.method,
      url: request.url,
      requestHeaders: request.headers,
      requestBody: request.body ? JSON.parse(request.body) : undefined,
      responseStatus: response.status,
      responseHeaders: response.headers,
      responseBody: response.data,
      duration: response.duration,
      timestamp: Date.now(),
      cached: response.cached,
      retryCount,
    };

    this.requestLog.push(log);
    if (this.requestLog.length > this.maxLogSize) {
      this.requestLog = this.requestLog.slice(-this.maxLogSize);
    }

    this.emit('request:logged', log);
  }

  getRequestLog(filters?: { endpoint?: string; method?: HttpMethod; status?: number; limit?: number }): RequestLog[] {
    let logs = [...this.requestLog];

    if (filters?.endpoint) logs = logs.filter(l => l.endpoint === filters.endpoint);
    if (filters?.method) logs = logs.filter(l => l.method === filters.method);
    if (filters?.status) logs = logs.filter(l => l.responseStatus === filters.status);

    return logs.slice(-(filters?.limit || 100));
  }

  clearRequestLog(): void {
    this.requestLog = [];
    this.emit('log:cleared', {});
  }

  // ---------------------------------------------------------------------------
  // API Documentation Generation
  // ---------------------------------------------------------------------------

  generateOpenAPISpec(collection: APICollection): Record<string, unknown> {
    const paths: Record<string, Record<string, unknown>> = {};

    for (const endpoint of collection.endpoints) {
      const pathKey = endpoint.path;
      if (!paths[pathKey]) paths[pathKey] = {};

      const method = endpoint.method.toLowerCase();
      const parameters: unknown[] = [];

      for (const qp of endpoint.queryParams) {
        parameters.push({
          name: qp.key,
          in: 'query',
          required: qp.required,
          description: qp.description,
          schema: { type: qp.type },
        });
      }

      for (const pp of endpoint.pathParams) {
        parameters.push({
          name: pp.key,
          in: 'path',
          required: true,
          description: pp.description,
          schema: { type: 'string' },
        });
      }

      const operation: Record<string, unknown> = {
        summary: endpoint.name,
        description: endpoint.description,
        tags: endpoint.tags,
        parameters,
      };

      if (endpoint.body && endpoint.method !== 'GET') {
        operation.requestBody = {
          content: {
            [endpoint.body.contentType]: {
              schema: endpoint.body.schema || {},
            },
          },
        };
      }

      operation.responses = {
        '200': { description: 'Successful response' },
        '400': { description: 'Bad request' },
        '401': { description: 'Unauthorized' },
        '404': { description: 'Not found' },
        '500': { description: 'Internal server error' },
      };

      paths[pathKey][method] = operation;
    }

    return {
      openapi: '3.0.3',
      info: {
        title: collection.name,
        description: collection.description,
        version: '1.0.0',
      },
      paths,
      components: {
        securitySchemes: {
          bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
          apiKey: { type: 'apiKey', in: 'header', name: 'X-API-Key' },
        },
      },
    };
  }

  generateCurlCommand(endpoint: APIEndpoint): string {
    const url = `${endpoint.baseUrl}${endpoint.path}`;
    let curl = `curl -X ${endpoint.method} "${url}"`;

    for (const [key, value] of Object.entries(endpoint.headers)) {
      curl += ` \\\n  -H "${key}: ${value}"`;
    }

    if (endpoint.auth.type === 'bearer' && endpoint.auth.bearer) {
      curl += ` \\\n  -H "Authorization: Bearer ${endpoint.auth.bearer.token}"`;
    }

    if (endpoint.body && endpoint.method !== 'GET') {
      const bodyStr = typeof endpoint.body.data === 'string' ? endpoint.body.data : JSON.stringify(endpoint.body.data, null, 2);
      curl += ` \\\n  -d '${bodyStr}'`;
    }

    return curl;
  }

  generateFetchCode(endpoint: APIEndpoint): string {
    const url = `${endpoint.baseUrl}${endpoint.path}`;
    const hasBody = endpoint.body && endpoint.method !== 'GET';

    let code = `const response = await fetch('${url}', {\n`;
    code += `  method: '${endpoint.method}',\n`;
    code += `  headers: ${JSON.stringify(endpoint.headers, null, 4).replace(/\n/g, '\n  ')},\n`;

    if (hasBody) {
      const bodyStr = typeof endpoint.body!.data === 'string' ? endpoint.body!.data : JSON.stringify(endpoint.body!.data, null, 4);
      code += `  body: JSON.stringify(${bodyStr.replace(/\n/g, '\n  ')}),\n`;
    }

    code += `});\n\n`;
    code += `const data = await response.json();\n`;
    code += `console.log(data);`;

    return code;
  }

  generateAxiosCode(endpoint: APIEndpoint): string {
    const url = `${endpoint.baseUrl}${endpoint.path}`;

    let code = `import axios from 'axios';\n\n`;
    code += `const response = await axios({\n`;
    code += `  method: '${endpoint.method.toLowerCase()}',\n`;
    code += `  url: '${url}',\n`;
    code += `  headers: ${JSON.stringify(endpoint.headers, null, 4).replace(/\n/g, '\n  ')},\n`;

    if (endpoint.body && endpoint.method !== 'GET') {
      code += `  data: ${JSON.stringify(endpoint.body.data, null, 4).replace(/\n/g, '\n  ')},\n`;
    }

    code += `  timeout: ${endpoint.timeout},\n`;
    code += `});\n\n`;
    code += `console.log(response.data);`;

    return code;
  }

  // ---------------------------------------------------------------------------
  // Variable Resolution
  // ---------------------------------------------------------------------------

  private resolveVariables(str: string): string {
    return str.replace(/\{\{(\w+)\}\}/g, (_, varName) => {
      // Check all collections for variables and active environments
      for (const collection of this.collections.values()) {
        if (collection.variables[varName]) return collection.variables[varName];

        const activeEnv = collection.environments.find(e => e.isActive);
        if (activeEnv?.variables[varName]) return activeEnv.variables[varName];
      }
      return `{{${varName}}}`;
    });
  }

  // ---------------------------------------------------------------------------
  // Utility Methods
  // ---------------------------------------------------------------------------

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private createError(message: string, code: string, endpoint: string, status?: number, retryable: boolean = false): APIError {
    return { message, code, status, endpoint, timestamp: Date.now(), retryable };
  }

  private getStatusText(status: number): string {
    const statusTexts: Record<number, string> = {
      200: 'OK', 201: 'Created', 204: 'No Content',
      301: 'Moved Permanently', 302: 'Found', 304: 'Not Modified',
      400: 'Bad Request', 401: 'Unauthorized', 403: 'Forbidden',
      404: 'Not Found', 405: 'Method Not Allowed', 408: 'Request Timeout',
      409: 'Conflict', 422: 'Unprocessable Entity', 429: 'Too Many Requests',
      500: 'Internal Server Error', 502: 'Bad Gateway',
      503: 'Service Unavailable', 504: 'Gateway Timeout',
    };
    return statusTexts[status] || 'Unknown';
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
// Mock Data Generator
// =============================================================================

export class MockDataGenerator {
  private firstNames = ['James', 'Emily', 'Michael', 'Sarah', 'David', 'Jessica', 'Robert', 'Lisa', 'William', 'Maria', 'John', 'Anna', 'Thomas', 'Jennifer', 'Charles', 'Patricia', 'Daniel', 'Elizabeth', 'Andrew', 'Linda'];
  private lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
  private domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'proton.me', 'icloud.com', 'hotmail.com', 'company.com', 'example.org'];
  private products = ['Widget Pro', 'Gadget Plus', 'Tech Starter Kit', 'Digital Organizer', 'Smart Hub', 'Power Station', 'Cloud Storage Box', 'Wireless Charger', 'Bluetooth Speaker', 'Smart Watch'];

  name(): string {
    return `${this.pick(this.firstNames)} ${this.pick(this.lastNames)}`;
  }

  email(): string {
    return `${this.pick(this.firstNames).toLowerCase()}.${this.pick(this.lastNames).toLowerCase()}@${this.pick(this.domains)}`;
  }

  avatar(): string {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random().toString(36).substr(2, 8)}`;
  }

  image(): string {
    return `https://picsum.photos/seed/${Math.random().toString(36).substr(2, 8)}/400/300`;
  }

  product(): string {
    return this.pick(this.products);
  }

  number(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  boolean(): boolean {
    return Math.random() > 0.5;
  }

  date(): string {
    const d = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
    return d.toISOString();
  }

  uuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  paragraph(): string {
    const sentences = [
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
      'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.',
      'Excepteur sint occaecat cupidatat non proident.',
    ];
    const count = this.number(2, 5);
    return Array.from({ length: count }, () => this.pick(sentences)).join(' ');
  }

  pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)] as T;
  }
}

// =============================================================================
// Request Config Type
// =============================================================================

export interface RequestConfig {
  url: string;
  method: HttpMethod;
  headers: Record<string, string>;
  body?: string;
}

// =============================================================================
// Pre-built API Templates
// =============================================================================

export const API_TEMPLATES: Record<string, Partial<APIEndpoint>[]> = {
  restCrud: [
    { name: 'List Items', method: 'GET', path: '/api/items', queryParams: [
      { key: 'page', value: '1', required: false, type: 'number', enabled: true },
      { key: 'limit', value: '20', required: false, type: 'number', enabled: true },
      { key: 'sort', value: 'createdAt', required: false, type: 'string', enabled: false },
      { key: 'order', value: 'desc', required: false, type: 'string', enabled: false },
      { key: 'search', value: '', required: false, type: 'string', enabled: false },
    ]},
    { name: 'Get Item', method: 'GET', path: '/api/items/:id', pathParams: [
      { key: 'id', value: '1', required: true },
    ]},
    { name: 'Create Item', method: 'POST', path: '/api/items', body: {
      contentType: 'application/json',
      data: { name: '', description: '', status: 'active' },
    }},
    { name: 'Update Item', method: 'PUT', path: '/api/items/:id', pathParams: [
      { key: 'id', value: '1', required: true },
    ], body: {
      contentType: 'application/json',
      data: { name: '', description: '', status: 'active' },
    }},
    { name: 'Delete Item', method: 'DELETE', path: '/api/items/:id', pathParams: [
      { key: 'id', value: '1', required: true },
    ]},
  ],
  auth: [
    { name: 'Login', method: 'POST', path: '/api/auth/login', body: {
      contentType: 'application/json',
      data: { email: '', password: '' },
    }},
    { name: 'Register', method: 'POST', path: '/api/auth/register', body: {
      contentType: 'application/json',
      data: { name: '', email: '', password: '', confirmPassword: '' },
    }},
    { name: 'Refresh Token', method: 'POST', path: '/api/auth/refresh', body: {
      contentType: 'application/json',
      data: { refreshToken: '' },
    }},
    { name: 'Logout', method: 'POST', path: '/api/auth/logout' },
    { name: 'Forgot Password', method: 'POST', path: '/api/auth/forgot-password', body: {
      contentType: 'application/json',
      data: { email: '' },
    }},
  ],
  upload: [
    { name: 'Upload File', method: 'POST', path: '/api/upload', headers: { 'Content-Type': 'multipart/form-data' }, body: {
      contentType: 'multipart/form-data',
      data: [{ key: 'file', value: '', type: 'file' }],
    }},
    { name: 'Get File', method: 'GET', path: '/api/files/:id', pathParams: [
      { key: 'id', value: '', required: true },
    ]},
    { name: 'Delete File', method: 'DELETE', path: '/api/files/:id', pathParams: [
      { key: 'id', value: '', required: true },
    ]},
  ],
};

// =============================================================================
// Singleton Instance
// =============================================================================

export const apiConnector = new APIConnector();
