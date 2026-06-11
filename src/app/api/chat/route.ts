import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { anthropic, DEFAULT_MODEL } from '@/lib/anthropic';
import { createRateLimiter, getClientIp } from '@/lib/rate-limit';

const limiter = createRateLimiter('chat', { maxRequests: 20, windowMs: 60_000 });

// HIGH-7: Cache property context to avoid fetching 50 properties on every request
let cachedPropertyContext: string | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60_000; // 5 minutes

export async function POST(request: NextRequest) {
  // CRIT-5: Rate limiting
  const ip = getClientIp(request);
  const rateCheck = limiter.check(ip);
  if (!rateCheck.success) {
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please try again later.' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { messages } = await request.json();

    // HIGH-7: Use cached property context
    const now = Date.now();
    if (!cachedPropertyContext || now - cacheTimestamp > CACHE_TTL_MS) {
      const properties = await prisma.property.findMany({
        where: { isActive: true },
        select: {
          id: true,
          title: true,
          type: true,
          listingType: true,
          rentPerMonth: true,
          price: true,
          carpetArea: true,
          location: true,
          furnished: true,
          amenities: true,
        },
        orderBy: [
          { isFeatured: 'desc' },
          { isExclusive: 'desc' },
          { createdAt: 'desc' },
        ],
        take: 50,
      });
      cachedPropertyContext = JSON.stringify(properties, null, 2);
      cacheTimestamp = now;
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'ANTHROPIC_API_KEY is not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are Sharkspace's commercial real estate assistant for Noida, India.

When suggesting properties, always include this exact block at the END of your response:
[PROPERTIES:{"ids":["id1","id2","id3"]}]

Include up to 6 property IDs maximum per response.
If no properties match, include: [PROPERTIES:{"ids":[]}]

Keep your conversational response concise — 2-4 sentences max.
The user sees property cards separately, so don't describe each property in detail in text.
Instead, briefly summarize what you found and invite follow-up questions.

AVAILABLE PROPERTIES DATABASE:
${cachedPropertyContext}`;

    // Map incoming messages to Anthropic format (must alternate user/assistant)
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
            // Controller may already be in an error state
          }
        }

        try {
          const stream = anthropic.messages.stream({
            model: DEFAULT_MODEL,
            max_tokens: 1024,
            system: systemPrompt,
            messages: formattedMessages,
          });

          stream.on('text', (text) => {
            if (!closed) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
              );
            }
          });

          stream.on('error', (error) => {
            console.error('Anthropic stream error:', error);
            if (!closed) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ text: 'AI responses are temporarily unavailable. Please retry in a moment.' })}\n\n`
                )
              );
            }
            closeStream();
          });

          stream.on('end', () => {
            closeStream();
          });

          // Wait for the stream to finish (this keeps the ReadableStream open)
          await stream.finalMessage();
        } catch (error) {
          console.error('Stream setup error:', error);
          if (!closed) {
            try {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ text: 'AI responses are temporarily unavailable due to provider limits. Please retry in a minute.' })}\n\n`
                )
              );
            } catch {
              // ignore if controller is already closed
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
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
