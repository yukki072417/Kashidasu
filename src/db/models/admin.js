const path = require("path");
const { writeJsonFile, readJsonFile } = require("../operation");

const repositoryPath = path.join(__dirname, "../../repository");

class AdminModel {
  async create(adminId, password) {
    const admins = await readJsonFile(repositoryPath, "admin.json");
    if (admins.find((admin) => admin.adminId === adminId)) {
      throw new Error("User with this ID already exists.");
    }
    admins.push({ adminId, password });
    await writeJsonFile(repositoryPath, "admin.json", admins);
  }

  async findOne(adminId) {
    const admins = await readJsonFile(repositoryPath, "admin.json");
    return admins.find((admin) => admin.adminId === adminId);
  }

  async findAll() {
    const admins = await readJsonFile(repositoryPath, "admin.json");
    return admins;
  }

  async update(adminId, newData) {
    const admins = await readJsonFile(repositoryPath, "admin.json");
    const index = admins.findIndex((admin) => admin.adminId === adminId);
    if (index === -1) {
      throw new Error("User not found.");
    }
    admins[index] = { ...admins[index], ...newData };
    await writeJsonFile(repositoryPath, "admin.json", admins);
  }

  async delete(adminId) {
    let admins = await readJsonFile(repositoryPath, "admin.json");
    const initialLength = admins.length;
    admins = admins.filter((admin) => admin.adminId !== adminId);
    if (admins.length === initialLength) {
      throw new Error("User not found.");
    }
    await writeJsonFile(repositoryPath, "admin.json", admins);
  }
}

module.exports = AdminModel;
