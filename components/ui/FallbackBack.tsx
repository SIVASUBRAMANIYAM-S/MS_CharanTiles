import { type Href, router, useIsFocused, useNavigation } from 'expo-router';
import { Pressable } from 'react-native';

import { CaretLeft } from '@/components/ui/icons';
import { useTheme } from '@/lib/theme';

/**
 * Stack header `headerLeft` for screens that can be reached with nothing
 * beneath them (deep links, a web refresh). Returns undefined when a normal
 * back is possible, so the navigator's own back button is used.
 */
export function useFallbackHeaderLeft(href: Href) {
  const navigation = useNavigation();
  // Re-render on focus changes: the screens beneath this one can change while
  // it's covered (e.g. a replace), so canGoBack() must be re-read each time.
  useIsFocused();
  if (navigation.canGoBack()) return undefined;
  return function FallbackBack() {
    return <FallbackBackButton href={href} />;
  };
}

function FallbackBackButton({ href }: { href: Href }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => router.replace(href)}
      accessibilityRole="button"
      accessibilityLabel="Back"
      hitSlop={12}
      style={({ pressed }) => ({ paddingRight: 8, opacity: pressed ? 0.6 : 1 })}
    >
      <CaretLeft size={22} color={colors.text} weight="bold" />
    </Pressable>
  );
}
