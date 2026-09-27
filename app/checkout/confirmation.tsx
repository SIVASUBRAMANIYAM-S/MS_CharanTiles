import { router, Stack, useLocalSearchParams } from 'expo-router';
import { MotiView } from 'moti';
import { Check, Receipt } from '@/components/ui/icons';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { formatRupees } from '@/components/ui/Price';
import { Skeleton } from '@/components/ui/Skeleton';
import { getOrderById, type OrderWithItems } from '@/lib/queries/orders';
import { useCheckoutStore } from '@/lib/store/checkout';
import { makeStyles, radius, typography, useTheme } from '@/lib/theme';

export default function CheckoutConfirmationScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const { colors } = useTheme();
  const styles = useStyles();
  const [order, setOrder] = useState<OrderWithItems | null | undefined>(undefined);
  const resetCheckout = useCheckoutStore((state) => state.reset);

  useEffect(() => {
    if (!orderId) return;
    getOrderById(orderId)
      .then(setOrder)
      .catch((error: unknown) => {
        console.warn('Failed to load confirmed order', error);
        setOrder(null);
      });
  }, [orderId]);

  // Safe here: this screen has no "no address -> redirect" guard, unlike
  // address/review/payment, so clearing the draft can't race a navigation.
  useEffect(() => {
    resetCheckout();
  }, [resetCheckout]);

  const itemCount = order?.order_items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <View style={[styles.container, { paddingBottom: 16 + insets.bottom }]}>
      <Stack.Screen
        options={{
          title: '',
          headerBackVisible: false,
          // headerBackVisible alone isn't honored on web; the order is placed, so no way back.
          headerLeft: () => null,
          gestureEnabled: false,
        }}
      />

      <View style={styles.center}>
        <MotiView
          from={reduceMotion ? undefined : { opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 14, stiffness: 140 }}
          style={styles.halo}
        >
          <View style={styles.badge}>
            <Check size={40} color={colors.onAccent} weight="bold" />
          </View>
        </MotiView>

        <Text style={styles.title}>Order placed</Text>
        <Text style={styles.subtitle}>
          Thank you. We&apos;ve received your order and will confirm delivery details soon.
        </Text>

        {order === undefined ? (
          <Skeleton width="100%" height={120} borderRadius={radius.lg} />
        ) : order ? (
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Order</Text>
              <Text style={styles.summaryValue}>#{order.id.slice(0, 8).toUpperCase()}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Items</Text>
              <Text style={styles.summaryValue}>{itemCount}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Payment</Text>
              <Text style={[styles.summaryValue, styles.paid]}>Paid</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatRupees(order.total_amount)}</Text>
            </View>
          </View>
        ) : null}
      </View>

      <View style={styles.actions}>
        <Button
          label="View order"
          onPress={() => order && router.replace(`/order/${order.id}`)}
          disabled={!order}
          fullWidth
          size="lg"
          icon={(color) => <Receipt size={18} color={color} weight="bold" />}
        />
        <Button
          label="Continue shopping"
          variant="outline"
          onPress={() => router.replace('/catalog')}
          fullWidth
          size="lg"
        />
      </View>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  container: { flex: 1, backgroundColor: c.bg, paddingHorizontal: 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  halo: {
    width: 120,
    height: 120,
    borderRadius: radius.pill,
    backgroundColor: c.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  badge: {
    width: 80,
    height: 80,
    borderRadius: radius.pill,
    backgroundColor: c.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { ...typography.display, color: c.text },
  subtitle: { ...typography.body, color: c.textMuted, textAlign: 'center', maxWidth: 320 },
  summary: {
    width: '100%',
    marginTop: 20,
    padding: 18,
    gap: 10,
    borderRadius: radius.lg,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { ...typography.body, color: c.textMuted },
  summaryValue: { ...typography.bodyMedium, color: c.text, fontVariant: ['tabular-nums'] },
  paid: { color: c.success },
  totalRow: { paddingTop: 10, borderTopWidth: 1, borderTopColor: c.border },
  totalLabel: { ...typography.h3, color: c.text },
  totalValue: { ...typography.h2, color: c.text, fontVariant: ['tabular-nums'] },
  actions: { gap: 12 },
}));
