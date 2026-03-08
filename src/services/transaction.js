const fs = require("fs").promises;
const path = require("path");

// ロックを管理するMap（ファイルパス → Promise）
const fileLocks = new Map();

class Transaction {
  constructor() {
    /** @type {Map<string, string>} filePath → 元のJSONテキスト */
    this.snapshots = new Map();
    this.committed = false;
    this.rolledBack = false;
  }

  /**
   * トランザクション開始: 対象ファイルのスナップショットを取得し、ロックを確保する。
   * @param {string[]} filePaths - スナップショットを取るファイルパスの配列
   */
  async begin(filePaths) {
    if (this.snapshots.size > 0) {
      throw new Error("Transaction is already started.");
    }

    // 各ファイルのロックを順番に取得（デッドロック防止のため常にソート）
    const sortedPaths = [...new Set(filePaths)].sort();

    for (const filePath of sortedPaths) {
      await this._acquireLock(filePath);
    }

    // スナップショット取得
    for (const filePath of sortedPaths) {
      try {
        const content = await fs.readFile(filePath, "utf8");
        this.snapshots.set(filePath, content);
      } catch (err) {
        if (err.code === "ENOENT") {
          // ファイルが存在しない場合はnullを記録（rollback時に削除する）
          this.snapshots.set(filePath, null);
        } else {
          await this._releaseAllLocks();
          throw err;
        }
      }
    }
  }

  /**
   * コミット: スナップショットを破棄しロックを解放する。
   * （ファイルへの書き込みは各操作内で完了済みのため、ここでは何もしない）
   */
  async commit() {
    if (this.rolledBack) throw new Error("Already rolled back.");
    if (this.committed) throw new Error("Already committed.");

    this.committed = true;
    this.snapshots.clear();
    await this._releaseAllLocks();
  }

  /**
   * ロールバック: スナップショットからファイルを復元しロックを解放する。
   */
  async rollback() {
    if (this.committed) throw new Error("Already committed.");
    if (this.rolledBack) throw new Error("Already rolled back.");

    this.rolledBack = true;

    const errors = [];

    for (const [filePath, originalContent] of this.snapshots.entries()) {
      try {
        if (originalContent === null) {
          // もともと存在しなかったファイルは削除して元の状態に戻す
          await fs.unlink(filePath).catch(() => {
            /* 既に消えていれば無視 */
          });
        } else {
          await fs.writeFile(filePath, originalContent, "utf8");
        }
      } catch (err) {
        errors.push(`Failed to restore ${filePath}: ${err.message}`);
      }
    }

    this.snapshots.clear();
    await this._releaseAllLocks();

    if (errors.length > 0) {
      throw new Error(`Rollback partially failed:\n${errors.join("\n")}`);
    }
  }

  // ─── ロック管理（プロセス内の非同期競合を防ぐ） ───────────────────────────

  async _acquireLock(filePath) {
    while (fileLocks.has(filePath)) {
      await fileLocks.get(filePath);
    }
    let resolveLock;
    const lockPromise = new Promise((resolve) => {
      resolveLock = resolve;
    });
    fileLocks.set(filePath, lockPromise);
    this._lockedPaths = this._lockedPaths || [];
    this._lockedPaths.push({ filePath, resolveLock });
  }

  async _releaseAllLocks() {
    for (const { filePath, resolveLock } of this._lockedPaths || []) {
      fileLocks.delete(filePath);
      resolveLock();
    }
    this._lockedPaths = [];
  }
}

/**
 * トランザクション付きで非同期処理を実行するヘルパー。
 *
 * @param {string[]} filePaths - 対象ファイルパス
 * @param {(tx: Transaction) => Promise<T>} fn - トランザクション内で実行する処理
 * @returns {Promise<T>}
 *
 * @example
 * const result = await withTransaction(
 *   [loanFilePath, bookFilePath],
 *   async (tx) => {
 *     await createLoan(...);
 *     await updateBook(...);
 *     return { success: true };
 *   }
 * );
 */
async function withTransaction(filePaths, fn) {
  const tx = new Transaction();
  await tx.begin(filePaths);

  try {
    const result = await fn(tx);
    await tx.commit();
    return result;
  } catch (err) {
    try {
      await tx.rollback();
    } catch (rollbackErr) {
      // ロールバック自体が失敗した場合は両方のエラーを報告
      const combined = new Error(
        `Operation failed: ${err.message}\nRollback also failed: ${rollbackErr.message}`,
      );
      combined.originalError = err;
      combined.rollbackError = rollbackErr;
      throw combined;
    }
    throw err; // 元のエラーを再スロー
  }
}

module.exports = { Transaction, withTransaction };
