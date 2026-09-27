import { router, Stack, useLocalSearchParams } from 'expo-router';
import { MotiView } from 'moti';
import { CalendarCheck, CaretRight, Check, MapPin, Receipt } from '@/components/ui/icons';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatRupees } from '@/components/ui/Price';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDeliveryWindow, parseDateOnly } from '@/lib/delivery';
import { getOrderById, readShippingAddress, type OrderWithItems } from '@/lib/queries/orders';
import { useCheckoutStore } from '@/lib/store/checkout';
import { makeStyles, radius, typography, useTheme } from '@/lib/theme';

const NEXT_STEPS: { text: string; href?: '/order' | '/enquiry' }[] = [
  { text: "We'll text you when your tiles ship" },
  { text: 'Track progress anytime from Order history', href: '/order' },
  { text: 'Have questions? Send us an enquiry', href: '/enquiry' },
];

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
  const address = order ? readShippingAddress(order) : null;
  const deliveryWindow =
    order?.estimated_delivery_from && order.estimated_delivery_to
      ? {
          from: parseDateOnly(order.estimated_delivery_from),
          to: parseDateOnly(order.estimated_delivery_to),
        }
      : null;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: '',
          headerBackVisible: false,
          // headerBackVisible alone isn't honored on web; the order is placed, so no way back.
          headerLeft: () => null,
          gestureEnabled: false,
        }}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <MotiView
            from={reduceMotion ? undefined : { opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 14, stiffness: 140 }}
            style={styles.halo}
          >
            <View style={styles.badge}>
              <Check size={36} color={colors.onAccent} weight="bold" />
            </View>
          </MotiView>

          <Text style={styles.title}>Order placed</Text>
          <Text style={styles.subtitle}>
            Thank you. We&apos;ve received your order and started getting it ready.
          </Text>
        </View>

        {order === undefined ? (
          <>
            <Skeleton width="100%" height={110} borderRadius={radius.lg} />
            <Skeleton width="100%" height={70} borderRadius={radius.lg} />
            <Skeleton width="100%" height={120} borderRadius={radius.lg} />
          </>
        ) : order ? (
          <>
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

            {deliveryWindow && (
              <View style={styles.deliveryEstimate}>
                <CalendarCheck size={18} color={colors.accentInk} weight="fill" />
                <View style={styles.deliveryEstimateText}>
                  <Text style={styles.deliveryEstimateLabel}>Estimated delivery</Text>
                  <Text style={styles.deliveryEstimateValue}>
                    {formatDeliveryWindow(deliveryWindow)}
                  </Text>
                </View>
              </View>
            )}

            {address && (
              <Card>
                <View style={styles.cardHeader}>
                  <View style={styles.iconBadge}>
                    <MapPin size={16} color={colors.accentInk} weight="fill" />
                  </View>
                  <Text style={styles.cardTitle}>Delivering to</Text>
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
            )}

            <View style={styles.nextSteps}>
              <Text style={styles.nextStepsTitle}>What happens next</Text>
              {NEXT_STEPS.map((step) =>
                step.href ? (
                  <Pressable
                    key={step.text}
                    onPress={() => router.push(step.href!)}
                    accessibilityRole="button"
                    hitSlop={4}
                    style={({ pressed }) => [styles.nextStepRow, pressed && styles.pressed]}
                  >
                    <View style={styles.nextStepDot} />
                    <Text style={[styles.nextStepText, styles.nextStepLink]}>{step.text}</Text>
                    <CaretRight size={14} color={colors.accentInk} weight="bold" />
                  </Pressable>
                ) : (
                  <View key={step.text} style={styles.nextStepRow}>
                    <View style={styles.nextStepDot} />
                    <Text style={styles.nextStepText}>{step.text}</Text>
                  </View>
                ),
              )}
            </View>
          </>
        ) : null}
      </ScrollView>

      <View style={[styles.actions, { paddingBottom: 12 + insets.bottom }]}>
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
  container: { flex: 1, backgroundColor: c.bg },
  content: { padding: 20, gap: 16, paddingBottom: 24 },
  hero: { alignItems: 'center', gap: 8, paddingVertical: 12 },
  halo: {
    width: 100,
    height: 100,
    borderRadius: radius.pill,
    backgroundColor: c.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  badge: {
    width: 68,
    height: 68,
    borderRadius: radius.pill,
    backgroundColor: c.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { ...typography.display, color: c.text },
  subtitle: { ...typography.body, color: c.textMuted, textAlign: 'center', maxWidth: 320 },
  summary: {
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
  deliveryEstimate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor: c.accentSoft,
  },
  deliveryEstimateText: { gap: 1 },
  deliveryEstimateLabel: { ...typography.caption, color: c.textMuted },
  deliveryEstimateValue: { ...typography.bodyMedium, color: c.text },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: c.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { ...typography.h3, color: c.text },
  addressName: { ...typography.bodyMedium, color: c.text },
  addressLine: { ...typography.body, color: c.textMuted },
  nextSteps: {
    padding: 18,
    gap: 12,
    borderRadius: radius.lg,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
  },
  nextStepsTitle: { ...typography.h3, color: c.text },
  nextStepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  nextStepDot: {
    width: 6,
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: c.accentInk,
    marginTop: 8,
  },
  nextStepText: { ...typography.body, color: c.textMuted, flex: 1 },
  nextStepLink: { color: c.text },
  pressed: { opacity: 0.7 },
  actions: {
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 14,
    backgroundColor: c.surface,
    borderTopWidth: 1,
    borderTopColor: c.border,
  },
}));
