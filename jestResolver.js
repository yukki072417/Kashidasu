// Jest 25 では node: プロトコルを解決できないため、プレフィックスを除去して解決する
module.exports = (moduleName, options) => {
  const stripped = moduleName.startsWith("node:")
    ? moduleName.slice(5)
    : moduleName;
  return options.defaultResolver(stripped, options);
};
