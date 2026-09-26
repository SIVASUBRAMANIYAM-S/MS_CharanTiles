import { CaretRight } from '@/components/ui/icons';
import { Pressable, Text, View } from 'react-native';

import { makeStyles, typography, useTheme } from '@/lib/theme';

type SectionHeaderProps = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`${actionLabel}: ${title}`}
          style={styles.action}
        >
          <Text style={styles.actionLabel}>{actionLabel}</Text>
          <CaretRight size={14} color={colors.accentInk} weight="bold" />
        </Pressable>
      ) : null}
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { ...typography.h2, color: c.text },
  action: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  actionLabel: { ...typography.label, color: c.accentInk },
}));
