import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { OrderStatusStepper } from '@/components/checkout/OrderStatusStepper';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { getOrderById, type OrderWithItems, type ShippingAddress } from '@/lib/queries/orders';
import { colors } from '@/lib/theme/colors';
import { typography } from '@/lib/theme/typography';

function readShippingAddress(order: OrderWithItems): ShippingAddress | null {
  const raw = order.shipping_address;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const address = raw as Record<string, unknown>;
  if (typeof address.fullName !== 'string' || typeof address.line1 !== 'string') return null;
  return {
    fullName: address.fullName,
    phone: typeof address.phone === 'string' ? address.phone : '',
    line1: address.line1,
    line2: typeof address.line2 === 'string' ? address.line2 : '',
    city: typeof address.city === 'string' ? address.city : '',
    state: typeof address.state === 'string' ? address.state : '',
    pincode: typeof address.pincode === 'string' ? address.pincode : '',
  };
}

export default function OrderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<OrderWithItems | null | undefined>(undefined);

  useEffect(() => {
    if (!id) return;
    getOrderById(id)
      .then(setOrder)
      .catch((error: unknown) => {
        console.warn('Failed to load order', error);
        setOrder(null);
      });
  }, [id]);

  if (order === null) {
    return (
      <View style={styles.centered}>
        <Text style={typography.body}>Order not found.</Text>
      </View>
    );
  }

  if (order === undefined) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Skeleton width="60%" height={28} />
          <Skeleton width="100%" height={80} borderRadius={12} />
        </View>
      </View>
    );
  }

  const address = readShippingAddress(order);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: `Order #${order.id.slice(0, 8).toUpperCase()}` }} />

      <View style={styles.header}>
        <Text style={typography.h1}>Order #{order.id.slice(0, 8).toUpperCase()}</Text>
        <Text style={styles.meta}>
          Placed {new Date(order.created_at).toLocaleDateString()} · Payment {order.payment_status}
        </Text>
      </View>

      <View style={styles.section}>
        <OrderStatusStepper status={order.status} />
      </View>

      <Card style={styles.comingSoonCard}>
        <View style={styles.comingSoonRow}>
          <Ionicons name="location-outline" size={20} color={colors.muted} />
          <View style={styles.comingSoonText}>
            <Text style={styles.comingSoonTitle}>Live courier tracking — Coming soon</Text>
            <Text style={styles.comingSoonBody}>
              This POC doesn&apos;t have a real courier/logistics integration yet, so tracking only
              shows the order status above, not a live map or carrier updates.
            </Text>
          </View>
        </View>
      </Card>

      <View style={styles.section}>
        <Text style={typography.h3}>Items</Text>
        <View style={styles.itemsList}>
          {order.order_items.map((item) => {
            const image = [...(item.products?.product_images ?? [])].sort(
              (a, b) => a.sort_order - b.sort_order,
            )[0];
            const specs = [item.product_variants?.size, item.product_variants?.finish]
              .filter(Boolean)
              .join(' · ');
            return (
              <View key={item.id} style={styles.itemRow}>
                {image ? (
                  <Image source={{ uri: image.url }} style={styles.itemImage} contentFit="cover" />
                ) : (
                  <View style={[styles.itemImage, styles.itemImageFallback]} />
                )}
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {item.products?.name ?? 'Product'}
                  </Text>
                  {specs.length > 0 && <Text style={styles.itemSpecs}>{specs}</Text>}
                  <Text style={styles.itemQty}>Qty {item.quantity}</Text>
                </View>
                <Text style={styles.itemPrice}>
                  ₹{(item.price_at_purchase * item.quantity).toFixed(0)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {address && (
        <View style={styles.section}>
          <Text style={typography.h3}>Delivery address</Text>
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
      )}

      <View style={styles.totalRow}>
        <Text style={typography.h3}>Total</Text>
        <Text style={typography.h3}>₹{order.total_amount.toFixed(0)}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.stone },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 16, gap: 24, paddingBottom: 32 },
  header: { gap: 4 },
  meta: { ...typography.caption, color: colors.muted },
  section: { gap: 12 },
  comingSoonCard: { backgroundColor: colors.surface },
  comingSoonRow: { flexDirection: 'row', gap: 12 },
  comingSoonText: { flex: 1, gap: 4 },
  comingSoonTitle: { ...typography.bodyMedium, color: colors.ink },
  comingSoonBody: { ...typography.caption, color: colors.muted },
  itemsList: { gap: 12 },
  itemRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  itemImage: { width: 56, height: 56, borderRadius: 8, backgroundColor: colors.surface },
  itemImageFallback: { backgroundColor: colors.surface },
  itemDetails: { flex: 1, gap: 2 },
  itemName: { ...typography.bodyMedium, color: colors.ink },
  itemSpecs: { ...typography.caption, color: colors.muted },
  itemQty: { ...typography.caption, color: colors.muted },
  itemPrice: { ...typography.bodyMedium, color: colors.ink },
  addressName: { ...typography.bodyMedium, color: colors.ink },
  addressLine: { ...typography.body, color: colors.muted },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
