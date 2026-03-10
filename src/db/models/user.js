/**
 * ユーザーDBモデル
 * ユーザーデータのファイルベースのCRUD操作を管理する
 */
const path = require("path");
const { writeJsonFile, readJsonFile } = require("../operation");

const repositoryPath = path.join(__dirname, "../../../repository");

class UserModel {
  /**
   * 新規ユーザーを作成する関数
   * @param {string} userId - ユーザーID
   * @param {string} password - パスワード
   * @returns {Promise<object>} - 作成結果
   */
  async create(userId, password) {
    try {
      const users = await readJsonFile(repositoryPath, "user.json");
      if (users.find((user) => user.userId === userId)) {
        return { success: false, message: "User with this ID already exists." };
      }
      users.push({ userId, password });
      await writeJsonFile(repositoryPath, "user.json", users);
      return { success: true, data: { userId, password } };
    } catch (error) {
      throw error;
    }
  }

  /**
   * IDでユーザーを検索する関数
   * @param {string} userId - ユーザーID
   * @returns {Promise<object>} - 検索結果
   */
  async findOne(userId) {
    try {
      const users = await readJsonFile(repositoryPath, "user.json");
      const user = users.find((user) => user.userId === userId);
      if (user) {
        return { success: true, data: user };
      }
      return { success: false, message: "User not found." };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 全ユーザーを取得する関数
   * @returns {Promise<object>} - 取得結果
   */
  async findAll() {
    try {
      const users = await readJsonFile(repositoryPath, "user.json");
      return { success: true, data: users };
    } catch (error) {
      throw error;
    }
  }

  /**
   * ユーザー情報を更新する関数
   * @param {string} userId - ユーザーID
   * @param {object} newData - 更新データ
   * @returns {Promise<object>} - 更新結果
   */
  async update(userId, newData) {
    try {
      const users = await readJsonFile(repositoryPath, "user.json");
      const index = users.findIndex((user) => user.userId === userId);
      if (index === -1) {
        return { success: false, message: "User not found." };
      }
      users[index] = { ...users[index], ...newData };
      await writeJsonFile(repositoryPath, "user.json", users);
      return { success: true, data: users[index] };
    } catch (error) {
      throw error;
    }
  }

  /**
   * ユーザーを削除する関数
   * @param {string} userId - ユーザーID
   * @returns {Promise<object>} - 削除結果
   */
  async delete(userId) {
    try {
      let users = await readJsonFile(repositoryPath, "user.json");
      const initialLength = users.length;
      users = users.filter((user) => user.userId !== userId);
      if (users.length === initialLength) {
        return { success: false, message: "User not found." };
      }
      await writeJsonFile(repositoryPath, "user.json", users);
      return { success: true, data: null };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = UserModel;
