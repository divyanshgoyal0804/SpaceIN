/**
 * Chat Events API — receives behavioral events from the frontend.
 * Tracks property clicks, contact actions, and session events.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRateLimiter, getClientIp } from '@/lib/rate-limit';
import { logPropertyClick, logContactAction, logEvent } from '@/lib/chat/event-logger';
import { z } from 'zod/v4';

const limiter = createRateLimiter('chat-events', { maxRequests: 60, windowMs: 60_000 });

const EventSchema = z.object({
  userId: z.string().min(1).max(100),
  type: z.enum(['CLICK', 'CONTACT', 'SESSION_START', 'SESSION_END']),
  propertyId: z.string().max(100).optional(),
  action: z.string().max(100).optional(),
  sessionId: z.string().max(100).optional(),
});

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rateCheck = limiter.check(ip);
  if (!rateCheck.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const parsed = EventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid event data' }, { status: 400 });
    }

    const { userId, type, propertyId, action, sessionId } = parsed.data;

    switch (type) {
      case 'CLICK':
        if (propertyId) {
          logPropertyClick(userId, propertyId, sessionId);
        }
        break;
      case 'CONTACT':
        if (propertyId) {
          logContactAction(userId, propertyId, action || 'call', sessionId);
        }
        break;
      case 'SESSION_START':
      case 'SESSION_END':
        logEvent(userId, type, { action: action || type }, undefined, sessionId);
        break;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Chat events error:', error);
    return NextResponse.json({ error: 'Failed to process event' }, { status: 500 });
  }
}
