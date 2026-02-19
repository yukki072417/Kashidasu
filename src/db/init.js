const path = require("path");
const { createAdmin } = require("../model/adminModel");
const fs = require("fs").promises;
const fsSync = require("fs");

async function createFile(filePath, fileName) {
  const target = path.join(filePath, fileName);

  try {
    await fs.writeFile(target, JSON.stringify([], null, 2), "utf8");
  } catch (error) {
    console.error(`Error creating ${fileName}:`, error);
    throw error;
  }
}

async function initializeDatabase() {
  const repositoryPath = path.join(__dirname, "../../repository");

  if (!fsSync.existsSync(repositoryPath)) {
    fsSync.mkdirSync(repositoryPath);
  }

  const adminPath = path.join(repositoryPath, "admin.json");
  const bookPath = path.join(repositoryPath, "book.json");
  const loanPath = path.join(repositoryPath, "loan.json");
  const userPath = path.join(repositoryPath, "user.json");

  const needsInit =
    !fsSync.existsSync(adminPath) ||
    !fsSync.existsSync(bookPath) ||
    !fsSync.existsSync(loanPath) ||
    !fsSync.existsSync(userPath);

  if (needsInit) {
    await Promise.all([
      createFile(repositoryPath, "admin.json"),
      createFile(repositoryPath, "book.json"),
      createFile(repositoryPath, "loan.json"),
      createFile(repositoryPath, "user.json"),
    ]);

    await createAdmin("0123456789", "password");

    console.log("Store initializing succeeded");
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
