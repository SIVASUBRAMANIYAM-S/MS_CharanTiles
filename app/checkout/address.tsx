import { router, Stack } from 'expo-router';
import { ArrowRight } from '@/components/ui/icons';
import { type Control, Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CheckoutSteps } from '@/components/checkout/CheckoutSteps';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/lib/store/auth';
import { useCheckoutStore } from '@/lib/store/checkout';
import { makeStyles, typography } from '@/lib/theme';
import {
  addressLineSchema,
  citySchema,
  fullNameSchema,
  phoneSchema,
  pincodeSchema,
  stateSchema,
} from '@/lib/validation';

type FormValues = {
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
};

function validateWith(schema: {
  safeParse: (v: string) => { success: boolean; error?: { issues: { message: string }[] } };
}) {
  return (value: string) => {
    const result = schema.safeParse(value);
    return result.success || (result.error?.issues[0]?.message ?? 'Invalid value');
  };
}

export default function CheckoutAddressScreen() {
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const profile = useAuthStore((state) => state.profile);
  const draftAddress = useCheckoutStore((state) => state.address);
  const setAddress = useCheckoutStore((state) => state.setAddress);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: draftAddress ?? {
      fullName: profile?.full_name ?? '',
      phone: profile?.phone ?? '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      pincode: '',
    },
  });

  const onSubmit = handleSubmit((values) => {
    setAddress({ ...values, line2: values.line2.trim() });
    router.push('/checkout/review');
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: 'Checkout' }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <CheckoutSteps current={0} />
        <View style={styles.header}>
          <Text style={styles.title}>Delivery address</Text>
          <Text style={styles.subtitle}>Where should we deliver your tiles?</Text>
        </View>

        <View style={styles.group}>
          <Text style={styles.groupLabel}>Contact</Text>
          <Field
            control={control}
            name="fullName"
            label="Full name"
            error={errors.fullName?.message}
            validate={validateWith(fullNameSchema)}
            autoComplete="name"
          />
          <Field
            control={control}
            name="phone"
            label="Phone number"
            keyboardType="phone-pad"
            maxLength={10}
            error={errors.phone?.message}
            validate={validateWith(phoneSchema)}
            autoComplete="tel"
          />
        </View>

        <View style={styles.group}>
          <Text style={styles.groupLabel}>Address</Text>
          <Field
            control={control}
            name="line1"
            label="Address line 1"
            error={errors.line1?.message}
            validate={validateWith(addressLineSchema)}
            autoComplete="street-address"
          />
          <Field control={control} name="line2" label="Address line 2 (optional)" />
          <View style={styles.row}>
            <View style={styles.half}>
              <Field
                control={control}
                name="city"
                label="City"
                error={errors.city?.message}
                validate={validateWith(citySchema)}
              />
            </View>
            <View style={styles.half}>
              <Field
                control={control}
                name="state"
                label="State"
                error={errors.state?.message}
                validate={validateWith(stateSchema)}
              />
            </View>
          </View>
          <Field
            control={control}
            name="pincode"
            label="Pincode"
            keyboardType="number-pad"
            maxLength={6}
            error={errors.pincode?.message}
            validate={validateWith(pincodeSchema)}
            autoComplete="postal-code"
          />
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: 12 + insets.bottom }]}>
        <Button
          label="Continue to review"
          onPress={onSubmit}
          fullWidth
          size="lg"
          icon={(color) => <ArrowRight size={18} color={color} weight="bold" />}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

// Small local wrapper so each field isn't a 10-line Controller block above.
function Field({
  control,
  name,
  label,
  error,
  validate,
  keyboardType,
  maxLength,
  autoComplete,
}: {
  control: Control<FormValues>;
  name: keyof FormValues;
  label: string;
  error?: string;
  validate?: (value: string) => true | string;
  keyboardType?: 'phone-pad' | 'number-pad';
  maxLength?: number;
  autoComplete?: 'name' | 'tel' | 'street-address' | 'postal-code';
}) {
  return (
    <Controller
      control={control}
      name={name}
      rules={validate ? { validate } : undefined}
      render={({ field: { value, onChange, onBlur } }) => (
        <Input
          label={label}
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          error={error}
          keyboardType={keyboardType}
          maxLength={maxLength}
          autoComplete={autoComplete}
        />
      )}
    />
  );
}

const useStyles = makeStyles((c) => ({
  container: { flex: 1, backgroundColor: c.bg },
  content: { padding: 16, gap: 24, paddingBottom: 24 },
  header: { gap: 4 },
  title: { ...typography.h1, color: c.text },
  subtitle: { ...typography.body, color: c.textMuted },
  group: { gap: 16 },
  groupLabel: { ...typography.h3, color: c.text },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: c.surface,
    borderTopWidth: 1,
    borderTopColor: c.border,
  },
}));
