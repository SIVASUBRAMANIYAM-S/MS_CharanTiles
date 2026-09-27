import { router, Stack, useLocalSearchParams } from 'expo-router';
import { MotiView } from 'moti';
import { CheckCircle, Phone } from '@/components/ui/icons';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { makeStyles, radius, typography, useTheme } from '@/lib/theme';
import { phoneSchema } from '@/lib/validation';

type FormValues = { phone: string };

export default function LoginScreen() {
  const { redirect } = useLocalSearchParams<{ redirect?: string }>();
  const { colors } = useTheme();
  const styles = useStyles();
  const [sentMessage, setSentMessage] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ defaultValues: { phone: '' } });

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );

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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: '' }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.icon}>
          <Phone size={28} color={colors.onAccent} weight="fill" />
        </View>
        <Text style={styles.title}>What&apos;s your number?</Text>
        <Text style={styles.subtitle}>
          We&apos;ll send a 6-digit code to confirm it. This is a demo, so no SMS is sent: the code
          is always 123456.
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
              autoComplete="tel"
              autoFocus
            />
          )}
        />

        <Button label="Send OTP" onPress={onSubmit} loading={isSubmitting} fullWidth size="lg" />

        {sentMessage && (
          <MotiView
            from={{ opacity: 0, translateY: 6 }}
            animate={{ opacity: 1, translateY: 0 }}
            style={styles.toast}
          >
            <CheckCircle size={18} color={colors.success} weight="fill" />
            <Text style={styles.toastText}>OTP sent</Text>
          </MotiView>
        )}
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
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'center',
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: radius.pill,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  toastText: { ...typography.label, color: c.text },
}));
