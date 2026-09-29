import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { CalendarCheck, MapPin, Receipt, Truck } from '@/components/ui/icons';
import { Fragment, useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { OrderStatusStepper } from '@/components/checkout/OrderStatusStepper';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useFallbackHeaderLeft } from '@/components/ui/FallbackBack';
import { formatRupees } from '@/components/ui/Price';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDeliveryWindow, parseDateOnly } from '@/lib/delivery';
import { getOrderById, readShippingAddress, type OrderWithItems } from '@/lib/queries/orders';
import { sizedImageUrl } from '@/lib/image';
import { makeStyles, radius, typography, useTheme } from '@/lib/theme';

const dateFormat = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export default function OrderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const styles = useStyles();
  const headerLeft = useFallbackHeaderLeft('/order');
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
      <View style={styles.container}>
        <Stack.Screen options={{ headerLeft }} />
        <EmptyState
          icon={<Receipt size={30} color={colors.accentInk} />}
          title="Order not found"
          actionLabel="View all orders"
          onAction={() => router.replace('/order')}
        />
      </View>
    );
  }

  if (order === undefined) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerLeft }} />
        <View style={styles.content}>
          <Skeleton width="60%" height={30} />
          <Skeleton width="100%" height={110} borderRadius={radius.lg} />
          <Skeleton width="100%" height={160} borderRadius={radius.lg} />
        </View>
      </View>
    );
  }

  const address = readShippingAddress(order);
  const orderNumber = order.id.slice(0, 8).toUpperCase();
  const subtotal = order.order_items.reduce(
    (sum, item) => sum + item.price_at_purchase * item.quantity,
    0,
  );
  const deliveryWindow =
    order.estimated_delivery_from && order.estimated_delivery_to
      ? {
          from: parseDateOnly(order.estimated_delivery_from),
          to: parseDateOnly(order.estimated_delivery_to),
        }
      : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: `Order #${orderNumber}`, headerLeft }} />

      <View style={styles.header}>
        <Text style={styles.title}>Order #{orderNumber}</Text>
        <Text style={styles.meta}>Placed on {dateFormat.format(new Date(order.created_at))}</Text>
      </View>

      <Card>
        <Text style={styles.cardTitle}>Status</Text>
        <View style={styles.stepper}>
          <OrderStatusStepper status={order.status} />
        </View>
      </Card>

      {deliveryWindow && (
        <View style={styles.deliveryEstimate}>
          <CalendarCheck size={18} color={colors.accentInk} weight="fill" />
          <View style={styles.deliveryEstimateText}>
            <Text style={styles.deliveryEstimateLabel}>Estimated delivery</Text>
            <Text style={styles.deliveryEstimateValue}>{formatDeliveryWindow(deliveryWindow)}</Text>
          </View>
        </View>
      )}

      <View style={styles.comingSoon}>
        <Truck size={22} color={colors.accentInk} />
        <View style={styles.comingSoonText}>
          <Text style={styles.comingSoonTitle}>Live courier tracking is coming soon</Text>
          <Text style={styles.comingSoonBody}>
            For now, the status above is the latest update on your order.
          </Text>
        </View>
      </View>

      <Card>
        <Text style={styles.cardTitle}>
          {order.order_items.length} {order.order_items.length === 1 ? 'item' : 'items'}
        </Text>
        <View style={styles.itemsList}>
          {order.order_items.map((item, index) => {
            const image = [...(item.products?.product_images ?? [])].sort(
              (a, b) => a.sort_order - b.sort_order,
            )[0];
            const specs = [item.product_variants?.size, item.product_variants?.finish]
              .filter(Boolean)
              .join(' · ');
            return (
              <Fragment key={item.id}>
                {index > 0 && <View style={styles.divider} />}
                <View style={styles.itemRow}>
                  <View style={styles.itemImage}>
                    {image ? (
                      <Image
                        source={{ uri: sizedImageUrl(image.url, 64) }}
                        style={styles.fill}
                        contentFit="cover"
                      />
                    ) : null}
                  </View>
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName} numberOfLines={2}>
                      {item.products?.name ?? 'Product'}
                    </Text>
                    {specs.length > 0 && <Text style={styles.itemSpecs}>{specs}</Text>}
                    <Text style={styles.itemQty}>
                      {item.quantity} × {formatRupees(item.price_at_purchase)}
                    </Text>
                  </View>
                  <Text style={styles.itemPrice}>
                    {formatRupees(item.price_at_purchase * item.quantity)}
                  </Text>
                </View>
              </Fragment>
            );
          })}
        </View>
      </Card>

      {address && (
        <Card>
          <View style={styles.cardHeader}>
            <MapPin size={18} color={colors.accentInk} weight="fill" />
            <Text style={styles.cardTitle}>Delivery address</Text>
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

      <Card>
        <Text style={styles.cardTitle}>Payment</Text>
        <View style={styles.summary}>
          <View style={styles.row}>
            <Text style={styles.muted}>Status</Text>
            <Text style={[styles.value, order.payment_status === 'paid' && styles.paid]}>
              {order.payment_status === 'paid' ? 'Paid' : order.payment_status}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.muted}>Subtotal</Text>
            <Text style={styles.value}>{formatRupees(subtotal)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.muted}>Shipping</Text>
            <Text style={[styles.value, order.shipping_fee === 0 && styles.paid]}>
              {order.shipping_fee === 0 ? 'Free' : formatRupees(order.shipping_fee)}
            </Text>
          </View>
          <View style={[styles.row, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatRupees(order.total_amount)}</Text>
          </View>
        </View>
      </Card>
    </ScrollView>
  );
}

const useStyles = makeStyles((c) => ({
  container: { flex: 1, backgroundColor: c.bg },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  header: { gap: 4, marginBottom: 4 },
  title: { ...typography.h1, color: c.text, fontVariant: ['tabular-nums'] },
  meta: { ...typography.body, color: c.textMuted },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  cardTitle: { ...typography.h3, color: c.text },
  stepper: { marginTop: 16 },
  comingSoon: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: c.accentSoft,
  },
  comingSoonText: { flex: 1, gap: 2 },
  comingSoonTitle: { ...typography.bodyMedium, color: c.text },
  comingSoonBody: { ...typography.caption, color: c.textMuted },
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
  itemsList: { gap: 14, marginTop: 14 },
  divider: { height: 1, backgroundColor: c.border },
  itemRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: c.surfaceAlt,
  },
  fill: { width: '100%', height: '100%' },
  itemDetails: { flex: 1, gap: 2 },
  itemName: { ...typography.bodyMedium, color: c.text },
  itemSpecs: { ...typography.caption, color: c.textMuted, textTransform: 'capitalize' },
  itemQty: { ...typography.caption, color: c.textMuted, fontVariant: ['tabular-nums'] },
  itemPrice: { ...typography.price, fontSize: 15, color: c.text },
  addressName: { ...typography.bodyMedium, color: c.text },
  addressLine: { ...typography.body, color: c.textMuted },
  summary: { gap: 8, marginTop: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  muted: { ...typography.body, color: c.textMuted },
  value: { ...typography.bodyMedium, color: c.text, textTransform: 'capitalize' },
  paid: { color: c.success },
  totalRow: { paddingTop: 10, borderTopWidth: 1, borderTopColor: c.border },
  totalLabel: { ...typography.h3, color: c.text },
  totalValue: { ...typography.h2, color: c.text, fontVariant: ['tabular-nums'] },
}));
