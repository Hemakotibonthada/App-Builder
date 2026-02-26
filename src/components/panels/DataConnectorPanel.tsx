/**
 * Data Connector Panel — Manage API connections, test endpoints,
 * view responses, and bind data to widgets.
 */

'use client';

import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
  memo,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

/* ──────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────── */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export interface Header {
  key: string;
  value: string;
  enabled: boolean;
}

export interface QueryParam {
  key: string;
  value: string;
  enabled: boolean;
}

export type AuthType = 'none' | 'bearer' | 'api-key' | 'basic' | 'oauth2';

export interface AuthConfig {
  type: AuthType;
  token?: string;
  username?: string;
  password?: string;
  apiKeyName?: string;
  apiKeyValue?: string;
  apiKeyLocation?: 'header' | 'query';
}

export type BodyType = 'none' | 'json' | 'form-data' | 'raw' | 'graphql';

export interface RequestBody {
  type: BodyType;
  content: string;
}

export interface APIEndpoint {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  headers: Header[];
  params: QueryParam[];
  auth: AuthConfig;
  body: RequestBody;
  description?: string;
  folder?: string;
}

export interface APIResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  time: number;
  size: number;
}

export interface DataBinding {
  id: string;
  endpointId: string;
  widgetId: string;
  property: string;
  path: string; // JSONPath
  transform?: string;
}

export interface DataConnector {
  id: string;
  name: string;
  type: 'rest' | 'graphql' | 'websocket' | 'database';
  baseUrl: string;
  endpoints: APIEndpoint[];
  bindings: DataBinding[];
  isConnected: boolean;
}

/* ──────────────────────────────────────────────
 * Method Badge
 * ────────────────────────────────────────────── */

const methodColors: Record<HttpMethod, string> = {
  GET: 'text-emerald-400 bg-emerald-400/10',
  POST: 'text-amber-400 bg-amber-400/10',
  PUT: 'text-blue-400 bg-blue-400/10',
  PATCH: 'text-violet-400 bg-violet-400/10',
  DELETE: 'text-red-400 bg-red-400/10',
  HEAD: 'text-teal-400 bg-teal-400/10',
  OPTIONS: 'text-gray-400 bg-gray-400/10',
};

function MethodBadge({ method, size = 'sm' }: { method: HttpMethod; size?: 'sm' | 'xs' }) {
  return (
    <span className={clsx(
      'font-mono font-bold rounded',
      methodColors[method],
      size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-[9px] px-1 py-0.5',
    )}>
      {method}
    </span>
  );
}

/* ──────────────────────────────────────────────
 * Status Code Badge
 * ────────────────────────────────────────────── */

function StatusBadge({ status }: { status: number }) {
  const color = status < 300 ? 'text-emerald-400 bg-emerald-400/10'
    : status < 400 ? 'text-amber-400 bg-amber-400/10'
      : status < 500 ? 'text-orange-400 bg-orange-400/10'
        : 'text-red-400 bg-red-400/10';

  return (
    <span className={clsx('text-[10px] font-mono px-1.5 py-0.5 rounded', color)}>
      {status}
    </span>
  );
}

/* ──────────────────────────────────────────────
 * Section Toggle
 * ────────────────────────────────────────────── */

function SectionToggle({ label, isOpen, onToggle, count, children }: {
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-white/5">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/3 transition-colors"
      >
        <div className="flex items-center gap-2">
          <motion.span
            animate={{ rotate: isOpen ? 90 : 0 }}
            className="text-white/30 text-[10px]"
          >
            ▶
          </motion.span>
          <span className="text-xs text-white/60 font-medium">{label}</span>
          {count !== undefined && (
            <span className="text-[9px] text-white/20 bg-white/5 px-1 rounded">{count}</span>
          )}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Key-Value Editor (for headers, params)
 * ────────────────────────────────────────────── */

interface KVPair {
  key: string;
  value: string;
  enabled: boolean;
}

function KeyValueEditor({
  pairs,
  onChange,
  keyPlaceholder = 'Key',
  valuePlaceholder = 'Value',
}: {
  pairs: KVPair[];
  onChange: (pairs: KVPair[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
}) {
  const updatePair = (index: number, field: keyof KVPair, val: string | boolean) => {
    const next = [...pairs];
    next[index] = { ...next[index], [field]: val };
    onChange(next);
  };

  const addPair = () => {
    onChange([...pairs, { key: '', value: '', enabled: true }]);
  };

  const removePair = (index: number) => {
    onChange(pairs.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-1.5">
      {pairs.map((pair, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={pair.enabled}
            onChange={(e) => updatePair(i, 'enabled', e.target.checked)}
            className="w-3 h-3 rounded bg-white/5 border-white/10 accent-indigo-500"
          />
          <input
            type="text"
            placeholder={keyPlaceholder}
            value={pair.key}
            onChange={(e) => updatePair(i, 'key', e.target.value)}
            className="flex-1 px-2 py-1 text-[11px] bg-white/5 border border-white/10 rounded
                       text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50"
          />
          <input
            type="text"
            placeholder={valuePlaceholder}
            value={pair.value}
            onChange={(e) => updatePair(i, 'value', e.target.value)}
            className="flex-1 px-2 py-1 text-[11px] bg-white/5 border border-white/10 rounded
                       text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50"
          />
          <button
            onClick={() => removePair(i)}
            className="text-white/20 hover:text-red-400 p-0.5"
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
      <button
        onClick={addPair}
        className="text-[10px] text-indigo-400 hover:text-indigo-300"
      >
        + Add
      </button>
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Body Editor
 * ────────────────────────────────────────────── */

function BodyEditor({
  body,
  onChange,
}: {
  body: RequestBody;
  onChange: (body: RequestBody) => void;
}) {
  const bodyTypes: BodyType[] = ['none', 'json', 'form-data', 'raw', 'graphql'];

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {bodyTypes.map(type => (
          <button
            key={type}
            onClick={() => onChange({ ...body, type })}
            className={clsx(
              'px-2 py-1 text-[10px] rounded',
              body.type === type
                ? 'bg-indigo-500/20 text-indigo-400'
                : 'text-white/30 hover:text-white/50',
            )}
          >
            {type}
          </button>
        ))}
      </div>
      {body.type !== 'none' && (
        <textarea
          value={body.content}
          onChange={(e) => onChange({ ...body, content: e.target.value })}
          placeholder={body.type === 'json' ? '{\n  "key": "value"\n}' : 'Enter body content...'}
          className="w-full h-32 px-3 py-2 text-[11px] font-mono bg-white/5 border border-white/10 rounded
                     text-white placeholder-white/20 resize-none focus:outline-none focus:border-indigo-500/50"
        />
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Auth Editor
 * ────────────────────────────────────────────── */

function AuthEditor({
  auth,
  onChange,
}: {
  auth: AuthConfig;
  onChange: (auth: AuthConfig) => void;
}) {
  const authTypes: AuthType[] = ['none', 'bearer', 'api-key', 'basic', 'oauth2'];

  const InputField = ({ label, value, onChange: onFieldChange, type = 'text' }: {
    label: string; value: string; onChange: (v: string) => void; type?: string;
  }) => (
    <div className="space-y-1">
      <label className="text-[10px] text-white/30">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onFieldChange(e.target.value)}
        className="w-full px-2 py-1 text-[11px] bg-white/5 border border-white/10 rounded
                   text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50"
      />
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex gap-1 flex-wrap">
        {authTypes.map(type => (
          <button
            key={type}
            onClick={() => onChange({ ...auth, type })}
            className={clsx(
              'px-2 py-1 text-[10px] rounded capitalize',
              auth.type === type
                ? 'bg-indigo-500/20 text-indigo-400'
                : 'text-white/30 hover:text-white/50',
            )}
          >
            {type}
          </button>
        ))}
      </div>

      {auth.type === 'bearer' && (
        <InputField label="Token" value={auth.token ?? ''} onChange={(v) => onChange({ ...auth, token: v })} />
      )}
      {auth.type === 'basic' && (
        <div className="space-y-2">
          <InputField label="Username" value={auth.username ?? ''} onChange={(v) => onChange({ ...auth, username: v })} />
          <InputField label="Password" value={auth.password ?? ''} onChange={(v) => onChange({ ...auth, password: v })} type="password" />
        </div>
      )}
      {auth.type === 'api-key' && (
        <div className="space-y-2">
          <InputField label="Key Name" value={auth.apiKeyName ?? ''} onChange={(v) => onChange({ ...auth, apiKeyName: v })} />
          <InputField label="Key Value" value={auth.apiKeyValue ?? ''} onChange={(v) => onChange({ ...auth, apiKeyValue: v })} />
          <div className="flex gap-2">
            {(['header', 'query'] as const).map(loc => (
              <button
                key={loc}
                onClick={() => onChange({ ...auth, apiKeyLocation: loc })}
                className={clsx(
                  'px-2 py-1 text-[10px] rounded capitalize',
                  auth.apiKeyLocation === loc
                    ? 'bg-indigo-500/20 text-indigo-400'
                    : 'text-white/30 hover:text-white/50',
                )}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Response Viewer
 * ────────────────────────────────────────────── */

interface ResponseViewerProps {
  response: APIResponse | null;
  isLoading: boolean;
}

function ResponseViewer({ response, isLoading }: ResponseViewerProps) {
  const [activeTab, setActiveTab] = useState<'body' | 'headers'>('body');
  const [bodyViewMode, setBodyViewMode] = useState<'pretty' | 'raw'>('pretty');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <motion.div
          className="w-8 h-8 border-2 border-indigo-500/50 border-t-indigo-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  if (!response) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-white/20">
        <svg className="w-8 h-8 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
        <span className="text-xs">Send a request to see the response</span>
      </div>
    );
  }

  const prettyBody = (() => {
    try {
      return JSON.stringify(JSON.parse(response.body), null, 2);
    } catch {
      return response.body;
    }
  })();

  return (
    <div className="space-y-2">
      {/* Response stats */}
      <div className="flex items-center gap-3 px-1">
        <StatusBadge status={response.status} />
        <span className="text-[10px] text-white/30">{response.statusText}</span>
        <span className="text-[10px] text-white/20">{response.time}ms</span>
        <span className="text-[10px] text-white/20">{formatBytes(response.size)}</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/5 pb-0.5">
        {(['body', 'headers'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              'px-2 py-1 text-[10px] capitalize rounded-t',
              activeTab === tab ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/5' : 'text-white/30 hover:text-white/50',
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'body' && (
        <div>
          <div className="flex gap-1 mb-2">
            {(['pretty', 'raw'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setBodyViewMode(mode)}
                className={clsx(
                  'px-2 py-0.5 text-[9px] rounded capitalize',
                  bodyViewMode === mode ? 'bg-white/10 text-white/60' : 'text-white/20 hover:text-white/40',
                )}
              >
                {mode}
              </button>
            ))}
          </div>
          <pre className="p-2 text-[11px] font-mono bg-black/20 rounded overflow-auto max-h-64 text-white/60 whitespace-pre-wrap">
            {bodyViewMode === 'pretty' ? prettyBody : response.body}
          </pre>
        </div>
      )}

      {activeTab === 'headers' && (
        <div className="space-y-1">
          {Object.entries(response.headers).map(([key, value]) => (
            <div key={key} className="flex gap-2 text-[11px]">
              <span className="text-indigo-400 font-mono">{key}:</span>
              <span className="text-white/50 font-mono">{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/* ──────────────────────────────────────────────
 * Data Binding Editor
 * ────────────────────────────────────────────── */

interface DataBindingEditorProps {
  bindings: DataBinding[];
  endpoints: APIEndpoint[];
  onChange: (bindings: DataBinding[]) => void;
}

function DataBindingEditor({ bindings, endpoints, onChange }: DataBindingEditorProps) {
  const addBinding = () => {
    onChange([
      ...bindings,
      {
        id: `binding-${Date.now()}`,
        endpointId: endpoints[0]?.id ?? '',
        widgetId: '',
        property: 'text',
        path: '$.data',
      },
    ]);
  };

  const removeBinding = (id: string) => {
    onChange(bindings.filter(b => b.id !== id));
  };

  const updateBinding = (id: string, field: keyof DataBinding, value: string) => {
    onChange(bindings.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/40 font-medium">Data Bindings</span>
        <button
          onClick={addBinding}
          className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
        >
          <span>+</span> Add Binding
        </button>
      </div>

      {bindings.length === 0 && (
        <div className="text-[10px] text-white/15 text-center py-4">
          No data bindings yet. Connect API data to widget properties.
        </div>
      )}

      {bindings.map((binding) => (
        <motion.div
          key={binding.id}
          layout
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="p-2 bg-white/3 rounded border border-white/5 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-white/20 font-mono">{binding.id}</span>
            <button onClick={() => removeBinding(binding.id)} className="text-white/20 hover:text-red-400">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[9px] text-white/20">Endpoint</label>
              <select
                value={binding.endpointId}
                onChange={(e) => updateBinding(binding.id, 'endpointId', e.target.value)}
                className="w-full px-2 py-1 text-[10px] bg-white/5 border border-white/10 rounded
                           text-white focus:outline-none focus:border-indigo-500/50"
              >
                {endpoints.map(ep => (
                  <option key={ep.id} value={ep.id}>{ep.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] text-white/20">Widget ID</label>
              <input
                type="text"
                value={binding.widgetId}
                onChange={(e) => updateBinding(binding.id, 'widgetId', e.target.value)}
                placeholder="widget-id"
                className="w-full px-2 py-1 text-[10px] bg-white/5 border border-white/10 rounded
                           text-white placeholder-white/15 focus:outline-none focus:border-indigo-500/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] text-white/20">Property</label>
              <input
                type="text"
                value={binding.property}
                onChange={(e) => updateBinding(binding.id, 'property', e.target.value)}
                placeholder="text"
                className="w-full px-2 py-1 text-[10px] bg-white/5 border border-white/10 rounded
                           text-white placeholder-white/15 focus:outline-none focus:border-indigo-500/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] text-white/20">JSON Path</label>
              <input
                type="text"
                value={binding.path}
                onChange={(e) => updateBinding(binding.id, 'path', e.target.value)}
                placeholder="$.data.items"
                className="w-full px-2 py-1 text-[10px] bg-white/5 border border-white/10 rounded
                           text-white placeholder-white/15 focus:outline-none focus:border-indigo-500/50"
              />
            </div>
          </div>

          {binding.transform && (
            <div className="space-y-1">
              <label className="text-[9px] text-white/20">Transform</label>
              <input
                type="text"
                value={binding.transform}
                onChange={(e) => updateBinding(binding.id, 'transform', e.target.value)}
                placeholder="data => data.map(d => d.name)"
                className="w-full px-2 py-1 text-[10px] font-mono bg-white/5 border border-white/10 rounded
                           text-white placeholder-white/15 focus:outline-none focus:border-indigo-500/50"
              />
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Endpoint List Sidebar
 * ────────────────────────────────────────────── */

interface EndpointListProps {
  endpoints: APIEndpoint[];
  activeEndpointId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
}

function EndpointList({ endpoints, activeEndpointId, onSelect, onAdd, onDelete }: EndpointListProps) {
  const grouped = useMemo(() => {
    const groups: Record<string, APIEndpoint[]> = {};
    for (const ep of endpoints) {
      const folder = ep.folder ?? 'Ungrouped';
      if (!groups[folder]) groups[folder] = [];
      groups[folder].push(ep);
    }
    return groups;
  }, [endpoints]);

  return (
    <div className="w-56 border-r border-white/5 flex flex-col bg-[#181825]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
        <span className="text-xs text-white/40 font-medium">Endpoints</span>
        <motion.button
          onClick={onAdd}
          className="text-white/30 hover:text-indigo-400 p-1 rounded hover:bg-white/5"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </motion.button>
      </div>

      {/* Endpoint list */}
      <div className="flex-1 overflow-auto">
        {Object.entries(grouped).map(([folder, eps]) => (
          <div key={folder}>
            <div className="px-3 py-1.5 text-[9px] text-white/15 uppercase tracking-wider font-medium">
              {folder}
            </div>
            {eps.map(ep => (
              <motion.button
                key={ep.id}
                onClick={() => onSelect(ep.id)}
                className={clsx(
                  'w-full flex items-center gap-2 px-3 py-1.5 text-left group',
                  activeEndpointId === ep.id
                    ? 'bg-indigo-500/10 border-l-2 border-indigo-500'
                    : 'hover:bg-white/3 border-l-2 border-transparent',
                )}
                whileHover={{ x: 2 }}
              >
                <MethodBadge method={ep.method} size="xs" />
                <span className={clsx(
                  'text-[11px] truncate flex-1',
                  activeEndpointId === ep.id ? 'text-white/70' : 'text-white/40',
                )}>
                  {ep.name}
                </span>
                <motion.button
                  onClick={(e) => { e.stopPropagation(); onDelete(ep.id); }}
                  className="text-white/10 hover:text-red-400 opacity-0 group-hover:opacity-100 p-0.5"
                  whileHover={{ scale: 1.1 }}
                >
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </motion.button>
              </motion.button>
            ))}
          </div>
        ))}

        {endpoints.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-white/15">
            <svg className="w-6 h-6 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 4v16h16" />
              <path d="M4 20l7-7 4 4 5-5" />
            </svg>
            <span className="text-[10px]">No endpoints</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Connector Card
 * ────────────────────────────────────────────── */

interface ConnectorCardProps {
  connector: DataConnector;
  isActive: boolean;
  onClick: () => void;
}

function ConnectorCard({ connector, isActive, onClick }: ConnectorCardProps) {
  const typeIcons: Record<string, string> = {
    rest: '🔗',
    graphql: '💠',
    websocket: '🔌',
    database: '🗃️',
  };

  return (
    <motion.button
      onClick={onClick}
      className={clsx(
        'w-full flex items-center gap-3 p-3 rounded-lg border text-left',
        isActive
          ? 'border-indigo-500/30 bg-indigo-500/5'
          : 'border-white/5 bg-white/2 hover:bg-white/5',
      )}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <span className="text-lg">{typeIcons[connector.type] ?? '🔗'}</span>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-white/60 font-medium truncate">{connector.name}</div>
        <div className="text-[10px] text-white/25 truncate">{connector.baseUrl}</div>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-[9px] text-white/20 bg-white/5 px-1.5 py-0.5 rounded">
          {connector.endpoints.length} endpoints
        </span>
        <span className={clsx(
          'w-2 h-2 rounded-full',
          connector.isConnected ? 'bg-emerald-500' : 'bg-white/15',
        )} />
      </div>
    </motion.button>
  );
}

/* ──────────────────────────────────────────────
 * Environment Variables Manager
 * ────────────────────────────────────────────── */

interface EnvVariable {
  key: string;
  value: string;
  isSecret: boolean;
}

interface EnvManagerProps {
  variables: EnvVariable[];
  onChange: (variables: EnvVariable[]) => void;
}

function EnvManager({ variables, onChange }: EnvManagerProps) {
  const [showSecrets, setShowSecrets] = useState(false);

  const addVariable = () => {
    onChange([...variables, { key: '', value: '', isSecret: false }]);
  };

  const removeVariable = (index: number) => {
    onChange(variables.filter((_, i) => i !== index));
  };

  const updateVariable = (index: number, field: keyof EnvVariable, val: string | boolean) => {
    const next = [...variables];
    next[index] = { ...next[index], [field]: val };
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/40 font-medium">Environment Variables</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSecrets(!showSecrets)}
            className="text-[10px] text-white/30 hover:text-white/50"
          >
            {showSecrets ? '🔓 Hide' : '🔒 Show'} Secrets
          </button>
          <button
            onClick={addVariable}
            className="text-[10px] text-indigo-400 hover:text-indigo-300"
          >
            + Add
          </button>
        </div>
      </div>

      {variables.map((v, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <input
            type="text"
            placeholder="KEY"
            value={v.key}
            onChange={(e) => updateVariable(i, 'key', e.target.value)}
            className="w-1/3 px-2 py-1 text-[11px] font-mono bg-white/5 border border-white/10 rounded
                       text-white placeholder-white/15 focus:outline-none focus:border-indigo-500/50"
          />
          <input
            type={v.isSecret && !showSecrets ? 'password' : 'text'}
            placeholder="value"
            value={v.value}
            onChange={(e) => updateVariable(i, 'value', e.target.value)}
            className="flex-1 px-2 py-1 text-[11px] font-mono bg-white/5 border border-white/10 rounded
                       text-white placeholder-white/15 focus:outline-none focus:border-indigo-500/50"
          />
          <button
            onClick={() => updateVariable(i, 'isSecret', !v.isSecret)}
            className={clsx('text-xs p-1', v.isSecret ? 'text-amber-400' : 'text-white/15')}
          >
            {v.isSecret ? '🔒' : '🔓'}
          </button>
          <button
            onClick={() => removeVariable(i)}
            className="text-white/20 hover:text-red-400 p-0.5"
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Request History
 * ────────────────────────────────────────────── */

interface HistoryEntry {
  id: string;
  method: HttpMethod;
  url: string;
  status: number;
  time: number;
  timestamp: number;
}

function RequestHistory({
  history,
  onSelect,
}: {
  history: HistoryEntry[];
  onSelect: (entry: HistoryEntry) => void;
}) {
  return (
    <div className="space-y-1">
      {history.length === 0 && (
        <div className="text-[10px] text-white/15 text-center py-4">
          No request history
        </div>
      )}
      {history.map(entry => (
        <motion.button
          key={entry.id}
          onClick={() => onSelect(entry)}
          className="w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-white/5 text-left"
          whileHover={{ x: 2 }}
        >
          <MethodBadge method={entry.method} size="xs" />
          <span className="text-[10px] text-white/40 truncate flex-1">{entry.url}</span>
          <StatusBadge status={entry.status} />
          <span className="text-[9px] text-white/20">{entry.time}ms</span>
        </motion.button>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Main Data Connector Panel
 * ────────────────────────────────────────────── */

interface DataConnectorPanelProps {
  className?: string;
}

export function DataConnectorPanel({ className }: DataConnectorPanelProps) {
  // State
  const [connectors, setConnectors] = useState<DataConnector[]>([
    {
      id: 'conn-1',
      name: 'Main API',
      type: 'rest',
      baseUrl: 'https://api.example.com',
      isConnected: true,
      endpoints: [
        {
          id: 'ep-1',
          name: 'Get Users',
          method: 'GET',
          url: '/api/users',
          headers: [{ key: 'Content-Type', value: 'application/json', enabled: true }],
          params: [{ key: 'page', value: '1', enabled: true }],
          auth: { type: 'bearer', token: 'your-token-here' },
          body: { type: 'none', content: '' },
          folder: 'Users',
        },
        {
          id: 'ep-2',
          name: 'Create User',
          method: 'POST',
          url: '/api/users',
          headers: [{ key: 'Content-Type', value: 'application/json', enabled: true }],
          params: [],
          auth: { type: 'bearer', token: 'your-token-here' },
          body: { type: 'json', content: '{\n  "name": "John",\n  "email": "john@example.com"\n}' },
          folder: 'Users',
        },
        {
          id: 'ep-3',
          name: 'Get Products',
          method: 'GET',
          url: '/api/products',
          headers: [],
          params: [{ key: 'limit', value: '10', enabled: true }],
          auth: { type: 'none' },
          body: { type: 'none', content: '' },
          folder: 'Products',
        },
      ],
      bindings: [],
    },
  ]);

  const [activeConnectorId, setActiveConnectorId] = useState<string>('conn-1');
  const [activeEndpointId, setActiveEndpointId] = useState<string | null>('ep-1');
  const [response, setResponse] = useState<APIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [openSections, setOpenSections] = useState({
    headers: true,
    params: false,
    auth: false,
    body: false,
    bindings: false,
  });
  const [activeTab, setActiveTab] = useState<'request' | 'response' | 'bindings' | 'history' | 'env'>('request');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [envVariables, setEnvVariables] = useState<EnvVariable[]>([
    { key: 'API_BASE_URL', value: 'https://api.example.com', isSecret: false },
    { key: 'API_KEY', value: 'sk-1234567890', isSecret: true },
  ]);

  const activeConnector = connectors.find(c => c.id === activeConnectorId);
  const activeEndpoint = activeConnector?.endpoints.find(ep => ep.id === activeEndpointId);

  // Handlers
  const toggleSection = (key: keyof typeof openSections) =>
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));

  const addEndpoint = useCallback(() => {
    if (!activeConnector) return;
    const newEndpoint: APIEndpoint = {
      id: `ep-${Date.now()}`,
      name: 'New Request',
      method: 'GET',
      url: '',
      headers: [],
      params: [],
      auth: { type: 'none' },
      body: { type: 'none', content: '' },
    };
    setConnectors(prev => prev.map(c =>
      c.id === activeConnectorId
        ? { ...c, endpoints: [...c.endpoints, newEndpoint] }
        : c,
    ));
    setActiveEndpointId(newEndpoint.id);
  }, [activeConnector, activeConnectorId]);

  const deleteEndpoint = useCallback((id: string) => {
    setConnectors(prev => prev.map(c =>
      c.id === activeConnectorId
        ? { ...c, endpoints: c.endpoints.filter(ep => ep.id !== id) }
        : c,
    ));
    if (activeEndpointId === id) setActiveEndpointId(null);
  }, [activeConnectorId, activeEndpointId]);

  const updateEndpoint = useCallback((field: keyof APIEndpoint, value: any) => {
    if (!activeEndpointId) return;
    setConnectors(prev => prev.map(c =>
      c.id === activeConnectorId
        ? {
          ...c,
          endpoints: c.endpoints.map(ep =>
            ep.id === activeEndpointId ? { ...ep, [field]: value } : ep,
          ),
        }
        : c,
    ));
  }, [activeConnectorId, activeEndpointId]);

  const sendRequest = useCallback(async () => {
    if (!activeEndpoint || !activeConnector) return;

    setIsLoading(true);
    setActiveTab('response');

    // Simulate request
    const startTime = Date.now();
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1500));
    const elapsed = Date.now() - startTime;

    const mockResponse: APIResponse = {
      status: 200,
      statusText: 'OK',
      headers: {
        'content-type': 'application/json',
        'x-request-id': crypto.randomUUID?.() ?? Math.random().toString(36),
        'x-response-time': `${elapsed}ms`,
      },
      body: JSON.stringify({
        data: [
          { id: 1, name: 'Item 1', status: 'active' },
          { id: 2, name: 'Item 2', status: 'inactive' },
          { id: 3, name: 'Item 3', status: 'active' },
        ],
        meta: { total: 3, page: 1, perPage: 10 },
      }),
      time: elapsed,
      size: 256,
    };

    setResponse(mockResponse);
    setIsLoading(false);

    // Add to history
    setHistory(prev => [
      {
        id: `hist-${Date.now()}`,
        method: activeEndpoint.method,
        url: `${activeConnector.baseUrl}${activeEndpoint.url}`,
        status: mockResponse.status,
        time: elapsed,
        timestamp: Date.now(),
      },
      ...prev.slice(0, 49),
    ]);
  }, [activeEndpoint, activeConnector]);

  return (
    <div className={clsx('flex h-full bg-[#1e1e2e]', className)}>
      {/* Left sidebar — Connectors & Endpoints */}
      <div className="flex flex-col border-r border-white/5">
        {/* Connector list */}
        <div className="p-2 border-b border-white/5 space-y-1">
          {connectors.map(conn => (
            <ConnectorCard
              key={conn.id}
              connector={conn}
              isActive={conn.id === activeConnectorId}
              onClick={() => setActiveConnectorId(conn.id)}
            />
          ))}
          <button className="w-full px-3 py-2 text-[10px] text-indigo-400/60 hover:text-indigo-400 border border-dashed border-white/10 rounded-lg hover:border-indigo-500/30">
            + Add Connector
          </button>
        </div>

        {/* Endpoint list */}
        {activeConnector && (
          <EndpointList
            endpoints={activeConnector.endpoints}
            activeEndpointId={activeEndpointId}
            onSelect={setActiveEndpointId}
            onAdd={addEndpoint}
            onDelete={deleteEndpoint}
          />
        )}
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeEndpoint ? (
          <>
            {/* URL Bar */}
            <div className="flex items-center gap-2 p-3 border-b border-white/5">
              <select
                value={activeEndpoint.method}
                onChange={(e) => updateEndpoint('method', e.target.value)}
                className={clsx(
                  'px-2 py-1.5 text-[11px] font-bold font-mono rounded border-0 focus:outline-none cursor-pointer',
                  methodColors[activeEndpoint.method],
                )}
              >
                {(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'] as HttpMethod[]).map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <input
                type="text"
                value={`${activeConnector?.baseUrl ?? ''}${activeEndpoint.url}`}
                onChange={(e) => {
                  const base = activeConnector?.baseUrl ?? '';
                  const path = e.target.value.replace(base, '');
                  updateEndpoint('url', path);
                }}
                placeholder="Enter URL..."
                className="flex-1 px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded
                           text-white placeholder-white/20 font-mono focus:outline-none focus:border-indigo-500/50"
              />
              <motion.button
                onClick={sendRequest}
                className="px-4 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-medium rounded"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send'}
              </motion.button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/5">
              {(['request', 'response', 'bindings', 'history', 'env'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={clsx(
                    'px-4 py-2 text-xs capitalize',
                    activeTab === tab
                      ? 'text-white/70 border-b-2 border-indigo-500'
                      : 'text-white/30 hover:text-white/50',
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-auto p-3">
              {activeTab === 'request' && (
                <div className="space-y-0">
                  <SectionToggle
                    label="Headers"
                    isOpen={openSections.headers}
                    onToggle={() => toggleSection('headers')}
                    count={activeEndpoint.headers.filter(h => h.enabled).length}
                  >
                    <KeyValueEditor
                      pairs={activeEndpoint.headers}
                      onChange={(h) => updateEndpoint('headers', h)}
                      keyPlaceholder="Header name"
                      valuePlaceholder="Header value"
                    />
                  </SectionToggle>

                  <SectionToggle
                    label="Query Parameters"
                    isOpen={openSections.params}
                    onToggle={() => toggleSection('params')}
                    count={activeEndpoint.params.filter(p => p.enabled).length}
                  >
                    <KeyValueEditor
                      pairs={activeEndpoint.params}
                      onChange={(p) => updateEndpoint('params', p)}
                      keyPlaceholder="Parameter"
                      valuePlaceholder="Value"
                    />
                  </SectionToggle>

                  <SectionToggle
                    label="Authorization"
                    isOpen={openSections.auth}
                    onToggle={() => toggleSection('auth')}
                  >
                    <AuthEditor
                      auth={activeEndpoint.auth}
                      onChange={(a) => updateEndpoint('auth', a)}
                    />
                  </SectionToggle>

                  <SectionToggle
                    label="Body"
                    isOpen={openSections.body}
                    onToggle={() => toggleSection('body')}
                  >
                    <BodyEditor
                      body={activeEndpoint.body}
                      onChange={(b) => updateEndpoint('body', b)}
                    />
                  </SectionToggle>
                </div>
              )}

              {activeTab === 'response' && (
                <ResponseViewer response={response} isLoading={isLoading} />
              )}

              {activeTab === 'bindings' && activeConnector && (
                <DataBindingEditor
                  bindings={activeConnector.bindings}
                  endpoints={activeConnector.endpoints}
                  onChange={(bindings) =>
                    setConnectors(prev => prev.map(c =>
                      c.id === activeConnectorId ? { ...c, bindings } : c,
                    ))
                  }
                />
              )}

              {activeTab === 'history' && (
                <RequestHistory
                  history={history}
                  onSelect={(entry) => {
                    // Navigate to the endpoint
                  }}
                />
              )}

              {activeTab === 'env' && (
                <EnvManager
                  variables={envVariables}
                  onChange={setEnvVariables}
                />
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <motion.div
                className="text-4xl mb-3"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🔗
              </motion.div>
              <p className="text-sm text-white/30">Select or create an endpoint</p>
              <p className="text-xs text-white/15 mt-1">Build and test API requests</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DataConnectorPanel;
