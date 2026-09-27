import { Text, View } from 'react-native';

import { makeStyles, radius, typography } from '@/lib/theme';

const STEPS = ['Address', 'Review', 'Payment'] as const;

type CheckoutStepsProps = {
  current: 0 | 1 | 2;
};

/** Three-segment progress bar shown at the top of each checkout screen. */
export function CheckoutSteps({ current }: CheckoutStepsProps) {
  const styles = useStyles();
  return (
    <View
      style={styles.row}
      accessibilityRole="progressbar"
      accessibilityLabel={`Checkout: ${STEPS[current]}, step ${current + 1} of ${STEPS.length}`}
    >
      {STEPS.map((step, index) => (
        <View key={step} style={styles.step}>
          <View style={[styles.bar, index <= current && styles.barDone]} />
          <Text style={[styles.label, index === current && styles.labelCurrent]}>{step}</Text>
        </View>
      ))}
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  row: { flexDirection: 'row', gap: 8 },
  step: { flex: 1, gap: 8 },
  bar: { height: 4, borderRadius: radius.pill, backgroundColor: c.border },
  barDone: { backgroundColor: c.accent },
  label: { ...typography.caption, color: c.textMuted },
  labelCurrent: { color: c.text },
}));
