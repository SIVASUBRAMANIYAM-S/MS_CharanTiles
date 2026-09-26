import { router } from 'expo-router';
import { Heart } from '@/components/ui/icons';
import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { ProductGrid } from '@/components/catalog/ProductGrid';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { getProductsByIds, type ProductCardData } from '@/lib/queries/products';
import { useAuthStore } from '@/lib/store/auth';
import { useWishlistStore } from '@/lib/store/wishlist';
import { makeStyles, useTheme } from '@/lib/theme';

export default function WishlistScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
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
    getProductsByIds(productIds)
      .then(setProducts)
      .catch((error: unknown) => {
        console.warn('Failed to load wishlist products', error);
        setProducts([]);
      });
    // productIds is a new array each toggle, so this re-fetches whenever it changes.
  }, [hydrated, productIds]);

  const loading = authLoading || !hydrated || products === null;
  const count = productIds.length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ScreenHeader
        title="Wishlist"
        subtitle={count > 0 ? `${count} saved ${count === 1 ? 'tile' : 'tiles'}` : undefined}
      />
      <View style={styles.body}>
        {!loading && products?.length === 0 ? (
          <EmptyState
            icon={<Heart size={30} color={colors.accentInk} weight="fill" />}
            title="Nothing saved yet"
            body="Tap the heart on any tile to keep it here for later."
            actionLabel="Browse catalog"
            onAction={() => router.push('/catalog')}
          />
        ) : (
          <ProductGrid products={loading ? null : products} />
        )}
      </View>
    </ScrollView>
  );
}

const useStyles = makeStyles((c) => ({
  container: { flex: 1, backgroundColor: c.bg },
  content: { paddingBottom: 40 },
  body: { paddingHorizontal: 16, paddingTop: 12 },
}));
