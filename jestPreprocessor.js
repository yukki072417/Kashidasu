// Jest 25 は `node:` プロトコルの組み込みモジュールを解決できない
// formidable 等が使用する `require("node:fs")` → `require("fs")` に変換する
module.exports = {
  process(src) {
    return src.replace(/require\((['"])node:([^'"]+)\1\)/g, "require($1$2$1)");
  },
};
