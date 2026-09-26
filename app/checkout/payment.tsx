import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import { CreditCard, Lock, WarningCircle } from '@/components/ui/icons';
import { useEffect, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CheckoutSteps } from '@/components/checkout/CheckoutSteps';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatRupees } from '@/components/ui/Price';
import { type CartLineDetail, clearCartItems, getCartLineDetails } from '@/lib/queries/cart';
import { createOrder } from '@/lib/queries/orders';
import { useAuthStore } from '@/lib/store/auth';
import { useCartStore } from '@/lib/store/cart';
import { useCheckoutStore } from '@/lib/store/checkout';
import { brand, makeStyles, radius, typography, useTheme } from '@/lib/theme';
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

/** Card preview shows only the last 4 digits; the rest are masked as they're typed. */
function maskedNumber(value: string): string {
  const digits = value.replace(/\D/g, '');
  const padded = digits.padEnd(16, '•');
  const masked = padded
    .split('')
    .map((ch, i) => (i < 12 && ch !== '•' ? '•' : ch))
    .join('');
  return masked.replace(/(.{4})/g, '$1 ').trim();
}

function cardNetwork(value: string): string | null {
  if (value.startsWith('4')) return 'VISA';
  if (/^5[1-5]/.test(value)) return 'Mastercard';
  if (/^6/.test(value)) return 'RuPay';
  return null;
}

export default function CheckoutPaymentScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useStyles();
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
  const [cardNumber, cardExpiry, cardName] = useWatch({
    control,
    name: ['number', 'expiry', 'name'],
  });

  // Mount-only (empty deps) — see the matching comment in checkout/review.tsx:
  // a reactive dependency here would re-fire and redirect this still-mounted
  // screen when the draft address is cleared after a successful order.
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
    const opts = { shouldValidate: true } as const;
    setValue('number', TEST_CARD.number, opts);
    setValue('expiry', TEST_CARD.expiry, opts);
    setValue('cvv', TEST_CARD.cvv, opts);
    setValue('name', TEST_CARD.name, opts);
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
      // Not resetCheckout() here: this screen's own effect could race its
      // "no address -> back to /checkout/address" redirect against this
      // navigation. Confirmation resets it instead, once this screen is covered.
      router.replace({ pathname: '/checkout/confirmation', params: { orderId } });
    } catch (error) {
      console.warn('Order creation failed', error);
      setSubmitError('We could not place your order. Check your connection and try again.');
    } finally {
      setProcessing(false);
    }
  });

  const network = cardNetwork(cardNumber.replace(/\D/g, ''));

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: 'Checkout' }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <CheckoutSteps current={2} />
        <Text style={styles.title}>Payment</Text>

        {/* Live preview of the card being entered. Purely visual. */}
        <LinearGradient
          colors={['#23262B', brand.charcoal]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <View style={styles.cardTop}>
            <View style={styles.chip} />
            <Text style={styles.network}>{network ?? ''}</Text>
          </View>
          <Text style={styles.cardNumber}>{maskedNumber(cardNumber)}</Text>
          <View style={styles.cardBottom}>
            <View>
              <Text style={styles.cardLabel}>Card holder</Text>
              <Text style={styles.cardValue} numberOfLines={1}>
                {cardName.trim() ? cardName.toUpperCase() : 'YOUR NAME'}
              </Text>
            </View>
            <View>
              <Text style={styles.cardLabel}>Expires</Text>
              <Text style={styles.cardValue}>{cardExpiry || 'MM/YY'}</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.demoRow}>
          <Text style={styles.demoText}>Demo checkout. No real card is charged.</Text>
          <Button
            label="Use test card"
            variant="ghost"
            size="sm"
            onPress={handleUseTestCard}
            icon={(color) => <CreditCard size={16} color={color} weight="bold" />}
          />
        </View>

        <View style={styles.form}>
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
                autoComplete="cc-number"
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
                    autoComplete="cc-exp"
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
                    autoComplete="cc-csc"
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
                autoCapitalize="words"
                autoComplete="cc-name"
              />
            )}
          />
        </View>

        {submitError && (
          <View style={styles.error}>
            <WarningCircle size={20} color={colors.error} weight="fill" />
            <Text style={styles.errorText}>{submitError}</Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: 12 + insets.bottom }]}>
        <Button
          label={lines ? `Pay ${formatRupees(subtotal)}` : 'Pay'}
          onPress={onSubmit}
          loading={processing}
          disabled={!lines || lines.length === 0}
          fullWidth
          size="lg"
          icon={(color) => <Lock size={18} color={color} weight="bold" />}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const useStyles = makeStyles((c) => ({
  container: { flex: 1, backgroundColor: c.bg },
  content: { padding: 16, gap: 20, paddingBottom: 24 },
  title: { ...typography.h1, color: c.text },
  card: {
    aspectRatio: 1.586,
    borderRadius: radius.xl,
    padding: 22,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(201, 162, 39, 0.45)',
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chip: {
    width: 42,
    height: 32,
    borderRadius: 6,
    backgroundColor: brand.gold,
    opacity: 0.9,
  },
  network: { ...typography.h3, color: c.onImage, letterSpacing: 1 },
  cardNumber: {
    ...typography.h2,
    color: c.onImage,
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
  },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
  cardLabel: { ...typography.caption, fontSize: 10, color: 'rgba(247, 245, 240, 0.6)' },
  cardValue: { ...typography.label, color: c.onImage, letterSpacing: 0.8, maxWidth: 200 },
  demoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: -6,
  },
  demoText: { ...typography.caption, color: c.textMuted, flex: 1 },
  form: { gap: 16 },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  error: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: c.errorSoft,
  },
  errorText: { ...typography.body, color: c.text, flex: 1 },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: c.surface,
    borderTopWidth: 1,
    borderTopColor: c.border,
  },
}));
