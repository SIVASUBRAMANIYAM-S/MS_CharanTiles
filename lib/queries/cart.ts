import { supabase } from '@/lib/supabase';
import type { Tables } from '@/types/database';

export type CartItemRow = Tables<'cart_items'>;

export type CartLineDetail = {
  productId: string;
  variantId: string | null;
  quantity: number;
  name: string;
  imageUrl: string | null;
  /** Variant price if a variant is selected, else the product's own price. */
  unitPrice: number;
  size: string | null;
  finish: string | null;
  stockStatus: string;
};

export async function getCartItems(userId: string): Promise<CartItemRow[]> {
  const { data, error } = await supabase.from('cart_items').select('*').eq('user_id', userId);
  if (error) throw error;
  return data;
}

/** Adds to the existing remote quantity for this line, or inserts a new row. */
export async function upsertCartItem(
  userId: string,
  productId: string,
  variantId: string | null,
  quantityDelta: number,
): Promise<void> {
  const existingQuery = supabase
    .from('cart_items')
    .select('id, quantity')
    .eq('user_id', userId)
    .eq('product_id', productId);
  const { data: existing, error: selectError } = await (
    variantId ? existingQuery.eq('variant_id', variantId) : existingQuery.is('variant_id', null)
  ).maybeSingle();
  if (selectError) throw selectError;

  if (existing) {
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: existing.quantity + quantityDelta })
      .eq('id', existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('cart_items').insert({
      user_id: userId,
      product_id: productId,
      variant_id: variantId,
      quantity: quantityDelta,
    });
    if (error) throw error;
  }
}

export async function setCartItemQuantity(
  userId: string,
  productId: string,
  variantId: string | null,
  quantity: number,
): Promise<void> {
  const query = supabase
    .from('cart_items')
    .update({ quantity })
    .eq('user_id', userId)
    .eq('product_id', productId);
  const { error } = await (variantId
    ? query.eq('variant_id', variantId)
    : query.is('variant_id', null));
  if (error) throw error;
}

export async function removeCartItem(
  userId: string,
  productId: string,
  variantId: string | null,
): Promise<void> {
  const query = supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);
  const { error } = await (variantId
    ? query.eq('variant_id', variantId)
    : query.is('variant_id', null));
  if (error) throw error;
}

export async function clearCartItems(userId: string): Promise<void> {
  const { error } = await supabase.from('cart_items').delete().eq('user_id', userId);
  if (error) throw error;
}

/** Cart lines joined with product/variant info, for the Cart and Review screens. */
export async function getCartLineDetails(
  items: { productId: string; variantId: string | null; quantity: number }[],
): Promise<CartLineDetail[]> {
  if (items.length === 0) return [];
  const productIds = [...new Set(items.map((item) => item.productId))];

  const { data, error } = await supabase
    .from('products')
    .select('*, product_images(url, sort_order), product_variants(*)')
    .in('id', productIds);
  if (error) throw error;

  const productsById = new Map(data.map((product) => [product.id, product]));

  return items
    .map((item): CartLineDetail | null => {
      const product = productsById.get(item.productId);
      if (!product) return null;
      const variant = item.variantId
        ? product.product_variants.find((v) => v.id === item.variantId)
        : null;
      const image = [...product.product_images].sort((a, b) => a.sort_order - b.sort_order)[0];
      return {
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        name: product.name,
        imageUrl: image?.url ?? null,
        unitPrice: variant?.price ?? product.price,
        size: variant?.size ?? product.size,
        finish: variant?.finish ?? product.finish,
        stockStatus: product.stock_status,
      };
    })
    .filter((line): line is CartLineDetail => line !== null);
}
