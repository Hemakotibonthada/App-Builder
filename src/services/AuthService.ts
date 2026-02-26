// =============================================================================
// Authentication Service - Complete auth system with JWT, OAuth, session
// management, role-based access control, and security features
// =============================================================================

// =============================================================================
// Auth Types
// =============================================================================

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar?: string;
  role: UserRole;
  permissions: Permission[];
  metadata: UserMetadata;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  isActive: boolean;
  isVerified: boolean;
  mfaEnabled: boolean;
}

export type UserRole = 'admin' | 'editor' | 'viewer' | 'developer' | 'designer' | 'owner' | 'guest';

export type Permission =
  | 'project:create' | 'project:read' | 'project:update' | 'project:delete' | 'project:publish'
  | 'page:create' | 'page:read' | 'page:update' | 'page:delete'
  | 'widget:create' | 'widget:read' | 'widget:update' | 'widget:delete' | 'widget:move'
  | 'style:read' | 'style:update'
  | 'asset:upload' | 'asset:read' | 'asset:delete'
  | 'team:invite' | 'team:remove' | 'team:manage'
  | 'settings:read' | 'settings:update'
  | 'code:view' | 'code:edit' | 'code:export'
  | 'analytics:view'
  | 'billing:manage'
  | 'plugin:install' | 'plugin:manage'
  | 'version:create' | 'version:restore'
  | 'comment:create' | 'comment:delete'
  | 'api:access';

export interface UserMetadata {
  timezone?: string;
  language?: string;
  theme?: 'light' | 'dark' | 'system';
  company?: string;
  jobTitle?: string;
  bio?: string;
  socialLinks?: Record<string, string>;
  onboardingCompleted?: boolean;
  preferences?: Record<string, unknown>;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  idToken?: string;
  tokenType: 'Bearer';
  expiresIn: number;
  expiresAt: number;
  scope?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
  mfaCode?: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  displayName: string;
  acceptTerms: boolean;
  newsletter?: boolean;
}

export interface OAuthProvider {
  id: string;
  name: string;
  icon: string;
  color: string;
  scopes: string[];
  authUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  clientId: string;
}

export interface Session {
  id: string;
  userId: string;
  deviceInfo: DeviceInfo;
  ipAddress: string;
  location?: string;
  createdAt: string;
  expiresAt: string;
  lastActivityAt: string;
  isActive: boolean;
  isCurrent: boolean;
}

export interface DeviceInfo {
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  screenResolution?: string;
  userAgent: string;
}

export interface PasswordPolicy {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  disallowCommonPasswords: boolean;
  disallowUserInfo: boolean;
  maxRepeatingChars: number;
  passwordHistory: number;
}

export interface AuthEvent {
  type: AuthEventType;
  userId?: string;
  email?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export type AuthEventType =
  | 'login' | 'logout' | 'register' | 'password_change' | 'password_reset'
  | 'mfa_enable' | 'mfa_disable' | 'mfa_verify'
  | 'token_refresh' | 'token_revoke'
  | 'session_create' | 'session_expire' | 'session_revoke'
  | 'oauth_connect' | 'oauth_disconnect'
  | 'email_verify' | 'account_lock' | 'account_unlock'
  | 'permission_change' | 'role_change';

// =============================================================================
// Role Permissions Matrix
// =============================================================================

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  owner: [
    'project:create', 'project:read', 'project:update', 'project:delete', 'project:publish',
    'page:create', 'page:read', 'page:update', 'page:delete',
    'widget:create', 'widget:read', 'widget:update', 'widget:delete', 'widget:move',
    'style:read', 'style:update',
    'asset:upload', 'asset:read', 'asset:delete',
    'team:invite', 'team:remove', 'team:manage',
    'settings:read', 'settings:update',
    'code:view', 'code:edit', 'code:export',
    'analytics:view', 'billing:manage',
    'plugin:install', 'plugin:manage',
    'version:create', 'version:restore',
    'comment:create', 'comment:delete',
    'api:access',
  ],
  admin: [
    'project:create', 'project:read', 'project:update', 'project:delete', 'project:publish',
    'page:create', 'page:read', 'page:update', 'page:delete',
    'widget:create', 'widget:read', 'widget:update', 'widget:delete', 'widget:move',
    'style:read', 'style:update',
    'asset:upload', 'asset:read', 'asset:delete',
    'team:invite', 'team:remove', 'team:manage',
    'settings:read', 'settings:update',
    'code:view', 'code:edit', 'code:export',
    'analytics:view',
    'plugin:install', 'plugin:manage',
    'version:create', 'version:restore',
    'comment:create', 'comment:delete',
    'api:access',
  ],
  developer: [
    'project:read', 'project:update',
    'page:create', 'page:read', 'page:update', 'page:delete',
    'widget:create', 'widget:read', 'widget:update', 'widget:delete', 'widget:move',
    'style:read', 'style:update',
    'asset:upload', 'asset:read',
    'settings:read',
    'code:view', 'code:edit', 'code:export',
    'plugin:install',
    'version:create', 'version:restore',
    'comment:create',
    'api:access',
  ],
  designer: [
    'project:read', 'project:update',
    'page:create', 'page:read', 'page:update',
    'widget:create', 'widget:read', 'widget:update', 'widget:delete', 'widget:move',
    'style:read', 'style:update',
    'asset:upload', 'asset:read',
    'settings:read',
    'code:view',
    'version:create',
    'comment:create',
  ],
  editor: [
    'project:read', 'project:update',
    'page:read', 'page:update',
    'widget:read', 'widget:update', 'widget:move',
    'style:read', 'style:update',
    'asset:upload', 'asset:read',
    'settings:read',
    'comment:create',
  ],
  viewer: [
    'project:read',
    'page:read',
    'widget:read',
    'style:read',
    'asset:read',
    'comment:create',
  ],
  guest: [
    'project:read',
    'page:read',
    'widget:read',
    'style:read',
  ],
};

// =============================================================================
// Password Validation
// =============================================================================

export const DEFAULT_PASSWORD_POLICY: PasswordPolicy = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  disallowCommonPasswords: true,
  disallowUserInfo: true,
  maxRepeatingChars: 3,
  passwordHistory: 5,
};

export interface PasswordStrength {
  score: number; // 0-100
  level: 'very-weak' | 'weak' | 'fair' | 'strong' | 'very-strong';
  label: string;
  color: string;
  feedback: string[];
  passesPolicy: boolean;
  policyViolations: string[];
}

const COMMON_PASSWORDS = new Set([
  'password', '123456', '12345678', 'qwerty', 'abc123', 'monkey', 'master',
  'dragon', '111111', 'baseball', 'iloveyou', 'trustno1', 'sunshine',
  'princess', 'football', 'charlie', 'shadow', 'michael', 'login',
  'letmein', 'photoshop', '1234', 'starwars', 'welcome', 'admin',
  'passw0rd', 'hello', 'ashley', 'mustang', 'bailey', 'password1',
  'pa55word', 'p@ssw0rd', 'qwerty123', 'password123', 'admin123',
]);

export function validatePassword(
  password: string,
  policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY,
  userInfo?: { email?: string; username?: string; displayName?: string }
): PasswordStrength {
  let score = 0;
  const feedback: string[] = [];
  const violations: string[] = [];

  // Length scoring
  if (password.length >= policy.minLength) {
    score += 15;
  } else {
    violations.push(`Password must be at least ${policy.minLength} characters`);
  }

  if (password.length > policy.maxLength) {
    violations.push(`Password must be at most ${policy.maxLength} characters`);
  }

  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;
  if (password.length >= 20) score += 5;

  // Character diversity
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  if (policy.requireUppercase && !hasUpper) {
    violations.push('Password must contain at least one uppercase letter');
  } else if (hasUpper) {
    score += 10;
  }

  if (policy.requireLowercase && !hasLower) {
    violations.push('Password must contain at least one lowercase letter');
  } else if (hasLower) {
    score += 10;
  }

  if (policy.requireNumbers && !hasNumber) {
    violations.push('Password must contain at least one number');
  } else if (hasNumber) {
    score += 10;
  }

  if (policy.requireSpecialChars && !hasSpecial) {
    violations.push('Password must contain at least one special character');
  } else if (hasSpecial) {
    score += 15;
  }

  // Entropy bonus
  const charTypes = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
  score += charTypes * 3;

  // Unique characters bonus
  const uniqueChars = new Set(password.split('')).size;
  const uniqueRatio = uniqueChars / password.length;
  score += Math.floor(uniqueRatio * 10);

  // Penalties
  if (policy.disallowCommonPasswords && COMMON_PASSWORDS.has(password.toLowerCase())) {
    violations.push('This is a commonly used password');
    score -= 30;
  }

  if (policy.disallowUserInfo && userInfo) {
    const lowerPwd = password.toLowerCase();
    if (userInfo.email) {
      const emailLocal = userInfo.email.split('@')[0] ?? '';
      if (emailLocal && lowerPwd.includes(emailLocal.toLowerCase())) {
        violations.push('Password should not contain parts of your email');
        score -= 15;
      }
    }
    if (userInfo.username && lowerPwd.includes(userInfo.username.toLowerCase())) {
      violations.push('Password should not contain your username');
      score -= 15;
    }
    if (userInfo.displayName) {
      const names = userInfo.displayName.toLowerCase().split(/\s+/);
      for (const name of names) {
        if (name.length > 2 && lowerPwd.includes(name)) {
          violations.push('Password should not contain parts of your name');
          score -= 10;
          break;
        }
      }
    }
  }

  // Repeating characters penalty
  if (policy.maxRepeatingChars > 0) {
    const repeatRegex = new RegExp(`(.)\\1{${policy.maxRepeatingChars},}`, 'g');
    if (repeatRegex.test(password)) {
      violations.push(`Password should not have more than ${policy.maxRepeatingChars} repeating characters`);
      score -= 10;
    }
  }

  // Sequential characters penalty
  const sequences = ['abcdefghijklmnopqrstuvwxyz', '0123456789', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
  for (const seq of sequences) {
    for (let i = 0; i <= seq.length - 4; i++) {
      const sub = seq.substring(i, i + 4);
      if (password.toLowerCase().includes(sub) || password.toLowerCase().includes(sub.split('').reverse().join(''))) {
        score -= 5;
        feedback.push('Avoid sequential characters');
        break;
      }
    }
  }

  // Normalize score
  score = Math.max(0, Math.min(100, score));

  // Determine level
  let level: PasswordStrength['level'];
  let label: string;
  let color: string;

  if (score < 20) {
    level = 'very-weak'; label = 'Very Weak'; color = '#FF4444';
  } else if (score < 40) {
    level = 'weak'; label = 'Weak'; color = '#FF8800';
  } else if (score < 60) {
    level = 'fair'; label = 'Fair'; color = '#FFCC00';
  } else if (score < 80) {
    level = 'strong'; label = 'Strong'; color = '#88CC00';
  } else {
    level = 'very-strong'; label = 'Very Strong'; color = '#00CC44';
  }

  // Suggestions
  if (!hasUpper) feedback.push('Add uppercase letters');
  if (!hasLower) feedback.push('Add lowercase letters');
  if (!hasNumber) feedback.push('Add numbers');
  if (!hasSpecial) feedback.push('Add special characters (!@#$%^&*)');
  if (password.length < 12) feedback.push('Use at least 12 characters for better security');
  if (uniqueRatio < 0.5) feedback.push('Use more varied characters');

  return {
    score,
    level,
    label,
    color,
    feedback,
    passesPolicy: violations.length === 0,
    policyViolations: violations,
  };
}

// =============================================================================
// Token Management
// =============================================================================

export function generateTokenId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const segments = [32, 16, 16];
  return segments.map(len => {
    let segment = '';
    for (let i = 0; i < len; i++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return segment;
  }).join('-');
}

export function isTokenExpired(expiresAt: number): boolean {
  return Date.now() >= expiresAt;
}

export function getTokenTimeRemaining(expiresAt: number): { seconds: number; formatted: string } {
  const remaining = Math.max(0, expiresAt - Date.now());
  const seconds = Math.floor(remaining / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  let formatted = '';
  if (days > 0) formatted = `${days}d ${hours % 24}h`;
  else if (hours > 0) formatted = `${hours}h ${minutes % 60}m`;
  else if (minutes > 0) formatted = `${minutes}m ${seconds % 60}s`;
  else formatted = `${seconds}s`;

  return { seconds, formatted };
}

export function parseJWT(token: string): { header: Record<string, unknown>; payload: Record<string, unknown>; isValid: boolean } {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return { header: {}, payload: {}, isValid: false };

    const decodeBase64 = (str: string): string => {
      const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
      const pad = base64.length % 4;
      const padded = pad ? base64 + '='.repeat(4 - pad) : base64;
      return atob(padded);
    };

    const header = JSON.parse(decodeBase64(parts[0] ?? ''));
    const payload = JSON.parse(decodeBase64(parts[1] ?? ''));

    return { header, payload, isValid: true };
  } catch {
    return { header: {}, payload: {}, isValid: false };
  }
}

// =============================================================================
// OAuth Providers
// =============================================================================

export const OAUTH_PROVIDERS: OAuthProvider[] = [
  {
    id: 'google',
    name: 'Google',
    icon: 'google',
    color: '#4285F4',
    scopes: ['openid', 'email', 'profile'],
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v3/userinfo',
    clientId: '',
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: 'github',
    color: '#333333',
    scopes: ['read:user', 'user:email'],
    authUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    userInfoUrl: 'https://api.github.com/user',
    clientId: '',
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    icon: 'microsoft',
    color: '#00A4EF',
    scopes: ['openid', 'email', 'profile', 'offline_access'],
    authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    userInfoUrl: 'https://graph.microsoft.com/v1.0/me',
    clientId: '',
  },
  {
    id: 'apple',
    name: 'Apple',
    icon: 'apple',
    color: '#000000',
    scopes: ['name', 'email'],
    authUrl: 'https://appleid.apple.com/auth/authorize',
    tokenUrl: 'https://appleid.apple.com/auth/token',
    userInfoUrl: '',
    clientId: '',
  },
  {
    id: 'twitter',
    name: 'Twitter / X',
    icon: 'twitter',
    color: '#1DA1F2',
    scopes: ['tweet.read', 'users.read'],
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    userInfoUrl: 'https://api.twitter.com/2/users/me',
    clientId: '',
  },
  {
    id: 'discord',
    name: 'Discord',
    icon: 'discord',
    color: '#5865F2',
    scopes: ['identify', 'email'],
    authUrl: 'https://discord.com/api/oauth2/authorize',
    tokenUrl: 'https://discord.com/api/oauth2/token',
    userInfoUrl: 'https://discord.com/api/users/@me',
    clientId: '',
  },
  {
    id: 'slack',
    name: 'Slack',
    icon: 'slack',
    color: '#4A154B',
    scopes: ['openid', 'email', 'profile'],
    authUrl: 'https://slack.com/openid/connect/authorize',
    tokenUrl: 'https://slack.com/api/openid.connect.token',
    userInfoUrl: 'https://slack.com/api/openid.connect.userInfo',
    clientId: '',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: 'linkedin',
    color: '#0A66C2',
    scopes: ['openid', 'email', 'profile'],
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    userInfoUrl: 'https://api.linkedin.com/v2/userinfo',
    clientId: '',
  },
];

export function getOAuthProvider(id: string): OAuthProvider | undefined {
  return OAUTH_PROVIDERS.find(p => p.id === id);
}

export function buildOAuthURL(provider: OAuthProvider, redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: provider.clientId,
    redirect_uri: redirectUri,
    scope: provider.scopes.join(' '),
    state,
  });

  if (provider.id === 'google') {
    params.set('access_type', 'offline');
    params.set('prompt', 'consent');
  }

  return `${provider.authUrl}?${params.toString()}`;
}

// =============================================================================
// Session Management
// =============================================================================

export function detectDeviceInfo(): DeviceInfo {
  if (typeof navigator === 'undefined') {
    return {
      browser: 'Unknown', browserVersion: '0', os: 'Unknown', osVersion: '0',
      deviceType: 'desktop', userAgent: '',
    };
  }

  const ua = navigator.userAgent;

  // Detect browser
  let browser = 'Unknown';
  let browserVersion = '0';

  if (ua.includes('Firefox/')) {
    browser = 'Firefox';
    browserVersion = ua.match(/Firefox\/(\d+\.\d+)/)?.[1] || '0';
  } else if (ua.includes('Edg/')) {
    browser = 'Edge';
    browserVersion = ua.match(/Edg\/(\d+\.\d+)/)?.[1] || '0';
  } else if (ua.includes('Chrome/')) {
    browser = 'Chrome';
    browserVersion = ua.match(/Chrome\/(\d+\.\d+)/)?.[1] || '0';
  } else if (ua.includes('Safari/') && !ua.includes('Chrome')) {
    browser = 'Safari';
    browserVersion = ua.match(/Version\/(\d+\.\d+)/)?.[1] || '0';
  } else if (ua.includes('Opera/') || ua.includes('OPR/')) {
    browser = 'Opera';
    browserVersion = ua.match(/(?:Opera|OPR)\/(\d+\.\d+)/)?.[1] || '0';
  }

  // Detect OS
  let os = 'Unknown';
  let osVersion = '0';

  if (ua.includes('Windows NT')) {
    os = 'Windows';
    const versionMap: Record<string, string> = {
      '10.0': '10/11', '6.3': '8.1', '6.2': '8', '6.1': '7', '6.0': 'Vista',
    };
    const ntVersion = ua.match(/Windows NT (\d+\.\d+)/)?.[1] || '0';
    osVersion = versionMap[ntVersion] || ntVersion;
  } else if (ua.includes('Mac OS X')) {
    os = 'macOS';
    osVersion = ua.match(/Mac OS X (\d+[._]\d+[._]?\d*)/)?.[1]?.replace(/_/g, '.') || '0';
  } else if (ua.includes('Linux')) {
    os = 'Linux';
  } else if (ua.includes('Android')) {
    os = 'Android';
    osVersion = ua.match(/Android (\d+\.?\d*)/)?.[1] || '0';
  } else if (ua.includes('iPhone') || ua.includes('iPad')) {
    os = 'iOS';
    osVersion = ua.match(/OS (\d+_\d+)/)?.[1]?.replace(/_/g, '.') || '0';
  }

  // Detect device type
  let deviceType: DeviceInfo['deviceType'] = 'desktop';
  if (/Mobi|Android.*Mobile|iPhone/.test(ua)) {
    deviceType = 'mobile';
  } else if (/iPad|Android(?!.*Mobile)|Tablet/.test(ua)) {
    deviceType = 'tablet';
  }

  const screenResolution = typeof screen !== 'undefined'
    ? `${screen.width}x${screen.height}`
    : undefined;

  return { browser, browserVersion, os, osVersion, deviceType, screenResolution, userAgent: ua };
}

export function formatSessionInfo(session: Session): string {
  const device = session.deviceInfo;
  const parts = [
    `${device.browser} ${device.browserVersion}`,
    `${device.os} ${device.osVersion}`,
    device.deviceType,
  ];
  if (session.location) parts.push(session.location);
  return parts.join(' · ');
}

// =============================================================================
// RBAC Helpers
// =============================================================================

export function hasPermission(user: User, permission: Permission): boolean {
  return user.permissions.includes(permission) || ROLE_PERMISSIONS[user.role]?.includes(permission) || false;
}

export function hasAnyPermission(user: User, permissions: Permission[]): boolean {
  return permissions.some(p => hasPermission(user, p));
}

export function hasAllPermissions(user: User, permissions: Permission[]): boolean {
  return permissions.every(p => hasPermission(user, p));
}

export function canPerformAction(user: User, resource: string, action: string): boolean {
  const permission = `${resource}:${action}` as Permission;
  return hasPermission(user, permission);
}

export function getEffectivePermissions(role: UserRole, additionalPermissions: Permission[] = []): Permission[] {
  const rolePerms = ROLE_PERMISSIONS[role] || [];
  const combined = new Set([...rolePerms, ...additionalPermissions]);
  return Array.from(combined);
}

export function compareRoles(role1: UserRole, role2: UserRole): number {
  const hierarchy: UserRole[] = ['guest', 'viewer', 'editor', 'designer', 'developer', 'admin', 'owner'];
  return hierarchy.indexOf(role1) - hierarchy.indexOf(role2);
}

export function isRoleHigherOrEqual(userRole: UserRole, requiredRole: UserRole): boolean {
  return compareRoles(userRole, requiredRole) >= 0;
}

// =============================================================================
// MFA Utilities
// =============================================================================

export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = Array.from({ length: 8 }, () =>
      Math.floor(Math.random() * 36).toString(36)
    ).join('').toUpperCase();
    codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
  }
  return codes;
}

export function generateTOTPSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  for (let i = 0; i < 32; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
}

export function buildTOTPUri(secret: string, email: string, issuer: string = 'AppBuilder'): string {
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}

// =============================================================================
// Security Utilities
// =============================================================================

export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < 32; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

export function generateNonce(): string {
  return generateCSRFToken().substring(0, 24);
}

export function sanitizeRedirectUrl(url: string, allowedHosts: string[] = []): string | null {
  try {
    const parsed = new URL(url, 'http://localhost');

    // Only allow relative URLs or URLs from allowed hosts
    if (url.startsWith('/') && !url.startsWith('//')) {
      return url;
    }

    if (allowedHosts.includes(parsed.hostname)) {
      return url;
    }

    return null;
  } catch {
    return null;
  }
}

export function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return email;

  const maskedLocal = localPart.length <= 2
    ? localPart[0] + '*'
    : localPart[0] + '*'.repeat(localPart.length - 2) + localPart[localPart.length - 1];

  return `${maskedLocal}@${domain}`;
}

export function generateRandomPassword(length: number = 16): string {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const all = upper + lower + numbers + special;

  // Ensure at least one from each category
  let password = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    special[Math.floor(Math.random() * special.length)],
  ];

  for (let i = password.length; i < length; i++) {
    password.push(all[Math.floor(Math.random() * all.length)]);
  }

  // Shuffle
  for (let i = password.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [password[i], password[j]] = [password[j], password[i]];
  }

  return password.join('');
}

// =============================================================================
// Auth Event Logger
// =============================================================================

export class AuthEventLogger {
  private events: AuthEvent[] = [];
  private maxEvents: number;
  private listeners: ((event: AuthEvent) => void)[] = [];

  constructor(maxEvents: number = 1000) {
    this.maxEvents = maxEvents;
  }

  log(type: AuthEventType, userId?: string, email?: string, metadata?: Record<string, unknown>): void {
    const event: AuthEvent = {
      type,
      userId,
      email,
      timestamp: new Date().toISOString(),
      metadata,
    };

    this.events.push(event);
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (error) {
        console.error('Auth event listener error:', error);
      }
    }
  }

  onEvent(listener: (event: AuthEvent) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getEvents(filter?: { type?: AuthEventType; userId?: string; since?: string }): AuthEvent[] {
    let filtered = [...this.events];

    if (filter?.type) filtered = filtered.filter(e => e.type === filter.type);
    if (filter?.userId) filtered = filtered.filter(e => e.userId === filter.userId);
    if (filter?.since) {
      const since = new Date(filter.since).getTime();
      filtered = filtered.filter(e => new Date(e.timestamp).getTime() >= since);
    }

    return filtered;
  }

  getRecentLoginAttempts(email: string, minutes: number = 15): AuthEvent[] {
    const since = new Date(Date.now() - minutes * 60 * 1000).toISOString();
    return this.getEvents({ type: 'login', since }).filter(e => e.email === email);
  }

  isAccountLocked(email: string, maxAttempts: number = 5): boolean {
    const recentAttempts = this.getRecentLoginAttempts(email);
    const failedAttempts = recentAttempts.filter(e => e.metadata?.success === false);
    return failedAttempts.length >= maxAttempts;
  }

  clear(): void {
    this.events = [];
  }
}
