export const DELIVERY_MIN_DAYS = 5;
export const DELIVERY_MAX_DAYS = 7;

/** Adds `days` business days (Sundays don't count) to `from`. */
function addBusinessDays(from: Date, days: number): Date {
  const result = new Date(from);
  let remaining = days;
  while (remaining > 0) {
    result.setDate(result.getDate() + 1);
    if (result.getDay() !== 0) remaining -= 1;
  }
  return result;
}

export type DeliveryWindow = { from: Date; to: Date };

/** A fixed 5–7 business day lead time from `orderedAt` (defaults to now). Not
 * location-aware — this is a POC-level estimate, the same for every order. */
export function estimateDeliveryWindow(orderedAt: Date = new Date()): DeliveryWindow {
  return {
    from: addBusinessDays(orderedAt, DELIVERY_MIN_DAYS),
    to: addBusinessDays(orderedAt, DELIVERY_MAX_DAYS),
  };
}

/** ISO 'YYYY-MM-DD' for a `date` column — local calendar day, not UTC-shifted. */
export function toDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const shortDate = new Intl.DateTimeFormat('en-IN', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
});

/** "Tue, 30 Sep – Thu, 2 Oct" (or a single date if the window is one day, e.g.
 * a date-only column round-tripped through `new Date()`). */
export function formatDeliveryWindow(window: DeliveryWindow): string {
  const from = shortDate.format(window.from);
  const to = shortDate.format(window.to);
  return from === to ? from : `${from} – ${to}`;
}

/** Parses the 'YYYY-MM-DD' strings read back from orders.estimated_delivery_*.
 * Split and passed to the Date constructor's (year, month, day) form — parsing
 * the plain string directly is UTC-midnight, which renders as the previous
 * day in negative-UTC-offset timezones. */
export function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}
