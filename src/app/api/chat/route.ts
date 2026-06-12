/**
 * Intelligent Chat Route — Full Pipeline.
 *
 * Architecture:
 *   User Message
 *     → Load user profile (returning user memory)
 *     → Extract rich intent (soft preferences, flexibility)
 *     → Retrieve candidates (soft constraints, adaptive expansion)
 *     → Rank candidates (multi-factor scoring)
 *     → Build consultant-style prompt (top 8-10 ranked properties)
 *     → Stream response (SSE)
 *     → Log events + update profile (async, non-blocking)
 *
 * Preserves:
 *   - SSE streaming format
 *   - [PROPERTIES:{...}] protocol with frontend
 *   - Rate limiting
 *   - Error handling
 */

import { NextRequest } from 'next/server';
import { anthropic, DEFAULT_MODEL } from '@/lib/anthropic';
import { createRateLimiter, getClientIp } from '@/lib/rate-limit';
import { extractIntent, ChatIntent } from '@/lib/chat/intent-extractor';
import { retrieveCandidates } from '@/lib/chat/candidate-retriever';
import { rankCandidates, formatRankedForPrompt, RankedProperty } from '@/lib/chat/property-ranker';
import { getOrCreateUser, updateUserPreferences, formatUserContext } from '@/lib/chat/user-profile';
import { logQuery, logIntentExtracted, logCandidatesRetrieved, logRecommendation } from '@/lib/chat/event-logger';

const limiter = createRateLimiter('chat', { maxRequests: 20, windowMs: 60_000 });

// Keep track of last intent per session for multi-turn continuity
const sessionIntents = new Map<string, ChatIntent>();
const sessionTimestamps = new Map<string, number>();
const SESSION_INTENT_TTL = 30 * 60_000; // 30 minutes

// Cleanup stale session intents periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, ts] of sessionTimestamps) {
    if (now - ts > SESSION_INTENT_TTL) {
      sessionIntents.delete(key);
      sessionTimestamps.delete(key);
    }
  }
}, 5 * 60_000);

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = getClientIp(request);
  const rateCheck = limiter.check(ip);
  if (!rateCheck.success) {
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please try again later.' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } },
    );
  }

  try {
    const body = await request.json();
    const { messages, anonymousId: rawAnonymousId } = body;
    const anonymousId: string = typeof rawAnonymousId === 'string' && rawAnonymousId.length > 0
      ? rawAnonymousId
      : ip; // Fallback to IP if no anonymous ID

    if (!process.env.ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'ANTHROPIC_API_KEY is not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // ─── Step 1: Load User Profile ───────────────────────────────
    const userProfile = await getOrCreateUser(anonymousId);

    // ─── Step 2: Extract Intent ──────────────────────────────────
    const latestUserMessage = messages
      .filter((m: { role: string }) => m.role === 'user')
      .pop()?.content || '';

    // Build conversation history for context
    const conversationHistory = messages
      .slice(-8) // Last 8 messages
      .map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content.substring(0, 400), // Truncate for efficiency
      }));

    // Get previous intent for multi-turn continuity
    const sessionKey = `${anonymousId}:intent`;
    const previousIntent = sessionIntents.get(sessionKey) || null;

    const intent = await extractIntent(
      latestUserMessage,
      conversationHistory,
      previousIntent,
    );

    // Store intent for next turn
    sessionIntents.set(sessionKey, intent);
    sessionTimestamps.set(sessionKey, Date.now());

    // ─── Step 3: Log Query + Intent (async) ──────────────────────
    logQuery(userProfile.id, latestUserMessage);
    logIntentExtracted(userProfile.id, intent as unknown as Record<string, unknown>);

    // ─── Step 4: Retrieve & Rank (for property search queries) ───
    let rankedProperties: RankedProperty[] = [];
    let promptPropertiesBlock = '';

    if (intent.conversationType === 'search' || intent.conversationType === 'comparison' || intent.conversationType === 'followup') {
      // Retrieve candidates with soft constraints + adaptive expansion
      const candidates = await retrieveCandidates(intent);

      // Log retrieval
      logCandidatesRetrieved(
        userProfile.id,
        candidates.length,
        candidates.map((c) => c.id),
      );

      // Rank candidates using multi-factor scoring
      rankedProperties = rankCandidates(candidates, intent, {
        preferredLocations: userProfile.preferredLocations,
        preferredAmenities: userProfile.preferredAmenities,
        preferredTypes: userProfile.preferredTypes,
      });

      // Log recommendations
      if (rankedProperties.length > 0) {
        logRecommendation(
          userProfile.id,
          rankedProperties.map((p) => p.id),
          rankedProperties.map((p) => p.score),
        );
      }

      promptPropertiesBlock = formatRankedForPrompt(rankedProperties);
    }

    // ─── Step 5: Update User Profile (async, non-blocking) ───────
    if (intent.conversationType !== 'general') {
      updateUserPreferences(userProfile.id, intent);
    }

    // ─── Step 6: Build Consultant-Style System Prompt ────────────
    const userContext = formatUserContext(userProfile);
    const systemPrompt = buildSystemPrompt(intent, promptPropertiesBlock, userContext);

    // ─── Step 7: Stream Response ─────────────────────────────────
    const formattedMessages = messages.map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        let closed = false;

        function closeStream() {
          if (closed) return;
          closed = true;
          try {
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          } catch {
            // Controller may already be closed
          }
        }

        try {
          const stream = anthropic.messages.stream({
            model: DEFAULT_MODEL,
            max_tokens: 1500, // Slightly more for consultant-style responses
            system: systemPrompt,
            messages: formattedMessages,
          });

          stream.on('text', (text) => {
            if (!closed) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text })}\n\n`),
              );
            }
          });

          stream.on('error', (error) => {
            console.error('Anthropic stream error:', error);
            if (!closed) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ text: 'AI responses are temporarily unavailable. Please retry in a moment.' })}\n\n`,
                ),
              );
            }
            closeStream();
          });

          stream.on('end', () => {
            closeStream();
          });

          await stream.finalMessage();
        } catch (error) {
          console.error('Stream setup error:', error);
          if (!closed) {
            try {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ text: 'AI responses are temporarily unavailable due to provider limits. Please retry in a minute.' })}\n\n`,
                ),
              );
            } catch {
              // ignore
            }
          }
          closeStream();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}

/**
 * Build the consultant-style system prompt.
 */
function buildSystemPrompt(
  intent: ChatIntent,
  propertiesBlock: string,
  userContext: string,
): string {
  const isPropertySearch = intent.conversationType !== 'general';

  let prompt = `You are the AI consultant for Sharkspace — a premium commercial workspace platform in Noida, India.

WHAT YOU KNOW:
• Coworking: hot desks ₹5-8K/seat, dedicated ₹8-12K/seat, private cabins
• Managed offices: fully serviced, furniture + IT + housekeeping included, best for 10-100 people
• Traditional leases: 2-5 year lock-in, bare shell or semi-furnished, lower per-sqft but higher upfront
• Virtual offices: business address + GST registration
• Noida geography: 62-63 = IT hub, 18 = commercial center, 132-144 = expressway corridor

THE UI:
The user sees a split screen. LEFT = your conversation. RIGHT = property cards with images, names, prices, areas, locations, and buttons.

ABSOLUTE RULES:
1. NEVER repeat info visible on the cards (price, area, location, name). The user can already see it.
2. Instead explain WHY — why one option is better, what tradeoffs exist, what you'd personally choose.
3. Reference cards naturally: "the **furnished one**", "the **larger space**", "the **top result**"

HOW TO WRITE:
Write like ChatGPT or Gemini — natural, confident, conversational, concise. You are an experienced consultant, not a search engine.

CRITICAL: Every response must feel DIFFERENT. Never use the same structure twice.

Sometimes write:
- A short paragraph + 3 bullets + a question
- One bold recommendation + one tradeoff + a question
- A comparison sentence + a single piece of advice
- Just 2-3 sentences if that's all that's needed

NEVER use a fixed template. NEVER always start with "Quick Take" or "Top Pick" or any repeated heading pattern.

Instead, start naturally:
- "I think the best option here is..."
- "Two things stand out to me..."
- "For a team of this size, I'd look at..."
- "Honestly, I'd narrow this down to two..."
- "What catches my eye is..."
- Or just answer the question directly.

LENGTH: 60-180 words. Short paragraphs (1-2 sentences each). Max 3-4 bullets. Never walls of text.

SPACING: Insert a blank line between every 1-2 sentences. The response should breathe.

INFORMATION PRIORITY: Opinion → Reasoning → Recommendation → One follow-up question

USE MARKDOWN naturally — **bold** for emphasis, bullets for lists, --- only when genuinely needed. No emoji-laden headings. Headings are optional and only when they improve readability.

TONE: Be opinionated. Rank things. Say "I'd pick..." or "I'd skip..." or "The strongest value is...". Be willing to say something is NOT worth it.

USE ₹, Lakhs, Cr for Indian currency.`;

  if (isPropertySearch && propertiesBlock) {
    prompt += `

RANKED PROPERTIES (our engine already scored these):
${propertiesBlock}

WHAT TO DO:
- Pick your top 1-2 recommendations and explain WHY (not what they cost — the card shows that)
- If something is above budget, say so honestly and explain why it might still be worth a look
- If results are sparse, acknowledge it and suggest what to adjust
- For coworking queries: think per-seat, team fit, flexibility
- End with ONE useful follow-up question (never multiple)

CONTEXT:${intent.workspaceStyle ? `\n- Looking for: ${intent.workspaceStyle.replace('_', ' ')}` : ''}${intent.seatCount ? `\n- Team: ${intent.seatCount} seats` : ''}${intent.budgetMax ? `\n- Budget: ₹${intent.budgetMax.toLocaleString('en-IN')}${intent.listingType !== 'SALE' ? '/mo' : ''}` : ''}${intent.locations.length > 0 ? `\n- Area: ${intent.locations.join(', ')}` : ''}

After your response, on the VERY LAST LINE, add this exact block with the IDs you recommend (max 6):
[PROPERTIES:{"ids":["id1","id2","id3"]}]

If nothing fits: [PROPERTIES:{"ids":[]}]`;
  } else if (isPropertySearch) {
    prompt += `

No properties matched this query.

Be honest about it in 2-3 sentences. Suggest what to change — broader budget, different area, different property type. If they asked coworking, mention managed offices too.

End with one question to narrow things down.

Add at the end: [PROPERTIES:{"ids":[]}]`;
  } else {
    prompt += `

General conversation — greeting, thanks, or non-property question.

Reply in 1-3 natural sentences. If appropriate, ask what kind of workspace they need.

Do NOT add a PROPERTIES block.`;
  }

  if (userContext) {
    prompt += `

RETURNING USER:
${userContext}
Weave their history in naturally — "Since you've been exploring Sector 62..." — don't make it awkward.`;
  }

  return prompt;
}

