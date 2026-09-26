import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { ProductGrid } from '@/components/catalog/ProductGrid';
import { getProductsByIds, type ProductCardData } from '@/lib/queries/products';
import { useAuthStore } from '@/lib/store/auth';
import { useWishlistStore } from '@/lib/store/wishlist';
import { colors } from '@/lib/theme/colors';
import { typography } from '@/lib/theme/typography';

export default function WishlistScreen() {
  const productIds = useWishlistStore((state) => state.productIds);
  const hydrated = useWishlistStore((state) => state.hydrated);
  const authLoading = useAuthStore((state) => state.loading);
  const [products, setProducts] = useState<ProductCardData[] | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (productIds.length === 0) {
      setProducts([]);
      return;
    }
    setProducts(null);
    getProductsByIds(productIds)
      .then(setProducts)
      .catch((error: unknown) => {
        console.warn('Failed to load wishlist products', error);
        setProducts([]);
      });
    // productIds is a new array each toggle, so this re-fetches whenever it changes.
  }, [hydrated, productIds]);

  const loading = authLoading || !hydrated || products === null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={typography.h1}>Wishlist</Text>
      <ProductGrid
        products={loading ? null : products}
        emptyMessage="Nothing here yet. Tap the heart on a tile to save it."
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.stone },
  content: { padding: 16, gap: 16, paddingBottom: 32 },
});
