import { MotiView } from 'moti';
import { type ReactNode, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { fontFamily, makeStyles, radius, useTheme } from '@/lib/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  /** Rendered left of the label: a node, or a function given the label color for this variant. */
  icon?: ReactNode | ((color: string) => ReactNode);
  fullWidth?: boolean;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
}: ButtonProps) {
  const [pressed, setPressed] = useState(false);
  const reduceMotion = useReducedMotion();
  const { colors } = useTheme();
  const styles = useStyles();
  const inactive = disabled || loading;

  const labelColor: Record<ButtonVariant, string> = {
    primary: colors.onAccent,
    secondary: colors.text,
    outline: colors.text,
    ghost: colors.accentInk,
  };
  const color = labelColor[variant];

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      style={fullWidth ? styles.fullWidth : styles.inline}
    >
      <MotiView
        animate={{ scale: pressed && !inactive && !reduceMotion ? 0.97 : 1 }}
        transition={{ type: 'timing', duration: 110 }}
        style={[
          styles.base,
          sizeStyles[size],
          styles[variant],
          disabled && styles.disabled,
          pressed && !inactive && styles.pressed,
        ]}
      >
        {/* Label stays mounted (just hidden) while loading so the button keeps its size. */}
        <View style={[styles.content, loading && styles.hidden]}>
          {typeof icon === 'function' ? icon(color) : icon}
          <Text style={[styles.label, labelSizeStyles[size], { color }]} numberOfLines={1}>
            {label}
          </Text>
        </View>
        {loading && (
          <View style={styles.spinner}>
            <ActivityIndicator color={color} />
          </View>
        )}
      </MotiView>
    </Pressable>
  );
}

const useStyles = makeStyles((c) => ({
  inline: { alignSelf: 'flex-start' },
  fullWidth: { alignSelf: 'stretch' },
  base: {
    borderRadius: radius.md,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: c.accent },
  secondary: { backgroundColor: c.surfaceAlt },
  outline: { borderWidth: 1.5, borderColor: c.borderStrong },
  ghost: {},
  pressed: { opacity: 0.9 },
  content: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hidden: { opacity: 0 },
  spinner: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontFamily: fontFamily.semiBold },
  disabled: { opacity: 0.45 },
}));

// Lookup maps are plain typed objects: react-native/no-unused-styles can't follow
// computed access like sizeStyles[size] into a StyleSheet.create block.
const sizeStyles: Record<ButtonSize, ViewStyle> = {
  sm: { height: 38, paddingHorizontal: 14 },
  md: { height: 50, paddingHorizontal: 20 },
  lg: { height: 56, paddingHorizontal: 28 },
};

const labelSizeStyles: Record<ButtonSize, TextStyle> = {
  sm: { fontSize: 14 },
  md: { fontSize: 16 },
  lg: { fontSize: 17 },
};
