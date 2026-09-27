import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, type Theme as NavTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { BrandSplash } from '@/components/BrandSplash';
import { useAuthStore } from '@/lib/store/auth';
import { useCartStore } from '@/lib/store/cart';
import { useWishlistStore } from '@/lib/store/wishlist';
import { fontFamily, makeStyles, useTheme } from '@/lib/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  // A font load failure shouldn't trap the user on the splash — fall back to system fonts.
  const fontsReady = fontsLoaded || fontError !== null;

  const { dark, colors } = useTheme();
  const styles = useStyles();

  // Navigator chrome (stack headers, tab bar, screen backgrounds) follows the app palette.
  const navTheme = useMemo<NavTheme>(() => {
    const base = dark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.accentInk,
        background: colors.bg,
        card: colors.bg,
        text: colors.text,
        border: colors.border,
        notification: colors.accent,
      },
    };
  }, [dark, colors]);

  const authLoading = useAuthStore((state) => state.loading);
  const authUser = useAuthStore((state) => state.user);
  const authInit = useAuthStore((state) => state.init);
  const hydrateWishlist = useWishlistStore((state) => state.hydrate);
  const hydrateCart = useCartStore((state) => state.hydrate);
  const wishlistHydratedFor = useRef<string | null>(null);
  const cartHydratedFor = useRef<string | null>(null);

  useEffect(() => {
    if (fontsReady) {
      SplashScreen.hideAsync();
      authInit();
    }
  }, [fontsReady, authInit]);

  useEffect(() => {
    if (authUser && wishlistHydratedFor.current !== authUser.id) {
      wishlistHydratedFor.current = authUser.id;
      hydrateWishlist(authUser.id);
    }
  }, [authUser, hydrateWishlist]);

  useEffect(() => {
    if (authUser && cartHydratedFor.current !== authUser.id) {
      cartHydratedFor.current = authUser.id;
      hydrateCart(authUser.id);
    }
  }, [authUser, hydrateCart]);

  if (!fontsReady) {
    return null;
  }

  const appReady = fontsReady && !authLoading;

  return (
    <GestureHandlerRootView style={styles.root}>
      <ThemeProvider value={navTheme}>
        <BottomSheetModalProvider>
          <StatusBar style={appReady ? 'auto' : 'light'} />
          {appReady ? (
            <Stack
              screenOptions={{
                headerShadowVisible: false,
                headerTintColor: colors.text,
                headerTitleStyle: { fontFamily: fontFamily.semiBold, fontSize: 16 },
                headerBackButtonDisplayMode: 'minimal',
                contentStyle: { backgroundColor: colors.bg },
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
          ) : (
            <BrandSplash />
          )}
        </BottomSheetModalProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.bg },
}));
