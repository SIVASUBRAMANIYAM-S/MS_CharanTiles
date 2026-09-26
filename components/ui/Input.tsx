import { forwardRef, useState } from 'react';
import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';

import { colors } from '@/lib/theme/colors';
import { typography } from '@/lib/theme/typography';

type InputProps = TextInputProps & {
  label: string;
  error?: string;
  helperText?: string;
};

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, helperText, style, onFocus, onBlur, ...rest },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(error);
  const accent = hasError ? colors.error : focused ? colors.primary : colors.ink;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: accent }]}>{label}</Text>
      <TextInput
        ref={ref}
        accessibilityLabel={label}
        placeholderTextColor={colors.muted}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={[styles.input, focused && styles.inputFocused, hasError && styles.inputError, style]}
        {...rest}
      />
      {hasError ? (
        <Text style={[styles.message, styles.errorText]}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.message}>{helperText}</Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { gap: 6 },
  label: { ...typography.caption, fontFamily: typography.bodyMedium.fontFamily },
  input: {
    ...typography.body,
    color: colors.ink,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputFocused: { borderColor: colors.primary },
  inputError: { borderColor: colors.error },
  message: { ...typography.caption, color: colors.muted },
  errorText: { color: colors.error },
});
