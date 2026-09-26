import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { ProductGrid } from '@/components/catalog/ProductGrid';
import { Chip } from '@/components/ui/Chip';
import { searchProducts, type ProductCardData } from '@/lib/queries/products';
import { colors } from '@/lib/theme/colors';
import { typography } from '@/lib/theme/typography';

const RECENT_SEARCHES_KEY = 'mscharantiles.recentSearches';
const MAX_RECENT = 8;
const POPULAR_SEARCHES = ['Bathroom Tiles', 'Kitchen Tiles', 'Matte Finish', 'Outdoor'];
const DEBOUNCE_MS = 400;

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProductCardData[] | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(RECENT_SEARCHES_KEY)
      .then((raw) => {
        if (raw) setRecentSearches(JSON.parse(raw) as string[]);
      })
      .catch((error: unknown) => console.warn('Failed to load recent searches', error));
  }, []);

  const saveRecentSearch = async (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    const next = [trimmed, ...recentSearches.filter((s) => s !== trimmed)].slice(0, MAX_RECENT);
    setRecentSearches(next);
    try {
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
    } catch (error) {
      console.warn('Failed to save recent search', error);
    }
  };

  const runSearch = (term: string) => {
    if (!term.trim()) {
      setResults(null);
      return;
    }
    searchProducts(term)
      .then(setResults)
      .catch((error: unknown) => {
        console.warn('Search failed', error);
        setResults([]);
      });
  };

  const handleChangeText = (text: string) => {
    setQuery(text);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => runSearch(text), DEBOUNCE_MS);
  };

  const handleSubmit = () => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    runSearch(query);
    void saveRecentSearch(query);
  };

  const handleChipPress = (term: string) => {
    setQuery(term);
    runSearch(term);
    void saveRecentSearch(term);
  };

  const showingResults = query.trim().length > 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: 'Search' }} />
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.muted} />
        <TextInput
          value={query}
          onChangeText={handleChangeText}
          onSubmitEditing={handleSubmit}
          placeholder="Search tiles by name or description"
          placeholderTextColor={colors.muted}
          style={styles.searchInput}
          returnKeyType="search"
          accessibilityLabel="Search tiles"
        />
      </View>

      <Pressable
        onPress={() => router.push('/find-tile')}
        style={styles.findTileButton}
        accessibilityRole="button"
      >
        <Ionicons name="camera" size={18} color={colors.primary} />
        <Text style={styles.findTileText}>Find this tile from a photo</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.muted} />
      </Pressable>

      {!showingResults && recentSearches.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Recent Searches</Text>
          <View style={styles.chipRow}>
            {recentSearches.map((term) => (
              <Chip key={term} label={term} onPress={() => handleChipPress(term)} />
            ))}
          </View>
        </View>
      )}

      {!showingResults && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Popular Searches</Text>
          <View style={styles.chipRow}>
            {POPULAR_SEARCHES.map((term) => (
              <Chip key={term} label={term} onPress={() => handleChipPress(term)} />
            ))}
          </View>
        </View>
      )}

      {showingResults && (
        <View style={styles.section}>
          <ProductGrid products={results} emptyMessage="No tiles match your search." />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.stone },
  content: { padding: 16, gap: 20, paddingBottom: 32 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    height: 48,
  },
  searchInput: { ...typography.body, flex: 1, color: colors.ink },
  findTileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  findTileText: { ...typography.bodyMedium, color: colors.primary, flex: 1 },
  section: { gap: 10 },
  sectionLabel: { ...typography.bodyMedium, color: colors.ink },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
