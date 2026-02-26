/**
 * Automations API Routes
 * GET    /api/projects/[id]/automations - List automations
 * POST   /api/projects/[id]/automations - Create automation
 * PUT    /api/projects/[id]/automations - Update automation
 * DELETE /api/projects/[id]/automations - Delete automation
 * PATCH  /api/projects/[id]/automations - Run/toggle automation
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { randomUUID } from 'crypto';
import {
  successResponse,
  createdResponse,
  notFoundResponse,
  errorResponse,
  withErrorHandler,
} from '@/lib/api-helpers';
import { createAutomationSchema } from '@/lib/validations';

type RouteParams = { params: Promise<{ id: string }> };

// GET
export const GET = withErrorHandler(async (_req: Request, { params }: RouteParams) => {
  const { id } = await params;

  const automations = await prisma.automation.findMany({
    where: { projectId: id },
    orderBy: { createdAt: 'desc' },
  });

  const parsed = automations.map((a) => ({
    ...a,
    trigger: JSON.parse(a.trigger),
    actions: JSON.parse(a.actions),
    conditions: JSON.parse(a.conditions),
  }));

  return successResponse(parsed);
});

// POST
export const POST = withErrorHandler(async (req: NextRequest, { params }: RouteParams) => {
  const { id } = await params;
  const body = await req.json();
  const parsed = createAutomationSchema.parse(body);

  const automation = await prisma.automation.create({
    data: {
      id: randomUUID(),
      projectId: id,
      name: parsed.name,
      description: parsed.description || null,
      trigger: JSON.stringify(parsed.trigger),
      actions: JSON.stringify(parsed.actions),
      conditions: JSON.stringify(parsed.conditions),
      isActive: parsed.isActive,
    },
  });

  return createdResponse({
    ...automation,
    trigger: parsed.trigger,
    actions: parsed.actions,
    conditions: parsed.conditions,
  });
});

// PUT
export const PUT = withErrorHandler(async (req: NextRequest, { params }: RouteParams) => {
  const { id } = await params;
  const body = await req.json();
  const automationId = body.id as string;

  const existing = await prisma.automation.findFirst({
    where: { id: automationId, projectId: id },
  });
  if (!existing) return notFoundResponse('Automation');

  const data: Record<string, unknown> = {};
  if (body.name) data.name = body.name;
  if (body.description !== undefined) data.description = body.description;
  if (body.trigger) data.trigger = JSON.stringify(body.trigger);
  if (body.actions) data.actions = JSON.stringify(body.actions);
  if (body.conditions) data.conditions = JSON.stringify(body.conditions);
  if (body.isActive !== undefined) data.isActive = body.isActive;

  const updated = await prisma.automation.update({
    where: { id: automationId },
    data,
  });

  return successResponse({
    ...updated,
    trigger: JSON.parse(updated.trigger),
    actions: JSON.parse(updated.actions),
    conditions: JSON.parse(updated.conditions),
  });
});

// DELETE
export const DELETE = withErrorHandler(async (req: NextRequest, { params }: RouteParams) => {
  const { id } = await params;
  const body = await req.json();
  const automationId = body.id as string;

  const existing = await prisma.automation.findFirst({
    where: { id: automationId, projectId: id },
  });
  if (!existing) return notFoundResponse('Automation');

  await prisma.automation.delete({ where: { id: automationId } });
  return successResponse({ message: 'Automation deleted' });
});

// PATCH - Run or toggle automation
export const PATCH = withErrorHandler(async (req: NextRequest, { params }: RouteParams) => {
  const { id } = await params;
  const body = await req.json();
  const automationId = body.id as string;
  const action = body.action as string;

  const existing = await prisma.automation.findFirst({
    where: { id: automationId, projectId: id },
  });
  if (!existing) return notFoundResponse('Automation');

  switch (action) {
    case 'run': {
      // Simulate running the automation
      const actions = JSON.parse(existing.actions) as Array<{ type: string; config: Record<string, unknown> }>;
      const results: Array<{ action: string; status: string; message: string }> = [];

      for (const step of actions) {
        results.push({
          action: step.type,
          status: 'success',
          message: `Executed ${step.type} action successfully`,
        });
      }

      await prisma.automation.update({
        where: { id: automationId },
        data: {
          lastRunAt: new Date(),
          runCount: { increment: 1 },
          lastStatus: 'success',
        },
      });

      return successResponse({ run: true, results });
    }

    case 'enable':
      await prisma.automation.update({
        where: { id: automationId },
        data: { isActive: true },
      });
      return successResponse({ message: 'Automation enabled' });

    case 'disable':
      await prisma.automation.update({
        where: { id: automationId },
        data: { isActive: false },
      });
      return successResponse({ message: 'Automation disabled' });

    default:
      return errorResponse(`Unknown action: ${action}`);
  }
});
