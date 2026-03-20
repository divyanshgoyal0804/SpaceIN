import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import Anthropic from '@anthropic-ai/sdk';

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

    const client = new Anthropic({
      apiKey: process.env.OPENROUTER_API_KEY || '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',
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'SpaceIn',
      }
    });

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

    const stream = await client.messages.stream({
      model: 'anthropic/claude-3-5-haiku-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((m: any) => ({
        role: m.role,
        content: m.content
      })),
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === 'content_block_delta' &&
              chunk.delta.type === 'text_delta'
            ) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`
                )
              );
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
