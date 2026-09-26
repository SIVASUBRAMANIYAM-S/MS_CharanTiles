import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuthStore } from '@/lib/store/auth';
import { colors } from '@/lib/theme/colors';
import { typography } from '@/lib/theme/typography';

type FormValues = { full_name: string };

export default function ProfileScreen() {
  const profile = useAuthStore((state) => state.profile);
  const updateFullName = useAuthStore((state) => state.updateFullName);
  const signOut = useAuthStore((state) => state.signOut);

  const [savingName, setSavingName] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);
  const [confirmingSignOut, setConfirmingSignOut] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: { full_name: profile?.full_name ?? '' },
  });

  // Keep the field in sync when the profile loads/changes (e.g. after sign-out
  // swaps in a brand new anonymous profile).
  useEffect(() => {
    reset({ full_name: profile?.full_name ?? '' });
  }, [profile?.full_name, reset]);

  useEffect(
    () => () => {
      if (savedTimer.current) clearTimeout(savedTimer.current);
    },
    [],
  );

  const onSaveName = handleSubmit(async ({ full_name }) => {
    setSavingName(true);
    try {
      await updateFullName(full_name.trim());
      setSavedMessage(true);
      if (savedTimer.current) clearTimeout(savedTimer.current);
      savedTimer.current = setTimeout(() => setSavedMessage(false), 1500);
    } catch (error) {
      console.warn('Failed to save name', error);
    } finally {
      setSavingName(false);
    }
  });

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      setConfirmingSignOut(false);
    } catch (error) {
      console.warn('Sign out failed', error);
    } finally {
      setSigningOut(false);
    }
  };

  if (!profile) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Skeleton width="50%" height={32} />
          <Skeleton width="100%" height={80} borderRadius={16} />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={typography.h1}>Profile</Text>

      {!profile.phone ? (
        <Card>
          <Text style={typography.h3}>Add your phone number</Text>
          <Text style={styles.cardBody}>
            Attach a phone number to personalize your account. Your browsing, wishlist and cart stay
            exactly as they are.
          </Text>
          <Button label="Add phone number" onPress={() => router.push('/auth/login')} />
        </Card>
      ) : (
        <View style={styles.section}>
          <Controller
            control={control}
            name="full_name"
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                label="Full name"
                placeholder="Your name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />
          <View style={styles.saveRow}>
            <Button label="Save" onPress={onSaveName} loading={savingName} />
            {savedMessage && <Text style={styles.savedText}>Saved</Text>}
          </View>

          <View style={styles.phoneRow}>
            <View>
              <Text style={styles.fieldLabel}>Phone number</Text>
              <Text style={styles.phoneValue}>{profile.phone}</Text>
            </View>
            <Pressable onPress={() => router.push('/auth/login')} accessibilityRole="button">
              <Text style={styles.changeLink}>Change number</Text>
            </Pressable>
          </View>

          <Card onPress={() => router.push('/wishlist')}>
            <View style={styles.shortcutRow}>
              <Ionicons name="heart" size={20} color={colors.primary} />
              <Text style={styles.shortcutLabel}>Wishlist</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </View>
          </Card>
        </View>
      )}

      <View style={styles.signOutSection}>
        {!confirmingSignOut ? (
          <Button
            label="Sign Out"
            variant="outline"
            onPress={() => setConfirmingSignOut(true)}
            fullWidth
          />
        ) : (
          <Card>
            <Text style={styles.confirmText}>
              Signing out clears your current cart and wishlist — they belong to this anonymous
              session and can&apos;t be recovered afterwards. Sign out anyway?
            </Text>
            <View style={styles.confirmRow}>
              <Button
                label="Cancel"
                variant="ghost"
                onPress={() => setConfirmingSignOut(false)}
                disabled={signingOut}
              />
              <Button label="Sign Out" onPress={handleSignOut} loading={signingOut} />
            </View>
          </Card>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.stone },
  content: { padding: 16, gap: 20, paddingBottom: 32 },
  cardBody: { ...typography.body, color: colors.muted, marginVertical: 8 },
  section: { gap: 16 },
  saveRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  savedText: { ...typography.bodyMedium, color: colors.primary },
  phoneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  fieldLabel: { ...typography.caption, color: colors.muted },
  phoneValue: { ...typography.bodyMedium, color: colors.ink },
  changeLink: { ...typography.bodyMedium, color: colors.primary },
  shortcutRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  shortcutLabel: { ...typography.bodyMedium, color: colors.ink, flex: 1 },
  signOutSection: { marginTop: 12 },
  confirmText: { ...typography.body, color: colors.ink, marginBottom: 12 },
  confirmRow: { flexDirection: 'row', gap: 12, justifyContent: 'flex-end' },
});
