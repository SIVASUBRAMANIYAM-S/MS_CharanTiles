import { router } from 'expo-router';
import { SquaresFour } from '@/components/ui/icons';
import { View } from 'react-native';

import { ProductCard } from '@/components/catalog/ProductCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import type { ProductCardFields } from '@/lib/queries/products';
import { useAuthStore } from '@/lib/store/auth';
import { useWishlistStore } from '@/lib/store/wishlist';
import { makeStyles, radius, useTheme } from '@/lib/theme';

type ProductGridProps = {
  /** null renders skeleton placeholders (loading state). */
  products: ProductCardFields[] | null;
  emptyMessage?: string;
  skeletonCount?: number;
};

export function ProductGrid({
  products,
  emptyMessage = 'No products found.',
  skeletonCount = 4,
}: ProductGridProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const userId = useAuthStore((state) => state.user?.id);
  // Subscribe to the productIds array itself, not the isWishlisted *function* —
  // that function reference never changes, so selecting it never re-renders
  // this list when the wishlist actually changes (the heart just wouldn't
  // visually flip here, even though the toggle still wrote through).
  const wishlistIds = useWishlistStore((state) => state.productIds);
  const toggleWishlist = useWishlistStore((state) => state.toggle);

  if (products === null) {
    return (
      <View style={styles.grid}>
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <View key={index} style={styles.cell}>
            <Skeleton width="100%" height={210} borderRadius={radius.lg} />
            <View style={styles.skeletonText}>
              <Skeleton width="80%" height={14} />
              <Skeleton width="40%" height={14} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState icon={<SquaresFour size={30} color={colors.accentInk} />} title={emptyMessage} />
    );
  }

  return (
    <View style={styles.grid}>
      {products.map((product) => (
        <View key={product.id} style={styles.cell}>
          <ProductCard
            product={product}
            onPress={() => router.push(`/product/${product.id}`)}
            wishlisted={wishlistIds.includes(product.id)}
            onToggleWishlist={userId ? () => toggleWishlist(userId, product.id) : undefined}
          />
        </View>
      ))}
    </View>
  );
}

const useStyles = makeStyles(() => ({
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 24 },
  cell: { width: '48%' },
  skeletonText: { gap: 6, marginTop: 10 },
}));
