import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/lib/theme/colors';
import { typography } from '@/lib/theme/typography';

type CollectionCardProps = {
  name: string;
  description: string | null;
  imageUrl: string | null;
  onPress: () => void;
  /** Fixed width for horizontal scrollers; omit to stretch to the parent's width. */
  width?: number;
};

export function CollectionCard({
  name,
  description,
  imageUrl,
  onPress,
  width,
}: CollectionCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, width !== undefined && { width }]}
      accessibilityRole="button"
    >
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} contentFit="cover" />
      ) : (
        <View style={[styles.image, styles.imageFallback]} />
      )}
      <Text style={styles.name}>{name}</Text>
      {description && (
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { gap: 6 },
  image: { width: '100%', aspectRatio: 12 / 7, borderRadius: 16, backgroundColor: colors.surface },
  imageFallback: { backgroundColor: colors.surface },
  name: { ...typography.h3, color: colors.ink },
  description: { ...typography.caption, color: colors.muted },
});
