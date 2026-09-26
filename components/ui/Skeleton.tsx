import { useEffect } from 'react';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { makeStyles } from '@/lib/theme';

type SkeletonProps = {
  width: number | `${number}%`;
  height: number;
  borderRadius?: number;
};

export function Skeleton({ width, height, borderRadius = 8 }: SkeletonProps) {
  const styles = useStyles();
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    if (reduceMotion) return;
    opacity.value = withRepeat(withTiming(1, { duration: 850 }), -1, true);
    return () => cancelAnimation(opacity);
  }, [opacity, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.base, { width, height, borderRadius }, animatedStyle]}
    />
  );
}

const useStyles = makeStyles((c) => ({
  base: { backgroundColor: c.surfaceAlt },
}));
