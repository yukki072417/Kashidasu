/**
 * 管理者DBモデル
 * 管理者データのファイルベースのCRUD操作を管理する
 */
const path = require("path");
const { writeJsonFile, readJsonFile } = require("../operation");

const repositoryPath = path.join(__dirname, "../../../repository");

class AdminModel {
  /**
   * 新規管理者を作成する関数
   * @param {string} adminId - 管理者ID
   * @param {string} password - パスワード
   */
  async create(adminId, password) {
    const admins = await readJsonFile(repositoryPath, "admin.json");
    if (admins.find((admin) => admin.adminId === adminId)) {
      throw new Error("User with this ID already exists.");
    }
    admins.push({ adminId, password });
    await writeJsonFile(repositoryPath, "admin.json", admins);
  }

  /**
   * IDで管理者を検索する関数
   * @param {string} adminId - 管理者ID
   * @returns {object} - 管理者データ
   */
  async findOne(adminId) {
    const admins = await readJsonFile(repositoryPath, "admin.json");
    return admins.find((admin) => admin.adminId === adminId);
  }

  /**
   * 全管理者を取得する関数
   * @returns {array} - 全管理者データ
   */
  async findAll() {
    const admins = await readJsonFile(repositoryPath, "admin.json");
    return admins;
  }

  /**
   * 管理者情報を更新する関数
   * @param {string} adminId - 管理者ID
   * @param {object} newData - 更新データ
   */
  async update(adminId, newData) {
    const admins = await readJsonFile(repositoryPath, "admin.json");
    const index = admins.findIndex((admin) => admin.adminId === adminId);
    if (index === -1) {
      throw new Error("User not found.");
    }
    admins[index] = { ...admins[index], ...newData };
    await writeJsonFile(repositoryPath, "admin.json", admins);
  }

  /**
   * 管理者を削除する関数
   * @param {string} adminId - 管理者ID
   */
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
