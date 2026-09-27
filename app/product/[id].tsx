import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { MotiView } from 'moti';
import { CheckCircle, Heart, ShoppingBag, Truck } from '@/components/ui/icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProductGrid } from '@/components/catalog/ProductGrid';
import {
  Highlights,
  QuickFacts,
  SpecTable,
  SuitableForList,
} from '@/components/catalog/ProductSpecs';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconButton } from '@/components/ui/IconButton';
import { Price } from '@/components/ui/Price';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  getProductById,
  getRelatedProducts,
  type ProductCardData,
  type ProductWithDetails,
} from '@/lib/queries/products';
import { useAuthStore } from '@/lib/store/auth';
import { useCartStore } from '@/lib/store/cart';
import { capitalize, formatSize } from '@/lib/specs';
import { useWishlistStore } from '@/lib/store/wishlist';
import { makeStyles, radius, typography, useTheme } from '@/lib/theme';

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useStyles();

  const [product, setProduct] = useState<ProductWithDetails | null | undefined>(undefined);
  const [related, setRelated] = useState<ProductCardData[] | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [addedMessage, setAddedMessage] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const userId = useAuthStore((state) => state.user?.id);
  const isWishlisted = useWishlistStore((state) => state.isWishlisted(product?.id ?? ''));
  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const addToCart = useCartStore((state) => state.addItem);

  useEffect(() => {
    if (!id) return;
    getProductById(id)
      .then(setProduct)
      .catch((error: unknown) => {
        console.warn('Failed to load product', error);
        setProduct(null);
      });
  }, [id]);

  useEffect(() => {
    if (!product?.category_id) return;
    getRelatedProducts(product.category_id, product.id)
      .then(setRelated)
      .catch((error: unknown) => {
        console.warn('Failed to load related products', error);
        setRelated([]);
      });
  }, [product?.category_id, product?.id]);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const selectedVariant = useMemo(
    () => product?.product_variants.find((v) => v.id === selectedVariantId) ?? null,
    [product, selectedVariantId],
  );

  const galleryHeight = Math.min(width * 1.05, 560);

  const handleImageScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setImageIndex(Math.round(event.nativeEvent.contentOffset.x / width));
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(userId, product.id, selectedVariantId);
    setAddedMessage(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setAddedMessage(false), 2600);
  };

  if (product === null) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon={<ShoppingBag size={30} color={colors.accentInk} />}
          title="Product not found"
          body="It may have been removed from the catalog."
          actionLabel="Browse catalog"
          onAction={() => router.replace('/catalog')}
        />
      </View>
    );
  }

  if (product === undefined) {
    return (
      <View style={styles.container}>
        <Skeleton width="100%" height={galleryHeight} borderRadius={0} />
        <View style={styles.loadingBody}>
          <Skeleton width="75%" height={30} />
          <Skeleton width="35%" height={24} />
          <Skeleton width="100%" height={120} borderRadius={radius.lg} />
        </View>
      </View>
    );
  }

  const displayPrice = selectedVariant?.price ?? product.price;
  const displaySize = selectedVariant?.size ?? product.size;
  const displayFinish = selectedVariant?.finish ?? product.finish;
  const outOfStock = product.stock_status === 'out_of_stock';

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: product.name }} />
      <ScrollView contentContainerStyle={{ paddingBottom: 110 + insets.bottom }}>
        <View style={{ height: galleryHeight }}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleImageScroll}
          >
            {product.product_images.map((image) => (
              <Image
                key={image.id}
                source={{ uri: image.url }}
                style={[styles.galleryImage, { width, height: galleryHeight }]}
                contentFit="cover"
                transition={200}
                accessibilityLabel={`${product.name} photo`}
              />
            ))}
          </ScrollView>

          {product.product_images.length > 1 && (
            <View style={styles.dots}>
              {product.product_images.map((image, index) => (
                <View
                  key={image.id}
                  style={[styles.dot, index === imageIndex && styles.dotActive]}
                />
              ))}
            </View>
          )}

          <IconButton
            tone="overlay"
            size={44}
            onPress={() => userId && toggleWishlist(userId, product.id)}
            accessibilityLabel={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            style={styles.heart}
          >
            <Heart
              size={22}
              weight={isWishlisted ? 'fill' : 'regular'}
              color={isWishlisted ? colors.accent : colors.text}
            />
          </IconButton>
        </View>

        <View style={styles.body}>
          <View style={styles.titleBlock}>
            {(product.is_featured || product.stock_status !== 'in_stock') && (
              <View style={styles.badgeRow}>
                {product.is_featured && <Badge label="Featured" tone="featured" />}
                {product.stock_status === 'low_stock' && (
                  <Badge label="Low stock" tone="lowStock" />
                )}
                {outOfStock && <Badge label="Out of stock" tone="outOfStock" />}
              </View>
            )}
            <Text style={styles.name}>{product.name}</Text>
            <Price price={displayPrice} mrp={product.mrp} size="lg" />
          </View>

          <Highlights items={product.highlights} />

          {product.product_variants.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Choose a variant</Text>
              <View style={styles.chipRow}>
                {product.product_variants.map((variant) => (
                  <Chip
                    key={variant.id}
                    label={[formatSize(variant.size), capitalize(variant.finish)]
                      .filter(Boolean)
                      .join(' · ')}
                    selected={selectedVariantId === variant.id}
                    onPress={() =>
                      setSelectedVariantId((current) =>
                        current === variant.id ? null : variant.id,
                      )
                    }
                  />
                ))}
              </View>
            </View>
          )}

          <QuickFacts product={product} size={displaySize} />

          {product.suitable_for.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Suitable for</Text>
              <SuitableForList values={product.suitable_for} />
            </View>
          )}

          {product.description && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>About this tile</Text>
              <Text style={styles.description}>{product.description}</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Specifications</Text>
            <SpecTable product={product} size={displaySize} finish={displayFinish} />
          </View>

          <View style={styles.assurance}>
            <Truck size={20} color={colors.accentInk} />
            <Text style={styles.assuranceText}>Free delivery on every order</Text>
          </View>

          {related && related.length > 0 && (
            <View style={styles.section}>
              <SectionHeader title="More for this room" />
              <ProductGrid products={related} />
            </View>
          )}
        </View>
      </ScrollView>

      {addedMessage && (
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 220 }}
          style={[styles.toast, { bottom: 92 + insets.bottom }]}
        >
          <CheckCircle size={20} color={colors.success} weight="fill" />
          <Text style={styles.toastText}>Added to cart</Text>
          <Pressable onPress={() => router.push('/cart')} accessibilityRole="button" hitSlop={8}>
            <Text style={styles.toastLink}>View cart</Text>
          </Pressable>
        </MotiView>
      )}

      <View style={[styles.actionBar, { paddingBottom: 12 + insets.bottom }]}>
        <View style={styles.actionSecondary}>
          <Button
            label="Enquire"
            variant="outline"
            fullWidth
            onPress={() => router.push({ pathname: '/enquiry', params: { productId: product.id } })}
          />
        </View>
        <View style={styles.actionPrimary}>
          <Button
            label="Add to cart"
            onPress={handleAddToCart}
            fullWidth
            disabled={outOfStock}
            icon={(color) => <ShoppingBag size={18} color={color} weight="bold" />}
          />
        </View>
      </View>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  container: { flex: 1, backgroundColor: c.bg },
  loadingBody: { padding: 16, gap: 14 },
  galleryImage: { backgroundColor: c.surfaceAlt },
  dots: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(247, 245, 240, 0.55)',
  },
  dotActive: { width: 20, backgroundColor: c.accent },
  heart: { position: 'absolute', top: 14, right: 14 },
  body: { padding: 16, gap: 24 },
  titleBlock: { gap: 8 },
  badgeRow: { flexDirection: 'row', gap: 6 },
  name: { ...typography.h1, color: c.text },
  section: { gap: 12 },
  sectionLabel: { ...typography.label, color: c.textMuted },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  description: { ...typography.body, color: c.text, lineHeight: 24 },
  assurance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: c.accentSoft,
  },
  assuranceText: { ...typography.bodyMedium, color: c.text },
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: radius.lg,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  toastText: { ...typography.bodyMedium, color: c.text, flex: 1 },
  toastLink: { ...typography.label, color: c.accentInk },
  actionBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: c.surface,
    borderTopWidth: 1,
    borderTopColor: c.border,
  },
  actionSecondary: { flex: 2 },
  actionPrimary: { flex: 3 },
}));
