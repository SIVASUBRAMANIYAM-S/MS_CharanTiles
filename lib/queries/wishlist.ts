import { supabase } from '@/lib/supabase';

export async function getWishlistProductIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('wishlists')
    .select('product_id')
    .eq('user_id', userId);
  if (error) throw error;
  return data.map((row) => row.product_id);
}

/** Adds or removes the row and reports which action it took, for optimistic UI. */
export async function toggleWishlist(
  userId: string,
  productId: string,
  currentlyWishlisted: boolean,
): Promise<'added' | 'removed'> {
  if (currentlyWishlisted) {
    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);
    if (error) throw error;
    return 'removed';
  }

  const { error } = await supabase
    .from('wishlists')
    .insert({ user_id: userId, product_id: productId });
  if (error) throw error;
  return 'added';
}
