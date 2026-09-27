import { Minus, Plus, ShoppingBag, Trash } from '@/components/ui/icons';
import { Pressable, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/lib/store/cart';
import { makeStyles, radius, typography, useTheme } from '@/lib/theme';

type AddToCartControlProps = {
  userId: string | undefined;
  productId: string;
  variantId: string | null;
  disabled?: boolean;
  /** Fires only on the first add (quantity 0 → 1), for a one-time "Added" toast. */
  onAdd?: () => void;
};

/** Add-to-cart button that turns into a quantity stepper once this exact
 * product + variant is already in the cart, instead of just re-adding a
 * second line. At quantity 1, the left control shows delete rather than
 * minus, since tapping it there removes the line rather than counting down. */
export function AddToCartControl({
  userId,
  productId,
  variantId,
  disabled,
  onAdd,
}: AddToCartControlProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const quantity = useCartStore(
    (state) =>
      state.items.find((item) => item.productId === productId && item.variantId === variantId)
        ?.quantity ?? 0,
  );
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  if (quantity === 0) {
    return (
      <Button
        label="Add to cart"
        onPress={() => {
          addItem(userId, productId, variantId);
          onAdd?.();
        }}
        fullWidth
        disabled={disabled}
        icon={(color) => <ShoppingBag size={18} color={color} weight="bold" />}
      />
    );
  }

  return (
    <View style={styles.stepper}>
      <Pressable
        onPress={() => updateQuantity(userId, productId, variantId, quantity - 1)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={quantity === 1 ? 'Remove from cart' : 'Decrease quantity'}
        style={({ pressed }) => [styles.stepperButton, pressed && styles.pressed]}
      >
        {quantity === 1 ? (
          <Trash size={18} color={colors.onAccent} weight="bold" />
        ) : (
          <Minus size={18} color={colors.onAccent} weight="bold" />
        )}
      </Pressable>
      <Text style={styles.quantity}>{quantity}</Text>
      <Pressable
        onPress={() => updateQuantity(userId, productId, variantId, quantity + 1)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
        style={({ pressed }) => [styles.stepperButton, pressed && styles.pressed]}
      >
        <Plus size={18} color={colors.onAccent} weight="bold" />
      </Pressable>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  stepper: {
    flex: 1,
    height: 50,
    borderRadius: radius.md,
    backgroundColor: c.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  stepperButton: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantity: { ...typography.label, color: c.onAccent, fontSize: 17, fontVariant: ['tabular-nums'] },
  pressed: { opacity: 0.7 },
}));
