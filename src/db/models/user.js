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
   */
  async create(userId, password) {
    const users = await readJsonFile(repositoryPath, "user.json");
    if (users.find((user) => user.userId === userId)) {
      throw new Error("User with this ID already exists.");
    }
    users.push({ userId, password });
    await writeJsonFile(repositoryPath, "user.json", users);
  }

  /**
   * IDでユーザーを検索する関数
   * @param {string} userId - ユーザーID
   * @returns {object} - ユーザーデータ
   */
  async findOne(userId) {
    const users = await readJsonFile(repositoryPath, "user.json");
    return users.find((user) => user.userId === userId);
  }

  /**
   * 全ユーザーを取得する関数
   * @returns {array} - 全ユーザーデータ
   */
  async findAll() {
    const users = await readJsonFile(repositoryPath, "user.json");
    return users;
  }

  /**
   * ユーザー情報を更新する関数
   * @param {string} userId - ユーザーID
   * @param {object} newData - 更新データ
   */
  async update(userId, newData) {
    const users = await readJsonFile(repositoryPath, "user.json");
    const index = users.findIndex((user) => user.userId === userId);
    if (index === -1) {
      throw new Error("User not found.");
    }
    users[index] = { ...users[index], ...newData };
    await writeJsonFile(repositoryPath, "user.json", users);
  }

  /**
   * ユーザーを削除する関数
   * @param {string} userId - ユーザーID
   */
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
