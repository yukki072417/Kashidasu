/**
 * 暗号化サービス
 * パスワードのハッシュ化と検証を管理する
 */
const bcrypt = require("bcrypt");

const saltRounds = 10; // bcryptのソルトラウンド数

/**
 * コンテンツをハッシュ化する関数
 * @param {string} content - ハッシュ化するコンテンツ
 * @returns {string} - ハッシュ化されたコンテンツ
 */
function hash(content) {
  if (content == null || content == "") {
    throw new Error("Content cannot be empty.");
  }
  const hashedContent = bcrypt.hashSync(content, saltRounds);
  return hashedContent;
}

/**
 * コンテンツとハッシュ化されたコンテンツを比較する関数
 * @param {string} content - 検証するコンテンツ
 * @param {string} hashedContent - ハッシュ化されたコンテンツ
 * @returns {boolean} - 検証結果
 */
function isValid(content, hashedContent) {
  try {
    if (
      content == null ||
      content == "" ||
      hashedContent == null ||
      hashedContent == ""
    ) {
      return false;
    }

    const checked = bcrypt.compareSync(content, hashedContent);
    return checked;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  hash,
  isValid,
};
