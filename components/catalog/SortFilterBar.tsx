import { SlidersHorizontal } from '@/components/ui/icons';
import { ScrollView, Text, View } from 'react-native';

import { Chip } from '@/components/ui/Chip';
import { IconButton } from '@/components/ui/IconButton';
import type { ProductFilters, SortOrder } from '@/lib/queries/products';
import { makeStyles, radius, typography, useTheme } from '@/lib/theme';

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
];

export function activeFilterCount(filters: ProductFilters): number {
  return (
    (filters.finish?.length ?? 0) +
    (filters.size?.length ?? 0) +
    (filters.color?.length ?? 0) +
    (filters.minPrice !== undefined ? 1 : 0) +
    (filters.maxPrice !== undefined ? 1 : 0)
  );
}

type SortFilterBarProps = {
  filters: ProductFilters;
  onSortChange: (sort: SortOrder) => void;
  onOpenFilters: () => void;
};

export function SortFilterBar({ filters, onSortChange, onOpenFilters }: SortFilterBarProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const count = activeFilterCount(filters);

  return (
    <View style={styles.bar}>
      <IconButton accessibilityLabel="Filters" onPress={onOpenFilters} size={42}>
        <SlidersHorizontal size={20} color={colors.text} weight="bold" />
        {count > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{count}</Text>
          </View>
        )}
      </IconButton>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sortRow}
      >
        {SORT_OPTIONS.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            selected={(filters.sort ?? 'featured') === option.value}
            onPress={() => onSortChange(option.value)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  bar: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 16 },
  sortRow: { gap: 8, paddingRight: 16 },
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 18,
    height: 18,
    borderRadius: radius.pill,
    paddingHorizontal: 4,
    backgroundColor: c.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { ...typography.caption, fontSize: 10, lineHeight: 12, color: c.onAccent },
}));
