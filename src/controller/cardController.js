/**
 * カードコントローラー
 * カードの生成とステータス管理を管理する
 */
const CardModel = require("../model/cardModel");

const cardModel = new CardModel();

/**
 * カードを生成する関数
 * @param {object} req - リクエストオブジェクト
 * @param {object} res - レスポンスオブジェクト
 * @param {function} next - ミドルウェア関数
 */
async function generateCard(req, res, next) {
  const { id, gread, class: className, number } = req.body;

  try {
    const result = await cardModel.generateCard({
      id,
      gread,
      class: className,
      number,
    });

    res.json({
      success: true,
      message: "カードが正常に生成されました",
      ...result,
    });
  } catch (error) {
    console.error("Error generating card:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * カードステータスを取得する関数
 * @param {object} req - リクエストオブジェクト
 * @param {object} res - レスポンスオブジェクト
 * @param {function} next - ミドルウェア関数
 */
async function getCardStatus(req, res, next) {
  try {
    const files = await cardModel.getCardFiles();
    res.json({
      success: true,
      message: "カードステータスが正常に取得されました",
      ...files,
    });
  } catch (error) {
    console.error("Error getting card status:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  generateCard,
  getCardStatus,
};
