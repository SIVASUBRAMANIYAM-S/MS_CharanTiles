import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { Stack } from 'expo-router';
import { Camera, ImageSquare, WarningCircle } from '@/components/ui/icons';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { getColors } from 'react-native-image-colors';

import { ProductGrid } from '@/components/catalog/ProductGrid';
import { Button } from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { extractDominantHex, findClosestProducts } from '@/lib/color-match';
import { getAllProductsForColorMatch, type ColorMatchCandidate } from '@/lib/queries/products';
import { makeStyles, radius, typography, useTheme } from '@/lib/theme';

const MATCH_LIMIT = 8;

type Status = 'idle' | 'extracting' | 'done' | 'error';

export default function FindTileScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [extractedHex, setExtractedHex] = useState<string | null>(null);
  const [matches, setMatches] = useState<ColorMatchCandidate[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const processImage = async (uri: string) => {
    setPhotoUri(uri);
    setStatus('extracting');
    setErrorMessage(null);
    try {
      const result = await getColors(uri, { fallback: '#1B4F9C', quality: 'low', cache: false });
      const hex = extractDominantHex(result);
      setExtractedHex(hex);

      const candidates = await getAllProductsForColorMatch();
      setMatches(findClosestProducts(hex, candidates, MATCH_LIMIT));
      setStatus('done');
    } catch (error) {
      console.warn('Find-tile color match failed', error);
      setErrorMessage(
        'We could not read this photo. Try another one with the tile filling the frame.',
      );
      setStatus('error');
    }
  };

  const pickFromLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setErrorMessage('Allow photo access in Settings to pick a photo.');
      setStatus('error');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      void processImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setErrorMessage('Allow camera access in Settings to take a photo.');
      setStatus('error');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled && result.assets[0]) {
      void processImage(result.assets[0].uri);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: 'Find a tile' }} />

      <View style={styles.intro}>
        <View style={styles.introIcon}>
          <Camera size={26} color={colors.onAccent} weight="fill" />
        </View>
        <Text style={styles.title}>Find a tile from a photo</Text>
        <Text style={styles.subtitle}>
          Photograph a tile you like, or pick one from your gallery. We match its colour against our
          whole catalog.
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          label="Take photo"
          onPress={takePhoto}
          fullWidth
          size="lg"
          icon={(color) => <Camera size={20} color={color} weight="bold" />}
        />
        <Button
          label="Choose from gallery"
          variant="secondary"
          onPress={pickFromLibrary}
          fullWidth
          size="lg"
          icon={(color) => <ImageSquare size={20} color={color} weight="bold" />}
        />
      </View>

      {photoUri && (
        <View style={styles.previewCard}>
          <Image source={{ uri: photoUri }} style={styles.preview} contentFit="cover" />
          <View style={styles.previewInfo}>
            <Text style={styles.previewLabel}>Your photo</Text>
            {status === 'extracting' ? (
              <View style={styles.inline}>
                <ActivityIndicator color={colors.accentInk} />
                <Text style={styles.previewValue}>Matching colours…</Text>
              </View>
            ) : extractedHex ? (
              <View style={styles.inline}>
                <View style={[styles.swatch, { backgroundColor: extractedHex }]} />
                <Text style={styles.previewValue}>{extractedHex.toUpperCase()}</Text>
              </View>
            ) : null}
          </View>
        </View>
      )}

      {status === 'error' && errorMessage && (
        <View style={styles.error}>
          <WarningCircle size={20} color={colors.error} weight="fill" />
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}

      {status === 'done' && (
        <View style={styles.results}>
          <SectionHeader title="Closest matches" />
          <ProductGrid products={matches} emptyMessage="No close matches found" />
        </View>
      )}
    </ScrollView>
  );
}

const useStyles = makeStyles((c) => ({
  container: { flex: 1, backgroundColor: c.bg },
  content: { padding: 16, gap: 24, paddingBottom: 40 },
  intro: { alignItems: 'flex-start', gap: 8 },
  introIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: c.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  title: { ...typography.h1, color: c.text },
  subtitle: { ...typography.body, color: c.textMuted },
  actions: { gap: 12 },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 12,
    borderRadius: radius.lg,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
  },
  preview: { width: 84, height: 84, borderRadius: radius.md, backgroundColor: c.surfaceAlt },
  previewInfo: { flex: 1, gap: 6 },
  previewLabel: { ...typography.label, color: c.textMuted },
  previewValue: { ...typography.bodyMedium, color: c.text, fontVariant: ['tabular-nums'] },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  swatch: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: c.borderStrong,
  },
  error: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: c.errorSoft,
  },
  errorText: { ...typography.body, color: c.text, flex: 1 },
  results: { gap: 16 },
}));
