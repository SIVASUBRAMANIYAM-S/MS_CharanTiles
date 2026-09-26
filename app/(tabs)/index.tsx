import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { CategoryCard } from '@/components/catalog/CategoryCard';
import { CollectionCard } from '@/components/catalog/CollectionCard';
import { ProductCard } from '@/components/catalog/ProductCard';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { type Category, getCategories } from '@/lib/queries/categories';
import { type Collection, getCollections } from '@/lib/queries/collections';
import { getFeaturedProducts, type ProductCardData } from '@/lib/queries/products';
import { useAuthStore } from '@/lib/store/auth';
import { useWishlistStore } from '@/lib/store/wishlist';
import { colors } from '@/lib/theme/colors';
import { typography } from '@/lib/theme/typography';

export default function HomeScreen() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [featured, setFeatured] = useState<ProductCardData[] | null>(null);
  const [collections, setCollections] = useState<Collection[] | null>(null);

  const userId = useAuthStore((state) => state.user?.id);
  const isWishlisted = useWishlistStore((state) => state.isWishlisted);
  const toggleWishlist = useWishlistStore((state) => state.toggle);

  useEffect(() => {
    getCategories()
      .then(setCategories)
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <LinearGradient
        colors={[colors.navy, colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <Text style={styles.heroTitle}>MS Charan Tiles</Text>
        <Text style={styles.heroSubtitle}>Creating Values — for every space you build</Text>
        <Button
          label="Browse Catalog"
          variant="secondary"
          onPress={() => router.push('/catalog')}
        />
      </LinearGradient>

      <Section title="Shop by Application">
        {categories === null ? (
          <View style={styles.categoryGrid}>
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} width="47%" height={100} borderRadius={16} />
            ))}
          </View>
        ) : (
          <View style={styles.categoryGrid}>
            {categories.map((category) => (
              <View key={category.id} style={styles.categoryGridItem}>
                <CategoryCard
                  name={category.name}
                  imageUrl={category.image_url}
                  onPress={() => router.push(`/category/${category.slug}`)}
                />
              </View>
            ))}
          </View>
        )}
      </Section>

      <Section title="Featured Tiles">
        {featured === null ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} width={150} height={200} borderRadius={12} />
            ))}
          </ScrollView>
        ) : featured.length === 0 ? (
          <Text style={styles.emptyText}>No featured tiles yet.</Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hScrollContent}
          >
            {featured.map((product) => (
              <View key={product.id} style={styles.productCardWrap}>
                <ProductCard
                  product={product}
                  onPress={() => router.push(`/product/${product.id}`)}
                  wishlisted={isWishlisted(product.id)}
                  onToggleWishlist={userId ? () => toggleWishlist(userId, product.id) : undefined}
                />
              </View>
            ))}
          </ScrollView>
        )}
      </Section>

      <Section title="Collections">
        {collections === null ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} width={240} height={140} borderRadius={16} />
            ))}
          </ScrollView>
        ) : collections.length === 0 ? (
          <Text style={styles.emptyText}>No collections yet.</Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hScrollContent}
          >
            {collections.map((collection) => (
              <CollectionCard
                key={collection.id}
                name={collection.name}
                description={collection.description}
                imageUrl={collection.hero_image_url}
                onPress={() => router.push(`/collection/${collection.slug}`)}
                width={240}
              />
            ))}
          </ScrollView>
        )}
      </Section>

      {/* Standalone enquiry entry point: the only other way in is a product page. */}
      <View style={styles.enquiryBand}>
        <Text style={typography.h3}>Planning a project?</Text>
        <Text style={styles.enquiryBody}>
          Tell us about your space and our team will help you choose the right tiles.
        </Text>
        <Button label="Send an enquiry" onPress={() => router.push('/enquiry')} />
      </View>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={typography.h2}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.stone },
  content: { paddingBottom: 32, gap: 28 },
  hero: { padding: 24, gap: 12, alignItems: 'flex-start' },
  heroTitle: { ...typography.h1, color: colors.white },
  heroSubtitle: { ...typography.body, color: colors.white, opacity: 0.9, marginBottom: 8 },
  section: { paddingHorizontal: 16, gap: 12 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  categoryGridItem: { width: '47%' },
  hScroll: { flexGrow: 0 },
  hScrollContent: { gap: 12, paddingRight: 16 },
  productCardWrap: { width: 150 },
  emptyText: { ...typography.body, color: colors.muted },
  enquiryBand: {
    marginHorizontal: 16,
    padding: 20,
    gap: 8,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'flex-start',
  },
  enquiryBody: { ...typography.body, color: colors.muted, marginBottom: 8 },
});
