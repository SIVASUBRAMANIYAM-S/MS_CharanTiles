const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// moti -> framer-motion -> tslib. For the web server render, Metro matches tslib's
// "import"/"node" export condition, whose ESM wrapper default-imports the UMD build and
// gets undefined ("Cannot destructure property '__extends' of 'tslib.default'").
// Point every platform at tslib's plain ES module build instead.
const tslibEsm = require.resolve('tslib/tslib.es6.js');

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'tslib') {
    return { type: 'sourceFile', filePath: tslibEsm };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
