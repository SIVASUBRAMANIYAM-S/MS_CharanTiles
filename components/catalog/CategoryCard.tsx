import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight } from '@/components/ui/icons';
import { Pressable, Text, View } from 'react-native';

import { sizedImageUrl } from '@/lib/image';
import { makeStyles, radius, typography, useTheme } from '@/lib/theme';

type CategoryCardProps = {
  name: string;
  imageUrl: string | null;
  onPress: () => void;
  /** 'sm' = portrait tile for horizontal rows, 'lg' = wide banner for full lists. */
  size?: 'sm' | 'lg';
};

export function CategoryCard({ name, imageUrl, onPress, size = 'sm' }: CategoryCardProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={name}
      style={({ pressed }) => [
        styles.card,
        size === 'lg' ? styles.lg : styles.sm,
        pressed && styles.pressed,
      ]}
    >
      {imageUrl ? (
        <Image
          source={{ uri: sizedImageUrl(imageUrl, size === 'sm' ? 160 : 430) }}
          style={styles.fill}
          contentFit="cover"
          transition={200}
          accessibilityIgnoresInvertColors
        />
      ) : null}
      {/* Bottom-weighted scrim keeps the label legible over any photo, in both modes. */}
      <LinearGradient
        colors={['rgba(8, 9, 11, 0)', 'rgba(8, 9, 11, 0.78)']}
        start={{ x: 0, y: 0.35 }}
        end={{ x: 0, y: 1 }}
        style={styles.fill}
      />
      <View style={styles.labelRow}>
        <Text style={size === 'lg' ? styles.labelLg : styles.label} numberOfLines={2}>
          {name}
        </Text>
        {size === 'lg' && <ArrowRight size={20} color={colors.onImage} weight="bold" />}
      </View>
    </Pressable>
  );
}

const useStyles = makeStyles((c) => ({
  card: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    backgroundColor: c.surfaceAlt,
  },
  sm: { aspectRatio: 4 / 5 },
  lg: { aspectRatio: 16 / 9 },
  pressed: { opacity: 0.88 },
  fill: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
    padding: 14,
  },
  label: { ...typography.label, fontSize: 15, lineHeight: 19, color: c.onImage, flexShrink: 1 },
  labelLg: { ...typography.h2, color: c.onImage, flexShrink: 1 },
}));
