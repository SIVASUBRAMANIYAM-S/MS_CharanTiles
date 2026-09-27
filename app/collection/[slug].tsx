import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { SquaresFour } from '@/components/ui/icons';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { CartHeaderButton } from '@/components/catalog/CartHeaderButton';
import { FilterSheet, type FilterSheetHandle } from '@/components/catalog/FilterSheet';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { SortFilterBar } from '@/components/catalog/SortFilterBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { type Collection, getCollectionBySlug } from '@/lib/queries/collections';
import {
  getCollectionFilterOptions,
  getProductsByCollection,
  type ProductCardData,
  type ProductFilters,
} from '@/lib/queries/products';
import { makeStyles, radius, typography, useTheme } from '@/lib/theme';

export default function CollectionScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { colors } = useTheme();
  const styles = useStyles();
  const sheetRef = useRef<FilterSheetHandle>(null);

  const [collection, setCollection] = useState<Collection | null | undefined>(undefined);
  const [products, setProducts] = useState<ProductCardData[] | null>(null);
  const [filterOptions, setFilterOptions] = useState({
    finishes: [] as string[],
    sizes: [] as string[],
    colors: [] as string[],
  });
  const [filters, setFilters] = useState<ProductFilters>({ sort: 'featured' });

  useEffect(() => {
    if (!slug) return;
    getCollectionBySlug(slug)
      .then(setCollection)
      .catch((error: unknown) => {
        console.warn('Failed to load collection', error);
        setCollection(null);
      });
  }, [slug]);

  useEffect(() => {
    if (!collection) return;
    getCollectionFilterOptions(collection.id)
      .then(setFilterOptions)
      .catch((error: unknown) => console.warn('Failed to load filter options', error));
  }, [collection]);

  useEffect(() => {
    if (!collection) return;
    setProducts(null);
    getProductsByCollection(collection.id, filters)
      .then(setProducts)
      .catch((error: unknown) => {
        console.warn('Failed to load products', error);
        setProducts([]);
      });
  }, [collection, filters]);

  if (collection === null) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon={<SquaresFour size={30} color={colors.accentInk} />}
          title="Collection not found"
          actionLabel="Browse catalog"
          onAction={() => router.replace('/catalog')}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{ title: collection?.name ?? '', headerRight: () => <CartHeaderButton /> }}
      />
      <ScrollView contentContainerStyle={styles.content} stickyHeaderIndices={[1]}>
        <View style={styles.heroWrap}>
          {collection ? (
            <View style={styles.hero}>
              {collection.hero_image_url ? (
                <Image
                  source={{ uri: collection.hero_image_url }}
                  style={styles.fill}
                  contentFit="cover"
                  transition={250}
                  accessibilityIgnoresInvertColors
                />
              ) : null}
              <LinearGradient
                colors={['rgba(8, 9, 11, 0)', 'rgba(8, 9, 11, 0.82)']}
                start={{ x: 0, y: 0.3 }}
                end={{ x: 0, y: 1 }}
                style={styles.fill}
              />
              <View style={styles.heroText}>
                <Text style={styles.heroTitle}>{collection.name}</Text>
                {collection.description ? (
                  <Text style={styles.heroBody}>{collection.description}</Text>
                ) : null}
              </View>
            </View>
          ) : (
            <Skeleton width="100%" height={240} borderRadius={radius.xl} />
          )}
        </View>
        <View style={styles.sticky}>
          <SortFilterBar
            filters={filters}
            onSortChange={(sort) => setFilters((prev) => ({ ...prev, sort }))}
            onOpenFilters={() => sheetRef.current?.present()}
          />
        </View>
        <View style={styles.grid}>
          <ProductGrid products={products} emptyMessage="No tiles match these filters" />
        </View>
      </ScrollView>

      <FilterSheet
        ref={sheetRef}
        finishOptions={filterOptions.finishes}
        sizeOptions={filterOptions.sizes}
        colorOptions={filterOptions.colors}
        value={filters}
        onApply={setFilters}
      />
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  container: { flex: 1, backgroundColor: c.bg },
  content: { paddingBottom: 40 },
  heroWrap: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 8 },
  hero: {
    aspectRatio: 4 / 3,
    maxHeight: 320,
    borderRadius: radius.xl,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    backgroundColor: c.surfaceAlt,
  },
  fill: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  heroText: { padding: 20, gap: 6 },
  heroTitle: { ...typography.display, color: c.onImage },
  heroBody: { ...typography.body, color: c.onImage, opacity: 0.85 },
  sticky: { backgroundColor: c.bg, paddingVertical: 10 },
  grid: { paddingHorizontal: 16, paddingTop: 8 },
}));
