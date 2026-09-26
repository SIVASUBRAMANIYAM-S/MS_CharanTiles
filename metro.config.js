const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// moti -> framer-motion -> tslib. For the web server render, Metro matches tslib's
// "import"/"node" export condition, whose ESM wrapper default-imports the UMD build and
// gets undefined ("Cannot destructure property '__extends' of 'tslib.default'").
// Point every platform at tslib's plain ES module build instead.
const tslibEsm = require.resolve('tslib/tslib.es6.js');
const emptyModule = require.resolve('./lib/empty-module.js');

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'tslib') {
    return { type: 'sourceFile', filePath: tslibEsm };
  }
  // `ws` polyfills WebSocket for lib/supabase.ts's Node-SSR-only code path (see
  // that file). It's never reached at runtime on native, but Metro still needs
  // to resolve the import for every platform's module graph, and `ws` pulls in
  // Node builtins (stream, net, tls, ...) that don't exist for React Native.
  // The web platform is fine as-is: Metro follows `ws`'s package.json "browser"
  // field there and resolves to a browser-safe build instead.
  if (moduleName === 'ws' && platform !== 'web') {
    return { type: 'sourceFile', filePath: emptyModule };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
