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
   * @returns {Promise<object>} - 作成結果
   */
  async create(adminId, password) {
    try {
      const admins = await readJsonFile(repositoryPath, "admin.json");
      if (admins.find((admin) => admin.adminId === adminId)) {
        return { success: false, message: "User with this ID already exists." };
      }
      admins.push({ adminId, password });
      await writeJsonFile(repositoryPath, "admin.json", admins);
      return { success: true, data: { adminId, password } };
    } catch (error) {
      throw error;
    }
  }

  /**
   * IDで管理者を検索する関数
   * @param {string} adminId - 管理者ID
   * @returns {Promise<object>} - 検索結果
   */
  async findOne(adminId) {
    try {
      const admins = await readJsonFile(repositoryPath, "admin.json");
      const admin = admins.find((admin) => admin.adminId === adminId);
      if (admin) {
        return { success: true, data: admin };
      }
      return { success: false, message: "Admin not found." };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 全管理者を取得する関数
   * @returns {Promise<object>} - 取得結果
   */
  async findAll() {
    try {
      const admins = await readJsonFile(repositoryPath, "admin.json");
      return { success: true, data: admins };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 管理者情報を更新する関数
   * @param {string} adminId - 管理者ID
   * @param {object} newData - 更新データ
   * @returns {Promise<object>} - 更新結果
   */
  async update(adminId, newData) {
    try {
      const admins = await readJsonFile(repositoryPath, "admin.json");
      const index = admins.findIndex((admin) => admin.adminId === adminId);
      if (index === -1) {
        return { success: false, message: "User not found." };
      }
      admins[index] = { ...admins[index], ...newData };
      await writeJsonFile(repositoryPath, "admin.json", admins);
      return { success: true, data: admins[index] };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 管理者を削除する関数
   * @param {string} adminId - 管理者ID
   * @returns {Promise<object>} - 削除結果
   */
  async delete(adminId) {
    try {
      let admins = await readJsonFile(repositoryPath, "admin.json");
      const initialLength = admins.length;
      admins = admins.filter((admin) => admin.adminId !== adminId);
      if (admins.length === initialLength) {
        return { success: false, message: "User not found." };
      }
      await writeJsonFile(repositoryPath, "admin.json", admins);
      return { success: true, data: null };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = AdminModel;
