import { Text, View } from 'react-native';

import { makeStyles, radius, typography, useTheme } from '@/lib/theme';

type BadgeTone = 'featured' | 'lowStock' | 'outOfStock' | 'neutral';

type BadgeProps = {
  label: string;
  tone?: BadgeTone;
};

export function Badge({ label, tone = 'neutral' }: BadgeProps) {
  const { colors } = useTheme();
  const styles = useStyles();

  // Solid fills (not tints) so badges stay legible when laid over photos.
  const tones: Record<BadgeTone, { bg: string; fg: string }> = {
    featured: { bg: colors.accent, fg: colors.onAccent },
    lowStock: { bg: colors.warning, fg: colors.onAccent },
    outOfStock: { bg: colors.borderStrong, fg: colors.text },
    neutral: { bg: colors.surfaceAlt, fg: colors.text },
  };
  const { bg, fg } = tones[tone];

  return (
    <View style={[styles.base, { backgroundColor: bg }]}>
      <Text style={[styles.label, { color: fg }]}>{label}</Text>
    </View>
  );
}

const useStyles = makeStyles(() => ({
  base: {
    alignSelf: 'flex-start',
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  label: { ...typography.caption },
}));
