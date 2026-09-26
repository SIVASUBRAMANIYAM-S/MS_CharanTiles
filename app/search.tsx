import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, Stack } from 'expo-router';
import { Camera, CaretRight, MagnifyingGlass, X } from '@/components/ui/icons';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { ProductGrid } from '@/components/catalog/ProductGrid';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { searchProducts, type ProductCardData } from '@/lib/queries/products';
import { makeStyles, radius, typography, useTheme } from '@/lib/theme';

const RECENT_SEARCHES_KEY = 'mscharantiles.recentSearches';
const MAX_RECENT = 8;
const POPULAR_SEARCHES = ['Marble', 'Matte finish', 'Wood look', 'Outdoor', 'Kitchen'];
const DEBOUNCE_MS = 400;

export default function SearchScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
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

  const persistRecent = (next: string[]) => {
    setRecentSearches(next);
    AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next)).catch((error: unknown) =>
      console.warn('Failed to save recent searches', error),
    );
  };

  const saveRecentSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    persistRecent([trimmed, ...recentSearches.filter((s) => s !== trimmed)].slice(0, MAX_RECENT));
  };

  const runSearch = (term: string) => {
    if (!term.trim()) {
      setResults(null);
      return;
    }
    setResults(null);
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
    saveRecentSearch(query);
  };

  const handleChipPress = (term: string) => {
    setQuery(term);
    runSearch(term);
    saveRecentSearch(term);
  };

  const handleClear = () => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    setQuery('');
    setResults(null);
  };

  const showingResults = query.trim().length > 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Stack.Screen options={{ title: 'Search' }} />

      <View style={styles.searchBar}>
        <MagnifyingGlass size={20} color={colors.textMuted} weight="bold" />
        <TextInput
          value={query}
          onChangeText={handleChangeText}
          onSubmitEditing={handleSubmit}
          placeholder="Search by name, finish or room"
          placeholderTextColor={colors.textFaint}
          selectionColor={colors.accent}
          style={styles.searchInput}
          returnKeyType="search"
          autoFocus
          accessibilityLabel="Search tiles"
        />
        {query.length > 0 && (
          <Pressable
            onPress={handleClear}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
          >
            <X size={18} color={colors.textMuted} weight="bold" />
          </Pressable>
        )}
      </View>

      {showingResults ? (
        <View style={styles.section}>
          {results && results.length > 0 && (
            <Text style={styles.resultCount}>
              {results.length} {results.length === 1 ? 'result' : 'results'}
            </Text>
          )}
          <ProductGrid products={results} emptyMessage={`No tiles match "${query.trim()}"`} />
        </View>
      ) : (
        <>
          <Card
            variant="accent"
            onPress={() => router.push('/find-tile')}
            accessibilityLabel="Find this tile from a photo"
          >
            <View style={styles.promoRow}>
              <View style={styles.promoIcon}>
                <Camera size={20} color={colors.onAccent} weight="fill" />
              </View>
              <View style={styles.promoText}>
                <Text style={styles.promoTitle}>Search with a photo</Text>
                <Text style={styles.promoBody}>Match the colour of any tile you&apos;ve seen.</Text>
              </View>
              <CaretRight size={18} color={colors.accentInk} weight="bold" />
            </View>
          </Card>

          {recentSearches.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>Recent</Text>
                <Pressable onPress={() => persistRecent([])} accessibilityRole="button" hitSlop={8}>
                  <Text style={styles.link}>Clear</Text>
                </Pressable>
              </View>
              <View style={styles.chipRow}>
                {recentSearches.map((term) => (
                  <Chip key={term} label={term} onPress={() => handleChipPress(term)} />
                ))}
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Popular</Text>
            <View style={styles.chipRow}>
              {POPULAR_SEARCHES.map((term) => (
                <Chip key={term} label={term} onPress={() => handleChipPress(term)} />
              ))}
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const useStyles = makeStyles((c) => ({
  container: { flex: 1, backgroundColor: c.bg },
  content: { padding: 16, gap: 24, paddingBottom: 40 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: c.surfaceAlt,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    height: 52,
  },
  searchInput: { ...typography.body, flex: 1, color: c.text, height: '100%' },
  section: { gap: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionLabel: { ...typography.label, color: c.textMuted },
  link: { ...typography.label, color: c.accentInk },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  resultCount: { ...typography.body, color: c.textMuted },
  promoRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  promoIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: c.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoText: { flex: 1, gap: 2 },
  promoTitle: { ...typography.h3, color: c.text },
  promoBody: { ...typography.body, fontSize: 14, lineHeight: 20, color: c.textMuted },
}));
