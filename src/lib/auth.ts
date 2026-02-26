/**
 * Auth Service (Server-side)
 * 
 * Handles user authentication, JWT token management, password hashing,
 * and session management for the AppBuilder API.
 */

import { prisma } from '@/lib/db';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';

// ─── Configuration ──────────────────────────────────────────

const JWT_SECRET = process.env.JWT_SECRET || 'appbuilder-dev-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const REFRESH_TOKEN_EXPIRES_IN = 30; // days
const SALT_ROUNDS = 12;

// ─── Types ──────────────────────────────────────────────────

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export interface AuthResult {
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
    avatarUrl: string | null;
  };
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

// ─── Password Hashing ──────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // Handle seed passwords
  if (hash.startsWith('$seed$')) {
    const decoded = Buffer.from(hash.slice(6), 'base64').toString();
    return password === decoded;
  }
  return bcrypt.compare(password, hash);
}

// ─── JWT Token Management ───────────────────────────────────

export function generateAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

export function generateRefreshToken(): string {
  return randomUUID() + '-' + randomUUID();
}

export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

// ─── User Registration ─────────────────────────────────────

export async function registerUser(
  email: string,
  password: string,
  firstName?: string,
  lastName?: string,
): Promise<AuthResult> {
  // Check if user exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error('User with this email already exists');
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      id: randomUUID(),
      email,
      passwordHash,
      firstName: firstName || null,
      lastName: lastName || null,
      role: 'user',
      isActive: true,
      emailVerified: false,
    },
  });

  // Create session
  const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
  const refreshToken = generateRefreshToken();
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      id: randomUUID(),
      userId: user.id,
      token: accessToken,
      refreshToken,
      expiresAt,
    },
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      id: randomUUID(),
      userId: user.id,
      action: 'register',
      entityType: 'user',
      entityId: user.id,
    },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      avatarUrl: user.avatarUrl,
    },
    accessToken,
    refreshToken,
    expiresAt,
  };
}

// ─── User Login ─────────────────────────────────────────────

export async function loginUser(
  email: string,
  password: string,
  userAgent?: string,
  ipAddress?: string,
): Promise<AuthResult> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    throw new Error('Account is disabled');
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    throw new Error('Invalid email or password');
  }

  const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
  const refreshToken = generateRefreshToken();
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN * 24 * 60 * 60 * 1000);

  // Create session
  await prisma.session.create({
    data: {
      id: randomUUID(),
      userId: user.id,
      token: accessToken,
      refreshToken,
      userAgent,
      ipAddress,
      expiresAt,
    },
  });

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      id: randomUUID(),
      userId: user.id,
      action: 'login',
      entityType: 'user',
      entityId: user.id,
      details: JSON.stringify({ method: 'password' }),
      userAgent,
      ipAddress,
    },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      avatarUrl: user.avatarUrl,
    },
    accessToken,
    refreshToken,
    expiresAt,
  };
}

// ─── Token Refresh ──────────────────────────────────────────

export async function refreshTokens(refreshToken: string): Promise<AuthResult> {
  const session = await prisma.session.findUnique({
    where: { refreshToken },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    throw new Error('Invalid or expired refresh token');
  }

  const { user } = session;
  const newAccessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
  const newRefreshToken = generateRefreshToken();
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN * 24 * 60 * 60 * 1000);

  // Update session
  await prisma.session.update({
    where: { id: session.id },
    data: {
      token: newAccessToken,
      refreshToken: newRefreshToken,
      expiresAt,
    },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      avatarUrl: user.avatarUrl,
    },
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    expiresAt,
  };
}

// ─── Logout ─────────────────────────────────────────────────

export async function logoutUser(token: string): Promise<void> {
  await prisma.session.deleteMany({ where: { token } });
}

export async function logoutAllSessions(userId: string): Promise<void> {
  await prisma.session.deleteMany({ where: { userId } });
}

// ─── Auth Middleware Helper ─────────────────────────────────

export async function authenticateRequest(req: Request): Promise<JWTPayload | null> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.slice(7);
  const payload = verifyAccessToken(token);
  if (!payload) return null;

  // Verify user still exists and is active
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, isActive: true },
  });

  if (!user?.isActive) return null;
  return payload;
}

// ─── Password Change ────────────────────────────────────────

export async function changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) throw new Error('Current password is incorrect');

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  // Invalidate all sessions except current
  await prisma.session.deleteMany({ where: { userId } });
}

// ─── API Key Management ────────────────────────────────────

export async function createApiKey(
  userId: string,
  name: string,
  permissions: string[] = ['read'],
  expiresAt?: Date,
): Promise<{ key: string; prefix: string }> {
  const key = `ab_${randomUUID().replace(/-/g, '')}`;
  const prefix = key.slice(0, 10);
  const keyHash = await hashPassword(key);

  await prisma.apiKey.create({
    data: {
      id: randomUUID(),
      userId,
      name,
      keyHash,
      prefix,
      permissions: JSON.stringify(permissions),
      expiresAt: expiresAt || null,
    },
  });

  return { key, prefix };
}

export async function verifyApiKey(key: string): Promise<JWTPayload | null> {
  const apiKeys = await prisma.apiKey.findMany({
    where: { prefix: key.slice(0, 10) },
    include: { user: true },
  });

  for (const apiKey of apiKeys) {
    const valid = await verifyPassword(key, apiKey.keyHash);
    if (valid) {
      if (apiKey.expiresAt && apiKey.expiresAt < new Date()) return null;

      await prisma.apiKey.update({
        where: { id: apiKey.id },
        data: { lastUsedAt: new Date() },
      });

      return {
        userId: apiKey.user.id,
        email: apiKey.user.email,
        role: apiKey.user.role,
      };
    }
  }

  return null;
}

// ─── Cleanup ────────────────────────────────────────────────

export async function cleanupExpiredSessions(): Promise<number> {
  const result = await prisma.session.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
  return result.count;
}
