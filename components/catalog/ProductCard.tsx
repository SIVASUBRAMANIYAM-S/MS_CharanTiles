import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import type { ProductCardFields } from '@/lib/queries/products';
import { colors } from '@/lib/theme/colors';
import { typography } from '@/lib/theme/typography';

type ProductCardProps = {
  product: ProductCardFields;
  onPress: () => void;
  wishlisted?: boolean;
  onToggleWishlist?: () => void;
};

export function ProductCard({
  product,
  onPress,
  wishlisted = false,
  onToggleWishlist,
}: ProductCardProps) {
  const image = [...product.product_images].sort((a, b) => a.sort_order - b.sort_order)[0];
  const hasDiscount = product.mrp !== null && product.mrp > product.price;

  return (
    // The heart button is a sibling of the navigate-to-product Pressable, not a
    // descendant of it — nesting two <Pressable accessibilityRole="button">
    // renders as a <button> inside a <button> on web, which is invalid HTML.
    <View style={styles.card}>
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={product.name}>
        <View style={styles.imageWrap}>
          {image ? (
            <Image
              source={{ uri: image.url }}
              style={styles.image}
              contentFit="cover"
              transition={150}
            />
          ) : (
            <View style={[styles.image, styles.imageFallback]} />
          )}

          <View style={styles.badgeRow}>
            {product.is_featured && <Badge label="Featured" tone="featured" />}
            {product.stock_status === 'low_stock' && <Badge label="Low stock" tone="lowStock" />}
            {product.stock_status === 'out_of_stock' && (
              <Badge label="Out of stock" tone="outOfStock" />
            )}
          </View>
        </View>

        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{product.price.toFixed(0)}</Text>
          {hasDiscount && <Text style={styles.mrp}>₹{product.mrp!.toFixed(0)}</Text>}
        </View>
      </Pressable>

      {onToggleWishlist && (
        <Pressable
          onPress={onToggleWishlist}
          style={styles.heartButton}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Ionicons
            name={wishlisted ? 'heart' : 'heart-outline'}
            size={18}
            color={wishlisted ? colors.error : colors.ink}
          />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, gap: 6 },
  imageWrap: {
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  image: { width: '100%', height: '100%' },
  imageFallback: { backgroundColor: colors.surface },
  heartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeRow: { position: 'absolute', left: 8, top: 8, gap: 4 },
  name: { ...typography.bodyMedium, color: colors.ink },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  price: { ...typography.bodyMedium, color: colors.primary },
  mrp: { ...typography.caption, color: colors.muted, textDecorationLine: 'line-through' },
});
