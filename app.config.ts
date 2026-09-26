import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'MS Charan Tiles',
  slug: 'mscharantiles',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'mscharantiles',
  userInterfaceStyle: 'automatic',
  ios: {
    bundleIdentifier: 'com.mscharan.tiles',
  },
  android: {
    package: 'com.mscharan.tiles',
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      // White-on-transparent, so it doubles as the Android 13+ themed-icon mask.
      monochromeImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#1B4F9C', // colors.primary
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
    // PWA splash. SDK 57 has no top-level `splash` key — the native iOS/Android
    // splash is configured by the expo-splash-screen plugin below.
    splash: {
      image: './assets/images/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#0D0E10', // brand.charcoal (redesign)
    },
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        resizeMode: 'contain',
        backgroundColor: '#0D0E10', // brand.charcoal (redesign)
        imageWidth: 200,
      },
    ],
    'expo-secure-store',
    'expo-image',
    'expo-font',
    [
      'expo-image-picker',
      {
        photosPermission: 'Allow MS Charan Tiles to access your photos to find a matching tile.',
        cameraPermission: 'Allow MS Charan Tiles to use your camera to find a matching tile.',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
});
