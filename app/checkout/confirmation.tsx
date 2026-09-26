import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { MotiView } from 'moti';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { getOrderById, type OrderWithItems } from '@/lib/queries/orders';
import { useCheckoutStore } from '@/lib/store/checkout';
import { colors } from '@/lib/theme/colors';
import { typography } from '@/lib/theme/typography';

export default function CheckoutConfirmationScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
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

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Order confirmed', headerBackVisible: false }} />

      <MotiView
        from={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'timing', duration: 400 }}
        style={styles.iconWrap}
      >
        <Ionicons name="checkmark-circle" size={84} color={colors.success} />
      </MotiView>

      <Text style={typography.h1}>Order placed!</Text>
      <Text style={styles.subtitle}>
        Thanks for your order — we&apos;ve sent a confirmation to your account.
      </Text>

      {order === undefined ? (
        <Skeleton width="80%" height={60} borderRadius={12} />
      ) : order ? (
        <View style={styles.summary}>
          <Text style={styles.orderNumber}>Order #{order.id.slice(0, 8).toUpperCase()}</Text>
          <Text style={styles.orderTotal}>₹{order.total_amount.toFixed(0)}</Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        <Button
          label="View Order"
          onPress={() => order && router.replace(`/order/${order.id}`)}
          disabled={!order}
          fullWidth
        />
        <Button
          label="Continue Shopping"
          variant="outline"
          onPress={() => router.replace('/catalog')}
          fullWidth
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.stone,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  iconWrap: { marginBottom: 8 },
  subtitle: { ...typography.body, color: colors.muted, textAlign: 'center' },
  summary: { alignItems: 'center', gap: 4, marginVertical: 16 },
  orderNumber: { ...typography.bodyMedium, color: colors.muted },
  orderTotal: { ...typography.h2, color: colors.ink },
  actions: { width: '100%', gap: 12, marginTop: 16 },
});
