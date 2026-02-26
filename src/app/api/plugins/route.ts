/**
 * Plugins API Routes
 * GET  /api/plugins           - List available plugins
 * POST /api/plugins/install   - Install plugin to project
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { randomUUID } from 'crypto';
import {
  successResponse,
  createdResponse,
  notFoundResponse,
  errorResponse,
  paginatedResponse,
  withErrorHandler,
  getPageParams,
  getSearchParam,
} from '@/lib/api-helpers';
import { installPluginSchema } from '@/lib/validations';

// GET /api/plugins
export const GET = withErrorHandler(async (req: NextRequest) => {
  const url = new URL(req.url);
  const { page, pageSize, skip } = getPageParams(url.searchParams);
  const search = getSearchParam(url.searchParams);
  const category = url.searchParams.get('category');

  const where: Record<string, unknown> = { isActive: true };
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ];
  }
  if (category) where.category = category;

  const [plugins, total] = await Promise.all([
    prisma.plugin.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: [{ isOfficial: 'desc' }, { downloads: 'desc' }],
    }),
    prisma.plugin.count({ where }),
  ]);

  return paginatedResponse(plugins, total, page, pageSize);
});

// POST /api/plugins - Install plugin
export const POST = withErrorHandler(async (req: NextRequest) => {
  const body = await req.json();
  const parsed = installPluginSchema.parse(body);
  const projectId = body.projectId as string;

  if (!projectId) return errorResponse('projectId is required');

  const plugin = await prisma.plugin.findUnique({ where: { id: parsed.pluginId } });
  if (!plugin) return notFoundResponse('Plugin');

  // Check if already installed
  const existing = await prisma.pluginInstallation.findFirst({
    where: { pluginId: parsed.pluginId, projectId },
  });
  if (existing) return errorResponse('Plugin is already installed', 409);

  const installation = await prisma.pluginInstallation.create({
    data: {
      id: randomUUID(),
      pluginId: parsed.pluginId,
      projectId,
      config: JSON.stringify(parsed.config),
    },
  });

  // Increment download count
  await prisma.plugin.update({
    where: { id: parsed.pluginId },
    data: { downloads: { increment: 1 } },
  });

  return createdResponse(installation);
});
