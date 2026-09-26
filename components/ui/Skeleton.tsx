import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/lib/theme/colors';

type SkeletonProps = {
  width: number | `${number}%`;
  height: number;
  borderRadius?: number;
};

export function Skeleton({ width, height, borderRadius = 8 }: SkeletonProps) {
  const opacity = useSharedValue(0.45);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 800 }), -1, true);
    return () => cancelAnimation(opacity);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.base, { width, height, borderRadius }, animatedStyle]}
    />
  );
}

const styles = StyleSheet.create({
  base: { backgroundColor: colors.surface },
});
