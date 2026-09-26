import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { colors } from '@/lib/theme/colors';
import { typography } from '@/lib/theme/typography';
import { phoneSchema } from '@/lib/validation';

type FormValues = { phone: string };

export default function LoginScreen() {
  const { redirect } = useLocalSearchParams<{ redirect?: string }>();
  const [sentMessage, setSentMessage] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ defaultValues: { phone: '' } });

  const onSubmit = handleSubmit(({ phone }) => {
    // Mocked — no real SMS provider on this project, so there's nothing to
    // actually send. The brief confirmation is just for demo realism.
    setSentMessage(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setSentMessage(false), 1200);

    router.push({
      pathname: '/auth/verify-otp',
      params: { phone, ...(redirect ? { redirect } : {}) },
    });
  });

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Add phone number' }} />
      <Text style={typography.h1}>What&apos;s your number?</Text>
      <Text style={styles.subtitle}>
        We&apos;ll send a 6-digit code to verify it&apos;s you. This is a demo — no real SMS is
        sent, the code is always 123456.
      </Text>

      <Controller
        control={control}
        name="phone"
        rules={{
          validate: (value) => {
            const result = phoneSchema.safeParse(value);
            return result.success || (result.error.issues[0]?.message ?? 'Invalid number');
          },
        }}
        render={({ field: { value, onChange, onBlur } }) => (
          <Input
            label="Phone number"
            placeholder="10-digit mobile number"
            keyboardType="phone-pad"
            maxLength={10}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.phone?.message}
            autoFocus
          />
        )}
      />

      <Button label="Send OTP" onPress={onSubmit} loading={isSubmitting} fullWidth />

      {sentMessage && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>OTP sent</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.stone, padding: 16, gap: 16 },
  subtitle: { ...typography.body, color: colors.muted },
  toast: {
    backgroundColor: colors.ink,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'center',
  },
  toastText: { ...typography.bodyMedium, color: colors.white },
});
