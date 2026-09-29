import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { ArrowRight, Check, Heart } from '@/components/ui/icons';
import { IconButton } from '@/components/ui/IconButton';
import { Price } from '@/components/ui/Price';
import type { ProductCardData } from '@/lib/queries/products';
import { sizedImageUrl } from '@/lib/image';
import { capitalize, formatSize } from '@/lib/specs';
import { makeStyles, radius, typography, useTheme } from '@/lib/theme';

type FeaturedSpotlightProps = {
  product: ProductCardData;
  onPress: () => void;
  wishlisted?: boolean;
  onToggleWishlist?: () => void;
};

/** The lead featured tile on Home: a large photo plus the details a buyer checks first. */
export function FeaturedSpotlight({
  product,
  onPress,
  wishlisted = false,
  onToggleWishlist,
}: FeaturedSpotlightProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const image = [...product.product_images].sort((a, b) => a.sort_order - b.sort_order)[0];
  // Capitalise words individually: a text-transform on the whole line would print "Mm".
  const specs = [formatSize(product.size), capitalize(product.finish), capitalize(product.material)]
    .filter(Boolean)
    .join(' · ');

  return (
    // Heart is a sibling of the navigate Pressable so web never nests <button>s.
    <View style={styles.card}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${product.name}, spotlight tile`}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <View style={styles.imageWrap}>
          {image ? (
            <Image
              source={{ uri: sizedImageUrl(image.url, 430) }}
              style={styles.image}
              contentFit="cover"
              transition={250}
              accessibilityIgnoresInvertColors
            />
          ) : null}
          <View style={styles.badge}>
            <Badge label="Spotlight" tone="featured" />
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.name}>{product.name}</Text>
          {specs ? <Text style={styles.specs}>{specs}</Text> : null}
          {product.highlights.slice(0, 2).map((highlight) => (
            <View key={highlight} style={styles.highlight}>
              <Check size={14} color={colors.accentInk} weight="bold" />
              <Text style={styles.highlightText}>{highlight}</Text>
            </View>
          ))}
          <View style={styles.footer}>
            <Price price={product.price} mrp={product.mrp} />
            {/* A label, not a Button: the whole card is already the press target. */}
            <View style={styles.cta}>
              <Text style={styles.ctaText}>View tile</Text>
              <ArrowRight size={16} color={colors.onAccent} weight="bold" />
            </View>
          </View>
        </View>
      </Pressable>

      {onToggleWishlist && (
        <IconButton
          tone="overlay"
          size={40}
          onPress={onToggleWishlist}
          accessibilityLabel={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          style={styles.heart}
        >
          <Heart
            size={20}
            weight={wishlisted ? 'fill' : 'regular'}
            color={wishlisted ? colors.accent : colors.text}
          />
        </IconButton>
      )}
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  card: {
    backgroundColor: c.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: c.border,
    overflow: 'hidden',
  },
  pressed: { opacity: 0.9 },
  imageWrap: { aspectRatio: 16 / 11, backgroundColor: c.surfaceAlt },
  image: { width: '100%', height: '100%' },
  badge: { position: 'absolute', top: 14, left: 14 },
  heart: { position: 'absolute', top: 14, right: 14 },
  body: { padding: 18, gap: 8 },
  name: { ...typography.h2, color: c.text },
  specs: { ...typography.caption, color: c.textMuted },
  highlight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  highlightText: { ...typography.body, fontSize: 14, color: c.text, flex: 1 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    backgroundColor: c.accent,
  },
  ctaText: { ...typography.label, color: c.onAccent },
}));
