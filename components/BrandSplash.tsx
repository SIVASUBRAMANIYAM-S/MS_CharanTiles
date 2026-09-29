import { Image } from 'expo-image';
import { MotiView } from 'moti';
import { useReducedMotion } from 'react-native-reanimated';

import { brand, makeStyles } from '@/lib/theme';

/**
 * Full-screen in-app splash shown after the native splash hides, while auth
 * init finishes. Charcoal in both color modes: it continues the native splash
 * (same background) and is the one fixed brand moment in the app.
 */
export function BrandSplash() {
  const styles = useStyles();
  const reduceMotion = useReducedMotion();

  return (
    <MotiView style={styles.container}>
      <MotiView
        from={reduceMotion ? undefined : { opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'timing', duration: 600 }}
      >
        <Image
          // Metro resolves local image requires at bundle time; no ESM type exists for them.
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          source={require('@/assets/images/splash-icon.png')}
          style={styles.logo}
          contentFit="contain"
          accessibilityLabel="Charan Tiles"
        />
      </MotiView>
      <MotiView
        from={reduceMotion ? undefined : { scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ type: 'timing', duration: 700, delay: 250 }}
        style={styles.rule}
      />
    </MotiView>
  );
}

const useStyles = makeStyles(() => ({
  container: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brand.charcoal,
    zIndex: 10,
  },
  logo: { width: 200, height: 200 },
  rule: { width: 64, height: 2, borderRadius: 1, backgroundColor: brand.gold, marginTop: 4 },
}));
