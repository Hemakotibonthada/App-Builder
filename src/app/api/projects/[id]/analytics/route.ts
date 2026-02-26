/**
 * Analytics API Routes
 * GET  /api/projects/[id]/analytics - Get analytics data
 * POST /api/projects/[id]/analytics - Track event
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { randomUUID } from 'crypto';
import {
  successResponse,
  createdResponse,
  withErrorHandler,
} from '@/lib/api-helpers';
import { trackEventSchema } from '@/lib/validations';

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/projects/[id]/analytics
export const GET = withErrorHandler(async (req: Request, { params }: RouteParams) => {
  const { id } = await params;
  const url = new URL(req.url);
  const period = url.searchParams.get('period') || '7d';

  // Calculate date range
  const now = new Date();
  let startDate: Date;
  switch (period) {
    case '24h':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  const where = {
    projectId: id,
    createdAt: { gte: startDate },
  };

  // Aggregate analytics
  const [
    totalEvents,
    pageviews,
    uniqueSessions,
    clickEvents,
    formSubmits,
    recentEvents,
  ] = await Promise.all([
    prisma.analyticsEvent.count({ where }),
    prisma.analyticsEvent.count({ where: { ...where, eventType: 'pageview' } }),
    prisma.analyticsEvent.groupBy({
      by: ['sessionId'],
      where,
      _count: true,
    }),
    prisma.analyticsEvent.count({ where: { ...where, eventType: 'click' } }),
    prisma.analyticsEvent.count({ where: { ...where, eventType: 'form_submit' } }),
    prisma.analyticsEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        eventType: true,
        eventName: true,
        pageUrl: true,
        widgetId: true,
        device: true,
        browser: true,
        country: true,
        createdAt: true,
      },
    }),
  ]);

  // Top pages
  const topPages = await prisma.analyticsEvent.groupBy({
    by: ['pageUrl'],
    where: { ...where, eventType: 'pageview' },
    _count: true,
    orderBy: { _count: { pageUrl: 'desc' } },
    take: 10,
  });

  // Device breakdown
  const devices = await prisma.analyticsEvent.groupBy({
    by: ['device'],
    where,
    _count: true,
  });

  // Browser breakdown
  const browsers = await prisma.analyticsEvent.groupBy({
    by: ['browser'],
    where,
    _count: true,
  });

  return successResponse({
    period,
    startDate: startDate.toISOString(),
    endDate: now.toISOString(),
    overview: {
      totalEvents,
      pageviews,
      uniqueSessions: uniqueSessions.length,
      clicks: clickEvents,
      formSubmissions: formSubmits,
      avgEventsPerSession: uniqueSessions.length > 0
        ? Math.round(totalEvents / uniqueSessions.length * 10) / 10
        : 0,
    },
    topPages: topPages.map((p) => ({
      url: p.pageUrl,
      views: p._count,
    })),
    devices: devices.map((d) => ({
      device: d.device || 'unknown',
      count: d._count,
    })),
    browsers: browsers.map((b) => ({
      browser: b.browser || 'unknown',
      count: b._count,
    })),
    recentEvents,
  });
});

// POST /api/projects/[id]/analytics
export const POST = withErrorHandler(async (req: NextRequest, { params }: RouteParams) => {
  const { id } = await params;
  const body = await req.json();
  const parsed = trackEventSchema.parse(body);

  // Extract user agent info
  const userAgent = req.headers.get('User-Agent') || undefined;
  const ip = req.headers.get('X-Forwarded-For') || req.headers.get('X-Real-IP') || undefined;

  // Simple device detection
  let device = 'desktop';
  if (userAgent) {
    if (/mobile|android|iphone/i.test(userAgent)) device = 'mobile';
    else if (/tablet|ipad/i.test(userAgent)) device = 'tablet';
  }

  // Simple browser detection
  let browser = 'other';
  if (userAgent) {
    if (/chrome/i.test(userAgent) && !/edge/i.test(userAgent)) browser = 'chrome';
    else if (/firefox/i.test(userAgent)) browser = 'firefox';
    else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) browser = 'safari';
    else if (/edge/i.test(userAgent)) browser = 'edge';
  }

  const event = await prisma.analyticsEvent.create({
    data: {
      id: randomUUID(),
      projectId: id,
      sessionId: parsed.sessionId,
      eventType: parsed.eventType,
      eventName: parsed.eventName || null,
      pageUrl: parsed.pageUrl || null,
      widgetId: parsed.widgetId || null,
      data: JSON.stringify(parsed.data),
      referrer: parsed.referrer || null,
      userAgent: userAgent || null,
      device,
      browser,
      duration: parsed.duration || null,
    },
  });

  return createdResponse(event);
});
