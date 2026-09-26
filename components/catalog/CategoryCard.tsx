import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/lib/theme/colors';
import { typography } from '@/lib/theme/typography';

type CategoryCardProps = {
  name: string;
  imageUrl: string | null;
  onPress: () => void;
  size?: 'sm' | 'lg';
};

export function CategoryCard({ name, imageUrl, onPress, size = 'sm' }: CategoryCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, size === 'lg' && styles.cardLarge]}
      accessibilityRole="button"
    >
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} contentFit="cover" />
      ) : (
        <View style={[styles.image, styles.imageFallback]} />
      )}
      <View style={styles.overlay} />
      <Text style={styles.label}>{name}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    aspectRatio: 4 / 3,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  cardLarge: { aspectRatio: 16 / 9 },
  image: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  imageFallback: { backgroundColor: colors.surface },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.navy,
    opacity: 0.35,
  },
  label: {
    ...typography.h3,
    color: colors.white,
    padding: 12,
  },
});
