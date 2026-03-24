import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    // Fetch all active properties for context
    const properties = await prisma.property.findMany({
      where: { isActive: true },
      select: {
        id: true,
        title: true,
        slug: true,
        type: true,
        listingType: true,
        price: true,
        rentPerMonth: true,
        carpetArea: true,
        location: true,
        furnished: true,
        amenities: true,
        mainImageUrl: true,
        description: true,
      },
    });

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'OPENROUTER_API_KEY is not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are SpaceIn's commercial real estate assistant for Noida, India.

When suggesting properties, always include this exact block at the END of your response:
[PROPERTIES:{"ids":["id1","id2","id3"]}]

Include up to 6 property IDs maximum per response.
If no properties match, include: [PROPERTIES:{"ids":[]}]

Keep your conversational response concise — 2-4 sentences max.
The user sees property cards separately, so don't describe each property in detail in text.
Instead, briefly summarize what you found and invite follow-up questions.

AVAILABLE PROPERTIES DATABASE:
${JSON.stringify(properties, null, 2)}`;

    const model = process.env.OPENROUTER_MODEL || 'openrouter/auto';

    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'SpaceIn',
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        stream: true,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map((m: { role: string; content: string }) => ({
            role: m.role,
            content: m.content,
          })),
        ],
      }),
    });

    if (!openRouterResponse.ok || !openRouterResponse.body) {
      const details = await openRouterResponse.text();
      console.error('OpenRouter chat error:', details);

      const encoder = new TextEncoder();
      const fallbackText =
        'AI responses are temporarily unavailable due to provider limits. Please retry in a minute.';
      const readable = new ReadableStream({
        start(controller) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ text: fallbackText })}\n\n`)
          );
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        },
      });

      return new Response(
        readable,
        {
          status: 200,
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
          },
        }
      );
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          const reader = openRouterResponse.body!.getReader();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;

              const payload = line.slice(6).trim();
              if (!payload) continue;

              if (payload === '[DONE]') {
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                controller.close();
                return;
              }

              try {
                const parsed = JSON.parse(payload);
                const textChunk = parsed?.choices?.[0]?.delta?.content;
                if (typeof textChunk === 'string' && textChunk.length > 0) {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ text: textChunk })}\n\n`)
                  );
                }
              } catch {
                // Ignore non-JSON keepalive chunks from SSE stream.
              }
            }
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: 'Stream error occurred' })}\n\n`
            )
          );
          controller.close();
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
