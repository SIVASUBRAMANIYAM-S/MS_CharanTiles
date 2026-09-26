import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { MotiView } from 'moti';
import { CheckCircle, WarningCircle } from '@/components/ui/icons';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  createInquiry,
  type Profession,
  PROFESSIONS,
  type Purpose,
  PURPOSES,
} from '@/lib/queries/inquiries';
import { getProductById, type ProductWithDetails } from '@/lib/queries/products';
import { useAuthStore } from '@/lib/store/auth';
import { makeStyles, radius, typography, useTheme } from '@/lib/theme';
import {
  enquiryMessageSchema,
  fullNameSchema,
  optionalEmailSchema,
  phoneSchema,
} from '@/lib/validation';

type FormValues = {
  name: string;
  phone: string;
  email: string;
  profession: Profession;
  purpose: Purpose;
  message: string;
};

function firstError(result: { success: boolean; error?: { issues: { message: string }[] } }) {
  return result.success || (result.error?.issues[0]?.message ?? 'Invalid value');
}

export default function EnquiryScreen() {
  const { productId } = useLocalSearchParams<{ productId?: string }>();
  const { colors } = useTheme();
  const styles = useStyles();
  const userId = useAuthStore((state) => state.user?.id);
  const profile = useAuthStore((state) => state.profile);

  // undefined = loading, null = no product (standalone) or not found.
  const [product, setProduct] = useState<ProductWithDetails | null | undefined>(
    productId ? undefined : null,
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<{ name: string; phone: string } | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      name: profile?.full_name ?? '',
      phone: profile?.phone ?? '',
      email: '',
      profession: 'individual',
      purpose: productId ? 'product_enquiry' : 'other',
      message: '',
    },
  });

  useEffect(() => {
    if (!productId) return;
    getProductById(productId)
      .then(setProduct)
      .catch((error: unknown) => {
        console.warn('Failed to load enquiry product', error);
        setProduct(null);
      });
  }, [productId]);

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await createInquiry({
        userId: userId ?? null,
        productId: product?.id ?? null,
        ...values,
      });
      setSentTo({ name: values.name.trim().split(' ')[0], phone: values.phone });
    } catch (error) {
      console.warn('Failed to submit enquiry', error);
      setSubmitError('We could not send your enquiry. Check your connection and try again.');
    }
  });

  if (sentTo) {
    return (
      <View style={styles.successContainer}>
        <Stack.Screen options={{ title: 'Enquiry' }} />
        <MotiView
          from={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 350 }}
        >
          <View style={styles.successIcon}>
            <CheckCircle size={44} color={colors.success} weight="fill" />
          </View>
        </MotiView>
        <Text style={styles.successTitle}>Enquiry sent</Text>
        <Text style={styles.successBody}>
          Thanks, {sentTo.name}. Our team will contact you on {sentTo.phone}.
        </Text>
        <View style={styles.successActions}>
          {product ? (
            <Button label="Back to product" onPress={() => router.back()} fullWidth />
          ) : null}
          <Button
            label="Browse catalog"
            variant={product ? 'outline' : 'primary'}
            onPress={() => router.replace('/catalog')}
            fullWidth
          />
        </View>
      </View>
    );
  }

  const primaryImage = product?.product_images[0]?.url;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Stack.Screen options={{ title: 'Enquiry' }} />

      <View style={styles.header}>
        <Text style={styles.title}>Talk to our tile experts</Text>
        <Text style={styles.subtitle}>
          Share a few details and our team will get back to you by phone.
        </Text>
      </View>

      {product === undefined ? (
        <Skeleton width="100%" height={72} borderRadius={12} />
      ) : product ? (
        <View style={styles.productRow}>
          {primaryImage ? (
            <Image source={{ uri: primaryImage }} style={styles.productImage} contentFit="cover" />
          ) : (
            <View style={styles.productImage} />
          )}
          <View style={styles.productText}>
            <Text style={styles.productCaption}>Enquiring about</Text>
            <Text style={styles.productName} numberOfLines={1}>
              {product.name}
            </Text>
            <Text style={styles.productPrice}>₹{product.price.toFixed(0)}</Text>
          </View>
        </View>
      ) : null}

      <View style={styles.section}>
        <Controller
          control={control}
          name="name"
          rules={{ validate: (value) => firstError(fullNameSchema.safeParse(value)) }}
          render={({ field: { value, onChange, onBlur } }) => (
            <Input
              label="Full name"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.name?.message}
              autoComplete="name"
            />
          )}
        />
        <Controller
          control={control}
          name="phone"
          rules={{ validate: (value) => firstError(phoneSchema.safeParse(value)) }}
          render={({ field: { value, onChange, onBlur } }) => (
            <Input
              label="Phone number"
              keyboardType="phone-pad"
              maxLength={10}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.phone?.message}
              autoComplete="tel"
            />
          )}
        />
        <Controller
          control={control}
          name="email"
          rules={{ validate: (value) => firstError(optionalEmailSchema.safeParse(value)) }}
          render={({ field: { value, onChange, onBlur } }) => (
            <Input
              label="Email (optional)"
              keyboardType="email-address"
              autoCapitalize="none"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.email?.message}
              autoComplete="email"
            />
          )}
        />
      </View>

      <Controller
        control={control}
        name="profession"
        render={({ field: { value, onChange } }) => (
          <View style={styles.chipGroup}>
            <Text style={styles.groupLabel}>I am</Text>
            <View style={styles.chipRow}>
              {PROFESSIONS.map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  selected={value === option.value}
                  onPress={() => onChange(option.value)}
                />
              ))}
            </View>
          </View>
        )}
      />

      <Controller
        control={control}
        name="purpose"
        render={({ field: { value, onChange } }) => (
          <View style={styles.chipGroup}>
            <Text style={styles.groupLabel}>Looking for</Text>
            <View style={styles.chipRow}>
              {PURPOSES.map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  selected={value === option.value}
                  onPress={() => onChange(option.value)}
                />
              ))}
            </View>
          </View>
        )}
      />

      <Controller
        control={control}
        name="message"
        rules={{ validate: (value) => firstError(enquiryMessageSchema.safeParse(value)) }}
        render={({ field: { value, onChange, onBlur } }) => (
          <Input
            label="Message (optional)"
            helperText="Sizes, quantities or your project timeline all help."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={1000}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.message?.message}
            style={styles.messageInput}
          />
        )}
      />

      {submitError && (
        <View style={styles.error}>
          <WarningCircle size={20} color={colors.error} weight="fill" />
          <Text style={styles.errorText}>{submitError}</Text>
        </View>
      )}

      <Button label="Send enquiry" onPress={onSubmit} loading={isSubmitting} fullWidth size="lg" />
    </ScrollView>
  );
}

const useStyles = makeStyles((c) => ({
  container: { flex: 1, backgroundColor: c.bg },
  content: { padding: 16, gap: 24, paddingBottom: 48 },
  header: { gap: 6 },
  title: { ...typography.h1, color: c.text },
  subtitle: { ...typography.body, color: c.textMuted },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.surface,
  },
  productImage: { width: 60, height: 60, borderRadius: radius.md, backgroundColor: c.surfaceAlt },
  productText: { flex: 1, gap: 2 },
  productCaption: { ...typography.caption, color: c.textMuted },
  productName: { ...typography.bodyMedium, color: c.text },
  productPrice: { ...typography.label, color: c.accentInk, fontVariant: ['tabular-nums'] },
  section: { gap: 16 },
  chipGroup: { gap: 10 },
  groupLabel: { ...typography.label, color: c.textMuted },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  messageInput: { minHeight: 120 },
  error: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: c.errorSoft,
  },
  errorText: { ...typography.body, color: c.text, flex: 1 },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 24,
    backgroundColor: c.bg,
  },
  successIcon: {
    width: 84,
    height: 84,
    borderRadius: radius.pill,
    backgroundColor: c.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  successTitle: { ...typography.h1, color: c.text },
  successBody: { ...typography.body, color: c.textMuted, textAlign: 'center', maxWidth: 300 },
  successActions: { width: '100%', gap: 12, marginTop: 20 },
}));
