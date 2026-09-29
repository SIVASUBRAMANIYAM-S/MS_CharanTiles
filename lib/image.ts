import { PixelRatio } from 'react-native';

const UNSPLASH = /^https:\/\/images\.unsplash\.com\/[^?]+/;
const MAX_WIDTH = 1600;

/**
 * Requests a remote image at the size it's actually drawn, instead of the
 * full-size URL stored in the database (catalog rows use w=800-1200 JPEGs
 * even for 130px thumbnails). Only Unsplash URLs are rewritten; anything else
 * is returned unchanged.
 *
 * Widths round up to 100px steps so nearby sizes share one cached file.
 */
export function sizedImageUrl<T extends string | null | undefined>(
  url: T,
  displayWidth: number,
): T {
  if (!url) return url;
  const base = UNSPLASH.exec(url)?.[0];
  if (!base) return url;
  const scale = Math.min(PixelRatio.get(), 3);
  const width = Math.min(Math.ceil((displayWidth * scale) / 100) * 100, MAX_WIDTH);
  // Carries over an editorial focal-point crop from the source URL (e.g. to
  // frame a specific corner of a photo) — otherwise it'd be silently dropped
  // and Unsplash would fall back to its own auto-centered crop.
  const queryStart = url.indexOf('?');
  const cropParams = queryStart === -1 ? '' : url.slice(queryStart);
  const focalPointParams = new URLSearchParams(cropParams);
  const preserved = ['crop', 'fp-x', 'fp-y', 'fp-z']
    .filter((key) => focalPointParams.has(key))
    .map((key) => `&${key}=${focalPointParams.get(key)}`)
    .join('');
  // WebP explicitly: native clients don't advertise it, so auto=format would still send JPEG.
  return `${base}?w=${width}&q=70&fm=webp&fit=crop${preserved}` as T;
}
