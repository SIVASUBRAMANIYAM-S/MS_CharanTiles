import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { colors } from '@/lib/theme/colors';
import { typography } from '@/lib/theme/typography';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text>(tabs)/index</Text>
      {__DEV__ && <UiKitPreview />}
    </View>
  );
}

// TEMPORARY (Phase 3): visual check of the UI kit. Remove in Phase 4 once real content lands.
function UiKitPreview() {
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState('Matte');
  const [phone, setPhone] = useState('');

  const simulateLoading = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <ScrollView style={styles.preview} contentContainerStyle={styles.previewContent}>
      <Text style={typography.h1}>Heading 1</Text>
      <Text style={typography.h2}>Heading 2</Text>
      <Text style={typography.h3}>Heading 3</Text>
      <Text style={typography.body}>Body — Inter Regular 16/24</Text>
      <Text style={typography.bodyMedium}>Body Medium — Inter Medium 16/24</Text>
      <Text style={typography.caption}>Caption — Inter Regular 13/18</Text>

      <Button label="Primary" onPress={simulateLoading} loading={loading} />
      <Button label="Secondary" variant="secondary" onPress={() => {}} />
      <Button label="Outline" variant="outline" size="sm" onPress={() => {}} />
      <Button label="Ghost" variant="ghost" size="lg" onPress={() => {}} />
      <Button label="Disabled" disabled onPress={() => {}} />
      <Button label="Full width" fullWidth onPress={() => {}} />

      <View style={styles.row}>
        {['Matte', 'Glossy', 'Satin'].map((finish) => (
          <Chip
            key={finish}
            label={finish}
            selected={selected === finish}
            onPress={() => setSelected(finish)}
          />
        ))}
      </View>

      <View style={styles.row}>
        <Badge label="Featured" tone="featured" />
        <Badge label="Low stock" tone="lowStock" />
        <Badge label="Out of stock" tone="outOfStock" />
        <Badge label="600x600mm" />
      </View>

      <Input
        label="Phone number"
        placeholder="10-digit mobile"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        helperText="We'll send an OTP to this number"
        error={phone.length > 0 && phone.length < 10 ? 'Enter all 10 digits' : undefined}
      />

      <Card>
        <Text style={typography.h3}>Surface card</Text>
        <Text style={typography.body}>Default card with a soft shadow.</Text>
      </Card>

      <View style={styles.glassBackdrop}>
        <Card variant="glass">
          <Text style={typography.h3}>Glass card</Text>
          <Text style={typography.body}>BlurView over a colored backdrop.</Text>
        </Card>
      </View>

      <View style={styles.row}>
        <Skeleton width={96} height={96} borderRadius={12} />
        <View style={styles.skeletonLines}>
          <Skeleton width="80%" height={16} />
          <Skeleton width="50%" height={14} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  preview: { alignSelf: 'stretch', backgroundColor: colors.stone },
  previewContent: { padding: 16, gap: 12 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  glassBackdrop: { backgroundColor: colors.sky, borderRadius: 16, padding: 16 },
  skeletonLines: { flex: 1, gap: 8 },
});
