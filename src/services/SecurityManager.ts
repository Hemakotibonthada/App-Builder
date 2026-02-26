// =============================================================================
// Security Manager Service - Authentication, authorization, encryption,
// XSS prevention, CSRF protection, content security policies, and audit logging
// =============================================================================

// =============================================================================
// Types & Interfaces
// =============================================================================

export type AuthProvider = 'local' | 'google' | 'github' | 'microsoft' | 'apple' | 'facebook' | 'twitter' | 'saml' | 'oidc' | 'ldap';

export type Role = 'owner' | 'admin' | 'editor' | 'viewer' | 'guest' | 'custom';

export type Permission =
  | 'project:create' | 'project:read' | 'project:update' | 'project:delete' | 'project:publish' | 'project:share'
  | 'page:create' | 'page:read' | 'page:update' | 'page:delete' | 'page:duplicate'
  | 'widget:create' | 'widget:read' | 'widget:update' | 'widget:delete' | 'widget:move' | 'widget:style'
  | 'asset:upload' | 'asset:read' | 'asset:update' | 'asset:delete'
  | 'code:view' | 'code:edit' | 'code:export'
  | 'settings:read' | 'settings:update'
  | 'team:manage' | 'team:invite' | 'team:remove'
  | 'billing:read' | 'billing:manage'
  | 'api:access' | 'api:manage'
  | 'plugin:install' | 'plugin:configure' | 'plugin:remove'
  | 'analytics:read' | 'analytics:export'
  | 'audit:read' | 'audit:export';

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatar?: string;
  roles: Role[];
  permissions: Permission[];
  provider: AuthProvider;
  mfaEnabled: boolean;
  emailVerified: boolean;
  lastLogin: number;
  createdAt: number;
  metadata: Record<string, unknown>;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  refreshToken?: string;
  expiresAt: number;
  createdAt: number;
  lastActivity: number;
  ipAddress?: string;
  userAgent?: string;
  device?: DeviceInfo;
  isActive: boolean;
}

export interface DeviceInfo {
  type: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  os: string;
  browser: string;
  version: string;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  scope?: string;
  idToken?: string;
}

// =============================================================================
// Role-Based Access Control (RBAC)
// =============================================================================

export interface RoleDefinition {
  name: Role;
  displayName: string;
  description: string;
  permissions: Permission[];
  inherits?: Role;
  isCustom: boolean;
}

export const DEFAULT_ROLES: Record<Role, RoleDefinition> = {
  owner: {
    name: 'owner',
    displayName: 'Owner',
    description: 'Full access to all features and settings',
    permissions: [
      'project:create', 'project:read', 'project:update', 'project:delete', 'project:publish', 'project:share',
      'page:create', 'page:read', 'page:update', 'page:delete', 'page:duplicate',
      'widget:create', 'widget:read', 'widget:update', 'widget:delete', 'widget:move', 'widget:style',
      'asset:upload', 'asset:read', 'asset:update', 'asset:delete',
      'code:view', 'code:edit', 'code:export',
      'settings:read', 'settings:update',
      'team:manage', 'team:invite', 'team:remove',
      'billing:read', 'billing:manage',
      'api:access', 'api:manage',
      'plugin:install', 'plugin:configure', 'plugin:remove',
      'analytics:read', 'analytics:export',
      'audit:read', 'audit:export',
    ],
    isCustom: false,
  },
  admin: {
    name: 'admin',
    displayName: 'Administrator',
    description: 'Manage projects, team members, and settings',
    permissions: [
      'project:create', 'project:read', 'project:update', 'project:delete', 'project:publish', 'project:share',
      'page:create', 'page:read', 'page:update', 'page:delete', 'page:duplicate',
      'widget:create', 'widget:read', 'widget:update', 'widget:delete', 'widget:move', 'widget:style',
      'asset:upload', 'asset:read', 'asset:update', 'asset:delete',
      'code:view', 'code:edit', 'code:export',
      'settings:read', 'settings:update',
      'team:manage', 'team:invite', 'team:remove',
      'api:access', 'api:manage',
      'plugin:install', 'plugin:configure', 'plugin:remove',
      'analytics:read', 'analytics:export',
      'audit:read',
    ],
    isCustom: false,
  },
  editor: {
    name: 'editor',
    displayName: 'Editor',
    description: 'Edit pages, widgets, and upload assets',
    permissions: [
      'project:read', 'project:update',
      'page:create', 'page:read', 'page:update', 'page:delete', 'page:duplicate',
      'widget:create', 'widget:read', 'widget:update', 'widget:delete', 'widget:move', 'widget:style',
      'asset:upload', 'asset:read', 'asset:update',
      'code:view', 'code:edit',
      'settings:read',
      'plugin:configure',
      'analytics:read',
    ],
    isCustom: false,
  },
  viewer: {
    name: 'viewer',
    displayName: 'Viewer',
    description: 'View projects and pages (read-only)',
    permissions: [
      'project:read',
      'page:read',
      'widget:read',
      'asset:read',
      'code:view',
      'settings:read',
      'analytics:read',
    ],
    isCustom: false,
  },
  guest: {
    name: 'guest',
    displayName: 'Guest',
    description: 'Limited read-only access via shared link',
    permissions: [
      'project:read',
      'page:read',
      'widget:read',
    ],
    isCustom: false,
  },
  custom: {
    name: 'custom',
    displayName: 'Custom',
    description: 'Custom role with specific permissions',
    permissions: [],
    isCustom: true,
  },
};

// =============================================================================
// Content Security Policy
// =============================================================================

export interface CSPConfig {
  'default-src': string[];
  'script-src': string[];
  'style-src': string[];
  'img-src': string[];
  'font-src': string[];
  'connect-src': string[];
  'media-src': string[];
  'object-src': string[];
  'frame-src': string[];
  'frame-ancestors': string[];
  'base-uri': string[];
  'form-action': string[];
  'upgrade-insecure-requests': boolean;
  'block-all-mixed-content': boolean;
  'report-uri'?: string;
  'report-to'?: string;
}

export const DEFAULT_CSP: CSPConfig = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://cdn.jsdelivr.net', 'https://unpkg.com'],
  'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://cdn.jsdelivr.net'],
  'img-src': ["'self'", 'data:', 'blob:', 'https:', 'http:'],
  'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
  'connect-src': ["'self'", 'https:', 'wss:'],
  'media-src': ["'self'", 'https:', 'blob:'],
  'object-src': ["'none'"],
  'frame-src': ["'self'", 'https:'],
  'frame-ancestors': ["'self'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'upgrade-insecure-requests': true,
  'block-all-mixed-content': true,
};

// =============================================================================
// Audit Log
// =============================================================================

export interface AuditEntry {
  id: string;
  timestamp: number;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  severity: 'info' | 'warning' | 'critical';
  result: 'success' | 'failure' | 'denied';
}

// =============================================================================
// Security Manager Class
// =============================================================================

export class SecurityManager {
  private currentUser: User | null = null;
  private sessions: Map<string, Session> = new Map();
  private roles: Map<string, RoleDefinition> = new Map();
  private auditLog: AuditEntry[] = [];
  private cspConfig: CSPConfig = { ...DEFAULT_CSP };
  private rateLimits: Map<string, { count: number; resetAt: number }> = new Map();
  private blocklist: Set<string> = new Set();
  private allowlist: Set<string> = new Set();
  private listeners: Map<string, Array<(data: unknown) => void>> = new Map();
  private maxAuditLogSize = 10000;
  private sessionTimeout = 30 * 60 * 1000; // 30 minutes
  private maxLoginAttempts = 5;
  private lockoutDuration = 15 * 60 * 1000; // 15 minutes
  private loginAttempts: Map<string, { count: number; lockedUntil?: number }> = new Map();

  constructor() {
    // Initialize default roles
    for (const [key, role] of Object.entries(DEFAULT_ROLES)) {
      this.roles.set(key, role);
    }
  }

  // ---------------------------------------------------------------------------
  // Authentication
  // ---------------------------------------------------------------------------

  async login(email: string, password: string): Promise<{ user: User; token: AuthToken }> {
    // Check lockout
    const attempts = this.loginAttempts.get(email);
    if (attempts?.lockedUntil && Date.now() < attempts.lockedUntil) {
      const remainingMs = attempts.lockedUntil - Date.now();
      this.logAudit(email, 'login', 'auth', undefined, 'failure', 'critical', { reason: 'account_locked' });
      throw new SecurityError('Account temporarily locked. Try again in ' + Math.ceil(remainingMs / 60000) + ' minutes.', 'ACCOUNT_LOCKED');
    }

    // Validate credentials (simulated - in production this would call an auth service)
    const passwordHash = await this.hashPassword(password);
    if (!this.validateCredentials(email, passwordHash)) {
      // Track failed attempts
      const current = this.loginAttempts.get(email) || { count: 0 };
      current.count++;

      if (current.count >= this.maxLoginAttempts) {
        current.lockedUntil = Date.now() + this.lockoutDuration;
      }

      this.loginAttempts.set(email, current);
      this.logAudit(email, 'login_failed', 'auth', undefined, 'failure', 'warning', { attempts: current.count });
      throw new SecurityError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    // Reset login attempts
    this.loginAttempts.delete(email);

    // Create user
    const user: User = {
      id: this.generateId(),
      email,
      displayName: email.split('@')[0],
      roles: ['editor'],
      permissions: DEFAULT_ROLES.editor.permissions,
      provider: 'local',
      mfaEnabled: false,
      emailVerified: true,
      lastLogin: Date.now(),
      createdAt: Date.now(),
      metadata: {},
    };

    // Generate tokens
    const token = this.generateAuthToken(user);

    // Create session
    const session = this.createSession(user, token.accessToken);

    this.currentUser = user;
    this.logAudit(user.email, 'login', 'auth', user.id, 'success', 'info');
    this.emit('auth:login', { user, session });

    return { user, token };
  }

  logout(sessionId?: string): boolean {
    if (sessionId) {
      const session = this.sessions.get(sessionId);
      if (session) {
        session.isActive = false;
        this.logAudit(this.currentUser?.email || 'unknown', 'logout', 'auth', sessionId, 'success', 'info');
      }
    } else {
      // Logout all sessions for current user
      if (this.currentUser) {
        for (const [id, session] of this.sessions.entries()) {
          if (session.userId === this.currentUser.id) {
            session.isActive = false;
          }
        }
        this.logAudit(this.currentUser.email, 'logout_all', 'auth', this.currentUser.id, 'success', 'info');
      }
    }

    this.currentUser = null;
    this.emit('auth:logout', {});
    return true;
  }

  async refreshToken(refreshToken: string): Promise<AuthToken> {
    // Find session with this refresh token
    let targetSession: Session | null = null;
    for (const session of this.sessions.values()) {
      if (session.refreshToken === refreshToken && session.isActive) {
        targetSession = session;
        break;
      }
    }

    if (!targetSession) {
      throw new SecurityError('Invalid refresh token', 'INVALID_TOKEN');
    }

    // Generate new tokens
    const user = this.currentUser;
    if (!user) throw new SecurityError('No authenticated user', 'NO_USER');

    const newToken = this.generateAuthToken(user);
    targetSession.token = newToken.accessToken;
    targetSession.refreshToken = newToken.refreshToken;
    targetSession.expiresAt = Date.now() + newToken.expiresIn * 1000;

    this.emit('auth:token_refreshed', { sessionId: targetSession.id });
    return newToken;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  // ---------------------------------------------------------------------------
  // Authorization (RBAC)
  // ---------------------------------------------------------------------------

  hasPermission(permission: Permission, user?: User): boolean {
    const targetUser = user || this.currentUser;
    if (!targetUser) return false;

    // Owner has all permissions
    if (targetUser.roles.includes('owner')) return true;

    // Check direct permissions
    if (targetUser.permissions.includes(permission)) return true;

    // Check role-based permissions
    for (const role of targetUser.roles) {
      const roleDef = this.roles.get(role);
      if (roleDef?.permissions.includes(permission)) return true;

      // Check inherited roles
      if (roleDef?.inherits) {
        const inheritedRole = this.roles.get(roleDef.inherits);
        if (inheritedRole?.permissions.includes(permission)) return true;
      }
    }

    return false;
  }

  hasAnyPermission(permissions: Permission[], user?: User): boolean {
    return permissions.some(p => this.hasPermission(p, user));
  }

  hasAllPermissions(permissions: Permission[], user?: User): boolean {
    return permissions.every(p => this.hasPermission(p, user));
  }

  requirePermission(permission: Permission, user?: User): void {
    if (!this.hasPermission(permission, user)) {
      this.logAudit(
        (user || this.currentUser)?.email || 'unknown',
        'permission_denied',
        'auth',
        undefined,
        'denied',
        'warning',
        { permission }
      );
      throw new SecurityError(`Permission denied: ${permission}`, 'PERMISSION_DENIED');
    }
  }

  // ---------------------------------------------------------------------------
  // Role Management
  // ---------------------------------------------------------------------------

  createRole(name: string, displayName: string, permissions: Permission[], description: string = ''): RoleDefinition {
    const role: RoleDefinition = {
      name: name as Role,
      displayName,
      description,
      permissions,
      isCustom: true,
    };

    this.roles.set(name, role);
    this.logAudit(this.currentUser?.email || 'system', 'role_created', 'roles', name, 'success', 'info', { permissions });
    return role;
  }

  updateRole(name: string, updates: Partial<RoleDefinition>): RoleDefinition | null {
    const role = this.roles.get(name);
    if (!role || !role.isCustom) return null;

    const updated = { ...role, ...updates };
    this.roles.set(name, updated);
    return updated;
  }

  deleteRole(name: string): boolean {
    const role = this.roles.get(name);
    if (!role || !role.isCustom) return false;
    return this.roles.delete(name);
  }

  getRoles(): RoleDefinition[] {
    return Array.from(this.roles.values());
  }

  assignRole(userId: string, role: Role): boolean {
    if (this.currentUser?.id === userId) {
      if (!this.currentUser.roles.includes(role)) {
        this.currentUser.roles.push(role);

        const roleDef = this.roles.get(role);
        if (roleDef) {
          this.currentUser.permissions = [...new Set([...this.currentUser.permissions, ...roleDef.permissions])];
        }
      }
      this.logAudit(this.currentUser.email, 'role_assigned', 'users', userId, 'success', 'info', { role });
      return true;
    }
    return false;
  }

  // ---------------------------------------------------------------------------
  // Session Management
  // ---------------------------------------------------------------------------

  private createSession(user: User, token: string): Session {
    const session: Session = {
      id: this.generateId(),
      userId: user.id,
      token,
      refreshToken: this.generateToken(),
      expiresAt: Date.now() + this.sessionTimeout,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      isActive: true,
      device: this.detectDevice(),
    };

    this.sessions.set(session.id, session);
    return session;
  }

  getActiveSessions(userId?: string): Session[] {
    const sessions = Array.from(this.sessions.values());
    const filtered = userId
      ? sessions.filter(s => s.userId === userId && s.isActive)
      : sessions.filter(s => s.isActive);

    return filtered;
  }

  invalidateSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.isActive = false;
      return true;
    }
    return false;
  }

  cleanupExpiredSessions(): number {
    let cleaned = 0;
    const now = Date.now();

    for (const [id, session] of this.sessions.entries()) {
      if (session.expiresAt < now || !session.isActive) {
        this.sessions.delete(id);
        cleaned++;
      }
    }

    return cleaned;
  }

  // ---------------------------------------------------------------------------
  // XSS Prevention
  // ---------------------------------------------------------------------------

  sanitizeHTML(html: string): string {
    const dangerousTags = ['script', 'iframe', 'object', 'embed', 'form', 'applet', 'base', 'link', 'meta'];
    const dangerousAttrs = ['onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout', 'onfocus', 'onblur',
      'onsubmit', 'onreset', 'onchange', 'oninput', 'onkeydown', 'onkeyup', 'onkeypress',
      'ondblclick', 'oncontextmenu', 'ondrag', 'ondrop', 'onmousedown', 'onmouseup',
      'onscroll', 'onwheel', 'ontouchstart', 'ontouchmove', 'ontouchend'];

    let sanitized = html;

    // Remove dangerous tags
    for (const tag of dangerousTags) {
      const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi');
      sanitized = sanitized.replace(regex, '');
      // Also handle self-closing
      const selfClosingRegex = new RegExp(`<${tag}[^>]*\\/?>`, 'gi');
      sanitized = sanitized.replace(selfClosingRegex, '');
    }

    // Remove dangerous attributes
    for (const attr of dangerousAttrs) {
      const regex = new RegExp(`\\s${attr}\\s*=\\s*["'][^"']*["']`, 'gi');
      sanitized = sanitized.replace(regex, '');
      const unquotedRegex = new RegExp(`\\s${attr}\\s*=\\s*[^\\s>]+`, 'gi');
      sanitized = sanitized.replace(unquotedRegex, '');
    }

    // Remove javascript: URLs
    sanitized = sanitized.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"');
    sanitized = sanitized.replace(/src\s*=\s*["']javascript:[^"']*["']/gi, 'src=""');

    // Remove data: URLs in src (except images)
    sanitized = sanitized.replace(/src\s*=\s*["']data:(?!image)[^"']*["']/gi, 'src=""');

    // Remove expression() in style
    sanitized = sanitized.replace(/expression\s*\([^)]*\)/gi, '');

    // Remove -moz-binding
    sanitized = sanitized.replace(/-moz-binding\s*:[^;]*/gi, '');

    return sanitized;
  }

  escapeHTML(str: string): string {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;',
      '`': '&#96;',
    };

    return str.replace(/[&<>"'\/`]/g, char => entities[char] || char);
  }

  unescapeHTML(str: string): string {
    const entities: Record<string, string> = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#x27;': "'",
      '&#x2F;': '/',
      '&#96;': '`',
    };

    return str.replace(/&(?:amp|lt|gt|quot|#x27|#x2F|#96);/g, entity => entities[entity] || entity);
  }

  // ---------------------------------------------------------------------------
  // CSRF Protection
  // ---------------------------------------------------------------------------

  generateCSRFToken(): string {
    const token = this.generateToken();
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('csrf_token', token);
    }
    return token;
  }

  validateCSRFToken(token: string): boolean {
    if (typeof window === 'undefined') return true;
    const stored = sessionStorage.getItem('csrf_token');
    return stored === token;
  }

  getCSRFMetaTag(): string {
    const token = this.generateCSRFToken();
    return `<meta name="csrf-token" content="${token}" />`;
  }

  // ---------------------------------------------------------------------------
  // Content Security Policy
  // ---------------------------------------------------------------------------

  getCSP(): CSPConfig {
    return { ...this.cspConfig };
  }

  updateCSP(updates: Partial<CSPConfig>): CSPConfig {
    this.cspConfig = { ...this.cspConfig, ...updates };
    return this.cspConfig;
  }

  generateCSPHeader(): string {
    const directives: string[] = [];

    for (const [key, value] of Object.entries(this.cspConfig)) {
      if (typeof value === 'boolean') {
        if (value) directives.push(key);
      } else if (Array.isArray(value) && value.length > 0) {
        directives.push(`${key} ${value.join(' ')}`);
      } else if (typeof value === 'string') {
        directives.push(`${key} ${value}`);
      }
    }

    return directives.join('; ');
  }

  generateCSPMetaTag(): string {
    return `<meta http-equiv="Content-Security-Policy" content="${this.generateCSPHeader()}" />`;
  }

  // ---------------------------------------------------------------------------
  // Password Utilities
  // ---------------------------------------------------------------------------

  async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);

    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // Fallback simple hash
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const chr = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0;
    }
    return Math.abs(hash).toString(16);
  }

  validatePasswordStrength(password: string): PasswordStrengthResult {
    const checks = {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasDigit: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      noCommonPatterns: !this.isCommonPassword(password),
      noRepeatingChars: !/(.)\1{2,}/.test(password),
      noSequentialChars: !this.hasSequentialChars(password),
    };

    const passedChecks = Object.values(checks).filter(Boolean).length;
    const totalChecks = Object.keys(checks).length;
    const percentage = (passedChecks / totalChecks) * 100;

    let strength: 'very-weak' | 'weak' | 'fair' | 'strong' | 'very-strong';
    if (percentage < 25) strength = 'very-weak';
    else if (percentage < 50) strength = 'weak';
    else if (percentage < 75) strength = 'fair';
    else if (percentage < 100) strength = 'strong';
    else strength = 'very-strong';

    const suggestions: string[] = [];
    if (!checks.minLength) suggestions.push('Use at least 8 characters');
    if (!checks.hasUpperCase) suggestions.push('Add an uppercase letter');
    if (!checks.hasLowerCase) suggestions.push('Add a lowercase letter');
    if (!checks.hasDigit) suggestions.push('Add a number');
    if (!checks.hasSpecialChar) suggestions.push('Add a special character (!@#$%^&*)');
    if (!checks.noCommonPatterns) suggestions.push('Avoid common passwords');
    if (!checks.noRepeatingChars) suggestions.push('Avoid repeating characters');
    if (!checks.noSequentialChars) suggestions.push('Avoid sequential characters (abc, 123)');

    return {
      strength,
      score: passedChecks,
      maxScore: totalChecks,
      percentage,
      checks,
      suggestions,
      estimatedCrackTime: this.estimateCrackTime(password),
    };
  }

  generatePassword(length: number = 16, options?: PasswordGenerateOptions): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const digits = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let charset = '';
    const required: string[] = [];

    if (options?.uppercase !== false) { charset += uppercase; required.push(uppercase[Math.floor(Math.random() * uppercase.length)]); }
    if (options?.lowercase !== false) { charset += lowercase; required.push(lowercase[Math.floor(Math.random() * lowercase.length)]); }
    if (options?.digits !== false) { charset += digits; required.push(digits[Math.floor(Math.random() * digits.length)]); }
    if (options?.special !== false) { charset += special; required.push(special[Math.floor(Math.random() * special.length)]); }

    if (options?.excludeChars) {
      for (const char of options.excludeChars) {
        charset = charset.replace(char, '');
      }
    }

    // Generate password
    const password: string[] = [...required];
    for (let i = password.length; i < length; i++) {
      password.push(charset[Math.floor(Math.random() * charset.length)]);
    }

    // Shuffle
    for (let i = password.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [password[i], password[j]] = [password[j], password[i]];
    }

    return password.join('');
  }

  // ---------------------------------------------------------------------------
  // Encryption Utilities
  // ---------------------------------------------------------------------------

  async encrypt(data: string, key: string): Promise<string> {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const encoder = new TextEncoder();
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(key.padEnd(32, '0').slice(0, 32)),
        { name: 'AES-GCM' },
        false,
        ['encrypt']
      );

      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        keyMaterial,
        encoder.encode(data)
      );

      const combined = new Uint8Array(iv.length + new Uint8Array(encrypted).length);
      combined.set(iv);
      combined.set(new Uint8Array(encrypted), iv.length);

      return btoa(String.fromCharCode(...combined));
    }

    // Fallback: XOR cipher (not cryptographically secure)
    return this.xorCipher(data, key);
  }

  async decrypt(encryptedData: string, key: string): Promise<string> {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      const combined = new Uint8Array(atob(encryptedData).split('').map(c => c.charCodeAt(0)));
      const iv = combined.slice(0, 12);
      const data = combined.slice(12);

      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(key.padEnd(32, '0').slice(0, 32)),
        { name: 'AES-GCM' },
        false,
        ['decrypt']
      );

      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        keyMaterial,
        data
      );

      return decoder.decode(decrypted);
    }

    return this.xorCipher(encryptedData, key);
  }

  private xorCipher(text: string, key: string): string {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(result);
  }

  // ---------------------------------------------------------------------------
  // Input Validation & Sanitization
  // ---------------------------------------------------------------------------

  validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  validateURL(url: string): boolean {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  }

  sanitizeInput(input: string, options?: SanitizeOptions): string {
    let sanitized = input;

    // Trim whitespace
    if (options?.trim !== false) sanitized = sanitized.trim();

    // Remove null bytes
    sanitized = sanitized.replace(/\0/g, '');

    // Remove control characters
    if (options?.removeControlChars !== false) {
      sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    }

    // Escape HTML
    if (options?.escapeHTML !== false) {
      sanitized = this.escapeHTML(sanitized);
    }

    // Max length
    if (options?.maxLength && sanitized.length > options.maxLength) {
      sanitized = sanitized.slice(0, options.maxLength);
    }

    // Allowed characters regex
    if (options?.allowedPattern) {
      sanitized = sanitized.replace(new RegExp(`[^${options.allowedPattern}]`, 'g'), '');
    }

    return sanitized;
  }

  // ---------------------------------------------------------------------------
  // Audit Logging
  // ---------------------------------------------------------------------------

  private logAudit(
    userEmail: string,
    action: string,
    resource: string,
    resourceId?: string,
    result: AuditEntry['result'] = 'success',
    severity: AuditEntry['severity'] = 'info',
    details?: Record<string, unknown>
  ): void {
    const entry: AuditEntry = {
      id: this.generateId(),
      timestamp: Date.now(),
      userId: this.currentUser?.id || 'unknown',
      userEmail,
      action,
      resource,
      resourceId,
      details,
      severity,
      result,
    };

    this.auditLog.push(entry);
    if (this.auditLog.length > this.maxAuditLogSize) {
      this.auditLog = this.auditLog.slice(-this.maxAuditLogSize);
    }

    this.emit('audit:log', entry);
  }

  getAuditLog(filters?: AuditFilters): AuditEntry[] {
    let entries = [...this.auditLog];

    if (filters) {
      if (filters.userId) entries = entries.filter(e => e.userId === filters.userId);
      if (filters.action) entries = entries.filter(e => e.action === filters.action);
      if (filters.resource) entries = entries.filter(e => e.resource === filters.resource);
      if (filters.severity) entries = entries.filter(e => e.severity === filters.severity);
      if (filters.result) entries = entries.filter(e => e.result === filters.result);
      if (filters.startDate) entries = entries.filter(e => e.timestamp >= filters.startDate!);
      if (filters.endDate) entries = entries.filter(e => e.timestamp <= filters.endDate!);
      if (filters.search) {
        const search = filters.search.toLowerCase();
        entries = entries.filter(e =>
          e.action.toLowerCase().includes(search) ||
          e.userEmail.toLowerCase().includes(search) ||
          e.resource.toLowerCase().includes(search)
        );
      }
    }

    return entries.slice(-(filters?.limit || 100));
  }

  exportAuditLog(format: 'json' | 'csv'): string {
    if (format === 'json') {
      return JSON.stringify(this.auditLog, null, 2);
    }

    const headers = ['timestamp', 'userEmail', 'action', 'resource', 'resourceId', 'severity', 'result'];
    let csv = headers.join(',') + '\n';

    for (const entry of this.auditLog) {
      csv += [
        new Date(entry.timestamp).toISOString(),
        `"${entry.userEmail}"`,
        entry.action,
        entry.resource,
        entry.resourceId || '',
        entry.severity,
        entry.result,
      ].join(',') + '\n';
    }

    return csv;
  }

  clearAuditLog(): void {
    this.auditLog = [];
    this.emit('audit:cleared', {});
  }

  // ---------------------------------------------------------------------------
  // Security Headers
  // ---------------------------------------------------------------------------

  generateSecurityHeaders(): Record<string, string> {
    return {
      'Content-Security-Policy': this.generateCSPHeader(),
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      'X-DNS-Prefetch-Control': 'off',
      'X-Download-Options': 'noopen',
      'X-Permitted-Cross-Domain-Policies': 'none',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'same-origin',
    };
  }

  generateSecurityMetaTags(): string {
    let tags = '';
    tags += this.generateCSPMetaTag() + '\n';
    tags += `<meta http-equiv="X-Content-Type-Options" content="nosniff" />\n`;
    tags += `<meta http-equiv="X-Frame-Options" content="SAMEORIGIN" />\n`;
    tags += `<meta http-equiv="X-XSS-Protection" content="1; mode=block" />\n`;
    tags += `<meta name="referrer" content="strict-origin-when-cross-origin" />\n`;
    return tags;
  }

  // ---------------------------------------------------------------------------
  // Rate Limiting
  // ---------------------------------------------------------------------------

  checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const limit = this.rateLimits.get(key);

    if (!limit || now > limit.resetAt) {
      this.rateLimits.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }

    if (limit.count >= maxRequests) {
      return false;
    }

    limit.count++;
    return true;
  }

  // ---------------------------------------------------------------------------
  // Private Helpers
  // ---------------------------------------------------------------------------

  private validateCredentials(_email: string, _passwordHash: string): boolean {
    // In a real application, this would check against a database
    // For the builder, we accept any credentials for demo purposes
    return _email.length > 0 && _passwordHash.length > 0;
  }

  private generateAuthToken(user: User): AuthToken {
    return {
      accessToken: this.generateToken(),
      refreshToken: this.generateToken(),
      tokenType: 'Bearer',
      expiresIn: 3600, // 1 hour
      scope: user.permissions.join(' '),
    };
  }

  private generateToken(): string {
    const array = new Uint8Array(32);
    if (typeof crypto !== 'undefined') {
      crypto.getRandomValues(array);
    } else {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }
    return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private isCommonPassword(password: string): boolean {
    const common = [
      'password', '123456', '12345678', 'qwerty', 'abc123', 'monkey', '1234567',
      'letmein', 'trustno1', 'dragon', 'baseball', 'iloveyou', 'master', 'sunshine',
      'ashley', 'bailey', 'passw0rd', 'shadow', '123123', '654321', 'superman',
      'qazwsx', 'michael', 'football', 'password1', 'password123', 'admin', 'welcome',
    ];
    return common.includes(password.toLowerCase());
  }

  private hasSequentialChars(password: string): boolean {
    const sequences = ['abcdefghijklmnopqrstuvwxyz', '0123456789', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
    const lower = password.toLowerCase();

    for (const seq of sequences) {
      for (let i = 0; i <= seq.length - 3; i++) {
        if (lower.includes(seq.slice(i, i + 3))) return true;
      }
    }

    return false;
  }

  private estimateCrackTime(password: string): string {
    let charset = 0;
    if (/[a-z]/.test(password)) charset += 26;
    if (/[A-Z]/.test(password)) charset += 26;
    if (/[0-9]/.test(password)) charset += 10;
    if (/[^a-zA-Z0-9]/.test(password)) charset += 33;

    const combinations = Math.pow(charset || 1, password.length);
    const guessesPerSecond = 100_000_000_000; // 100 billion (modern GPU)
    const seconds = combinations / guessesPerSecond;

    if (seconds < 1) return 'Instantly';
    if (seconds < 60) return `${Math.round(seconds)} seconds`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
    if (seconds < 86400 * 365) return `${Math.round(seconds / 86400)} days`;
    if (seconds < 86400 * 365 * 1000) return `${Math.round(seconds / (86400 * 365))} years`;
    if (seconds < 86400 * 365 * 1000000) return `${Math.round(seconds / (86400 * 365 * 1000))} thousand years`;
    return 'Millions+ years';
  }

  private detectDevice(): DeviceInfo {
    if (typeof navigator === 'undefined') {
      return { type: 'unknown', os: 'unknown', browser: 'unknown', version: 'unknown' };
    }

    const ua = navigator.userAgent;
    let type: DeviceInfo['type'] = 'desktop';
    if (/Mobile|Android|iPhone/i.test(ua)) type = 'mobile';
    else if (/Tablet|iPad/i.test(ua)) type = 'tablet';

    let os = 'unknown';
    if (/Windows/i.test(ua)) os = 'Windows';
    else if (/Mac/i.test(ua)) os = 'macOS';
    else if (/Linux/i.test(ua)) os = 'Linux';
    else if (/Android/i.test(ua)) os = 'Android';
    else if (/iOS|iPhone|iPad/i.test(ua)) os = 'iOS';

    let browser = 'unknown';
    let version = 'unknown';
    if (/Chrome\/(\d+)/i.test(ua)) { browser = 'Chrome'; version = RegExp.$1; }
    else if (/Firefox\/(\d+)/i.test(ua)) { browser = 'Firefox'; version = RegExp.$1; }
    else if (/Safari\/(\d+)/i.test(ua) && !/Chrome/i.test(ua)) { browser = 'Safari'; version = RegExp.$1; }
    else if (/Edge\/(\d+)/i.test(ua)) { browser = 'Edge'; version = RegExp.$1; }

    return { type, os, browser, version };
  }

  // Event system
  on(event: string, handler: (data: unknown) => void): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push(handler);
    return () => {
      const handlers = this.listeners.get(event);
      if (handlers) {
        const idx = handlers.indexOf(handler);
        if (idx >= 0) handlers.splice(idx, 1);
      }
    };
  }

  private emit(event: string, data: unknown): void {
    const handlers = this.listeners.get(event);
    if (handlers) handlers.forEach(h => { try { h(data); } catch (e) { console.error(e); } });
  }
}

// =============================================================================
// Custom Error Class
// =============================================================================

export class SecurityError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = 'SecurityError';
    this.code = code;
  }
}

// =============================================================================
// Additional Types
// =============================================================================

export interface PasswordStrengthResult {
  strength: 'very-weak' | 'weak' | 'fair' | 'strong' | 'very-strong';
  score: number;
  maxScore: number;
  percentage: number;
  checks: Record<string, boolean>;
  suggestions: string[];
  estimatedCrackTime: string;
}

export interface PasswordGenerateOptions {
  uppercase?: boolean;
  lowercase?: boolean;
  digits?: boolean;
  special?: boolean;
  excludeChars?: string;
}

export interface SanitizeOptions {
  trim?: boolean;
  removeControlChars?: boolean;
  escapeHTML?: boolean;
  maxLength?: number;
  allowedPattern?: string;
}

export interface AuditFilters {
  userId?: string;
  action?: string;
  resource?: string;
  severity?: AuditEntry['severity'];
  result?: AuditEntry['result'];
  startDate?: number;
  endDate?: number;
  search?: string;
  limit?: number;
}

// =============================================================================
// Singleton Instance
// =============================================================================

export const securityManager = new SecurityManager();
