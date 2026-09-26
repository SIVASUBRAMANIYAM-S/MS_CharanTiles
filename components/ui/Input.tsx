import { forwardRef, useState } from 'react';
import { Text, TextInput, type TextInputProps, View } from 'react-native';

import { makeStyles, radius, typography, useTheme } from '@/lib/theme';

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
  const { colors } = useTheme();
  const styles = useStyles();
  const hasError = Boolean(error);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, hasError && styles.labelError]}>{label}</Text>
      <TextInput
        ref={ref}
        accessibilityLabel={label}
        placeholderTextColor={colors.textFaint}
        selectionColor={colors.accent}
        cursorColor={colors.accent}
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

const useStyles = makeStyles((c) => ({
  container: { gap: 8 },
  label: { ...typography.label, color: c.textMuted },
  labelError: { color: c.error },
  input: {
    ...typography.body,
    color: c.text,
    backgroundColor: c.surfaceAlt,
    borderWidth: 1.5,
    borderColor: c.surfaceAlt,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  inputFocused: { borderColor: c.accent },
  inputError: { borderColor: c.error },
  message: { ...typography.caption, color: c.textMuted },
  errorText: { color: c.error },
}));
