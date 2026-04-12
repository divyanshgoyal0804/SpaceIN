const FALLBACK_IMAGE_PATH = '/images/property-fallback.svg';

function getRuntimeBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/$/, '');
  }

  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    'http://localhost:3000'
  ).replace(/\/$/, '');
}

export function toAbsoluteUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  const base = getRuntimeBaseUrl();
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${base}${path}`;
}

export function resolvePropertyImageUrl(src: string | null | undefined): string {
  if (!src) {
    return toAbsoluteUrl(FALLBACK_IMAGE_PATH);
  }

  const trimmed = src.trim();
  if (!trimmed) {
    return toAbsoluteUrl(FALLBACK_IMAGE_PATH);
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith('/uploads/')) {
    return toAbsoluteUrl(trimmed.replace('/uploads/', '/api/uploads/'));
  }

  if (trimmed.startsWith('/api/uploads/')) {
    return toAbsoluteUrl(trimmed);
  }

  if (trimmed.startsWith('/')) {
    return toAbsoluteUrl(trimmed);
  }

  return toAbsoluteUrl(trimmed);
}

export function getFallbackPropertyImageUrl(): string {
  return toAbsoluteUrl(FALLBACK_IMAGE_PATH);
}
