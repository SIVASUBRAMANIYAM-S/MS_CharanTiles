import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { colors } from '@/lib/theme/colors';
import { fontFamily } from '@/lib/theme/typography';

type BadgeTone = 'featured' | 'lowStock' | 'outOfStock' | 'neutral';

type BadgeProps = {
  label: string;
  tone?: BadgeTone;
};

export function Badge({ label, tone = 'neutral' }: BadgeProps) {
  return (
    <View style={[styles.base, toneStyles[tone]]}>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  // Ink text on every tone keeps contrast readable on the light gold/amber/grey fills.
  label: { fontFamily: fontFamily.bodySemiBold, fontSize: 12, lineHeight: 16, color: colors.ink },
});

const toneStyles: Record<BadgeTone, ViewStyle> = {
  featured: { backgroundColor: colors.gold },
  lowStock: { backgroundColor: colors.warning },
  outOfStock: { backgroundColor: colors.muted },
  neutral: { backgroundColor: colors.surface },
};
