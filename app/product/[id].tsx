import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { ProductGrid } from '@/components/catalog/ProductGrid';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  getProductById,
  getRelatedProducts,
  type ProductCardData,
  type ProductWithDetails,
} from '@/lib/queries/products';
import { useAuthStore } from '@/lib/store/auth';
import { useCartStore } from '@/lib/store/cart';
import { useWishlistStore } from '@/lib/store/wishlist';
import { colors } from '@/lib/theme/colors';
import { typography } from '@/lib/theme/typography';

const SPEC_ROWS: { key: keyof ProductWithDetails; label: string }[] = [
  { key: 'material', label: 'Material' },
  { key: 'finish', label: 'Finish' },
  { key: 'size', label: 'Size' },
  { key: 'color', label: 'Color' },
];

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();

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

  const displayPrice = selectedVariant?.price ?? product?.price ?? 0;
  const displaySize = selectedVariant?.size ?? product?.size;
  const displayFinish = selectedVariant?.finish ?? product?.finish;

  const handleImageScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setImageIndex(index);
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product.id, selectedVariantId);
    setAddedMessage(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setAddedMessage(false), 1800);
  };

  if (product === null) {
    return (
      <View style={styles.centered}>
        <Text style={typography.body}>Product not found.</Text>
      </View>
    );
  }

  if (product === undefined) {
    return (
      <View style={styles.container}>
        <Skeleton width="100%" height={360} borderRadius={0} />
        <View style={styles.loadingBody}>
          <Skeleton width="70%" height={28} />
          <Skeleton width="40%" height={20} />
        </View>
      </View>
    );
  }

  const hasDiscount = product.mrp !== null && product.mrp > product.price;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: product.name }} />
      <ScrollView contentContainerStyle={styles.content}>
        <View>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleImageScroll}
          >
            {product.product_images.length > 0 ? (
              product.product_images.map((image) => (
                <Image
                  key={image.id}
                  source={{ uri: image.url }}
                  style={[styles.galleryImage, { width }]}
                  contentFit="cover"
                />
              ))
            ) : (
              <View style={[styles.imageFallback, styles.galleryImage, { width }]} />
            )}
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

          <Pressable
            onPress={() => userId && toggleWishlist(userId, product.id)}
            style={styles.heartButton}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Ionicons
              name={isWishlisted ? 'heart' : 'heart-outline'}
              size={22}
              color={isWishlisted ? colors.error : colors.ink}
            />
          </Pressable>
        </View>

        <View style={styles.body}>
          <View style={styles.badgeRow}>
            {product.is_featured && <Badge label="Featured" tone="featured" />}
            {product.stock_status === 'low_stock' && <Badge label="Low stock" tone="lowStock" />}
            {product.stock_status === 'out_of_stock' && (
              <Badge label="Out of stock" tone="outOfStock" />
            )}
          </View>

          <Text style={typography.h1}>{product.name}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{displayPrice.toFixed(0)}</Text>
            {hasDiscount && <Text style={styles.mrp}>₹{product.mrp!.toFixed(0)}</Text>}
          </View>

          {product.product_variants.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Variants</Text>
              <View style={styles.chipRow}>
                {product.product_variants.map((variant) => (
                  <Chip
                    key={variant.id}
                    label={[variant.size, variant.finish].filter(Boolean).join(' · ')}
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

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Specifications</Text>
            {SPEC_ROWS.map(({ key, label }) => {
              const value =
                key === 'size' ? displaySize : key === 'finish' ? displayFinish : product[key];
              if (!value) return null;
              return (
                <View key={key} style={styles.specRow}>
                  <Text style={styles.specLabel}>{label}</Text>
                  <Text style={styles.specValue}>{String(value)}</Text>
                </View>
              );
            })}
          </View>

          {product.description && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Description</Text>
              <Text style={styles.description}>{product.description}</Text>
            </View>
          )}

          <View style={styles.actions}>
            <Button
              label="Add to Cart"
              onPress={handleAddToCart}
              fullWidth
              disabled={product.stock_status === 'out_of_stock'}
            />
            <Button
              label="Enquire Now"
              variant="outline"
              fullWidth
              onPress={() =>
                router.push({ pathname: '/enquiry', params: { productId: product.id } })
              }
            />
          </View>

          {addedMessage && (
            <View style={styles.toast}>
              <Text style={styles.toastText}>Added to cart</Text>
            </View>
          )}

          {related && related.length > 0 && (
            <View style={styles.section}>
              <Text style={typography.h2}>Related Products</Text>
              <ProductGrid products={related} />
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { paddingBottom: 32 },
  loadingBody: { padding: 16, gap: 12 },
  galleryImage: { height: 360 },
  imageFallback: { backgroundColor: colors.surface },
  dots: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.white, opacity: 0.5 },
  dotActive: { opacity: 1 },
  heartButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { padding: 16, gap: 16 },
  badgeRow: { flexDirection: 'row', gap: 6 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 10 },
  price: { ...typography.h2, color: colors.primary },
  mrp: { ...typography.body, color: colors.muted, textDecorationLine: 'line-through' },
  section: { gap: 10 },
  sectionLabel: { ...typography.bodyMedium, color: colors.ink },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  specLabel: { ...typography.body, color: colors.muted },
  specValue: { ...typography.bodyMedium, color: colors.ink },
  description: { ...typography.body, color: colors.ink },
  actions: { gap: 12 },
  toast: {
    backgroundColor: colors.ink,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'center',
  },
  toastText: { ...typography.bodyMedium, color: colors.white },
});
