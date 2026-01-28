// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Configure resolver to use browser/React Native compatible builds
config.resolver = {
  ...config.resolver,
  resolverMainFields: ['react-native', 'browser', 'module', 'main'],
  sourceExts: [...(config.resolver?.sourceExts || []), 'cjs'],
};

module.exports = config;
