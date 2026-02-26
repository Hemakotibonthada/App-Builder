/**
 * Collaboration Panel — Real-time collaboration UI with cursor presence,
 * user avatars, comment threads, typing indicators, and version history.
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

export interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  color: string;
  status: 'online' | 'away' | 'offline';
  cursor?: { x: number; y: number };
  selection?: { widgetId: string };
  lastActive: number;
  role: 'owner' | 'editor' | 'viewer' | 'commenter';
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  text: string;
  timestamp: number;
  position?: { x: number; y: number };
  widgetId?: string;
  resolved: boolean;
  replies: CommentReply[];
  reactions: CommentReaction[];
  editedAt?: number;
}

export interface CommentReply {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  text: string;
  timestamp: number;
}

export interface CommentReaction {
  emoji: string;
  users: string[];
}

export interface VersionEntry {
  id: string;
  authorId: string;
  authorName: string;
  timestamp: number;
  description: string;
  changeCount: number;
  type: 'auto' | 'manual' | 'restore';
  thumbnail?: string;
}

export interface ActivityEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  target: string;
  timestamp: number;
  type: 'widget' | 'page' | 'style' | 'comment' | 'version' | 'settings';
}

/* ──────────────────────────────────────────────
 * Color utilities
 * ────────────────────────────────────────────── */

const collaboratorColors = [
  '#f38ba8', '#fab387', '#f9e2af', '#a6e3a1',
  '#89dceb', '#89b4fa', '#cba6f7', '#f5c2e7',
  '#94e2d5', '#74c7ec', '#b4befe', '#eba0ac',
];

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/* ──────────────────────────────────────────────
 * Avatar Component
 * ────────────────────────────────────────────── */

interface AvatarProps {
  name: string;
  avatar?: string;
  color: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  status?: 'online' | 'away' | 'offline';
  showStatus?: boolean;
  className?: string;
}

const Avatar = memo(function Avatar({
  name,
  avatar,
  color,
  size = 'sm',
  status,
  showStatus = false,
  className,
}: AvatarProps) {
  const sizeClasses = {
    xs: 'w-5 h-5 text-[8px]',
    sm: 'w-7 h-7 text-[10px]',
    md: 'w-9 h-9 text-xs',
    lg: 'w-12 h-12 text-sm',
  };

  const statusColors = {
    online: 'bg-emerald-500',
    away: 'bg-amber-500',
    offline: 'bg-white/20',
  };

  return (
    <div className={clsx('relative inline-flex', className)}>
      {avatar ? (
        <img
          src={avatar}
          alt={name}
          className={clsx('rounded-full object-cover ring-2 ring-black/20', sizeClasses[size])}
        />
      ) : (
        <div
          className={clsx(
            'rounded-full flex items-center justify-center font-bold ring-2 ring-black/20',
            sizeClasses[size],
          )}
          style={{ backgroundColor: color + '30', color }}
        >
          {getInitials(name)}
        </div>
      )}
      {showStatus && status && (
        <span className={clsx(
          'absolute -bottom-0.5 -right-0.5 rounded-full ring-2 ring-[#1e1e2e]',
          statusColors[status],
          size === 'xs' ? 'w-1.5 h-1.5' : 'w-2 h-2',
        )} />
      )}
    </div>
  );
});

/* ──────────────────────────────────────────────
 * Avatar Stack
 * ────────────────────────────────────────────── */

function AvatarStack({
  collaborators,
  maxVisible = 4,
}: {
  collaborators: Collaborator[];
  maxVisible?: number;
}) {
  const visible = collaborators.slice(0, maxVisible);
  const overflow = collaborators.length - maxVisible;

  return (
    <div className="flex -space-x-2">
      {visible.map((c, i) => (
        <motion.div
          key={c.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          style={{ zIndex: visible.length - i }}
        >
          <Avatar
            name={c.name}
            avatar={c.avatar}
            color={c.color}
            size="sm"
            status={c.status}
            showStatus
          />
        </motion.div>
      ))}
      {overflow > 0 && (
        <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white/40 ring-2 ring-[#1e1e2e]">
          +{overflow}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Cursor Overlay (displays on canvas)
 * ────────────────────────────────────────────── */

interface CursorOverlayProps {
  collaborators: Collaborator[];
  currentUserId: string;
}

export function CursorOverlay({ collaborators, currentUserId }: CursorOverlayProps) {
  const others = collaborators.filter(c => c.id !== currentUserId && c.cursor && c.status === 'online');

  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {others.map(c => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1, x: c.cursor!.x, y: c.cursor!.y }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute"
          >
            {/* Cursor SVG */}
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill={c.color}>
              <path d="M0 0l6.5 16L8 8l8-1.5z" />
            </svg>
            {/* Name label */}
            <div
              className="absolute left-3 top-4 px-1.5 py-0.5 rounded text-[9px] font-medium whitespace-nowrap"
              style={{ backgroundColor: c.color, color: '#000' }}
            >
              {c.name.split(' ')[0]}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Selection Indicator
 * ────────────────────────────────────────────── */

interface SelectionIndicatorProps {
  collaborator: Collaborator;
  x: number;
  y: number;
  width: number;
  height: number;
}

export function SelectionIndicator({ collaborator, x, y, width, height }: SelectionIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute pointer-events-none z-40"
      style={{
        left: x - 2,
        top: y - 2,
        width: width + 4,
        height: height + 4,
      }}
    >
      <div
        className="w-full h-full border-2 rounded-sm"
        style={{ borderColor: collaborator.color }}
      />
      <div
        className="absolute -top-5 left-0 px-1.5 py-0.5 rounded text-[9px] font-medium whitespace-nowrap"
        style={{ backgroundColor: collaborator.color, color: '#000' }}
      >
        {collaborator.name.split(' ')[0]}
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
 * Typing Indicator
 * ────────────────────────────────────────────── */

function TypingIndicator({ names }: { names: string[] }) {
  if (names.length === 0) return null;

  const display = names.length === 1
    ? `${names[0]} is typing`
    : names.length === 2
      ? `${names[0]} and ${names[1]} are typing`
      : `${names[0]} and ${names.length - 1} others are typing`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 5 }}
      className="flex items-center gap-2 px-3 py-1.5 text-[10px] text-white/30"
    >
      <div className="flex gap-0.5">
        {[0, 1, 2].map(i => (
          <motion.span
            key={i}
            className="w-1 h-1 bg-white/30 rounded-full"
            animate={{ y: [0, -3, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
            }}
          />
        ))}
      </div>
      <span>{display}</span>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
 * Comment Thread Component
 * ────────────────────────────────────────────── */

interface CommentThreadProps {
  comment: Comment;
  currentUserId: string;
  onReply: (commentId: string, text: string) => void;
  onResolve: (commentId: string) => void;
  onReact: (commentId: string, emoji: string) => void;
  onDelete: (commentId: string) => void;
}

function CommentThread({ comment, currentUserId, onReply, onResolve, onReact, onDelete }: CommentThreadProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [showActions, setShowActions] = useState(false);

  const handleReply = () => {
    if (replyText.trim()) {
      onReply(comment.id, replyText.trim());
      setReplyText('');
    }
  };

  const reactionEmojis = ['👍', '❤️', '😄', '🎉', '🤔', '👀'];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={clsx(
        'rounded-lg border overflow-hidden',
        comment.resolved
          ? 'border-white/5 bg-white/2 opacity-50'
          : 'border-white/10 bg-white/3',
      )}
    >
      {/* Main comment */}
      <div
        className="p-3 group"
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <div className="flex items-start gap-2">
          <Avatar
            name={comment.authorName}
            avatar={comment.authorAvatar}
            color={collaboratorColors[comment.authorName.length % collaboratorColors.length]}
            size="xs"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-white/60 font-medium">{comment.authorName}</span>
              <span className="text-[9px] text-white/20">{timeAgo(comment.timestamp)}</span>
              {comment.resolved && (
                <span className="text-[9px] text-emerald-400 bg-emerald-400/10 px-1 rounded">✓ Resolved</span>
              )}
              {comment.editedAt && (
                <span className="text-[9px] text-white/15">(edited)</span>
              )}
            </div>
            <p className="text-xs text-white/40 mt-1 whitespace-pre-wrap">{comment.text}</p>

            {/* Reactions */}
            {comment.reactions.length > 0 && (
              <div className="flex gap-1 mt-2 flex-wrap">
                {comment.reactions.map((reaction, i) => (
                  <button
                    key={i}
                    onClick={() => onReact(comment.id, reaction.emoji)}
                    className={clsx(
                      'flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] border',
                      reaction.users.includes(currentUserId)
                        ? 'border-indigo-500/30 bg-indigo-500/10'
                        : 'border-white/5 bg-white/3 hover:bg-white/5',
                    )}
                  >
                    <span>{reaction.emoji}</span>
                    <span className="text-white/30">{reaction.users.length}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <AnimatePresence>
            {showActions && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-0.5"
              >
                {/* Quick reactions */}
                <div className="flex bg-[#252536] rounded border border-white/10 overflow-hidden">
                  {reactionEmojis.slice(0, 3).map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => onReact(comment.id, emoji)}
                      className="px-1 py-0.5 text-[10px] hover:bg-white/5"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                {!comment.resolved && (
                  <button
                    onClick={() => onResolve(comment.id)}
                    className="p-1 text-white/20 hover:text-emerald-400 rounded hover:bg-white/5"
                    title="Resolve"
                  >
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </button>
                )}

                {comment.authorId === currentUserId && (
                  <button
                    onClick={() => onDelete(comment.id)}
                    className="p-1 text-white/20 hover:text-red-400 rounded hover:bg-white/5"
                    title="Delete"
                  >
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                    </svg>
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Replies */}
      {comment.replies.length > 0 && (
        <div className="border-t border-white/5">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full px-3 py-1.5 text-[10px] text-white/20 hover:text-white/40 text-left flex items-center gap-1"
          >
            <motion.span animate={{ rotate: isExpanded ? 90 : 0 }} className="text-[8px]">▶</motion.span>
            {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
          </button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                {comment.replies.map(reply => (
                  <div key={reply.id} className="px-3 py-2 ml-7 border-l-2 border-white/5">
                    <div className="flex items-start gap-2">
                      <Avatar
                        name={reply.authorName}
                        avatar={reply.authorAvatar}
                        color={collaboratorColors[reply.authorName.length % collaboratorColors.length]}
                        size="xs"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-white/50 font-medium">{reply.authorName}</span>
                          <span className="text-[9px] text-white/15">{timeAgo(reply.timestamp)}</span>
                        </div>
                        <p className="text-[11px] text-white/35 mt-0.5">{reply.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Reply input */}
      {!comment.resolved && (
        <div className="border-t border-white/5 px-3 py-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleReply()}
              className="flex-1 px-2 py-1 text-[11px] bg-white/3 border border-white/5 rounded
                         text-white placeholder-white/15 focus:outline-none focus:border-indigo-500/50"
            />
            <button
              onClick={handleReply}
              disabled={!replyText.trim()}
              className="text-[10px] text-indigo-400 disabled:text-white/10 hover:text-indigo-300"
            >
              Reply
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
 * Comment Pin (for canvas placement)
 * ────────────────────────────────────────────── */

interface CommentPinProps {
  comment: Comment;
  isSelected: boolean;
  onClick: () => void;
}

export function CommentPin({ comment, isSelected, onClick }: CommentPinProps) {
  if (!comment.position) return null;

  return (
    <motion.button
      onClick={onClick}
      className="absolute z-30"
      style={{ left: comment.position.x, top: comment.position.y }}
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.9 }}
    >
      <div
        className={clsx(
          'w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shadow-lg',
          comment.resolved
            ? 'bg-emerald-500/80 text-white'
            : isSelected
              ? 'bg-indigo-500 text-white ring-2 ring-indigo-500/30'
              : 'bg-amber-500 text-black',
        )}
      >
        {comment.resolved ? '✓' : comment.replies.length + 1}
      </div>
      {isSelected && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: -5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="absolute left-8 top-0 w-64"
        >
          {/* Popup would show the comment thread */}
        </motion.div>
      )}
    </motion.button>
  );
}

/* ──────────────────────────────────────────────
 * Version History Panel
 * ────────────────────────────────────────────── */

interface VersionHistoryProps {
  versions: VersionEntry[];
  onRestore: (id: string) => void;
  onCompare: (id1: string, id2: string) => void;
}

function VersionHistory({ versions, onRestore, onCompare }: VersionHistoryProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const typeIcons = {
    auto: '⏱️',
    manual: '💾',
    restore: '🔄',
  };

  return (
    <div className="space-y-1">
      {versions.map((version, i) => (
        <motion.div
          key={version.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.03 }}
          className={clsx(
            'relative pl-6 pr-3 py-2 rounded group cursor-pointer',
            selectedId === version.id ? 'bg-indigo-500/10' : 'hover:bg-white/3',
          )}
          onClick={() => setSelectedId(version.id)}
        >
          {/* Timeline dot */}
          <div className="absolute left-2 top-1/2 -translate-y-1/2">
            <div className={clsx(
              'w-2 h-2 rounded-full',
              version.type === 'manual' ? 'bg-indigo-500' : 'bg-white/15',
            )} />
          </div>
          {i < versions.length - 1 && (
            <div className="absolute left-[11px] top-1/2 h-full w-[1px] bg-white/5" />
          )}

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px]">{typeIcons[version.type]}</span>
                <span className="text-[11px] text-white/50 font-medium">{version.description}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] text-white/20">{version.authorName}</span>
                <span className="text-[9px] text-white/15">{timeAgo(version.timestamp)}</span>
                <span className="text-[9px] text-white/15">{version.changeCount} changes</span>
              </div>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
              <button
                onClick={(e) => { e.stopPropagation(); onRestore(version.id); }}
                className="px-1.5 py-0.5 text-[9px] text-white/30 hover:text-white/60 bg-white/5 rounded"
              >
                Restore
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Activity Feed
 * ────────────────────────────────────────────── */

function ActivityFeed({ activities }: { activities: ActivityEntry[] }) {
  const typeIcons: Record<string, string> = {
    widget: '🔲',
    page: '📄',
    style: '🎨',
    comment: '💬',
    version: '📌',
    settings: '⚙️',
  };

  return (
    <div className="space-y-1">
      {activities.map((activity, i) => (
        <motion.div
          key={activity.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.02 }}
          className="flex items-start gap-2 px-2 py-1.5 rounded hover:bg-white/3"
        >
          <span className="text-[10px] flex-shrink-0 mt-0.5">
            {typeIcons[activity.type] ?? '📋'}
          </span>
          <div className="flex-1 min-w-0">
            <span className="text-[11px] text-white/40">
              <span className="text-white/60 font-medium">{activity.userName}</span>
              {' '}{activity.action}{' '}
              <span className="text-indigo-400/60">{activity.target}</span>
            </span>
          </div>
          <span className="text-[9px] text-white/15 flex-shrink-0">{timeAgo(activity.timestamp)}</span>
        </motion.div>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Collaborator List
 * ────────────────────────────────────────────── */

interface CollaboratorListProps {
  collaborators: Collaborator[];
  currentUserId: string;
  onInvite: () => void;
  onRemove: (id: string) => void;
  onRoleChange: (id: string, role: Collaborator['role']) => void;
}

function CollaboratorList({ collaborators, currentUserId, onInvite, onRemove, onRoleChange }: CollaboratorListProps) {
  const sorted = useMemo(() => {
    const statusOrder = { online: 0, away: 1, offline: 2 };
    return [...collaborators].sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
  }, [collaborators]);

  const onlineCount = collaborators.filter(c => c.status === 'online').length;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] text-white/20">
          {onlineCount} online · {collaborators.length} total
        </span>
        <button
          onClick={onInvite}
          className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
        >
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <line x1="20" y1="8" x2="20" y2="14" />
            <line x1="23" y1="11" x2="17" y2="11" />
          </svg>
          Invite
        </button>
      </div>

      {sorted.map(collaborator => (
        <div key={collaborator.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/3 group">
          <Avatar
            name={collaborator.name}
            avatar={collaborator.avatar}
            color={collaborator.color}
            size="sm"
            status={collaborator.status}
            showStatus
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-white/50 truncate">{collaborator.name}</span>
              {collaborator.id === currentUserId && (
                <span className="text-[8px] text-white/20 bg-white/5 px-1 rounded">you</span>
              )}
            </div>
            <span className="text-[9px] text-white/15">{collaborator.role}</span>
          </div>

          {collaborator.id !== currentUserId && (
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
              <select
                value={collaborator.role}
                onChange={(e) => onRoleChange(collaborator.id, e.target.value as Collaborator['role'])}
                className="text-[9px] bg-white/5 border border-white/10 rounded text-white/40 px-1 py-0.5"
              >
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
                <option value="commenter">Commenter</option>
              </select>
              <button
                onClick={() => onRemove(collaborator.id)}
                className="text-white/15 hover:text-red-400 p-0.5"
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Invite Modal
 * ────────────────────────────────────────────── */

function InviteModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Collaborator['role']>('editor');
  const [link, setLink] = useState('https://builder.app/invite/abc123');
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-[#1e1e2e] border border-white/10 rounded-xl p-6 w-[440px] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm text-white/70 font-medium mb-4">Invite Collaborators</h3>

            {/* Email invite */}
            <div className="space-y-2 mb-5">
              <label className="text-[10px] text-white/30">Invite by email</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-lg
                             text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50"
                />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Collaborator['role'])}
                  className="px-2 py-2 text-xs bg-white/5 border border-white/10 rounded-lg
                             text-white/50 focus:outline-none focus:border-indigo-500/50"
                >
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                  <option value="commenter">Commenter</option>
                </select>
              </div>
              <button className="w-full py-2 text-xs bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg">
                Send Invite
              </button>
            </div>

            {/* Link invite */}
            <div className="space-y-2">
              <label className="text-[10px] text-white/30">Or share invite link</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={link}
                  readOnly
                  className="flex-1 px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-lg
                             text-white/40 font-mono"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-2 text-xs bg-white/5 hover:bg-white/10 text-white/50 rounded-lg border border-white/10"
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <button onClick={onClose} className="mt-4 text-[10px] text-white/20 hover:text-white/40">
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ──────────────────────────────────────────────
 * Main Collaboration Panel
 * ────────────────────────────────────────────── */

interface CollaborationPanelProps {
  className?: string;
}

export function CollaborationPanel({ className }: CollaborationPanelProps) {
  const currentUserId = 'user-1';

  // State
  const [activeTab, setActiveTab] = useState<'people' | 'comments' | 'versions' | 'activity'>('people');
  const [showInvite, setShowInvite] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentFilter, setCommentFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const [typingUsers] = useState<string[]>(['Jane']);

  // Mock data
  const [collaborators] = useState<Collaborator[]>([
    { id: 'user-1', name: 'You', email: 'you@example.com', color: '#89b4fa', status: 'online', lastActive: Date.now(), role: 'owner' },
    { id: 'user-2', name: 'Jane Smith', email: 'jane@example.com', color: '#f38ba8', status: 'online', cursor: { x: 350, y: 200 }, lastActive: Date.now(), role: 'editor' },
    { id: 'user-3', name: 'Alex Chen', email: 'alex@example.com', color: '#a6e3a1', status: 'away', lastActive: Date.now() - 300000, role: 'editor' },
    { id: 'user-4', name: 'Sam Johnson', email: 'sam@example.com', color: '#f9e2af', status: 'offline', lastActive: Date.now() - 3600000, role: 'viewer' },
  ]);

  const [comments, setComments] = useState<Comment[]>([
    {
      id: 'comment-1',
      authorId: 'user-2',
      authorName: 'Jane Smith',
      text: 'Should we use a different font for the heading?',
      timestamp: Date.now() - 1800000,
      resolved: false,
      position: { x: 200, y: 150 },
      widgetId: 'widget-1',
      replies: [
        { id: 'reply-1', authorId: 'user-1', authorName: 'You', text: 'Good idea! I suggest Inter or Manrope.', timestamp: Date.now() - 1200000 },
      ],
      reactions: [
        { emoji: '👍', users: ['user-3'] },
      ],
    },
    {
      id: 'comment-2',
      authorId: 'user-3',
      authorName: 'Alex Chen',
      text: 'The spacing between these cards needs adjustment. Can we add more padding?',
      timestamp: Date.now() - 7200000,
      resolved: true,
      replies: [],
      reactions: [
        { emoji: '✅', users: ['user-1', 'user-2'] },
      ],
    },
    {
      id: 'comment-3',
      authorId: 'user-1',
      authorName: 'You',
      text: 'TODO: Add responsive breakpoints for the hero section',
      timestamp: Date.now() - 3600000,
      resolved: false,
      replies: [],
      reactions: [],
    },
  ]);

  const [versions] = useState<VersionEntry[]>([
    { id: 'v-1', authorId: 'user-1', authorName: 'You', timestamp: Date.now() - 300000, description: 'Updated hero section layout', changeCount: 5, type: 'manual' },
    { id: 'v-2', authorId: 'user-2', authorName: 'Jane Smith', timestamp: Date.now() - 900000, description: 'Added navigation bar', changeCount: 12, type: 'manual' },
    { id: 'v-3', authorId: 'user-1', authorName: 'You', timestamp: Date.now() - 1800000, description: 'Auto-save', changeCount: 3, type: 'auto' },
    { id: 'v-4', authorId: 'user-3', authorName: 'Alex Chen', timestamp: Date.now() - 3600000, description: 'Redesigned footer', changeCount: 8, type: 'manual' },
    { id: 'v-5', authorId: 'user-1', authorName: 'You', timestamp: Date.now() - 7200000, description: 'Initial project setup', changeCount: 24, type: 'manual' },
  ]);

  const [activities] = useState<ActivityEntry[]>([
    { id: 'act-1', userId: 'user-2', userName: 'Jane', action: 'modified', target: 'Header widget', timestamp: Date.now() - 60000, type: 'widget' },
    { id: 'act-2', userId: 'user-1', userName: 'You', action: 'added a comment on', target: 'Hero Section', timestamp: Date.now() - 120000, type: 'comment' },
    { id: 'act-3', userId: 'user-3', userName: 'Alex', action: 'saved version', target: 'v2.1', timestamp: Date.now() - 300000, type: 'version' },
    { id: 'act-4', userId: 'user-2', userName: 'Jane', action: 'added', target: 'Button widget', timestamp: Date.now() - 600000, type: 'widget' },
    { id: 'act-5', userId: 'user-1', userName: 'You', action: 'changed styles on', target: 'Card Grid', timestamp: Date.now() - 900000, type: 'style' },
    { id: 'act-6', userId: 'user-3', userName: 'Alex', action: 'created page', target: 'About', timestamp: Date.now() - 1800000, type: 'page' },
    { id: 'act-7', userId: 'user-2', userName: 'Jane', action: 'resolved comment on', target: 'Navigation', timestamp: Date.now() - 3600000, type: 'comment' },
    { id: 'act-8', userId: 'user-1', userName: 'You', action: 'updated settings', target: 'Theme', timestamp: Date.now() - 7200000, type: 'settings' },
  ]);

  // Handlers
  const handleReply = (commentId: string, text: string) => {
    setComments(prev => prev.map(c =>
      c.id === commentId
        ? {
          ...c,
          replies: [
            ...c.replies,
            { id: `reply-${Date.now()}`, authorId: currentUserId, authorName: 'You', text, timestamp: Date.now() },
          ],
        }
        : c,
    ));
  };

  const handleResolve = (commentId: string) => {
    setComments(prev => prev.map(c =>
      c.id === commentId ? { ...c, resolved: !c.resolved } : c,
    ));
  };

  const handleReact = (commentId: string, emoji: string) => {
    setComments(prev => prev.map(c => {
      if (c.id !== commentId) return c;
      const existing = c.reactions.find(r => r.emoji === emoji);
      if (existing) {
        if (existing.users.includes(currentUserId)) {
          return {
            ...c,
            reactions: c.reactions.map(r =>
              r.emoji === emoji
                ? { ...r, users: r.users.filter(u => u !== currentUserId) }
                : r,
            ).filter(r => r.users.length > 0),
          };
        }
        return {
          ...c,
          reactions: c.reactions.map(r =>
            r.emoji === emoji ? { ...r, users: [...r.users, currentUserId] } : r,
          ),
        };
      }
      return {
        ...c,
        reactions: [...c.reactions, { emoji, users: [currentUserId] }],
      };
    }));
  };

  const handleDeleteComment = (commentId: string) => {
    setComments(prev => prev.filter(c => c.id !== commentId));
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    setComments(prev => [
      ...prev,
      {
        id: `comment-${Date.now()}`,
        authorId: currentUserId,
        authorName: 'You',
        text: newComment.trim(),
        timestamp: Date.now(),
        resolved: false,
        replies: [],
        reactions: [],
      },
    ]);
    setNewComment('');
  };

  const filteredComments = comments.filter(c => {
    if (commentFilter === 'open') return !c.resolved;
    if (commentFilter === 'resolved') return c.resolved;
    return true;
  });

  const tabs = [
    { key: 'people' as const, label: 'People', count: collaborators.filter(c => c.status === 'online').length },
    { key: 'comments' as const, label: 'Comments', count: comments.filter(c => !c.resolved).length },
    { key: 'versions' as const, label: 'Versions', count: versions.length },
    { key: 'activity' as const, label: 'Activity' },
  ];

  return (
    <div className={clsx('flex flex-col h-full bg-[#1e1e2e]', className)}>
      {/* Header */}
      <div className="px-3 py-2 border-b border-white/5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-white/50 font-medium">Collaboration</span>
          <AvatarStack collaborators={collaborators.filter(c => c.status === 'online')} />
        </div>

        {/* Tabs */}
        <div className="flex gap-0.5">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={clsx(
                'flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] rounded',
                activeTab === tab.key
                  ? 'bg-indigo-500/15 text-indigo-400'
                  : 'text-white/30 hover:text-white/50',
              )}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={clsx(
                  'px-1 rounded text-[8px]',
                  activeTab === tab.key ? 'bg-indigo-500/20' : 'bg-white/5',
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto px-3 py-3">
        {activeTab === 'people' && (
          <CollaboratorList
            collaborators={collaborators}
            currentUserId={currentUserId}
            onInvite={() => setShowInvite(true)}
            onRemove={() => {}}
            onRoleChange={() => {}}
          />
        )}

        {activeTab === 'comments' && (
          <div className="space-y-3">
            {/* Filter */}
            <div className="flex gap-1">
              {(['all', 'open', 'resolved'] as const).map(filter => (
                <button
                  key={filter}
                  onClick={() => setCommentFilter(filter)}
                  className={clsx(
                    'px-2 py-1 text-[10px] rounded capitalize',
                    commentFilter === filter
                      ? 'bg-white/10 text-white/60'
                      : 'text-white/25 hover:text-white/40',
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* New comment */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                className="flex-1 px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-lg
                           text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50"
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="px-3 py-2 text-xs bg-indigo-500 disabled:bg-white/5 disabled:text-white/20
                           text-white rounded-lg"
              >
                Post
              </button>
            </div>

            {/* Typing indicator */}
            <AnimatePresence>
              <TypingIndicator names={typingUsers} />
            </AnimatePresence>

            {/* Comment list */}
            <AnimatePresence mode="popLayout">
              {filteredComments.map(comment => (
                <CommentThread
                  key={comment.id}
                  comment={comment}
                  currentUserId={currentUserId}
                  onReply={handleReply}
                  onResolve={handleResolve}
                  onReact={handleReact}
                  onDelete={handleDeleteComment}
                />
              ))}
            </AnimatePresence>

            {filteredComments.length === 0 && (
              <div className="text-center py-8">
                <span className="text-2xl block mb-2">💬</span>
                <span className="text-xs text-white/20">No comments</span>
              </div>
            )}
          </div>
        )}

        {activeTab === 'versions' && (
          <VersionHistory
            versions={versions}
            onRestore={() => {}}
            onCompare={() => {}}
          />
        )}

        {activeTab === 'activity' && (
          <ActivityFeed activities={activities} />
        )}
      </div>

      {/* Invite modal */}
      <InviteModal isOpen={showInvite} onClose={() => setShowInvite(false)} />
    </div>
  );
}

export default CollaborationPanel;
