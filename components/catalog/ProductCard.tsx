import { Image } from 'expo-image';
import { Heart } from '@/components/ui/icons';
import { Pressable, Text, View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { IconButton } from '@/components/ui/IconButton';
import { Price } from '@/components/ui/Price';
import type { ProductCardFields } from '@/lib/queries/products';
import { makeStyles, radius, typography, useTheme } from '@/lib/theme';

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
  const { colors } = useTheme();
  const styles = useStyles();
  const image = [...product.product_images].sort((a, b) => a.sort_order - b.sort_order)[0];
  const specs = [product.size, product.finish].filter(Boolean).join(' · ');

  return (
    // The heart is a sibling of the navigate-to-product Pressable, not a
    // descendant: two nested accessibilityRole="button" Pressables render as a
    // <button> inside a <button> on web, which is invalid HTML.
    <View style={styles.card}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={product.name}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <View style={styles.imageWrap}>
          {image ? (
            <Image
              source={{ uri: image.url }}
              style={styles.image}
              contentFit="cover"
              transition={200}
              accessibilityIgnoresInvertColors
            />
          ) : null}
          <View style={styles.badgeRow}>
            {product.is_featured && <Badge label="Featured" tone="featured" />}
            {product.stock_status === 'low_stock' && <Badge label="Low stock" tone="lowStock" />}
            {product.stock_status === 'out_of_stock' && (
              <Badge label="Out of stock" tone="outOfStock" />
            )}
          </View>
        </View>

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={2}>
            {product.name}
          </Text>
          {specs ? (
            <Text style={styles.specs} numberOfLines={1}>
              {specs}
            </Text>
          ) : null}
          <Price price={product.price} mrp={product.mrp} size="sm" />
        </View>
      </Pressable>

      {onToggleWishlist && (
        <IconButton
          tone="overlay"
          size={34}
          onPress={onToggleWishlist}
          accessibilityLabel={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          style={styles.heart}
        >
          <Heart
            size={18}
            weight={wishlisted ? 'fill' : 'regular'}
            color={wishlisted ? colors.accent : colors.text}
          />
        </IconButton>
      )}
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  card: { flex: 1 },
  pressed: { opacity: 0.85 },
  imageWrap: {
    aspectRatio: 4 / 5,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: c.surfaceAlt,
  },
  image: { width: '100%', height: '100%' },
  badgeRow: { position: 'absolute', left: 10, top: 10, gap: 4 },
  heart: { position: 'absolute', top: 10, right: 10 },
  info: { paddingTop: 10, gap: 3 },
  name: { ...typography.bodyMedium, color: c.text },
  specs: { ...typography.caption, color: c.textMuted, textTransform: 'capitalize' },
}));
