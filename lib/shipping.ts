/** Tiles are heavy — shipping every order for free isn't realistic. Orders at
 * or above the threshold ship free; smaller orders pay a flat delivery fee.
 * These are snapshotted onto the order at checkout (orders.shipping_fee), so
 * a later change here never rewrites the price of an order already placed. */
export const FREE_SHIPPING_THRESHOLD = 1500;
export const STANDARD_SHIPPING_FEE = 99;

export type ShippingEstimate = {
  fee: number;
  isFree: boolean;
  /** How much more the subtotal needs to reach free shipping; 0 once it does. */
  amountToFreeShipping: number;
};

export function estimateShipping(subtotal: number): ShippingEstimate {
  if (subtotal <= 0 || subtotal >= FREE_SHIPPING_THRESHOLD) {
    return { fee: 0, isFree: true, amountToFreeShipping: 0 };
  }
  return {
    fee: STANDARD_SHIPPING_FEE,
    isFree: false,
    amountToFreeShipping: FREE_SHIPPING_THRESHOLD - subtotal,
  };
}
