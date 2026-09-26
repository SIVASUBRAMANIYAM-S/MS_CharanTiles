import { router } from 'expo-router';
import { MagnifyingGlass } from '@/components/ui/icons';
import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { CategoryCard } from '@/components/catalog/CategoryCard';
import { CollectionCard } from '@/components/catalog/CollectionCard';
import { IconButton } from '@/components/ui/IconButton';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { type Category, getCategories } from '@/lib/queries/categories';
import { type Collection, getCollections } from '@/lib/queries/collections';
import { makeStyles, radius, useTheme } from '@/lib/theme';

export default function CatalogScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [collections, setCollections] = useState<Collection[] | null>(null);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((error: unknown) => {
        console.warn('Failed to load categories', error);
        setCategories([]);
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
      <ScreenHeader
        title="Catalog"
        subtitle="Every room and collection in one place."
        right={
          <IconButton accessibilityLabel="Search tiles" onPress={() => router.push('/search')}>
            <MagnifyingGlass size={20} color={colors.text} weight="bold" />
          </IconButton>
        }
      />

      <View style={styles.section}>
        <SectionHeader title="Shop by room" />
        <View style={styles.grid}>
          {categories === null
            ? Array.from({ length: 6 }).map((_, index) => (
                <View key={index} style={styles.cell}>
                  <Skeleton width="100%" height={190} borderRadius={radius.lg} />
                </View>
              ))
            : categories.map((category) => (
                <View key={category.id} style={styles.cell}>
                  <CategoryCard
                    name={category.name}
                    imageUrl={category.image_url}
                    onPress={() => router.push(`/category/${category.slug}`)}
                  />
                </View>
              ))}
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Collections" />
        {collections === null ? (
          <Skeleton width="100%" height={220} borderRadius={radius.lg} />
        ) : (
          <View style={styles.list}>
            {collections.map((collection) => (
              <CollectionCard
                key={collection.id}
                name={collection.name}
                description={collection.description}
                imageUrl={collection.hero_image_url}
                onPress={() => router.push(`/collection/${collection.slug}`)}
              />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const useStyles = makeStyles((c) => ({
  container: { flex: 1, backgroundColor: c.bg },
  content: { paddingBottom: 40, gap: 28 },
  section: { paddingHorizontal: 16, gap: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  cell: { width: '48.5%' },
  list: { gap: 24 },
}));
