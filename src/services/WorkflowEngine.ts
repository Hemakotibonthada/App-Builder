// =============================================================================
// Workflow & Automation Engine - Visual workflow builder and automation system
// Features: Node-based workflows, triggers, conditions, actions, loops, scheduling
// =============================================================================

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  version: number;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  variables: WorkflowVariable[];
  triggers: WorkflowTrigger[];
  settings: WorkflowSettings;
  metadata: WorkflowMetadata;
  createdAt: number;
  updatedAt: number;
  status: WorkflowStatus;
}

export type WorkflowStatus = 'draft' | 'active' | 'paused' | 'archived' | 'error';

export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  name: string;
  description: string;
  position: { x: number; y: number };
  config: Record<string, unknown>;
  inputs: WorkflowPort[];
  outputs: WorkflowPort[];
  errorOutput?: WorkflowPort;
  metadata: Record<string, unknown>;
  enabled: boolean;
  timeout: number;
  retryConfig: RetryConfig;
}

export type WorkflowNodeType =
  | 'trigger' | 'action' | 'condition' | 'loop' | 'delay'
  | 'transform' | 'filter' | 'merge' | 'split' | 'switch'
  | 'http-request' | 'json-parse' | 'json-stringify'
  | 'variable-set' | 'variable-get' | 'variable-delete'
  | 'math' | 'string-op' | 'date-op' | 'array-op'
  | 'log' | 'debug' | 'alert' | 'notification'
  | 'data-query' | 'data-create' | 'data-update' | 'data-delete'
  | 'widget-create' | 'widget-update' | 'widget-delete' | 'widget-style'
  | 'page-create' | 'page-update' | 'page-navigate'
  | 'form-validate' | 'form-submit' | 'form-reset'
  | 'api-call' | 'api-mock'
  | 'email-send' | 'webhook-call'
  | 'script' | 'function' | 'template'
  | 'try-catch' | 'throw-error'
  | 'parallel' | 'race' | 'sequence'
  | 'map' | 'reduce' | 'forEach'
  | 'start' | 'end' | 'sub-workflow' | 'comment' | 'group';

export interface WorkflowPort {
  id: string;
  name: string;
  type: PortType;
  dataType: PortDataType;
  required: boolean;
  defaultValue?: unknown;
  description?: string;
}

export type PortType = 'input' | 'output' | 'error';
export type PortDataType = 'any' | 'string' | 'number' | 'boolean' | 'object' | 'array' | 'date' | 'null' | 'flow';

export interface WorkflowConnection {
  id: string;
  sourceNodeId: string;
  sourcePortId: string;
  targetNodeId: string;
  targetPortId: string;
  condition?: string;
  transform?: string;
  label?: string;
  animated?: boolean;
}

export interface WorkflowVariable {
  name: string;
  type: PortDataType;
  defaultValue: unknown;
  description: string;
  scope: 'global' | 'workflow' | 'local';
  persistent: boolean;
  encrypted: boolean;
}

export interface WorkflowTrigger {
  id: string;
  type: TriggerType;
  name: string;
  config: Record<string, unknown>;
  enabled: boolean;
  conditions: TriggerCondition[];
}

export type TriggerType =
  | 'manual' | 'event' | 'schedule' | 'webhook'
  | 'data-change' | 'widget-event' | 'page-load'
  | 'form-submit' | 'api-response' | 'timer'
  | 'keyboard-shortcut' | 'mouse-event' | 'scroll-event'
  | 'resize-event' | 'visibility-change' | 'network-change'
  | 'storage-change' | 'url-change' | 'custom';

export interface TriggerCondition {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'startsWith' | 'endsWith' | 'regex' | 'in' | 'notIn' | 'exists' | 'empty';
  value: unknown;
  logic: 'and' | 'or';
}

export interface WorkflowSettings {
  maxExecutionTime: number;
  maxRetries: number;
  retryDelay: number;
  logLevel: 'none' | 'error' | 'warn' | 'info' | 'debug';
  errorHandling: 'stop' | 'continue' | 'retry';
  parallelExecution: boolean;
  maxParallel: number;
  throttle: number;
  debounce: number;
  queueOverflow: 'drop' | 'replace' | 'queue';
  maxQueueSize: number;
}

export interface WorkflowMetadata {
  author: string;
  tags: string[];
  category: string;
  color: string;
  icon: string;
  notes: string;
}

export interface RetryConfig {
  enabled: boolean;
  maxAttempts: number;
  delay: number;
  backoff: 'fixed' | 'linear' | 'exponential';
  maxDelay: number;
}

// =============================================================================
// Execution Types
// =============================================================================

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: ExecutionStatus;
  startedAt: number;
  completedAt: number;
  duration: number;
  trigger: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  variables: Record<string, unknown>;
  nodeExecutions: NodeExecution[];
  logs: ExecutionLog[];
  errors: ExecutionError[];
  retryCount: number;
  parentExecutionId?: string;
}

export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'timeout' | 'paused';

export interface NodeExecution {
  nodeId: string;
  nodeName: string;
  nodeType: WorkflowNodeType;
  status: ExecutionStatus;
  startedAt: number;
  completedAt: number;
  duration: number;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  error?: string;
  retryCount: number;
  attempts: NodeAttempt[];
}

export interface NodeAttempt {
  attempt: number;
  startedAt: number;
  completedAt: number;
  success: boolean;
  error?: string;
  output?: Record<string, unknown>;
}

export interface ExecutionLog {
  timestamp: number;
  level: 'info' | 'warn' | 'error' | 'debug';
  nodeId: string;
  message: string;
  data?: unknown;
}

export interface ExecutionError {
  timestamp: number;
  nodeId: string;
  error: string;
  stack?: string;
  recoverable: boolean;
}

// =============================================================================
// Node Templates
// =============================================================================

export interface NodeTemplate {
  type: WorkflowNodeType;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  defaultConfig: Record<string, unknown>;
  configSchema: NodeConfigField[];
  inputs: WorkflowPort[];
  outputs: WorkflowPort[];
  hasErrorOutput: boolean;
  documentation: string;
  examples: NodeExample[];
}

export interface NodeConfigField {
  key: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'code' | 'json' | 'expression' | 'color' | 'file' | 'array' | 'keyvalue';
  label: string;
  description: string;
  defaultValue: unknown;
  required: boolean;
  options?: Array<{ label: string; value: unknown }>;
  placeholder?: string;
  group?: string;
  advanced?: boolean;
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  conditional?: {
    field: string;
    value: unknown;
  };
}

export interface NodeExample {
  name: string;
  description: string;
  config: Record<string, unknown>;
}

// =============================================================================
// Node Template Definitions
// =============================================================================

export const NODE_TEMPLATES: NodeTemplate[] = [
  // Triggers
  {
    type: 'trigger',
    name: 'Event Trigger',
    description: 'Start workflow when a specific event occurs',
    category: 'Triggers',
    icon: 'bolt',
    color: '#f59e0b',
    defaultConfig: { eventType: '', filter: '' },
    configSchema: [
      { key: 'eventType', type: 'select', label: 'Event Type', description: 'The event to listen for', defaultValue: '', required: true, options: [
        { label: 'Widget Created', value: 'widget.created' },
        { label: 'Widget Updated', value: 'widget.updated' },
        { label: 'Widget Deleted', value: 'widget.deleted' },
        { label: 'Widget Selected', value: 'widget.selected' },
        { label: 'Page Changed', value: 'page.switched' },
        { label: 'Project Saved', value: 'project.saved' },
        { label: 'Form Submitted', value: 'form.submitted' },
        { label: 'Button Clicked', value: 'button.clicked' },
        { label: 'Custom Event', value: 'custom' },
      ]},
      { key: 'customEvent', type: 'string', label: 'Custom Event Name', description: 'Name of custom event', defaultValue: '', required: false, conditional: { field: 'eventType', value: 'custom' } },
      { key: 'filter', type: 'expression', label: 'Filter', description: 'Optional filter expression', defaultValue: '', required: false },
    ],
    inputs: [],
    outputs: [{ id: 'out', name: 'Event Data', type: 'output', dataType: 'object', required: false }],
    hasErrorOutput: false,
    documentation: 'Triggers the workflow when the specified event occurs. Optionally filter events using expressions.',
    examples: [{ name: 'On Widget Create', description: 'Trigger when a new widget is added', config: { eventType: 'widget.created' } }],
  },
  {
    type: 'trigger',
    name: 'Schedule Trigger',
    description: 'Start workflow on a schedule',
    category: 'Triggers',
    icon: 'clock',
    color: '#f59e0b',
    defaultConfig: { schedule: '*/5 * * * *', timezone: 'UTC' },
    configSchema: [
      { key: 'schedule', type: 'string', label: 'Cron Expression', description: 'Cron expression for scheduling', defaultValue: '*/5 * * * *', required: true, placeholder: '*/5 * * * *' },
      { key: 'timezone', type: 'select', label: 'Timezone', description: 'Timezone for the schedule', defaultValue: 'UTC', required: false, options: [
        { label: 'UTC', value: 'UTC' },
        { label: 'America/New_York', value: 'America/New_York' },
        { label: 'America/Los_Angeles', value: 'America/Los_Angeles' },
        { label: 'Europe/London', value: 'Europe/London' },
        { label: 'Europe/Berlin', value: 'Europe/Berlin' },
        { label: 'Asia/Tokyo', value: 'Asia/Tokyo' },
        { label: 'Asia/Kolkata', value: 'Asia/Kolkata' },
      ]},
    ],
    inputs: [],
    outputs: [{ id: 'out', name: 'Trigger Time', type: 'output', dataType: 'date', required: false }],
    hasErrorOutput: false,
    documentation: 'Triggers the workflow according to a cron schedule. Uses standard 5-field cron syntax.',
    examples: [
      { name: 'Every 5 Minutes', description: 'Run every 5 minutes', config: { schedule: '*/5 * * * *' } },
      { name: 'Daily at Midnight', description: 'Run daily at midnight', config: { schedule: '0 0 * * *' } },
      { name: 'Weekdays 9 AM', description: 'Run on weekdays at 9 AM', config: { schedule: '0 9 * * 1-5' } },
    ],
  },

  // Actions
  {
    type: 'action',
    name: 'Custom Action',
    description: 'Execute a custom action',
    category: 'Actions',
    icon: 'play',
    color: '#3b82f6',
    defaultConfig: { actionType: '', params: {} },
    configSchema: [
      { key: 'actionType', type: 'string', label: 'Action', description: 'Action to execute', defaultValue: '', required: true },
      { key: 'params', type: 'json', label: 'Parameters', description: 'Action parameters', defaultValue: {}, required: false },
    ],
    inputs: [{ id: 'in', name: 'Input', type: 'input', dataType: 'any', required: false }],
    outputs: [{ id: 'out', name: 'Result', type: 'output', dataType: 'any', required: false }],
    hasErrorOutput: true,
    documentation: 'Executes a custom action with the given parameters.',
    examples: [],
  },
  {
    type: 'http-request',
    name: 'HTTP Request',
    description: 'Make HTTP requests to APIs',
    category: 'Actions',
    icon: 'globe',
    color: '#3b82f6',
    defaultConfig: { method: 'GET', url: '', headers: {}, body: '', responseType: 'json' },
    configSchema: [
      { key: 'method', type: 'select', label: 'Method', description: 'HTTP method', defaultValue: 'GET', required: true, options: [
        { label: 'GET', value: 'GET' }, { label: 'POST', value: 'POST' }, { label: 'PUT', value: 'PUT' },
        { label: 'PATCH', value: 'PATCH' }, { label: 'DELETE', value: 'DELETE' }, { label: 'HEAD', value: 'HEAD' },
      ]},
      { key: 'url', type: 'string', label: 'URL', description: 'Request URL', defaultValue: '', required: true, placeholder: 'https://api.example.com/data' },
      { key: 'headers', type: 'keyvalue', label: 'Headers', description: 'Request headers', defaultValue: {}, required: false },
      { key: 'body', type: 'code', label: 'Body', description: 'Request body (for POST/PUT/PATCH)', defaultValue: '', required: false },
      { key: 'responseType', type: 'select', label: 'Response Type', description: 'Expected response format', defaultValue: 'json', required: false, options: [
        { label: 'JSON', value: 'json' }, { label: 'Text', value: 'text' }, { label: 'Blob', value: 'blob' },
      ]},
      { key: 'timeout', type: 'number', label: 'Timeout (ms)', description: 'Request timeout in milliseconds', defaultValue: 30000, required: false, validation: { min: 0, max: 300000 } },
      { key: 'auth', type: 'select', label: 'Authentication', description: 'Authentication type', defaultValue: 'none', required: false, options: [
        { label: 'None', value: 'none' }, { label: 'Bearer Token', value: 'bearer' }, { label: 'Basic Auth', value: 'basic' }, { label: 'API Key', value: 'apikey' },
      ]},
    ],
    inputs: [{ id: 'in', name: 'Input', type: 'input', dataType: 'any', required: false }],
    outputs: [
      { id: 'response', name: 'Response', type: 'output', dataType: 'object', required: false },
      { id: 'status', name: 'Status', type: 'output', dataType: 'number', required: false },
    ],
    hasErrorOutput: true,
    documentation: 'Makes an HTTP request and returns the response. Supports all standard methods, authentication, and custom headers.',
    examples: [
      { name: 'GET API Data', description: 'Fetch data from a REST API', config: { method: 'GET', url: 'https://jsonplaceholder.typicode.com/posts', responseType: 'json' } },
      { name: 'POST Data', description: 'Send data to an API', config: { method: 'POST', url: 'https://api.example.com/data', headers: { 'Content-Type': 'application/json' }, body: '{"key": "value"}' } },
    ],
  },

  // Logic
  {
    type: 'condition',
    name: 'If/Else',
    description: 'Branch based on a condition',
    category: 'Logic',
    icon: 'git-branch',
    color: '#8b5cf6',
    defaultConfig: { expression: '', operator: 'eq', value: '' },
    configSchema: [
      { key: 'expression', type: 'expression', label: 'Expression', description: 'Value to evaluate', defaultValue: '', required: true },
      { key: 'operator', type: 'select', label: 'Operator', description: 'Comparison operator', defaultValue: 'eq', required: true, options: [
        { label: 'Equals', value: 'eq' }, { label: 'Not Equals', value: 'neq' },
        { label: 'Greater Than', value: 'gt' }, { label: 'Less Than', value: 'lt' },
        { label: 'Greater or Equal', value: 'gte' }, { label: 'Less or Equal', value: 'lte' },
        { label: 'Contains', value: 'contains' }, { label: 'Starts With', value: 'startsWith' },
        { label: 'Ends With', value: 'endsWith' }, { label: 'Is Empty', value: 'empty' },
        { label: 'Is Not Empty', value: 'notEmpty' }, { label: 'Is True', value: 'isTrue' },
        { label: 'Is False', value: 'isFalse' }, { label: 'Regex', value: 'regex' },
      ]},
      { key: 'value', type: 'expression', label: 'Compare Value', description: 'Value to compare against', defaultValue: '', required: false },
    ],
    inputs: [{ id: 'in', name: 'Input', type: 'input', dataType: 'any', required: true }],
    outputs: [
      { id: 'true', name: 'True', type: 'output', dataType: 'any', required: false },
      { id: 'false', name: 'False', type: 'output', dataType: 'any', required: false },
    ],
    hasErrorOutput: false,
    documentation: 'Evaluates a condition and routes the flow to the True or False output based on the result.',
    examples: [
      { name: 'Check Status', description: 'Branch on HTTP status code', config: { expression: '{{response.status}}', operator: 'eq', value: '200' } },
    ],
  },
  {
    type: 'switch',
    name: 'Switch',
    description: 'Route to different outputs based on value',
    category: 'Logic',
    icon: 'git-merge',
    color: '#8b5cf6',
    defaultConfig: { expression: '', cases: [] },
    configSchema: [
      { key: 'expression', type: 'expression', label: 'Expression', description: 'Value to switch on', defaultValue: '', required: true },
      { key: 'cases', type: 'array', label: 'Cases', description: 'Switch cases', defaultValue: [], required: true },
    ],
    inputs: [{ id: 'in', name: 'Input', type: 'input', dataType: 'any', required: true }],
    outputs: [
      { id: 'case-0', name: 'Case 1', type: 'output', dataType: 'any', required: false },
      { id: 'case-1', name: 'Case 2', type: 'output', dataType: 'any', required: false },
      { id: 'case-2', name: 'Case 3', type: 'output', dataType: 'any', required: false },
      { id: 'default', name: 'Default', type: 'output', dataType: 'any', required: false },
    ],
    hasErrorOutput: false,
    documentation: 'Routes the flow to different outputs based on matching the expression against defined cases.',
    examples: [],
  },
  {
    type: 'loop',
    name: 'Loop',
    description: 'Iterate over items or repeat N times',
    category: 'Logic',
    icon: 'repeat',
    color: '#8b5cf6',
    defaultConfig: { mode: 'forEach', items: '', count: 10, variable: 'item' },
    configSchema: [
      { key: 'mode', type: 'select', label: 'Mode', description: 'Loop mode', defaultValue: 'forEach', required: true, options: [
        { label: 'For Each', value: 'forEach' }, { label: 'While', value: 'while' },
        { label: 'Count', value: 'count' }, { label: 'Until', value: 'until' },
      ]},
      { key: 'items', type: 'expression', label: 'Items', description: 'Array to iterate', defaultValue: '', required: false },
      { key: 'count', type: 'number', label: 'Count', description: 'Number of iterations', defaultValue: 10, required: false, validation: { min: 1, max: 10000 } },
      { key: 'condition', type: 'expression', label: 'Condition', description: 'Loop condition', defaultValue: '', required: false },
      { key: 'variable', type: 'string', label: 'Variable Name', description: 'Loop variable name', defaultValue: 'item', required: false },
      { key: 'maxIterations', type: 'number', label: 'Max Iterations', description: 'Safety limit', defaultValue: 1000, required: false, validation: { min: 1, max: 100000 } },
    ],
    inputs: [{ id: 'in', name: 'Input', type: 'input', dataType: 'any', required: true }],
    outputs: [
      { id: 'item', name: 'Current Item', type: 'output', dataType: 'any', required: false },
      { id: 'done', name: 'Done', type: 'output', dataType: 'array', required: false },
    ],
    hasErrorOutput: true,
    documentation: 'Loops over items or repeats a number of times. Supports forEach, while, count, and until modes.',
    examples: [],
  },

  // Data Operations
  {
    type: 'transform',
    name: 'Transform',
    description: 'Transform data using expressions',
    category: 'Data',
    icon: 'shuffle',
    color: '#10b981',
    defaultConfig: { expression: '', outputKey: 'result' },
    configSchema: [
      { key: 'expression', type: 'code', label: 'Expression', description: 'Transformation expression/code', defaultValue: '', required: true },
      { key: 'outputKey', type: 'string', label: 'Output Key', description: 'Key name for result', defaultValue: 'result', required: false },
    ],
    inputs: [{ id: 'in', name: 'Input', type: 'input', dataType: 'any', required: true }],
    outputs: [{ id: 'out', name: 'Output', type: 'output', dataType: 'any', required: false }],
    hasErrorOutput: true,
    documentation: 'Transforms input data using a JavaScript expression or function.',
    examples: [],
  },
  {
    type: 'filter',
    name: 'Filter',
    description: 'Filter array items based on conditions',
    category: 'Data',
    icon: 'filter',
    color: '#10b981',
    defaultConfig: { expression: '', field: '', operator: 'eq', value: '' },
    configSchema: [
      { key: 'field', type: 'string', label: 'Field', description: 'Field to filter on', defaultValue: '', required: true },
      { key: 'operator', type: 'select', label: 'Operator', description: 'Filter operator', defaultValue: 'eq', required: true, options: [
        { label: 'Equals', value: 'eq' }, { label: 'Not Equals', value: 'neq' },
        { label: 'Greater Than', value: 'gt' }, { label: 'Less Than', value: 'lt' },
        { label: 'Contains', value: 'contains' }, { label: 'Exists', value: 'exists' },
      ]},
      { key: 'value', type: 'expression', label: 'Value', description: 'Filter value', defaultValue: '', required: false },
    ],
    inputs: [{ id: 'in', name: 'Input Array', type: 'input', dataType: 'array', required: true }],
    outputs: [
      { id: 'matched', name: 'Matched', type: 'output', dataType: 'array', required: false },
      { id: 'unmatched', name: 'Unmatched', type: 'output', dataType: 'array', required: false },
    ],
    hasErrorOutput: false,
    documentation: 'Filters array items and splits them into matched and unmatched outputs.',
    examples: [],
  },
  {
    type: 'merge',
    name: 'Merge',
    description: 'Merge multiple inputs into one',
    category: 'Data',
    icon: 'git-pull-request',
    color: '#10b981',
    defaultConfig: { mode: 'append', dedup: false },
    configSchema: [
      { key: 'mode', type: 'select', label: 'Merge Mode', description: 'How to merge inputs', defaultValue: 'append', required: true, options: [
        { label: 'Append', value: 'append' }, { label: 'Object Merge', value: 'merge' },
        { label: 'Wait All', value: 'waitAll' }, { label: 'Wait Any', value: 'waitAny' },
      ]},
      { key: 'dedup', type: 'boolean', label: 'Deduplicate', description: 'Remove duplicate entries', defaultValue: false, required: false },
    ],
    inputs: [
      { id: 'in1', name: 'Input 1', type: 'input', dataType: 'any', required: true },
      { id: 'in2', name: 'Input 2', type: 'input', dataType: 'any', required: false },
    ],
    outputs: [{ id: 'out', name: 'Merged', type: 'output', dataType: 'any', required: false }],
    hasErrorOutput: false,
    documentation: 'Merges multiple inputs into a single output using various strategies.',
    examples: [],
  },

  // Utilities
  {
    type: 'delay',
    name: 'Delay',
    description: 'Wait for a specified duration',
    category: 'Utilities',
    icon: 'clock',
    color: '#6b7280',
    defaultConfig: { duration: 1000, unit: 'ms' },
    configSchema: [
      { key: 'duration', type: 'number', label: 'Duration', description: 'Wait duration', defaultValue: 1000, required: true, validation: { min: 0, max: 86400000 } },
      { key: 'unit', type: 'select', label: 'Unit', description: 'Time unit', defaultValue: 'ms', required: false, options: [
        { label: 'Milliseconds', value: 'ms' }, { label: 'Seconds', value: 's' },
        { label: 'Minutes', value: 'm' }, { label: 'Hours', value: 'h' },
      ]},
    ],
    inputs: [{ id: 'in', name: 'Input', type: 'input', dataType: 'any', required: false }],
    outputs: [{ id: 'out', name: 'Output', type: 'output', dataType: 'any', required: false }],
    hasErrorOutput: false,
    documentation: 'Pauses the workflow execution for a specified duration.',
    examples: [
      { name: '1 Second Delay', description: 'Wait 1 second', config: { duration: 1000, unit: 'ms' } },
      { name: '5 Minute Delay', description: 'Wait 5 minutes', config: { duration: 5, unit: 'm' } },
    ],
  },
  {
    type: 'log',
    name: 'Log',
    description: 'Log data to console/history',
    category: 'Utilities',
    icon: 'terminal',
    color: '#6b7280',
    defaultConfig: { level: 'info', message: '', includeData: true },
    configSchema: [
      { key: 'level', type: 'select', label: 'Level', description: 'Log level', defaultValue: 'info', required: true, options: [
        { label: 'Info', value: 'info' }, { label: 'Warning', value: 'warn' },
        { label: 'Error', value: 'error' }, { label: 'Debug', value: 'debug' },
      ]},
      { key: 'message', type: 'expression', label: 'Message', description: 'Log message', defaultValue: '', required: true },
      { key: 'includeData', type: 'boolean', label: 'Include Data', description: 'Include input data in log', defaultValue: true, required: false },
    ],
    inputs: [{ id: 'in', name: 'Input', type: 'input', dataType: 'any', required: false }],
    outputs: [{ id: 'out', name: 'Pass Through', type: 'output', dataType: 'any', required: false }],
    hasErrorOutput: false,
    documentation: 'Logs a message and optionally the input data. The input is passed through to the output unchanged.',
    examples: [],
  },
  {
    type: 'notification',
    name: 'Show Notification',
    description: 'Display a notification to the user',
    category: 'Utilities',
    icon: 'bell',
    color: '#6b7280',
    defaultConfig: { message: '', type: 'info', duration: 5000 },
    configSchema: [
      { key: 'message', type: 'expression', label: 'Message', description: 'Notification message', defaultValue: '', required: true },
      { key: 'type', type: 'select', label: 'Type', description: 'Notification type', defaultValue: 'info', required: false, options: [
        { label: 'Info', value: 'info' }, { label: 'Success', value: 'success' },
        { label: 'Warning', value: 'warning' }, { label: 'Error', value: 'error' },
      ]},
      { key: 'duration', type: 'number', label: 'Duration (ms)', description: 'Auto-dismiss duration', defaultValue: 5000, required: false },
    ],
    inputs: [{ id: 'in', name: 'Input', type: 'input', dataType: 'any', required: false }],
    outputs: [{ id: 'out', name: 'Pass Through', type: 'output', dataType: 'any', required: false }],
    hasErrorOutput: false,
    documentation: 'Shows a notification toast to the user.',
    examples: [],
  },

  // Error Handling
  {
    type: 'try-catch',
    name: 'Try/Catch',
    description: 'Handle errors gracefully',
    category: 'Error Handling',
    icon: 'shield',
    color: '#ef4444',
    defaultConfig: { fallbackValue: null, logErrors: true },
    configSchema: [
      { key: 'fallbackValue', type: 'json', label: 'Fallback Value', description: 'Value to use if error occurs', defaultValue: null, required: false },
      { key: 'logErrors', type: 'boolean', label: 'Log Errors', description: 'Log errors to console', defaultValue: true, required: false },
    ],
    inputs: [{ id: 'in', name: 'Input', type: 'input', dataType: 'any', required: true }],
    outputs: [
      { id: 'success', name: 'Success', type: 'output', dataType: 'any', required: false },
      { id: 'error', name: 'Error', type: 'output', dataType: 'object', required: false },
    ],
    hasErrorOutput: false,
    documentation: 'Wraps execution in a try/catch block. Errors are routed to the error output instead of stopping the workflow.',
    examples: [],
  },

  // Variables
  {
    type: 'variable-set',
    name: 'Set Variable',
    description: 'Store a value in a variable',
    category: 'Variables',
    icon: 'box',
    color: '#ec4899',
    defaultConfig: { name: '', value: '', scope: 'workflow' },
    configSchema: [
      { key: 'name', type: 'string', label: 'Variable Name', description: 'Name of the variable', defaultValue: '', required: true },
      { key: 'value', type: 'expression', label: 'Value', description: 'Value to store', defaultValue: '', required: true },
      { key: 'scope', type: 'select', label: 'Scope', description: 'Variable scope', defaultValue: 'workflow', required: false, options: [
        { label: 'Global', value: 'global' }, { label: 'Workflow', value: 'workflow' }, { label: 'Local', value: 'local' },
      ]},
    ],
    inputs: [{ id: 'in', name: 'Input', type: 'input', dataType: 'any', required: false }],
    outputs: [{ id: 'out', name: 'Pass Through', type: 'output', dataType: 'any', required: false }],
    hasErrorOutput: false,
    documentation: 'Stores a value in a named variable that can be read by other nodes.',
    examples: [],
  },
  {
    type: 'variable-get',
    name: 'Get Variable',
    description: 'Read a value from a variable',
    category: 'Variables',
    icon: 'external-link',
    color: '#ec4899',
    defaultConfig: { name: '', defaultValue: null },
    configSchema: [
      { key: 'name', type: 'string', label: 'Variable Name', description: 'Name of the variable to read', defaultValue: '', required: true },
      { key: 'defaultValue', type: 'expression', label: 'Default', description: 'Default value if not set', defaultValue: '', required: false },
    ],
    inputs: [{ id: 'in', name: 'Trigger', type: 'input', dataType: 'flow', required: false }],
    outputs: [{ id: 'out', name: 'Value', type: 'output', dataType: 'any', required: false }],
    hasErrorOutput: false,
    documentation: 'Reads the current value of a named variable.',
    examples: [],
  },

  // Script
  {
    type: 'script',
    name: 'JavaScript',
    description: 'Execute custom JavaScript code',
    category: 'Advanced',
    icon: 'code',
    color: '#f97316',
    defaultConfig: { code: '// input is available as `data`\nreturn data;' },
    configSchema: [
      { key: 'code', type: 'code', label: 'Code', description: 'JavaScript code to execute', defaultValue: '// input is available as `data`\nreturn data;', required: true },
    ],
    inputs: [{ id: 'in', name: 'Input', type: 'input', dataType: 'any', required: false }],
    outputs: [{ id: 'out', name: 'Output', type: 'output', dataType: 'any', required: false }],
    hasErrorOutput: true,
    documentation: 'Executes custom JavaScript code. The input data is available as `data`. Return the output value.',
    examples: [
      { name: 'Map Array', description: 'Transform array items', config: { code: 'return data.map(item => ({ ...item, processed: true }));' } },
      { name: 'Calculate', description: 'Perform calculation', config: { code: 'return { sum: data.a + data.b, product: data.a * data.b };' } },
    ],
  },

  // Widget Operations
  {
    type: 'widget-create',
    name: 'Create Widget',
    description: 'Add a new widget to the canvas',
    category: 'Builder',
    icon: 'plus-square',
    color: '#06b6d4',
    defaultConfig: { widgetType: 'Text', props: {}, style: {} },
    configSchema: [
      { key: 'widgetType', type: 'select', label: 'Widget Type', description: 'Type of widget to create', defaultValue: 'Text', required: true, options: [
        { label: 'Text', value: 'Text' }, { label: 'Button', value: 'Button' }, { label: 'Image', value: 'Image' },
        { label: 'Container', value: 'Container' }, { label: 'Heading', value: 'Heading' }, { label: 'Link', value: 'Link' },
        { label: 'Input', value: 'TextInput' }, { label: 'Checkbox', value: 'Checkbox' }, { label: 'Dropdown', value: 'Dropdown' },
      ]},
      { key: 'position', type: 'json', label: 'Position', description: 'Widget position {x, y}', defaultValue: { x: 100, y: 100 }, required: false },
      { key: 'props', type: 'json', label: 'Props', description: 'Widget properties', defaultValue: {}, required: false },
      { key: 'style', type: 'json', label: 'Style', description: 'Widget styles', defaultValue: {}, required: false },
    ],
    inputs: [{ id: 'in', name: 'Input', type: 'input', dataType: 'any', required: false }],
    outputs: [{ id: 'widget', name: 'Widget ID', type: 'output', dataType: 'string', required: false }],
    hasErrorOutput: true,
    documentation: 'Creates a new widget on the canvas with the specified type, position, props, and style.',
    examples: [],
  },
  {
    type: 'widget-update',
    name: 'Update Widget',
    description: 'Update widget properties or style',
    category: 'Builder',
    icon: 'edit',
    color: '#06b6d4',
    defaultConfig: { widgetId: '', updates: {} },
    configSchema: [
      { key: 'widgetId', type: 'expression', label: 'Widget ID', description: 'ID of widget to update', defaultValue: '', required: true },
      { key: 'updates', type: 'json', label: 'Updates', description: 'Properties to update', defaultValue: {}, required: true },
      { key: 'target', type: 'select', label: 'Target', description: 'What to update', defaultValue: 'props', required: false, options: [
        { label: 'Props', value: 'props' }, { label: 'Style', value: 'style' }, { label: 'Both', value: 'both' },
      ]},
    ],
    inputs: [{ id: 'in', name: 'Input', type: 'input', dataType: 'any', required: false }],
    outputs: [{ id: 'out', name: 'Updated Widget', type: 'output', dataType: 'object', required: false }],
    hasErrorOutput: true,
    documentation: 'Updates the properties or style of an existing widget.',
    examples: [],
  },
];

// =============================================================================
// Workflow Engine
// =============================================================================

export class WorkflowEngine {
  private workflows: Map<string, WorkflowDefinition> = new Map();
  private executions: Map<string, WorkflowExecution> = new Map();
  private activeExecutions: Set<string> = new Set();
  private listeners: Map<string, Array<(event: WorkflowEvent) => void>> = new Map();
  private globalVariables: Map<string, unknown> = new Map();
  private maxConcurrent = 10;
  private executionQueue: Array<{ workflowId: string; input: Record<string, unknown> }> = [];

  // ---------------------------------------------------------------------------
  // Workflow CRUD
  // ---------------------------------------------------------------------------

  createWorkflow(config: Partial<WorkflowDefinition>): WorkflowDefinition {
    const id = `wf_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 6)}`;
    const now = Date.now();

    const workflow: WorkflowDefinition = {
      id,
      name: config.name || 'Untitled Workflow',
      description: config.description || '',
      version: 1,
      nodes: config.nodes || [],
      connections: config.connections || [],
      variables: config.variables || [],
      triggers: config.triggers || [],
      settings: {
        maxExecutionTime: 60000,
        maxRetries: 3,
        retryDelay: 1000,
        logLevel: 'info',
        errorHandling: 'stop',
        parallelExecution: false,
        maxParallel: 5,
        throttle: 0,
        debounce: 0,
        queueOverflow: 'queue',
        maxQueueSize: 100,
        ...config.settings,
      },
      metadata: {
        author: 'user',
        tags: [],
        category: 'general',
        color: '#3b82f6',
        icon: 'zap',
        notes: '',
        ...config.metadata,
      },
      createdAt: now,
      updatedAt: now,
      status: 'draft',
    };

    this.workflows.set(id, workflow);
    this.emit('workflow:created', { workflowId: id });
    return workflow;
  }

  updateWorkflow(id: string, updates: Partial<WorkflowDefinition>): WorkflowDefinition | null {
    const workflow = this.workflows.get(id);
    if (!workflow) return null;

    Object.assign(workflow, updates, {
      updatedAt: Date.now(),
      version: workflow.version + 1,
    });

    this.emit('workflow:updated', { workflowId: id });
    return workflow;
  }

  deleteWorkflow(id: string): boolean {
    if (!this.workflows.has(id)) return false;
    
    // Cancel active executions
    for (const [execId, exec] of this.executions.entries()) {
      if (exec.workflowId === id && exec.status === 'running') {
        this.cancelExecution(execId);
      }
    }

    this.workflows.delete(id);
    this.emit('workflow:deleted', { workflowId: id });
    return true;
  }

  getWorkflow(id: string): WorkflowDefinition | undefined {
    return this.workflows.get(id);
  }

  listWorkflows(filter?: { status?: WorkflowStatus; category?: string }): WorkflowDefinition[] {
    let workflows = Array.from(this.workflows.values());
    if (filter?.status) workflows = workflows.filter(w => w.status === filter.status);
    if (filter?.category) workflows = workflows.filter(w => w.metadata.category === filter.category);
    return workflows;
  }

  duplicateWorkflow(id: string): WorkflowDefinition | null {
    const original = this.workflows.get(id);
    if (!original) return null;

    return this.createWorkflow({
      ...original,
      name: `${original.name} (Copy)`,
      status: 'draft',
    });
  }

  // ---------------------------------------------------------------------------
  // Node Management
  // ---------------------------------------------------------------------------

  addNode(workflowId: string, node: WorkflowNode): boolean {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return false;

    workflow.nodes.push(node);
    workflow.updatedAt = Date.now();
    return true;
  }

  removeNode(workflowId: string, nodeId: string): boolean {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return false;

    workflow.nodes = workflow.nodes.filter(n => n.id !== nodeId);
    workflow.connections = workflow.connections.filter(
      c => c.sourceNodeId !== nodeId && c.targetNodeId !== nodeId
    );
    workflow.updatedAt = Date.now();
    return true;
  }

  updateNode(workflowId: string, nodeId: string, updates: Partial<WorkflowNode>): boolean {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return false;

    const node = workflow.nodes.find(n => n.id === nodeId);
    if (!node) return false;

    Object.assign(node, updates);
    workflow.updatedAt = Date.now();
    return true;
  }

  // ---------------------------------------------------------------------------  
  // Connection Management
  // ---------------------------------------------------------------------------

  addConnection(workflowId: string, connection: WorkflowConnection): boolean {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return false;

    // Validate connection
    const sourceNode = workflow.nodes.find(n => n.id === connection.sourceNodeId);
    const targetNode = workflow.nodes.find(n => n.id === connection.targetNodeId);
    if (!sourceNode || !targetNode) return false;

    // Check for circular dependencies
    if (this.wouldCreateCycle(workflow, connection)) {
      console.warn('Connection would create a cycle');
      return false;
    }

    // Check for duplicate connections
    const exists = workflow.connections.some(
      c => c.sourceNodeId === connection.sourceNodeId &&
           c.sourcePortId === connection.sourcePortId &&
           c.targetNodeId === connection.targetNodeId &&
           c.targetPortId === connection.targetPortId
    );
    if (exists) return false;

    workflow.connections.push(connection);
    workflow.updatedAt = Date.now();
    return true;
  }

  removeConnection(workflowId: string, connectionId: string): boolean {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return false;

    workflow.connections = workflow.connections.filter(c => c.id !== connectionId);
    workflow.updatedAt = Date.now();
    return true;
  }

  // ---------------------------------------------------------------------------
  // Execution
  // ---------------------------------------------------------------------------

  async executeWorkflow(workflowId: string, input: Record<string, unknown> = {}): Promise<WorkflowExecution> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) throw new Error(`Workflow "${workflowId}" not found`);

    if (this.activeExecutions.size >= this.maxConcurrent) {
      if (workflow.settings.queueOverflow === 'queue' && this.executionQueue.length < workflow.settings.maxQueueSize) {
        this.executionQueue.push({ workflowId, input });
        throw new Error('Execution queued - max concurrent reached');
      }
      throw new Error('Max concurrent executions reached');
    }

    const execId = `exec_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 6)}`;
    const now = Date.now();

    const execution: WorkflowExecution = {
      id: execId,
      workflowId,
      status: 'running',
      startedAt: now,
      completedAt: 0,
      duration: 0,
      trigger: 'manual',
      input,
      output: {},
      variables: {},
      nodeExecutions: [],
      logs: [],
      errors: [],
      retryCount: 0,
    };

    this.executions.set(execId, execution);
    this.activeExecutions.add(execId);
    this.emit('execution:started', { executionId: execId, workflowId });

    try {
      // Initialize variables
      const variables: Record<string, unknown> = { ...input };
      for (const v of workflow.variables) {
        if (variables[v.name] === undefined) {
          variables[v.name] = v.defaultValue;
        }
      }
      execution.variables = variables;

      // Find start nodes (nodes with no incoming connections)
      const startNodes = this.findStartNodes(workflow);

      // Execute workflow
      for (const node of startNodes) {
        await this.executeNode(workflow, node, execution, variables, input);
      }

      execution.status = 'completed';
    } catch (e) {
      execution.status = 'failed';
      execution.errors.push({
        timestamp: Date.now(),
        nodeId: '',
        error: String(e),
        recoverable: false,
      });
    }

    execution.completedAt = Date.now();
    execution.duration = execution.completedAt - execution.startedAt;
    this.activeExecutions.delete(execId);

    this.emit('execution:completed', {
      executionId: execId,
      workflowId,
      status: execution.status,
      duration: execution.duration,
    });

    return execution;
  }

  cancelExecution(executionId: string): boolean {
    const execution = this.executions.get(executionId);
    if (!execution || execution.status !== 'running') return false;

    execution.status = 'cancelled';
    execution.completedAt = Date.now();
    execution.duration = execution.completedAt - execution.startedAt;
    this.activeExecutions.delete(executionId);

    this.emit('execution:cancelled', { executionId });
    return true;
  }

  getExecution(id: string): WorkflowExecution | undefined {
    return this.executions.get(id);
  }

  getExecutionHistory(workflowId?: string, limit = 50): WorkflowExecution[] {
    let executions = Array.from(this.executions.values());
    if (workflowId) {
      executions = executions.filter(e => e.workflowId === workflowId);
    }
    return executions
      .sort((a, b) => b.startedAt - a.startedAt)
      .slice(0, limit);
  }

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------

  validateWorkflow(workflowId: string): WorkflowValidationResult {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return { valid: false, errors: ['Workflow not found'], warnings: [] };

    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for start nodes
    const startNodes = this.findStartNodes(workflow);
    if (startNodes.length === 0) {
      errors.push('Workflow has no start nodes (nodes without incoming connections)');
    }

    // Check for disconnected nodes
    const connectedNodeIds = new Set<string>();
    for (const conn of workflow.connections) {
      connectedNodeIds.add(conn.sourceNodeId);
      connectedNodeIds.add(conn.targetNodeId);
    }
    for (const node of workflow.nodes) {
      if (!connectedNodeIds.has(node.id) && workflow.nodes.length > 1) {
        warnings.push(`Node "${node.name}" (${node.id}) is disconnected`);
      }
    }

    // Check for cycles
    if (this.hasCycles(workflow)) {
      errors.push('Workflow contains circular dependencies');
    }

    // Check required port connections
    for (const node of workflow.nodes) {
      for (const input of node.inputs) {
        if (input.required) {
          const hasConnection = workflow.connections.some(
            c => c.targetNodeId === node.id && c.targetPortId === input.id
          );
          if (!hasConnection) {
            errors.push(`Required input "${input.name}" on node "${node.name}" is not connected`);
          }
        }
      }
    }

    // Check node configurations
    for (const node of workflow.nodes) {
      const template = NODE_TEMPLATES.find(t => t.type === node.type);
      if (template) {
        for (const field of template.configSchema) {
          if (field.required && !node.config[field.key]) {
            errors.push(`Required field "${field.label}" on node "${node.name}" is empty`);
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // ---------------------------------------------------------------------------
  // Export / Import
  // ---------------------------------------------------------------------------

  exportWorkflow(id: string): string {
    const workflow = this.workflows.get(id);
    if (!workflow) throw new Error(`Workflow "${id}" not found`);
    return JSON.stringify(workflow, null, 2);
  }

  importWorkflow(data: string): WorkflowDefinition {
    const parsed = JSON.parse(data) as WorkflowDefinition;
    const newId = `wf_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 6)}`;
    parsed.id = newId;
    parsed.createdAt = Date.now();
    parsed.updatedAt = Date.now();
    this.workflows.set(newId, parsed);
    return parsed;
  }

  // ---------------------------------------------------------------------------
  // Events
  // ---------------------------------------------------------------------------

  on(event: string, handler: (data: WorkflowEvent) => void): () => void {
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
  // Stats
  // ---------------------------------------------------------------------------

  getStats(): WorkflowStats {
    const workflows = Array.from(this.workflows.values());
    const executions = Array.from(this.executions.values());

    return {
      totalWorkflows: workflows.length,
      activeWorkflows: workflows.filter(w => w.status === 'active').length,
      totalExecutions: executions.length,
      activeExecutions: this.activeExecutions.size,
      successfulExecutions: executions.filter(e => e.status === 'completed').length,
      failedExecutions: executions.filter(e => e.status === 'failed').length,
      averageDuration: executions.length > 0
        ? executions.reduce((sum, e) => sum + e.duration, 0) / executions.length
        : 0,
      queueSize: this.executionQueue.length,
    };
  }

  // ---------------------------------------------------------------------------
  // Private Methods
  // ---------------------------------------------------------------------------

  private async executeNode(
    workflow: WorkflowDefinition,
    node: WorkflowNode,
    execution: WorkflowExecution,
    variables: Record<string, unknown>,
    input: Record<string, unknown>
  ): Promise<unknown> {
    if (!node.enabled) return null;
    if (execution.status === 'cancelled') return null;

    const nodeExec: NodeExecution = {
      nodeId: node.id,
      nodeName: node.name,
      nodeType: node.type,
      status: 'running',
      startedAt: Date.now(),
      completedAt: 0,
      duration: 0,
      input,
      output: {},
      retryCount: 0,
      attempts: [],
    };

    execution.nodeExecutions.push(nodeExec);

    try {
      const result = await this.processNode(node, input, variables, execution);
      nodeExec.output = typeof result === 'object' && result !== null ? result as Record<string, unknown> : { value: result };
      nodeExec.status = 'completed';
      nodeExec.completedAt = Date.now();
      nodeExec.duration = nodeExec.completedAt - nodeExec.startedAt;

      // Execute connected nodes
      const outgoingConnections = workflow.connections.filter(c => c.sourceNodeId === node.id);
      for (const conn of outgoingConnections) {
        const targetNode = workflow.nodes.find(n => n.id === conn.targetNodeId);
        if (targetNode) {
          const outputData = nodeExec.output;
          await this.executeNode(workflow, targetNode, execution, variables, outputData);
        }
      }

      return result;
    } catch (e) {
      nodeExec.status = 'failed';
      nodeExec.error = String(e);
      nodeExec.completedAt = Date.now();
      nodeExec.duration = nodeExec.completedAt - nodeExec.startedAt;

      execution.errors.push({
        timestamp: Date.now(),
        nodeId: node.id,
        error: String(e),
        recoverable: node.retryConfig.enabled,
      });

      if (workflow.settings.errorHandling === 'stop') {
        throw e;
      }

      return null;
    }
  }

  private async processNode(
    node: WorkflowNode,
    input: Record<string, unknown>,
    variables: Record<string, unknown>,
    execution: WorkflowExecution
  ): Promise<unknown> {
    switch (node.type) {
      case 'delay': {
        const duration = (node.config.duration as number) || 0;
        const unit = (node.config.unit as string) || 'ms';
        const ms = unit === 's' ? duration * 1000 : unit === 'm' ? duration * 60000 : unit === 'h' ? duration * 3600000 : duration;
        await new Promise(resolve => setTimeout(resolve, ms));
        return input;
      }

      case 'log': {
        const level = (node.config.level as string) || 'info';
        const message = String(node.config.message || '');
        execution.logs.push({
          timestamp: Date.now(),
          level: level as ExecutionLog['level'],
          nodeId: node.id,
          message,
          data: node.config.includeData ? input : undefined,
        });
        return input;
      }

      case 'variable-set': {
        const name = String(node.config.name || '');
        const value = node.config.value;
        variables[name] = value;
        return input;
      }

      case 'variable-get': {
        const name = String(node.config.name || '');
        return variables[name] ?? node.config.defaultValue ?? null;
      }

      case 'condition': {
        const expression = node.config.expression;
        const operator = String(node.config.operator || 'eq');
        const compareValue = node.config.value;
        const result = this.evaluateCondition(expression, operator, compareValue);
        return { ...input, _conditionResult: result };
      }

      case 'transform': {
        const code = String(node.config.expression || 'return data;');
        try {
          const fn = new Function('data', 'variables', code);
          return fn(input, variables);
        } catch (e) {
          throw new Error(`Transform error: ${e}`);
        }
      }

      case 'notification': {
        // This would integrate with the notification system
        return { sent: true, message: node.config.message, type: node.config.type };
      }

      case 'script': {
        const code = String(node.config.code || 'return data;');
        try {
          const fn = new Function('data', 'variables', code);
          return fn(input, variables);
        } catch (e) {
          throw new Error(`Script error: ${e}`);
        }
      }

      default:
        return input;
    }
  }

  private evaluateCondition(value: unknown, operator: string, compareValue: unknown): boolean {
    switch (operator) {
      case 'eq': return value === compareValue;
      case 'neq': return value !== compareValue;
      case 'gt': return (value as number) > (compareValue as number);
      case 'lt': return (value as number) < (compareValue as number);
      case 'gte': return (value as number) >= (compareValue as number);
      case 'lte': return (value as number) <= (compareValue as number);
      case 'contains': return String(value).includes(String(compareValue));
      case 'startsWith': return String(value).startsWith(String(compareValue));
      case 'endsWith': return String(value).endsWith(String(compareValue));
      case 'empty': return !value || (typeof value === 'string' && value.length === 0);
      case 'notEmpty': return !!value && (typeof value !== 'string' || value.length > 0);
      case 'isTrue': return value === true || value === 'true' || value === 1;
      case 'isFalse': return value === false || value === 'false' || value === 0;
      case 'regex': try { return new RegExp(String(compareValue)).test(String(value)); } catch { return false; }
      default: return false;
    }
  }

  private findStartNodes(workflow: WorkflowDefinition): WorkflowNode[] {
    const targetNodeIds = new Set(workflow.connections.map(c => c.targetNodeId));
    return workflow.nodes.filter(n => !targetNodeIds.has(n.id));
  }

  private wouldCreateCycle(workflow: WorkflowDefinition, newConnection: WorkflowConnection): boolean {
    // Simple DFS cycle detection
    const adjacency = new Map<string, string[]>();
    for (const conn of [...workflow.connections, newConnection]) {
      if (!adjacency.has(conn.sourceNodeId)) {
        adjacency.set(conn.sourceNodeId, []);
      }
      adjacency.get(conn.sourceNodeId)!.push(conn.targetNodeId);
    }

    const visited = new Set<string>();
    const stack = new Set<string>();

    const dfs = (nodeId: string): boolean => {
      visited.add(nodeId);
      stack.add(nodeId);

      for (const neighbor of (adjacency.get(nodeId) || [])) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) return true;
        } else if (stack.has(neighbor)) {
          return true;
        }
      }

      stack.delete(nodeId);
      return false;
    };

    for (const node of workflow.nodes) {
      if (!visited.has(node.id)) {
        if (dfs(node.id)) return true;
      }
    }

    return false;
  }

  private hasCycles(workflow: WorkflowDefinition): boolean {
    const dummyConn: WorkflowConnection = {
      id: '__check__',
      sourceNodeId: '__none__',
      sourcePortId: '',
      targetNodeId: '__none__',
      targetPortId: '',
    };
    return this.wouldCreateCycle({
      ...workflow,
      connections: workflow.connections,
      nodes: [...workflow.nodes, {
        id: '__none__',
        type: 'comment',
        name: '',
        description: '',
        position: { x: 0, y: 0 },
        config: {},
        inputs: [],
        outputs: [],
        metadata: {},
        enabled: false,
        timeout: 0,
        retryConfig: { enabled: false, maxAttempts: 0, delay: 0, backoff: 'fixed', maxDelay: 0 },
      }],
    }, dummyConn);
  }

  private emit(event: string, data: unknown): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(data as WorkflowEvent);
        } catch (e) {
          console.error(`Workflow event error (${event}):`, e);
        }
      }
    }
  }
}

// =============================================================================
// Types
// =============================================================================

export interface WorkflowEvent {
  [key: string]: unknown;
}

export interface WorkflowValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface WorkflowStats {
  totalWorkflows: number;
  activeWorkflows: number;
  totalExecutions: number;
  activeExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageDuration: number;
  queueSize: number;
}

// =============================================================================
// Workflow Templates
// =============================================================================

export const WORKFLOW_TEMPLATES: Array<{
  name: string;
  description: string;
  category: string;
  icon: string;
  workflow: Partial<WorkflowDefinition>;
}> = [
  {
    name: 'Form to API',
    description: 'Submit form data to an API endpoint',
    category: 'Forms',
    icon: 'send',
    workflow: {
      name: 'Form to API',
      nodes: [
        { id: 'trigger', type: 'trigger', name: 'Form Submit', description: 'Triggered on form submission', position: { x: 100, y: 100 }, config: { eventType: 'form.submitted' }, inputs: [], outputs: [{ id: 'out', name: 'Form Data', type: 'output', dataType: 'object', required: false }], metadata: {}, enabled: true, timeout: 0, retryConfig: { enabled: false, maxAttempts: 0, delay: 0, backoff: 'fixed', maxDelay: 0 } },
        { id: 'validate', type: 'form-validate', name: 'Validate', description: 'Validate form data', position: { x: 300, y: 100 }, config: {}, inputs: [{ id: 'in', name: 'Data', type: 'input', dataType: 'object', required: true }], outputs: [{ id: 'valid', name: 'Valid', type: 'output', dataType: 'object', required: false }, { id: 'invalid', name: 'Invalid', type: 'output', dataType: 'object', required: false }], metadata: {}, enabled: true, timeout: 0, retryConfig: { enabled: false, maxAttempts: 0, delay: 0, backoff: 'fixed', maxDelay: 0 } },
        { id: 'request', type: 'http-request', name: 'API Call', description: 'Send data to API', position: { x: 500, y: 50 }, config: { method: 'POST', url: '', headers: { 'Content-Type': 'application/json' } }, inputs: [{ id: 'in', name: 'Data', type: 'input', dataType: 'object', required: true }], outputs: [{ id: 'response', name: 'Response', type: 'output', dataType: 'object', required: false }], metadata: {}, enabled: true, timeout: 30000, retryConfig: { enabled: true, maxAttempts: 3, delay: 1000, backoff: 'exponential', maxDelay: 10000 } },
        { id: 'notify', type: 'notification', name: 'Success', description: 'Show success notification', position: { x: 700, y: 50 }, config: { message: 'Form submitted successfully!', type: 'success' }, inputs: [{ id: 'in', name: 'Input', type: 'input', dataType: 'any', required: false }], outputs: [], metadata: {}, enabled: true, timeout: 0, retryConfig: { enabled: false, maxAttempts: 0, delay: 0, backoff: 'fixed', maxDelay: 0 } },
      ],
      connections: [
        { id: 'c1', sourceNodeId: 'trigger', sourcePortId: 'out', targetNodeId: 'validate', targetPortId: 'in' },
        { id: 'c2', sourceNodeId: 'validate', sourcePortId: 'valid', targetNodeId: 'request', targetPortId: 'in' },
        { id: 'c3', sourceNodeId: 'request', sourcePortId: 'response', targetNodeId: 'notify', targetPortId: 'in' },
      ],
    },
  },
  {
    name: 'Auto-Save',
    description: 'Automatically save project at regular intervals',
    category: 'Utility',
    icon: 'save',
    workflow: {
      name: 'Auto-Save',
      triggers: [{ id: 't1', type: 'schedule', name: 'Every 5 minutes', config: { interval: 300000 }, enabled: true, conditions: [] }],
      nodes: [
        { id: 'trigger', type: 'trigger', name: 'Timer', description: 'Every 5 minutes', position: { x: 100, y: 100 }, config: { eventType: 'timer', interval: 300000 }, inputs: [], outputs: [{ id: 'out', name: 'Tick', type: 'output', dataType: 'date', required: false }], metadata: {}, enabled: true, timeout: 0, retryConfig: { enabled: false, maxAttempts: 0, delay: 0, backoff: 'fixed', maxDelay: 0 } },
        { id: 'save', type: 'action', name: 'Save Project', description: 'Save the current project', position: { x: 300, y: 100 }, config: { actionType: 'project.save' }, inputs: [{ id: 'in', name: 'Trigger', type: 'input', dataType: 'any', required: false }], outputs: [{ id: 'out', name: 'Result', type: 'output', dataType: 'object', required: false }], metadata: {}, enabled: true, timeout: 0, retryConfig: { enabled: false, maxAttempts: 0, delay: 0, backoff: 'fixed', maxDelay: 0 } },
        { id: 'log', type: 'log', name: 'Log', description: 'Log save event', position: { x: 500, y: 100 }, config: { level: 'info', message: 'Project auto-saved', includeData: false }, inputs: [{ id: 'in', name: 'Input', type: 'input', dataType: 'any', required: false }], outputs: [], metadata: {}, enabled: true, timeout: 0, retryConfig: { enabled: false, maxAttempts: 0, delay: 0, backoff: 'fixed', maxDelay: 0 } },
      ],
      connections: [
        { id: 'c1', sourceNodeId: 'trigger', sourcePortId: 'out', targetNodeId: 'save', targetPortId: 'in' },
        { id: 'c2', sourceNodeId: 'save', sourcePortId: 'out', targetNodeId: 'log', targetPortId: 'in' },
      ],
    },
  },
  {
    name: 'Data Sync',
    description: 'Fetch data from API and update widgets',
    category: 'Data',
    icon: 'refresh-cw',
    workflow: {
      name: 'Data Sync',
      nodes: [
        { id: 'trigger', type: 'trigger', name: 'On Load', description: 'Triggered on page load', position: { x: 100, y: 100 }, config: { eventType: 'page.loaded' }, inputs: [], outputs: [{ id: 'out', name: 'Event', type: 'output', dataType: 'object', required: false }], metadata: {}, enabled: true, timeout: 0, retryConfig: { enabled: false, maxAttempts: 0, delay: 0, backoff: 'fixed', maxDelay: 0 } },
        { id: 'fetch', type: 'http-request', name: 'Fetch Data', description: 'Get data from API', position: { x: 300, y: 100 }, config: { method: 'GET', url: 'https://api.example.com/data', responseType: 'json' }, inputs: [{ id: 'in', name: 'Input', type: 'input', dataType: 'any', required: false }], outputs: [{ id: 'response', name: 'Data', type: 'output', dataType: 'object', required: false }], metadata: {}, enabled: true, timeout: 30000, retryConfig: { enabled: true, maxAttempts: 3, delay: 1000, backoff: 'exponential', maxDelay: 10000 } },
        { id: 'transform', type: 'transform', name: 'Transform', description: 'Transform API response', position: { x: 500, y: 100 }, config: { expression: 'return data.response.items || [];' }, inputs: [{ id: 'in', name: 'Data', type: 'input', dataType: 'any', required: true }], outputs: [{ id: 'out', name: 'Items', type: 'output', dataType: 'array', required: false }], metadata: {}, enabled: true, timeout: 0, retryConfig: { enabled: false, maxAttempts: 0, delay: 0, backoff: 'fixed', maxDelay: 0 } },
        { id: 'update', type: 'variable-set', name: 'Store Data', description: 'Store in variable', position: { x: 700, y: 100 }, config: { name: 'apiData', value: '{{input}}', scope: 'global' }, inputs: [{ id: 'in', name: 'Data', type: 'input', dataType: 'any', required: false }], outputs: [], metadata: {}, enabled: true, timeout: 0, retryConfig: { enabled: false, maxAttempts: 0, delay: 0, backoff: 'fixed', maxDelay: 0 } },
      ],
      connections: [
        { id: 'c1', sourceNodeId: 'trigger', sourcePortId: 'out', targetNodeId: 'fetch', targetPortId: 'in' },
        { id: 'c2', sourceNodeId: 'fetch', sourcePortId: 'response', targetNodeId: 'transform', targetPortId: 'in' },
        { id: 'c3', sourceNodeId: 'transform', sourcePortId: 'out', targetNodeId: 'update', targetPortId: 'in' },
      ],
    },
  },
];

// =============================================================================
// Singleton Instance
// =============================================================================

export const workflowEngine = new WorkflowEngine();
