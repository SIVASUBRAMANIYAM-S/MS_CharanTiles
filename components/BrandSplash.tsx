import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { StyleSheet } from 'react-native';

import { colors } from '@/lib/theme/colors';

/**
 * Full-screen in-app splash shown after the native splash hides, while auth
 * init (and any other startup work) finishes. Distinct from expo-splash-screen's
 * static native splash — this one can animate.
 */
export function BrandSplash() {
  return (
    <LinearGradient
      colors={[colors.navy, colors.primary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <MotiView
        from={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'timing', duration: 500 }}
      >
        <Image
          // Metro resolves local image requires at bundle time; no ESM type exists for them.
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          source={require('@/assets/images/splash-icon.png')}
          style={styles.logo}
          contentFit="contain"
        />
      </MotiView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  logo: { width: 200, height: 200 },
});
