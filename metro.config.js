const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);


// module.exports = {
//     resolver: {
//         extraNodeModules: {
//           'react-native-worklets-core': __dirname + '/node_modules/react-native-worklets-core',
//         },
//       },
//     transformer: {
//       getTransformOptions: async () => ({
//         transform: {
//           experimentalImportSupport: false,
//           inlineRequires: true,
//         },
//       }),
//     },
//   };
  