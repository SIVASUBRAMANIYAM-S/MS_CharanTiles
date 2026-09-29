import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';

import { sizedImageUrl } from '@/lib/image';
import { makeStyles, radius, typography } from '@/lib/theme';

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
  const styles = useStyles();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${name} collection`}
      style={({ pressed }) => [
        styles.card,
        width !== undefined && { width },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.imageWrap}>
        {imageUrl ? (
          <Image
            source={{ uri: sizedImageUrl(imageUrl, width ?? 430) }}
            style={styles.image}
            contentFit="cover"
            transition={200}
            accessibilityIgnoresInvertColors
          />
        ) : null}
      </View>
      <Text style={styles.name}>{name}</Text>
      {description ? (
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>
      ) : null}
    </Pressable>
  );
}

const useStyles = makeStyles((c) => ({
  card: { gap: 4 },
  pressed: { opacity: 0.85 },
  imageWrap: {
    aspectRatio: 3 / 2,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: c.surfaceAlt,
    marginBottom: 8,
  },
  image: { width: '100%', height: '100%' },
  name: { ...typography.h3, color: c.text },
  description: { ...typography.body, fontSize: 14, lineHeight: 20, color: c.textMuted },
}));
