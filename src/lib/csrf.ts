/**
 * HIGH-5: CSRF protection via Origin header validation.
 * Validates that state-changing requests come from the same origin.
 */

export function validateOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  // If no origin or referer, allow (could be server-to-server or same-origin non-CORS)
  if (!origin && !referer) return true;

  const allowedHosts = new Set<string>();

  // Add configured app URLs
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL;
  if (appUrl) {
    try {
      allowedHosts.add(new URL(appUrl).host);
    } catch {
      // ignore invalid URL
    }
  }

  // Always allow localhost in development
  if (process.env.NODE_ENV !== 'production') {
    allowedHosts.add('localhost:3000');
    allowedHosts.add('localhost:3001');
    allowedHosts.add('127.0.0.1:3000');
  }

  // Check origin header
  if (origin) {
    try {
      const originHost = new URL(origin).host;
      return allowedHosts.has(originHost);
    } catch {
      return false;
    }
  }

  // Fall back to referer
  if (referer) {
    try {
      const refererHost = new URL(referer).host;
      return allowedHosts.has(refererHost);
    } catch {
      return false;
    }
  }

  return true;
}
