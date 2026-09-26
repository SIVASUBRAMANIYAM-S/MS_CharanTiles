import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import {
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { BrandSplash } from '@/components/BrandSplash';
import { useAuthStore } from '@/lib/store/auth';
import { useCartStore } from '@/lib/store/cart';
import { useWishlistStore } from '@/lib/store/wishlist';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  // A font load failure shouldn't trap the user on the splash — fall back to system fonts.
  const fontsReady = fontsLoaded || fontError !== null;

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
      <BottomSheetModalProvider>
        {appReady ? (
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        ) : (
          <BrandSplash />
        )}
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
