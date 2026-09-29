import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { CartHeaderButton } from '@/components/catalog/CartHeaderButton';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { getFeaturedProducts, type ProductCardData } from '@/lib/queries/products';
import { makeStyles, typography } from '@/lib/theme';

export default function FeaturedScreen() {
  const styles = useStyles();
  const [products, setProducts] = useState<ProductCardData[] | null>(null);

  useEffect(() => {
    getFeaturedProducts()
      .then(setProducts)
      .catch((error: unknown) => {
        console.warn('Failed to load featured products', error);
        setProducts([]);
      });
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen
        options={{
          title: 'Featured tiles',
          // The page shows its own large title; repeating it in the bar read twice.
          headerTitle: '',
          headerRight: () => <CartHeaderButton />,
        }}
      />
      <View style={styles.intro}>
        <Text style={styles.title}>Featured tiles</Text>
        <Text style={styles.subtitle}>
          {products
            ? `${products.length} tiles our team recommends right now, newest first.`
            : 'Tiles our team recommends right now.'}
        </Text>
      </View>
      <ProductGrid
        products={products}
        skeletonCount={6}
        emptyMessage="No featured tiles at the moment"
      />
    </ScrollView>
  );
}

const useStyles = makeStyles((c) => ({
  container: { flex: 1, backgroundColor: c.bg },
  content: { padding: 16, gap: 20, paddingBottom: 40 },
  intro: { gap: 6 },
  title: { ...typography.h1, color: c.text },
  subtitle: { ...typography.body, color: c.textMuted },
}));
