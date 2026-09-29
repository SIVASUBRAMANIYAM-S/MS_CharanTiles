import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Camera, CaretRight, MagnifyingGlass } from '@/components/ui/icons';
import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CategoryCard } from '@/components/catalog/CategoryCard';
import { CollectionCard } from '@/components/catalog/CollectionCard';
import { FeaturedSpotlight } from '@/components/catalog/FeaturedSpotlight';
import { ProductCard } from '@/components/catalog/ProductCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { IconButton } from '@/components/ui/IconButton';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { type Category, getCategories, sortCategoriesForHome } from '@/lib/queries/categories';
import { type Collection, getCollections } from '@/lib/queries/collections';
import { getFeaturedProducts, type ProductCardData } from '@/lib/queries/products';
import { useAuthStore } from '@/lib/store/auth';
import { useWishlistStore } from '@/lib/store/wishlist';
import { makeStyles, radius, typography, useTheme } from '@/lib/theme';

// Marketing chrome, not DB-driven: the blue marble bathroom from the Ocean Mist listing.
const HERO_IMAGE =
  'https://images.unsplash.com/photo-1701251786408-d0320ecaad8d?w=1200&q=80&fm=jpg&fit=crop&auto=format';

// The rest live on the "See all" featured screen.
const FEATURED_ROW_LIMIT = 8;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useStyles();
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [featured, setFeatured] = useState<ProductCardData[] | null>(null);
  const [collections, setCollections] = useState<Collection[] | null>(null);

  const userId = useAuthStore((state) => state.user?.id);
  // Subscribe to productIds itself (see ProductGrid for why selecting the
  // isWishlisted function doesn't re-render this list on toggle).
  const wishlistIds = useWishlistStore((state) => state.productIds);
  const toggleWishlist = useWishlistStore((state) => state.toggle);

  useEffect(() => {
    getCategories()
      .then((data) => setCategories(sortCategoriesForHome(data)))
      .catch((error: unknown) => {
        console.warn('Failed to load categories', error);
        setCategories([]);
      });
    getFeaturedProducts()
      .then(setFeatured)
      .catch((error: unknown) => {
        console.warn('Failed to load featured products', error);
        setFeatured([]);
      });
    getCollections()
      .then(setCollections)
      .catch((error: unknown) => {
        console.warn('Failed to load collections', error);
        setCollections([]);
      });
  }, []);

  const [spotlight, ...rest] = featured ?? [];
  const featuredRow = rest.slice(0, FEATURED_ROW_LIMIT);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
        <View>
          <Text style={styles.brand}>Charan Tiles</Text>
          <Text style={styles.brandSub}>Tiles and surfaces</Text>
        </View>
        <IconButton accessibilityLabel="Search tiles" onPress={() => router.push('/search')}>
          <MagnifyingGlass size={20} color={colors.text} weight="bold" />
        </IconButton>
      </View>

      <View style={styles.hero}>
        <Image
          source={{ uri: HERO_IMAGE }}
          style={styles.fill}
          contentFit="cover"
          transition={300}
          accessibilityIgnoresInvertColors
        />
        <LinearGradient
          colors={['rgba(8, 9, 11, 0.05)', 'rgba(8, 9, 11, 0.85)']}
          start={{ x: 0, y: 0.25 }}
          end={{ x: 0, y: 1 }}
          style={styles.fill}
        />
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Tiles for every room</Text>
          <Text style={styles.heroBody}>
            Porcelain, vitrified and ceramic tiles, chosen for how they look in a real home.
          </Text>
          <Button label="Browse catalog" onPress={() => router.push('/catalog')} />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.padded}>
          <SectionHeader
            title="Shop by room"
            actionLabel="See all"
            onAction={() => router.push('/catalog')}
          />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hRow}
        >
          {categories === null
            ? Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} width={132} height={165} borderRadius={radius.lg} />
              ))
            : categories.map((category) => (
                <View key={category.id} style={styles.categoryItem}>
                  <CategoryCard
                    name={category.name.replace(/ Tiles$/, '')}
                    imageUrl={category.image_url}
                    onPress={() => router.push(`/category/${category.slug}`)}
                  />
                </View>
              ))}
        </ScrollView>
      </View>

      <View style={styles.padded}>
        <Card
          variant="accent"
          onPress={() => router.push('/find-tile')}
          accessibilityLabel="Find a tile from a photo"
        >
          <View style={styles.promoRow}>
            <View style={styles.promoIcon}>
              <Camera size={22} color={colors.onAccent} weight="fill" />
            </View>
            <View style={styles.promoText}>
              <Text style={styles.promoTitle}>Find a tile from a photo</Text>
              <Text style={styles.promoBody}>Snap any surface and see our closest matches.</Text>
            </View>
            <CaretRight size={18} color={colors.accentInk} weight="bold" />
          </View>
        </Card>
      </View>

      <View style={styles.section}>
        <View style={styles.padded}>
          <SectionHeader
            title="Featured tiles"
            actionLabel="See all"
            onAction={() => router.push('/featured')}
          />
        </View>
        <View style={styles.padded}>
          {featured === null ? (
            <Skeleton width="100%" height={380} borderRadius={radius.xl} />
          ) : spotlight ? (
            <FeaturedSpotlight
              product={spotlight}
              onPress={() => router.push(`/product/${spotlight.id}`)}
              wishlisted={wishlistIds.includes(spotlight.id)}
              onToggleWishlist={userId ? () => toggleWishlist(userId, spotlight.id) : undefined}
            />
          ) : null}
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hRow}
        >
          {featured === null
            ? Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} width={168} height={250} borderRadius={radius.lg} />
              ))
            : featuredRow.map((product) => (
                <View key={product.id} style={styles.productItem}>
                  <ProductCard
                    product={product}
                    onPress={() => router.push(`/product/${product.id}`)}
                    wishlisted={wishlistIds.includes(product.id)}
                    onToggleWishlist={userId ? () => toggleWishlist(userId, product.id) : undefined}
                  />
                </View>
              ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <View style={styles.padded}>
          <SectionHeader title="Collections" />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hRow}
        >
          {collections === null
            ? Array.from({ length: 2 }).map((_, index) => (
                <Skeleton key={index} width={260} height={173} borderRadius={radius.lg} />
              ))
            : collections.map((collection) => (
                <CollectionCard
                  key={collection.id}
                  name={collection.name}
                  description={collection.description}
                  imageUrl={collection.hero_image_url}
                  onPress={() => router.push(`/collection/${collection.slug}`)}
                  width={260}
                />
              ))}
        </ScrollView>
      </View>

      {/* Standalone enquiry entry point: the only other way in is a product page. */}
      <View style={styles.padded}>
        <Card>
          <Text style={styles.enquiryTitle}>Planning a project?</Text>
          <Text style={styles.enquiryBody}>
            Tell us about your space and our team will help you choose the right tiles.
          </Text>
          <Button
            label="Send an enquiry"
            variant="outline"
            onPress={() => router.push('/enquiry')}
          />
        </Card>
      </View>
    </ScrollView>
  );
}

const useStyles = makeStyles((c) => ({
  container: { flex: 1, backgroundColor: c.bg },
  content: { paddingBottom: 40, gap: 32 },
  padded: { paddingHorizontal: 16 },
  fill: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  topBar: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: -16,
  },
  brand: { ...typography.h2, color: c.text },
  brandSub: { ...typography.caption, color: c.accentInk },
  hero: {
    marginHorizontal: 16,
    aspectRatio: 4 / 5,
    maxHeight: 520,
    borderRadius: radius.xl,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    backgroundColor: c.surfaceAlt,
  },
  heroContent: { padding: 22, gap: 10, alignItems: 'flex-start' },
  heroTitle: { ...typography.display, color: c.onImage },
  heroBody: { ...typography.body, color: c.onImage, opacity: 0.85, marginBottom: 6, maxWidth: 320 },
  section: { gap: 14 },
  hRow: { paddingHorizontal: 16, gap: 12 },
  categoryItem: { width: 132 },
  productItem: { width: 168 },
  promoRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  promoIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: c.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoText: { flex: 1, gap: 2 },
  promoTitle: { ...typography.h3, color: c.text },
  promoBody: { ...typography.body, fontSize: 14, lineHeight: 20, color: c.textMuted },
  enquiryTitle: { ...typography.h3, color: c.text },
  enquiryBody: { ...typography.body, color: c.textMuted, marginTop: 4, marginBottom: 16 },
}));
