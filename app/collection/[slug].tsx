import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FilterSheet, type FilterSheetHandle } from '@/components/catalog/FilterSheet';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { Chip } from '@/components/ui/Chip';
import { type Collection, getCollectionBySlug } from '@/lib/queries/collections';
import {
  getCollectionFilterOptions,
  getProductsByCollection,
  type ProductCardData,
  type ProductFilters,
  type SortOrder,
} from '@/lib/queries/products';
import { colors } from '@/lib/theme/colors';
import { typography } from '@/lib/theme/typography';

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

export default function CollectionScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
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

  const activeFilterCount =
    (filters.finish?.length ?? 0) +
    (filters.size?.length ?? 0) +
    (filters.color?.length ?? 0) +
    (filters.minPrice !== undefined ? 1 : 0) +
    (filters.maxPrice !== undefined ? 1 : 0);

  if (collection === null) {
    return (
      <View style={styles.centered}>
        <Text style={typography.body}>Collection not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: collection?.name ?? 'Collection' }} />

      <ScrollView contentContainerStyle={styles.content}>
        {collection?.hero_image_url && (
          <Image
            source={{ uri: collection.hero_image_url }}
            style={styles.hero}
            contentFit="cover"
          />
        )}
        {collection && (
          <View style={styles.header}>
            <Text style={typography.h1}>{collection.name}</Text>
            {collection.description && (
              <Text style={styles.description}>{collection.description}</Text>
            )}
          </View>
        )}

        <View style={styles.toolbar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortScroll}>
            <View style={styles.sortRow}>
              {SORT_OPTIONS.map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  selected={filters.sort === option.value}
                  onPress={() => setFilters((prev) => ({ ...prev, sort: option.value }))}
                />
              ))}
            </View>
          </ScrollView>
          <Pressable
            onPress={() => sheetRef.current?.present()}
            style={styles.filterButton}
            accessibilityRole="button"
            accessibilityLabel="Filters"
          >
            <Ionicons name="options-outline" size={20} color={colors.ink} />
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </Pressable>
        </View>

        <View style={styles.grid}>
          <ProductGrid
            products={products}
            emptyMessage="No tiles match your filters. Try resetting them."
          />
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.stone },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { paddingBottom: 32 },
  hero: { width: '100%', aspectRatio: 2, backgroundColor: colors.surface },
  header: { padding: 16, gap: 8 },
  description: { ...typography.body, color: colors.muted },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sortScroll: { flex: 1 },
  sortRow: { flexDirection: 'row', gap: 8 },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 3,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: { color: colors.white, fontSize: 11, fontWeight: '600' },
  grid: { paddingHorizontal: 16 },
});
