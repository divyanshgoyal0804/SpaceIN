/**
 * Intent Extraction Pipeline.
 * 
 * Replaces the old parse-query approach (which extracted 5 rigid fields)
 * with a rich intent extraction that captures soft preferences, flexibility,
 * and conversation context.
 */

import { fetchAnthropic } from '@/lib/anthropic';

/**
 * Rich intent extracted from a user's conversation.
 * Soft constraints are preferred over hard filters.
 */
export interface ChatIntent {
  propertyType: string[] | null;        // OFFICE, COWORKING, RETAIL, etc.
  listingType: 'SALE' | 'RENT' | 'BOTH' | null;
  budgetMin: number | null;
  budgetMax: number | null;
  budgetFlexibility: 'strict' | 'moderate' | 'flexible';
  locations: string[];                  // preferred sectors/areas
  locationFlexibility: boolean;         // willing to consider nearby?
  carpetAreaMin: number | null;
  carpetAreaMax: number | null;
  seatCount: number | null;             // for coworking: number of seats/desks needed
  workspaceStyle: 'managed_office' | 'coworking' | 'virtual_office' | 'traditional_lease' | null;
  furnished: string | null;             // FURNISHED, SEMI_FURNISHED, BARE_SHELL
  amenities: string[];                  // desired amenities (soft — boost, don't filter)
  intent: 'investment' | 'self_use' | 'both' | null;
  urgency: 'immediate' | 'exploring' | null;
  conversationType: 'search' | 'comparison' | 'followup' | 'general';
  freeTextContext: string;              // anything not captured above
}

const DEFAULT_INTENT: ChatIntent = {
  propertyType: null,
  listingType: null,
  budgetMin: null,
  budgetMax: null,
  budgetFlexibility: 'moderate',
  locations: [],
  locationFlexibility: true,
  carpetAreaMin: null,
  carpetAreaMax: null,
  seatCount: null,
  workspaceStyle: null,
  furnished: null,
  amenities: [],
  intent: null,
  urgency: null,
  conversationType: 'search',
  freeTextContext: '',
};

const EXTRACTION_PROMPT = `You are an intent extraction system for Sharkspace — a commercial real estate platform in Noida, India that specializes in COWORKING SPACES, MANAGED OFFICES, and LEASED OFFICE SPACES.

ABOUT SHARKSPACE'S BUSINESS:
- Primary focus: Coworking spaces, managed/serviced offices, and traditional office leases
- All properties are in Noida/Greater Noida, India
- Pricing is typically MONTHLY RENT (not sale price) unless the user is buying
- For coworking: pricing can be per-seat (₹5,000-15,000/seat/month) or total monthly rent
- "Managed office" = fully serviced private office space operated by a provider
- "Coworking" = shared workspace with hot desks, dedicated desks, or cabins
- "Virtual office" = business address + mail handling without physical space
- "Traditional lease" = standard long-term office rental (bare shell or semi-furnished)

Analyze the user's message and extract structured search intent.

Return ONLY valid JSON matching this exact schema:
{
  "propertyType": ["OFFICE"] or ["COWORKING","OFFICE"] or null,
  "listingType": "SALE" or "RENT" or "BOTH" or null,
  "budgetMin": number or null,
  "budgetMax": number or null,
  "budgetFlexibility": "strict" or "moderate" or "flexible",
  "locations": ["Sector 62", "Sector 63"] or [],
  "locationFlexibility": true or false,
  "carpetAreaMin": number or null,
  "carpetAreaMax": number or null,
  "seatCount": number or null,
  "workspaceStyle": "managed_office" or "coworking" or "virtual_office" or "traditional_lease" or null,
  "furnished": "FURNISHED" or "SEMI_FURNISHED" or "BARE_SHELL" or null,
  "amenities": ["Parking", "Power Backup"] or [],
  "intent": "investment" or "self_use" or "both" or null,
  "urgency": "immediate" or "exploring" or null,
  "conversationType": "search" or "comparison" or "followup" or "general",
  "freeTextContext": "string summarizing anything not captured above"
}

IMPORTANT RULES:
- Budget values are MONTHLY RENT in INR unless user explicitly says "buy/purchase/sale price"
- "40K" = 40000, "1L" = 100000, "1 lakh" = 100000, "1 Cr" = 10000000
- If user mentions "per seat" pricing, multiply by seatCount for budgetMax if both are given
- If user says "under 40K", set budgetMax=40000, budgetFlexibility="moderate"
- If user says "strictly under 40K" or "cannot exceed", set budgetFlexibility="strict"
- If user says "around 40K" or "approximately", set budgetFlexibility="flexible"
- For locations, normalize to "Sector XX" format
- COWORKING TERMINOLOGY MAPPING:
  - "coworking", "shared office", "hot desk", "flexi seat" → propertyType=["COWORKING"]
  - "managed office", "serviced office", "plug and play" → propertyType=["OFFICE"], workspaceStyle="managed_office"
  - "dedicated desk", "cabin" → propertyType=["COWORKING"]
  - "virtual office", "business address" → workspaceStyle="virtual_office"
  - "lease", "bare shell", "warm shell" → workspaceStyle="traditional_lease"
  - "X seats", "team of X", "X people" → seatCount=X
- conversationType: "search" for new property queries, "comparison" for comparing options, "followup" for clarifications, "general" for greetings/non-property chat
- propertyType values must be: OFFICE, COWORKING, RETAIL, WAREHOUSE, SHOWROOM, PLOT
- When in doubt about coworking vs office, include BOTH: ["OFFICE", "COWORKING"]
- Set null/empty for anything not mentioned or unclear
- Always return valid JSON, never markdown`;

/**
 * Extract intent from the latest user message, using conversation history for context.
 */
export async function extractIntent(
  userMessage: string,
  conversationHistory: { role: 'user' | 'assistant'; content: string }[] = [],
  previousIntent?: ChatIntent | null,
): Promise<ChatIntent> {
  try {
    // Build context from recent conversation (last 6 messages max)
    const recentHistory = conversationHistory.slice(-6);
    let contextBlock = '';
    if (recentHistory.length > 0) {
      contextBlock = `\n\nRECENT CONVERSATION:\n${recentHistory
        .map((m) => `${m.role.toUpperCase()}: ${m.content.substring(0, 300)}`)
        .join('\n')}`;
    }

    // Include previous intent for continuity
    let previousBlock = '';
    if (previousIntent) {
      previousBlock = `\n\nPREVIOUS EXTRACTED INTENT:\n${JSON.stringify(previousIntent, null, 2)}\n\nMerge new information with previous intent. If the user refines a preference, update it. If they ask about something completely new, start fresh.`;
    }

    const response = await fetchAnthropic(
      EXTRACTION_PROMPT,
      [
        {
          role: 'user',
          content: `USER'S LATEST MESSAGE: "${userMessage}"${contextBlock}${previousBlock}`,
        },
      ],
      512, // Intent extraction doesn't need many tokens
    );

    return parseIntentResponse(response);
  } catch (error) {
    console.error('Intent extraction failed, using defaults:', error);
    return {
      ...DEFAULT_INTENT,
      freeTextContext: userMessage,
      conversationType: guessConversationType(userMessage),
    };
  }
}

/**
 * Parse the LLM's JSON response into a validated ChatIntent.
 */
function parseIntentResponse(response: string): ChatIntent {
  try {
    // Extract JSON from potential markdown wrapper
    const jsonStr = response.match(/\{[\s\S]*\}/)?.[0] || '{}';
    const parsed = JSON.parse(jsonStr);

    return {
      propertyType: validateStringArray(parsed.propertyType, [
        'OFFICE', 'COWORKING', 'RETAIL', 'WAREHOUSE', 'SHOWROOM', 'PLOT',
      ]),
      listingType: validateEnum(parsed.listingType, ['SALE', 'RENT', 'BOTH']),
      budgetMin: typeof parsed.budgetMin === 'number' ? parsed.budgetMin : null,
      budgetMax: typeof parsed.budgetMax === 'number' ? parsed.budgetMax : null,
      budgetFlexibility: validateEnum(parsed.budgetFlexibility, ['strict', 'moderate', 'flexible']) || 'moderate',
      locations: Array.isArray(parsed.locations) ? parsed.locations.filter((l: unknown) => typeof l === 'string') : [],
      locationFlexibility: typeof parsed.locationFlexibility === 'boolean' ? parsed.locationFlexibility : true,
      carpetAreaMin: typeof parsed.carpetAreaMin === 'number' ? parsed.carpetAreaMin : null,
      carpetAreaMax: typeof parsed.carpetAreaMax === 'number' ? parsed.carpetAreaMax : null,
      seatCount: typeof parsed.seatCount === 'number' ? parsed.seatCount : null,
      workspaceStyle: validateEnum(parsed.workspaceStyle, ['managed_office', 'coworking', 'virtual_office', 'traditional_lease']),
      furnished: validateEnum(parsed.furnished, ['FURNISHED', 'SEMI_FURNISHED', 'BARE_SHELL']),
      amenities: Array.isArray(parsed.amenities) ? parsed.amenities.filter((a: unknown) => typeof a === 'string') : [],
      intent: validateEnum(parsed.intent, ['investment', 'self_use', 'both']),
      urgency: validateEnum(parsed.urgency, ['immediate', 'exploring']),
      conversationType: validateEnum(parsed.conversationType, ['search', 'comparison', 'followup', 'general']) || 'search',
      freeTextContext: typeof parsed.freeTextContext === 'string' ? parsed.freeTextContext : '',
    };
  } catch (error) {
    console.warn('Failed to parse intent response:', error);
    return { ...DEFAULT_INTENT };
  }
}

function validateEnum<T extends string>(value: unknown, allowed: T[]): T | null {
  return typeof value === 'string' && allowed.includes(value as T) ? (value as T) : null;
}

function validateStringArray(value: unknown, allowed: string[]): string[] | null {
  if (!Array.isArray(value)) return null;
  const filtered = value.filter((v) => typeof v === 'string' && allowed.includes(v));
  return filtered.length > 0 ? filtered : null;
}

function guessConversationType(message: string): ChatIntent['conversationType'] {
  const lower = message.toLowerCase();
  if (/^(hi|hello|hey|good|thanks|thank)/.test(lower)) return 'general';
  if (/compar|versus|vs|better|which one|difference/.test(lower)) return 'comparison';
  if (/more|also|what about|how about|and|another/.test(lower)) return 'followup';
  return 'search';
}
