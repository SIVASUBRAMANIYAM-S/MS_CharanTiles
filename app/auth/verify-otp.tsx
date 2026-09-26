import { type Href, router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/lib/store/auth';
import { colors } from '@/lib/theme/colors';
import { typography } from '@/lib/theme/typography';
import { MOCK_OTP_CODE, otpSchema } from '@/lib/validation';

type FormValues = { code: string };

const RESEND_SECONDS = 60;

export default function VerifyOtpScreen() {
  const { phone, redirect } = useLocalSearchParams<{ phone: string; redirect?: string }>();
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
      setSubmitError('Could not save this number — it may already be in use on another account.');
    }
  });

  const handleResend = () => {
    if (countdown > 0) return;
    // Cosmetic only: nothing was sent the first time, so there's nothing to resend.
    setCountdown(RESEND_SECONDS);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Verify code' }} />
      <Text style={typography.h1}>Enter the code</Text>
      <Text style={styles.subtitle}>We sent a 6-digit code to {phone}</Text>

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
            autoFocus
          />
        )}
      />

      {submitError && <Text style={styles.errorText}>{submitError}</Text>}

      <Button label="Verify" onPress={onSubmit} loading={isSubmitting} fullWidth />

      <Pressable onPress={handleResend} disabled={countdown > 0} accessibilityRole="button">
        <Text style={[styles.resendText, countdown > 0 && styles.resendTextDisabled]}>
          {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.stone, padding: 16, gap: 16 },
  subtitle: { ...typography.body, color: colors.muted },
  errorText: { ...typography.body, color: colors.error },
  resendText: { ...typography.bodyMedium, color: colors.primary, textAlign: 'center' },
  resendTextDisabled: { color: colors.muted },
});
