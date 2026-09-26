import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { CartLineDetail } from '@/lib/queries/cart';
import { colors } from '@/lib/theme/colors';
import { typography } from '@/lib/theme/typography';

type CartLineItemProps = {
  line: CartLineDetail;
  onIncrement?: () => void;
  onDecrement?: () => void;
  onRemove?: () => void;
  /** Review screen: shows quantity as plain text, no steppers or remove button. */
  readOnly?: boolean;
};

export function CartLineItem({
  line,
  onIncrement,
  onDecrement,
  onRemove,
  readOnly,
}: CartLineItemProps) {
  const lineTotal = line.unitPrice * line.quantity;
  const specs = [line.size, line.finish].filter(Boolean).join(' · ');

  return (
    <View style={styles.row}>
      {line.imageUrl ? (
        <Image source={{ uri: line.imageUrl }} style={styles.image} contentFit="cover" />
      ) : (
        <View style={[styles.image, styles.imageFallback]} />
      )}

      <View style={styles.details}>
        <Text style={styles.name} numberOfLines={2}>
          {line.name}
        </Text>
        {specs.length > 0 && <Text style={styles.specs}>{specs}</Text>}
        <Text style={styles.price}>
          ₹{line.unitPrice.toFixed(0)} {!readOnly && <Text style={styles.muted}>each</Text>}
        </Text>

        {line.stockStatus === 'out_of_stock' && (
          <Text style={styles.outOfStock}>Out of stock — remove to continue</Text>
        )}

        {readOnly ? (
          <Text style={styles.qtyText}>Qty {line.quantity}</Text>
        ) : (
          <View style={styles.controls}>
            <View style={styles.stepper}>
              <Pressable
                onPress={onDecrement}
                style={styles.stepperButton}
                accessibilityRole="button"
                accessibilityLabel="Decrease quantity"
              >
                <Ionicons name="remove" size={16} color={colors.ink} />
              </Pressable>
              <Text style={styles.stepperValue}>{line.quantity}</Text>
              <Pressable
                onPress={onIncrement}
                style={styles.stepperButton}
                accessibilityRole="button"
                accessibilityLabel="Increase quantity"
              >
                <Ionicons name="add" size={16} color={colors.ink} />
              </Pressable>
            </View>
            <Pressable
              onPress={onRemove}
              accessibilityRole="button"
              accessibilityLabel="Remove item"
            >
              <Ionicons name="trash-outline" size={18} color={colors.muted} />
            </Pressable>
          </View>
        )}
      </View>

      <Text style={styles.lineTotal}>₹{lineTotal.toFixed(0)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  image: { width: 84, height: 84, borderRadius: 10, backgroundColor: colors.surface },
  imageFallback: { backgroundColor: colors.surface },
  details: { flex: 1, gap: 4 },
  name: { ...typography.bodyMedium, color: colors.ink },
  specs: { ...typography.caption, color: colors.muted },
  price: { ...typography.bodyMedium, color: colors.primary },
  muted: { ...typography.caption, color: colors.muted },
  outOfStock: { ...typography.caption, color: colors.error },
  qtyText: { ...typography.caption, color: colors.muted },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  stepperButton: { padding: 2 },
  stepperValue: { ...typography.bodyMedium, color: colors.ink, minWidth: 18, textAlign: 'center' },
  lineTotal: { ...typography.bodyMedium, color: colors.ink },
});
