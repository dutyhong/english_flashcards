// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// 只排除「其他包里面的 node_modules」（monorepo 常见），绝不误伤自己的 react-native
config.resolver.blockList = [
  // 防止嵌套 node_modules（比如 pnpm/yarn workspace）
  /node_modules\/.*\/node_modules\/react-native/,
];

// 可选：如果你项目非常大，再加这句减少监听数量（但不影响 resolve）
config.watchFolders = [];

// 可选：强制使用 watchman（如果你已经装了）
config.watcher = {
  ...config.watcher,
  watchman: {
    ...config.watcher?.watchman,
    deferStates: ['idle'],
  },
};

module.exports = config;