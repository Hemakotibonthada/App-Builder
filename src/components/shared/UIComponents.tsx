/**
 * Comprehensive UI Component Library
 * 
 * Production-grade, animated React components:
 * 1. Modal - animated overlay dialog
 * 2. Dropdown - customizable select/menu
 * 3. Tabs - animated tab navigation
 * 4. Tooltip - positioned tooltips
 * 5. Popover - rich content popovers
 * 6. Badge - status/count badges
 * 7. Avatar - user/team avatars
 * 8. Skeleton - loading skeletons
 * 9. Progress - progress bars/rings
 * 10. Switch - animated toggle switch
 * 11. Slider - range slider
 * 12. Breadcrumbs - navigation breadcrumbs
 * 13. Accordion - collapsible sections
 * 14. Alert - contextual alert banners
 * 15. Chip/Tag - removable tags
 * 16. Divider - visual separator
 * 17. EmptyState - placeholder content
 * 18. Kbd - keyboard shortcut display
 * 19. ContextMenu - right-click menus
 * 20. Spinner - loading spinner
 */

'use client';

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  createContext,
  useContext,
  forwardRef,
} from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { createPortal } from 'react-dom';
import { cn } from '@/utils';

/* ═══════════════════════════════════════════════════════════════
 * 1. MODAL
 * ═══════════════════════════════════════════════════════════════ */

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  showCloseButton?: boolean;
  className?: string;
  overlayClassName?: string;
  footer?: React.ReactNode;
}

const modalSizes: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-[90vw] max-h-[90vh]',
};

const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 350 } },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.15 } },
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEsc = true,
  showCloseButton = true,
  className,
  overlayClassName,
  footer,
}: ModalProps) {
  useEffect(() => {
    if (!closeOnEsc || !isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, closeOnEsc, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (typeof window === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <motion.div
            className={cn(
              'fixed inset-0 bg-black/60 backdrop-blur-sm',
              overlayClassName,
            )}
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={closeOnOverlayClick ? onClose : undefined}
          />

          <motion.div
            className={cn(
              'relative z-10 w-full rounded-xl bg-white dark:bg-gray-900',
              'border border-gray-200 dark:border-gray-700',
              'shadow-2xl',
              modalSizes[size],
              className,
            )}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div>
                  {title && (
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {description}
                    </p>
                  )}
                </div>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            )}

            {/* Body */}
            <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/* ═══════════════════════════════════════════════════════════════
 * 2. DROPDOWN
 * ═══════════════════════════════════════════════════════════════ */

interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  description?: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  searchable?: boolean;
}

export function Dropdown({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  label,
  disabled = false,
  className,
  searchable = false,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredOptions = useMemo(() => {
    if (!searchable || !search) return options;
    return options.filter(o =>
      o.label.toLowerCase().includes(search.toLowerCase()),
    );
  }, [options, search, searchable]);

  const selectedOption = options.find(o => o.value === value);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(i => Math.min(i + 1, filteredOptions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          const opt = filteredOptions[highlightedIndex];
          if (!opt.disabled) {
            onChange?.(opt.value);
            setIsOpen(false);
            setSearch('');
          }
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearch('');
        break;
    }
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={cn(
          'w-full flex items-center justify-between px-3 py-2',
          'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600',
          'rounded-lg text-sm',
          'hover:border-indigo-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20',
          'transition-all duration-200',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        <span className={selectedOption ? 'text-gray-900 dark:text-white' : 'text-gray-400'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          className="w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute z-50 w-full mt-1',
              'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
              'rounded-lg shadow-xl overflow-hidden',
            )}
          >
            {searchable && (
              <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                <input
                  type="text"
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            )}
            <div className="max-h-60 overflow-y-auto py-1">
              {filteredOptions.map((option, index) => (
                <button
                  key={option.value}
                  disabled={option.disabled}
                  onClick={() => {
                    if (!option.disabled) {
                      onChange?.(option.value);
                      setIsOpen(false);
                      setSearch('');
                    }
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-sm text-left',
                    'transition-colors duration-100',
                    option.value === value && 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
                    index === highlightedIndex && 'bg-gray-50 dark:bg-gray-700',
                    option.disabled && 'opacity-50 cursor-not-allowed',
                    !option.disabled && 'hover:bg-gray-50 dark:hover:bg-gray-700',
                  )}
                >
                  {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
                  <div className="flex-1 min-w-0">
                    <span className="block truncate">{option.label}</span>
                    {option.description && (
                      <span className="block text-xs text-gray-400 truncate">{option.description}</span>
                    )}
                  </div>
                  {option.value === value && (
                    <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
              {filteredOptions.length === 0 && (
                <div className="px-3 py-4 text-center text-sm text-gray-400">
                  No options found
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
 * 3. TABS
 * ═══════════════════════════════════════════════════════════════ */

interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
  content?: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab?: string;
  onChange?: (tabId: string) => void;
  variant?: 'line' | 'pill' | 'enclosed';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullWidth?: boolean;
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
  variant = 'line',
  size = 'md',
  className,
  fullWidth = false,
}: TabsProps) {
  const [active, setActive] = useState(activeTab ?? tabs[0]?.id ?? '');

  const handleTabChange = (id: string) => {
    setActive(id);
    onChange?.(id);
  };

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-5 py-2.5',
  };

  const currentTab = tabs.find(t => t.id === active);

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'flex',
          variant === 'line' && 'border-b border-gray-200 dark:border-gray-700',
          variant === 'pill' && 'bg-gray-100 dark:bg-gray-800 rounded-lg p-1',
          variant === 'enclosed' && 'gap-1',
          fullWidth && 'w-full',
        )}
      >
        {tabs.map(tab => (
          <button
            key={tab.id}
            disabled={tab.disabled}
            onClick={() => !tab.disabled && handleTabChange(tab.id)}
            className={cn(
              'relative flex items-center gap-2 font-medium transition-all duration-200',
              sizeClasses[size],
              fullWidth && 'flex-1 justify-center',
              tab.disabled && 'opacity-50 cursor-not-allowed',
              variant === 'line' && [
                'border-b-2 -mb-px',
                tab.id === active
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300',
              ],
              variant === 'pill' && [
                'rounded-md',
                tab.id === active
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300',
              ],
              variant === 'enclosed' && [
                'rounded-t-lg border border-b-0',
                tab.id === active
                  ? 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white'
                  : 'bg-gray-50 dark:bg-gray-800 border-transparent text-gray-500 hover:text-gray-700',
              ],
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className="px-1.5 py-0.5 text-xs rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                {tab.badge}
              </span>
            )}
            {variant === 'line' && tab.id === active && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"
                layoutId="tab-underline"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {currentTab?.content && (
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="py-4"
          >
            {currentTab.content}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
 * 4. TOOLTIP
 * ═══════════════════════════════════════════════════════════════ */

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 300,
  className,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  const show = () => {
    timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
  };

  const hide = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const animate = {
    top: { initial: { opacity: 0, y: 4 }, animate: { opacity: 1, y: 0 } },
    bottom: { initial: { opacity: 0, y: -4 }, animate: { opacity: 1, y: 0 } },
    left: { initial: { opacity: 0, x: 4 }, animate: { opacity: 1, x: 0 } },
    right: { initial: { opacity: 0, x: -4 }, animate: { opacity: 1, x: 0 } },
  };

  return (
    <div className="relative inline-flex" onMouseEnter={show} onMouseLeave={hide}>
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={cn(
              'absolute z-50 pointer-events-none',
              'px-2.5 py-1.5 text-xs font-medium',
              'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900',
              'rounded-md shadow-lg whitespace-nowrap',
              positionClasses[position],
              className,
            )}
            {...animate[position]}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
 * 5. BADGE
 * ═══════════════════════════════════════════════════════════════ */

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'solid' | 'outline' | 'subtle';
  color?: 'gray' | 'red' | 'green' | 'blue' | 'yellow' | 'purple' | 'pink' | 'indigo';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  dot?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
}

const badgeColors = {
  solid: {
    gray: 'bg-gray-600 text-white',
    red: 'bg-red-500 text-white',
    green: 'bg-green-500 text-white',
    blue: 'bg-blue-500 text-white',
    yellow: 'bg-yellow-500 text-white',
    purple: 'bg-purple-500 text-white',
    pink: 'bg-pink-500 text-white',
    indigo: 'bg-indigo-500 text-white',
  },
  outline: {
    gray: 'border border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-400',
    red: 'border border-red-300 text-red-600 dark:border-red-800 dark:text-red-400',
    green: 'border border-green-300 text-green-600 dark:border-green-800 dark:text-green-400',
    blue: 'border border-blue-300 text-blue-600 dark:border-blue-800 dark:text-blue-400',
    yellow: 'border border-yellow-300 text-yellow-600 dark:border-yellow-800 dark:text-yellow-400',
    purple: 'border border-purple-300 text-purple-600 dark:border-purple-800 dark:text-purple-400',
    pink: 'border border-pink-300 text-pink-600 dark:border-pink-800 dark:text-pink-400',
    indigo: 'border border-indigo-300 text-indigo-600 dark:border-indigo-800 dark:text-indigo-400',
  },
  subtle: {
    gray: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    pink: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
    indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  },
};

export function Badge({
  children,
  variant = 'subtle',
  color = 'gray',
  size = 'md',
  rounded = false,
  dot = false,
  removable = false,
  onRemove,
  className,
}: BadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-xs px-2 py-0.5',
    lg: 'text-sm px-2.5 py-1',
  };

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      className={cn(
        'inline-flex items-center gap-1 font-medium',
        sizeClasses[size],
        rounded ? 'rounded-full' : 'rounded-md',
        badgeColors[variant][color],
        className,
      )}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full', {
          'bg-current': true,
        })} />
      )}
      {children}
      {removable && (
        <button
          onClick={onRemove}
          className="ml-0.5 -mr-0.5 p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </motion.span>
  );
}

/* ═══════════════════════════════════════════════════════════════
 * 6. AVATAR
 * ═══════════════════════════════════════════════════════════════ */

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'square';
  status?: 'online' | 'offline' | 'busy' | 'away';
  className?: string;
}

export function Avatar({
  src,
  alt,
  name,
  size = 'md',
  shape = 'circle',
  status,
  className,
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);

  const sizeMap = { xs: 'w-6 h-6 text-xs', sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-lg' };
  const statusColors = { online: 'bg-green-500', offline: 'bg-gray-400', busy: 'bg-red-500', away: 'bg-yellow-500' };
  const statusSizes = { xs: 'w-1.5 h-1.5', sm: 'w-2 h-2', md: 'w-2.5 h-2.5', lg: 'w-3 h-3', xl: 'w-3.5 h-3.5' };

  const initials = name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() ?? '?';

  const colors = ['bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-teal-500', 'bg-orange-500', 'bg-cyan-500'];
  const colorIndex = (name?.charCodeAt(0) ?? 0) % colors.length;

  return (
    <div className={cn('relative inline-flex', className)}>
      <div
        className={cn(
          'flex items-center justify-center overflow-hidden',
          sizeMap[size],
          shape === 'circle' ? 'rounded-full' : 'rounded-lg',
          (!src || imgError) && colors[colorIndex],
          'text-white font-semibold',
          'ring-2 ring-white dark:ring-gray-900',
        )}
      >
        {src && !imgError ? (
          <img
            src={src}
            alt={alt ?? name ?? 'avatar'}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full ring-2 ring-white dark:ring-gray-900',
            statusSizes[size],
            statusColors[status],
          )}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
 * 7. SKELETON
 * ═══════════════════════════════════════════════════════════════ */

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: number | string;
  height?: number | string;
  lines?: number;
  className?: string;
  animate?: boolean;
}

export function Skeleton({
  variant = 'text',
  width,
  height,
  lines = 1,
  className,
  animate = true,
}: SkeletonProps) {
  const baseClasses = cn(
    'bg-gray-200 dark:bg-gray-700',
    animate && 'animate-pulse',
    className,
  );

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(baseClasses, 'h-4 rounded')}
            style={{
              width: i === lines - 1 ? '75%' : width ?? '100%',
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        baseClasses,
        variant === 'text' && 'h-4 rounded',
        variant === 'circular' && 'rounded-full',
        variant === 'rectangular' && 'rounded-none',
        variant === 'rounded' && 'rounded-lg',
      )}
      style={{
        width: width ?? (variant === 'circular' ? 40 : '100%'),
        height: height ?? (variant === 'circular' ? 40 : variant === 'text' ? 16 : 100),
      }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════
 * 8. PROGRESS
 * ═══════════════════════════════════════════════════════════════ */

interface ProgressProps {
  value: number;
  max?: number;
  variant?: 'bar' | 'ring';
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  striped?: boolean;
  className?: string;
}

export function Progress({
  value,
  max = 100,
  variant = 'bar',
  size = 'md',
  color = 'indigo',
  showLabel = false,
  label,
  animated = true,
  striped = false,
  className,
}: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  if (variant === 'ring') {
    const ringSize = { sm: 32, md: 48, lg: 64 }[size];
    const strokeWidth = { sm: 3, md: 4, lg: 6 }[size];
    const radius = (ringSize - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div className={cn('relative inline-flex items-center justify-center', className)}>
        <svg width={ringSize} height={ringSize} className="-rotate-90">
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-gray-200 dark:text-gray-700"
          />
          <motion.circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className={`text-${color}-500`}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: animated ? 0.6 : 0, ease: 'easeOut' }}
          />
        </svg>
        {showLabel && (
          <span className={cn('absolute text-xs font-medium', {
            'text-[10px]': size === 'sm',
            'text-sm': size === 'lg',
          })}>
            {label ?? `${Math.round(percentage)}%`}
          </span>
        )}
      </div>
    );
  }

  const barHeight = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' }[size];

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {label ?? 'Progress'}
          </span>
          <span className="text-xs font-medium text-gray-500">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div className={cn('w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden', barHeight)}>
        <motion.div
          className={cn(
            `h-full rounded-full bg-${color}-500`,
            striped && 'bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:20px_100%]',
          )}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: animated ? 0.6 : 0, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
 * 9. SWITCH
 * ═══════════════════════════════════════════════════════════════ */

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  size = 'md',
  color = 'indigo',
  className,
}: SwitchProps) {
  const trackSize = { sm: 'w-8 h-4', md: 'w-11 h-6', lg: 'w-14 h-7' }[size];
  const thumbSize = { sm: 'w-3 h-3', md: 'w-5 h-5', lg: 'w-6 h-6' }[size];
  const thumbTranslate = { sm: 16, md: 20, lg: 28 }[size];

  return (
    <label className={cn('inline-flex items-center gap-3 cursor-pointer', disabled && 'opacity-50 cursor-not-allowed', className)}>
      <button
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          'relative inline-flex items-center rounded-full transition-colors duration-200',
          trackSize,
          checked ? `bg-${color}-500` : 'bg-gray-300 dark:bg-gray-600',
        )}
      >
        <motion.span
          className={cn(
            'absolute left-0.5 rounded-full bg-white shadow-sm',
            thumbSize,
          )}
          animate={{ x: checked ? thumbTranslate : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
      {(label || description) && (
        <div>
          {label && <span className="text-sm font-medium text-gray-900 dark:text-white">{label}</span>}
          {description && <p className="text-xs text-gray-500">{description}</p>}
        </div>
      )}
    </label>
  );
}

/* ═══════════════════════════════════════════════════════════════
 * 10. ACCORDION
 * ═══════════════════════════════════════════════════════════════ */

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpen?: string[];
  className?: string;
}

export function Accordion({
  items,
  allowMultiple = false,
  defaultOpen = [],
  className,
}: AccordionProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set(defaultOpen));

  const toggle = (id: string) => {
    setOpenIds(prev => {
      const next = new Set(allowMultiple ? prev : []);
      if (prev.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className={cn('divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden', className)}>
      {items.map(item => {
        const isOpen = openIds.has(item.id);
        return (
          <div key={item.id}>
            <button
              disabled={item.disabled}
              onClick={() => !item.disabled && toggle(item.id)}
              className={cn(
                'w-full flex items-center justify-between px-4 py-3 text-left',
                'text-sm font-medium text-gray-900 dark:text-white',
                'hover:bg-gray-50 dark:hover:bg-gray-800/50',
                'transition-colors duration-150',
                item.disabled && 'opacity-50 cursor-not-allowed',
              )}
            >
              <div className="flex items-center gap-2">
                {item.icon}
                <span>{item.title}</span>
              </div>
              <motion.svg
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </motion.svg>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 bg-gray-50/50 dark:bg-gray-800/30">
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
 * 11. ALERT
 * ═══════════════════════════════════════════════════════════════ */

interface AlertProps {
  type: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: React.ReactNode;
  className?: string;
  action?: { label: string; onClick: () => void };
}

const alertStyles = {
  info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
  success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
  warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
  error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
};

export function Alert({
  type,
  title,
  children,
  dismissible = false,
  onDismiss,
  icon,
  className,
  action,
}: AlertProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={cn(
        'flex gap-3 p-4 rounded-lg border',
        alertStyles[type],
        className,
      )}
    >
      {icon && <div className="flex-shrink-0 mt-0.5">{icon}</div>}
      <div className="flex-1 min-w-0">
        {title && <h4 className="text-sm font-semibold mb-1">{title}</h4>}
        <div className="text-sm">{children}</div>
        {action && (
          <button
            onClick={action.onClick}
            className="mt-2 text-sm font-medium underline hover:no-underline"
          >
            {action.label}
          </button>
        )}
      </div>
      {dismissible && (
        <button
          onClick={() => {
            setDismissed(true);
            onDismiss?.();
          }}
          className="flex-shrink-0 p-1 rounded hover:bg-black/5 dark:hover:bg-white/5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
 * 12. DIVIDER
 * ═══════════════════════════════════════════════════════════════ */

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  label?: string;
  className?: string;
}

export function Divider({ orientation = 'horizontal', label, className }: DividerProps) {
  if (orientation === 'vertical') {
    return <div className={cn('w-px h-full bg-gray-200 dark:bg-gray-700', className)} />;
  }

  if (label) {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</span>
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
      </div>
    );
  }

  return <div className={cn('h-px w-full bg-gray-200 dark:bg-gray-700', className)} />;
}

/* ═══════════════════════════════════════════════════════════════
 * 13. EMPTY STATE
 * ═══════════════════════════════════════════════════════════════ */

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}
    >
      {icon && (
        <div className="mb-4 text-gray-300 dark:text-gray-600">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-4">{description}</p>
      )}
      {action && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={action.onClick}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-500 rounded-lg hover:bg-indigo-600 transition-colors"
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
 * 14. KBD
 * ═══════════════════════════════════════════════════════════════ */

interface KbdProps {
  children: React.ReactNode;
  className?: string;
}

export function Kbd({ children, className }: KbdProps) {
  return (
    <kbd
      className={cn(
        'inline-flex items-center px-1.5 py-0.5',
        'text-xs font-mono font-medium',
        'bg-gray-100 dark:bg-gray-800',
        'border border-gray-300 dark:border-gray-600',
        'rounded shadow-sm',
        'text-gray-700 dark:text-gray-300',
        className,
      )}
    >
      {children}
    </kbd>
  );
}

/* ═══════════════════════════════════════════════════════════════
 * 15. SPINNER
 * ═══════════════════════════════════════════════════════════════ */

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  className?: string;
  label?: string;
}

export function Spinner({ size = 'md', color, className, label }: SpinnerProps) {
  const sizeClasses = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8', xl: 'w-12 h-12' };
  const borderWidths = { sm: 'border-2', md: 'border-2', lg: 'border-[3px]', xl: 'border-4' };

  return (
    <div className={cn('inline-flex flex-col items-center gap-2', className)}>
      <motion.div
        className={cn(
          'rounded-full',
          sizeClasses[size],
          borderWidths[size],
          'border-gray-200 dark:border-gray-700',
          color ? `border-t-${color}` : 'border-t-indigo-500',
        )}
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
      />
      {label && <span className="text-xs text-gray-500">{label}</span>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
 * 16. SLIDER
 * ═══════════════════════════════════════════════════════════════ */

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  showValue?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  showValue = true,
  disabled = false,
  className,
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn('w-full', disabled && 'opacity-50', className)}>
      {(label || showValue) && (
        <div className="flex justify-between mb-1.5">
          {label && (
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {label}
            </label>
          )}
          {showValue && (
            <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
              {value}
            </span>
          )}
        </div>
      )}
      <div className="relative h-5 flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={e => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-2 appearance-none bg-transparent cursor-pointer z-10
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-indigo-500
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:hover:scale-125
          "
        />
        {/* Track background */}
        <div className="absolute w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700" />
        {/* Track fill */}
        <div
          className="absolute h-2 rounded-full bg-indigo-500 pointer-events-none"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
 * 17. INPUT
 * ═══════════════════════════════════════════════════════════════ */

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  inputSize?: 'sm' | 'md' | 'lg';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, inputSize = 'md', className, ...props }, ref) => {
    const sizeClasses = {
      sm: 'py-1 text-xs',
      md: 'py-2 text-sm',
      lg: 'py-3 text-base',
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full rounded-lg border bg-white dark:bg-gray-800',
              'transition-all duration-200',
              sizeClasses[inputSize],
              leftIcon ? 'pl-10' : 'pl-3',
              rightIcon ? 'pr-10' : 'pr-3',
              error
                ? 'border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-red-500/20'
                : 'border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500/20',
              'focus:ring-2 focus:outline-none',
              'text-gray-900 dark:text-white',
              'placeholder:text-gray-400',
              props.disabled && 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900',
              className,
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 text-xs text-red-500"
          >
            {error}
          </motion.p>
        )}
        {hint && !error && (
          <p className="mt-1 text-xs text-gray-400">{hint}</p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

/* ═══════════════════════════════════════════════════════════════
 * 18. BUTTON (Enhanced)
 * ═══════════════════════════════════════════════════════════════ */

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'outline' | 'ghost' | 'link';
  color?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'solid', color = 'primary', size = 'md', leftIcon, rightIcon, loading, fullWidth, children, className, disabled, ...props }, ref) => {
    const colorStyles = {
      solid: {
        primary: 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-sm shadow-indigo-500/25',
        secondary: 'bg-gray-600 hover:bg-gray-700 text-white shadow-sm',
        danger: 'bg-red-500 hover:bg-red-600 text-white shadow-sm shadow-red-500/25',
        success: 'bg-green-500 hover:bg-green-600 text-white shadow-sm shadow-green-500/25',
        warning: 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-sm',
      },
      outline: {
        primary: 'border-2 border-indigo-500 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950',
        secondary: 'border-2 border-gray-300 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800',
        danger: 'border-2 border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-950',
        success: 'border-2 border-green-500 text-green-500 hover:bg-green-50 dark:hover:bg-green-950',
        warning: 'border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-950',
      },
      ghost: {
        primary: 'text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950',
        secondary: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
        danger: 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950',
        success: 'text-green-500 hover:bg-green-50 dark:hover:bg-green-950',
        warning: 'text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-950',
      },
      link: {
        primary: 'text-indigo-500 hover:underline',
        secondary: 'text-gray-500 hover:underline',
        danger: 'text-red-500 hover:underline',
        success: 'text-green-500 hover:underline',
        warning: 'text-yellow-500 hover:underline',
      },
    };

    const sizeClasses = {
      xs: 'px-2 py-1 text-xs',
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={!disabled && !loading ? { scale: 1.02 } : undefined}
        whileTap={!disabled && !loading ? { scale: 0.98 } : undefined}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium rounded-lg',
          'transition-colors duration-200',
          sizeClasses[size],
          colorStyles[variant][color],
          fullWidth && 'w-full',
          (disabled || loading) && 'opacity-50 cursor-not-allowed',
          className,
        )}
        {...(props as any)}
      >
        {loading ? (
          <Spinner size="sm" />
        ) : (
          leftIcon
        )}
        {children}
        {rightIcon && !loading && rightIcon}
      </motion.button>
    );
  },
);

Button.displayName = 'Button';

/* ═══════════════════════════════════════════════════════════════
 * 19. BREADCRUMBS
 * ═══════════════════════════════════════════════════════════════ */

interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
}

export function Breadcrumbs({
  items,
  separator,
  className,
}: BreadcrumbsProps) {
  const defaultSeparator = (
    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );

  return (
    <nav className={cn('flex items-center gap-1', className)}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <span className="flex-shrink-0">{separator ?? defaultSeparator}</span>
          )}
          {index === items.length - 1 ? (
            <span className="flex items-center gap-1 text-sm font-medium text-gray-900 dark:text-white">
              {item.icon}
              {item.label}
            </span>
          ) : (
            <button
              onClick={item.onClick}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              {item.icon}
              {item.label}
            </button>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

/* ═══════════════════════════════════════════════════════════════
 * 20. COMMAND PALETTE
 * ═══════════════════════════════════════════════════════════════ */

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  shortcut?: string;
  category?: string;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  items: CommandItem[];
  placeholder?: string;
}

export function CommandPalette({
  isOpen,
  onClose,
  items,
  placeholder = 'Type a command or search...',
}: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    if (!search) return items;
    const lower = search.toLowerCase();
    return items.filter(
      item =>
        item.label.toLowerCase().includes(lower) ||
        item.description?.toLowerCase().includes(lower) ||
        item.category?.toLowerCase().includes(lower),
    );
  }, [items, search]);

  // Group by category
  const grouped = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    for (const item of filtered) {
      const cat = item.category ?? 'General';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    }
    return groups;
  }, [filtered]);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, filtered.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action();
          onClose();
        }
        break;
      case 'Escape':
        onClose();
        break;
    }
  };

  if (typeof window === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-[15vh]">
          <motion.div
            className="fixed inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="relative z-10 w-full max-w-lg bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
          >
            <div className="flex items-center px-4 border-b border-gray-200 dark:border-gray-700">
              <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="w-full py-3 text-sm bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder:text-gray-400"
              />
            </div>

            <div className="max-h-80 overflow-y-auto py-2">
              {Object.entries(grouped).map(([category, categoryItems]) => (
                <div key={category}>
                  <div className="px-4 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {category}
                  </div>
                  {categoryItems.map((item, idx) => {
                    const flatIndex = filtered.indexOf(item);
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          item.action();
                          onClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(flatIndex)}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-2.5 text-left',
                          'transition-colors duration-75',
                          flatIndex === selectedIndex
                            ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800',
                        )}
                      >
                        {item.icon && <span className="flex-shrink-0 text-gray-400">{item.icon}</span>}
                        <div className="flex-1 min-w-0">
                          <span className="block text-sm font-medium truncate">{item.label}</span>
                          {item.description && (
                            <span className="block text-xs text-gray-400 truncate">{item.description}</span>
                          )}
                        </div>
                        {item.shortcut && (
                          <Kbd>{item.shortcut}</Kbd>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-gray-400">
                  No results found for &ldquo;{search}&rdquo;
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
