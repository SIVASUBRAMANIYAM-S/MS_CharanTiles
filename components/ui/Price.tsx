import { Text, View } from 'react-native';

import { makeStyles, typography } from '@/lib/theme';

type PriceProps = {
  price: number;
  mrp?: number | null;
  size?: 'sm' | 'md' | 'lg';
  /** Unit suffix, e.g. "/ box". Omitted by default. */
  unit?: string;
};

const formatter = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

export function formatRupees(value: number): string {
  return `₹${formatter.format(value)}`;
}

export function Price({ price, mrp, size = 'md', unit }: PriceProps) {
  const styles = useStyles();
  const hasDiscount = mrp != null && mrp > price;
  const off = hasDiscount ? Math.round(((mrp - price) / mrp) * 100) : 0;

  return (
    <View style={styles.row}>
      <Text style={[styles.price, sizeStyle[size]]}>
        {formatRupees(price)}
        {unit ? <Text style={styles.unit}> {unit}</Text> : null}
      </Text>
      {hasDiscount && (
        <>
          <Text style={styles.mrp}>{formatRupees(mrp)}</Text>
          <Text style={styles.off}>{off}% off</Text>
        </>
      )}
    </View>
  );
}

const sizeStyle = {
  sm: { fontSize: 15, lineHeight: 20 },
  md: { fontSize: 17, lineHeight: 22 },
  lg: { fontSize: 26, lineHeight: 32 },
} as const;

const useStyles = makeStyles((c) => ({
  row: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', columnGap: 8 },
  price: { ...typography.price, color: c.text },
  unit: { ...typography.caption, color: c.textMuted },
  mrp: {
    ...typography.caption,
    color: c.textFaint,
    textDecorationLine: 'line-through',
    fontVariant: ['tabular-nums'],
  },
  off: { ...typography.caption, color: c.success },
}));
