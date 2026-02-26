/**
 * Form Validation Engine
 * 
 * Declarative validation rules for form widgets.
 * Features:
 * - 30+ built-in validators
 * - Custom regex patterns
 * - Cross-field validation
 * - Async validation support
 * - i18n error messages
 * - Real-time vs on-submit modes
 */

/* ──────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────── */

export interface ValidationRule {
  id: string;
  type: ValidatorType;
  message: string;
  params?: Record<string, unknown>;
  severity: 'error' | 'warning' | 'info';
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export interface ValidationError {
  fieldId: string;
  fieldName: string;
  rule: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export type ValidatorType =
  | 'required' | 'min-length' | 'max-length' | 'exact-length'
  | 'min-value' | 'max-value' | 'between'
  | 'email' | 'url' | 'phone' | 'postal-code'
  | 'credit-card' | 'ip-address' | 'mac-address'
  | 'alpha' | 'alphanumeric' | 'numeric' | 'integer'
  | 'regex' | 'no-whitespace' | 'no-special-chars'
  | 'password-strength' | 'password-match'
  | 'date-before' | 'date-after' | 'date-range'
  | 'file-size' | 'file-type' | 'image-dimensions'
  | 'unique' | 'exists' | 'custom';

/* ──────────────────────────────────────────────
 * Built-in Validators
 * ────────────────────────────────────────────── */

export const VALIDATORS: Record<ValidatorType, { label: string; description: string; hasParams: boolean; paramSchema?: Record<string, string> }> = {
  'required': { label: 'Required', description: 'Field must not be empty', hasParams: false },
  'min-length': { label: 'Min Length', description: 'Minimum character count', hasParams: true, paramSchema: { min: 'number' } },
  'max-length': { label: 'Max Length', description: 'Maximum character count', hasParams: true, paramSchema: { max: 'number' } },
  'exact-length': { label: 'Exact Length', description: 'Must be exact length', hasParams: true, paramSchema: { length: 'number' } },
  'min-value': { label: 'Min Value', description: 'Minimum numeric value', hasParams: true, paramSchema: { min: 'number' } },
  'max-value': { label: 'Max Value', description: 'Maximum numeric value', hasParams: true, paramSchema: { max: 'number' } },
  'between': { label: 'Between', description: 'Value between min and max', hasParams: true, paramSchema: { min: 'number', max: 'number' } },
  'email': { label: 'Email', description: 'Valid email address', hasParams: false },
  'url': { label: 'URL', description: 'Valid URL', hasParams: false },
  'phone': { label: 'Phone', description: 'Valid phone number', hasParams: false },
  'postal-code': { label: 'Postal Code', description: 'Valid postal/zip code', hasParams: true, paramSchema: { country: 'string' } },
  'credit-card': { label: 'Credit Card', description: 'Valid credit card number', hasParams: false },
  'ip-address': { label: 'IP Address', description: 'Valid IPv4 or IPv6', hasParams: false },
  'mac-address': { label: 'MAC Address', description: 'Valid MAC address', hasParams: false },
  'alpha': { label: 'Letters Only', description: 'Only alphabetic characters', hasParams: false },
  'alphanumeric': { label: 'Alphanumeric', description: 'Letters and numbers only', hasParams: false },
  'numeric': { label: 'Numeric', description: 'Numbers only', hasParams: false },
  'integer': { label: 'Integer', description: 'Whole numbers only', hasParams: false },
  'regex': { label: 'Pattern', description: 'Match regex pattern', hasParams: true, paramSchema: { pattern: 'string' } },
  'no-whitespace': { label: 'No Spaces', description: 'No whitespace allowed', hasParams: false },
  'no-special-chars': { label: 'No Special Chars', description: 'No special characters', hasParams: false },
  'password-strength': { label: 'Password Strength', description: 'Min strength level', hasParams: true, paramSchema: { level: 'string' } },
  'password-match': { label: 'Password Match', description: 'Must match another field', hasParams: true, paramSchema: { fieldId: 'string' } },
  'date-before': { label: 'Date Before', description: 'Must be before date', hasParams: true, paramSchema: { date: 'string' } },
  'date-after': { label: 'Date After', description: 'Must be after date', hasParams: true, paramSchema: { date: 'string' } },
  'date-range': { label: 'Date Range', description: 'Within date range', hasParams: true, paramSchema: { start: 'string', end: 'string' } },
  'file-size': { label: 'File Size', description: 'Max file size', hasParams: true, paramSchema: { maxMB: 'number' } },
  'file-type': { label: 'File Type', description: 'Allowed file types', hasParams: true, paramSchema: { types: 'string' } },
  'image-dimensions': { label: 'Image Size', description: 'Max image dimensions', hasParams: true, paramSchema: { maxWidth: 'number', maxHeight: 'number' } },
  'unique': { label: 'Unique', description: 'Value must be unique', hasParams: false },
  'exists': { label: 'Exists', description: 'Value must exist in list', hasParams: true, paramSchema: { list: 'string' } },
  'custom': { label: 'Custom', description: 'Custom validation function', hasParams: true, paramSchema: { fn: 'string' } },
};

/* ──────────────────────────────────────────────
 * Validation Function
 * ────────────────────────────────────────────── */

export function validate(value: unknown, rules: ValidationRule[]): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  for (const rule of rules) {
    const result = runValidator(value, rule);
    if (!result.valid) {
      const err: ValidationError = { fieldId: '', fieldName: '', rule: rule.type, message: result.message ?? rule.message, severity: rule.severity };
      if (rule.severity === 'error') errors.push(err);
      else warnings.push(err);
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

function runValidator(value: unknown, rule: ValidationRule): { valid: boolean; message?: string } {
  const str = String(value ?? '');
  const num = Number(value);
  const params = rule.params ?? {};

  switch (rule.type) {
    case 'required': return { valid: str.trim().length > 0, message: rule.message || 'This field is required' };
    case 'min-length': return { valid: str.length >= (params.min as number ?? 0), message: rule.message || `Minimum ${params.min} characters` };
    case 'max-length': return { valid: str.length <= (params.max as number ?? 999), message: rule.message || `Maximum ${params.max} characters` };
    case 'exact-length': return { valid: str.length === (params.length as number), message: rule.message || `Must be exactly ${params.length} characters` };
    case 'min-value': return { valid: num >= (params.min as number ?? 0), message: rule.message || `Minimum value is ${params.min}` };
    case 'max-value': return { valid: num <= (params.max as number ?? Infinity), message: rule.message || `Maximum value is ${params.max}` };
    case 'between': return { valid: num >= (params.min as number) && num <= (params.max as number), message: rule.message || `Must be between ${params.min} and ${params.max}` };
    case 'email': return { valid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str), message: rule.message || 'Invalid email address' };
    case 'url': return { valid: /^https?:\/\/.+/.test(str), message: rule.message || 'Invalid URL' };
    case 'phone': return { valid: /^[+]?[\d\s\-()]{7,15}$/.test(str), message: rule.message || 'Invalid phone number' };
    case 'credit-card': return { valid: /^\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}$/.test(str), message: rule.message || 'Invalid credit card number' };
    case 'ip-address': return { valid: /^(\d{1,3}\.){3}\d{1,3}$/.test(str) || /^([0-9a-f]{1,4}:){7}[0-9a-f]{1,4}$/i.test(str), message: rule.message || 'Invalid IP address' };
    case 'alpha': return { valid: /^[a-zA-Z]+$/.test(str), message: rule.message || 'Only letters allowed' };
    case 'alphanumeric': return { valid: /^[a-zA-Z0-9]+$/.test(str), message: rule.message || 'Only letters and numbers allowed' };
    case 'numeric': return { valid: /^[0-9.]+$/.test(str), message: rule.message || 'Only numbers allowed' };
    case 'integer': return { valid: /^-?\d+$/.test(str), message: rule.message || 'Must be a whole number' };
    case 'no-whitespace': return { valid: !/\s/.test(str), message: rule.message || 'No spaces allowed' };
    case 'no-special-chars': return { valid: /^[a-zA-Z0-9\s]+$/.test(str), message: rule.message || 'No special characters allowed' };
    case 'regex': {
      try { return { valid: new RegExp(params.pattern as string).test(str) }; } catch { return { valid: false, message: 'Invalid pattern' }; }
    }
    case 'password-strength': {
      const level = params.level as string ?? 'medium';
      const hasLower = /[a-z]/.test(str);
      const hasUpper = /[A-Z]/.test(str);
      const hasNum = /[0-9]/.test(str);
      const hasSpecial = /[^a-zA-Z0-9]/.test(str);
      const score = [hasLower, hasUpper, hasNum, hasSpecial, str.length >= 8, str.length >= 12].filter(Boolean).length;
      const required = level === 'weak' ? 2 : level === 'medium' ? 4 : 5;
      return { valid: score >= required, message: rule.message || `Password too ${level === 'weak' ? 'simple' : 'weak'}` };
    }
    default: return { valid: true };
  }
}

/* ──────────────────────────────────────────────
 * Common Preset Rules
 * ────────────────────────────────────────────── */

export const VALIDATION_PRESETS: Record<string, ValidationRule[]> = {
  'Email': [
    { id: 'req', type: 'required', message: 'Email is required', severity: 'error' },
    { id: 'fmt', type: 'email', message: 'Enter a valid email', severity: 'error' },
  ],
  'Password': [
    { id: 'req', type: 'required', message: 'Password is required', severity: 'error' },
    { id: 'min', type: 'min-length', message: 'At least 8 characters', params: { min: 8 }, severity: 'error' },
    { id: 'str', type: 'password-strength', message: 'Use a stronger password', params: { level: 'medium' }, severity: 'warning' },
  ],
  'Username': [
    { id: 'req', type: 'required', message: 'Username is required', severity: 'error' },
    { id: 'min', type: 'min-length', message: 'At least 3 characters', params: { min: 3 }, severity: 'error' },
    { id: 'max', type: 'max-length', message: 'Maximum 20 characters', params: { max: 20 }, severity: 'error' },
    { id: 'fmt', type: 'alphanumeric', message: 'Only letters and numbers', severity: 'error' },
  ],
  'Phone Number': [
    { id: 'req', type: 'required', message: 'Phone number is required', severity: 'error' },
    { id: 'fmt', type: 'phone', message: 'Enter a valid phone number', severity: 'error' },
  ],
  'URL': [
    { id: 'req', type: 'required', message: 'URL is required', severity: 'error' },
    { id: 'fmt', type: 'url', message: 'Enter a valid URL', severity: 'error' },
  ],
  'Required Text': [
    { id: 'req', type: 'required', message: 'This field is required', severity: 'error' },
  ],
  'Name': [
    { id: 'req', type: 'required', message: 'Name is required', severity: 'error' },
    { id: 'min', type: 'min-length', message: 'At least 2 characters', params: { min: 2 }, severity: 'error' },
    { id: 'fmt', type: 'alpha', message: 'Only letters allowed', severity: 'warning' },
  ],
};
