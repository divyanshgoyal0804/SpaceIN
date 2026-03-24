import { env } from 'process';

export async function fetchOpenRouter(messages: { role: string; content: string }[], maxTokens = 1000) {
  const apiKey = env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not defined');
  }

  const model = env.OPENROUTER_MODEL || 'openrouter/auto';

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'Property AI App',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('OpenRouter error:', text);
    throw new Error(`OpenRouter API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
