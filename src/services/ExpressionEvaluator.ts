/**
 * Expression Evaluator
 * 
 * Safe expression evaluation for data binding and computed values.
 * Features:
 * - Math operations
 * - String manipulation
 * - Conditional logic
 * - Variable references
 * - Date/time functions  
 * - Array operations
 * - Template literals
 * - No eval() - safe parsing
 */

/* ──────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────── */

export type ExpressionContext = Record<string, unknown>;

export interface ExpressionResult {
  value: unknown;
  type: string;
  error: string | null;
}

/* ──────────────────────────────────────────────
 * Safe Expression Evaluator
 * ────────────────────────────────────────────── */

export function evaluateExpression(expr: string, context: ExpressionContext = {}): ExpressionResult {
  try {
    const trimmed = expr.trim();
    if (!trimmed) return { value: '', type: 'string', error: null };

    // Template literal: "Hello {{name}}"
    if (trimmed.includes('{{')) {
      const result = trimmed.replace(/\{\{(.+?)\}\}/g, (_, key) => {
        const val = resolveVariable(key.trim(), context);
        return String(val ?? '');
      });
      return { value: result, type: 'string', error: null };
    }

    // Direct variable reference: $variableName
    if (trimmed.startsWith('$')) {
      const varName = trimmed.slice(1);
      const val = resolveVariable(varName, context);
      return { value: val, type: typeof val, error: val === undefined ? `Variable "${varName}" not found` : null };
    }

    // Comparison expressions
    if (trimmed.includes('===') || trimmed.includes('!==') || trimmed.includes('>=') || trimmed.includes('<=') || trimmed.includes('>') || trimmed.includes('<')) {
      return evaluateComparison(trimmed, context);
    }

    // Ternary: condition ? trueVal : falseVal
    if (trimmed.includes('?') && trimmed.includes(':')) {
      return evaluateTernary(trimmed, context);
    }

    // Math expressions
    if (/^[\d\s+\-*/().%]+$/.test(trimmed)) {
      return evaluateMath(trimmed);
    }

    // Function calls: fn(args)
    const fnMatch = trimmed.match(/^(\w+)\((.+)\)$/);
    if (fnMatch) {
      return evaluateFunction(fnMatch[1]!, fnMatch[2]!, context);
    }

    // String literal
    if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
      return { value: trimmed.slice(1, -1), type: 'string', error: null };
    }

    // Number
    if (!isNaN(Number(trimmed))) {
      return { value: Number(trimmed), type: 'number', error: null };
    }

    // Boolean
    if (trimmed === 'true') return { value: true, type: 'boolean', error: null };
    if (trimmed === 'false') return { value: false, type: 'boolean', error: null };
    if (trimmed === 'null') return { value: null, type: 'null', error: null };

    // Try as variable path
    const resolved = resolveVariable(trimmed, context);
    if (resolved !== undefined) {
      return { value: resolved, type: typeof resolved, error: null };
    }

    return { value: trimmed, type: 'string', error: null };
  } catch (err) {
    return { value: null, type: 'error', error: err instanceof Error ? err.message : 'Evaluation error' };
  }
}

/* ──────────────────────────────────────────────
 * Helpers
 * ────────────────────────────────────────────── */

function resolveVariable(path: string, context: ExpressionContext): unknown {
  const parts = path.split('.');
  let current: unknown = context;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

function evaluateMath(expr: string): ExpressionResult {
  // Safe math evaluation without eval
  const sanitized = expr.replace(/[^0-9+\-*/().%\s]/g, '');
  try {
    // Simple recursive descent parser for safety
    const result = parseAddSub(sanitized.trim(), 0);
    return { value: result.value, type: 'number', error: null };
  } catch {
    return { value: 0, type: 'number', error: 'Invalid math expression' };
  }
}

interface ParseResult { value: number; pos: number; }

function parseAddSub(expr: string, pos: number): ParseResult {
  let left = parseMulDiv(expr, pos);
  while (left.pos < expr.length) {
    const ch = expr[left.pos];
    if (ch === '+' || ch === '-') {
      const right = parseMulDiv(expr, left.pos + 1);
      left = { value: ch === '+' ? left.value + right.value : left.value - right.value, pos: right.pos };
    } else break;
  }
  return left;
}

function parseMulDiv(expr: string, pos: number): ParseResult {
  let left = parseAtom(expr, pos);
  while (left.pos < expr.length) {
    const ch = expr[left.pos];
    if (ch === '*' || ch === '/' || ch === '%') {
      const right = parseAtom(expr, left.pos + 1);
      if (ch === '*') left = { value: left.value * right.value, pos: right.pos };
      else if (ch === '%') left = { value: left.value % right.value, pos: right.pos };
      else left = { value: right.value !== 0 ? left.value / right.value : 0, pos: right.pos };
    } else break;
  }
  return left;
}

function parseAtom(expr: string, pos: number): ParseResult {
  // Skip whitespace
  while (pos < expr.length && expr[pos] === ' ') pos++;

  // Negative
  if (expr[pos] === '-') {
    const result = parseAtom(expr, pos + 1);
    return { value: -result.value, pos: result.pos };
  }

  // Parentheses
  if (expr[pos] === '(') {
    const result = parseAddSub(expr, pos + 1);
    // Skip closing paren
    let endPos = result.pos;
    while (endPos < expr.length && expr[endPos] !== ')') endPos++;
    return { value: result.value, pos: endPos + 1 };
  }

  // Number
  let numStr = '';
  while (pos < expr.length && (/[0-9.]/.test(expr[pos]!))) {
    numStr += expr[pos];
    pos++;
  }
  return { value: parseFloat(numStr) || 0, pos };
}

function evaluateComparison(expr: string, context: ExpressionContext): ExpressionResult {
  const ops = ['===', '!==', '>=', '<=', '>', '<'] as const;
  for (const op of ops) {
    const idx = expr.indexOf(op);
    if (idx === -1) continue;
    const left = evaluateExpression(expr.slice(0, idx).trim(), context).value;
    const right = evaluateExpression(expr.slice(idx + op.length).trim(), context).value;
    let result: boolean;
    switch (op) {
      case '===': result = left === right; break;
      case '!==': result = left !== right; break;
      case '>=': result = Number(left) >= Number(right); break;
      case '<=': result = Number(left) <= Number(right); break;
      case '>': result = Number(left) > Number(right); break;
      case '<': result = Number(left) < Number(right); break;
    }
    return { value: result, type: 'boolean', error: null };
  }
  return { value: false, type: 'boolean', error: 'Invalid comparison' };
}

function evaluateTernary(expr: string, context: ExpressionContext): ExpressionResult {
  const qIdx = expr.indexOf('?');
  const cIdx = expr.lastIndexOf(':');
  if (qIdx === -1 || cIdx === -1) return { value: null, type: 'error', error: 'Invalid ternary' };

  const condition = evaluateExpression(expr.slice(0, qIdx).trim(), context);
  const trueExpr = expr.slice(qIdx + 1, cIdx).trim();
  const falseExpr = expr.slice(cIdx + 1).trim();

  if (condition.value) {
    return evaluateExpression(trueExpr, context);
  }
  return evaluateExpression(falseExpr, context);
}

function evaluateFunction(name: string, argsStr: string, context: ExpressionContext): ExpressionResult {
  const args = argsStr.split(',').map(a => evaluateExpression(a.trim(), context).value);

  switch (name.toLowerCase()) {
    // String functions
    case 'upper': case 'uppercase': return { value: String(args[0]).toUpperCase(), type: 'string', error: null };
    case 'lower': case 'lowercase': return { value: String(args[0]).toLowerCase(), type: 'string', error: null };
    case 'trim': return { value: String(args[0]).trim(), type: 'string', error: null };
    case 'length': case 'len': return { value: String(args[0]).length, type: 'number', error: null };
    case 'concat': return { value: args.map(String).join(''), type: 'string', error: null };
    case 'substr': case 'substring': return { value: String(args[0]).substring(Number(args[1]), Number(args[2])), type: 'string', error: null };
    case 'replace': return { value: String(args[0]).replace(String(args[1]), String(args[2])), type: 'string', error: null };
    case 'includes': return { value: String(args[0]).includes(String(args[1])), type: 'boolean', error: null };
    case 'startswith': return { value: String(args[0]).startsWith(String(args[1])), type: 'boolean', error: null };
    case 'endswith': return { value: String(args[0]).endsWith(String(args[1])), type: 'boolean', error: null };
    case 'split': return { value: String(args[0]).split(String(args[1] ?? ',')), type: 'array', error: null };
    case 'join': return { value: Array.isArray(args[0]) ? args[0].join(String(args[1] ?? ',')) : '', type: 'string', error: null };

    // Math functions
    case 'abs': return { value: Math.abs(Number(args[0])), type: 'number', error: null };
    case 'round': return { value: Math.round(Number(args[0])), type: 'number', error: null };
    case 'floor': return { value: Math.floor(Number(args[0])), type: 'number', error: null };
    case 'ceil': return { value: Math.ceil(Number(args[0])), type: 'number', error: null };
    case 'min': return { value: Math.min(...args.map(Number)), type: 'number', error: null };
    case 'max': return { value: Math.max(...args.map(Number)), type: 'number', error: null };
    case 'pow': return { value: Math.pow(Number(args[0]), Number(args[1])), type: 'number', error: null };
    case 'sqrt': return { value: Math.sqrt(Number(args[0])), type: 'number', error: null };
    case 'random': return { value: Math.random(), type: 'number', error: null };
    case 'clamp': return { value: Math.min(Math.max(Number(args[0]), Number(args[1])), Number(args[2])), type: 'number', error: null };

    // Date functions
    case 'now': return { value: Date.now(), type: 'number', error: null };
    case 'today': return { value: new Date().toISOString().split('T')[0], type: 'string', error: null };
    case 'year': return { value: new Date().getFullYear(), type: 'number', error: null };
    case 'month': return { value: new Date().getMonth() + 1, type: 'number', error: null };
    case 'day': return { value: new Date().getDate(), type: 'number', error: null };
    case 'formatdate': return { value: new Date(String(args[0])).toLocaleDateString(), type: 'string', error: null };

    // Type functions
    case 'number': case 'tonumber': return { value: Number(args[0]), type: 'number', error: null };
    case 'string': case 'tostring': return { value: String(args[0]), type: 'string', error: null };
    case 'bool': case 'tobool': return { value: Boolean(args[0]), type: 'boolean', error: null };
    case 'isnull': return { value: args[0] == null, type: 'boolean', error: null };
    case 'isempty': return { value: !args[0] || String(args[0]).trim() === '', type: 'boolean', error: null };
    case 'typeof': return { value: typeof args[0], type: 'string', error: null };

    // Formatting
    case 'currency': return { value: `$${Number(args[0]).toFixed(2)}`, type: 'string', error: null };
    case 'percent': return { value: `${(Number(args[0]) * 100).toFixed(Number(args[1] ?? 0))}%`, type: 'string', error: null };
    case 'fixed': return { value: Number(args[0]).toFixed(Number(args[1] ?? 2)), type: 'string', error: null };
    case 'padstart': return { value: String(args[0]).padStart(Number(args[1]), String(args[2] ?? ' ')), type: 'string', error: null };
    case 'padend': return { value: String(args[0]).padEnd(Number(args[1]), String(args[2] ?? ' ')), type: 'string', error: null };

    // Conditional
    case 'if': return { value: args[0] ? args[1] : args[2], type: typeof (args[0] ? args[1] : args[2]), error: null };
    case 'ifempty': return { value: (!args[0] || String(args[0]).trim() === '') ? args[1] : args[0], type: typeof args[0], error: null };
    case 'coalesce': return { value: args.find(a => a != null && a !== '') ?? null, type: 'unknown', error: null };

    default:
      return { value: null, type: 'error', error: `Unknown function: ${name}` };
  }
}

/* ──────────────────────────────────────────────
 * Built-in Function Index (for autocomplete)
 * ────────────────────────────────────────────── */

export const EXPRESSION_FUNCTIONS = [
  { name: 'upper', args: 'text', description: 'Convert to uppercase', example: 'upper("hello") → "HELLO"' },
  { name: 'lower', args: 'text', description: 'Convert to lowercase', example: 'lower("HELLO") → "hello"' },
  { name: 'trim', args: 'text', description: 'Remove leading/trailing spaces', example: 'trim("  hi  ") → "hi"' },
  { name: 'length', args: 'text', description: 'Get string length', example: 'length("hello") → 5' },
  { name: 'concat', args: 'a, b, ...', description: 'Join strings', example: 'concat("a", "b") → "ab"' },
  { name: 'includes', args: 'text, search', description: 'Check if contains', example: 'includes("hello", "ell") → true' },
  { name: 'replace', args: 'text, find, replace', description: 'Replace text', example: 'replace("hello", "l", "r") → "herro"' },
  { name: 'round', args: 'number', description: 'Round to nearest integer', example: 'round(3.7) → 4' },
  { name: 'floor', args: 'number', description: 'Round down', example: 'floor(3.7) → 3' },
  { name: 'ceil', args: 'number', description: 'Round up', example: 'ceil(3.2) → 4' },
  { name: 'abs', args: 'number', description: 'Absolute value', example: 'abs(-5) → 5' },
  { name: 'min', args: 'a, b, ...', description: 'Minimum value', example: 'min(3, 1, 4) → 1' },
  { name: 'max', args: 'a, b, ...', description: 'Maximum value', example: 'max(3, 1, 4) → 4' },
  { name: 'clamp', args: 'value, min, max', description: 'Clamp value', example: 'clamp(15, 0, 10) → 10' },
  { name: 'random', args: '', description: 'Random 0-1', example: 'random() → 0.742...' },
  { name: 'currency', args: 'number', description: 'Format as currency', example: 'currency(29.5) → "$29.50"' },
  { name: 'percent', args: 'decimal, dp', description: 'Format as percent', example: 'percent(0.85) → "85%"' },
  { name: 'today', args: '', description: 'Current date', example: 'today() → "2026-02-25"' },
  { name: 'now', args: '', description: 'Current timestamp', example: 'now() → 1772072143000' },
  { name: 'if', args: 'condition, trueVal, falseVal', description: 'Conditional value', example: 'if(true, "yes", "no") → "yes"' },
  { name: 'ifempty', args: 'value, fallback', description: 'Fallback if empty', example: 'ifempty("", "N/A") → "N/A"' },
  { name: 'coalesce', args: 'a, b, ...', description: 'First non-null', example: 'coalesce(null, "", "hi") → "hi"' },
  { name: 'isnull', args: 'value', description: 'Check if null', example: 'isnull(null) → true' },
  { name: 'isempty', args: 'value', description: 'Check if empty', example: 'isempty("") → true' },
  { name: 'typeof', args: 'value', description: 'Get type name', example: 'typeof(42) → "number"' },
];
