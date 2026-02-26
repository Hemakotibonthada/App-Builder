/**
 * Collaborators API Routes
 * GET    /api/projects/[id]/collaborators  - List collaborators
 * POST   /api/projects/[id]/collaborators  - Invite collaborator
 * DELETE /api/projects/[id]/collaborators  - Remove collaborator
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
import { inviteCollaboratorSchema } from '@/lib/validations';

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/projects/[id]/collaborators
export const GET = withErrorHandler(async (_req: Request, { params }: RouteParams) => {
  const { id } = await params;

  const collaborators = await prisma.collaborator.findMany({
    where: { projectId: id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: { invitedAt: 'asc' },
  });

  return successResponse(collaborators);
});

// POST /api/projects/[id]/collaborators
export const POST = withErrorHandler(async (req: NextRequest, { params }: RouteParams) => {
  const { id } = await params;
  const body = await req.json();
  const parsed = inviteCollaboratorSchema.parse(body);

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) return notFoundResponse('Project');

  // Find user by email
  const user = await prisma.user.findUnique({ where: { email: parsed.email } });
  if (!user) return errorResponse(`No user found with email "${parsed.email}"`, 404);

  // Check if already a collaborator
  const existing = await prisma.collaborator.findFirst({
    where: { projectId: id, userId: user.id },
  });
  if (existing) return errorResponse('User is already a collaborator', 409);

  // Cannot add owner as collaborator
  if (project.ownerId === user.id) {
    return errorResponse('Cannot add project owner as collaborator', 400);
  }

  const collaborator = await prisma.collaborator.create({
    data: {
      id: randomUUID(),
      projectId: id,
      userId: user.id,
      role: parsed.role,
      permissions: JSON.stringify(parsed.permissions),
      acceptedAt: new Date(), // Auto-accept for now
    },
    include: {
      user: {
        select: { id: true, email: true, firstName: true, lastName: true, avatarUrl: true },
      },
    },
  });

  // Create notification for invitee
  await prisma.notification.create({
    data: {
      id: randomUUID(),
      userId: user.id,
      type: 'invite',
      title: 'Project Invitation',
      message: `You've been invited to collaborate on "${project.name}"`,
      link: `/builder?project=${id}`,
    },
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      id: randomUUID(),
      projectId: id,
      action: 'invite',
      entityType: 'collaborator',
      entityId: collaborator.id,
      details: JSON.stringify({ email: parsed.email, role: parsed.role }),
    },
  });

  return createdResponse(collaborator);
});

// DELETE /api/projects/[id]/collaborators
export const DELETE = withErrorHandler(async (req: NextRequest, { params }: RouteParams) => {
  const { id } = await params;
  const body = await req.json();
  const collaboratorId = body.collaboratorId as string;

  const existing = await prisma.collaborator.findFirst({
    where: { id: collaboratorId, projectId: id },
  });
  if (!existing) return notFoundResponse('Collaborator');

  await prisma.collaborator.delete({ where: { id: collaboratorId } });

  return successResponse({ message: 'Collaborator removed' });
});
