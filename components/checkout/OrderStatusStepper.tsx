import { Check, XCircle } from '@/components/ui/icons';
import { Text, View } from 'react-native';

import { makeStyles, radius, typography, useTheme } from '@/lib/theme';

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
  const { colors } = useTheme();
  const styles = useStyles();

  if (status === 'cancelled') {
    return (
      <View style={styles.cancelledRow}>
        <XCircle size={20} color={colors.error} weight="fill" />
        <Text style={styles.cancelledText}>This order was cancelled</Text>
      </View>
    );
  }

  const currentIndex = STEPS.findIndex((step) => step.key === status);

  return (
    <View
      style={styles.row}
      accessibilityLabel={`Order status: ${STEPS[currentIndex]?.label ?? status}`}
    >
      {STEPS.map((step, index) => {
        const done = index <= currentIndex;
        const isCurrent = index === currentIndex;
        const isLast = index === STEPS.length - 1;
        return (
          <View key={step.key} style={styles.stepWrap}>
            <View style={styles.dotRow}>
              <View style={[styles.dot, done && styles.dotDone]}>
                {done && <Check size={12} color={colors.onAccent} weight="bold" />}
              </View>
              {!isLast && <View style={[styles.line, index < currentIndex && styles.lineDone]} />}
            </View>
            <Text
              style={[styles.label, done && styles.labelDone, isCurrent && styles.labelCurrent]}
            >
              {step.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  row: { flexDirection: 'row' },
  stepWrap: { flex: 1, alignItems: 'flex-start' },
  dotRow: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  dot: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: c.borderStrong,
    backgroundColor: c.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotDone: { backgroundColor: c.accent, borderColor: c.accent },
  line: { flex: 1, height: 2, backgroundColor: c.border },
  lineDone: { backgroundColor: c.accent },
  label: { ...typography.caption, color: c.textMuted, marginTop: 8 },
  labelDone: { color: c.text },
  // Current step is marked by label color, not a bigger dot, so labels stay aligned.
  labelCurrent: { color: c.accentInk, fontFamily: typography.label.fontFamily },
  cancelledRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: c.errorSoft,
    borderRadius: radius.md,
    padding: 12,
  },
  cancelledText: { ...typography.bodyMedium, color: c.error },
}));
