import { router, Stack, useLocalSearchParams } from 'expo-router';
import { SquaresFour } from '@/components/ui/icons';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { FilterSheet, type FilterSheetHandle } from '@/components/catalog/FilterSheet';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { SortFilterBar } from '@/components/catalog/SortFilterBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { type Category, getCategoryBySlug } from '@/lib/queries/categories';
import {
  getCategoryFilterOptions,
  getProductsByCategory,
  type ProductCardData,
  type ProductFilters,
} from '@/lib/queries/products';
import { makeStyles, typography, useTheme } from '@/lib/theme';

export default function CategoryScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { colors } = useTheme();
  const styles = useStyles();
  const sheetRef = useRef<FilterSheetHandle>(null);

  const [category, setCategory] = useState<Category | null | undefined>(undefined);
  const [products, setProducts] = useState<ProductCardData[] | null>(null);
  const [filterOptions, setFilterOptions] = useState({
    finishes: [] as string[],
    sizes: [] as string[],
    colors: [] as string[],
  });
  const [filters, setFilters] = useState<ProductFilters>({ sort: 'featured' });

  useEffect(() => {
    if (!slug) return;
    getCategoryBySlug(slug)
      .then(setCategory)
      .catch((error: unknown) => {
        console.warn('Failed to load category', error);
        setCategory(null);
      });
  }, [slug]);

  useEffect(() => {
    if (!category) return;
    getCategoryFilterOptions(category.id)
      .then(setFilterOptions)
      .catch((error: unknown) => console.warn('Failed to load filter options', error));
  }, [category]);

  useEffect(() => {
    if (!category) return;
    setProducts(null);
    getProductsByCategory(category.id, filters)
      .then(setProducts)
      .catch((error: unknown) => {
        console.warn('Failed to load products', error);
        setProducts([]);
      });
  }, [category, filters]);

  if (category === null) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon={<SquaresFour size={30} color={colors.accentInk} />}
          title="Room not found"
          actionLabel="Browse catalog"
          onAction={() => router.replace('/catalog')}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: category?.name ?? '' }} />
      <ScrollView contentContainerStyle={styles.content} stickyHeaderIndices={[1]}>
        <View style={styles.header}>
          <Text style={styles.title}>{category?.name ?? ' '}</Text>
          <Text style={styles.count}>
            {products ? `${products.length} ${products.length === 1 ? 'tile' : 'tiles'}` : ' '}
          </Text>
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
  header: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 12, gap: 2 },
  title: { ...typography.h1, color: c.text },
  count: { ...typography.body, color: c.textMuted },
  sticky: { backgroundColor: c.bg, paddingVertical: 10 },
  grid: { paddingHorizontal: 16, paddingTop: 8 },
}));
