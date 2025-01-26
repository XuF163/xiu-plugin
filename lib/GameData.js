// GameData.js
// GameData.js
import { open } from "sqlite";
import sqlite3 from "sqlite3";

class GameData {
  static instance = null;

  constructor(dbPath = ":memory:") {
    if (GameData.instance) {
      return GameData.instance;
    }

    this.dbPath = dbPath;
    this.db = null; // 初始化为 null
    GameData.instance = this;

    // 立即进行异步初始化
    this.initialize();
  }

  async initialize() {
    try {
      this.db = await open({
        filename: this.dbPath,
        driver: sqlite3.Database,
      });
      logger.mark("Connected to database.");
      await this.initDatabase();
      logger.mark('Table "game_roles" created or already exists.');
    } catch (err) {
      logger.error("Failed to initialize database:", err.message);
      throw err;
    }
  }

  async initDatabase() {
    await this.db.run(`
            CREATE TABLE IF NOT EXISTS game_roles (
                group_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                role TEXT NOT NULL,
                PRIMARY KEY (group_id, user_id)
            )
        `);
  }

  async addRole(groupId, userId, role) {
    try {
      const result = await this.db.run(
        "INSERT OR REPLACE INTO game_roles (group_id, user_id, role) VALUES (?, ?, ?)",
        [groupId, userId, role],
      );
      logger.mark(`Role ${role} added for user ${userId} in group ${groupId}.`);
      return result.changes;
    } catch (err) {
      logger.error("Failed to add role:", err.message);
      throw err;
    }
  }

  async getRole(groupId, userId) {
    try {
      const row = await this.db.get(
        "SELECT role FROM game_roles WHERE group_id = ? AND user_id = ?",
        [groupId, userId],
      );
      return row ? row.role : null;
    } catch (err) {
      logger.error("Failed to get role:", err.message);
      throw err;
    }
  }

  async getAllRoles(groupId) {
    try {
      const rows = await this.db.all(
        "SELECT user_id, role FROM game_roles WHERE group_id = ?",
        [groupId],
      );
      return rows;
    } catch (err) {
      logger.error("Failed to get all roles:", err.message);
      throw err;
    }
  }

  async removeRole(groupId, userId) {
    try {
      const result = await this.db.run(
        "DELETE FROM game_roles WHERE group_id = ? AND user_id = ?",
        [groupId, userId],
      );
      logger.mark(`Role removed for user ${userId} in group ${groupId}.`);
      return result.changes;
    } catch (err) {
      logger.error("Failed to remove role:", err.message);
      throw err;
    }
  }

  async removeAllRoles(groupId) {
    try {
      const result = await this.db.run(
        "DELETE FROM game_roles WHERE group_id = ?",
        [groupId],
      );
      logger.mark(`All roles removed for group ${groupId}.`);
      return result.changes;
    } catch (err) {
      logger.error("Failed to remove all roles:", err.message);
      throw err;
    }
  }

  async close() {
    try {
      await this.db.close();
      logger.mark("Database connection closed.");
    } catch (err) {
      logger.error("Failed to close database:", err.message);
      throw err;
    }
  }

  async addOrUpdateUserRole(groupId, userId, role = "new_role") {
    try {
      const changes = await this.addRole(groupId, userId, role);
      if (changes > 0) {
        logger.mark(`成功添加 ${userId} 在群组 ${groupId} 的角色为 ${role}`);
      } else {
        logger.mark(`用户 ${userId} 在群组 ${groupId} 的角色没有改变`);
      }
    } catch (error) {
      console.error("添加或更新角色失败:", error);
    }
  }

  async groupInit(groupId) {
    try {
      const result = await this.removeAllRoles(groupId);
      logger.mark(`Group ${groupId} initialized. All player records removed.`);
      return result;
    } catch (err) {
      logger.error("Failed to initialize group:", err.message);
      throw err;
    }
  }

  async getUserIdsByRole(groupId, role) {
    try {
      const rows = await this.db.all(
        "SELECT user_id FROM game_roles WHERE group_id = ? AND role = ?",
        [groupId, role],
      );
      return rows.map((row) => row.user_id);
    } catch (err) {
      logger.error("Failed to get user IDs by role:", err.message);
      return [];
    }
  }

  async getPrivateRole(userId) {
    try {
      // 这里假设在私聊中，我们只需要根据 user_id 来查询角色，不需要 group_id
      const row = await this.db.get(
        "SELECT role FROM game_roles WHERE user_id = ?",
        [userId],
      );
      return row ? row.role : null;
    } catch (err) {
      logger.error("Failed to get private role:", err.message);
      return null;
    }
  }
  async isWolf(groupId, userId) {
    try {
      const role = await this.getRole(groupId, userId);
      return role ? role.includes("狼") : false;
    } catch (err) {
      logger.error("Failed to check if user is wolf:", err.message);
      return false;
    }
  }
}

export default new GameData("./plugins/xiu-plugin/data/gangrenous/game.db");

// import sqlite3 from 'sqlite3'
//
// class GameData {
//   constructor (dbPath = ':memory:') {
//     this.dbPath = dbPath
//     this.db = new sqlite3.Database(this.dbPath, (err) => {
//       if (err) {
//         logger.error('Failed to connect to database:', err.message)
//         throw err
//       }
//       logger.mark('Connected to database.')
//       this.initDatabase()
//     })
//   }
//
//   async initDatabase () {
//     this.db.run(`
//             CREATE TABLE IF NOT EXISTS game_roles (
//                 group_id TEXT NOT NULL,
//                 user_id TEXT NOT NULL,
//                 role TEXT NOT NULL,
//                 PRIMARY KEY (group_id, user_id)
//             )
//         `, (err) => {
//       if (err) {
//         logger.error('Failed to create table:', err.message)
//       } else {
//         logger.mark('Table "game_roles" created or already exists.')
//       }
//     })
//   }
//
//   addRole (groupId, userId, role) {
//     return new Promise((resolve, reject) => {
//       this.db.run(
//         'INSERT OR REPLACE INTO game_roles (group_id, user_id, role) VALUES (?, ?, ?)',
//         [groupId, userId, role],
//         function (err) {
//           if (err) {
//             logger.error('Failed to add role:', err.message)
//             reject(err)
//           } else {
//             logger.mark(`Role ${role} added for user ${userId} in group ${groupId}.`)
//             resolve(this.changes)
//           }
//         }
//       )
//     })
//   }
//
//   getRole (groupId, userId) {
//     return new Promise((resolve, reject) => {
//       this.db.get(
//         'SELECT role FROM game_roles WHERE group_id = ? AND user_id = ?',
//         [groupId, userId],
//         (err, row) => {
//           if (err) {
//             logger.error('Failed to get role:', err.message)
//             reject(err)
//           } else {
//             resolve(row ? row.role : null)
//           }
//         }
//       )
//     })
//   }
//
//   getAllRoles (groupId) {
//     return new Promise((resolve, reject) => {
//       this.db.all(
//         'SELECT user_id, role FROM game_roles WHERE group_id = ?',
//         [groupId],
//         (err, rows) => {
//           if (err) {
//             logger.error('Failed to get all roles:', err.message)
//             reject(err)
//           } else {
//             resolve(rows)
//           }
//         }
//       )
//     })
//   }
//
//   removeRole (groupId, userId) {
//     return new Promise((resolve, reject) => {
//       this.db.run(
//         'DELETE FROM game_roles WHERE group_id = ? AND user_id = ?',
//         [groupId, userId],
//         function (err) {
//           if (err) {
//             logger.error('Failed to remove role:', err.message)
//             reject(err)
//           } else {
//             logger.mark(`Role removed for user ${userId} in group ${groupId}.`)
//             resolve(this.changes)
//           }
//         }
//       )
//     })
//   }
//
//   removeAllRoles (groupId) {
//     return new Promise((resolve, reject) => {
//       this.db.run(
//         'DELETE FROM game_roles WHERE group_id = ?',
//         [groupId],
//         function (err) {
//           if (err) {
//             logger.error('Failed to remove all roles:', err.message)
//             reject(err)
//           } else {
//             logger.mark(`All roles removed for group ${groupId}.`)
//             resolve(this.changes)
//           }
//         }
//       )
//     })
//   }
//
//   close () {
//     this.db.close((err) => {
//       if (err) {
//         logger.error('Failed to close database:', err.message)
//       } else {
//         logger.mark('Database connection closed.')
//       }
//     })
//   }
// }
//
// export default GameData
