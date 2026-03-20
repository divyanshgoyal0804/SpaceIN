import { NextRequest, NextResponse } from 'next/server';
import { fetchOpenRouter } from '@/lib/openrouter';

export async function POST(req: NextRequest) {
  try {
    const { intent, properties } = await req.json();

    if (!properties || properties.length === 0) {
      return NextResponse.json({ explanation: "Unfortunately, no properties currently match those exact specifications. Could you try adjusting your requirements, such as expanding the location or increasing the budget?" });
    }

    // Limit to top 5 properties specifically
    const topProps = properties.slice(0, 5).map((p: any) => ({
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

    const openRouterResponse = await fetchOpenRouter([
      { role: 'user', content: systemPrompt }
    ]);

    // Our helper wraps json request but for this we just want the text back. 
    // Wait, the fetch helper uses response_format: 'json_object', but we want raw text here.
    // Ideally we shouldn't force JSON if we just want a paragraph.
    // I can parse out a JSON explanation or just use the whole string if it's text.
    // Since we forced json_object in fetchOpenRouter, the model might wrap the explanation in a JSON key like {"explanation": "..."}.
    let explanationText = openRouterResponse;
    try {
      const parsed = JSON.parse(openRouterResponse);
      if (parsed.explanation) {
        explanationText = parsed.explanation;
      } else if (parsed.content) {
        explanationText = parsed.content;
      } else {
        // Fallback to stringified json if it returned random keys
        explanationText = Object.values(parsed)[0] || openRouterResponse;
      }
    } catch (e) {
      // It just returned text, not JSON
    }

    return NextResponse.json({ explanation: explanationText });

  } catch (error: any) {
    console.error('AI Explanation Error:', error);
    return NextResponse.json({ 
      explanation: "Here are some top-ranked properties based on your filters." 
    });
  }
}
