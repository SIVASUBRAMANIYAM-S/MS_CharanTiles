export type SuitableFor = 'floor' | 'wall' | 'wet_areas' | 'outdoor' | 'high_traffic';

export const suitableForLabels: Record<SuitableFor, string> = {
  floor: 'Floors',
  wall: 'Walls',
  wet_areas: 'Wet areas',
  outdoor: 'Outdoor',
  high_traffic: 'High traffic',
};

export function isSuitableFor(value: string): value is SuitableFor {
  return value in suitableForLabels;
}

const peiMeaning: Record<number, string> = {
  1: 'walls only',
  2: 'light foot traffic',
  3: 'all home floors',
  4: 'homes and light commercial',
  5: 'heavy commercial footfall',
};

const slipMeaning: Record<string, string> = {
  R9: 'low grip, dry indoor areas',
  R10: 'standard grip',
  R11: 'high grip, wet areas',
  R12: 'very high grip, ramps and pools',
};

export function formatPei(rating: number | null): string | null {
  if (rating === null) return null;
  return `PEI ${rating} · ${peiMeaning[rating] ?? ''}`.replace(/ · $/, '');
}

export function formatSlip(rating: string | null): string | null {
  if (!rating) return null;
  return slipMeaning[rating] ? `${rating} · ${slipMeaning[rating]}` : rating;
}

export function formatThickness(mm: number | null): string | null {
  return mm === null ? null : `${mm} mm`;
}

/** '600x1200mm' → '600 × 1200 mm' for display; `unit: false` drops the ' mm'. */
export function formatSize(size: string | null, { unit = true } = {}): string | null {
  if (!size) return null;
  const match = /^(\d+)x(\d+)mm$/.exec(size);
  if (!match) return size;
  return `${match[1]} × ${match[2]}${unit ? ' mm' : ''}`;
}

/** 'anti-skid matte' → 'Anti-skid matte'. */
export function capitalize(value: string | null): string | null {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : null;
}
