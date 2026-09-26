import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { getColors } from 'react-native-image-colors';

import { ProductGrid } from '@/components/catalog/ProductGrid';
import { Button } from '@/components/ui/Button';
import { extractDominantHex, findClosestProducts } from '@/lib/color-match';
import { getAllProductsForColorMatch, type ColorMatchCandidate } from '@/lib/queries/products';
import { colors } from '@/lib/theme/colors';
import { typography } from '@/lib/theme/typography';

const MATCH_LIMIT = 8;

type Status = 'idle' | 'extracting' | 'done' | 'error';

export default function FindTileScreen() {
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
      const closest = findClosestProducts(hex, candidates, MATCH_LIMIT);
      setMatches(closest);
      setStatus('done');
    } catch (error) {
      console.warn('Find-tile color match failed', error);
      setErrorMessage('Could not analyze this photo. Please try another one.');
      setStatus('error');
    }
  };

  const pickFromLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setErrorMessage('Photo library access is needed to pick a photo.');
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
      setErrorMessage('Camera access is needed to take a photo.');
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
      <Stack.Screen options={{ title: 'Find this tile' }} />
      <Text style={typography.h1}>Find this tile</Text>
      <Text style={styles.subtitle}>
        Take or upload a photo of a tile you like — we&apos;ll match it to the closest colors in our
        catalog.
      </Text>

      <View style={styles.actions}>
        <Button
          label="Take Photo"
          icon={<Ionicons name="camera" size={18} color={colors.white} />}
          onPress={takePhoto}
          fullWidth
        />
        <Button
          label="Choose from Gallery"
          variant="outline"
          icon={<Ionicons name="images" size={18} color={colors.primary} />}
          onPress={pickFromLibrary}
          fullWidth
        />
      </View>

      {photoUri && (
        <View style={styles.previewRow}>
          <Image source={{ uri: photoUri }} style={styles.preview} contentFit="cover" />
          {extractedHex && (
            <View style={styles.swatchWrap}>
              <View style={[styles.swatch, { backgroundColor: extractedHex }]} />
              <Text style={styles.swatchLabel}>{extractedHex.toUpperCase()}</Text>
            </View>
          )}
        </View>
      )}

      {status === 'extracting' && (
        <Text style={styles.statusText}>Analyzing photo and matching tiles…</Text>
      )}

      {status === 'error' && errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

      {status === 'done' && (
        <View style={styles.results}>
          <Text style={typography.h2}>Closest Matches</Text>
          <ProductGrid products={matches} emptyMessage="No close matches found." />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.stone },
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  subtitle: { ...typography.body, color: colors.muted },
  actions: { gap: 12 },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  preview: { width: 120, height: 120, borderRadius: 12, backgroundColor: colors.surface },
  swatchWrap: { alignItems: 'center', gap: 6 },
  swatch: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: colors.border },
  swatchLabel: { ...typography.caption, color: colors.muted },
  statusText: { ...typography.body, color: colors.muted },
  errorText: { ...typography.body, color: colors.error },
  results: { gap: 12 },
});
