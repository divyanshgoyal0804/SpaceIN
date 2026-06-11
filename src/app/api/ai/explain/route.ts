import { NextRequest, NextResponse } from 'next/server';
import { fetchAnthropic } from '@/lib/anthropic';
import { createRateLimiter, getClientIp } from '@/lib/rate-limit';

const limiter = createRateLimiter('ai-explain', { maxRequests: 30, windowMs: 60_000 });

export async function POST(req: NextRequest) {
  // CRIT-5: Rate limiting on AI endpoints
  const ip = getClientIp(req);
  const rateCheck = limiter.check(ip);
  if (!rateCheck.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const { intent, properties } = await req.json();

    if (!properties || properties.length === 0) {
      return NextResponse.json({ explanation: "Unfortunately, no properties currently match those exact specifications. Could you try adjusting your requirements, such as expanding the location or increasing the budget?" });
    }

    // Limit to top 5 properties specifically
    const topProps = properties.slice(0, 5).map((p: { title?: string; price?: number; rentPerMonth?: number; location?: string; amenities?: string[] }) => ({
      title: p.title,
      price: p.price,
      rent: p.rentPerMonth,
      location: p.location,
      amenities: p.amenities
    }));

    const systemPrompt = `Explain why these properties match the user's needs.

User intent: ${intent || 'seeking commercial property'}

Properties:
${JSON.stringify(topProps, null, 2)}

Keep response concise and helpful. Speak directly to the user addressing why these are good options.`;

    const response = await fetchAnthropic(
      systemPrompt,
      [{ role: 'user', content: 'Please explain why these properties are a good match.' }]
    );

    return NextResponse.json({ explanation: response });

  } catch (error: unknown) {
    console.error('AI Explanation Error:', error);
    return NextResponse.json({ 
      explanation: "Here are some top-ranked properties based on your filters." 
    });
  }
}
