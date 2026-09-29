import { type Href, router, Stack, useLocalSearchParams } from 'expo-router';
import { ShieldCheck, WarningCircle } from '@/components/ui/icons';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/lib/store/auth';
import { makeStyles, radius, typography, useTheme } from '@/lib/theme';
import { MOCK_OTP_CODE, otpSchema } from '@/lib/validation';

type FormValues = { code: string };

const RESEND_SECONDS = 60;

export default function VerifyOtpScreen() {
  const { phone, redirect } = useLocalSearchParams<{ phone: string; redirect?: string }>();
  const { colors } = useTheme();
  const styles = useStyles();
  const attachPhone = useAuthStore((state) => state.attachPhone);

  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ defaultValues: { code: '' } });

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const onSubmit = handleSubmit(async ({ code }) => {
    setSubmitError(null);

    // No SMS was ever sent — this just checks the value against the fixed
    // mock code. See Phase 5 notes: real OTP verification is out of scope.
    if (code !== MOCK_OTP_CODE) {
      setError('code', { type: 'manual', message: 'Incorrect code, try again' });
      return;
    }

    try {
      await attachPhone(phone);
      router.replace((redirect as Href | undefined) ?? '/(tabs)/profile');
    } catch (error) {
      console.warn('Failed to attach phone', error);
      const inUse = (error as { code?: string } | null)?.code === '23505';
      setSubmitError(
        inUse
          ? 'This number is linked to another account. Please try again shortly.'
          : 'We could not sign you in. Check your connection and try again.',
      );
    }
  });

  const handleResend = () => {
    if (countdown > 0) return;
    // Cosmetic only: nothing was sent the first time, so there's nothing to resend.
    setCountdown(RESEND_SECONDS);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: '' }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.icon}>
          <ShieldCheck size={30} color={colors.onAccent} weight="fill" />
        </View>
        <Text style={styles.title}>Enter the code</Text>
        <Text style={styles.subtitle}>
          Sent to <Text style={styles.phone}>+91 {phone}</Text>
        </Text>

        <Controller
          control={control}
          name="code"
          rules={{
            validate: (value) => {
              const result = otpSchema.safeParse(value);
              return result.success || (result.error.issues[0]?.message ?? 'Invalid code');
            },
          }}
          render={({ field: { value, onChange, onBlur } }) => (
            <Input
              label="6-digit code"
              placeholder="123456"
              keyboardType="number-pad"
              maxLength={6}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.code?.message}
              autoComplete="one-time-code"
              textContentType="oneTimeCode"
              autoFocus
              style={styles.codeInput}
            />
          )}
        />

        {submitError && (
          <View style={styles.error}>
            <WarningCircle size={20} color={colors.error} weight="fill" />
            <Text style={styles.errorText}>{submitError}</Text>
          </View>
        )}

        <Button label="Verify" onPress={onSubmit} loading={isSubmitting} fullWidth size="lg" />

        <Pressable
          onPress={handleResend}
          disabled={countdown > 0}
          accessibilityRole="button"
          style={styles.resend}
        >
          <Text style={[styles.resendText, countdown > 0 && styles.resendTextDisabled]}>
            {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend code'}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const useStyles = makeStyles((c) => ({
  container: { flex: 1, backgroundColor: c.bg },
  content: { padding: 24, gap: 20 },
  icon: {
    width: 60,
    height: 60,
    borderRadius: radius.lg,
    backgroundColor: c.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { ...typography.h1, color: c.text, marginTop: -4 },
  subtitle: { ...typography.body, color: c.textMuted, marginTop: -8 },
  phone: { ...typography.bodyMedium, color: c.text },
  codeInput: {
    ...typography.h2,
    letterSpacing: 8,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  error: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: c.errorSoft,
  },
  errorText: { ...typography.body, color: c.text, flex: 1 },
  resend: { alignSelf: 'center', padding: 6 },
  resendText: { ...typography.label, color: c.accentInk },
  resendTextDisabled: { color: c.textMuted },
}));
