// =============================================================================
// Search Service - Full-text search, fuzzy matching, indexing,
// filters, facets, highlighting, and autocomplete
// =============================================================================

// =============================================================================
// Types
// =============================================================================

export interface SearchConfig {
  caseSensitive?: boolean;
  fuzzy?: boolean;
  fuzzyThreshold?: number;
  maxResults?: number;
  highlightTag?: string;
  fields?: string[];
  weights?: Record<string, number>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  minScore?: number;
}

export interface SearchResult<T = unknown> {
  item: T;
  score: number;
  matches: SearchMatch[];
  highlights: Record<string, string>;
}

export interface SearchMatch {
  field: string;
  value: string;
  indices: [number, number][];
  score: number;
}

export interface SearchIndex<T = unknown> {
  id: string;
  items: T[];
  fields: string[];
  tokens: Map<string, Set<number>>;
  trigrams: Map<string, Set<number>>;
  fieldValues: Map<string, Map<number, string>>;
  stats: SearchIndexStats;
}

export interface SearchIndexStats {
  totalItems: number;
  totalTokens: number;
  indexSize: number;
  buildTime: number;
  lastUpdated: number;
}

export interface SearchFilter {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith' | 'in' | 'between' | 'regex';
  value: unknown;
}

export interface SearchFacet {
  field: string;
  values: Map<string, number>;
  min?: number;
  max?: number;
  avg?: number;
}

export interface SearchSuggestion {
  text: string;
  score: number;
  type: 'completion' | 'correction' | 'recent' | 'popular';
}

// =============================================================================
// String Similarity Algorithms
// =============================================================================

export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

export function jaroWinklerSimilarity(s1: string, s2: string): number {
  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;

  const matchDistance = Math.floor(Math.max(s1.length, s2.length) / 2) - 1;
  const s1Matches = new Array(s1.length).fill(false);
  const s2Matches = new Array(s2.length).fill(false);

  let matches = 0;
  let transpositions = 0;

  for (let i = 0; i < s1.length; i++) {
    const start = Math.max(0, i - matchDistance);
    const end = Math.min(i + matchDistance + 1, s2.length);

    for (let j = start; j < end; j++) {
      if (s2Matches[j] || s1[i] !== s2[j]) continue;
      s1Matches[i] = true;
      s2Matches[j] = true;
      matches++;
      break;
    }
  }

  if (matches === 0) return 0;

  let k = 0;
  for (let i = 0; i < s1.length; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[k]) k++;
    if (s1[i] !== s2[k]) transpositions++;
    k++;
  }

  const jaro = (matches / s1.length + matches / s2.length + (matches - transpositions / 2) / matches) / 3;

  // Winkler modification
  let prefix = 0;
  for (let i = 0; i < Math.min(4, Math.min(s1.length, s2.length)); i++) {
    if (s1[i] === s2[i]) prefix++;
    else break;
  }

  return jaro + prefix * 0.1 * (1 - jaro);
}

export function nGrams(str: string, n: number = 3): string[] {
  const padded = ' '.repeat(n - 1) + str.toLowerCase() + ' '.repeat(n - 1);
  const grams: string[] = [];
  for (let i = 0; i <= padded.length - n; i++) {
    grams.push(padded.slice(i, i + n));
  }
  return grams;
}

export function nGramSimilarity(a: string, b: string, n: number = 3): number {
  const aGrams = new Set(nGrams(a, n));
  const bGrams = new Set(nGrams(b, n));

  let intersection = 0;
  aGrams.forEach(gram => { if (bGrams.has(gram)) intersection++; });

  const union = aGrams.size + bGrams.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

// =============================================================================
// Tokenizer
// =============================================================================

export interface TokenizerConfig {
  lowercase?: boolean;
  removeStopWords?: boolean;
  stemming?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
}

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were',
  'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
  'will', 'would', 'could', 'should', 'may', 'might', 'shall',
  'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from',
  'it', 'its', 'this', 'that', 'these', 'those', 'he', 'she',
  'they', 'them', 'we', 'us', 'i', 'me', 'my', 'your', 'his',
  'her', 'our', 'their', 'if', 'then', 'else', 'when', 'up',
  'so', 'no', 'not', 'only', 'very', 'can', 'just', 'about',
]);

export function tokenize(text: string, config?: TokenizerConfig): string[] {
  const pattern = config?.pattern ?? /[\w]+/g;
  const minLength = config?.minLength ?? 1;
  const maxLength = config?.maxLength ?? 100;

  let tokens: string[] = Array.from(text.match(pattern) ?? []);

  if (config?.lowercase !== false) {
    tokens = tokens.map(t => t.toLowerCase());
  }

  if (config?.removeStopWords) {
    tokens = tokens.filter(t => !STOP_WORDS.has(t));
  }

  tokens = tokens.filter(t => t.length >= minLength && t.length <= maxLength);

  if (config?.stemming) {
    tokens = tokens.map(simpleStem);
  }

  return tokens;
}

// Basic Porter stemmer (simplified)
function simpleStem(word: string): string {
  if (word.length <= 3) return word;

  // Step 1: Common suffix removal
  const suffixes: [string, string][] = [
    ['ational', 'ate'], ['tional', 'tion'], ['enci', 'ence'],
    ['anci', 'ance'], ['izer', 'ize'], ['alli', 'al'],
    ['entli', 'ent'], ['eli', 'e'], ['ousli', 'ous'],
    ['ization', 'ize'], ['ation', 'ate'], ['ator', 'ate'],
    ['alism', 'al'], ['iveness', 'ive'], ['fulness', 'ful'],
    ['ousness', 'ous'], ['aliti', 'al'], ['iviti', 'ive'],
    ['biliti', 'ble'], ['ness', ''], ['ment', ''],
    ['ing', ''], ['tion', 't'], ['sion', 's'],
    ['ed', ''], ['es', ''], ['ly', ''], ['er', ''],
    ['s', ''],
  ];

  for (const [suffix, replacement] of suffixes) {
    if (word.endsWith(suffix) && word.length - suffix.length >= 3) {
      return word.slice(0, -suffix.length) + replacement;
    }
  }

  return word;
}

// =============================================================================
// Search Engine
// =============================================================================

export class SearchEngine<T extends Record<string, unknown> = Record<string, unknown>> {
  private index: SearchIndex<T>;
  private config: Required<SearchConfig>;
  private recentSearches: string[] = [];
  private popularSearches: Map<string, number> = new Map();

  constructor(config?: SearchConfig) {
    this.config = {
      caseSensitive: config?.caseSensitive ?? false,
      fuzzy: config?.fuzzy ?? true,
      fuzzyThreshold: config?.fuzzyThreshold ?? 0.3,
      maxResults: config?.maxResults ?? 50,
      highlightTag: config?.highlightTag ?? 'mark',
      fields: config?.fields ?? [],
      weights: config?.weights ?? {},
      sortBy: config?.sortBy ?? '_score',
      sortOrder: config?.sortOrder ?? 'desc',
      minScore: config?.minScore ?? 0,
    };

    this.index = {
      id: this.generateId(),
      items: [],
      fields: [],
      tokens: new Map(),
      trigrams: new Map(),
      fieldValues: new Map(),
      stats: {
        totalItems: 0,
        totalTokens: 0,
        indexSize: 0,
        buildTime: 0,
        lastUpdated: Date.now(),
      },
    };
  }

  // =========================================================================
  // Indexing
  // =========================================================================

  buildIndex(items: T[], fields?: string[]): void {
    const startTime = performance.now();

    this.index.items = items;
    this.index.fields = fields ?? this.config.fields;
    this.index.tokens.clear();
    this.index.trigrams.clear();
    this.index.fieldValues.clear();

    // Auto-detect fields if not specified
    if (this.index.fields.length === 0 && items.length > 0) {
      this.index.fields = Object.keys(items[0]).filter(
        key => typeof items[0][key] === 'string'
      );
    }

    // Index each item
    items.forEach((item, itemIndex) => {
      for (const field of this.index.fields) {
        const value = this.getFieldValue(item, field);
        if (!value) continue;

        // Store field value
        if (!this.index.fieldValues.has(field)) {
          this.index.fieldValues.set(field, new Map());
        }
        this.index.fieldValues.get(field)!.set(itemIndex, value);

        // Tokenize and index
        const tokens = tokenize(value, { removeStopWords: true });
        for (const token of tokens) {
          if (!this.index.tokens.has(token)) {
            this.index.tokens.set(token, new Set());
          }
          this.index.tokens.get(token)!.add(itemIndex);
        }

        // Build trigram index for fuzzy matching
        const trigrams = nGrams(value, 3);
        for (const trigram of trigrams) {
          if (!this.index.trigrams.has(trigram)) {
            this.index.trigrams.set(trigram, new Set());
          }
          this.index.trigrams.get(trigram)!.add(itemIndex);
        }
      }
    });

    const buildTime = performance.now() - startTime;
    this.index.stats = {
      totalItems: items.length,
      totalTokens: this.index.tokens.size,
      indexSize: this.index.tokens.size + this.index.trigrams.size,
      buildTime,
      lastUpdated: Date.now(),
    };
  }

  addItem(item: T): void {
    const itemIndex = this.index.items.length;
    this.index.items.push(item);

    for (const field of this.index.fields) {
      const value = this.getFieldValue(item, field);
      if (!value) continue;

      if (!this.index.fieldValues.has(field)) {
        this.index.fieldValues.set(field, new Map());
      }
      this.index.fieldValues.get(field)!.set(itemIndex, value);

      const tokens = tokenize(value, { removeStopWords: true });
      for (const token of tokens) {
        if (!this.index.tokens.has(token)) {
          this.index.tokens.set(token, new Set());
        }
        this.index.tokens.get(token)!.add(itemIndex);
      }
    }

    this.index.stats.totalItems++;
    this.index.stats.lastUpdated = Date.now();
  }

  removeItem(predicate: (item: T) => boolean): void {
    const indexToRemove = this.index.items.findIndex(predicate);
    if (indexToRemove === -1) return;

    // Rebuild index after removal (simplest approach)
    this.index.items.splice(indexToRemove, 1);
    this.buildIndex(this.index.items, this.index.fields);
  }

  // =========================================================================
  // Search
  // =========================================================================

  search(query: string, config?: Partial<SearchConfig>): SearchResult<T>[] {
    const mergedConfig = { ...this.config, ...config };
    const startTime = performance.now();

    // Track search
    this.trackSearch(query);

    const queryTokens = tokenize(query, {
      lowercase: !mergedConfig.caseSensitive,
      removeStopWords: false,
    });

    if (queryTokens.length === 0) return [];

    // Score each item
    const scores = new Map<number, { score: number; matches: SearchMatch[] }>();

    for (const queryToken of queryTokens) {
      // Exact token matches
      const exactMatches = this.index.tokens.get(queryToken);
      if (exactMatches) {
        exactMatches.forEach(itemIndex => {
          this.addScore(scores, itemIndex, 1.0, queryToken);
        });
      }

      // Prefix matches
      this.index.tokens.forEach((indices, token) => {
        if (token.startsWith(queryToken) && token !== queryToken) {
          indices.forEach(itemIndex => {
            this.addScore(scores, itemIndex, 0.7, queryToken);
          });
        }
      });

      // Fuzzy matches
      if (mergedConfig.fuzzy) {
        this.index.tokens.forEach((indices, token) => {
          if (token === queryToken) return;

          const similarity = jaroWinklerSimilarity(queryToken, token);
          if (similarity >= (1 - mergedConfig.fuzzyThreshold)) {
            indices.forEach(itemIndex => {
              this.addScore(scores, itemIndex, similarity * 0.5, queryToken);
            });
          }
        });
      }
    }

    // Build results with field-level matching
    const results: SearchResult<T>[] = [];
    scores.forEach(({ score, matches }, itemIndex) => {
      if (score < mergedConfig.minScore) return;

      const item = this.index.items[itemIndex];

      // Apply field weights
      let weightedScore = score;
      const fieldMatches: SearchMatch[] = [];
      const highlights: Record<string, string> = {};

      for (const field of this.index.fields) {
        const value = this.index.fieldValues.get(field)?.get(itemIndex);
        if (!value) continue;

        const fieldWeight = mergedConfig.weights[field] ?? 1;
        const fieldScore = this.scoreField(value, queryTokens, mergedConfig);

        if (fieldScore > 0) {
          weightedScore += fieldScore * fieldWeight;
          const indices = this.findMatchIndices(value, queryTokens);
          fieldMatches.push({ field, value, indices, score: fieldScore });
          highlights[field] = this.highlightText(value, indices, mergedConfig.highlightTag);
        }
      }

      results.push({
        item,
        score: weightedScore,
        matches: fieldMatches.length > 0 ? fieldMatches : matches,
        highlights,
      });
    });

    // Sort results
    if (mergedConfig.sortBy === '_score') {
      results.sort((a, b) =>
        mergedConfig.sortOrder === 'desc' ? b.score - a.score : a.score - b.score
      );
    } else {
      results.sort((a, b) => {
        const aVal = String(this.getFieldValue(a.item, mergedConfig.sortBy));
        const bVal = String(this.getFieldValue(b.item, mergedConfig.sortBy));
        return mergedConfig.sortOrder === 'desc'
          ? bVal.localeCompare(aVal)
          : aVal.localeCompare(bVal);
      });
    }

    return results.slice(0, mergedConfig.maxResults);
  }

  // =========================================================================
  // Filtering
  // =========================================================================

  filter(items: SearchResult<T>[], filters: SearchFilter[]): SearchResult<T>[] {
    return items.filter(result => {
      return filters.every(f => this.applyFilter(result.item, f));
    });
  }

  private applyFilter(item: T, filter: SearchFilter): boolean {
    const value = this.getFieldValue(item, filter.field);

    switch (filter.operator) {
      case 'eq': return value === String(filter.value);
      case 'neq': return value !== String(filter.value);
      case 'gt': return Number(value) > Number(filter.value);
      case 'gte': return Number(value) >= Number(filter.value);
      case 'lt': return Number(value) < Number(filter.value);
      case 'lte': return Number(value) <= Number(filter.value);
      case 'contains': return value?.includes(String(filter.value)) ?? false;
      case 'startsWith': return value?.startsWith(String(filter.value)) ?? false;
      case 'endsWith': return value?.endsWith(String(filter.value)) ?? false;
      case 'in': return Array.isArray(filter.value) && filter.value.includes(value);
      case 'between': {
        const [min, max] = filter.value as [number, number];
        const num = Number(value);
        return num >= min && num <= max;
      }
      case 'regex': {
        try {
          return new RegExp(String(filter.value)).test(value ?? '');
        } catch { return false; }
      }
      default: return true;
    }
  }

  // =========================================================================
  // Facets
  // =========================================================================

  generateFacets(results: SearchResult<T>[], fields: string[]): SearchFacet[] {
    return fields.map(field => {
      const values = new Map<string, number>();
      let numericValues: number[] = [];

      for (const result of results) {
        const value = this.getFieldValue(result.item, field);
        if (!value) continue;

        values.set(value, (values.get(value) ?? 0) + 1);

        const num = Number(value);
        if (!isNaN(num)) numericValues.push(num);
      }

      const facet: SearchFacet = { field, values };

      if (numericValues.length > 0) {
        facet.min = Math.min(...numericValues);
        facet.max = Math.max(...numericValues);
        facet.avg = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
      }

      return facet;
    });
  }

  // =========================================================================
  // Autocomplete & Suggestions
  // =========================================================================

  suggest(query: string, limit: number = 10): SearchSuggestion[] {
    const suggestions: SearchSuggestion[] = [];
    const queryLower = query.toLowerCase();

    // Completion suggestions from indexed tokens
    this.index.tokens.forEach((indices, token) => {
      if (token.startsWith(queryLower) && token !== queryLower) {
        suggestions.push({
          text: token,
          score: indices.size / this.index.stats.totalItems,
          type: 'completion',
        });
      }
    });

    // Correction suggestions (fuzzy match)
    if (query.length >= 3) {
      this.index.tokens.forEach((indices, token) => {
        const distance = levenshteinDistance(queryLower, token);
        if (distance > 0 && distance <= 2 && !token.startsWith(queryLower)) {
          suggestions.push({
            text: token,
            score: 1 / (distance + 1),
            type: 'correction',
          });
        }
      });
    }

    // Recent searches
    for (const recent of this.recentSearches) {
      if (recent.toLowerCase().includes(queryLower)) {
        suggestions.push({
          text: recent,
          score: 0.5,
          type: 'recent',
        });
      }
    }

    // Popular searches
    this.popularSearches.forEach((count, search) => {
      if (search.toLowerCase().includes(queryLower)) {
        suggestions.push({
          text: search,
          score: count / 100,
          type: 'popular',
        });
      }
    });

    // Deduplicate and sort
    const seen = new Set<string>();
    return suggestions
      .filter(s => {
        if (seen.has(s.text)) return false;
        seen.add(s.text);
        return true;
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  // =========================================================================
  // Highlighting
  // =========================================================================

  private highlightText(text: string, indices: [number, number][], tag: string): string {
    if (indices.length === 0) return text;

    // Sort indices by start position (descending) to replace from end
    const sorted = [...indices].sort((a, b) => b[0] - a[0]);
    let result = text;

    for (const [start, end] of sorted) {
      const before = result.slice(0, start);
      const match = result.slice(start, end + 1);
      const after = result.slice(end + 1);
      result = `${before}<${tag}>${match}</${tag}>${after}`;
    }

    return result;
  }

  private findMatchIndices(text: string, tokens: string[]): [number, number][] {
    const indices: [number, number][] = [];
    const lowerText = text.toLowerCase();

    for (const token of tokens) {
      let pos = 0;
      while ((pos = lowerText.indexOf(token, pos)) !== -1) {
        indices.push([pos, pos + token.length - 1]);
        pos += token.length;
      }
    }

    return this.mergeOverlappingIndices(indices);
  }

  private mergeOverlappingIndices(indices: [number, number][]): [number, number][] {
    if (indices.length <= 1) return indices;

    const sorted = [...indices].sort((a, b) => a[0] - b[0]);
    const merged: [number, number][] = [sorted[0]];

    for (let i = 1; i < sorted.length; i++) {
      const last = merged[merged.length - 1];
      if (sorted[i][0] <= last[1] + 1) {
        last[1] = Math.max(last[1], sorted[i][1]);
      } else {
        merged.push(sorted[i]);
      }
    }

    return merged;
  }

  // =========================================================================
  // Scoring Helpers
  // =========================================================================

  private scoreField(text: string, queryTokens: string[], config: Required<SearchConfig>): number {
    const lowerText = config.caseSensitive ? text : text.toLowerCase();
    let score = 0;

    for (const token of queryTokens) {
      const lowerToken = config.caseSensitive ? token : token.toLowerCase();

      // Exact substring match
      if (lowerText.includes(lowerToken)) {
        score += 1.0;
        // Bonus for match at start
        if (lowerText.startsWith(lowerToken)) score += 0.5;
        // Bonus for exact word match
        if (lowerText === lowerToken) score += 1.0;
      }
    }

    // Full query match bonus
    const fullQuery = queryTokens.join(' ');
    if (lowerText.includes(fullQuery.toLowerCase())) {
      score += 2.0;
    }

    return score;
  }

  private addScore(
    scores: Map<number, { score: number; matches: SearchMatch[] }>,
    itemIndex: number,
    score: number,
    token: string
  ): void {
    const existing = scores.get(itemIndex);
    if (existing) {
      existing.score += score;
    } else {
      scores.set(itemIndex, {
        score,
        matches: [{
          field: '_index',
          value: token,
          indices: [],
          score,
        }],
      });
    }
  }

  // =========================================================================
  // Utilities
  // =========================================================================

  private getFieldValue(item: T, field: string): string | undefined {
    const parts = field.split('.');
    let current: unknown = item;

    for (const part of parts) {
      if (current == null || typeof current !== 'object') return undefined;
      current = (current as Record<string, unknown>)[part];
    }

    return current != null ? String(current) : undefined;
  }

  private trackSearch(query: string): void {
    // Recent searches
    this.recentSearches = [query, ...this.recentSearches.filter(s => s !== query)].slice(0, 20);

    // Popular searches
    const count = this.popularSearches.get(query) ?? 0;
    this.popularSearches.set(query, count + 1);
  }

  getStats(): SearchIndexStats {
    return { ...this.index.stats };
  }

  getRecentSearches(limit: number = 10): string[] {
    return this.recentSearches.slice(0, limit);
  }

  getPopularSearches(limit: number = 10): [string, number][] {
    return Array.from(this.popularSearches.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);
  }

  clearIndex(): void {
    this.index.items = [];
    this.index.tokens.clear();
    this.index.trigrams.clear();
    this.index.fieldValues.clear();
    this.index.stats = {
      totalItems: 0,
      totalTokens: 0,
      indexSize: 0,
      buildTime: 0,
      lastUpdated: Date.now(),
    };
  }

  private generateId(): string {
    return `idx-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}

// =============================================================================
// Search CSS
// =============================================================================

export function generateSearchCSS(theme: 'light' | 'dark' = 'dark'): string {
  const isDark = theme === 'dark';

  return `.search-container {
  position: relative;
  width: 100%;
  max-width: 600px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  padding: 10px 16px 10px 42px;
  background: ${isDark ? '#1e1e2e' : '#ffffff'};
  border: 1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
  border-radius: 10px;
  color: ${isDark ? '#e5e7eb' : '#1f2937'};
  font-size: 14px;
  outline: none;
  transition: all 200ms ease;
}

.search-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.search-input::placeholder {
  color: ${isDark ? '#4b5563' : '#9ca3af'};
}

.search-icon {
  position: absolute;
  left: 14px;
  color: ${isDark ? '#6b7280' : '#9ca3af'};
  pointer-events: none;
}

.search-clear {
  position: absolute;
  right: 12px;
  padding: 4px;
  background: none;
  border: none;
  color: ${isDark ? '#6b7280' : '#9ca3af'};
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
}

.search-clear:hover {
  background: ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'};
  color: ${isDark ? '#d1d5db' : '#374151'};
}

.search-results {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: ${isDark ? '#1e1e2e' : '#ffffff'};
  border: 1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'};
  border-radius: 12px;
  box-shadow: 0 12px 40px rgba(0,0,0,${isDark ? '0.3' : '0.12'});
  max-height: 400px;
  overflow-y: auto;
  z-index: 100;
}

.search-result {
  display: flex;
  align-items: flex-start;
  padding: 10px 16px;
  cursor: pointer;
  transition: background 100ms ease;
  border-bottom: 1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'};
}

.search-result:last-child {
  border-bottom: none;
}

.search-result:hover,
.search-result--active {
  background: ${isDark ? 'rgba(99, 102, 241, 0.08)' : 'rgba(99, 102, 241, 0.04)'};
}

.search-result__title {
  font-size: 14px;
  font-weight: 500;
  color: ${isDark ? '#e5e7eb' : '#1f2937'};
  margin-bottom: 2px;
}

.search-result__description {
  font-size: 12px;
  color: ${isDark ? '#6b7280' : '#9ca3af'};
}

.search-result mark {
  background: ${isDark ? 'rgba(250, 204, 21, 0.2)' : 'rgba(250, 204, 21, 0.3)'};
  color: ${isDark ? '#fde047' : '#854d0e'};
  border-radius: 2px;
  padding: 0 2px;
}

.search-result__score {
  font-size: 10px;
  color: ${isDark ? '#4b5563' : '#9ca3af'};
  margin-left: auto;
  padding-left: 12px;
  white-space: nowrap;
}

.search-suggestions {
  padding: 8px;
}

.search-suggestion {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  cursor: pointer;
  border-radius: 6px;
  font-size: 13px;
  color: ${isDark ? '#d1d5db' : '#4b5563'};
  transition: background 100ms ease;
}

.search-suggestion:hover {
  background: ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'};
}

.search-suggestion__icon {
  color: ${isDark ? '#6b7280' : '#9ca3af'};
  flex-shrink: 0;
}

.search-suggestion__type {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 4px;
  margin-left: auto;
  background: ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'};
  color: ${isDark ? '#6b7280' : '#9ca3af'};
}

.search-facets {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px 16px;
  border-bottom: 1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'};
}

.search-facet {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 12px;
  background: ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'};
  color: ${isDark ? '#d1d5db' : '#4b5563'};
  cursor: pointer;
  transition: all 150ms ease;
  border: 1px solid transparent;
}

.search-facet:hover {
  background: ${isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.06)'};
  border-color: ${isDark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.15)'};
}

.search-facet--active {
  background: rgba(99, 102, 241, 0.15);
  color: #818cf8;
  border-color: rgba(99, 102, 241, 0.3);
}

.search-facet__count {
  font-weight: 600;
}

.search-empty {
  padding: 32px 16px;
  text-align: center;
  color: ${isDark ? '#6b7280' : '#9ca3af'};
}

.search-empty__icon {
  font-size: 36px;
  margin-bottom: 8px;
  opacity: 0.5;
}

.search-empty__text {
  font-size: 14px;
  margin-bottom: 4px;
}

.search-empty__hint {
  font-size: 12px;
  opacity: 0.7;
}

.search-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.search-loading__spinner {
  width: 24px;
  height: 24px;
  border: 2px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: search-spin 600ms linear infinite;
}

@keyframes search-spin {
  to { transform: rotate(360deg); }
}`;
}

// =============================================================================
// Factory
// =============================================================================

export function createSearchEngine<T extends Record<string, unknown>>(
  config?: SearchConfig
): SearchEngine<T> {
  return new SearchEngine<T>(config);
}
