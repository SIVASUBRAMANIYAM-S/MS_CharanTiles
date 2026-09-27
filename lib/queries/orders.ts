import { supabase } from '@/lib/supabase';
import type { CartLineDetail } from '@/lib/queries/cart';
import type { Tables } from '@/types/database';

export type Order = Tables<'orders'>;
export type OrderItem = Tables<'order_items'>;

export type ShippingAddress = {
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
};

export type OrderSummary = Order & { itemCount: number };

export type OrderWithItems = Order & {
  order_items: (OrderItem & {
    products: { name: string; product_images: { url: string; sort_order: number }[] } | null;
    product_variants: { size: string | null; finish: string | null } | null;
  })[];
};

/**
 * Writes the order, then its line items. Mock payment only — see Phase 6 notes:
 * no real payment gateway, this always represents a "successful" charge.
 */
export async function createOrder(
  userId: string,
  address: ShippingAddress,
  lines: CartLineDetail[],
  totalAmount: number,
  shippingFee: number,
  mockPaymentId: string,
): Promise<string> {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      status: 'confirmed',
      payment_status: 'paid',
      payment_id: mockPaymentId,
      total_amount: totalAmount,
      shipping_fee: shippingFee,
      shipping_address: address,
    })
    .select('id')
    .single();
  if (orderError) throw orderError;

  const { error: itemsError } = await supabase.from('order_items').insert(
    lines.map((line) => ({
      order_id: order.id,
      product_id: line.productId,
      variant_id: line.variantId,
      quantity: line.quantity,
      price_at_purchase: line.unitPrice,
    })),
  );
  if (itemsError) throw itemsError;

  return order.id;
}

export async function getOrdersByUser(userId: string): Promise<OrderSummary[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(count)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(({ order_items, ...order }) => ({
    ...order,
    itemCount: order_items[0]?.count ?? 0,
  }));
}

export async function getOrderById(id: string): Promise<OrderWithItems | null> {
  const { data, error } = await supabase
    .from('orders')
    .select(
      '*, order_items(*, products(name, product_images(url, sort_order)), product_variants(size, finish))',
    )
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}
