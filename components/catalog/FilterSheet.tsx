import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Input } from '@/components/ui/Input';
import type { ProductFilters } from '@/lib/queries/products';
import { makeStyles, radius, typography } from '@/lib/theme';

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
  const styles = useStyles();
  const sheetRef = useRef<BottomSheetModal>(null);
  const [finish, setFinish] = useState<string[]>(value.finish ?? []);
  const [size, setSize] = useState<string[]>(value.size ?? []);
  const [color, setColor] = useState<string[]>(value.color ?? []);
  const [minPrice, setMinPrice] = useState(value.minPrice?.toString() ?? '');
  const [maxPrice, setMaxPrice] = useState(value.maxPrice?.toString() ?? '');

  const snapPoints = useMemo(() => ['78%'], []);
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.6} />
    ),
    [],
  );

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
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <BottomSheetScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Filters</Text>
          <Button label="Reset" variant="ghost" size="sm" onPress={handleReset} />
        </View>

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

        <View style={styles.group}>
          <Text style={styles.groupLabel}>Price range</Text>
          <View style={styles.priceRow}>
            <View style={styles.priceInput}>
              <Input
                label="Min (₹)"
                keyboardType="numeric"
                value={minPrice}
                onChangeText={setMinPrice}
              />
            </View>
            <View style={styles.priceInput}>
              <Input
                label="Max (₹)"
                keyboardType="numeric"
                value={maxPrice}
                onChangeText={setMaxPrice}
              />
            </View>
          </View>
        </View>

        <Button label="Show results" onPress={handleApply} fullWidth size="lg" />
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  const styles = useStyles();
  return (
    <View style={styles.group}>
      <Text style={styles.groupLabel}>{label}</Text>
      <View style={styles.chipRow}>{children}</View>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  sheetBackground: { backgroundColor: c.surface, borderRadius: radius.xl },
  handleIndicator: { backgroundColor: c.borderStrong, width: 44 },
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40, gap: 24 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { ...typography.h2, color: c.text },
  group: { gap: 12 },
  groupLabel: { ...typography.label, color: c.textMuted },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  priceRow: { flexDirection: 'row', gap: 12 },
  priceInput: { flex: 1 },
}));
