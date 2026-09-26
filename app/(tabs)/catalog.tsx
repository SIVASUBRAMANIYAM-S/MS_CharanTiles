import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { CategoryCard } from '@/components/catalog/CategoryCard';
import { CollectionCard } from '@/components/catalog/CollectionCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { type Category, getCategories } from '@/lib/queries/categories';
import { type Collection, getCollections } from '@/lib/queries/collections';
import { colors } from '@/lib/theme/colors';
import { typography } from '@/lib/theme/typography';

export default function CatalogScreen() {
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
      <Text style={typography.h1}>Catalog</Text>

      <View style={styles.section}>
        <Text style={typography.h2}>Categories</Text>
        {categories === null ? (
          <View style={styles.list}>
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} width="100%" height={140} borderRadius={16} />
            ))}
          </View>
        ) : (
          <View style={styles.list}>
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                name={category.name}
                imageUrl={category.image_url}
                size="lg"
                onPress={() => router.push(`/category/${category.slug}`)}
              />
            ))}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={typography.h2}>Collections</Text>
        {collections === null ? (
          <View style={styles.list}>
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} width="100%" height={140} borderRadius={16} />
            ))}
          </View>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.stone },
  content: { padding: 16, gap: 24, paddingBottom: 32 },
  section: { gap: 12 },
  list: { gap: 12 },
});
