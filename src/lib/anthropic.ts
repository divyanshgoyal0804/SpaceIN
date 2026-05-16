import Anthropic from '@anthropic-ai/sdk';

if (!process.env.ANTHROPIC_API_KEY) {
  console.warn('ANTHROPIC_API_KEY is not set in environment variables.');
}

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export const DEFAULT_MODEL = 'claude-sonnet-4-6';

/**
 * Simple helper for non-streaming completions (used by parse-query, explain).
 */
export async function fetchAnthropic(
  systemPrompt: string,
  messages: { role: 'user' | 'assistant'; content: string }[],
  maxTokens = 1024
): Promise<string> {
  const response = await anthropic.messages.create({
    model: DEFAULT_MODEL,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages,
  });

  // Extract text from the response content blocks
  const textBlock = response.content.find((block) => block.type === 'text');
  return textBlock ? textBlock.text : '';
}
