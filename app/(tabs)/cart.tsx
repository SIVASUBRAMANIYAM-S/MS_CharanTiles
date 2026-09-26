import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { CartLineItem } from '@/components/checkout/CartLineItem';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { type CartLineDetail, getCartLineDetails } from '@/lib/queries/cart';
import { useAuthStore } from '@/lib/store/auth';
import { useCartStore } from '@/lib/store/cart';
import { colors } from '@/lib/theme/colors';
import { typography } from '@/lib/theme/typography';

export default function CartScreen() {
  const userId = useAuthStore((state) => state.user?.id);
  const items = useCartStore((state) => state.items);
  const cartHydrated = useCartStore((state) => state.hydrated);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const [lines, setLines] = useState<CartLineDetail[] | null>(null);

  useEffect(() => {
    if (!cartHydrated) return;
    getCartLineDetails(items)
      .then(setLines)
      .catch((error: unknown) => {
        console.warn('Failed to load cart details', error);
        setLines([]);
      });
    // items is a new array on every mutation, so this re-fetches whenever the cart changes.
  }, [items, cartHydrated]);

  const loading = !cartHydrated || lines === null;
  const subtotal = (lines ?? []).reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const hasOutOfStock = (lines ?? []).some((line) => line.stockStatus === 'out_of_stock');

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Skeleton width="40%" height={32} />
          <Skeleton width="100%" height={100} borderRadius={12} />
          <Skeleton width="100%" height={100} borderRadius={12} />
        </View>
      </View>
    );
  }

  if (lines && lines.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={typography.h2}>Your cart is empty</Text>
        <Text style={styles.emptySubtitle}>Browse the catalog and add a tile you like.</Text>
        <Button label="Browse Catalog" onPress={() => router.push('/catalog')} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={typography.h1}>Cart</Text>
        {lines?.map((line) => (
          <CartLineItem
            key={`${line.productId}-${line.variantId ?? 'base'}`}
            line={line}
            onIncrement={() =>
              updateQuantity(userId, line.productId, line.variantId, line.quantity + 1)
            }
            onDecrement={() =>
              updateQuantity(userId, line.productId, line.variantId, line.quantity - 1)
            }
            onRemove={() => removeItem(userId, line.productId, line.variantId)}
          />
        ))}
      </ScrollView>

      <View style={styles.footer}>
        {hasOutOfStock && (
          <Text style={styles.outOfStockNote}>
            Remove out-of-stock items above before checking out.
          </Text>
        )}
        <View style={styles.subtotalRow}>
          <Text style={typography.bodyMedium}>Subtotal</Text>
          <Text style={styles.subtotalValue}>₹{subtotal.toFixed(0)}</Text>
        </View>
        <Button
          label="Proceed to Checkout"
          onPress={() => router.push('/checkout/address')}
          disabled={hasOutOfStock}
          fullWidth
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.stone },
  content: { padding: 16, gap: 16, paddingBottom: 16 },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
    backgroundColor: colors.stone,
  },
  emptySubtitle: { ...typography.body, color: colors.muted, textAlign: 'center' },
  footer: {
    padding: 16,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
  outOfStockNote: { ...typography.caption, color: colors.error },
  subtotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subtotalValue: { ...typography.h3, color: colors.ink },
});
