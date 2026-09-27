import { Image } from 'expo-image';
import { Minus, Plus, Trash } from '@/components/ui/icons';
import { Pressable, Text, View } from 'react-native';

import { formatRupees } from '@/components/ui/Price';
import type { CartLineDetail } from '@/lib/queries/cart';
import { makeStyles, radius, typography, useTheme } from '@/lib/theme';

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
  const { colors } = useTheme();
  const styles = useStyles();
  const specs = [line.size, line.finish].filter(Boolean).join(' · ');

  return (
    <View style={styles.row}>
      <View style={styles.imageWrap}>
        {line.imageUrl ? (
          <Image source={{ uri: line.imageUrl }} style={styles.image} contentFit="cover" />
        ) : null}
      </View>

      <View style={styles.details}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={2}>
            {line.name}
          </Text>
          {!readOnly && (
            <Pressable
              onPress={onRemove}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Remove item"
              style={({ pressed }) => pressed && styles.pressed}
            >
              <Trash size={18} color={colors.textMuted} />
            </Pressable>
          )}
        </View>
        {specs.length > 0 && <Text style={styles.specs}>{specs}</Text>}
        {line.stockStatus === 'out_of_stock' && (
          <Text style={styles.outOfStock}>Out of stock. Remove it to continue.</Text>
        )}

        <View style={styles.bottomRow}>
          {readOnly ? (
            <Text style={styles.qtyText}>
              {line.quantity} × {formatRupees(line.unitPrice)}
            </Text>
          ) : (
            <View style={styles.stepper}>
              <Pressable
                onPress={onDecrement}
                style={({ pressed }) => [styles.stepperButton, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel="Decrease quantity"
              >
                <Minus size={16} color={colors.text} weight="bold" />
              </Pressable>
              <Text style={styles.stepperValue}>{line.quantity}</Text>
              <Pressable
                onPress={onIncrement}
                style={({ pressed }) => [styles.stepperButton, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel="Increase quantity"
              >
                <Plus size={16} color={colors.text} weight="bold" />
              </Pressable>
            </View>
          )}
          <Text style={styles.lineTotal}>{formatRupees(line.unitPrice * line.quantity)}</Text>
        </View>
      </View>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  row: { flexDirection: 'row', gap: 14 },
  imageWrap: {
    width: 92,
    height: 92,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: c.surfaceAlt,
  },
  image: { width: '100%', height: '100%' },
  details: { flex: 1, gap: 4 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  name: { ...typography.bodyMedium, color: c.text, flex: 1 },
  specs: { ...typography.caption, color: c.textMuted, textTransform: 'capitalize' },
  outOfStock: { ...typography.caption, color: c.error },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
    paddingTop: 6,
  },
  qtyText: { ...typography.caption, color: c.textMuted, fontVariant: ['tabular-nums'] },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.surfaceAlt,
    borderRadius: radius.pill,
  },
  stepperButton: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  stepperValue: {
    ...typography.label,
    color: c.text,
    minWidth: 22,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  lineTotal: { ...typography.price, color: c.text },
  pressed: { opacity: 0.6 },
}));
