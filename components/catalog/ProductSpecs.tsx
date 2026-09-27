import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import {
  Check,
  Drop,
  Footprints,
  GridFour,
  type Icon,
  Layers,
  Package,
  Ruler,
  Sun,
  Wall,
} from '@/components/ui/icons';
import type { Product } from '@/lib/queries/products';
import {
  formatPei,
  formatSize,
  formatSlip,
  formatThickness,
  isSuitableFor,
  type SuitableFor,
  suitableForLabels,
} from '@/lib/specs';
import { makeStyles, radius, typography, useTheme } from '@/lib/theme';

const suitableForIcons: Record<SuitableFor, Icon> = {
  floor: GridFour,
  wall: Wall,
  wet_areas: Drop,
  outdoor: Sun,
  high_traffic: Footprints,
};

export function Highlights({ items }: { items: string[] }) {
  const { colors } = useTheme();
  const styles = useStyles();
  if (items.length === 0) return null;
  return (
    <View style={styles.highlights}>
      {items.map((item) => (
        <View key={item} style={styles.highlightRow}>
          <View style={styles.highlightTick}>
            <Check size={12} color={colors.onAccent} weight="bold" />
          </View>
          <Text style={styles.highlightText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

type QuickFactsProps = {
  product: Product;
  /** Size of the selected variant, if it differs from the product's own size. */
  size: string | null;
};

/** The three numbers people ask for first: tile size, what a box holds, thickness. */
export function QuickFacts({ product, size }: QuickFactsProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  // Box contents are recorded for the product's base size only.
  const boxApplies = !size || size === product.size;
  const tiles = product.tiles_per_box;
  const facts: { icon: ReactNode; label: string; value: string | null }[] = [
    {
      icon: <Ruler size={20} color={colors.accentInk} />,
      label: 'Size in mm',
      value: formatSize(size ?? product.size, { unit: false }),
    },
    {
      icon: <Package size={20} color={colors.accentInk} />,
      label: boxApplies && tiles ? `Box of ${tiles} ${tiles === 1 ? 'tile' : 'tiles'}` : 'Per box',
      value: !boxApplies
        ? 'On request'
        : product.coverage_sqft
          ? `${product.coverage_sqft} sq ft`
          : tiles
            ? `${tiles} tiles`
            : null,
    },
    {
      icon: <Layers size={20} color={colors.accentInk} />,
      label: 'Thickness',
      value: formatThickness(product.thickness_mm),
    },
  ];

  return (
    <View style={styles.facts}>
      {facts
        .filter((fact) => fact.value)
        .map((fact) => (
          <View key={fact.label} style={styles.fact}>
            {fact.icon}
            <Text style={styles.factValue}>{fact.value}</Text>
            <Text style={styles.factLabel}>{fact.label}</Text>
          </View>
        ))}
    </View>
  );
}

export function SuitableForList({ values }: { values: string[] }) {
  const { colors } = useTheme();
  const styles = useStyles();
  const known = values.filter(isSuitableFor);
  if (known.length === 0) return null;
  return (
    <View style={styles.suitableRow}>
      {known.map((value) => {
        const IconComponent = suitableForIcons[value];
        return (
          <View key={value} style={styles.suitableChip}>
            <IconComponent size={16} color={colors.accentInk} weight="bold" />
            <Text style={styles.suitableText}>{suitableForLabels[value]}</Text>
          </View>
        );
      })}
    </View>
  );
}

type SpecTableProps = {
  product: Product;
  size: string | null;
  finish: string | null;
};

export function SpecTable({ product, size, finish }: SpecTableProps) {
  const styles = useStyles();
  const boxApplies = !size || size === product.size;
  const rows = [
    { label: 'Material', value: product.material, capitalize: true },
    { label: 'Finish', value: finish ?? product.finish, capitalize: true },
    { label: 'Size', value: formatSize(size ?? product.size) },
    { label: 'Thickness', value: formatThickness(product.thickness_mm) },
    {
      label: 'Tiles per box',
      value: boxApplies && product.tiles_per_box ? String(product.tiles_per_box) : null,
    },
    {
      label: 'Coverage per box',
      value: boxApplies && product.coverage_sqft ? `${product.coverage_sqft} sq ft` : null,
    },
    { label: 'Water absorption', value: product.water_absorption },
    { label: 'Wear rating', value: formatPei(product.pei_rating) },
    { label: 'Slip resistance', value: formatSlip(product.slip_rating) },
    { label: 'Colour', value: product.color?.replace(/-/g, ' ') ?? null },
    { label: 'SKU', value: product.sku },
  ].filter((row): row is { label: string; value: string; capitalize?: boolean } =>
    Boolean(row.value),
  );

  return (
    <View style={styles.table}>
      {rows.map((row, index) => (
        <View key={row.label} style={[styles.tableRow, index > 0 && styles.tableDivider]}>
          <Text style={styles.tableLabel}>{row.label}</Text>
          <Text style={[styles.tableValue, row.capitalize && styles.capitalize]}>{row.value}</Text>
        </View>
      ))}
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  highlights: { gap: 10 },
  highlightRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  highlightTick: {
    width: 20,
    height: 20,
    borderRadius: radius.pill,
    backgroundColor: c.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightText: { ...typography.body, color: c.text, flex: 1 },
  facts: { flexDirection: 'row', gap: 10 },
  fact: {
    flex: 1,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: radius.md,
    padding: 12,
    gap: 6,
  },
  factValue: { ...typography.label, color: c.text, fontVariant: ['tabular-nums'] },
  factLabel: { ...typography.caption, color: c.textMuted },
  suitableRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  suitableChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: c.accentSoft,
  },
  suitableText: { ...typography.label, color: c.text },
  table: {
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: radius.lg,
    paddingHorizontal: 16,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    paddingVertical: 12,
  },
  tableDivider: { borderTopWidth: 1, borderTopColor: c.border },
  // Labels never wrap; long values (wear/slip meanings) wrap on the right instead.
  tableLabel: { ...typography.body, color: c.textMuted, flexShrink: 0 },
  tableValue: { ...typography.bodyMedium, color: c.text, flexShrink: 1, textAlign: 'right' },
  capitalize: { textTransform: 'capitalize' },
}));
