import { router, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CartLineItem } from '@/components/checkout/CartLineItem';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { type CartLineDetail, getCartLineDetails } from '@/lib/queries/cart';
import { useCartStore } from '@/lib/store/cart';
import { useCheckoutStore } from '@/lib/store/checkout';
import { colors } from '@/lib/theme/colors';
import { typography } from '@/lib/theme/typography';

export default function CheckoutReviewScreen() {
  const items = useCartStore((state) => state.items);
  const address = useCheckoutStore((state) => state.address);
  const [lines, setLines] = useState<CartLineDetail[] | null>(null);

  // Mount-only (empty deps): React Navigation keeps every screen in the stack
  // mounted, not just the top one, so a reactive `[address]` dependency here
  // would also fire when payment.tsx's own copy of this same guard clears the
  // draft address after a successful order — redirecting this still-mounted
  // screen back to /checkout/address and racing the confirmation navigation.
  // Checking once on mount still catches the real case this guards against:
  // landing here directly (e.g. a deep link) without an address.
  useEffect(() => {
    if (!address) {
      router.replace('/checkout/address');
    }
  }, []);

  useEffect(() => {
    if (!address) return;
    getCartLineDetails(items)
      .then(setLines)
      .catch((error: unknown) => {
        console.warn('Failed to load review items', error);
        setLines([]);
      });
  }, [items, address]);

  if (!address) {
    return null;
  }

  if (lines === null) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Skeleton width="100%" height={100} borderRadius={12} />
          <Skeleton width="100%" height={100} borderRadius={12} />
        </View>
      </View>
    );
  }

  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const hasOutOfStock = lines.some((line) => line.stockStatus === 'out_of_stock');

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Stack.Screen options={{ title: 'Review order' }} />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={typography.h3}>Delivery address</Text>
            <Pressable onPress={() => router.push('/checkout/address')} accessibilityRole="button">
              <Text style={styles.changeLink}>Change</Text>
            </Pressable>
          </View>
          <Card>
            <Text style={styles.addressName}>{address.fullName}</Text>
            <Text style={styles.addressLine}>
              {address.line1}
              {address.line2 ? `, ${address.line2}` : ''}
            </Text>
            <Text style={styles.addressLine}>
              {address.city}, {address.state} {address.pincode}
            </Text>
            <Text style={styles.addressLine}>Phone: {address.phone}</Text>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={typography.h3}>Items ({lines.length})</Text>
          <View style={styles.itemsList}>
            {lines.map((line) => (
              <CartLineItem
                key={`${line.productId}-${line.variantId ?? 'base'}`}
                line={line}
                readOnly
              />
            ))}
          </View>
        </View>

        {hasOutOfStock && (
          <Text style={styles.outOfStockNote}>
            One or more items are out of stock. Go back to your cart to remove them before
            continuing.
          </Text>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={typography.body}>Subtotal</Text>
          <Text style={typography.bodyMedium}>₹{subtotal.toFixed(0)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={typography.body}>Shipping</Text>
          <Text style={styles.freeText}>Free</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={typography.h3}>Total</Text>
          <Text style={typography.h3}>₹{subtotal.toFixed(0)}</Text>
        </View>
        <Button
          label="Continue to Payment"
          onPress={() => router.push('/checkout/payment')}
          disabled={hasOutOfStock || lines.length === 0}
          fullWidth
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.stone },
  content: { padding: 16, gap: 24, paddingBottom: 16 },
  section: { gap: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  changeLink: { ...typography.bodyMedium, color: colors.primary },
  addressName: { ...typography.bodyMedium, color: colors.ink },
  addressLine: { ...typography.body, color: colors.muted },
  itemsList: { gap: 16 },
  outOfStockNote: { ...typography.body, color: colors.error },
  footer: {
    padding: 16,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  freeText: { ...typography.bodyMedium, color: colors.success },
});
