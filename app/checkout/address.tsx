import { router, Stack } from 'expo-router';
import { Controller, type Control, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/lib/store/auth';
import { useCheckoutStore } from '@/lib/store/checkout';
import { colors } from '@/lib/theme/colors';
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

export default function CheckoutAddressScreen() {
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: 'Delivery address' }} />

      <Field
        control={control}
        name="fullName"
        label="Full name"
        error={errors.fullName?.message}
        validate={(value) => {
          const result = fullNameSchema.safeParse(value);
          return result.success || (result.error.issues[0]?.message ?? 'Invalid name');
        }}
      />
      <Field
        control={control}
        name="phone"
        label="Phone number"
        keyboardType="phone-pad"
        maxLength={10}
        error={errors.phone?.message}
        validate={(value) => {
          const result = phoneSchema.safeParse(value);
          return result.success || (result.error.issues[0]?.message ?? 'Invalid number');
        }}
      />
      <Field
        control={control}
        name="line1"
        label="Address line 1"
        error={errors.line1?.message}
        validate={(value) => {
          const result = addressLineSchema.safeParse(value);
          return result.success || (result.error.issues[0]?.message ?? 'Invalid address');
        }}
      />
      <Field control={control} name="line2" label="Address line 2 (optional)" />
      <View style={styles.row}>
        <View style={styles.half}>
          <Field
            control={control}
            name="city"
            label="City"
            error={errors.city?.message}
            validate={(value) => {
              const result = citySchema.safeParse(value);
              return result.success || (result.error.issues[0]?.message ?? 'Invalid city');
            }}
          />
        </View>
        <View style={styles.half}>
          <Field
            control={control}
            name="state"
            label="State"
            error={errors.state?.message}
            validate={(value) => {
              const result = stateSchema.safeParse(value);
              return result.success || (result.error.issues[0]?.message ?? 'Invalid state');
            }}
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
        validate={(value) => {
          const result = pincodeSchema.safeParse(value);
          return result.success || (result.error.issues[0]?.message ?? 'Invalid pincode');
        }}
      />

      <Button label="Continue to Review" onPress={onSubmit} fullWidth />
    </ScrollView>
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
}: {
  control: Control<FormValues>;
  name: keyof FormValues;
  label: string;
  error?: string;
  validate?: (value: string) => true | string;
  keyboardType?: 'phone-pad' | 'number-pad';
  maxLength?: number;
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
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.stone },
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
});
