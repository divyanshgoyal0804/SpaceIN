import Anthropic from '@anthropic-ai/sdk';

const globalForAnthropic = globalThis as unknown as {
  anthropic: Anthropic | undefined;
};

export const anthropic =
  globalForAnthropic.anthropic ??
  new Anthropic({
    apiKey: process.env.OPENROUTER_API_KEY || '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',
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'SpaceIn',
    }
  });

if (process.env.NODE_ENV !== 'production') globalForAnthropic.anthropic = anthropic;
