import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';

/**
 * Arch-7: Reusable admin authentication wrapper.
 * Eliminates the need to repeat getServerSession + auth check in every admin route.
 *
 * Usage:
 *   export async function POST(request: NextRequest) {
 *     const authError = await requireAdmin();
 *     if (authError) return authError;
 *     // ... rest of handler
 *   }
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    );
  }
  return null;
}
