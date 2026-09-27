import { router } from 'expo-router';
import {
  CaretRight,
  ChatCircleText,
  Heart,
  type Icon,
  Phone,
  Receipt,
  SignOut,
  User,
} from '@/components/ui/icons';
import { Fragment, useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuthStore } from '@/lib/store/auth';
import { makeStyles, radius, typography, useTheme } from '@/lib/theme';

type FormValues = { full_name: string };

type MenuItem = { label: string; icon: Icon; href: '/wishlist' | '/order' | '/enquiry' };

const MENU: MenuItem[] = [
  { label: 'Wishlist', icon: Heart, href: '/wishlist' },
  { label: 'Order history', icon: Receipt, href: '/order' },
  { label: 'Send an enquiry', icon: ChatCircleText, href: '/enquiry' },
];

export default function ProfileScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
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
        <ScreenHeader title="Profile" />
        <View style={styles.body}>
          <Skeleton width="100%" height={88} borderRadius={radius.lg} />
          <Skeleton width="100%" height={160} borderRadius={radius.lg} />
        </View>
      </View>
    );
  }

  const displayName = profile.full_name?.trim() || (profile.phone ? 'Welcome back' : 'Guest');
  const initial = profile.full_name?.trim().charAt(0).toUpperCase();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ScreenHeader title="Profile" />

      <View style={styles.body}>
        <View style={styles.identity}>
          <View style={styles.avatar}>
            {initial ? (
              <Text style={styles.avatarText}>{initial}</Text>
            ) : (
              <User size={28} color={colors.accentInk} weight="bold" />
            )}
          </View>
          <View style={styles.identityText}>
            <Text style={styles.name} numberOfLines={1}>
              {displayName}
            </Text>
            <Text style={styles.identitySub}>
              {profile.phone ? `+91 ${profile.phone}` : 'Browsing as a guest'}
            </Text>
          </View>
        </View>

        {!profile.phone ? (
          <Card variant="accent">
            <View style={styles.phoneIcon}>
              <Phone size={20} color={colors.onAccent} weight="fill" />
            </View>
            <Text style={styles.cardTitle}>Add your phone number</Text>
            <Text style={styles.cardBody}>
              Personalise your account. Your wishlist and cart stay exactly as they are.
            </Text>
            <Button label="Add phone number" onPress={() => router.push('/auth/login')} />
          </Card>
        ) : (
          <Card>
            <Text style={styles.cardTitle}>Your details</Text>
            <View style={styles.form}>
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
                    autoComplete="name"
                  />
                )}
              />
              <View style={styles.saveRow}>
                <Button label="Save" size="sm" onPress={onSaveName} loading={savingName} />
                {savedMessage && <Text style={styles.savedText}>Saved</Text>}
              </View>
              <View style={styles.phoneRow}>
                <View>
                  <Text style={styles.fieldLabel}>Phone number</Text>
                  <Text style={styles.phoneValue}>+91 {profile.phone}</Text>
                </View>
                <Pressable
                  onPress={() => router.push('/auth/login')}
                  accessibilityRole="button"
                  hitSlop={8}
                >
                  <Text style={styles.link}>Change number</Text>
                </Pressable>
              </View>
            </View>
          </Card>
        )}

        <Card style={styles.menu}>
          {MENU.map((item, index) => (
            <Fragment key={item.href}>
              {index > 0 && <View style={styles.menuDivider} />}
              <Pressable
                onPress={() => router.push(item.href)}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                style={({ pressed }) => [styles.menuRow, pressed && styles.pressed]}
              >
                <View style={styles.menuIcon}>
                  <item.icon size={20} color={colors.accentInk} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <CaretRight size={16} color={colors.textMuted} />
              </Pressable>
            </Fragment>
          ))}
        </Card>

        {!confirmingSignOut ? (
          <Button
            label="Sign out"
            variant="outline"
            onPress={() => setConfirmingSignOut(true)}
            fullWidth
            icon={(color) => <SignOut size={18} color={color} />}
          />
        ) : (
          <View style={styles.confirm}>
            <Text style={styles.confirmTitle}>Sign out?</Text>
            <Text style={styles.confirmText}>
              Your current cart and wishlist belong to this session and can&apos;t be recovered
              after signing out.
            </Text>
            <View style={styles.confirmRow}>
              <Button
                label="Cancel"
                variant="secondary"
                onPress={() => setConfirmingSignOut(false)}
                disabled={signingOut}
              />
              <Button label="Sign out" onPress={handleSignOut} loading={signingOut} />
            </View>
          </View>
        )}

        <Text style={styles.footnote}>
          Appearance follows your phone&apos;s light or dark setting.
        </Text>
      </View>
    </ScrollView>
  );
}

const useStyles = makeStyles((c) => ({
  container: { flex: 1, backgroundColor: c.bg },
  content: { paddingBottom: 40 },
  body: { paddingHorizontal: 16, paddingTop: 12, gap: 20 },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: radius.lg,
    backgroundColor: c.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...typography.h1, color: c.accentInk },
  identityText: { flex: 1, gap: 2 },
  name: { ...typography.h2, color: c.text },
  identitySub: { ...typography.body, color: c.textMuted },
  phoneIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: c.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardTitle: { ...typography.h3, color: c.text },
  cardBody: { ...typography.body, color: c.textMuted, marginTop: 4, marginBottom: 16 },
  form: { gap: 16, marginTop: 14 },
  saveRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  savedText: { ...typography.label, color: c.success },
  phoneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: c.border,
  },
  fieldLabel: { ...typography.label, color: c.textMuted },
  phoneValue: { ...typography.bodyMedium, color: c.text, fontVariant: ['tabular-nums'] },
  link: { ...typography.label, color: c.accentInk },
  menu: { paddingVertical: 4, paddingHorizontal: 4 },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: radius.md,
  },
  pressed: { backgroundColor: c.surfaceAlt },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: c.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { ...typography.bodyMedium, color: c.text, flex: 1 },
  menuDivider: { height: 1, backgroundColor: c.border, marginLeft: 64 },
  confirm: {
    backgroundColor: c.errorSoft,
    borderRadius: radius.lg,
    padding: 16,
    gap: 6,
  },
  confirmTitle: { ...typography.h3, color: c.text },
  confirmText: { ...typography.body, color: c.textMuted },
  confirmRow: { flexDirection: 'row', gap: 12, justifyContent: 'flex-end', marginTop: 10 },
  footnote: { ...typography.caption, color: c.textFaint, textAlign: 'center' },
}));
