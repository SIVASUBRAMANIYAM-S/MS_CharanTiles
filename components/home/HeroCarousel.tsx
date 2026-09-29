import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { type Href, router, useFocusEffect } from 'expo-router';
import { MotiView } from 'moti';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Button } from '@/components/ui/Button';
import { makeStyles, radius, typography } from '@/lib/theme';

type HeroSlide = {
  image: string;
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  href: Href;
};

// Sized to the 4:5 hero (sharp at 3x on phones) and WebP, which native
// clients don't request on their own: ~2-3x smaller than the 1200px JPEGs.
const unsplash = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=900&h=1125&q=70&fm=webp&fit=crop`;

// Marketing chrome, not DB-driven. Bathroom is deliberately last (client feedback).
const SLIDES: HeroSlide[] = [
  {
    image: unsplash('1653972233229-1b8c042d6d8e'),
    eyebrow: 'Living room',
    title: 'Tiles for every room',
    body: 'Large-format porcelain that makes open spaces feel calm and seamless.',
    cta: 'Shop living room',
    href: '/category/living-room-tiles',
  },
  {
    image: unsplash('1653427603096-54342daac941'),
    eyebrow: 'Kitchen',
    title: 'Kitchens with character',
    body: 'Backsplashes and floors built to handle heat, spills and everyday life.',
    cta: 'Shop kitchen',
    href: '/category/kitchen-tiles',
  },
  {
    image: unsplash('1600328604921-300918f36018'),
    eyebrow: 'Marble finish',
    title: 'The look of marble',
    body: 'Polished vitrified tiles with natural veining, and none of the upkeep.',
    cta: 'Browse catalog',
    href: '/catalog',
  },
  {
    image: unsplash('1625579002297-aeebbf69de89'),
    eyebrow: 'Bedroom',
    title: 'Warm, quiet bedrooms',
    body: 'Soft stone and wood-look tiles that feel good underfoot.',
    cta: 'Shop bedroom',
    href: '/category/bedroom-tiles',
  },
  {
    image: unsplash('1701251786408-d0320ecaad8d'),
    eyebrow: 'Bathroom',
    title: 'Spa-grade bathrooms',
    body: 'Statement marble walls and slip-resistant floors for everyday luxury.',
    cta: 'Shop bathroom',
    href: '/category/bathroom-tiles',
  },
];

const SLIDE_DURATION_MS = 5000;
const FADE_MS = 900;
const KEN_BURNS_SCALE = 1.1;

export function HeroCarousel() {
  const styles = useStyles();
  const reduceMotion = useReducedMotion();
  // `previous` stays mounted so it can fade out under the incoming slide.
  const [{ index, previous }, setSlides] = useState({ index: 0, previous: 0 });
  const [focused, setFocused] = useState(true);

  const show = useCallback((next: (current: number) => number) => {
    setSlides((s) => ({ index: next(s.index), previous: s.index }));
  }, []);

  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, []),
  );

  // Restarting the timer whenever `index` changes means a manual swipe or dot
  // tap gets a full slide duration before auto-advance resumes.
  useEffect(() => {
    if (!focused || reduceMotion) return;
    const timer = setTimeout(() => show((i) => (i + 1) % SLIDES.length), SLIDE_DURATION_MS);
    return () => clearTimeout(timer);
  }, [index, focused, reduceMotion, show]);

  const go = useCallback(
    (delta: number) => show((i) => (i + delta + SLIDES.length) % SLIDES.length),
    [show],
  );

  // Horizontal-only so the home ScrollView keeps vertical scrolling.
  const swipe = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetX([-20, 20])
    .failOffsetY([-12, 12])
    .onEnd((event) => {
      if (event.translationX < -40) go(1);
      else if (event.translationX > 40) go(-1);
    });

  const slide = SLIDES[index];
  // Only the visible slide, the one fading out and the upcoming one are
  // mounted (and decoded) — the upcoming one loads while still invisible.
  const upcoming = (index + 1) % SLIDES.length;
  const mounted = new Set([index, previous, upcoming]);

  return (
    <GestureDetector gesture={swipe}>
      <View style={styles.hero}>
        {SLIDES.map((item, i) =>
          mounted.has(i) ? (
            <HeroImage
              key={item.image}
              uri={item.image}
              active={i === index}
              reduceMotion={reduceMotion}
            />
          ) : null,
        )}
        <LinearGradient
          colors={['rgba(8, 9, 11, 0.15)', 'rgba(8, 9, 11, 0)', 'rgba(8, 9, 11, 0.88)']}
          locations={[0, 0.3, 1]}
          style={[styles.fill, styles.noTouch]}
        />

        <MotiView
          key={index}
          from={reduceMotion ? undefined : { opacity: 0, translateY: 14 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 550, delay: 150 }}
          style={styles.content}
        >
          <Text style={styles.eyebrow}>{slide.eyebrow.toUpperCase()}</Text>
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.body}>{slide.body}</Text>
          <Button label={slide.cta} onPress={() => router.push(slide.href)} />
        </MotiView>

        <View style={styles.dots}>
          {SLIDES.map((item, i) => (
            <Pressable
              key={item.image}
              onPress={() => show(() => i)}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={`Show slide ${i + 1} of ${SLIDES.length}: ${item.eyebrow}`}
              accessibilityState={{ selected: i === index }}
            >
              <View style={[styles.dot, i === index && styles.dotActive]} />
            </Pressable>
          ))}
        </View>
      </View>
    </GestureDetector>
  );
}

type HeroImageProps = { uri: string; active: boolean; reduceMotion: boolean };

/** One stacked slide: crossfades in/out and slowly zooms (Ken Burns) while visible. */
function HeroImage({ uri, active, reduceMotion }: HeroImageProps) {
  const styles = useStyles();
  const opacity = useSharedValue(active ? 1 : 0);
  const scale = useSharedValue(1);

  useEffect(() => {
    opacity.value = withTiming(active ? 1 : 0, { duration: reduceMotion ? 0 : FADE_MS });
    if (active && !reduceMotion) {
      scale.value = 1;
      scale.value = withTiming(KEN_BURNS_SCALE, {
        duration: SLIDE_DURATION_MS + FADE_MS,
        easing: Easing.linear,
      });
    }
  }, [active, reduceMotion, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.fill, styles.noTouch, animatedStyle]}>
      <Image
        source={{ uri }}
        style={styles.fill}
        contentFit="cover"
        accessibilityIgnoresInvertColors
      />
    </Animated.View>
  );
}

const useStyles = makeStyles((c) => ({
  hero: {
    marginHorizontal: 16,
    aspectRatio: 4 / 5,
    maxHeight: 520,
    borderRadius: radius.xl,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    backgroundColor: c.surfaceAlt,
  },
  fill: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  noTouch: { pointerEvents: 'none' },
  content: { padding: 22, paddingBottom: 40, gap: 8, alignItems: 'flex-start' },
  eyebrow: { ...typography.caption, color: c.accent, letterSpacing: 2 },
  title: { ...typography.display, color: c.onImage },
  body: { ...typography.body, color: c.onImage, opacity: 0.85, marginBottom: 8, maxWidth: 320 },
  dots: {
    position: 'absolute',
    bottom: 16,
    left: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: c.onImage, opacity: 0.45 },
  dotActive: { width: 22, backgroundColor: c.accent, opacity: 1 },
}));
