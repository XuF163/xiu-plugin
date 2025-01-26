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
                player_index INTEGER NOT NULL,
                PRIMARY KEY (group_id, user_id)
            )
        `);
    await this.db.run(`
            CREATE TABLE IF NOT EXISTS user_group_mapping (
                user_id TEXT NOT NULL PRIMARY KEY,
                group_id TEXT NOT NULL
            )
        `);
    await this.db.run(`
            CREATE TABLE IF NOT EXISTS game_state (
                group_id TEXT NOT NULL PRIMARY KEY,
                witch_save INTEGER NOT NULL DEFAULT 0,
                witch_poison INTEGER NOT NULL DEFAULT 0,
                kill_list TEXT NOT NULL DEFAULT '[]'
            )
        `);
    await this.db.run(`
            CREATE TABLE IF NOT EXISTS kill_queue (
                group_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                kill_time INTEGER NOT NULL,
                PRIMARY KEY (group_id, user_id)
            )
        `);
  }

  async addKill(groupId, userId) {
    try {
      await this.db.run(
        "INSERT OR REPLACE INTO kill_queue (group_id, user_id, kill_time) VALUES (?, ?, ?)",
        [groupId, userId, Date.now()],
      );
      logger.mark(`User ${userId} added to kill queue in group ${groupId}.`);
      return true;
    } catch (err) {
      logger.error("Failed to add user to kill queue:", err.message);
      return false;
    }
  }

  async removeKillFromQueue(groupId, userId) {
    try {
      const result = await this.db.run(
        "DELETE FROM kill_queue WHERE group_id = ? AND user_id = ?",
        [groupId, userId],
      );
      logger.mark(
        `User ${userId} removed from kill queue in group ${groupId}.`,
      );
      return result.changes;
    } catch (err) {
      logger.error("Failed to remove user from kill queue:", err.message);
      return false;
    }
  }

  async getKillQueue(groupId) {
    try {
      const rows = await this.db.all(
        "SELECT user_id FROM kill_queue WHERE group_id = ?",
        [groupId],
      );
      return rows.map((row) => row.user_id);
    } catch (err) {
      logger.error("Failed to get kill queue:", err.message);
      return [];
    }
  }
  async clearKillQueue(groupId) {
    try {
      const result = await this.db.run(
        "DELETE FROM kill_queue WHERE group_id = ?",
        [groupId],
      );
      logger.mark(`Kill queue cleared for group ${groupId}.`);
      return result.changes;
    } catch (err) {
      logger.error("Failed to clear kill queue:", err.message);
      return false;
    }
  }
  async getGame(groupId) {
    try {
      const row = await this.db.get(
        "SELECT witch_save, witch_poison, kill_list FROM game_state WHERE group_id = ?",
        [groupId],
      );
      if (row) {
        return {
          witch: {
            save: !!row.witch_save,
            poison: !!row.witch_poison,
          },
          killList: JSON.parse(row.kill_list),
        };
      } else {
        return {
          witch: {
            save: false,
            poison: false,
          },
          killList: [],
        };
      }
    } catch (err) {
      logger.error("Failed to get game state:", err.message);
      return null;
    }
  }

  async setGame(groupId, game) {
    try {
      await this.db.run(
        "INSERT OR REPLACE INTO game_state (group_id, witch_save, witch_poison, kill_list) VALUES (?, ?, ?, ?)",
        [
          groupId,
          game.witch.save ? 1 : 0,
          game.witch.poison ? 1 : 0,
          JSON.stringify(game.killList),
        ],
      );
      return true;
    } catch (err) {
      logger.error("Failed to set game state:", err.message);
      return false;
    }
  }
  async hasUsedPotion(groupId, potionType) {
    const game = await this.getGame(groupId);
    if (!game) return false;
    return game.witch[potionType];
  }
  async usePotion(groupId, potionType, targetUserId) {
    const game = await this.getGame(groupId);
    if (!game) return;
    game.witch[potionType] = true;
    if (potionType === "poison") {
      game.killList.push(targetUserId);
    } else {
      if (game.killList.includes(targetUserId)) {
        game.killList.splice(game.killList.indexOf(targetUserId), 1);
      }
    }
    await this.setGame(groupId, game);
  }
  async getKillList(groupId) {
    const game = await this.getGame(groupId);
    if (!game) return [];
    return game.killList;
  }
  async resetKillList(groupId) {
    const game = await this.getGame(groupId);
    if (!game) return;
    game.killList = [];
    await this.setGame(groupId, game);
  }
  async removeKill(groupId, targetUserId) {
    const game = await this.getGame(groupId);
    if (!game) return;
    if (game.killList.includes(targetUserId)) {
      game.killList.splice(game.killList.indexOf(targetUserId), 1);
    }
    await this.setGame(groupId, game);
  }
  async resetGame(groupId) {
    const game = await this.getGame(groupId);
    if (!game) return;
    game.witch.save = false;
    game.witch.poison = false;
    game.killList = [];
    await this.setGame(groupId, game);
  }

  async addRole(groupId, userId, role, playerIndex = 0) {
    try {
      const result = await this.db.run(
        "INSERT OR REPLACE INTO game_roles (group_id, user_id, role,player_index) VALUES (?, ?, ?,?)",
        [groupId, userId, role, playerIndex],
      );
      logger.mark(
        `Role ${role} added for user ${userId} in group ${groupId}with index ${playerIndex}.`,
      );

      await this.addUserGroupMapping(userId, groupId);
      return result.changes;
    } catch (err) {
      logger.error("Failed to add role:", err.message);
      throw err;
    }
  }

  async addUserGroupMapping(userId, groupId) {
    try {
      await this.db.run(
        "INSERT OR REPLACE INTO user_group_mapping (user_id, group_id) VALUES (?, ?)",
        [userId, groupId],
      );
    } catch (err) {
      logger.error("Failed to add user group mapping:", err.message);
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
        "SELECT user_id, role,player_index FROM game_roles WHERE group_id = ?",
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

  async addOrUpdateUserRole(
    groupId,
    userId,
    role = "new_role",
    player_index = 0,
  ) {
    try {
      const changes = await this.addRole(groupId, userId, role, player_index);
      if (changes > 0) {
        logger.mark(
          `成功添加 ${userId} 在群组 ${groupId} 的角色为 ${role}序号为 ${player_index}`,
        );
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

  async getGroupIdByUserId(userId) {
    try {
      const row = await this.db.get(
        "SELECT group_id FROM user_group_mapping WHERE user_id = ?",
        [userId],
      );
      return row ? row.group_id : null;
    } catch (err) {
      logger.error("Failed to get group ID by user ID:", err.message);
      return null;
    }
  }

  async isWolf(userId) {
    try {
      const userGroupId = await this.getGroupIdByUserId(userId);
      if (!userGroupId) {
        return false;
      }
      const role = await this.getRole(userGroupId, userId);
      return role ? role.includes("狼") : false;
    } catch (err) {
      logger.error("Failed to check if user is wolf:", err.message);
      return false;
    }
  }

  async hasUsedPotion(groupId, potionType) {
    const game = await this.getGame(groupId);
    if (!game) return false;
    return game.witch[potionType];
  }
  async usePotion(groupId, potionType, targetUserId) {
    const game = await this.getGame(groupId);
    if (!game) return;
    game.witch[potionType] = true;
    if (potionType === "poison") {
      game.killList.push(targetUserId);
    } else {
      if (game.killList.includes(targetUserId)) {
        game.killList.splice(game.killList.indexOf(targetUserId), 1);
      }
    }
    await this.setGame(groupId, game);
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
