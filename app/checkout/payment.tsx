import { router, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { type CartLineDetail, clearCartItems, getCartLineDetails } from '@/lib/queries/cart';
import { createOrder } from '@/lib/queries/orders';
import { useAuthStore } from '@/lib/store/auth';
import { useCartStore } from '@/lib/store/cart';
import { useCheckoutStore } from '@/lib/store/checkout';
import { colors } from '@/lib/theme/colors';
import { typography } from '@/lib/theme/typography';
import {
  cardCvvSchema,
  cardExpirySchema,
  cardNameSchema,
  cardNumberSchema,
  TEST_CARD,
} from '@/lib/validation';

type FormValues = {
  number: string;
  expiry: string;
  cvv: string;
  name: string;
};

function formatCardNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

export default function CheckoutPaymentScreen() {
  const userId = useAuthStore((state) => state.user?.id);
  const address = useCheckoutStore((state) => state.address);
  const items = useCartStore((state) => state.items);
  const clearLocalCart = useCartStore((state) => state.clear);

  const [lines, setLines] = useState<CartLineDetail[] | null>(null);
  const [processing, setProcessing] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { number: '', expiry: '', cvv: '', name: '' } });

  // Mount-only (empty deps) — see the matching comment in checkout/review.tsx:
  // a reactive dependency here would re-fire and redirect this still-mounted
  // screen when this same onSubmit clears the draft address after success.
  useEffect(() => {
    if (!address) {
      router.replace('/checkout/address');
    }
  }, []);

  useEffect(() => {
    if (!address) return;
    getCartLineDetails(items)
      .then(setLines)
      .catch((error: unknown) => {
        console.warn('Failed to load payment summary', error);
        setLines([]);
      });
  }, [address, items]);

  const handleUseTestCard = () => {
    setValue('number', TEST_CARD.number);
    setValue('expiry', TEST_CARD.expiry);
    setValue('cvv', TEST_CARD.cvv);
    setValue('name', TEST_CARD.name);
  };

  const subtotal = (lines ?? []).reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);

  const onSubmit = handleSubmit(async () => {
    if (!userId || !address || !lines || lines.length === 0) return;
    setSubmitError(null);
    setProcessing(true);
    try {
      // Mock payment — no real gateway (see Phase 6 notes). A brief delay stands
      // in for the network round trip a real charge would take.
      await new Promise((resolve) => setTimeout(resolve, 1400));
      const mockPaymentId = `MOCK-${Date.now().toString(36).toUpperCase()}`;
      const orderId = await createOrder(userId, address, lines, subtotal, mockPaymentId);

      clearLocalCart();
      await clearCartItems(userId).catch((error: unknown) =>
        console.warn('Failed to clear remote cart after order', error),
      );
      // Not resetCheckout() here: this screen's own effect re-runs on `address`
      // changing and would race its "no address -> back to /checkout/address"
      // redirect against this navigation. Confirmation resets it instead, once
      // this screen is safely unmounted.
      router.replace({ pathname: '/checkout/confirmation', params: { orderId } });
    } catch (error) {
      console.warn('Order creation failed', error);
      setSubmitError('Something went wrong placing your order. Please try again.');
    } finally {
      setProcessing(false);
    }
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: 'Payment' }} />

      <Text style={styles.subtitle}>
        This is a demo checkout — no real card is charged. Use any 16-digit number, or tap below to
        autofill a test card.
      </Text>

      <Button label="Use test card" variant="outline" onPress={handleUseTestCard} />

      <Controller
        control={control}
        name="number"
        rules={{
          validate: (value) => {
            const result = cardNumberSchema.safeParse(value);
            return result.success || (result.error.issues[0]?.message ?? 'Invalid card number');
          },
        }}
        render={({ field: { value, onChange, onBlur } }) => (
          <Input
            label="Card number"
            placeholder="1234 5678 9012 3456"
            keyboardType="number-pad"
            maxLength={19}
            value={value}
            onChangeText={(text) => onChange(formatCardNumber(text))}
            onBlur={onBlur}
            error={errors.number?.message}
          />
        )}
      />

      <View style={styles.row}>
        <View style={styles.half}>
          <Controller
            control={control}
            name="expiry"
            rules={{
              validate: (value) => {
                const result = cardExpirySchema.safeParse(value);
                return result.success || (result.error.issues[0]?.message ?? 'Invalid expiry');
              },
            }}
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                label="Expiry (MM/YY)"
                placeholder="12/29"
                keyboardType="number-pad"
                maxLength={5}
                value={value}
                onChangeText={(text) => onChange(formatExpiry(text))}
                onBlur={onBlur}
                error={errors.expiry?.message}
              />
            )}
          />
        </View>
        <View style={styles.half}>
          <Controller
            control={control}
            name="cvv"
            rules={{
              validate: (value) => {
                const result = cardCvvSchema.safeParse(value);
                return result.success || (result.error.issues[0]?.message ?? 'Invalid CVV');
              },
            }}
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                label="CVV"
                placeholder="123"
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.cvv?.message}
              />
            )}
          />
        </View>
      </View>

      <Controller
        control={control}
        name="name"
        rules={{
          validate: (value) => {
            const result = cardNameSchema.safeParse(value);
            return result.success || (result.error.issues[0]?.message ?? 'Invalid name');
          },
        }}
        render={({ field: { value, onChange, onBlur } }) => (
          <Input
            label="Name on card"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.name?.message}
          />
        )}
      />

      {submitError && <Text style={styles.errorText}>{submitError}</Text>}

      <Button
        label={lines ? `Pay ₹${subtotal.toFixed(0)}` : 'Pay'}
        onPress={onSubmit}
        loading={processing}
        disabled={!lines || lines.length === 0}
        fullWidth
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.stone },
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  subtitle: { ...typography.body, color: colors.muted },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  errorText: { ...typography.body, color: colors.error },
});
