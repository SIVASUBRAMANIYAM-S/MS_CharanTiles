import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { ProductCard } from '@/components/catalog/ProductCard';
import { Skeleton } from '@/components/ui/Skeleton';
import type { ProductCardFields } from '@/lib/queries/products';
import { useAuthStore } from '@/lib/store/auth';
import { useWishlistStore } from '@/lib/store/wishlist';
import { typography } from '@/lib/theme/typography';
import { colors } from '@/lib/theme/colors';

type ProductGridProps = {
  /** null renders skeleton placeholders (loading state). */
  products: ProductCardFields[] | null;
  emptyMessage?: string;
  skeletonCount?: number;
};

export function ProductGrid({
  products,
  emptyMessage = 'No products found.',
  skeletonCount = 6,
}: ProductGridProps) {
  const userId = useAuthStore((state) => state.user?.id);
  const isWishlisted = useWishlistStore((state) => state.isWishlisted);
  const toggleWishlist = useWishlistStore((state) => state.toggle);

  if (products === null) {
    return (
      <View style={styles.grid}>
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <View key={index} style={styles.cell}>
            <Skeleton width="100%" height={160} borderRadius={12} />
          </View>
        ))}
      </View>
    );
  }

  if (products.length === 0) {
    return <Text style={styles.empty}>{emptyMessage}</Text>;
  }

  return (
    <View style={styles.grid}>
      {products.map((product) => (
        <View key={product.id} style={styles.cell}>
          <ProductCard
            product={product}
            onPress={() => router.push(`/product/${product.id}`)}
            wishlisted={isWishlisted(product.id)}
            onToggleWishlist={userId ? () => toggleWishlist(userId, product.id) : undefined}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  cell: { width: '47%' },
  empty: { ...typography.body, color: colors.muted, padding: 16, textAlign: 'center' },
});
