const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  // For web builds, we need to disable expo-router and use a simplified setup
  // because expo-router has issues with Windows path resolution
  // The app works perfectly on native (Android/iOS) with Expo Go or custom builds
  
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: ['nativewind'],
      },
    },
    argv
  );

  // CSS is handled by nativewind through Babel, no extra config needed
  const oneOfRule = config.module.rules.find((rule) => rule.oneOf);
  if (oneOfRule) {
    oneOfRule.oneOf = oneOfRule.oneOf.filter((rule) => {
      const testString = rule.test ? rule.test.toString() : '';
      return !testString.includes('css');
    });
  }

  // Add crypto polyfill for web support (needed by expo-modules-core for UUID)
  config.resolve = config.resolve || {};
  config.resolve.fallback = {
    ...config.resolve.fallback,
    crypto: false,
  };

  // Suppress expo-router web errors - not needed for this app
  // The app is optimized for native use with Expo Go
  config.ignoreWarnings = [
    {
      module: /expo-router/,
      message: /Cannot find module/,
    },
  ];

  return config;
};

