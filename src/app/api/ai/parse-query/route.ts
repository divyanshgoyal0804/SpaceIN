import { NextRequest, NextResponse } from 'next/server';
import { fetchOpenRouter } from '@/lib/openrouter';

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is missing' }, { status: 400 });
    }

    const systemPrompt = `Convert this real estate query into structured JSON filters.
Return ONLY valid JSON:
{
  "bhk": null,
  "max_price": null,
  "location": null,
  "near_metro": null,
  "intent": null
}
Keys must be exact. Put null if not specified. intent is 'investment' or 'self_use' or null. bhk is integer, max_price is integer, location is string, near_metro is boolean.`;

    const openRouterResponse = await fetchOpenRouter([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Query: ${query}` }
    ]);

    let parsedFilters = {
      bhk: null,
      max_price: null,
      location: null,
      near_metro: null,
      intent: null
    };

    try {
      // Find JSON block safely (Mistral / Deepseek might wrap in markdown)
      const jsonStr = openRouterResponse.match(/\{[\s\S]*\}/)?.[0] || '{}';
      const parsed = JSON.parse(jsonStr);
      
      parsedFilters = {
        bhk: typeof parsed.bhk === 'number' ? parsed.bhk : null,
        max_price: typeof parsed.max_price === 'number' ? parsed.max_price : null,
        location: typeof parsed.location === 'string' ? parsed.location : null,
        near_metro: typeof parsed.near_metro === 'boolean' ? parsed.near_metro : null,
        intent: ['investment', 'self_use'].includes(parsed.intent) ? parsed.intent : null,
      };
    } catch (parseError) {
      console.warn('JSON Parse Error from OpenRouter, falling back to default:', parseError);
    }

    return NextResponse.json({ filters: parsedFilters });

  } catch (error: any) {
    console.error('Parse Query Error:', error);
    // Fallback to default filters
    return NextResponse.json({ 
      filters: {
        bhk: null,
        max_price: null,
        location: null,
        near_metro: null,
        intent: null
      }
    });
  }
}
