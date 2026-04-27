const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

config.resolver = {
  ...config.resolver,
  resolverMainFields: ['react-native', 'browser', 'main'],
  unstable_enablePackageExports: true,
  unstable_conditionNames: ['react-native', 'browser', 'require', 'default'],
  sourceExts: [...(config.resolver?.sourceExts || []), 'cjs'],
  resolveRequest: (context, moduleName, platform) => {
    // Force axios to use its browser build — the default export condition
    // resolves to dist/node/axios.cjs which imports Node's `crypto` module.
    if (moduleName === 'axios') {
      return {
        filePath: path.resolve(__dirname, 'node_modules/axios/dist/browser/axios.cjs'),
        type: 'sourceFile',
      };
    }
    return context.resolveRequest(context, moduleName, platform);
  },
};

module.exports = withNativeWind(config, { input: './global.css' });
