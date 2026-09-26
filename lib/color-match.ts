import type { ImageColorsResult } from 'react-native-image-colors';

export type Rgb = { r: number; g: number; b: number };

/** react-native-image-colors' result shape differs by platform — iOS has no
 * "dominant" field, so its closest equivalent ("primary") is used instead. */
export function extractDominantHex(result: ImageColorsResult): string {
  return result.platform === 'ios' ? result.primary : result.dominant;
}

export function hexToRgb(hex: string): Rgb | null {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!match) return null;
  return {
    r: parseInt(match[1], 16),
    g: parseInt(match[2], 16),
    b: parseInt(match[3], 16),
  };
}

export function colorDistance(a: Rgb, b: Rgb): number {
  return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
}

export type ColorMatchable = {
  dominant_color_hex: string | null;
};

/** Ranks candidates by Euclidean RGB distance to `hex`, nearest first. */
export function findClosestProducts<T extends ColorMatchable>(
  hex: string,
  products: T[],
  limit: number,
): T[] {
  const target = hexToRgb(hex);
  if (!target) return [];

  return products
    .map((product) => {
      const rgb = product.dominant_color_hex ? hexToRgb(product.dominant_color_hex) : null;
      return { product, distance: rgb ? colorDistance(target, rgb) : Infinity };
    })
    .filter((entry) => entry.distance !== Infinity)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)
    .map((entry) => entry.product);
}
