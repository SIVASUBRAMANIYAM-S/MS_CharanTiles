import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/lib/theme/colors';
import { typography } from '@/lib/theme/typography';

const STEPS = [
  { key: 'placed', label: 'Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
] as const;

type OrderStatusStepperProps = {
  status: string;
};

export function OrderStatusStepper({ status }: OrderStatusStepperProps) {
  if (status === 'cancelled') {
    return (
      <View style={styles.cancelledRow}>
        <Ionicons name="close-circle" size={20} color={colors.error} />
        <Text style={styles.cancelledText}>This order was cancelled</Text>
      </View>
    );
  }

  const currentIndex = STEPS.findIndex((step) => step.key === status);

  return (
    <View style={styles.row}>
      {STEPS.map((step, index) => {
        const done = index <= currentIndex;
        const isLast = index === STEPS.length - 1;
        return (
          <View key={step.key} style={styles.stepWrap}>
            <View style={styles.dotRow}>
              <View style={[styles.dot, done && styles.dotDone]}>
                {done && <Ionicons name="checkmark" size={12} color={colors.white} />}
              </View>
              {!isLast && <View style={[styles.line, index < currentIndex && styles.lineDone]} />}
            </View>
            <Text style={[styles.label, done && styles.labelDone]}>{step.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  stepWrap: { flex: 1, alignItems: 'flex-start' },
  dotRow: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotDone: { backgroundColor: colors.success, borderColor: colors.success },
  line: { flex: 1, height: 2, backgroundColor: colors.border },
  lineDone: { backgroundColor: colors.success },
  label: { ...typography.caption, color: colors.muted, marginTop: 6 },
  labelDone: { color: colors.ink },
  cancelledRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
  },
  cancelledText: { ...typography.bodyMedium, color: colors.error },
});
