import { router, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Skeleton } from '@/components/ui/Skeleton';
import { getOrdersByUser, type OrderSummary } from '@/lib/queries/orders';
import { useAuthStore } from '@/lib/store/auth';
import { colors } from '@/lib/theme/colors';
import { typography } from '@/lib/theme/typography';

const STATUS_COLOR: Record<string, string> = {
  placed: colors.muted,
  confirmed: colors.primary,
  shipped: colors.warning,
  delivered: colors.success,
  cancelled: colors.error,
};

const STATUS_LABEL: Record<string, string> = {
  placed: 'Placed',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function OrderHistoryScreen() {
  const userId = useAuthStore((state) => state.user?.id);
  const [orders, setOrders] = useState<OrderSummary[] | null>(null);

  useEffect(() => {
    if (!userId) return;
    getOrdersByUser(userId)
      .then(setOrders)
      .catch((error: unknown) => {
        console.warn('Failed to load order history', error);
        setOrders([]);
      });
  }, [userId]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: 'Order History' }} />
      <Text style={typography.h1}>Order History</Text>

      {orders === null ? (
        <View style={styles.list}>
          <Skeleton width="100%" height={90} borderRadius={12} />
          <Skeleton width="100%" height={90} borderRadius={12} />
        </View>
      ) : orders.length === 0 ? (
        <Text style={styles.emptyText}>No orders yet. Your placed orders will show up here.</Text>
      ) : (
        <View style={styles.list}>
          {orders.map((order) => (
            <Pressable
              key={order.id}
              onPress={() => router.push(`/order/${order.id}`)}
              style={styles.card}
              accessibilityRole="button"
            >
              <View style={styles.cardHeader}>
                <Text style={styles.orderNumber}>#{order.id.slice(0, 8).toUpperCase()}</Text>
                <View style={[styles.statusPill, { backgroundColor: STATUS_COLOR[order.status] }]}>
                  <Text style={styles.statusText}>
                    {STATUS_LABEL[order.status] ?? order.status}
                  </Text>
                </View>
              </View>
              <Text style={styles.meta}>
                {new Date(order.created_at).toLocaleDateString()} · {order.itemCount}{' '}
                {order.itemCount === 1 ? 'item' : 'items'}
              </Text>
              <Text style={styles.total}>₹{order.total_amount.toFixed(0)}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.stone },
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  emptyText: { ...typography.body, color: colors.muted },
  list: { gap: 12 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 14,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderNumber: { ...typography.bodyMedium, color: colors.ink },
  statusPill: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { ...typography.caption, color: colors.white },
  meta: { ...typography.caption, color: colors.muted },
  total: { ...typography.bodyMedium, color: colors.primary },
});
