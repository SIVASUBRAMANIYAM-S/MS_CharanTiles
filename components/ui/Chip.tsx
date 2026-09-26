import { Pressable, Text } from 'react-native';

import { makeStyles, radius, typography } from '@/lib/theme';

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

export function Chip({ label, selected = false, onPress }: ChipProps) {
  const styles = useStyles();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.base,
        selected ? styles.selected : styles.unselected,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.label, selected ? styles.labelSelected : styles.labelUnselected]}>
        {label}
      </Text>
    </Pressable>
  );
}

const useStyles = makeStyles((c) => ({
  base: {
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 9,
    alignSelf: 'flex-start',
  },
  selected: { backgroundColor: c.accent, borderColor: c.accent },
  unselected: { backgroundColor: c.surface, borderColor: c.border },
  pressed: { opacity: 0.8 },
  label: { ...typography.label },
  labelSelected: { color: c.onAccent },
  labelUnselected: { color: c.text },
}));
