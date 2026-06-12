/**
 * Structured Event Logger.
 * 
 * Every chatbot interaction becomes structured data.
 * Events are logged asynchronously (fire-and-forget) so they
 * never slow down the user-facing response.
 */

import { prisma } from '@/lib/prisma';

export type ChatEventType =
  | 'QUERY'              // user sent a message
  | 'INTENT_EXTRACTED'   // system extracted intent from message
  | 'CANDIDATES_RETRIEVED' // properties retrieved from DB
  | 'RECOMMENDATION'     // properties recommended to user
  | 'CLICK'              // user clicked a property card
  | 'CONTACT'            // user clicked "Call Us" or submitted inquiry
  | 'SESSION_START'      // new conversation started
  | 'SESSION_END';       // conversation ended/timed out

interface EventPayload {
  [key: string]: unknown;
}

/**
 * Log a structured event. Fire-and-forget — never blocks the caller.
 */
export function logEvent(
  userId: string,
  type: ChatEventType,
  payload: EventPayload,
  propertyId?: string,
  sessionId?: string,
): void {
  if (userId === 'transient') return;

  // Fire and forget
  prisma.chatEvent
    .create({
      data: {
        userId,
        type,
        payload: payload as object,
        propertyId: propertyId || null,
        sessionId: sessionId || null,
      },
    })
    .catch((error: unknown) => {
      console.error(`Failed to log event [${type}]:`, error);
    });
}

/**
 * Log a user query event.
 */
export function logQuery(userId: string, message: string, sessionId?: string): void {
  logEvent(userId, 'QUERY', { message: message.substring(0, 500) }, undefined, sessionId);
}

/**
 * Log intent extraction results.
 */
export function logIntentExtracted(
  userId: string,
  intent: Record<string, unknown>,
  sessionId?: string,
): void {
  logEvent(userId, 'INTENT_EXTRACTED', intent, undefined, sessionId);
}

/**
 * Log candidate retrieval results.
 */
export function logCandidatesRetrieved(
  userId: string,
  candidateCount: number,
  candidateIds: string[],
  sessionId?: string,
): void {
  logEvent(
    userId,
    'CANDIDATES_RETRIEVED',
    { count: candidateCount, ids: candidateIds.slice(0, 50) },
    undefined,
    sessionId,
  );
}

/**
 * Log final recommendations sent to user.
 */
export function logRecommendation(
  userId: string,
  propertyIds: string[],
  scores: number[],
  sessionId?: string,
): void {
  logEvent(
    userId,
    'RECOMMENDATION',
    { propertyIds, scores, count: propertyIds.length },
    undefined,
    sessionId,
  );
}

/**
 * Log a property click from the frontend.
 */
export function logPropertyClick(
  userId: string,
  propertyId: string,
  sessionId?: string,
): void {
  logEvent(userId, 'CLICK', { action: 'view_property' }, propertyId, sessionId);
}

/**
 * Log a contact action (call, inquiry, etc.)
 */
export function logContactAction(
  userId: string,
  propertyId: string,
  action: string,
  sessionId?: string,
): void {
  logEvent(userId, 'CONTACT', { action }, propertyId, sessionId);
}
