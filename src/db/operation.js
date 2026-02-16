const fs = require("fs").promises;
const path = require("path");

async function readJsonFile(filePath, fileName) {
  filePath = path.join(filePath, fileName);

  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      // ファイルが存在しない場合は空の配列を返す
      return [];
    }
    console.error(`Error reading ${fileName}:`, error);
    throw error;
  }
}

async function writeJsonFile(filePath, fileName, data) {
  filePath = path.join(filePath, fileName);
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error(`Error writing ${fileName}:`, error);
    throw error;
  }
}

module.exports = {
  readJsonFile,
  writeJsonFile,
};
