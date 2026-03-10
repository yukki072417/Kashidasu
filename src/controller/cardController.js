/**
 * カードコントローラー
 * カードの生成とステータス管理を管理する
 */
const CardModel = require("../services/cardService");

const cardModel = new CardModel();

/**
 * カードを生成する関数
 * @param {object} req - リクエストオブジェクト
 * @param {object} res - レスポンスオブジェクト
 * @param {function} next - ミドルウェア関数
 */
async function generateCard(req, res, next) {
  try {
    const { id, gread, class: className, number } = req.body;

    // ビジネスロジック: バリデーション
    if (!id || !gread || !className || !number) {
      return res.status(400).json({
        success: false,
        message: "すべてのフィールドは必須です",
      });
    }

    // モデル層の呼び出し
    const result = await cardModel.generateCard({
      id,
      gread,
      class: className,
      number,
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(201).json({
      success: true,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    throw error;
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
    // モデル層の呼び出し
    const result = await cardModel.getCardFiles();

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(200).json({
      success: true,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    throw error;
  }
}

module.exports = {
  generateCard,
  getCardStatus,
};
