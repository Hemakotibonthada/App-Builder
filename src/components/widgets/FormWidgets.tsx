/**
 * Form Widgets — Complete Form Builder Components
 * 
 * A comprehensive set of form components with validation,
 * animations, accessibility, and responsive design.
 * Features 25+ form element types.
 */

'use client';

import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
  forwardRef,
  createContext,
  useContext,
} from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { clsx } from 'clsx';

/* ──────────────────────────────────────────────
 * Form Context — Manages Form State
 * ────────────────────────────────────────────── */

interface FormContextValue {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isDirty: boolean;
  setValue: (name: string, value: any) => void;
  setError: (name: string, error: string) => void;
  setTouched: (name: string) => void;
  validateField: (name: string) => boolean;
  registerField: (name: string, validator?: FieldValidator) => void;
  unregisterField: (name: string) => void;
}

type FieldValidator = (value: any) => string | undefined;

const FormContext = createContext<FormContextValue | null>(null);

function useFormContext() {
  const ctx = useContext(FormContext);
  if (!ctx) throw new Error('Form components must be used inside <FormProvider>');
  return ctx;
}

/* ──────────────────────────────────────────────
 * Validation Rules
 * ────────────────────────────────────────────── */

export const validators = {
  required: (msg = 'This field is required'): FieldValidator => (value) => {
    if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
      return msg;
    }
    return undefined;
  },

  email: (msg = 'Invalid email address'): FieldValidator => (value) => {
    if (!value) return undefined;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(value) ? undefined : msg;
  },

  minLength: (min: number, msg?: string): FieldValidator => (value) => {
    if (!value) return undefined;
    return String(value).length >= min
      ? undefined
      : msg ?? `Must be at least ${min} characters`;
  },

  maxLength: (max: number, msg?: string): FieldValidator => (value) => {
    if (!value) return undefined;
    return String(value).length <= max
      ? undefined
      : msg ?? `Must be no more than ${max} characters`;
  },

  pattern: (regex: RegExp, msg = 'Invalid format'): FieldValidator => (value) => {
    if (!value) return undefined;
    return regex.test(String(value)) ? undefined : msg;
  },

  min: (min: number, msg?: string): FieldValidator => (value) => {
    if (value === undefined || value === null || value === '') return undefined;
    return Number(value) >= min
      ? undefined
      : msg ?? `Must be at least ${min}`;
  },

  max: (max: number, msg?: string): FieldValidator => (value) => {
    if (value === undefined || value === null || value === '') return undefined;
    return Number(value) <= max
      ? undefined
      : msg ?? `Must be no more than ${max}`;
  },

  url: (msg = 'Invalid URL'): FieldValidator => (value) => {
    if (!value) return undefined;
    try { new URL(value); return undefined; } catch { return msg; }
  },

  phone: (msg = 'Invalid phone number'): FieldValidator => (value) => {
    if (!value) return undefined;
    const re = /^\+?[\d\s\-()]{7,15}$/;
    return re.test(value) ? undefined : msg;
  },

  compose: (...fns: FieldValidator[]): FieldValidator => (value) => {
    for (const fn of fns) {
      const err = fn(value);
      if (err) return err;
    }
    return undefined;
  },
};

/* ──────────────────────────────────────────────
 * FormProvider
 * ────────────────────────────────────────────── */

interface FormProviderProps {
  children: React.ReactNode;
  initialValues?: Record<string, any>;
  onSubmit?: (values: Record<string, any>) => void | Promise<void>;
  onChange?: (values: Record<string, any>) => void;
  className?: string;
}

export function FormProvider({
  children,
  initialValues = {},
  onSubmit,
  onChange,
  className,
}: FormProviderProps) {
  const [values, setValues] = useState<Record<string, any>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouchedState] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const fieldValidators = useRef<Record<string, FieldValidator>>({});

  const setValue = useCallback((name: string, value: any) => {
    setValues(prev => {
      const next = { ...prev, [name]: value };
      onChange?.(next);
      return next;
    });
    setIsDirty(true);
    // Clear error on change
    setErrors(prev => {
      const { [name]: _, ...rest } = prev;
      return rest;
    });
  }, [onChange]);

  const setError = useCallback((name: string, error: string) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  const setTouched = useCallback((name: string) => {
    setTouchedState(prev => ({ ...prev, [name]: true }));
  }, []);

  const registerField = useCallback((name: string, validator?: FieldValidator) => {
    if (validator) {
      fieldValidators.current[name] = validator;
    }
  }, []);

  const unregisterField = useCallback((name: string) => {
    delete fieldValidators.current[name];
  }, []);

  const validateField = useCallback((name: string): boolean => {
    const validator = fieldValidators.current[name];
    if (!validator) return true;
    const error = validator(values[name]);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
      return false;
    }
    setErrors(prev => {
      const { [name]: _, ...rest } = prev;
      return rest;
    });
    return true;
  }, [values]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    let hasErrors = false;
    const newErrors: Record<string, string> = {};
    for (const [name, validator] of Object.entries(fieldValidators.current)) {
      const error = validator(values[name]);
      if (error) {
        newErrors[name] = error;
        hasErrors = true;
      }
    }

    // Touch all fields
    const allTouched: Record<string, boolean> = {};
    for (const name of Object.keys(fieldValidators.current)) {
      allTouched[name] = true;
    }
    setTouchedState(prev => ({ ...prev, ...allTouched }));

    if (hasErrors) {
      setErrors(prev => ({ ...prev, ...newErrors }));
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit?.(values);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, onSubmit]);

  const ctx: FormContextValue = {
    values,
    errors,
    touched,
    isSubmitting,
    isDirty,
    setValue,
    setError,
    setTouched,
    validateField,
    registerField,
    unregisterField,
  };

  return (
    <FormContext.Provider value={ctx}>
      <form onSubmit={handleSubmit} className={className} noValidate>
        {children}
      </form>
    </FormContext.Provider>
  );
}

/* ──────────────────────────────────────────────
 * Field Error Display
 * ────────────────────────────────────────────── */

function FieldError({ name }: { name: string }) {
  const { errors, touched } = useFormContext();
  const error = errors[name];
  const isTouched = touched[name];

  return (
    <AnimatePresence>
      {error && isTouched && (
        <motion.p
          initial={{ opacity: 0, y: -4, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -4, height: 0 }}
          className="text-[11px] text-red-400 mt-1 flex items-center gap-1"
        >
          <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

/* ──────────────────────────────────────────────
 * TextField Component
 * ────────────────────────────────────────────── */

interface TextFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  validator?: FieldValidator;
  disabled?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
  helperText?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'underline' | 'glass';
  className?: string;
  maxLength?: number;
  showCharCount?: boolean;
}

export function TextField({
  name,
  label,
  placeholder,
  type = 'text',
  validator,
  disabled,
  readOnly,
  autoFocus,
  helperText,
  prefix,
  suffix,
  size = 'md',
  variant = 'default',
  className,
  maxLength,
  showCharCount,
}: TextFieldProps) {
  const { values, errors, touched, setValue, setTouched, registerField, unregisterField, validateField } = useFormContext();
  const [isFocused, setIsFocused] = useState(false);
  const value = values[name] ?? '';
  const hasError = !!(errors[name] && touched[name]);

  useEffect(() => {
    registerField(name, validator);
    return () => unregisterField(name);
  }, [name, validator, registerField, unregisterField]);

  const sizeClasses = {
    sm: 'h-8 text-xs px-2.5',
    md: 'h-10 text-sm px-3',
    lg: 'h-12 text-base px-4',
  };

  const variantClasses = {
    default: clsx(
      'border rounded-lg bg-white/5 backdrop-blur-sm',
      hasError
        ? 'border-red-400/60 focus-within:border-red-400'
        : isFocused
        ? 'border-indigo-400/60 ring-2 ring-indigo-400/20'
        : 'border-white/10 hover:border-white/20',
    ),
    filled: clsx(
      'rounded-lg border-0',
      hasError
        ? 'bg-red-500/10'
        : isFocused
        ? 'bg-indigo-500/10'
        : 'bg-white/8 hover:bg-white/12',
    ),
    underline: clsx(
      'border-0 border-b-2 rounded-none bg-transparent',
      hasError
        ? 'border-red-400'
        : isFocused
        ? 'border-indigo-400'
        : 'border-white/20 hover:border-white/30',
    ),
    glass: clsx(
      'rounded-xl border bg-white/5 backdrop-blur-xl shadow-lg',
      hasError
        ? 'border-red-400/40'
        : isFocused
        ? 'border-indigo-400/40 shadow-indigo-500/10'
        : 'border-white/10',
    ),
  };

  return (
    <div className={clsx('flex flex-col gap-1', className)}>
      {label && (
        <label className="text-xs font-medium text-white/70 flex items-center justify-between">
          <span>{label}</span>
          {showCharCount && maxLength && (
            <span className={clsx(
              'text-[10px] font-mono',
              String(value).length > maxLength ? 'text-red-400' : 'text-white/40',
            )}>
              {String(value).length}/{maxLength}
            </span>
          )}
        </label>
      )}
      <div className={clsx(
        'flex items-center transition-all duration-200',
        variantClasses[variant],
      )}>
        {prefix && (
          <div className="flex items-center px-2 text-white/40">
            {prefix}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => setValue(name, e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            setTouched(name);
            validateField(name);
          }}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          autoFocus={autoFocus}
          maxLength={maxLength}
          className={clsx(
            'flex-1 bg-transparent outline-none text-white placeholder:text-white/30',
            sizeClasses[size],
            disabled && 'opacity-50 cursor-not-allowed',
          )}
        />
        {suffix && (
          <div className="flex items-center px-2 text-white/40">
            {suffix}
          </div>
        )}
      </div>
      {helperText && !hasError && (
        <p className="text-[11px] text-white/40 mt-0.5">{helperText}</p>
      )}
      <FieldError name={name} />
    </div>
  );
}

/* ──────────────────────────────────────────────
 * TextArea Component
 * ────────────────────────────────────────────── */

interface TextAreaProps {
  name: string;
  label?: string;
  placeholder?: string;
  validator?: FieldValidator;
  disabled?: boolean;
  rows?: number;
  minRows?: number;
  maxRows?: number;
  autoResize?: boolean;
  maxLength?: number;
  showCharCount?: boolean;
  variant?: 'default' | 'filled' | 'glass';
  className?: string;
}

export function TextArea({
  name,
  label,
  placeholder,
  validator,
  disabled,
  rows = 4,
  minRows = 2,
  maxRows = 12,
  autoResize = true,
  maxLength,
  showCharCount,
  variant = 'default',
  className,
}: TextAreaProps) {
  const { values, errors, touched, setValue, setTouched, registerField, unregisterField, validateField } = useFormContext();
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const value = values[name] ?? '';
  const hasError = !!(errors[name] && touched[name]);

  useEffect(() => {
    registerField(name, validator);
    return () => unregisterField(name);
  }, [name, validator, registerField, unregisterField]);

  useEffect(() => {
    if (autoResize && textareaRef.current) {
      const el = textareaRef.current;
      el.style.height = 'auto';
      const lineHeight = parseInt(getComputedStyle(el).lineHeight) || 20;
      const minH = minRows * lineHeight;
      const maxH = maxRows * lineHeight;
      const scrollH = el.scrollHeight;
      el.style.height = `${Math.min(Math.max(scrollH, minH), maxH)}px`;
    }
  }, [value, autoResize, minRows, maxRows]);

  return (
    <div className={clsx('flex flex-col gap-1', className)}>
      {label && (
        <label className="text-xs font-medium text-white/70 flex items-center justify-between">
          <span>{label}</span>
          {showCharCount && maxLength && (
            <span className={clsx(
              'text-[10px] font-mono',
              String(value).length > maxLength ? 'text-red-400' : 'text-white/40',
            )}>
              {String(value).length}/{maxLength}
            </span>
          )}
        </label>
      )}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(name, e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          setTouched(name);
          validateField(name);
        }}
        placeholder={placeholder}
        disabled={disabled}
        rows={autoResize ? minRows : rows}
        maxLength={maxLength}
        className={clsx(
          'w-full bg-white/5 text-white text-sm p-3 outline-none rounded-lg border transition-all duration-200',
          'placeholder:text-white/30 resize-none scrollbar-thin scrollbar-thumb-white/10',
          hasError
            ? 'border-red-400/60'
            : isFocused
            ? 'border-indigo-400/60 ring-2 ring-indigo-400/20'
            : 'border-white/10 hover:border-white/20',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      />
      <FieldError name={name} />
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Select Component
 * ────────────────────────────────────────────── */

interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  group?: string;
}

interface SelectProps {
  name: string;
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  validator?: FieldValidator;
  disabled?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  multiple?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Select({
  name,
  label,
  options,
  placeholder = 'Select...',
  validator,
  disabled,
  searchable = false,
  clearable = false,
  multiple = false,
  size = 'md',
  className,
}: SelectProps) {
  const { values, errors, touched, setValue, setTouched, registerField, unregisterField, validateField } = useFormContext();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const value = values[name];
  const hasError = !!(errors[name] && touched[name]);

  useEffect(() => {
    registerField(name, validator);
    return () => unregisterField(name);
  }, [name, validator, registerField, unregisterField]);

  // Close on outside click
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const filteredOptions = useMemo(() => {
    if (!search) return options;
    const lower = search.toLowerCase();
    return options.filter(o => o.label.toLowerCase().includes(lower));
  }, [options, search]);

  const selectedOption = options.find(o => o.value === value);
  const selectedMultiple = multiple && Array.isArray(value)
    ? options.filter(o => value.includes(o.value))
    : [];

  const handleSelect = useCallback((opt: SelectOption) => {
    if (opt.disabled) return;
    if (multiple) {
      const current = Array.isArray(value) ? value : [];
      const next = current.includes(opt.value)
        ? current.filter((v: string) => v !== opt.value)
        : [...current, opt.value];
      setValue(name, next);
    } else {
      setValue(name, opt.value);
      setIsOpen(false);
    }
    setSearch('');
  }, [multiple, value, name, setValue]);

  const sizeMap = {
    sm: 'h-8 text-xs',
    md: 'h-10 text-sm',
    lg: 'h-12 text-base',
  };

  return (
    <div ref={containerRef} className={clsx('flex flex-col gap-1 relative', className)}>
      {label && (
        <label className="text-xs font-medium text-white/70">{label}</label>
      )}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={clsx(
          'flex items-center justify-between px-3 rounded-lg border transition-all duration-200 text-left',
          sizeMap[size],
          hasError
            ? 'border-red-400/60 bg-red-500/5'
            : isOpen
            ? 'border-indigo-400/60 ring-2 ring-indigo-400/20 bg-white/5'
            : 'border-white/10 bg-white/5 hover:border-white/20',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        <span className={clsx(
          multiple
            ? selectedMultiple.length > 0 ? 'text-white' : 'text-white/30'
            : selectedOption ? 'text-white' : 'text-white/30',
        )}>
          {multiple
            ? selectedMultiple.length > 0
              ? `${selectedMultiple.length} selected`
              : placeholder
            : selectedOption?.label ?? placeholder}
        </span>
        <div className="flex items-center gap-1">
          {clearable && value && (
            <motion.button
              type="button"
              className="p-0.5 rounded text-white/30 hover:text-white/60"
              onClick={(e) => {
                e.stopPropagation();
                setValue(name, multiple ? [] : '');
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </motion.button>
          )}
          <motion.svg
            className="w-4 h-4 text-white/40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <path d="M6 9l6 6 6-6" />
          </motion.svg>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-1 z-50 bg-slate-800 border border-white/10 rounded-lg shadow-2xl overflow-hidden"
          >
            {searchable && (
              <div className="p-2 border-b border-white/10">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full h-8 px-3 text-xs bg-white/5 border border-white/10 rounded-md text-white placeholder:text-white/30 outline-none focus:border-indigo-400/50"
                  autoFocus
                />
              </div>
            )}
            <div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 p-1">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-6 text-center text-xs text-white/30">
                  No options found
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = multiple
                    ? Array.isArray(value) && value.includes(opt.value)
                    : value === opt.value;
                  return (
                    <motion.button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelect(opt)}
                      disabled={opt.disabled}
                      className={clsx(
                        'w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors text-left',
                        isSelected
                          ? 'bg-indigo-500/20 text-indigo-300'
                          : 'text-white/80 hover:bg-white/5',
                        opt.disabled && 'opacity-40 pointer-events-none',
                      )}
                      whileHover={{ x: 2 }}
                    >
                      {multiple && (
                        <div className={clsx(
                          'w-4 h-4 rounded border flex items-center justify-center flex-shrink-0',
                          isSelected
                            ? 'bg-indigo-500 border-indigo-500'
                            : 'border-white/20',
                        )}>
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                          )}
                        </div>
                      )}
                      {opt.icon && <span className="flex-shrink-0">{opt.icon}</span>}
                      <span className="flex-1">{opt.label}</span>
                      {!multiple && isSelected && (
                        <svg className="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      )}
                    </motion.button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <FieldError name={name} />
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Checkbox Component
 * ────────────────────────────────────────────── */

interface CheckboxProps {
  name: string;
  label?: string;
  description?: string;
  validator?: FieldValidator;
  disabled?: boolean;
  indeterminate?: boolean;
  variant?: 'default' | 'card' | 'switch';
  className?: string;
}

export function Checkbox({
  name,
  label,
  description,
  validator,
  disabled,
  indeterminate,
  variant = 'default',
  className,
}: CheckboxProps) {
  const { values, setValue, registerField, unregisterField } = useFormContext();
  const checked = !!values[name];

  useEffect(() => {
    registerField(name, validator);
    return () => unregisterField(name);
  }, [name, validator, registerField, unregisterField]);

  if (variant === 'switch') {
    return (
      <label className={clsx(
        'flex items-center gap-3 cursor-pointer select-none group',
        disabled && 'opacity-50 pointer-events-none',
        className,
      )}>
        <motion.button
          type="button"
          onClick={() => setValue(name, !checked)}
          className={clsx(
            'relative w-11 h-6 rounded-full transition-colors flex-shrink-0',
            checked ? 'bg-indigo-500' : 'bg-white/15',
          )}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
            animate={{ left: checked ? 24 : 4 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </motion.button>
        <div className="flex flex-col">
          {label && (
            <span className="text-sm text-white/80 group-hover:text-white transition-colors">
              {label}
            </span>
          )}
          {description && (
            <span className="text-[11px] text-white/40">{description}</span>
          )}
        </div>
      </label>
    );
  }

  if (variant === 'card') {
    return (
      <motion.label
        className={clsx(
          'flex items-start gap-3 p-3 rounded-lg border cursor-pointer select-none transition-colors',
          checked
            ? 'border-indigo-400/40 bg-indigo-500/10'
            : 'border-white/10 bg-white/3 hover:border-white/20',
          disabled && 'opacity-50 pointer-events-none',
          className,
        )}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => setValue(name, !checked)}
      >
        <motion.div
          className={clsx(
            'w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5',
            checked ? 'bg-indigo-500 border-indigo-500' : 'border-white/25',
          )}
          animate={{ scale: checked ? [1, 1.2, 1] : 1 }}
          transition={{ duration: 0.2 }}
        >
          <AnimatePresence>
            {checked && (
              <motion.svg
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="w-3 h-3 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <path d="M20 6L9 17l-5-5" />
              </motion.svg>
            )}
          </AnimatePresence>
        </motion.div>
        <div className="flex flex-col">
          {label && <span className="text-sm text-white/80">{label}</span>}
          {description && <span className="text-[11px] text-white/40 mt-0.5">{description}</span>}
        </div>
      </motion.label>
    );
  }

  return (
    <label className={clsx(
      'flex items-center gap-2.5 cursor-pointer select-none group',
      disabled && 'opacity-50 pointer-events-none',
      className,
    )}>
      <motion.div
        className={clsx(
          'w-4.5 h-4.5 rounded border-2 flex items-center justify-center cursor-pointer',
          checked
            ? 'bg-indigo-500 border-indigo-500'
            : indeterminate
            ? 'bg-indigo-500/50 border-indigo-500/50'
            : 'border-white/25 group-hover:border-white/40',
        )}
        onClick={() => setValue(name, !checked)}
        whileTap={{ scale: 0.85 }}
      >
        <AnimatePresence>
          {(checked || indeterminate) && (
            <motion.svg
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="w-3 h-3 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              {indeterminate
                ? <path d="M5 12h14" />
                : <path d="M20 6L9 17l-5-5" />}
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.div>
      <div className="flex flex-col">
        {label && (
          <span className="text-sm text-white/70 group-hover:text-white/90 transition-colors">
            {label}
          </span>
        )}
        {description && (
          <span className="text-[10px] text-white/40">{description}</span>
        )}
      </div>
    </label>
  );
}

/* ──────────────────────────────────────────────
 * RadioGroup Component
 * ────────────────────────────────────────────── */

interface RadioGroupProps {
  name: string;
  label?: string;
  options: { value: string; label: string; description?: string; icon?: React.ReactNode }[];
  validator?: FieldValidator;
  disabled?: boolean;
  direction?: 'horizontal' | 'vertical';
  variant?: 'default' | 'card' | 'button';
  className?: string;
}

export function RadioGroup({
  name,
  label,
  options,
  validator,
  disabled,
  direction = 'vertical',
  variant = 'default',
  className,
}: RadioGroupProps) {
  const { values, setValue, registerField, unregisterField } = useFormContext();
  const value = values[name];

  useEffect(() => {
    registerField(name, validator);
    return () => unregisterField(name);
  }, [name, validator, registerField, unregisterField]);

  if (variant === 'button') {
    return (
      <div className={clsx('flex flex-col gap-1.5', className)}>
        {label && <label className="text-xs font-medium text-white/70">{label}</label>}
        <div className="flex gap-1 bg-white/5 rounded-lg p-1">
          {options.map(opt => (
            <motion.button
              key={opt.value}
              type="button"
              onClick={() => !disabled && setValue(name, opt.value)}
              className={clsx(
                'flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all text-center',
                value === opt.value
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'text-white/50 hover:text-white/70',
                disabled && 'opacity-50 cursor-not-allowed',
              )}
              whileTap={{ scale: 0.97 }}
            >
              {opt.label}
            </motion.button>
          ))}
        </div>
        <FieldError name={name} />
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={clsx('flex flex-col gap-1.5', className)}>
        {label && <label className="text-xs font-medium text-white/70">{label}</label>}
        <div className={clsx(
          'grid gap-2',
          direction === 'horizontal' ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-1',
        )}>
          {options.map(opt => (
            <motion.button
              key={opt.value}
              type="button"
              onClick={() => !disabled && setValue(name, opt.value)}
              className={clsx(
                'flex items-start gap-3 p-3 rounded-lg border text-left transition-all',
                value === opt.value
                  ? 'border-indigo-400/40 bg-indigo-500/10'
                  : 'border-white/10 bg-white/3 hover:border-white/20',
                disabled && 'opacity-50 cursor-not-allowed',
              )}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className={clsx(
                'w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5',
                value === opt.value ? 'border-indigo-400' : 'border-white/20',
              )}>
                {value === opt.value && (
                  <motion.div
                    className="w-2 h-2 rounded-full bg-indigo-400"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500 }}
                  />
                )}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  {opt.icon}
                  <span className="text-sm text-white/80">{opt.label}</span>
                </div>
                {opt.description && (
                  <span className="text-[11px] text-white/40 mt-0.5">{opt.description}</span>
                )}
              </div>
            </motion.button>
          ))}
        </div>
        <FieldError name={name} />
      </div>
    );
  }

  return (
    <div className={clsx('flex flex-col gap-1.5', className)}>
      {label && <label className="text-xs font-medium text-white/70">{label}</label>}
      <div className={clsx(
        'flex gap-3',
        direction === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
      )}>
        {options.map(opt => (
          <label
            key={opt.value}
            className={clsx(
              'flex items-center gap-2 cursor-pointer group',
              disabled && 'opacity-50 pointer-events-none',
            )}
          >
            <motion.div
              className={clsx(
                'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                value === opt.value ? 'border-indigo-400' : 'border-white/25 group-hover:border-white/40',
              )}
              onClick={() => setValue(name, opt.value)}
              whileTap={{ scale: 0.85 }}
            >
              {value === opt.value && (
                <motion.div
                  className="w-2 h-2 rounded-full bg-indigo-400"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500 }}
                />
              )}
            </motion.div>
            <span className="text-sm text-white/70 group-hover:text-white/90 transition-colors">
              {opt.label}
            </span>
          </label>
        ))}
      </div>
      <FieldError name={name} />
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Slider Component
 * ────────────────────────────────────────────── */

interface SliderProps {
  name: string;
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  showValue?: boolean;
  showRange?: boolean;
  showTicks?: boolean;
  tickCount?: number;
  formatValue?: (v: number) => string;
  validator?: FieldValidator;
  disabled?: boolean;
  variant?: 'default' | 'gradient' | 'range';
  className?: string;
}

export function Slider({
  name,
  label,
  min = 0,
  max = 100,
  step = 1,
  showValue = true,
  showRange = false,
  showTicks = false,
  tickCount = 5,
  formatValue = (v) => String(v),
  validator,
  disabled,
  variant = 'default',
  className,
}: SliderProps) {
  const { values, setValue, registerField, unregisterField } = useFormContext();
  const value = values[name] ?? min;
  const percentage = ((value - min) / (max - min)) * 100;
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    registerField(name, validator);
    return () => unregisterField(name);
  }, [name, validator, registerField, unregisterField]);

  const ticks = useMemo(() => {
    if (!showTicks) return [];
    const arr = [];
    for (let i = 0; i <= tickCount; i++) {
      arr.push(min + (max - min) * (i / tickCount));
    }
    return arr;
  }, [showTicks, tickCount, min, max]);

  return (
    <div className={clsx('flex flex-col gap-2', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && <label className="text-xs font-medium text-white/70">{label}</label>}
          {showValue && (
            <motion.span
              className={clsx(
                'text-xs font-mono px-2 py-0.5 rounded-md',
                isDragging ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/5 text-white/60',
              )}
              animate={{ scale: isDragging ? 1.05 : 1 }}
            >
              {formatValue(value)}
            </motion.span>
          )}
        </div>
      )}
      <div className="relative py-2">
        <div className="h-1.5 rounded-full bg-white/10 relative">
          <motion.div
            className={clsx(
              'absolute left-0 top-0 h-full rounded-full',
              variant === 'gradient'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500'
                : 'bg-indigo-500',
            )}
            style={{ width: `${percentage}%` }}
            animate={{ width: `${percentage}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => setValue(name, parseFloat(e.target.value))}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          disabled={disabled}
          className="absolute inset-0 w-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        {/* Thumb indicator */}
        <motion.div
          className={clsx(
            'absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-indigo-500 shadow-lg pointer-events-none',
            isDragging && 'ring-4 ring-indigo-500/20',
          )}
          style={{ left: `calc(${percentage}% - 8px)` }}
          animate={{ scale: isDragging ? 1.2 : 1 }}
        />
      </div>
      {showRange && (
        <div className="flex justify-between text-[10px] text-white/30 font-mono">
          <span>{formatValue(min)}</span>
          <span>{formatValue(max)}</span>
        </div>
      )}
      {showTicks && (
        <div className="flex justify-between px-2">
          {ticks.map((tick, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className={clsx(
                'w-0.5 h-2 rounded-full',
                value >= tick ? 'bg-indigo-400/60' : 'bg-white/15',
              )} />
              <span className="text-[9px] text-white/30 font-mono">
                {formatValue(Math.round(tick))}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────
 * File Upload Component
 * ────────────────────────────────────────────── */

interface FileUploadProps {
  name: string;
  label?: string;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  maxFiles?: number;
  validator?: FieldValidator;
  disabled?: boolean;
  variant?: 'dropzone' | 'button' | 'avatar';
  preview?: boolean;
  className?: string;
}

export function FileUpload({
  name,
  label,
  accept,
  multiple = false,
  maxSize = 10,
  maxFiles = 5,
  validator,
  disabled,
  variant = 'dropzone',
  preview = true,
  className,
}: FileUploadProps) {
  const { values, setValue, registerField, unregisterField, setError } = useFormContext();
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const files: File[] = values[name] ?? [];

  useEffect(() => {
    registerField(name, validator);
    return () => unregisterField(name);
  }, [name, validator, registerField, unregisterField]);

  const handleFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;
    const fileArr = Array.from(newFiles);

    // Validate size
    const oversized = fileArr.filter(f => f.size > maxSize * 1024 * 1024);
    if (oversized.length > 0) {
      setError(name, `File(s) exceed ${maxSize}MB limit`);
      return;
    }

    // Validate count
    const total = multiple ? [...files, ...fileArr] : fileArr.slice(0, 1);
    if (multiple && total.length > maxFiles) {
      setError(name, `Maximum ${maxFiles} files allowed`);
      return;
    }

    setValue(name, total);
  }, [files, multiple, maxFiles, maxSize, name, setValue, setError]);

  const removeFile = useCallback((index: number) => {
    const next = files.filter((_, i) => i !== index);
    setValue(name, next);
  }, [files, name, setValue]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (variant === 'avatar') {
    const avatarFile = files[0];
    const avatarUrl = avatarFile ? URL.createObjectURL(avatarFile) : null;

    return (
      <div className={clsx('flex flex-col items-center gap-2', className)}>
        {label && <label className="text-xs font-medium text-white/70">{label}</label>}
        <motion.button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={clsx(
            'relative w-20 h-20 rounded-full overflow-hidden border-2 border-dashed',
            isDragging ? 'border-indigo-400' : 'border-white/20 hover:border-white/40',
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-white/5 flex items-center justify-center">
              <svg className="w-8 h-8 text-white/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
          )}
        </motion.button>
        <input
          ref={inputRef}
          type="file"
          accept={accept || 'image/*'}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
        <FieldError name={name} />
      </div>
    );
  }

  if (variant === 'button') {
    return (
      <div className={clsx('flex flex-col gap-2', className)}>
        {label && <label className="text-xs font-medium text-white/70">{label}</label>}
        <motion.button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white/70',
            'hover:bg-white/10 hover:border-white/20 transition-colors',
            disabled && 'opacity-50 cursor-not-allowed',
          )}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          disabled={disabled}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Choose File{multiple ? 's' : ''}
        </motion.button>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          disabled={disabled}
        />
        {files.length > 0 && (
          <div className="flex flex-col gap-1">
            {files.map((file, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-white/60">
                <span className="truncate flex-1">{file.name}</span>
                <span className="text-white/30">{formatSize(file.size)}</span>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="text-white/30 hover:text-red-400"
                >
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
        <FieldError name={name} />
      </div>
    );
  }

  // Dropzone variant
  return (
    <div className={clsx('flex flex-col gap-2', className)}>
      {label && <label className="text-xs font-medium text-white/70">{label}</label>}
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={clsx(
          'relative flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all',
          isDragging
            ? 'border-indigo-400 bg-indigo-500/10 scale-[1.02]'
            : 'border-white/15 bg-white/3 hover:border-white/25 hover:bg-white/5',
          disabled && 'opacity-50 pointer-events-none',
        )}
        animate={{ scale: isDragging ? 1.02 : 1 }}
      >
        <motion.div
          className={clsx(
            'w-12 h-12 rounded-xl flex items-center justify-center',
            isDragging ? 'bg-indigo-500/20' : 'bg-white/5',
          )}
          animate={{ y: isDragging ? -4 : 0 }}
        >
          <svg className={clsx('w-6 h-6', isDragging ? 'text-indigo-400' : 'text-white/40')} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </motion.div>
        <div className="text-center">
          <p className="text-sm text-white/60">
            {isDragging ? 'Drop files here' : 'Drag & drop files here, or click to browse'}
          </p>
          <p className="text-[11px] text-white/30 mt-1">
            {accept ? `Accepted: ${accept}` : 'All file types'} · Max {maxSize}MB
            {multiple && ` · Up to ${maxFiles} files`}
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          disabled={disabled}
        />
      </motion.div>

      {/* File list with previews */}
      {files.length > 0 && (
        <div className="flex flex-col gap-2">
          <AnimatePresence>
            {files.map((file, i) => (
              <motion.div
                key={file.name + i}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/10"
              >
                {preview && file.type.startsWith('image/') && (
                  <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0 bg-white/5">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/70 truncate">{file.name}</p>
                  <p className="text-[10px] text-white/30">{formatSize(file.size)}</p>
                </div>
                <motion.button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="p-1 rounded text-white/30 hover:text-red-400 hover:bg-red-500/10"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
      <FieldError name={name} />
    </div>
  );
}

/* ──────────────────────────────────────────────
 * DatePicker Component
 * ────────────────────────────────────────────── */

interface DatePickerProps {
  name: string;
  label?: string;
  placeholder?: string;
  validator?: FieldValidator;
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
  includeTime?: boolean;
  className?: string;
}

export function DatePicker({
  name,
  label,
  placeholder = 'Select date...',
  validator,
  disabled,
  minDate,
  maxDate,
  includeTime = false,
  className,
}: DatePickerProps) {
  const { values, setValue, setTouched, registerField, unregisterField, validateField, errors, touched } = useFormContext();
  const [isOpen, setIsOpen] = useState(false);
  const value = values[name] ?? '';
  const hasError = !!(errors[name] && touched[name]);

  useEffect(() => {
    registerField(name, validator);
    return () => unregisterField(name);
  }, [name, validator, registerField, unregisterField]);

  const [viewDate, setViewDate] = useState(() => {
    return value ? new Date(value) : new Date();
  });

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();

  const calendar = useMemo(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [firstDay, daysInMonth]);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const handleDayClick = useCallback((day: number) => {
    const selected = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const dateStr = includeTime
      ? selected.toISOString().slice(0, 16)
      : selected.toISOString().slice(0, 10);
    setValue(name, dateStr);
    if (!includeTime) setIsOpen(false);
    setTouched(name);
  }, [viewDate, name, setValue, setTouched, includeTime]);

  const selectedDate = value ? new Date(value) : null;

  return (
    <div className={clsx('flex flex-col gap-1 relative', className)}>
      {label && <label className="text-xs font-medium text-white/70">{label}</label>}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={clsx(
          'flex items-center gap-2 h-10 px-3 rounded-lg border text-sm text-left transition-all',
          hasError
            ? 'border-red-400/60 bg-red-500/5'
            : isOpen
            ? 'border-indigo-400/60 ring-2 ring-indigo-400/20 bg-white/5'
            : 'border-white/10 bg-white/5 hover:border-white/20',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        <svg className="w-4 h-4 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
        <span className={value ? 'text-white' : 'text-white/30'}>
          {value ? new Date(value).toLocaleDateString() : placeholder}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            className="absolute top-full left-0 mt-1 z-50 bg-slate-800 border border-white/10 rounded-xl shadow-2xl p-3 w-72"
          >
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
                className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <span className="text-sm font-medium text-white/80">
                {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
              </span>
              <button
                type="button"
                onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
                className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                <div key={d} className="text-center text-[10px] text-white/30 font-medium py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendar.map((day, i) => {
                if (day === null) {
                  return <div key={`empty-${i}`} />;
                }
                const isToday = new Date().toDateString() === new Date(viewDate.getFullYear(), viewDate.getMonth(), day).toDateString();
                const isSelected = selectedDate?.getDate() === day &&
                  selectedDate?.getMonth() === viewDate.getMonth() &&
                  selectedDate?.getFullYear() === viewDate.getFullYear();

                return (
                  <motion.button
                    key={day}
                    type="button"
                    onClick={() => handleDayClick(day)}
                    className={clsx(
                      'w-8 h-8 rounded-lg text-xs flex items-center justify-center transition-colors',
                      isSelected
                        ? 'bg-indigo-500 text-white font-medium'
                        : isToday
                        ? 'bg-white/10 text-indigo-300 font-medium'
                        : 'text-white/60 hover:bg-white/5',
                    )}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {day}
                  </motion.button>
                );
              })}
            </div>

            {/* Time picker */}
            {includeTime && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <input
                  type="time"
                  value={value ? value.slice(11, 16) : '12:00'}
                  onChange={(e) => {
                    const date = value ? value.slice(0, 10) : new Date().toISOString().slice(0, 10);
                    setValue(name, `${date}T${e.target.value}`);
                  }}
                  className="w-full h-8 px-3 text-xs bg-white/5 border border-white/10 rounded-lg text-white outline-none focus:border-indigo-400/50"
                />
              </div>
            )}

            {/* Quick actions */}
            <div className="flex gap-1 mt-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  const today = new Date();
                  setValue(name, today.toISOString().slice(0, includeTime ? 16 : 10));
                  setIsOpen(false);
                }}
                className="flex-1 py-1.5 text-[11px] rounded-md bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => {
                  setValue(name, '');
                  setIsOpen(false);
                }}
                className="flex-1 py-1.5 text-[11px] rounded-md bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70"
              >
                Clear
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <FieldError name={name} />
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Color Input Component
 * ────────────────────────────────────────────── */

interface ColorInputProps {
  name: string;
  label?: string;
  presets?: string[];
  showHex?: boolean;
  showOpacity?: boolean;
  validator?: FieldValidator;
  className?: string;
}

export function ColorInput({
  name,
  label,
  presets = [
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1',
    '#8B5CF6', '#EC4899', '#F43F5E', '#14B8A6', '#06B6D4',
    '#FFFFFF', '#000000', '#6B7280', '#9CA3AF', '#D1D5DB',
  ],
  showHex = true,
  showOpacity = false,
  validator,
  className,
}: ColorInputProps) {
  const { values, setValue, registerField, unregisterField } = useFormContext();
  const [isOpen, setIsOpen] = useState(false);
  const value = values[name] ?? '#6366F1';
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerField(name, validator);
    return () => unregisterField(name);
  }, [name, validator, registerField, unregisterField]);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  return (
    <div ref={containerRef} className={clsx('flex flex-col gap-1 relative', className)}>
      {label && <label className="text-xs font-medium text-white/70">{label}</label>}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 h-10 px-3 rounded-lg border border-white/10 bg-white/5 hover:border-white/20 transition-colors"
      >
        <div
          className="w-6 h-6 rounded-md border border-white/20 shadow-inner"
          style={{ backgroundColor: value }}
        />
        {showHex && (
          <span className="text-xs font-mono text-white/60">{value}</span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            className="absolute top-full left-0 mt-1 z-50 bg-slate-800 border border-white/10 rounded-xl shadow-2xl p-3 w-56"
          >
            {/* Native color picker */}
            <div className="mb-3">
              <input
                type="color"
                value={value}
                onChange={(e) => setValue(name, e.target.value)}
                className="w-full h-24 rounded-lg cursor-pointer border-0 bg-transparent"
              />
            </div>

            {/* Hex input */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={value}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^#?[0-9A-Fa-f]{0,6}$/.test(v)) {
                    setValue(name, v.startsWith('#') ? v : `#${v}`);
                  }
                }}
                className="flex-1 h-7 px-2 text-xs font-mono bg-white/5 border border-white/10 rounded-md text-white outline-none focus:border-indigo-400/50"
              />
            </div>

            {/* Presets */}
            <div className="grid grid-cols-5 gap-1.5">
              {presets.map((color) => (
                <motion.button
                  key={color}
                  type="button"
                  onClick={() => setValue(name, color)}
                  className={clsx(
                    'w-8 h-8 rounded-lg border-2 transition-all',
                    value === color ? 'border-white scale-110' : 'border-white/10 hover:border-white/30',
                  )}
                  style={{ backgroundColor: color }}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <FieldError name={name} />
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Rating Component
 * ────────────────────────────────────────────── */

interface RatingProps {
  name: string;
  label?: string;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  icon?: 'star' | 'heart' | 'circle';
  allowHalf?: boolean;
  showValue?: boolean;
  className?: string;
}

export function Rating({
  name,
  label,
  max = 5,
  size = 'md',
  icon = 'star',
  allowHalf = false,
  showValue = true,
  className,
}: RatingProps) {
  const { values, setValue } = useFormContext();
  const value = values[name] ?? 0;
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const displayValue = hoverValue ?? value;

  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const getIcon = (filled: boolean) => {
    const cls = clsx(sizeMap[size], 'transition-colors');
    switch (icon) {
      case 'heart':
        return filled ? (
          <svg className={clsx(cls, 'text-red-400')} viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        ) : (
          <svg className={clsx(cls, 'text-white/20')} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        );
      case 'circle':
        return filled ? (
          <svg className={clsx(cls, 'text-indigo-400')} viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="10" />
          </svg>
        ) : (
          <svg className={clsx(cls, 'text-white/20')} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
          </svg>
        );
      default: // star
        return filled ? (
          <svg className={clsx(cls, 'text-yellow-400')} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ) : (
          <svg className={clsx(cls, 'text-white/20')} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        );
    }
  };

  return (
    <div className={clsx('flex flex-col gap-1.5', className)}>
      {label && <label className="text-xs font-medium text-white/70">{label}</label>}
      <div className="flex items-center gap-1">
        {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
          <motion.button
            key={star}
            type="button"
            onClick={() => setValue(name, star)}
            onMouseEnter={() => setHoverValue(star)}
            onMouseLeave={() => setHoverValue(null)}
            className="p-0.5 cursor-pointer"
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.8 }}
          >
            {getIcon(star <= displayValue)}
          </motion.button>
        ))}
        {showValue && (
          <span className="text-xs text-white/40 ml-2 font-mono">
            {value}/{max}
          </span>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Tag Input Component
 * ────────────────────────────────────────────── */

interface TagInputProps {
  name: string;
  label?: string;
  placeholder?: string;
  maxTags?: number;
  suggestions?: string[];
  validator?: FieldValidator;
  className?: string;
}

export function TagInput({
  name,
  label,
  placeholder = 'Add tag...',
  maxTags = 10,
  suggestions = [],
  validator,
  className,
}: TagInputProps) {
  const { values, setValue, registerField, unregisterField } = useFormContext();
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const tags: string[] = values[name] ?? [];

  useEffect(() => {
    registerField(name, validator);
    return () => unregisterField(name);
  }, [name, validator, registerField, unregisterField]);

  const filteredSuggestions = useMemo(() => {
    if (!input) return [];
    return suggestions.filter(
      s => s.toLowerCase().includes(input.toLowerCase()) && !tags.includes(s)
    ).slice(0, 5);
  }, [input, suggestions, tags]);

  const addTag = useCallback((tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed || tags.includes(trimmed) || tags.length >= maxTags) return;
    setValue(name, [...tags, trimmed]);
    setInput('');
    setShowSuggestions(false);
  }, [tags, maxTags, name, setValue]);

  const removeTag = useCallback((index: number) => {
    setValue(name, tags.filter((_, i) => i !== index));
  }, [tags, name, setValue]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  }, [input, tags, addTag, removeTag]);

  return (
    <div className={clsx('flex flex-col gap-1 relative', className)}>
      {label && (
        <label className="text-xs font-medium text-white/70 flex items-center justify-between">
          <span>{label}</span>
          <span className="text-[10px] text-white/30">{tags.length}/{maxTags}</span>
        </label>
      )}
      <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-lg border border-white/10 bg-white/5 min-h-[40px] focus-within:border-indigo-400/50 focus-within:ring-2 focus-within:ring-indigo-400/10 transition-all">
        <AnimatePresence>
          {tags.map((tag, i) => (
            <motion.span
              key={tag}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-md text-xs"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(i)}
                className="hover:text-white transition-colors"
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[80px] bg-transparent text-xs text-white outline-none placeholder:text-white/30"
          disabled={tags.length >= maxTags}
        />
      </div>

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {showSuggestions && filteredSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute top-full left-0 right-0 mt-1 z-50 bg-slate-800 border border-white/10 rounded-lg shadow-xl overflow-hidden"
          >
            {filteredSuggestions.map((s) => (
              <button
                key={s}
                type="button"
                onMouseDown={() => addTag(s)}
                className="w-full px-3 py-2 text-xs text-left text-white/60 hover:bg-white/5 hover:text-white transition-colors"
              >
                {s}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <FieldError name={name} />
    </div>
  );
}

/* ──────────────────────────────────────────────
 * OTP Input Component
 * ────────────────────────────────────────────── */

interface OTPInputProps {
  name: string;
  label?: string;
  length?: number;
  onComplete?: (code: string) => void;
  className?: string;
}

export function OTPInput({
  name,
  label,
  length = 6,
  onComplete,
  className,
}: OTPInputProps) {
  const { setValue } = useFormContext();
  const [digits, setDigits] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = useCallback((index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);

    const code = newDigits.join('');
    setValue(name, code);

    // Auto-focus next
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Complete callback
    if (code.length === length && !code.includes('')) {
      onComplete?.(code);
    }
  }, [digits, length, name, setValue, onComplete]);

  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }, [digits]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    const newDigits = [...digits];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setDigits(newDigits);
    setValue(name, newDigits.join(''));
    if (pasted.length === length) {
      onComplete?.(pasted);
    }
  }, [digits, length, name, setValue, onComplete]);

  return (
    <div className={clsx('flex flex-col items-center gap-3', className)}>
      {label && <label className="text-xs font-medium text-white/70">{label}</label>}
      <div className="flex gap-2">
        {digits.map((digit, i) => (
          <motion.input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={i === 0 ? handlePaste : undefined}
            className={clsx(
              'w-11 h-13 text-center text-lg font-bold rounded-lg border bg-white/5 text-white outline-none transition-all',
              digit
                ? 'border-indigo-400/50 bg-indigo-500/10'
                : 'border-white/15 focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-400/20',
            )}
            whileFocus={{ scale: 1.05 }}
          />
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Form Submit Button
 * ────────────────────────────────────────────── */

interface SubmitButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export function SubmitButton({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  className,
}: SubmitButtonProps) {
  const { isSubmitting, isDirty } = useFormContext();

  const variantClasses = {
    primary: 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/25',
    secondary: 'bg-white/10 hover:bg-white/15 text-white/80',
    success: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25',
    danger: 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25',
  };

  const sizeClasses = {
    sm: 'h-8 px-3 text-xs gap-1.5 rounded-md',
    md: 'h-10 px-5 text-sm gap-2 rounded-lg',
    lg: 'h-12 px-6 text-base gap-2.5 rounded-lg',
  };

  return (
    <motion.button
      type="submit"
      disabled={isSubmitting}
      className={clsx(
        'inline-flex items-center justify-center font-medium transition-all duration-200',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        isSubmitting && 'opacity-70 cursor-wait',
        className,
      )}
      whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
      whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
    >
      {isSubmitting ? (
        <motion.svg
          className="w-4 h-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </motion.svg>
      ) : icon}
      <span>{isSubmitting ? 'Submitting...' : children}</span>
    </motion.button>
  );
}

/* ──────────────────────────────────────────────
 * Form Stepper / Multi-Step Form
 * ────────────────────────────────────────────── */

interface FormStepperProps {
  steps: { id: string; title: string; description?: string; icon?: React.ReactNode }[];
  currentStep: number;
  onStepChange?: (step: number) => void;
  variant?: 'default' | 'compact' | 'dots';
  className?: string;
}

export function FormStepper({
  steps,
  currentStep,
  onStepChange,
  variant = 'default',
  className,
}: FormStepperProps) {
  if (variant === 'dots') {
    return (
      <div className={clsx('flex items-center justify-center gap-2', className)}>
        {steps.map((_, i) => (
          <motion.button
            key={i}
            type="button"
            onClick={() => onStepChange?.(i)}
            className={clsx(
              'rounded-full transition-all',
              i === currentStep
                ? 'w-8 h-2 bg-indigo-500'
                : i < currentStep
                ? 'w-2 h-2 bg-indigo-400/50'
                : 'w-2 h-2 bg-white/15',
            )}
            whileHover={{ scale: 1.2 }}
            layout
          />
        ))}
      </div>
    );
  }

  return (
    <div className={clsx('flex items-center', className)}>
      {steps.map((step, i) => (
        <React.Fragment key={step.id}>
          <motion.button
            type="button"
            onClick={() => i <= currentStep && onStepChange?.(i)}
            className={clsx(
              'flex items-center gap-2',
              i <= currentStep ? 'cursor-pointer' : 'cursor-default',
            )}
            whileHover={i <= currentStep ? { scale: 1.02 } : undefined}
          >
            <div className={clsx(
              'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all',
              i === currentStep
                ? 'bg-indigo-500 text-white ring-4 ring-indigo-500/20'
                : i < currentStep
                ? 'bg-emerald-500 text-white'
                : 'bg-white/10 text-white/30',
            )}>
              {i < currentStep ? (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              ) : (
                step.icon ?? (i + 1)
              )}
            </div>
            {variant === 'default' && (
              <div className="text-left hidden sm:block">
                <p className={clsx(
                  'text-xs font-medium',
                  i === currentStep ? 'text-white' : i < currentStep ? 'text-white/60' : 'text-white/30',
                )}>
                  {step.title}
                </p>
                {step.description && (
                  <p className="text-[10px] text-white/30">{step.description}</p>
                )}
              </div>
            )}
          </motion.button>
          {i < steps.length - 1 && (
            <div className={clsx(
              'flex-1 h-0.5 mx-3 rounded-full',
              i < currentStep ? 'bg-emerald-500' : 'bg-white/10',
            )} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
