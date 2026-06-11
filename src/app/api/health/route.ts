import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Health check endpoint.
 * Returns DB connectivity status and uptime.
 */
export async function GET() {
  const start = Date.now();
  let dbStatus: 'ok' | 'error' = 'error';
  let dbLatencyMs = 0;

  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - dbStart;
    dbStatus = 'ok';
  } catch (error) {
    console.error('Health check DB error:', error);
  }

  const status = dbStatus === 'ok' ? 200 : 503;

  return NextResponse.json(
    {
      status: dbStatus === 'ok' ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {
        database: {
          status: dbStatus,
          latencyMs: dbLatencyMs,
        },
      },
      responseTimeMs: Date.now() - start,
    },
    { status }
  );
}
