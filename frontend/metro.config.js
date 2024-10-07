const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withNativeWind } = require('nativewind/metro')

const config = mergeConfig(getDefaultConfig(__dirname), {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    // Add support for common source extensions
    sourceExts: ['jsx', 'js', 'tsx', 'ts', 'cjs', 'json'],  // Include 'css' and 'tsx'
  },
});

module.exports = withNativeWind(config, { input: './global.css'});
