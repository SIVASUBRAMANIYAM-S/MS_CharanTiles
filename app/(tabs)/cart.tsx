import { router } from 'expo-router';
import { ArrowRight, ShoppingBag } from '@/components/ui/icons';
import { Fragment, useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { CartLineItem } from '@/components/checkout/CartLineItem';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatRupees } from '@/components/ui/Price';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { type CartLineDetail, getCartLineDetails } from '@/lib/queries/cart';
import { useAuthStore } from '@/lib/store/auth';
import { useCartStore } from '@/lib/store/cart';
import { makeStyles, radius, typography, useTheme } from '@/lib/theme';

export default function CartScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const userId = useAuthStore((state) => state.user?.id);
  const items = useCartStore((state) => state.items);
  const cartHydrated = useCartStore((state) => state.hydrated);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const itemCount = useCartStore((state) => state.totalCount());

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

  if (!loading && lines?.length === 0) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Cart" />
        <EmptyState
          icon={<ShoppingBag size={30} color={colors.accentInk} weight="fill" />}
          title="Your cart is empty"
          body="Browse the catalog and add a tile you like."
          actionLabel="Browse catalog"
          onAction={() => router.push('/catalog')}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ScreenHeader
          title="Cart"
          subtitle={loading ? undefined : `${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
        />
        <View style={styles.list}>
          {loading
            ? Array.from({ length: 2 }).map((_, index) => (
                <Skeleton key={index} width="100%" height={92} borderRadius={radius.md} />
              ))
            : lines?.map((line, index) => (
                <Fragment key={`${line.productId}-${line.variantId ?? 'base'}`}>
                  {index > 0 && <View style={styles.divider} />}
                  <CartLineItem
                    line={line}
                    onIncrement={() =>
                      updateQuantity(userId, line.productId, line.variantId, line.quantity + 1)
                    }
                    onDecrement={() =>
                      updateQuantity(userId, line.productId, line.variantId, line.quantity - 1)
                    }
                    onRemove={() => removeItem(userId, line.productId, line.variantId)}
                  />
                </Fragment>
              ))}
        </View>
      </ScrollView>

      {!loading && (
        <View style={styles.footer}>
          {hasOutOfStock && (
            <Text style={styles.outOfStockNote}>
              Remove out-of-stock items before checking out.
            </Text>
          )}
          <View style={styles.row}>
            <Text style={styles.muted}>Subtotal</Text>
            <Text style={styles.value}>{formatRupees(subtotal)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.muted}>Shipping</Text>
            <Text style={styles.free}>Free</Text>
          </View>
          <View style={[styles.row, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatRupees(subtotal)}</Text>
          </View>
          <Button
            label="Proceed to checkout"
            onPress={() => router.push('/checkout/address')}
            disabled={hasOutOfStock}
            fullWidth
            size="lg"
            icon={(color) => <ArrowRight size={18} color={color} weight="bold" />}
          />
        </View>
      )}
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  container: { flex: 1, backgroundColor: c.bg },
  scroll: { paddingBottom: 24 },
  list: { paddingHorizontal: 16, paddingTop: 12, gap: 18 },
  divider: { height: 1, backgroundColor: c.border },
  footer: {
    padding: 16,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: c.border,
    backgroundColor: c.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  outOfStockNote: { ...typography.caption, color: c.error },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  muted: { ...typography.body, color: c.textMuted },
  value: { ...typography.bodyMedium, color: c.text, fontVariant: ['tabular-nums'] },
  free: { ...typography.bodyMedium, color: c.success },
  totalRow: { paddingTop: 8, marginBottom: 8, borderTopWidth: 1, borderTopColor: c.border },
  totalLabel: { ...typography.h3, color: c.text },
  totalValue: { ...typography.h2, color: c.text, fontVariant: ['tabular-nums'] },
}));
