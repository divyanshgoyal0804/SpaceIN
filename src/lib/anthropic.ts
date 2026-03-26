import Anthropic from '@anthropic-ai/sdk';
import { getAppUrl } from './app-url';

const globalForAnthropic = globalThis as unknown as {
  anthropic: Anthropic | undefined;
};

export const anthropic =
  globalForAnthropic.anthropic ??
  new Anthropic({
    apiKey: process.env.OPENROUTER_API_KEY || '',
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      'HTTP-Referer': getAppUrl(),
      'X-Title': 'SpaceIn',
    }
  });

if (process.env.NODE_ENV !== 'production') globalForAnthropic.anthropic = anthropic;
