import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { ShoppingBag } from '@/components/ui/icons';
import { IconButton } from '@/components/ui/IconButton';
import { useCartStore } from '@/lib/store/cart';
import { fontFamily, makeStyles, radius, useTheme } from '@/lib/theme';

/** Jumps straight to the cart from a screen reached by drilling into the
 * catalog (product, category, collection, search) — those are stack pushes
 * on top of the tab bar, so without this the only way back to the cart is
 * popping all the way out to a tab screen first, then tapping the Cart tab. */
export function CartHeaderButton() {
  const { colors } = useTheme();
  const styles = useStyles();
  const count = useCartStore((state) => state.totalCount());

  return (
    <IconButton
      accessibilityLabel={count > 0 ? `Cart, ${count} ${count === 1 ? 'item' : 'items'}` : 'Cart'}
      onPress={() => router.push('/cart')}
      style={styles.button}
    >
      <ShoppingBag size={20} color={colors.text} weight={count > 0 ? 'fill' : 'regular'} />
      {count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText} numberOfLines={1}>
            {count > 99 ? '99+' : count}
          </Text>
        </View>
      )}
    </IconButton>
  );
}

const useStyles = makeStyles((c) => ({
  button: { marginRight: 4 },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 3,
    borderRadius: radius.pill,
    backgroundColor: c.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontFamily: fontFamily.bold, fontSize: 10, color: c.onAccent },
}));
