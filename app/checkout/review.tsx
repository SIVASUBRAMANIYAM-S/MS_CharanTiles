import { router, Stack } from 'expo-router';
import { ArrowRight, MapPin, Truck } from '@/components/ui/icons';
import { Fragment, useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CartLineItem } from '@/components/checkout/CartLineItem';
import { CheckoutSteps } from '@/components/checkout/CheckoutSteps';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatRupees } from '@/components/ui/Price';
import { Skeleton } from '@/components/ui/Skeleton';
import { type CartLineDetail, getCartLineDetails } from '@/lib/queries/cart';
import { useCartStore } from '@/lib/store/cart';
import { useCheckoutStore } from '@/lib/store/checkout';
import { makeStyles, radius, typography, useTheme } from '@/lib/theme';

export default function CheckoutReviewScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useStyles();
  const items = useCartStore((state) => state.items);
  const address = useCheckoutStore((state) => state.address);
  const [lines, setLines] = useState<CartLineDetail[] | null>(null);

  // Mount-only (empty deps): React Navigation keeps every screen in the stack
  // mounted, not just the top one, so a reactive `[address]` dependency here
  // would also fire when the confirmation screen clears the draft address after
  // a successful order, redirecting this still-mounted screen back to
  // /checkout/address and racing the confirmation navigation. Checking once on
  // mount still catches the real case this guards against: landing here
  // directly (e.g. a deep link) without an address.
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

  const subtotal = (lines ?? []).reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const hasOutOfStock = (lines ?? []).some((line) => line.stockStatus === 'out_of_stock');

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Checkout' }} />
      <ScrollView contentContainerStyle={styles.content}>
        <CheckoutSteps current={1} />
        <Text style={styles.title}>Review your order</Text>

        <Card>
          <View style={styles.cardHeader}>
            <View style={styles.iconBadge}>
              <MapPin size={18} color={colors.accentInk} weight="fill" />
            </View>
            <Text style={styles.cardTitle}>Delivering to</Text>
            <Pressable
              onPress={() => router.push('/checkout/address')}
              accessibilityRole="button"
              hitSlop={8}
            >
              <Text style={styles.link}>Change</Text>
            </Pressable>
          </View>
          <Text style={styles.addressName}>{address.fullName}</Text>
          <Text style={styles.addressLine}>
            {address.line1}
            {address.line2 ? `, ${address.line2}` : ''}
          </Text>
          <Text style={styles.addressLine}>
            {address.city}, {address.state} {address.pincode}
          </Text>
          <Text style={styles.addressLine}>+91 {address.phone}</Text>
        </Card>

        <Card>
          <Text style={[styles.cardTitle, styles.itemsTitle]}>
            {lines ? `${lines.length} ${lines.length === 1 ? 'item' : 'items'}` : 'Items'}
          </Text>
          {lines === null ? (
            <View style={styles.itemsList}>
              <Skeleton width="100%" height={92} borderRadius={radius.md} />
            </View>
          ) : (
            <View style={styles.itemsList}>
              {lines.map((line, index) => (
                <Fragment key={`${line.productId}-${line.variantId ?? 'base'}`}>
                  {index > 0 && <View style={styles.divider} />}
                  <CartLineItem line={line} readOnly />
                </Fragment>
              ))}
            </View>
          )}
        </Card>

        <View style={styles.assurance}>
          <Truck size={18} color={colors.accentInk} />
          <Text style={styles.assuranceText}>Free delivery on this order</Text>
        </View>

        {hasOutOfStock && (
          <Text style={styles.outOfStockNote}>
            One or more items are out of stock. Go back to your cart to remove them.
          </Text>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: 12 + insets.bottom }]}>
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
          label="Continue to payment"
          onPress={() => router.push('/checkout/payment')}
          disabled={hasOutOfStock || !lines || lines.length === 0}
          fullWidth
          size="lg"
          icon={(color) => <ArrowRight size={18} color={color} weight="bold" />}
        />
      </View>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  container: { flex: 1, backgroundColor: c.bg },
  content: { padding: 16, gap: 20, paddingBottom: 24 },
  title: { ...typography.h1, color: c.text },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: c.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { ...typography.h3, color: c.text, flex: 1 },
  itemsTitle: { marginBottom: 14 },
  link: { ...typography.label, color: c.accentInk },
  addressName: { ...typography.bodyMedium, color: c.text },
  addressLine: { ...typography.body, color: c.textMuted },
  itemsList: { gap: 16 },
  divider: { height: 1, backgroundColor: c.border },
  assurance: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4 },
  assuranceText: { ...typography.label, color: c.textMuted },
  outOfStockNote: { ...typography.body, color: c.error },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 8,
    backgroundColor: c.surface,
    borderTopWidth: 1,
    borderTopColor: c.border,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  muted: { ...typography.body, color: c.textMuted },
  value: { ...typography.bodyMedium, color: c.text, fontVariant: ['tabular-nums'] },
  free: { ...typography.bodyMedium, color: c.success },
  totalRow: { paddingTop: 8, marginBottom: 8, borderTopWidth: 1, borderTopColor: c.border },
  totalLabel: { ...typography.h3, color: c.text },
  totalValue: { ...typography.h2, color: c.text, fontVariant: ['tabular-nums'] },
}));
