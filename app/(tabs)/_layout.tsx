import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Heart, House, type Icon, ShoppingBag, SquaresFour, User } from '@/components/ui/icons';

import { useCartStore } from '@/lib/store/cart';
import { fontFamily, useTheme } from '@/lib/theme';

// Outline when idle, filled when active: the weight change carries the state,
// not just the color, so it still reads for color-blind users.
function tabIcon(IconComponent: Icon) {
  return function TabIcon({ color, focused }: { color: ColorValue; focused: boolean }) {
    return (
      <IconComponent size={24} color={color as string} weight={focused ? 'fill' : 'regular'} />
    );
  };
}

export default function TabsLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const cartCount = useCartStore((state) => state.totalCount());

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accentInk,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          // Explicit height that includes the home-indicator inset. Each item
          // pads 5px top/bottom around a 28px icon box, so the bar needs ~66px
          // of content height or the label row gets squeezed and clipped.
          height: 66 + insets.bottom,
          paddingTop: 4,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 6,
        },
        tabBarLabelStyle: { fontFamily: fontFamily.semiBold, fontSize: 11 },
        tabBarBadgeStyle: {
          backgroundColor: colors.accent,
          color: colors.onAccent,
          fontFamily: fontFamily.bold,
          fontSize: 10,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: tabIcon(House) }} />
      <Tabs.Screen
        name="catalog"
        options={{ title: 'Catalog', tabBarIcon: tabIcon(SquaresFour) }}
      />
      <Tabs.Screen name="wishlist" options={{ title: 'Wishlist', tabBarIcon: tabIcon(Heart) }} />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
          tabBarIcon: tabIcon(ShoppingBag),
        }}
      />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: tabIcon(User) }} />
    </Tabs>
  );
}
