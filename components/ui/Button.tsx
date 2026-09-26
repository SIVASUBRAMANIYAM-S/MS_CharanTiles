import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { type ReactNode, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native';

import { colors } from '@/lib/theme/colors';
import { fontFamily } from '@/lib/theme/typography';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
};

const labelColor: Record<ButtonVariant, string> = {
  primary: colors.white,
  secondary: colors.ink,
  outline: colors.primary,
  ghost: colors.primary,
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
  const inactive = disabled || loading;

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
        animate={{ scale: pressed && !inactive ? 0.96 : 1 }}
        transition={{ type: 'timing', duration: 120 }}
        style={[styles.base, sizeStyles[size], variantStyles[variant], disabled && styles.disabled]}
      >
        {variant === 'primary' && (
          <LinearGradient
            colors={[colors.navy, colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        )}
        {/* Label stays mounted (just hidden) while loading so the button keeps its size. */}
        <View style={[styles.content, loading && styles.hidden]}>
          {icon}
          <Text style={[styles.label, labelSizeStyles[size], { color: labelColor[variant] }]}>
            {label}
          </Text>
        </View>
        {loading && (
          <View style={styles.spinner}>
            <ActivityIndicator color={labelColor[variant]} />
          </View>
        )}
      </MotiView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  inline: { alignSelf: 'flex-start' },
  fullWidth: { alignSelf: 'stretch' },
  base: {
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  label: { fontFamily: fontFamily.bodySemiBold },
  disabled: { opacity: 0.5 },
});

// Lookup maps are plain typed objects: react-native/no-unused-styles can't follow
// computed access like sizeStyles[size] into a StyleSheet.create block.
const sizeStyles: Record<ButtonSize, ViewStyle> = {
  sm: { height: 36, paddingHorizontal: 14 },
  md: { height: 48, paddingHorizontal: 20 },
  lg: { height: 56, paddingHorizontal: 28 },
};

const labelSizeStyles: Record<ButtonSize, TextStyle> = {
  sm: { fontSize: 14 },
  md: { fontSize: 16 },
  lg: { fontSize: 18 },
};

const variantStyles: Record<ButtonVariant, ViewStyle> = {
  primary: {},
  secondary: { backgroundColor: colors.surface },
  outline: { borderWidth: 1.5, borderColor: colors.primary },
  ghost: {},
};
