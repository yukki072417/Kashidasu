const fs = require("fs");
const path = require("path");

async function createFile(filePath, fileName) {
  const target = path.join(filePath, fileName);

  try {
    fs.writeFileSync(target, JSON.stringify([], null, 2), "utf8");
  } catch (error) {
    console.error(`Error creating ${fileName}:`, error);
    throw error;
  }
}

async function initializeDatabase() {
  const repositoryPath = path.join(__dirname, "../../repository");
  if (fs.existsSync(repositoryPath) != true) {
    fs.mkdirSync(repositoryPath);
  }

  if (
    fs.existsSync(path.join(repositoryPath, "admin.json")) != true ||
    fs.existsSync(path.join(repositoryPath, "book.json")) != true ||
    fs.existsSync(path.join(repositoryPath, "loan.json")) != true ||
    fs.existsSync(path.join(repositoryPath, "user.json")) != true
  ) {
    await createFile(repositoryPath, "admin.json");
    await createFile(repositoryPath, "book.json");
    await createFile(repositoryPath, "loan.json");
    await createFile(repositoryPath, "user.json");
    console.log("Store initializing successed");
  }
}

module.exports = {
  initDb: initializeDatabase,
};

if (require.main === module) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Failed to initialize database:", err);
      process.exit(1);
    });
}
