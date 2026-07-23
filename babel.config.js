module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Plugin de worklets do Reanimated 4 — deve ser o último.
    plugins: ['react-native-worklets/plugin'],
  };
};
