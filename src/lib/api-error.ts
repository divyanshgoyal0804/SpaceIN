/**
 * Arch-3: Consistent API error class.
 * Use this for throwing typed errors in API routes that get caught
 * by a standard error handler.
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(statusCode: number, message: string, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code || getDefaultCode(statusCode);
  }

  /**
   * Convert to a JSON-safe response body (no stack traces).
   */
  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
      },
    };
  }
}

function getDefaultCode(status: number): string {
  switch (status) {
    case 400: return 'BAD_REQUEST';
    case 401: return 'UNAUTHORIZED';
    case 403: return 'FORBIDDEN';
    case 404: return 'NOT_FOUND';
    case 409: return 'CONFLICT';
    case 413: return 'PAYLOAD_TOO_LARGE';
    case 429: return 'TOO_MANY_REQUESTS';
    default: return 'INTERNAL_ERROR';
  }
}

/**
 * Standard error response helper.
 * Handles ApiError instances and generic errors consistently.
 */
export function handleApiError(error: unknown): Response {
  if (error instanceof ApiError) {
    return Response.json(error.toJSON(), { status: error.statusCode });
  }

  console.error('Unhandled API error:', error);

  return Response.json(
    {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred.',
      },
    },
    { status: 500 }
  );
}
