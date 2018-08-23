// const metroBundler = require('metro-bundler');
const blacklist = require('metro-bundler/src/blacklist')

// var config = {
//   getBlacklistRE(platform) {
//     return blacklist(platform, [
//       /node_modules\/my-package\/excluded-directory\/.*/
//     ]);
//   }
// };

module.exports = {
  getTransformModulePath() {
    return require.resolve('react-native-typescript-transformer');
  },
  getSourceExts() {
    return ['ts', 'tsx'];
  },
  // getBlackListRE(platform) {
  //   return blacklist([
  //     /src\/*/
  //   ]);
  // }
}