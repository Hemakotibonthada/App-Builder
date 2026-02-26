/**
 * Deploy API Routes
 * GET    /api/projects/[id]/deploy  - List deployments
 * POST   /api/projects/[id]/deploy  - Trigger deployment
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { randomUUID } from 'crypto';
import {
  successResponse,
  createdResponse,
  notFoundResponse,
  paginatedResponse,
  withErrorHandler,
  getPageParams,
} from '@/lib/api-helpers';
import { createDeploymentSchema } from '@/lib/validations';
import { authenticateRequest } from '@/lib/auth';

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/projects/[id]/deploy
export const GET = withErrorHandler(async (req: Request, { params }: RouteParams) => {
  const { id } = await params;
  const url = new URL(req.url);
  const { page, pageSize, skip } = getPageParams(url.searchParams);
  const environment = url.searchParams.get('environment');

  const where: Record<string, unknown> = { projectId: id };
  if (environment) where.environment = environment;

  const [deployments, total] = await Promise.all([
    prisma.deployment.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.deployment.count({ where }),
  ]);

  return paginatedResponse(deployments, total, page, pageSize);
});

// POST /api/projects/[id]/deploy
export const POST = withErrorHandler(async (req: NextRequest, { params }: RouteParams) => {
  const { id } = await params;
  const body = await req.json();
  const parsed = createDeploymentSchema.parse(body);
  const auth = await authenticateRequest(req);

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      pages: true,
      widgets: true,
    },
  });
  if (!project) return notFoundResponse('Project');

  // Create deployment record
  const deployment = await prisma.deployment.create({
    data: {
      id: randomUUID(),
      projectId: id,
      environment: parsed.environment,
      version: project.version,
      status: 'building',
      config: JSON.stringify(parsed.config),
      triggeredBy: auth?.userId || 'auto',
    },
  });

  // Simulate build process (in production, this would be a queue job)
  const startTime = Date.now();

  try {
    // Generate build output
    const buildLog: string[] = [];
    buildLog.push(`[${new Date().toISOString()}] Starting build...`);
    buildLog.push(`[${new Date().toISOString()}] Project: ${project.name} v${project.version}`);
    buildLog.push(`[${new Date().toISOString()}] Environment: ${parsed.environment}`);
    buildLog.push(`[${new Date().toISOString()}] Pages: ${project.pages.length}`);
    buildLog.push(`[${new Date().toISOString()}] Widgets: ${project.widgets.length}`);
    buildLog.push(`[${new Date().toISOString()}] Compiling pages...`);
    buildLog.push(`[${new Date().toISOString()}] Optimizing assets...`);
    buildLog.push(`[${new Date().toISOString()}] Generating routes...`);
    buildLog.push(`[${new Date().toISOString()}] Bundle size: ${Math.floor(Math.random() * 500 + 100)}KB`);
    buildLog.push(`[${new Date().toISOString()}] Build completed successfully`);

    const deployUrl = `https://${project.slug}.appbuilder.dev`;
    const duration = Date.now() - startTime;

    // Update deployment as successful
    const completed = await prisma.deployment.update({
      where: { id: deployment.id },
      data: {
        status: 'success',
        url: deployUrl,
        buildLog: buildLog.join('\n'),
        duration,
        fileSize: project.widgets.length * 1024, // Approximate
        completedAt: new Date(),
      },
    });

    // Update project
    await prisma.project.update({
      where: { id },
      data: { isPublished: true, publishedAt: new Date() },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        id: randomUUID(),
        projectId: id,
        userId: auth?.userId || null,
        action: 'deploy',
        entityType: 'deployment',
        entityId: deployment.id,
        details: JSON.stringify({
          environment: parsed.environment,
          version: project.version,
          url: deployUrl,
          duration,
        }),
      },
    });

    return createdResponse(completed);
  } catch (error) {
    // Update deployment as failed
    await prisma.deployment.update({
      where: { id: deployment.id },
      data: {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Build failed',
        duration: Date.now() - startTime,
        completedAt: new Date(),
      },
    });

    throw error;
  }
});
