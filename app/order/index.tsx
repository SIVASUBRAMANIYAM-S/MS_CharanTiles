import { router, Stack } from 'expo-router';
import { CaretRight, Receipt } from '@/components/ui/icons';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { EmptyState } from '@/components/ui/EmptyState';
import { useFallbackHeaderLeft } from '@/components/ui/FallbackBack';
import { formatRupees } from '@/components/ui/Price';
import { Skeleton } from '@/components/ui/Skeleton';
import { getOrdersByUser, type OrderSummary } from '@/lib/queries/orders';
import { useAuthStore } from '@/lib/store/auth';
import { makeStyles, type Palette, radius, typography, useTheme } from '@/lib/theme';

const STATUS_LABEL: Record<string, string> = {
  placed: 'Placed',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

function statusColors(status: string, c: Palette): { fg: string; bg: string } {
  switch (status) {
    case 'delivered':
      return { fg: c.success, bg: c.successSoft };
    case 'cancelled':
      return { fg: c.error, bg: c.errorSoft };
    case 'placed':
      return { fg: c.textMuted, bg: c.surfaceAlt };
    default:
      return { fg: c.accentInk, bg: c.accentSoft };
  }
}

const dateFormat = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

export default function OrderHistoryScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const headerLeft = useFallbackHeaderLeft('/profile');
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
      <Stack.Screen options={{ title: 'Orders', headerLeft }} />
      <Text style={styles.title}>Order history</Text>

      {orders === null ? (
        <View style={styles.list}>
          <Skeleton width="100%" height={96} borderRadius={radius.lg} />
          <Skeleton width="100%" height={96} borderRadius={radius.lg} />
        </View>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<Receipt size={30} color={colors.accentInk} />}
          title="No orders yet"
          body="Orders you place will show up here with their delivery status."
          actionLabel="Browse catalog"
          onAction={() => router.push('/catalog')}
        />
      ) : (
        <View style={styles.list}>
          {orders.map((order) => {
            const tone = statusColors(order.status, colors);
            return (
              <Pressable
                key={order.id}
                onPress={() => router.push(`/order/${order.id}`)}
                style={({ pressed }) => [styles.card, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel={`Order ${order.id.slice(0, 8).toUpperCase()}`}
              >
                <View style={styles.iconBox}>
                  <Receipt size={22} color={colors.accentInk} />
                </View>
                <View style={styles.cardBody}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.orderNumber}>#{order.id.slice(0, 8).toUpperCase()}</Text>
                    <View style={[styles.pill, { backgroundColor: tone.bg }]}>
                      <Text style={[styles.pillText, { color: tone.fg }]}>
                        {STATUS_LABEL[order.status] ?? order.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.meta}>
                    {dateFormat.format(new Date(order.created_at))} · {order.itemCount}{' '}
                    {order.itemCount === 1 ? 'item' : 'items'}
                  </Text>
                  <Text style={styles.total}>{formatRupees(order.total_amount)}</Text>
                </View>
                <CaretRight size={16} color={colors.textMuted} />
              </Pressable>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const useStyles = makeStyles((c) => ({
  container: { flex: 1, backgroundColor: c.bg },
  content: { padding: 16, gap: 20, paddingBottom: 40 },
  title: { ...typography.h1, color: c.text },
  list: { gap: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: c.surface,
    borderRadius: radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: c.border,
  },
  pressed: { opacity: 0.8 },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: c.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { flex: 1, gap: 3 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  orderNumber: { ...typography.bodyMedium, color: c.text, fontVariant: ['tabular-nums'] },
  pill: { borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3 },
  pillText: { ...typography.caption },
  meta: { ...typography.caption, color: c.textMuted },
  total: { ...typography.price, color: c.text },
}));
