const CardModel = require("../model/cardModel");

const cardModel = new CardModel();

async function generateCard(req, res, next) {
  const { id, gread, class: className, number } = req.body;
  
  try {
    const result = await cardModel.generateCard({
      id,
      gread,
      class: className,
      number
    });
    
    res.json({ result: "SUCCESS", ...result });
  } catch (error) {
    console.error("Error generating card:", error);
    res.status(500).json({ result: "FAILED", message: error.message });
  }
}

async function getCardStatus(req, res, next) {
  try {
    const files = await cardModel.getCardFiles();
    res.json({ result: "SUCCESS", ...files });
  } catch (error) {
    console.error("Error getting card status:", error);
    res.status(500).json({ result: "FAILED", message: error.message });
  }
}

module.exports = {
  generateCard,
  getCardStatus
};
