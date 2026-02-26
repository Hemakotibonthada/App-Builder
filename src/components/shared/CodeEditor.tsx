/**
 * Code Editor Component — Full-featured code editor with syntax highlighting,
 * file tabs, line numbers, minimap, search/replace, and output console.
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

export interface CodeFile {
  id: string;
  name: string;
  path: string;
  language: string;
  content: string;
  isModified: boolean;
  isReadOnly: boolean;
}

export interface EditorTheme {
  name: string;
  background: string;
  foreground: string;
  lineHighlight: string;
  selection: string;
  cursor: string;
  lineNumber: string;
  lineNumberActive: string;
  gutter: string;
  keyword: string;
  string: string;
  number: string;
  comment: string;
  function: string;
  variable: string;
  type: string;
  tag: string;
  attribute: string;
  operator: string;
  property: string;
  punctuation: string;
}

/* ──────────────────────────────────────────────
 * Built-in Themes
 * ────────────────────────────────────────────── */

export const editorThemes: Record<string, EditorTheme> = {
  dark: {
    name: 'Dark',
    background: '#1e1e2e',
    foreground: '#cdd6f4',
    lineHighlight: '#313244',
    selection: 'rgba(137, 180, 250, 0.15)',
    cursor: '#cdd6f4',
    lineNumber: '#585b70',
    lineNumberActive: '#a6adc8',
    gutter: '#181825',
    keyword: '#cba6f7',
    string: '#a6e3a1',
    number: '#fab387',
    comment: '#6c7086',
    function: '#89b4fa',
    variable: '#cdd6f4',
    type: '#f9e2af',
    tag: '#f38ba8',
    attribute: '#89dceb',
    operator: '#94e2d5',
    property: '#89b4fa',
    punctuation: '#bac2de',
  },
  monokai: {
    name: 'Monokai',
    background: '#272822',
    foreground: '#f8f8f2',
    lineHighlight: '#3e3d32',
    selection: 'rgba(73, 72, 62, 0.5)',
    cursor: '#f8f8f0',
    lineNumber: '#90908a',
    lineNumberActive: '#f8f8f2',
    gutter: '#272822',
    keyword: '#f92672',
    string: '#e6db74',
    number: '#ae81ff',
    comment: '#75715e',
    function: '#a6e22e',
    variable: '#f8f8f2',
    type: '#66d9ef',
    tag: '#f92672',
    attribute: '#a6e22e',
    operator: '#f92672',
    property: '#a6e22e',
    punctuation: '#f8f8f2',
  },
  github: {
    name: 'GitHub',
    background: '#0d1117',
    foreground: '#c9d1d9',
    lineHighlight: '#161b22',
    selection: 'rgba(56, 139, 253, 0.15)',
    cursor: '#c9d1d9',
    lineNumber: '#484f58',
    lineNumberActive: '#c9d1d9',
    gutter: '#0d1117',
    keyword: '#ff7b72',
    string: '#a5d6ff',
    number: '#79c0ff',
    comment: '#8b949e',
    function: '#d2a8ff',
    variable: '#ffa657',
    type: '#79c0ff',
    tag: '#7ee787',
    attribute: '#79c0ff',
    operator: '#ff7b72',
    property: '#79c0ff',
    punctuation: '#c9d1d9',
  },
  dracula: {
    name: 'Dracula',
    background: '#282a36',
    foreground: '#f8f8f2',
    lineHighlight: '#44475a',
    selection: 'rgba(68, 71, 90, 0.5)',
    cursor: '#f8f8f2',
    lineNumber: '#6272a4',
    lineNumberActive: '#f8f8f2',
    gutter: '#282a36',
    keyword: '#ff79c6',
    string: '#f1fa8c',
    number: '#bd93f9',
    comment: '#6272a4',
    function: '#50fa7b',
    variable: '#f8f8f2',
    type: '#8be9fd',
    tag: '#ff79c6',
    attribute: '#50fa7b',
    operator: '#ff79c6',
    property: '#66d9ef',
    punctuation: '#f8f8f2',
  },
};

/* ──────────────────────────────────────────────
 * Syntax Tokenizer (simplified)
 * ────────────────────────────────────────────── */

interface Token {
  type: string;
  value: string;
}

function tokenizeLine(line: string, language: string): Token[] {
  const tokens: Token[] = [];
  let remaining = line;

  // Patterns per language
  const patterns = getLanguagePatterns(language);

  while (remaining.length > 0) {
    let matched = false;

    for (const [type, regex] of patterns) {
      const match = remaining.match(regex);
      if (match && match.index === 0) {
        tokens.push({ type, value: match[0] });
        remaining = remaining.slice(match[0].length);
        matched = true;
        break;
      }
    }

    if (!matched) {
      // No match — consume one character as plain text
      tokens.push({ type: 'text', value: remaining[0] });
      remaining = remaining.slice(1);
    }
  }

  return tokens;
}

function getLanguagePatterns(language: string): [string, RegExp][] {
  const common: [string, RegExp][] = [
    ['comment', /^\/\/.*/],
    ['comment', /^\/\*[\s\S]*?\*\//],
    ['string', /^"(?:[^"\\]|\\.)*"/],
    ['string', /^'(?:[^'\\]|\\.)*'/],
    ['string', /^`(?:[^`\\]|\\.)*`/],
    ['number', /^-?\d+\.?\d*(?:e[+-]?\d+)?/i],
    ['punctuation', /^[{}()\[\];,.:]/],
    ['operator', /^(?:=>|===|!==|==|!=|<=|>=|&&|\|\||<<|>>|>>>|\+\+|--|[+\-*/%=<>!&|^~?])/],
  ];

  switch (language) {
    case 'typescript':
    case 'javascript':
    case 'tsx':
    case 'jsx':
      return [
        ...common,
        ['keyword', /^(?:import|export|from|default|const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|delete|typeof|instanceof|void|throw|try|catch|finally|class|extends|implements|interface|type|enum|namespace|abstract|async|await|yield|static|public|private|protected|readonly|override|declare|module|require|as|is|in|of|keyof|infer|never|unknown|any|string|number|boolean|null|undefined|true|false|this|super)\b/],
        ['function', /^[a-zA-Z_$][a-zA-Z0-9_$]*(?=\s*\()/],
        ['type', /^[A-Z][a-zA-Z0-9_$]*/],
        ['tag', /^<\/?[a-zA-Z][a-zA-Z0-9.]*/],
        ['attribute', /^[a-zA-Z_][a-zA-Z0-9_-]*(?=\s*=)/],
        ['variable', /^[a-zA-Z_$][a-zA-Z0-9_$]*/],
        ['whitespace', /^\s+/],
      ];

    case 'css':
    case 'scss':
      return [
        ...common,
        ['keyword', /^(?:@import|@media|@keyframes|@font-face|@supports|@layer|@container|@property|!important)\b/],
        ['property', /^[a-z-]+(?=\s*:)/],
        ['tag', /^[a-zA-Z][a-zA-Z0-9-]*/],
        ['variable', /^--[a-zA-Z0-9-]+/],
        ['whitespace', /^\s+/],
      ];

    case 'html':
      return [
        ['comment', /^<!--[\s\S]*?-->/],
        ['tag', /^<\/?[a-zA-Z][a-zA-Z0-9]*/],
        ['attribute', /^[a-zA-Z_][a-zA-Z0-9_-]*(?=\s*=)/],
        ['string', /^"[^"]*"/],
        ['string', /^'[^']*'/],
        ['punctuation', /^[<>\/=]/],
        ['variable', /^[a-zA-Z_][a-zA-Z0-9_]*/],
        ['whitespace', /^\s+/],
      ];

    case 'json':
      return [
        ['property', /^"[^"]*"\s*(?=:)/],
        ['string', /^"(?:[^"\\]|\\.)*"/],
        ['number', /^-?\d+\.?\d*(?:e[+-]?\d+)?/i],
        ['keyword', /^(?:true|false|null)\b/],
        ['punctuation', /^[{}()\[\];,:]/],
        ['whitespace', /^\s+/],
      ];

    default:
      return [
        ...common,
        ['keyword', /^(?:import|export|from|const|let|var|function|return|if|else|for|while|class|def|print|self|None|True|False)\b/],
        ['function', /^[a-zA-Z_][a-zA-Z0-9_]*(?=\s*\()/],
        ['variable', /^[a-zA-Z_][a-zA-Z0-9_]*/],
        ['whitespace', /^\s+/],
      ];
  }
}

/* ──────────────────────────────────────────────
 * Language Icon
 * ────────────────────────────────────────────── */

function getLanguageIcon(lang: string): string {
  const icons: Record<string, string> = {
    typescript: '🔷',
    javascript: '🟡',
    tsx: '⚛️',
    jsx: '⚛️',
    css: '🎨',
    scss: '🎨',
    html: '🌐',
    json: '📋',
    python: '🐍',
    rust: '🦀',
    go: '🔵',
    java: '☕',
    dart: '🎯',
    swift: '🍎',
    kotlin: '🟣',
    sql: '🗃️',
    markdown: '📝',
    yaml: '📄',
    xml: '📰',
    shell: '💻',
    dockerfile: '🐳',
  };
  return icons[lang.toLowerCase()] ?? '📄';
}

function getLanguageLabel(lang: string): string {
  const labels: Record<string, string> = {
    typescript: 'TypeScript',
    javascript: 'JavaScript',
    tsx: 'TSX',
    jsx: 'JSX',
    css: 'CSS',
    scss: 'SCSS',
    html: 'HTML',
    json: 'JSON',
    python: 'Python',
    markdown: 'Markdown',
  };
  return labels[lang.toLowerCase()] ?? lang;
}

/* ──────────────────────────────────────────────
 * File Tab Bar
 * ────────────────────────────────────────────── */

interface FileTabBarProps {
  files: CodeFile[];
  activeFileId: string | null;
  onSelectFile: (id: string) => void;
  onCloseFile: (id: string) => void;
}

const FileTabBar = memo(function FileTabBar({
  files,
  activeFileId,
  onSelectFile,
  onCloseFile,
}: FileTabBarProps) {
  return (
    <div className="flex items-center bg-[#1e1e2e] border-b border-white/5 overflow-x-auto">
      {files.map(file => (
        <motion.button
          key={file.id}
          onClick={() => onSelectFile(file.id)}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-2 text-xs border-r border-white/5 min-w-0 group',
            activeFileId === file.id
              ? 'bg-[#1e1e2e] text-white/80 border-t-2 border-t-indigo-500'
              : 'bg-[#181825] text-white/40 hover:text-white/60 border-t-2 border-t-transparent',
          )}
          whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
        >
          <span className="text-[10px]">{getLanguageIcon(file.language)}</span>
          <span className="truncate max-w-[120px]">{file.name}</span>
          {file.isModified && (
            <span className="w-2 h-2 rounded-full bg-white/20 flex-shrink-0" />
          )}
          <motion.span
            onClick={(e) => { e.stopPropagation(); onCloseFile(file.id); }}
            className="opacity-0 group-hover:opacity-100 ml-1 p-0.5 rounded hover:bg-white/10 flex-shrink-0"
            whileHover={{ scale: 1.1 }}
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </motion.span>
        </motion.button>
      ))}
    </div>
  );
});

/* ──────────────────────────────────────────────
 * Line Number Gutter
 * ────────────────────────────────────────────── */

interface GutterProps {
  lineCount: number;
  activeLine: number;
  theme: EditorTheme;
  breakpoints?: Set<number>;
  onToggleBreakpoint?: (line: number) => void;
}

function Gutter({ lineCount, activeLine, theme, breakpoints, onToggleBreakpoint }: GutterProps) {
  return (
    <div
      className="flex flex-col select-none pr-3 text-right"
      style={{ backgroundColor: theme.gutter, minWidth: '3.5rem' }}
    >
      {Array.from({ length: lineCount }, (_, i) => {
        const lineNum = i + 1;
        const isActive = lineNum === activeLine;
        const hasBreakpoint = breakpoints?.has(lineNum);

        return (
          <div
            key={lineNum}
            className="flex items-center justify-end gap-1 px-2 cursor-pointer hover:bg-white/5"
            style={{ height: '20px' }}
            onClick={() => onToggleBreakpoint?.(lineNum)}
          >
            {hasBreakpoint && (
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0" />
            )}
            <span
              className="text-[11px] font-mono tabular-nums"
              style={{
                color: isActive ? theme.lineNumberActive : theme.lineNumber,
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {lineNum}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Highlighted Code Line
 * ────────────────────────────────────────────── */

interface HighlightedLineProps {
  line: string;
  language: string;
  theme: EditorTheme;
  isActive: boolean;
  lineNumber: number;
}

const HighlightedLine = memo(function HighlightedLine({
  line,
  language,
  theme,
  isActive,
}: HighlightedLineProps) {
  const tokens = useMemo(() => tokenizeLine(line || ' ', language), [line, language]);

  const getTokenColor = (type: string): string => {
    const colorMap: Record<string, string> = {
      keyword: theme.keyword,
      string: theme.string,
      number: theme.number,
      comment: theme.comment,
      function: theme.function,
      variable: theme.variable,
      type: theme.type,
      tag: theme.tag,
      attribute: theme.attribute,
      operator: theme.operator,
      property: theme.property,
      punctuation: theme.punctuation,
      text: theme.foreground,
      whitespace: 'transparent',
    };
    return colorMap[type] ?? theme.foreground;
  };

  return (
    <div
      className="flex items-center px-4"
      style={{
        height: '20px',
        backgroundColor: isActive ? theme.lineHighlight : 'transparent',
      }}
    >
      <span className="font-mono text-[13px] whitespace-pre">
        {tokens.map((token, i) => (
          <span key={i} style={{ color: getTokenColor(token.type) }}>
            {token.value}
          </span>
        ))}
      </span>
    </div>
  );
});

/* ──────────────────────────────────────────────
 * Search Bar
 * ────────────────────────────────────────────── */

interface SearchBarProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
  onReplace?: (query: string, replacement: string) => void;
  matchCount: number;
  currentMatch: number;
}

function SearchBar({ isOpen, onClose, onSearch, onReplace, matchCount, currentMatch }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [replacement, setReplacement] = useState('');
  const [showReplace, setShowReplace] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-0 right-4 z-20 bg-[#252536] border border-white/10 rounded-b-lg shadow-xl p-2"
        >
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              placeholder="Find..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); onSearch(e.target.value); }}
              className="w-48 px-2 py-1 text-xs bg-white/5 border border-white/10 rounded text-white
                         placeholder-white/30 focus:outline-none focus:border-indigo-500/50"
            />
            <span className="text-[10px] text-white/30 min-w-[60px] text-center">
              {matchCount > 0 ? `${currentMatch}/${matchCount}` : 'No results'}
            </span>
            <button
              onClick={() => setShowReplace(!showReplace)}
              className="text-white/30 hover:text-white/60 p-1"
              title="Toggle Replace"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="17 1 21 5 17 9" />
                <path d="M3 11V9a4 4 0 014-4h14" />
                <polyline points="7 23 3 19 7 15" />
                <path d="M21 13v2a4 4 0 01-4 4H3" />
              </svg>
            </button>
            <button onClick={onClose} className="text-white/30 hover:text-white/60 p-1">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {showReplace && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex items-center gap-2 mt-2"
            >
              <input
                type="text"
                placeholder="Replace..."
                value={replacement}
                onChange={(e) => setReplacement(e.target.value)}
                className="w-48 px-2 py-1 text-xs bg-white/5 border border-white/10 rounded text-white
                           placeholder-white/30 focus:outline-none focus:border-indigo-500/50"
              />
              <button
                onClick={() => onReplace?.(query, replacement)}
                className="px-2 py-1 text-[10px] text-white/50 hover:text-white bg-white/5 rounded hover:bg-white/10"
              >
                Replace
              </button>
              <button
                onClick={() => onReplace?.(query, replacement)}
                className="px-2 py-1 text-[10px] text-white/50 hover:text-white bg-white/5 rounded hover:bg-white/10"
              >
                All
              </button>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ──────────────────────────────────────────────
 * Output Console
 * ────────────────────────────────────────────── */

interface ConsoleLog {
  type: 'log' | 'warn' | 'error' | 'info';
  message: string;
  timestamp: number;
}

interface ConsoleProps {
  logs: ConsoleLog[];
  isOpen: boolean;
  onToggle: () => void;
  onClear: () => void;
}

function Console({ logs, isOpen, onToggle, onClear }: ConsoleProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const typeStyles = {
    log: 'text-white/60',
    info: 'text-blue-400',
    warn: 'text-yellow-400',
    error: 'text-red-400',
  };

  const typeIcons = {
    log: '›',
    info: 'ℹ',
    warn: '⚠',
    error: '✕',
  };

  return (
    <div className="border-t border-white/5">
      {/* Console header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-1.5 bg-[#181825] hover:bg-[#1e1e2e] transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/30 uppercase tracking-wider font-medium">Console</span>
          {logs.length > 0 && (
            <span className="px-1.5 py-0.5 text-[9px] bg-white/5 rounded text-white/30">
              {logs.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isOpen && (
            <button
              onClick={(e) => { e.stopPropagation(); onClear(); }}
              className="text-[10px] text-white/30 hover:text-white/50 px-1"
            >
              Clear
            </button>
          )}
          <svg
            className={clsx('w-3 h-3 text-white/20 transition-transform', isOpen && 'rotate-180')}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </button>

      {/* Console output */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 150 }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div
              ref={scrollRef}
              className="h-[150px] overflow-auto bg-[#11111b] font-mono text-[11px]"
            >
              {logs.length === 0 ? (
                <div className="flex items-center justify-center h-full text-white/15 text-xs">
                  No output
                </div>
              ) : (
                logs.map((log, i) => (
                  <div
                    key={i}
                    className={clsx(
                      'flex items-start gap-2 px-3 py-0.5 border-b border-white/3',
                      log.type === 'error' && 'bg-red-500/5',
                      log.type === 'warn' && 'bg-yellow-500/5',
                    )}
                  >
                    <span className={clsx('flex-shrink-0', typeStyles[log.type])}>
                      {typeIcons[log.type]}
                    </span>
                    <span className={typeStyles[log.type]}>{log.message}</span>
                    <span className="text-white/10 ml-auto flex-shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Mini Map (Code Minimap)
 * ────────────────────────────────────────────── */

interface CodeMinimapProps {
  lines: string[];
  visibleStart: number;
  visibleEnd: number;
  totalLines: number;
  onScroll: (line: number) => void;
  theme: EditorTheme;
}

function CodeMinimap({ lines, visibleStart, visibleEnd, totalLines, onScroll, theme }: CodeMinimapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const lineHeight = Math.max(1, height / totalLines);

    ctx.fillStyle = theme.gutter;
    ctx.fillRect(0, 0, width, height);

    // Render lines as small colored blocks
    lines.forEach((line, i) => {
      const y = i * lineHeight;
      const trimmed = line.trimStart();
      const indent = line.length - trimmed.length;

      if (trimmed.length > 0) {
        const x = Math.min(indent * 0.5, 20);
        const w = Math.min(trimmed.length * 0.3, width - x);

        ctx.fillStyle = trimmed.startsWith('//') || trimmed.startsWith('/*')
          ? theme.comment
          : trimmed.startsWith('import') || trimmed.startsWith('export')
            ? theme.keyword
            : theme.foreground + '40';

        ctx.fillRect(x, y, w, Math.max(1, lineHeight - 0.5));
      }
    });

    // Viewport indicator
    const vpY = visibleStart * lineHeight;
    const vpH = (visibleEnd - visibleStart) * lineHeight;
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(0, vpY, width, vpH);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.strokeRect(0, vpY, width, vpH);
  }, [lines, visibleStart, visibleEnd, totalLines, theme]);

  return (
    <canvas
      ref={canvasRef}
      width={60}
      height={Math.min(totalLines * 2, 600)}
      className="cursor-pointer opacity-50 hover:opacity-80 transition-opacity"
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const ratio = (e.clientY - rect.top) / rect.height;
        onScroll(Math.floor(ratio * totalLines));
      }}
      style={{ width: '60px', height: '100%' }}
    />
  );
}

/* ──────────────────────────────────────────────
 * Main Code Editor Component
 * ────────────────────────────────────────────── */

interface CodeEditorProps {
  files: CodeFile[];
  activeFileId: string | null;
  onFileSelect: (id: string) => void;
  onFileClose: (id: string) => void;
  onContentChange?: (fileId: string, content: string) => void;
  theme?: string;
  showMinimap?: boolean;
  showLineNumbers?: boolean;
  fontSize?: number;
  tabSize?: number;
  wordWrap?: boolean;
  className?: string;
}

export function CodeEditor({
  files,
  activeFileId,
  onFileSelect,
  onFileClose,
  onContentChange,
  theme: themeName = 'dark',
  showMinimap = true,
  showLineNumbers = true,
  fontSize = 13,
  tabSize = 2,
  wordWrap = false,
  className,
}: CodeEditorProps) {
  const theme = editorThemes[themeName] ?? editorThemes.dark;
  const activeFile = files.find(f => f.id === activeFileId);
  const lines = useMemo(() => (activeFile?.content ?? '').split('\n'), [activeFile?.content]);
  const [activeLine, setActiveLine] = useState(1);
  const [showSearch, setShowSearch] = useState(false);
  const [searchMatches, setSearchMatches] = useState(0);
  const [breakpoints, setBreakpoints] = useState(new Set<number>());
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([
    { type: 'info', message: 'Code editor initialized', timestamp: Date.now() },
  ]);
  const [consoleOpen, setConsoleOpen] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setShowSearch(true);
      }
      if (e.key === 'Escape') {
        setShowSearch(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearch = useCallback((query: string) => {
    if (!query || !activeFile) {
      setSearchMatches(0);
      return;
    }
    const content = activeFile.content.toLowerCase();
    const q = query.toLowerCase();
    let count = 0;
    let pos = 0;
    while ((pos = content.indexOf(q, pos)) !== -1) {
      count++;
      pos += q.length;
    }
    setSearchMatches(count);
  }, [activeFile]);

  const toggleBreakpoint = useCallback((line: number) => {
    setBreakpoints(prev => {
      const next = new Set(prev);
      if (next.has(line)) next.delete(line);
      else next.add(line);
      return next;
    });
  }, []);

  const openFiles = files.filter(f => true); // In a real app, filter by openFileIds

  return (
    <div
      className={clsx('flex flex-col h-full', className)}
      style={{ backgroundColor: theme.background }}
    >
      {/* File tabs */}
      <FileTabBar
        files={openFiles}
        activeFileId={activeFileId}
        onSelectFile={onFileSelect}
        onCloseFile={onFileClose}
      />

      {/* Editor area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Search */}
        <SearchBar
          isOpen={showSearch}
          onClose={() => setShowSearch(false)}
          onSearch={handleSearch}
          matchCount={searchMatches}
          currentMatch={searchMatches > 0 ? 1 : 0}
        />

        {activeFile ? (
          <div ref={editorRef} className="flex h-full overflow-auto">
            {/* Line numbers */}
            {showLineNumbers && (
              <Gutter
                lineCount={lines.length}
                activeLine={activeLine}
                theme={theme}
                breakpoints={breakpoints}
                onToggleBreakpoint={toggleBreakpoint}
              />
            )}

            {/* Code content */}
            <div
              className="flex-1 overflow-auto py-0.5"
              style={{ fontSize: `${fontSize}px` }}
              onClick={(e) => {
                const target = e.currentTarget;
                const rect = target.getBoundingClientRect();
                const y = e.clientY - rect.top + target.scrollTop;
                const lineNum = Math.floor(y / 20) + 1;
                setActiveLine(Math.min(lineNum, lines.length));
              }}
            >
              {lines.map((line, i) => (
                <HighlightedLine
                  key={i}
                  line={line}
                  language={activeFile.language}
                  theme={theme}
                  isActive={i + 1 === activeLine}
                  lineNumber={i + 1}
                />
              ))}
            </div>

            {/* Minimap */}
            {showMinimap && lines.length > 10 && (
              <div className="w-[60px] flex-shrink-0 border-l border-white/5">
                <CodeMinimap
                  lines={lines}
                  visibleStart={0}
                  visibleEnd={Math.min(50, lines.length)}
                  totalLines={lines.length}
                  onScroll={(line) => setActiveLine(line)}
                  theme={theme}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <motion.div
                className="text-4xl mb-3"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                📝
              </motion.div>
              <p className="text-sm text-white/30">No file open</p>
              <p className="text-xs text-white/15 mt-1">Select a file to start editing</p>
            </div>
          </div>
        )}
      </div>

      {/* Status bar */}
      {activeFile && (
        <div className="flex items-center justify-between px-3 py-1 bg-[#181825] border-t border-white/5 text-[10px]">
          <div className="flex items-center gap-3">
            <span className="text-white/30">
              {getLanguageIcon(activeFile.language)} {getLanguageLabel(activeFile.language)}
            </span>
            <span className="text-white/20">
              Ln {activeLine}, Col 1
            </span>
            <span className="text-white/20">
              {lines.length} lines
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white/20">Spaces: {tabSize}</span>
            <span className="text-white/20">UTF-8</span>
            {activeFile.isModified && (
              <span className="text-orange-400">Modified</span>
            )}
            {activeFile.isReadOnly && (
              <span className="text-yellow-400">Read Only</span>
            )}
          </div>
        </div>
      )}

      {/* Console */}
      <Console
        logs={consoleLogs}
        isOpen={consoleOpen}
        onToggle={() => setConsoleOpen(!consoleOpen)}
        onClear={() => setConsoleLogs([])}
      />
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Code Preview Pane
 * ────────────────────────────────────────────── */

interface CodePreviewProps {
  code: string;
  language: string;
  title?: string;
  showLineNumbers?: boolean;
  maxHeight?: string;
  theme?: string;
  className?: string;
  copyable?: boolean;
}

export function CodePreview({
  code,
  language,
  title,
  showLineNumbers = true,
  maxHeight = '400px',
  theme: themeName = 'dark',
  className,
  copyable = true,
}: CodePreviewProps) {
  const theme = editorThemes[themeName] ?? editorThemes.dark;
  const lines = code.split('\n');
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  }, [code]);

  return (
    <div
      className={clsx('rounded-xl border border-white/10 overflow-hidden', className)}
      style={{ backgroundColor: theme.background }}
    >
      {/* Header */}
      {(title || copyable) && (
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/5"
          style={{ backgroundColor: theme.gutter }}>
          <div className="flex items-center gap-2">
            <span className="text-[10px]">{getLanguageIcon(language)}</span>
            <span className="text-[11px] text-white/40">{title ?? getLanguageLabel(language)}</span>
          </div>
          {copyable && (
            <motion.button
              onClick={handleCopy}
              className="text-white/30 hover:text-white/60 p-1 rounded"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {copied ? (
                <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
              )}
            </motion.button>
          )}
        </div>
      )}

      {/* Code */}
      <div className="overflow-auto" style={{ maxHeight, fontSize: '13px' }}>
        <div className="flex py-2">
          {showLineNumbers && (
            <div className="flex flex-col pr-3 text-right select-none" style={{ minWidth: '3rem' }}>
              {lines.map((_, i) => (
                <span
                  key={i}
                  className="font-mono text-[11px] px-2"
                  style={{ color: theme.lineNumber, height: '20px', lineHeight: '20px' }}
                >
                  {i + 1}
                </span>
              ))}
            </div>
          )}
          <div className="flex-1 overflow-x-auto">
            {lines.map((line, i) => (
              <HighlightedLine
                key={i}
                line={line}
                language={language}
                theme={theme}
                isActive={false}
                lineNumber={i + 1}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
