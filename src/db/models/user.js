const path = require("path");
const { writeJsonFile, readJsonFile } = require("../operation");

const repositoryPath = path.join(__dirname, "../../repository");

class UserModel {
  async create(userId, password) {
    const users = await readJsonFile(repositoryPath, "user.json");
    if (users.find((user) => user.userId === userId)) {
      throw new Error("User with this ID already exists.");
    }
    users.push({ userId, password });
    await writeJsonFile(repositoryPath, "user.json", users);
  }

  async findOne(userId) {
    const users = await readJsonFile(repositoryPath, "user.json");
    return users.find((user) => user.userId === userId);
  }

  async findAll() {
    const users = await readJsonFile(repositoryPath, "user.json");
    return users;
  }

  async update(userId, newData) {
    const users = await readJsonFile(repositoryPath, "user.json");
    const index = users.findIndex((user) => user.userId === userId);
    if (index === -1) {
      throw new Error("User not found.");
    }
    users[index] = { ...users[index], ...newData };
    await writeJsonFile(repositoryPath, "user.json", users);
  }

  async delete(userId) {
    let users = await readJsonFile(repositoryPath, "user.json");
    const initialLength = users.length;
    users = users.filter((user) => user.userId !== userId);
    if (users.length === initialLength) {
      throw new Error("User not found.");
    }
    await writeJsonFile(repositoryPath, "user.json", users);
  }
}

module.exports = UserModel;
