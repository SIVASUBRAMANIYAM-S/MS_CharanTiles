import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { makeStyles, radius, typography } from '@/lib/theme';

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ icon, title, body, actionLabel, onAction }: EmptyStateProps) {
  const styles = useStyles();
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>{icon}</View>
      <Text style={styles.title}>{title}</Text>
      {body ? <Text style={styles.body}>{body}</Text> : null}
      {actionLabel && onAction ? (
        <View style={styles.action}>
          <Button label={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  container: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24, gap: 8 },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    backgroundColor: c.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: { ...typography.h2, color: c.text, textAlign: 'center' },
  body: { ...typography.body, color: c.textMuted, textAlign: 'center', maxWidth: 300 },
  action: { marginTop: 12 },
}));
