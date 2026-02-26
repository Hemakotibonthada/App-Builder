/**
 * Auth API Routes
 * POST /api/auth/register - Register new user
 * POST /api/auth/login    - Login user
 * POST /api/auth/refresh  - Refresh access token
 * POST /api/auth/logout   - Logout user
 * GET  /api/auth/me       - Get current user profile
 * PUT  /api/auth/me       - Update profile
 * POST /api/auth/password - Change password
 */

import { NextRequest } from 'next/server';
import {
  successResponse,
  createdResponse,
  errorResponse,
  unauthorizedResponse,
  withErrorHandler,
} from '@/lib/api-helpers';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} from '@/lib/validations';
import {
  registerUser,
  loginUser,
  refreshTokens,
  logoutUser,
  authenticateRequest,
  changePassword,
} from '@/lib/auth';
import { prisma } from '@/lib/db';

// POST /api/auth - Multiplex handler
export const POST = withErrorHandler(async (req: NextRequest) => {
  const url = new URL(req.url);
  const action = url.searchParams.get('action') || 'login';
  const body = await req.json();

  switch (action) {
    case 'register': {
      const parsed = registerSchema.parse(body);
      const result = await registerUser(
        parsed.email,
        parsed.password,
        parsed.firstName,
        parsed.lastName,
      );
      return createdResponse(result);
    }

    case 'login': {
      const parsed = loginSchema.parse(body);
      const userAgent = req.headers.get('User-Agent') || undefined;
      const ip = req.headers.get('X-Forwarded-For') || req.headers.get('X-Real-IP') || undefined;
      const result = await loginUser(parsed.email, parsed.password, userAgent, ip);
      return successResponse(result);
    }

    case 'refresh': {
      const { refreshToken } = body;
      if (!refreshToken) return errorResponse('Refresh token required');
      const result = await refreshTokens(refreshToken);
      return successResponse(result);
    }

    case 'logout': {
      const token = req.headers.get('Authorization')?.slice(7);
      if (token) await logoutUser(token);
      return successResponse({ message: 'Logged out successfully' });
    }

    case 'password': {
      const auth = await authenticateRequest(req);
      if (!auth) return unauthorizedResponse();
      const parsed = changePasswordSchema.parse(body);
      await changePassword(auth.userId, parsed.currentPassword, parsed.newPassword);
      return successResponse({ message: 'Password changed successfully' });
    }

    default:
      return errorResponse(`Unknown action: ${action}`);
  }
});

// GET /api/auth - Get current user profile
export const GET = withErrorHandler(async (req: NextRequest) => {
  const auth = await authenticateRequest(req);
  if (!auth) return unauthorizedResponse();

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      role: true,
      isActive: true,
      emailVerified: true,
      lastLoginAt: true,
      createdAt: true,
      _count: {
        select: {
          projects: true,
          collaborations: true,
        },
      },
    },
  });

  if (!user) return unauthorizedResponse();
  return successResponse(user);
});

// PUT /api/auth - Update user profile
export const PUT = withErrorHandler(async (req: NextRequest) => {
  const auth = await authenticateRequest(req);
  if (!auth) return unauthorizedResponse();

  const body = await req.json();
  const parsed = updateProfileSchema.parse(body);

  const user = await prisma.user.update({
    where: { id: auth.userId },
    data: parsed,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      role: true,
    },
  });

  return successResponse(user);
});
