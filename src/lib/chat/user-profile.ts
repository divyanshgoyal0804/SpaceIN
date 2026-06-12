/**
 * User Profile & Memory Service.
 * 
 * Manages persistent user profiles for the chatbot.
 * Returning users automatically get personalized recommendations
 * based on their accumulated preferences.
 */

import { prisma } from '@/lib/prisma';
import { ChatIntent } from './intent-extractor';

export interface UserProfile {
  id: string;
  anonymousId: string;
  preferredCity: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  preferredTypes: string[];
  preferredLocations: string[];
  preferredAmenities: string[];
  preferredFurnished: string | null;
  conversationCount: number;
  isReturning: boolean; // true if user has prior conversations
}

/**
 * Get or create a ChatUser by anonymous ID.
 */
export async function getOrCreateUser(anonymousId: string): Promise<UserProfile> {
  try {
    const user = await prisma.chatUser.upsert({
      where: { anonymousId },
      update: {
        lastActiveAt: new Date(),
      },
      create: {
        anonymousId,
        lastActiveAt: new Date(),
      },
    });

    return {
      id: user.id,
      anonymousId: user.anonymousId,
      preferredCity: user.preferredCity,
      budgetMin: user.budgetMin,
      budgetMax: user.budgetMax,
      preferredTypes: user.preferredTypes,
      preferredLocations: user.preferredLocations,
      preferredAmenities: user.preferredAmenities,
      preferredFurnished: user.preferredFurnished,
      conversationCount: user.conversationCount,
      isReturning: user.conversationCount > 0,
    };
  } catch (error) {
    console.error('Failed to get/create user:', error);
    // Return a transient profile that won't persist
    return {
      id: 'transient',
      anonymousId,
      preferredCity: null,
      budgetMin: null,
      budgetMax: null,
      preferredTypes: [],
      preferredLocations: [],
      preferredAmenities: [],
      preferredFurnished: null,
      conversationCount: 0,
      isReturning: false,
    };
  }
}

/**
 * Update user preferences based on extracted intent.
 * Uses a merge strategy — new signals are folded into existing preferences.
 * This is fire-and-forget (non-blocking).
 */
export function updateUserPreferences(userId: string, intent: ChatIntent): void {
  if (userId === 'transient') return;

  // Run async but don't await — fire and forget
  (async () => {
    try {
      const user = await prisma.chatUser.findUnique({
        where: { id: userId },
      });
      if (!user) return;

      // Merge locations (deduplicate, keep last 10)
      const mergedLocations = mergeArrays(
        user.preferredLocations,
        intent.locations,
        10,
      );

      // Merge amenities (deduplicate, keep last 15)
      const mergedAmenities = mergeArrays(
        user.preferredAmenities,
        intent.amenities,
        15,
      );

      // Merge property types (deduplicate)
      const mergedTypes = mergeArrays(
        user.preferredTypes,
        intent.propertyType || [],
        6,
      );

      // Budget: use running average weighted towards recent
      const newBudgetMax = intent.budgetMax
        ? user.budgetMax
          ? Math.round(user.budgetMax * 0.3 + intent.budgetMax * 0.7) // 70% weight to recent
          : intent.budgetMax
        : user.budgetMax;

      const newBudgetMin = intent.budgetMin
        ? user.budgetMin
          ? Math.round(user.budgetMin * 0.3 + intent.budgetMin * 0.7)
          : intent.budgetMin
        : user.budgetMin;

      await prisma.chatUser.update({
        where: { id: userId },
        data: {
          preferredLocations: mergedLocations,
          preferredAmenities: mergedAmenities,
          preferredTypes: mergedTypes,
          preferredFurnished: intent.furnished || user.preferredFurnished,
          budgetMin: newBudgetMin,
          budgetMax: newBudgetMax,
          preferredCity: user.preferredCity || 'Noida',
          conversationCount: { increment: 1 },
          lastActiveAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Failed to update user preferences:', error);
    }
  })();
}

/**
 * Format user profile context for the system prompt.
 * Returns an empty string if user has no history.
 */
export function formatUserContext(profile: UserProfile): string {
  if (!profile.isReturning) return '';

  const parts: string[] = ['RETURNING USER PROFILE:'];

  if (profile.preferredCity) {
    parts.push(`• Preferred city: ${profile.preferredCity}`);
  }
  if (profile.budgetMin || profile.budgetMax) {
    const range = [
      profile.budgetMin ? `₹${profile.budgetMin.toLocaleString('en-IN')}` : '',
      profile.budgetMax ? `₹${profile.budgetMax.toLocaleString('en-IN')}` : '',
    ]
      .filter(Boolean)
      .join(' – ');
    parts.push(`• Typical budget range: ${range}`);
  }
  if (profile.preferredTypes.length > 0) {
    parts.push(`• Preferred property types: ${profile.preferredTypes.join(', ')}`);
  }
  if (profile.preferredLocations.length > 0) {
    parts.push(`• Preferred locations: ${profile.preferredLocations.slice(0, 5).join(', ')}`);
  }
  if (profile.preferredAmenities.length > 0) {
    parts.push(`• Important amenities: ${profile.preferredAmenities.slice(0, 5).join(', ')}`);
  }
  if (profile.preferredFurnished) {
    parts.push(`• Furnishing preference: ${profile.preferredFurnished}`);
  }
  parts.push(`• Previous conversations: ${profile.conversationCount}`);

  return parts.join('\n');
}

/**
 * Merge two arrays with deduplication and size limit.
 * New items are added to the front (most recent first).
 */
function mergeArrays(existing: string[], incoming: string[], maxSize: number): string[] {
  const merged = [...new Set([...incoming, ...existing])];
  return merged.slice(0, maxSize);
}
