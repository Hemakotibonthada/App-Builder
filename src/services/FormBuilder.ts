// =============================================================================
// Form Builder - Dynamic form creation, validation, and submission system
// Features: Field types, validation rules, conditional logic, multi-step, layout
// =============================================================================

export interface FormDefinition {
  id: string;
  name: string;
  description: string;
  version: number;
  fields: FormField[];
  layout: FormLayout;
  validation: FormValidation;
  submission: FormSubmission;
  steps: FormStep[];
  settings: FormSettings;
  theme: FormTheme;
  metadata: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
}

export interface FormField {
  id: string;
  type: FormFieldType;
  name: string;
  label: string;
  placeholder: string;
  description: string;
  defaultValue: unknown;
  required: boolean;
  disabled: boolean;
  hidden: boolean;
  readOnly: boolean;
  validation: FieldValidation[];
  conditional: ConditionalLogic | null;
  options: FieldOption[];
  config: FieldConfig;
  style: FieldStyle;
  group: string;
  order: number;
  width: 'full' | 'half' | 'third' | 'quarter' | 'auto';
  step: number;
  metadata: Record<string, unknown>;
}

export type FormFieldType =
  | 'text' | 'email' | 'password' | 'number' | 'phone' | 'url'
  | 'textarea' | 'richtext' | 'markdown'
  | 'select' | 'multiselect' | 'combobox' | 'autocomplete'
  | 'radio' | 'checkbox' | 'toggle' | 'switch'
  | 'date' | 'time' | 'datetime' | 'daterange' | 'month' | 'year' | 'week'
  | 'file' | 'image' | 'avatar' | 'gallery'
  | 'color' | 'colorpalette'
  | 'slider' | 'range' | 'rating' | 'stepper'
  | 'tags' | 'chips' | 'tokens'
  | 'address' | 'location' | 'map'
  | 'signature' | 'canvas' | 'drawing'
  | 'code' | 'json' | 'markdown-editor'
  | 'currency' | 'percent' | 'measurement'
  | 'repeater' | 'group' | 'fieldset' | 'section'
  | 'divider' | 'heading' | 'paragraph' | 'html' | 'spacer'
  | 'hidden' | 'calculated'
  | 'captcha' | 'recaptcha' | 'honeypot'
  | 'matrix' | 'table' | 'grid'
  | 'otp' | 'pin' | 'mask'
  | 'tree-select' | 'cascader'
  | 'transfer' | 'sortable-list'
  | 'cron' | 'schedule'
  | 'icon-picker' | 'emoji-picker'
  | 'barcode' | 'qrcode'
  | 'custom';

export interface FieldOption {
  label: string;
  value: string | number | boolean;
  description?: string;
  icon?: string;
  image?: string;
  disabled?: boolean;
  group?: string;
  color?: string;
}

export interface FieldConfig {
  // Text fields
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  mask?: string;
  prefix?: string;
  suffix?: string;
  autoComplete?: string;
  spellCheck?: boolean;
  inputMode?: string;

  // Number fields
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  currency?: string;
  unit?: string;

  // Select fields
  searchable?: boolean;
  clearable?: boolean;
  multiple?: boolean;
  maxSelected?: number;
  creatable?: boolean;
  loadOptions?: string;
  groupBy?: string;

  // Date fields
  dateFormat?: string;
  minDate?: string;
  maxDate?: string;
  disabledDates?: string[];
  disabledDays?: number[];
  locale?: string;
  firstDayOfWeek?: number;

  // File fields
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
  preview?: boolean;
  dragDrop?: boolean;

  // Textarea
  rows?: number;
  autoResize?: boolean;
  maxRows?: number;

  // Rating
  stars?: number;
  allowHalf?: boolean;
  icons?: string[];

  // Slider
  marks?: Record<number, string>;
  dots?: boolean;
  vertical?: boolean;
  reverse?: boolean;

  // Repeater
  minItems?: number;
  maxItems?: number;
  itemLabel?: string;
  addLabel?: string;
  sortable?: boolean;
  collapsible?: boolean;
  subFields?: FormField[];

  // Code
  language?: string;
  lineNumbers?: boolean;
  wordWrap?: boolean;
  minimap?: boolean;

  // Color
  presets?: string[];
  showAlpha?: boolean;
  showInput?: boolean;
  format?: 'hex' | 'rgb' | 'hsl';

  // Address
  components?: string[];
  country?: string;

  // Custom
  component?: string;
  props?: Record<string, unknown>;
}

export interface FieldStyle {
  className?: string;
  labelPosition?: 'top' | 'left' | 'right' | 'floating' | 'inside' | 'hidden';
  labelWidth?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'outlined' | 'filled' | 'underlined' | 'borderless';
  rounded?: boolean;
  fullWidth?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  helpText?: string;
  helpPosition?: 'below' | 'tooltip' | 'inline';
  errorPosition?: 'below' | 'tooltip' | 'inline';
  animation?: 'none' | 'fade' | 'slide' | 'scale';
}

// =============================================================================
// Validation
// =============================================================================

export interface FieldValidation {
  type: ValidationRuleType;
  value?: unknown;
  message?: string;
  trigger?: 'blur' | 'change' | 'submit';
  async?: boolean;
  debounce?: number;
}

export type ValidationRuleType =
  | 'required' | 'requiredIf' | 'requiredUnless'
  | 'email' | 'url' | 'phone' | 'ip' | 'mac' | 'uuid'
  | 'minLength' | 'maxLength' | 'exactLength'
  | 'min' | 'max' | 'between' | 'integer' | 'decimal' | 'positive' | 'negative'
  | 'pattern' | 'regex' | 'alphanumeric' | 'alpha' | 'numeric'
  | 'date' | 'dateBefore' | 'dateAfter' | 'dateRange'
  | 'fileSize' | 'fileType' | 'fileExtension' | 'imageSize' | 'imageDimensions'
  | 'match' | 'notMatch' | 'different'
  | 'in' | 'notIn' | 'unique'
  | 'creditCard' | 'iban' | 'postalCode' | 'ssn'
  | 'strongPassword' | 'noSpaces' | 'trim' | 'lowercase' | 'uppercase'
  | 'json' | 'xml' | 'base64' | 'hex' | 'slug'
  | 'contains' | 'startsWith' | 'endsWith' | 'wordCount'
  | 'custom';

export interface FormValidation {
  mode: 'onSubmit' | 'onBlur' | 'onChange' | 'all';
  showErrors: 'first' | 'all';
  scrollToError: boolean;
  focusOnError: boolean;
  clearOnSubmit: boolean;
  customRules: CustomValidationRule[];
  crossFieldRules: CrossFieldRule[];
}

export interface CustomValidationRule {
  name: string;
  validator: string; // JavaScript function as string
  message: string;
}

export interface CrossFieldRule {
  fields: string[];
  rule: string;
  message: string;
}

// =============================================================================
// Conditional Logic
// =============================================================================

export interface ConditionalLogic {
  action: 'show' | 'hide' | 'enable' | 'disable' | 'require' | 'setValue' | 'addClass' | 'validate';
  logic: 'and' | 'or';
  conditions: FieldCondition[];
  value?: unknown;
  className?: string;
}

export interface FieldCondition {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'notContains' | 'startsWith' | 'endsWith' | 'empty' | 'notEmpty' | 'in' | 'notIn' | 'regex' | 'between' | 'checked' | 'unchecked';
  value?: unknown;
}

// =============================================================================
// Layout & Steps
// =============================================================================

export interface FormLayout {
  type: 'vertical' | 'horizontal' | 'inline' | 'grid' | 'tabs' | 'accordion' | 'wizard' | 'custom';
  columns: number;
  gap: number;
  padding: number;
  labelAlign: 'left' | 'right' | 'center';
  labelWidth: string;
  colon: boolean;
  requiredMark: 'required' | 'optional' | 'none' | 'asterisk';
  responsive: boolean;
  breakpoints: Record<string, number>;
}

export interface FormStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  fieldIds: string[];
  validation: 'none' | 'fields' | 'custom';
  customValidator?: string;
  isOptional: boolean;
  isCompleted: boolean;
}

// =============================================================================
// Submission
// =============================================================================

export interface FormSubmission {
  action: 'api' | 'email' | 'webhook' | 'store' | 'custom' | 'none';
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH';
  headers: Record<string, string>;
  format: 'json' | 'formdata' | 'urlencoded' | 'xml';
  transform: string;
  successMessage: string;
  errorMessage: string;
  redirectUrl: string;
  resetOnSuccess: boolean;
  preventDuplicate: boolean;
  rateLimit: number;
  captcha: boolean;
}

// =============================================================================
// Settings & Theme
// =============================================================================

export interface FormSettings {
  autoSave: boolean;
  autoSaveInterval: number;
  persistence: 'none' | 'local' | 'session' | 'url';
  spellCheck: boolean;
  autoComplete: 'on' | 'off' | 'custom';
  direction: 'ltr' | 'rtl' | 'auto';
  locale: string;
  debug: boolean;
  analytics: boolean;
  progressBar: boolean;
  showStepNumbers: boolean;
  allowSkipSteps: boolean;
  confirmSubmit: boolean;
  confirmCancel: boolean;
  confirmReset: boolean;
  accessibilityMode: boolean;
  keyboard: boolean;
  tabIndex: boolean;
}

export interface FormTheme {
  preset: string;
  primaryColor: string;
  errorColor: string;
  successColor: string;
  warningColor: string;
  infoColor: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  borderRadius: number;
  fontSize: number;
  fontFamily: string;
  spacing: number;
  shadow: string;
  animation: boolean;
  glassMorphism: boolean;
  darkMode: boolean;
}

// =============================================================================
// Form State
// =============================================================================

export interface FormState {
  values: Record<string, unknown>;
  errors: Record<string, string[]>;
  touched: Record<string, boolean>;
  dirty: Record<string, boolean>;
  focused: string | null;
  submitting: boolean;
  submitted: boolean;
  submitCount: number;
  isValid: boolean;
  isDirty: boolean;
  currentStep: number;
  stepHistory: number[];
}

// =============================================================================
// Form Event Types
// =============================================================================

export type FormEventType =
  | 'field:change' | 'field:blur' | 'field:focus' | 'field:error' | 'field:clear'
  | 'form:submit' | 'form:reset' | 'form:validate' | 'form:error'
  | 'step:next' | 'step:prev' | 'step:goto' | 'step:complete'
  | 'value:set' | 'value:clear' | 'value:reset';

export interface FormEvent {
  type: FormEventType;
  field?: string;
  value?: unknown;
  oldValue?: unknown;
  errors?: string[];
  step?: number;
  timestamp: number;
}

// =============================================================================
// Form Builder Engine
// =============================================================================

export class FormBuilderEngine {
  private forms: Map<string, FormDefinition> = new Map();
  private formStates: Map<string, FormState> = new Map();
  private listeners: Map<string, Array<(event: FormEvent) => void>> = new Map();
  private validators: Map<string, (value: unknown, field: FormField, values: Record<string, unknown>) => string | null> = new Map();
  private asyncValidators: Map<string, (value: unknown, field: FormField) => Promise<string | null>> = new Map();

  constructor() {
    this.registerBuiltInValidators();
  }

  // ---------------------------------------------------------------------------
  // Form CRUD
  // ---------------------------------------------------------------------------

  createForm(config: Partial<FormDefinition>): FormDefinition {
    const id = `form_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 6)}`;
    const now = Date.now();

    const form: FormDefinition = {
      id,
      name: config.name || 'Untitled Form',
      description: config.description || '',
      version: 1,
      fields: config.fields || [],
      layout: {
        type: 'vertical',
        columns: 1,
        gap: 16,
        padding: 24,
        labelAlign: 'left',
        labelWidth: '120px',
        colon: false,
        requiredMark: 'asterisk',
        responsive: true,
        breakpoints: { sm: 576, md: 768, lg: 992, xl: 1200 },
        ...config.layout,
      },
      validation: {
        mode: 'onBlur',
        showErrors: 'all',
        scrollToError: true,
        focusOnError: true,
        clearOnSubmit: false,
        customRules: [],
        crossFieldRules: [],
        ...config.validation,
      },
      submission: {
        action: 'none',
        url: '',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        format: 'json',
        transform: '',
        successMessage: 'Form submitted successfully!',
        errorMessage: 'An error occurred. Please try again.',
        redirectUrl: '',
        resetOnSuccess: false,
        preventDuplicate: true,
        rateLimit: 0,
        captcha: false,
        ...config.submission,
      },
      steps: config.steps || [],
      settings: {
        autoSave: false,
        autoSaveInterval: 30000,
        persistence: 'none',
        spellCheck: true,
        autoComplete: 'on',
        direction: 'ltr',
        locale: 'en',
        debug: false,
        analytics: false,
        progressBar: true,
        showStepNumbers: true,
        allowSkipSteps: false,
        confirmSubmit: false,
        confirmCancel: true,
        confirmReset: true,
        accessibilityMode: false,
        keyboard: true,
        tabIndex: true,
        ...config.settings,
      },
      theme: {
        preset: 'default',
        primaryColor: '#3b82f6',
        errorColor: '#ef4444',
        successColor: '#10b981',
        warningColor: '#f59e0b',
        infoColor: '#3b82f6',
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        borderColor: '#d1d5db',
        borderRadius: 8,
        fontSize: 14,
        fontFamily: 'Inter, system-ui, sans-serif',
        spacing: 16,
        shadow: '0 1px 3px rgba(0,0,0,0.1)',
        animation: true,
        glassMorphism: false,
        darkMode: false,
        ...config.theme,
      },
      metadata: config.metadata || {},
      createdAt: now,
      updatedAt: now,
    };

    this.forms.set(id, form);
    this.initializeFormState(id);
    return form;
  }

  getForm(id: string): FormDefinition | undefined {
    return this.forms.get(id);
  }

  updateForm(id: string, updates: Partial<FormDefinition>): FormDefinition | null {
    const form = this.forms.get(id);
    if (!form) return null;
    Object.assign(form, updates, { updatedAt: Date.now(), version: form.version + 1 });
    return form;
  }

  deleteForm(id: string): boolean {
    this.formStates.delete(id);
    return this.forms.delete(id);
  }

  duplicateForm(id: string): FormDefinition | null {
    const original = this.forms.get(id);
    if (!original) return null;
    return this.createForm({ ...JSON.parse(JSON.stringify(original)), name: `${original.name} (Copy)` });
  }

  listForms(): FormDefinition[] {
    return Array.from(this.forms.values());
  }

  // ---------------------------------------------------------------------------
  // Field Management
  // ---------------------------------------------------------------------------

  addField(formId: string, field: Partial<FormField>): FormField | null {
    const form = this.forms.get(formId);
    if (!form) return null;

    const newField: FormField = {
      id: `field_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 6)}`,
      type: field.type || 'text',
      name: field.name || `field_${form.fields.length + 1}`,
      label: field.label || `Field ${form.fields.length + 1}`,
      placeholder: field.placeholder || '',
      description: field.description || '',
      defaultValue: field.defaultValue ?? '',
      required: field.required ?? false,
      disabled: field.disabled ?? false,
      hidden: field.hidden ?? false,
      readOnly: field.readOnly ?? false,
      validation: field.validation || [],
      conditional: field.conditional || null,
      options: field.options || [],
      config: field.config || {},
      style: field.style || {},
      group: field.group || '',
      order: field.order ?? form.fields.length,
      width: field.width || 'full',
      step: field.step ?? 0,
      metadata: field.metadata || {},
    };

    form.fields.push(newField);
    form.updatedAt = Date.now();

    // Initialize field state
    const state = this.formStates.get(formId);
    if (state) {
      state.values[newField.name] = newField.defaultValue;
      state.errors[newField.name] = [];
      state.touched[newField.name] = false;
      state.dirty[newField.name] = false;
    }

    return newField;
  }

  removeField(formId: string, fieldId: string): boolean {
    const form = this.forms.get(formId);
    if (!form) return false;

    const field = form.fields.find(f => f.id === fieldId);
    if (!field) return false;

    form.fields = form.fields.filter(f => f.id !== fieldId);
    form.updatedAt = Date.now();

    // Clean up state
    const state = this.formStates.get(formId);
    if (state) {
      delete state.values[field.name];
      delete state.errors[field.name];
      delete state.touched[field.name];
      delete state.dirty[field.name];
    }

    return true;
  }

  updateField(formId: string, fieldId: string, updates: Partial<FormField>): FormField | null {
    const form = this.forms.get(formId);
    if (!form) return null;

    const field = form.fields.find(f => f.id === fieldId);
    if (!field) return null;

    Object.assign(field, updates);
    form.updatedAt = Date.now();
    return field;
  }

  moveField(formId: string, fieldId: string, newIndex: number): boolean {
    const form = this.forms.get(formId);
    if (!form) return false;

    const index = form.fields.findIndex(f => f.id === fieldId);
    if (index < 0 || newIndex < 0 || newIndex >= form.fields.length) return false;

    const [field] = form.fields.splice(index, 1);
    form.fields.splice(newIndex, 0, field);

    // Update order
    form.fields.forEach((f, i) => { f.order = i; });
    form.updatedAt = Date.now();
    return true;
  }

  // ---------------------------------------------------------------------------
  // Form State Management
  // ---------------------------------------------------------------------------

  initializeFormState(formId: string): FormState {
    const form = this.forms.get(formId);
    const values: Record<string, unknown> = {};
    const errors: Record<string, string[]> = {};
    const touched: Record<string, boolean> = {};
    const dirty: Record<string, boolean> = {};

    if (form) {
      for (const field of form.fields) {
        values[field.name] = field.defaultValue;
        errors[field.name] = [];
        touched[field.name] = false;
        dirty[field.name] = false;
      }
    }

    const state: FormState = {
      values,
      errors,
      touched,
      dirty,
      focused: null,
      submitting: false,
      submitted: false,
      submitCount: 0,
      isValid: true,
      isDirty: false,
      currentStep: 0,
      stepHistory: [0],
    };

    this.formStates.set(formId, state);
    return state;
  }

  getFormState(formId: string): FormState | undefined {
    return this.formStates.get(formId);
  }

  setFieldValue(formId: string, fieldName: string, value: unknown): void {
    const state = this.formStates.get(formId);
    if (!state) return;

    const oldValue = state.values[fieldName];
    state.values[fieldName] = value;
    state.dirty[fieldName] = true;
    state.isDirty = true;

    this.emitEvent(formId, {
      type: 'field:change',
      field: fieldName,
      value,
      oldValue,
      timestamp: Date.now(),
    });

    // Validate on change if configured
    const form = this.forms.get(formId);
    if (form?.validation.mode === 'onChange' || form?.validation.mode === 'all') {
      this.validateField(formId, fieldName);
    }

    // Evaluate conditional logic
    this.evaluateConditionals(formId);
  }

  setFieldTouched(formId: string, fieldName: string): void {
    const state = this.formStates.get(formId);
    if (!state) return;
    state.touched[fieldName] = true;

    this.emitEvent(formId, { type: 'field:blur', field: fieldName, timestamp: Date.now() });

    // Validate on blur if configured
    const form = this.forms.get(formId);
    if (form?.validation.mode === 'onBlur' || form?.validation.mode === 'all') {
      this.validateField(formId, fieldName);
    }
  }

  setFieldFocus(formId: string, fieldName: string): void {
    const state = this.formStates.get(formId);
    if (!state) return;
    state.focused = fieldName;
    this.emitEvent(formId, { type: 'field:focus', field: fieldName, timestamp: Date.now() });
  }

  setValues(formId: string, values: Record<string, unknown>): void {
    const state = this.formStates.get(formId);
    if (!state) return;
    Object.assign(state.values, values);
    for (const key of Object.keys(values)) {
      state.dirty[key] = true;
    }
    state.isDirty = true;
    this.evaluateConditionals(formId);
  }

  resetForm(formId: string): void {
    this.initializeFormState(formId);
    this.emitEvent(formId, { type: 'form:reset', timestamp: Date.now() });
  }

  clearForm(formId: string): void {
    const state = this.formStates.get(formId);
    if (!state) return;
    for (const key of Object.keys(state.values)) {
      state.values[key] = '';
      state.errors[key] = [];
      state.touched[key] = false;
      state.dirty[key] = false;
    }
    state.isDirty = false;
    state.isValid = true;
  }

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------

  validateField(formId: string, fieldName: string): string[] {
    const form = this.forms.get(formId);
    const state = this.formStates.get(formId);
    if (!form || !state) return [];

    const field = form.fields.find(f => f.name === fieldName);
    if (!field) return [];

    const value = state.values[fieldName];
    const errors: string[] = [];

    // Required check
    if (field.required && this.isEmpty(value)) {
      errors.push(field.label ? `${field.label} is required` : 'This field is required');
    }

    // Validation rules
    for (const rule of field.validation) {
      const error = this.runValidation(rule, value, field, state.values);
      if (error) errors.push(error);
    }

    state.errors[fieldName] = errors;
    state.isValid = Object.values(state.errors).every(e => e.length === 0);

    if (errors.length > 0) {
      this.emitEvent(formId, { type: 'field:error', field: fieldName, errors, timestamp: Date.now() });
    }

    return errors;
  }

  validateForm(formId: string): Record<string, string[]> {
    const form = this.forms.get(formId);
    const state = this.formStates.get(formId);
    if (!form || !state) return {};

    const allErrors: Record<string, string[]> = {};

    for (const field of form.fields) {
      if (field.hidden || field.disabled) continue;
      const errors = this.validateField(formId, field.name);
      if (errors.length > 0) {
        allErrors[field.name] = errors;
      }
    }

    // Cross-field validation
    for (const rule of form.validation.crossFieldRules) {
      try {
        const fn = new Function('values', 'fields', rule.rule);
        const result = fn(state.values, rule.fields);
        if (!result) {
          for (const field of rule.fields) {
            if (!allErrors[field]) allErrors[field] = [];
            allErrors[field].push(rule.message);
          }
        }
      } catch (e) {
        console.error('Cross-field validation error:', e);
      }
    }

    state.isValid = Object.keys(allErrors).length === 0;
    this.emitEvent(formId, { type: 'form:validate', errors: Object.values(allErrors).flat(), timestamp: Date.now() });

    return allErrors;
  }

  // ---------------------------------------------------------------------------
  // Submission
  // ---------------------------------------------------------------------------

  async submitForm(formId: string): Promise<FormSubmitResult> {
    const form = this.forms.get(formId);
    const state = this.formStates.get(formId);
    if (!form || !state) return { success: false, error: 'Form not found' };

    // Validate
    const errors = this.validateForm(formId);
    if (Object.keys(errors).length > 0) {
      return { success: false, errors, error: 'Validation failed' };
    }

    state.submitting = true;
    state.submitCount++;

    this.emitEvent(formId, { type: 'form:submit', value: state.values, timestamp: Date.now() });

    try {
      let result: unknown;

      switch (form.submission.action) {
        case 'api': {
          const body = this.formatSubmissionData(state.values, form.submission.format);
          const response = await fetch(form.submission.url, {
            method: form.submission.method,
            headers: form.submission.headers,
            body: body as BodyInit,
          });
          result = await response.json();
          if (!response.ok) throw new Error(`API error: ${response.status}`);
          break;
        }
        case 'webhook': {
          await fetch(form.submission.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(state.values),
          });
          result = { sent: true };
          break;
        }
        case 'store': {
          result = { stored: true, data: { ...state.values } };
          break;
        }
        default:
          result = state.values;
      }

      state.submitted = true;
      state.submitting = false;

      if (form.submission.resetOnSuccess) {
        this.resetForm(formId);
      }

      return { success: true, data: result };
    } catch (e) {
      state.submitting = false;
      this.emitEvent(formId, { type: 'form:error', errors: [String(e)], timestamp: Date.now() });
      return { success: false, error: String(e) };
    }
  }

  // ---------------------------------------------------------------------------
  // Multi-Step
  // ---------------------------------------------------------------------------

  nextStep(formId: string): boolean {
    const form = this.forms.get(formId);
    const state = this.formStates.get(formId);
    if (!form || !state) return false;
    if (form.steps.length === 0) return false;

    // Validate current step
    const currentStepFields = form.steps[state.currentStep]?.fieldIds || [];
    let hasErrors = false;
    for (const fieldId of currentStepFields) {
      const field = form.fields.find(f => f.id === fieldId);
      if (field) {
        const errors = this.validateField(formId, field.name);
        if (errors.length > 0) hasErrors = true;
      }
    }

    if (hasErrors) return false;

    if (state.currentStep < form.steps.length - 1) {
      state.currentStep++;
      state.stepHistory.push(state.currentStep);
      form.steps[state.currentStep - 1].isCompleted = true;
      this.emitEvent(formId, { type: 'step:next', step: state.currentStep, timestamp: Date.now() });
      return true;
    }

    return false;
  }

  prevStep(formId: string): boolean {
    const state = this.formStates.get(formId);
    if (!state || state.currentStep <= 0) return false;

    state.currentStep--;
    state.stepHistory.push(state.currentStep);
    this.emitEvent(formId, { type: 'step:prev', step: state.currentStep, timestamp: Date.now() });
    return true;
  }

  goToStep(formId: string, step: number): boolean {
    const form = this.forms.get(formId);
    const state = this.formStates.get(formId);
    if (!form || !state) return false;
    if (step < 0 || step >= form.steps.length) return false;

    state.currentStep = step;
    state.stepHistory.push(step);
    this.emitEvent(formId, { type: 'step:goto', step, timestamp: Date.now() });
    return true;
  }

  // ---------------------------------------------------------------------------
  // Conditional Logic
  // ---------------------------------------------------------------------------

  evaluateConditionals(formId: string): void {
    const form = this.forms.get(formId);
    const state = this.formStates.get(formId);
    if (!form || !state) return;

    for (const field of form.fields) {
      if (!field.conditional) continue;

      const met = this.evaluateCondition(field.conditional, state.values);

      switch (field.conditional.action) {
        case 'show': field.hidden = !met; break;
        case 'hide': field.hidden = met; break;
        case 'enable': field.disabled = !met; break;
        case 'disable': field.disabled = met; break;
        case 'require': field.required = met; break;
        case 'setValue':
          if (met && field.conditional.value !== undefined) {
            state.values[field.name] = field.conditional.value;
          }
          break;
      }
    }
  }

  private evaluateCondition(conditional: ConditionalLogic, values: Record<string, unknown>): boolean {
    const results = conditional.conditions.map(cond => {
      const fieldValue = values[cond.field];
      return this.checkCondition(fieldValue, cond.operator, cond.value);
    });

    return conditional.logic === 'and'
      ? results.every(Boolean)
      : results.some(Boolean);
  }

  private checkCondition(value: unknown, operator: string, compareValue: unknown): boolean {
    switch (operator) {
      case 'eq': return value === compareValue;
      case 'neq': return value !== compareValue;
      case 'gt': return Number(value) > Number(compareValue);
      case 'lt': return Number(value) < Number(compareValue);
      case 'gte': return Number(value) >= Number(compareValue);
      case 'lte': return Number(value) <= Number(compareValue);
      case 'contains': return String(value).includes(String(compareValue));
      case 'notContains': return !String(value).includes(String(compareValue));
      case 'startsWith': return String(value).startsWith(String(compareValue));
      case 'endsWith': return String(value).endsWith(String(compareValue));
      case 'empty': return this.isEmpty(value);
      case 'notEmpty': return !this.isEmpty(value);
      case 'in': return Array.isArray(compareValue) && compareValue.includes(value);
      case 'notIn': return Array.isArray(compareValue) && !compareValue.includes(value);
      case 'checked': return value === true;
      case 'unchecked': return value === false;
      case 'regex': try { return new RegExp(String(compareValue)).test(String(value)); } catch { return false; }
      case 'between': {
        const [min, max] = Array.isArray(compareValue) ? compareValue : [0, 0];
        const num = Number(value);
        return num >= Number(min) && num <= Number(max);
      }
      default: return false;
    }
  }

  // ---------------------------------------------------------------------------
  // Custom Validators
  // ---------------------------------------------------------------------------

  registerValidator(name: string, fn: (value: unknown, field: FormField, values: Record<string, unknown>) => string | null): void {
    this.validators.set(name, fn);
  }

  registerAsyncValidator(name: string, fn: (value: unknown, field: FormField) => Promise<string | null>): void {
    this.asyncValidators.set(name, fn);
  }

  // ---------------------------------------------------------------------------
  // Events
  // ---------------------------------------------------------------------------

  on(formId: string, handler: (event: FormEvent) => void): () => void {
    const key = `form:${formId}`;
    if (!this.listeners.has(key)) this.listeners.set(key, []);
    this.listeners.get(key)!.push(handler);
    return () => {
      const handlers = this.listeners.get(key);
      if (handlers) {
        const idx = handlers.indexOf(handler);
        if (idx >= 0) handlers.splice(idx, 1);
      }
    };
  }

  // ---------------------------------------------------------------------------
  // Export / Import
  // ---------------------------------------------------------------------------

  exportForm(formId: string, format: 'json' | 'html' | 'react' = 'json'): string {
    const form = this.forms.get(formId);
    if (!form) throw new Error(`Form "${formId}" not found`);

    switch (format) {
      case 'json':
        return JSON.stringify(form, null, 2);

      case 'html':
        return this.generateFormHTML(form);

      case 'react':
        return this.generateFormReact(form);

      default:
        return JSON.stringify(form, null, 2);
    }
  }

  importForm(data: string): FormDefinition {
    const parsed = JSON.parse(data) as FormDefinition;
    return this.createForm(parsed);
  }

  // ---------------------------------------------------------------------------
  // Stats
  // ---------------------------------------------------------------------------

  getFormStats(formId: string): FormStats | null {
    const form = this.forms.get(formId);
    const state = this.formStates.get(formId);
    if (!form || !state) return null;

    const fieldsByType = new Map<FormFieldType, number>();
    for (const field of form.fields) {
      fieldsByType.set(field.type, (fieldsByType.get(field.type) || 0) + 1);
    }

    return {
      totalFields: form.fields.length,
      requiredFields: form.fields.filter(f => f.required).length,
      hiddenFields: form.fields.filter(f => f.hidden).length,
      disabledFields: form.fields.filter(f => f.disabled).length,
      fieldsByType: Object.fromEntries(fieldsByType),
      totalSteps: form.steps.length,
      completedSteps: form.steps.filter(s => s.isCompleted).length,
      currentStep: state.currentStep,
      isValid: state.isValid,
      isDirty: state.isDirty,
      submitCount: state.submitCount,
      errorCount: Object.values(state.errors).flat().length,
      completionPercent: this.calculateCompletion(form, state),
    };
  }

  // ---------------------------------------------------------------------------
  // Private Methods
  // ---------------------------------------------------------------------------

  private registerBuiltInValidators(): void {
    this.validators.set('email', (value) => {
      if (!value) return null;
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return emailRegex.test(String(value)) ? null : 'Please enter a valid email address';
    });

    this.validators.set('url', (value) => {
      if (!value) return null;
      try { new URL(String(value)); return null; } catch { return 'Please enter a valid URL'; }
    });

    this.validators.set('phone', (value) => {
      if (!value) return null;
      const phoneRegex = /^\+?[\d\s-()]{7,15}$/;
      return phoneRegex.test(String(value)) ? null : 'Please enter a valid phone number';
    });

    this.validators.set('alphanumeric', (value) => {
      if (!value) return null;
      return /^[a-zA-Z0-9]+$/.test(String(value)) ? null : 'Only letters and numbers allowed';
    });

    this.validators.set('alpha', (value) => {
      if (!value) return null;
      return /^[a-zA-Z]+$/.test(String(value)) ? null : 'Only letters allowed';
    });

    this.validators.set('numeric', (value) => {
      if (!value) return null;
      return /^[0-9]+$/.test(String(value)) ? null : 'Only numbers allowed';
    });

    this.validators.set('creditCard', (value) => {
      if (!value) return null;
      const cleaned = String(value).replace(/\s|-/g, '');
      if (!/^\d{13,19}$/.test(cleaned)) return 'Invalid card number';
      // Luhn algorithm
      let sum = 0;
      let isEven = false;
      for (let i = cleaned.length - 1; i >= 0; i--) {
        let digit = parseInt(cleaned[i], 10);
        if (isEven) { digit *= 2; if (digit > 9) digit -= 9; }
        sum += digit;
        isEven = !isEven;
      }
      return sum % 10 === 0 ? null : 'Invalid card number';
    });

    this.validators.set('strongPassword', (value) => {
      if (!value) return null;
      const v = String(value);
      const checks = [
        { test: v.length >= 8, msg: 'at least 8 characters' },
        { test: /[A-Z]/.test(v), msg: 'an uppercase letter' },
        { test: /[a-z]/.test(v), msg: 'a lowercase letter' },
        { test: /[0-9]/.test(v), msg: 'a number' },
        { test: /[!@#$%^&*(),.?":{}|<>]/.test(v), msg: 'a special character' },
      ];
      const failed = checks.filter(c => !c.test);
      return failed.length === 0 ? null : `Password must contain ${failed.map(f => f.msg).join(', ')}`;
    });

    this.validators.set('json', (value) => {
      if (!value) return null;
      try { JSON.parse(String(value)); return null; } catch { return 'Invalid JSON format'; }
    });

    this.validators.set('slug', (value) => {
      if (!value) return null;
      return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(value)) ? null : 'Invalid slug format (use lowercase letters, numbers, and hyphens)';
    });

    this.validators.set('ip', (value) => {
      if (!value) return null;
      const ipv4 = /^(\d{1,3}\.){3}\d{1,3}$/;
      return ipv4.test(String(value)) ? null : 'Invalid IP address';
    });

    this.validators.set('uuid', (value) => {
      if (!value) return null;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      return uuidRegex.test(String(value)) ? null : 'Invalid UUID format';
    });

    this.validators.set('hex', (value) => {
      if (!value) return null;
      return /^[0-9a-fA-F]+$/.test(String(value)) ? null : 'Invalid hexadecimal value';
    });

    this.validators.set('base64', (value) => {
      if (!value) return null;
      return /^[A-Za-z0-9+/]+={0,2}$/.test(String(value)) ? null : 'Invalid Base64 format';
    });
  }

  private runValidation(rule: FieldValidation, value: unknown, field: FormField, values: Record<string, unknown>): string | null {
    const defaultMessage = (msg: string) => rule.message || msg;

    switch (rule.type) {
      case 'required':
        return this.isEmpty(value) ? defaultMessage(`${field.label || field.name} is required`) : null;

      case 'requiredIf': {
        const [depField, depValue] = Array.isArray(rule.value) ? rule.value : [rule.value, true];
        if (values[depField as string] === depValue && this.isEmpty(value)) {
          return defaultMessage(`${field.label || field.name} is required`);
        }
        return null;
      }

      case 'minLength': {
        const len = String(value || '').length;
        return len < Number(rule.value) ? defaultMessage(`Minimum ${rule.value} characters required`) : null;
      }

      case 'maxLength': {
        const len = String(value || '').length;
        return len > Number(rule.value) ? defaultMessage(`Maximum ${rule.value} characters allowed`) : null;
      }

      case 'min':
        return Number(value) < Number(rule.value) ? defaultMessage(`Minimum value is ${rule.value}`) : null;

      case 'max':
        return Number(value) > Number(rule.value) ? defaultMessage(`Maximum value is ${rule.value}`) : null;

      case 'between': {
        const [min, max] = Array.isArray(rule.value) ? rule.value : [0, rule.value];
        const num = Number(value);
        return num < Number(min) || num > Number(max) ? defaultMessage(`Value must be between ${min} and ${max}`) : null;
      }

      case 'pattern':
      case 'regex': {
        if (!value) return null;
        try {
          const regex = new RegExp(String(rule.value));
          return regex.test(String(value)) ? null : defaultMessage('Invalid format');
        } catch {
          return null;
        }
      }

      case 'match': {
        const matchValue = values[String(rule.value)];
        return value !== matchValue ? defaultMessage(`Must match ${rule.value}`) : null;
      }

      case 'different': {
        const diffValue = values[String(rule.value)];
        return value === diffValue ? defaultMessage(`Must be different from ${rule.value}`) : null;
      }

      case 'in': {
        const options = Array.isArray(rule.value) ? rule.value : [];
        return !options.includes(value) ? defaultMessage('Invalid selection') : null;
      }

      case 'notIn': {
        const excluded = Array.isArray(rule.value) ? rule.value : [];
        return excluded.includes(value) ? defaultMessage('This value is not allowed') : null;
      }

      case 'integer':
        return value && !Number.isInteger(Number(value)) ? defaultMessage('Must be a whole number') : null;

      case 'decimal':
        return value && isNaN(Number(value)) ? defaultMessage('Must be a decimal number') : null;

      case 'positive':
        return Number(value) <= 0 ? defaultMessage('Must be a positive number') : null;

      case 'negative':
        return Number(value) >= 0 ? defaultMessage('Must be a negative number') : null;

      case 'noSpaces':
        return String(value || '').includes(' ') ? defaultMessage('Spaces are not allowed') : null;

      case 'wordCount': {
        if (!value) return null;
        const words = String(value).trim().split(/\s+/).length;
        const [min, max] = Array.isArray(rule.value) ? rule.value : [1, rule.value];
        return words < Number(min) || words > Number(max) ? defaultMessage(`Word count must be between ${min} and ${max}`) : null;
      }

      case 'contains':
        return !String(value || '').includes(String(rule.value)) ? defaultMessage(`Must contain "${rule.value}"`) : null;

      case 'startsWith':
        return !String(value || '').startsWith(String(rule.value)) ? defaultMessage(`Must start with "${rule.value}"`) : null;

      case 'endsWith':
        return !String(value || '').endsWith(String(rule.value)) ? defaultMessage(`Must end with "${rule.value}"`) : null;

      default: {
        // Check custom validators
        const customValidator = this.validators.get(rule.type);
        if (customValidator) {
          return customValidator(value, field, values);
        }
        return null;
      }
    }
  }

  private isEmpty(value: unknown): boolean {
    if (value === undefined || value === null) return true;
    if (typeof value === 'string') return value.trim().length === 0;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value as object).length === 0;
    return false;
  }

  private formatSubmissionData(values: Record<string, unknown>, format: string): string | FormData {
    switch (format) {
      case 'json':
        return JSON.stringify(values);
      case 'formdata': {
        const fd = new FormData();
        for (const [key, val] of Object.entries(values)) {
          fd.append(key, String(val ?? ''));
        }
        return fd;
      }
      case 'urlencoded':
        return new URLSearchParams(
          Object.entries(values).map(([k, v]) => [k, String(v ?? '')])
        ).toString();
      case 'xml': {
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<form>\n';
        for (const [key, val] of Object.entries(values)) {
          xml += `  <${key}>${this.escapeXml(String(val ?? ''))}</${key}>\n`;
        }
        xml += '</form>';
        return xml;
      }
      default:
        return JSON.stringify(values);
    }
  }

  private escapeXml(str: string): string {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
  }

  private generateFormHTML(form: FormDefinition): string {
    let html = `<!DOCTYPE html>\n<html lang="${form.settings.locale}" dir="${form.settings.direction}">\n<head>\n  <meta charset="UTF-8">\n  <title>${form.name}</title>\n  <style>\n`;
    html += `    .form-container { max-width: 600px; margin: 0 auto; padding: ${form.layout.padding}px; font-family: ${form.theme.fontFamily}; color: ${form.theme.textColor}; }\n`;
    html += `    .form-field { margin-bottom: ${form.theme.spacing}px; }\n`;
    html += `    .form-label { display: block; margin-bottom: 4px; font-weight: 500; font-size: ${form.theme.fontSize}px; }\n`;
    html += `    .form-input { width: 100%; padding: 8px 12px; border: 1px solid ${form.theme.borderColor}; border-radius: ${form.theme.borderRadius}px; font-size: ${form.theme.fontSize}px; box-sizing: border-box; }\n`;
    html += `    .form-input:focus { outline: none; border-color: ${form.theme.primaryColor}; box-shadow: 0 0 0 3px ${form.theme.primaryColor}20; }\n`;
    html += `    .form-error { color: ${form.theme.errorColor}; font-size: 12px; margin-top: 4px; }\n`;
    html += `    .form-description { color: #6b7280; font-size: 12px; margin-top: 4px; }\n`;
    html += `    .form-required { color: ${form.theme.errorColor}; }\n`;
    html += `    .form-submit { background: ${form.theme.primaryColor}; color: white; border: none; padding: 10px 24px; border-radius: ${form.theme.borderRadius}px; cursor: pointer; font-size: ${form.theme.fontSize}px; }\n`;
    html += `    .form-submit:hover { opacity: 0.9; }\n`;
    html += `  </style>\n</head>\n<body>\n  <div class="form-container">\n`;
    html += `    <h1>${form.name}</h1>\n`;
    if (form.description) html += `    <p>${form.description}</p>\n`;
    html += `    <form action="${form.submission.url}" method="${form.submission.method}">\n`;

    for (const field of form.fields) {
      if (field.hidden) continue;
      html += `      <div class="form-field">\n`;

      if (!['hidden', 'divider', 'spacer'].includes(field.type)) {
        html += `        <label class="form-label" for="${field.name}">${field.label}`;
        if (field.required) html += ` <span class="form-required">*</span>`;
        html += `</label>\n`;
      }

      switch (field.type) {
        case 'text': case 'email': case 'password': case 'phone': case 'url': case 'number':
          html += `        <input type="${field.type === 'phone' ? 'tel' : field.type}" id="${field.name}" name="${field.name}" class="form-input" placeholder="${field.placeholder}"${field.required ? ' required' : ''}${field.disabled ? ' disabled' : ''}${field.readOnly ? ' readonly' : ''} />\n`;
          break;
        case 'textarea':
          html += `        <textarea id="${field.name}" name="${field.name}" class="form-input" placeholder="${field.placeholder}" rows="${field.config.rows || 4}"${field.required ? ' required' : ''}></textarea>\n`;
          break;
        case 'select':
          html += `        <select id="${field.name}" name="${field.name}" class="form-input"${field.required ? ' required' : ''}>\n`;
          html += `          <option value="">${field.placeholder || 'Select...'}</option>\n`;
          for (const opt of field.options) {
            html += `          <option value="${opt.value}">${opt.label}</option>\n`;
          }
          html += `        </select>\n`;
          break;
        case 'checkbox':
          html += `        <input type="checkbox" id="${field.name}" name="${field.name}"${field.required ? ' required' : ''} />\n`;
          break;
        case 'radio':
          for (const opt of field.options) {
            html += `        <label><input type="radio" name="${field.name}" value="${opt.value}"${field.required ? ' required' : ''} /> ${opt.label}</label>\n`;
          }
          break;
        case 'date':
          html += `        <input type="date" id="${field.name}" name="${field.name}" class="form-input"${field.required ? ' required' : ''} />\n`;
          break;
        case 'file':
          html += `        <input type="file" id="${field.name}" name="${field.name}" class="form-input"${field.config.accept ? ` accept="${field.config.accept}"` : ''}${field.required ? ' required' : ''} />\n`;
          break;
        case 'color':
          html += `        <input type="color" id="${field.name}" name="${field.name}"${field.required ? ' required' : ''} />\n`;
          break;
        case 'hidden':
          html += `        <input type="hidden" name="${field.name}" value="${field.defaultValue || ''}" />\n`;
          break;
        case 'divider':
          html += `        <hr />\n`;
          break;
        case 'heading':
          html += `        <h3>${field.label}</h3>\n`;
          break;
        case 'paragraph':
          html += `        <p>${field.description}</p>\n`;
          break;
      }

      if (field.description && !['heading', 'paragraph', 'divider'].includes(field.type)) {
        html += `        <div class="form-description">${field.description}</div>\n`;
      }

      html += `      </div>\n`;
    }

    html += `      <button type="submit" class="form-submit">Submit</button>\n`;
    html += `    </form>\n  </div>\n</body>\n</html>`;
    return html;
  }

  private generateFormReact(form: FormDefinition): string {
    let code = `'use client';\n\nimport React, { useState, useCallback } from 'react';\n\n`;
    code += `interface ${this.pascalCase(form.name)}Values {\n`;
    for (const field of form.fields) {
      if (['divider', 'heading', 'paragraph', 'spacer'].includes(field.type)) continue;
      const tsType = this.fieldTypeToTS(field.type, field.config.multiple);
      code += `  ${field.name}: ${tsType};\n`;
    }
    code += `}\n\n`;

    code += `export default function ${this.pascalCase(form.name)}() {\n`;
    code += `  const [values, setValues] = useState<${this.pascalCase(form.name)}Values>({\n`;
    for (const field of form.fields) {
      if (['divider', 'heading', 'paragraph', 'spacer'].includes(field.type)) continue;
      code += `    ${field.name}: ${JSON.stringify(field.defaultValue ?? '')},\n`;
    }
    code += `  });\n\n`;
    code += `  const [errors, setErrors] = useState<Record<string, string>>({});\n`;
    code += `  const [submitting, setSubmitting] = useState(false);\n\n`;

    code += `  const handleChange = useCallback((name: string, value: unknown) => {\n`;
    code += `    setValues(prev => ({ ...prev, [name]: value }));\n`;
    code += `    setErrors(prev => ({ ...prev, [name]: '' }));\n`;
    code += `  }, []);\n\n`;

    code += `  const handleSubmit = useCallback(async (e: React.FormEvent) => {\n`;
    code += `    e.preventDefault();\n`;
    code += `    setSubmitting(true);\n`;
    code += `    try {\n`;
    if (form.submission.action === 'api') {
      code += `      const response = await fetch('${form.submission.url}', {\n`;
      code += `        method: '${form.submission.method}',\n`;
      code += `        headers: { 'Content-Type': 'application/json' },\n`;
      code += `        body: JSON.stringify(values),\n`;
      code += `      });\n`;
      code += `      if (!response.ok) throw new Error('Submit failed');\n`;
    }
    code += `      alert('${form.submission.successMessage}');\n`;
    code += `    } catch (err) {\n`;
    code += `      alert('${form.submission.errorMessage}');\n`;
    code += `    } finally {\n`;
    code += `      setSubmitting(false);\n`;
    code += `    }\n`;
    code += `  }, [values]);\n\n`;

    code += `  return (\n`;
    code += `    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto p-6">\n`;
    code += `      <h1 className="text-2xl font-bold">${form.name}</h1>\n`;

    for (const field of form.fields) {
      if (field.hidden) continue;
      code += `\n      {/* ${field.label} */}\n`;
      code += `      <div className="space-y-1">\n`;

      if (!['hidden', 'divider', 'spacer'].includes(field.type)) {
        code += `        <label htmlFor="${field.name}" className="block text-sm font-medium">\n`;
        code += `          ${field.label}${field.required ? ' <span className="text-red-500">*</span>' : ''}\n`;
        code += `        </label>\n`;
      }

      switch (field.type) {
        case 'text': case 'email': case 'password': case 'number': case 'url':
          code += `        <input\n          type="${field.type}"\n          id="${field.name}"\n          value={String(values.${field.name} || '')}\n          onChange={e => handleChange('${field.name}', e.target.value)}\n          placeholder="${field.placeholder}"\n          className="w-full px-3 py-2 border rounded-lg"\n          ${field.required ? 'required\n          ' : ''}/>\n`;
          break;
        case 'textarea':
          code += `        <textarea\n          id="${field.name}"\n          value={String(values.${field.name} || '')}\n          onChange={e => handleChange('${field.name}', e.target.value)}\n          placeholder="${field.placeholder}"\n          rows={${field.config.rows || 4}}\n          className="w-full px-3 py-2 border rounded-lg"\n          />\n`;
          break;
        case 'select':
          code += `        <select\n          id="${field.name}"\n          value={String(values.${field.name} || '')}\n          onChange={e => handleChange('${field.name}', e.target.value)}\n          className="w-full px-3 py-2 border rounded-lg"\n        >\n`;
          code += `          <option value="">${field.placeholder || 'Select...'}</option>\n`;
          for (const opt of field.options) {
            code += `          <option value="${opt.value}">${opt.label}</option>\n`;
          }
          code += `        </select>\n`;
          break;
        case 'checkbox':
          code += `        <input\n          type="checkbox"\n          id="${field.name}"\n          checked={Boolean(values.${field.name})}\n          onChange={e => handleChange('${field.name}', e.target.checked)}\n        />\n`;
          break;
        default:
          code += `        <input\n          type="text"\n          id="${field.name}"\n          value={String(values.${field.name} || '')}\n          onChange={e => handleChange('${field.name}', e.target.value)}\n          className="w-full px-3 py-2 border rounded-lg"\n        />\n`;
      }

      if (field.description) {
        code += `        <p className="text-xs text-gray-500">${field.description}</p>\n`;
      }
      code += `        {errors.${field.name} && <p className="text-xs text-red-500">{errors.${field.name}}</p>}\n`;
      code += `      </div>\n`;
    }

    code += `\n      <button\n        type="submit"\n        disabled={submitting}\n        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"\n      >\n        {submitting ? 'Submitting...' : 'Submit'}\n      </button>\n`;
    code += `    </form>\n`;
    code += `  );\n`;
    code += `}\n`;

    return code;
  }

  private pascalCase(str: string): string {
    return str.replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()).replace(/^./, c => c.toUpperCase()).replace(/[^a-zA-Z0-9]/g, '');
  }

  private fieldTypeToTS(type: FormFieldType, multiple?: boolean): string {
    switch (type) {
      case 'number': case 'slider': case 'range': case 'rating': case 'stepper': return 'number';
      case 'checkbox': case 'toggle': case 'switch': return 'boolean';
      case 'date': case 'time': case 'datetime': return 'string';
      case 'multiselect': case 'tags': case 'chips': return 'string[]';
      case 'file': case 'image': case 'gallery': return multiple ? 'File[]' : 'File | null';
      default: return 'string';
    }
  }

  private calculateCompletion(form: FormDefinition, state: FormState): number {
    const requiredFields = form.fields.filter(f => f.required && !f.hidden && !f.disabled);
    if (requiredFields.length === 0) return 100;
    const filled = requiredFields.filter(f => !this.isEmpty(state.values[f.name]));
    return Math.round((filled.length / requiredFields.length) * 100);
  }

  private emitEvent(formId: string, event: FormEvent): void {
    const key = `form:${formId}`;
    const handlers = this.listeners.get(key);
    if (handlers) {
      for (const handler of handlers) {
        try { handler(event); } catch (e) { console.error('Form event error:', e); }
      }
    }
  }
}

// =============================================================================
// Types
// =============================================================================

export interface FormSubmitResult {
  success: boolean;
  data?: unknown;
  errors?: Record<string, string[]>;
  error?: string;
}

export interface FormStats {
  totalFields: number;
  requiredFields: number;
  hiddenFields: number;
  disabledFields: number;
  fieldsByType: Record<string, number>;
  totalSteps: number;
  completedSteps: number;
  currentStep: number;
  isValid: boolean;
  isDirty: boolean;
  submitCount: number;
  errorCount: number;
  completionPercent: number;
}

// =============================================================================
// Form Templates
// =============================================================================

export const FORM_TEMPLATES: Array<{
  name: string;
  description: string;
  category: string;
  icon: string;
  form: Partial<FormDefinition>;
}> = [
  {
    name: 'Contact Form',
    description: 'Simple contact form with name, email, and message',
    category: 'Basic',
    icon: 'mail',
    form: {
      name: 'Contact Form',
      fields: [
        { id: 'f1', type: 'text', name: 'name', label: 'Full Name', placeholder: 'John Doe', description: '', defaultValue: '', required: true, disabled: false, hidden: false, readOnly: false, validation: [{ type: 'minLength', value: 2 }], conditional: null, options: [], config: {}, style: {}, group: '', order: 0, width: 'full', step: 0, metadata: {} },
        { id: 'f2', type: 'email', name: 'email', label: 'Email', placeholder: 'john@example.com', description: '', defaultValue: '', required: true, disabled: false, hidden: false, readOnly: false, validation: [{ type: 'email' }], conditional: null, options: [], config: {}, style: {}, group: '', order: 1, width: 'full', step: 0, metadata: {} },
        { id: 'f3', type: 'phone', name: 'phone', label: 'Phone', placeholder: '+1 (555) 000-0000', description: 'Optional', defaultValue: '', required: false, disabled: false, hidden: false, readOnly: false, validation: [], conditional: null, options: [], config: {}, style: {}, group: '', order: 2, width: 'half', step: 0, metadata: {} },
        { id: 'f4', type: 'select', name: 'subject', label: 'Subject', placeholder: 'Select a subject', description: '', defaultValue: '', required: true, disabled: false, hidden: false, readOnly: false, validation: [], conditional: null, options: [
          { label: 'General Inquiry', value: 'general' }, { label: 'Support', value: 'support' }, { label: 'Sales', value: 'sales' }, { label: 'Feedback', value: 'feedback' },
        ], config: {}, style: {}, group: '', order: 3, width: 'half', step: 0, metadata: {} },
        { id: 'f5', type: 'textarea', name: 'message', label: 'Message', placeholder: 'Type your message...', description: '', defaultValue: '', required: true, disabled: false, hidden: false, readOnly: false, validation: [{ type: 'minLength', value: 10 }], conditional: null, options: [], config: { rows: 5 }, style: {}, group: '', order: 4, width: 'full', step: 0, metadata: {} },
        { id: 'f6', type: 'checkbox', name: 'subscribe', label: 'Subscribe to newsletter', placeholder: '', description: '', defaultValue: false, required: false, disabled: false, hidden: false, readOnly: false, validation: [], conditional: null, options: [], config: {}, style: {}, group: '', order: 5, width: 'full', step: 0, metadata: {} },
      ],
    },
  },
  {
    name: 'Login Form',
    description: 'User login with email and password',
    category: 'Auth',
    icon: 'lock',
    form: {
      name: 'Login',
      fields: [
        { id: 'f1', type: 'email', name: 'email', label: 'Email', placeholder: 'Enter your email', description: '', defaultValue: '', required: true, disabled: false, hidden: false, readOnly: false, validation: [{ type: 'email' }], conditional: null, options: [], config: {}, style: {}, group: '', order: 0, width: 'full', step: 0, metadata: {} },
        { id: 'f2', type: 'password', name: 'password', label: 'Password', placeholder: 'Enter your password', description: '', defaultValue: '', required: true, disabled: false, hidden: false, readOnly: false, validation: [{ type: 'minLength', value: 8 }], conditional: null, options: [], config: {}, style: {}, group: '', order: 1, width: 'full', step: 0, metadata: {} },
        { id: 'f3', type: 'checkbox', name: 'remember', label: 'Remember me', placeholder: '', description: '', defaultValue: false, required: false, disabled: false, hidden: false, readOnly: false, validation: [], conditional: null, options: [], config: {}, style: {}, group: '', order: 2, width: 'full', step: 0, metadata: {} },
      ],
    },
  },
  {
    name: 'Registration Form',
    description: 'User registration with multi-step layout',
    category: 'Auth',
    icon: 'user-plus',
    form: {
      name: 'Registration',
      steps: [
        { id: 's1', title: 'Account Details', description: 'Enter your account info', icon: 'user', fieldIds: ['f1', 'f2', 'f3', 'f4'], validation: 'fields', isOptional: false, isCompleted: false },
        { id: 's2', title: 'Profile Info', description: 'Tell us about yourself', icon: 'info', fieldIds: ['f5', 'f6', 'f7'], validation: 'fields', isOptional: false, isCompleted: false },
        { id: 's3', title: 'Preferences', description: 'Set your preferences', icon: 'settings', fieldIds: ['f8', 'f9', 'f10'], validation: 'none', isOptional: true, isCompleted: false },
      ],
      fields: [
        { id: 'f1', type: 'text', name: 'firstName', label: 'First Name', placeholder: 'John', description: '', defaultValue: '', required: true, disabled: false, hidden: false, readOnly: false, validation: [], conditional: null, options: [], config: {}, style: {}, group: '', order: 0, width: 'half', step: 0, metadata: {} },
        { id: 'f2', type: 'text', name: 'lastName', label: 'Last Name', placeholder: 'Doe', description: '', defaultValue: '', required: true, disabled: false, hidden: false, readOnly: false, validation: [], conditional: null, options: [], config: {}, style: {}, group: '', order: 1, width: 'half', step: 0, metadata: {} },
        { id: 'f3', type: 'email', name: 'email', label: 'Email', placeholder: 'john@example.com', description: '', defaultValue: '', required: true, disabled: false, hidden: false, readOnly: false, validation: [{ type: 'email' }], conditional: null, options: [], config: {}, style: {}, group: '', order: 2, width: 'full', step: 0, metadata: {} },
        { id: 'f4', type: 'password', name: 'password', label: 'Password', placeholder: 'Create a strong password', description: '', defaultValue: '', required: true, disabled: false, hidden: false, readOnly: false, validation: [{ type: 'strongPassword' }], conditional: null, options: [], config: {}, style: {}, group: '', order: 3, width: 'full', step: 0, metadata: {} },
        { id: 'f5', type: 'text', name: 'company', label: 'Company', placeholder: 'Acme Inc.', description: 'Optional', defaultValue: '', required: false, disabled: false, hidden: false, readOnly: false, validation: [], conditional: null, options: [], config: {}, style: {}, group: '', order: 4, width: 'full', step: 1, metadata: {} },
        { id: 'f6', type: 'phone', name: 'phone', label: 'Phone', placeholder: '+1 (555) 000-0000', description: '', defaultValue: '', required: false, disabled: false, hidden: false, readOnly: false, validation: [], conditional: null, options: [], config: {}, style: {}, group: '', order: 5, width: 'half', step: 1, metadata: {} },
        { id: 'f7', type: 'textarea', name: 'bio', label: 'Bio', placeholder: 'Tell us about yourself', description: '', defaultValue: '', required: false, disabled: false, hidden: false, readOnly: false, validation: [{ type: 'maxLength', value: 500 }], conditional: null, options: [], config: {}, style: {}, group: '', order: 6, width: 'full', step: 1, metadata: {} },
        { id: 'f8', type: 'select', name: 'theme', label: 'Theme', placeholder: '', description: '', defaultValue: 'light', required: false, disabled: false, hidden: false, readOnly: false, validation: [], conditional: null, options: [{ label: 'Light', value: 'light' }, { label: 'Dark', value: 'dark' }, { label: 'System', value: 'system' }], config: {}, style: {}, group: '', order: 7, width: 'half', step: 2, metadata: {} },
        { id: 'f9', type: 'select', name: 'language', label: 'Language', placeholder: '', description: '', defaultValue: 'en', required: false, disabled: false, hidden: false, readOnly: false, validation: [], conditional: null, options: [{ label: 'English', value: 'en' }, { label: 'Spanish', value: 'es' }, { label: 'French', value: 'fr' }, { label: 'German', value: 'de' }], config: {}, style: {}, group: '', order: 8, width: 'half', step: 2, metadata: {} },
        { id: 'f10', type: 'checkbox', name: 'marketingEmails', label: 'Receive marketing emails', placeholder: '', description: '', defaultValue: true, required: false, disabled: false, hidden: false, readOnly: false, validation: [], conditional: null, options: [], config: {}, style: {}, group: '', order: 9, width: 'full', step: 2, metadata: {} },
      ],
    },
  },
  {
    name: 'Survey Form',
    description: 'Customer satisfaction survey',
    category: 'Feedback',
    icon: 'clipboard',
    form: {
      name: 'Customer Survey',
      fields: [
        { id: 'f1', type: 'rating', name: 'satisfaction', label: 'How satisfied are you?', placeholder: '', description: '', defaultValue: 0, required: true, disabled: false, hidden: false, readOnly: false, validation: [{ type: 'min', value: 1, message: 'Please provide a rating' }], conditional: null, options: [], config: { stars: 5, allowHalf: true }, style: {}, group: '', order: 0, width: 'full', step: 0, metadata: {} },
        { id: 'f2', type: 'radio', name: 'recommend', label: 'Would you recommend us?', placeholder: '', description: '', defaultValue: '', required: true, disabled: false, hidden: false, readOnly: false, validation: [], conditional: null, options: [
          { label: 'Definitely', value: 'definitely' }, { label: 'Probably', value: 'probably' }, { label: 'Not sure', value: 'unsure' }, { label: 'Probably not', value: 'unlikely' }, { label: 'Definitely not', value: 'no' },
        ], config: {}, style: {}, group: '', order: 1, width: 'full', step: 0, metadata: {} },
        { id: 'f3', type: 'select', name: 'area', label: 'Area for improvement', placeholder: 'Select an area', description: '', defaultValue: '', required: false, disabled: false, hidden: false, readOnly: false, validation: [], conditional: null, options: [
          { label: 'Product Quality', value: 'quality' }, { label: 'Customer Service', value: 'service' }, { label: 'Pricing', value: 'pricing' },
          { label: 'User Experience', value: 'ux' }, { label: 'Documentation', value: 'docs' },
        ], config: {}, style: {}, group: '', order: 2, width: 'full', step: 0, metadata: {} },
        { id: 'f4', type: 'textarea', name: 'feedback', label: 'Additional Feedback', placeholder: 'Tell us more...', description: '', defaultValue: '', required: false, disabled: false, hidden: false, readOnly: false, validation: [], conditional: null, options: [], config: { rows: 5 }, style: {}, group: '', order: 3, width: 'full', step: 0, metadata: {} },
      ],
    },
  },
];

// =============================================================================
// Singleton Instance
// =============================================================================

export const formBuilder = new FormBuilderEngine();
