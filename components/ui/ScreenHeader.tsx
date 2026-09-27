import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { makeStyles, typography } from '@/lib/theme';

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  /** Right-aligned actions, e.g. IconButtons. */
  right?: ReactNode;
};

/**
 * Large-title header for tab screens (their navigator header is hidden). Pads for
 * the status bar / notch itself, so it must be the first thing in the screen.
 */
export function ScreenHeader({ title, subtitle, right }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.row}>
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
        {right ? <View style={styles.right}>{right}</View> : null}
      </View>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  container: { paddingHorizontal: 16, paddingBottom: 8, gap: 4 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  title: { ...typography.h1, color: c.text, flexShrink: 1 },
  right: { flexDirection: 'row', gap: 8 },
  subtitle: { ...typography.body, color: c.textMuted },
}));
