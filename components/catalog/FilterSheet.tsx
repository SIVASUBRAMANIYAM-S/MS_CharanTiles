import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Input } from '@/components/ui/Input';
import type { ProductFilters } from '@/lib/queries/products';
import { colors } from '@/lib/theme/colors';
import { typography } from '@/lib/theme/typography';

export type FilterSheetHandle = {
  present: () => void;
  dismiss: () => void;
};

type FilterSheetProps = {
  finishOptions: string[];
  sizeOptions: string[];
  colorOptions: string[];
  value: ProductFilters;
  onApply: (filters: ProductFilters) => void;
};

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export const FilterSheet = forwardRef<FilterSheetHandle, FilterSheetProps>(function FilterSheet(
  { finishOptions, sizeOptions, colorOptions, value, onApply },
  ref,
) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const [finish, setFinish] = useState<string[]>(value.finish ?? []);
  const [size, setSize] = useState<string[]>(value.size ?? []);
  const [color, setColor] = useState<string[]>(value.color ?? []);
  const [minPrice, setMinPrice] = useState(value.minPrice?.toString() ?? '');
  const [maxPrice, setMaxPrice] = useState(value.maxPrice?.toString() ?? '');

  const snapPoints = useMemo(() => ['70%'], []);

  useImperativeHandle(ref, () => ({
    present: () => {
      // Re-sync from the applied value each time the sheet opens, so reopening
      // after Apply (or after the parent resets filters) shows the current state.
      setFinish(value.finish ?? []);
      setSize(value.size ?? []);
      setColor(value.color ?? []);
      setMinPrice(value.minPrice?.toString() ?? '');
      setMaxPrice(value.maxPrice?.toString() ?? '');
      sheetRef.current?.present();
    },
    dismiss: () => sheetRef.current?.dismiss(),
  }));

  const handleReset = () => {
    setFinish([]);
    setSize([]);
    setColor([]);
    setMinPrice('');
    setMaxPrice('');
    onApply({ sort: value.sort });
    sheetRef.current?.dismiss();
  };

  const handleApply = () => {
    onApply({
      finish: finish.length ? finish : undefined,
      size: size.length ? size : undefined,
      color: color.length ? color : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sort: value.sort,
    });
    sheetRef.current?.dismiss();
  };

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <BottomSheetScrollView contentContainerStyle={styles.content}>
        <Text style={typography.h3}>Filters</Text>

        {finishOptions.length > 0 && (
          <FilterGroup label="Finish">
            {finishOptions.map((option) => (
              <Chip
                key={option}
                label={option}
                selected={finish.includes(option)}
                onPress={() => setFinish(toggle(finish, option))}
              />
            ))}
          </FilterGroup>
        )}

        {sizeOptions.length > 0 && (
          <FilterGroup label="Size">
            {sizeOptions.map((option) => (
              <Chip
                key={option}
                label={option}
                selected={size.includes(option)}
                onPress={() => setSize(toggle(size, option))}
              />
            ))}
          </FilterGroup>
        )}

        {colorOptions.length > 0 && (
          <FilterGroup label="Color">
            {colorOptions.map((option) => (
              <Chip
                key={option}
                label={option}
                selected={color.includes(option)}
                onPress={() => setColor(toggle(color, option))}
              />
            ))}
          </FilterGroup>
        )}

        <FilterGroup label="Price range">
          <View style={styles.priceRow}>
            <View style={styles.priceInput}>
              <Input
                label="Min"
                keyboardType="numeric"
                value={minPrice}
                onChangeText={setMinPrice}
              />
            </View>
            <View style={styles.priceInput}>
              <Input
                label="Max"
                keyboardType="numeric"
                value={maxPrice}
                onChangeText={setMaxPrice}
              />
            </View>
          </View>
        </FilterGroup>

        <View style={styles.actionRow}>
          <Button label="Reset" variant="outline" onPress={handleReset} />
          <Button label="Apply" onPress={handleApply} fullWidth />
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupLabel}>{label}</Text>
      <View style={styles.chipRow}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  sheetBackground: { backgroundColor: colors.white },
  handleIndicator: { backgroundColor: colors.border },
  content: { padding: 20, gap: 20 },
  group: { gap: 10 },
  groupLabel: { ...typography.bodyMedium, color: colors.ink },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  priceRow: { flexDirection: 'row', gap: 12 },
  priceInput: { flex: 1 },
  actionRow: { flexDirection: 'row', gap: 12, alignItems: 'center', marginTop: 8 },
});
