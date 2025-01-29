import GameData from "../../../plugins/xiu-plugin/lib/GameData.js";

class Idiot extends GameData {
  constructor(dbPath) {
    super(dbPath);
  }

  async setIdiotActDumb(groupId, userId) {
    try {
      await this.db.run(
        "INSERT OR REPLACE INTO game_state (group_id, idiot_act_dumb) VALUES (?, ?)",
        [groupId, userId],
      );
      logger.mark(`白痴 ${userId} 在群组 ${groupId} 发动了装傻技能`);
      return true;
    } catch (err) {
      logger.error("Failed to set idiot act dumb:", err.message);
      return false;
    }
  }

  async getIdiotActDumb(groupId) {
    try {
      const row = await this.db.get(
        "SELECT idiot_act_dumb FROM game_state WHERE group_id = ?",
        [groupId],
      );
      return row ? row.idiot_act_dumb : null;
    } catch (err) {
      logger.error("Failed to get idiot act dumb:", err.message);
      return null;
    }
  }

  async resetIdiotActDumb(groupId) {
    try {
      await this.db.run(
        "UPDATE game_state SET idiot_act_dumb = NULL WHERE group_id = ?",
        [groupId],
      );
      logger.mark(`白痴装傻状态在群组 ${groupId} 被重置`);
      return true;
    } catch (err) {
      logger.error("Failed to reset idiot act dumb:", err.message);
      return false;
    }
  }

  async idiotActDumb(e) {
    console.log(`当前用户ID: ${e.user_id}`);
    const groupId = await GameData.getGroupIdByUserId(e.user_id);
    const role = await GameData.getRole(groupId, e.user_id);
    console.log(`当前用户角色: ${role}`);

    if (role !== "白痴") {
      this.e.reply("你不是白痴，无法使用装傻技能。");
      return false;
    }
    const idiotActDumb = await GameData.getIdiotActDumb(groupId);
    if (idiotActDumb) {
      this.e.reply("你已经使用过装傻技能了。");
      return false;
    }

    await GameData.setIdiotActDumb(groupId, e.user_id);
    logger.mark(`白痴 ${e.user_id} 发动了装傻技能`);
    this.e.reply("你发动了装傻技能，今晚不会被放逐");
    Bot[e.self_id]
      .pickGroup(GameData.getGroupIdByUserId(e.user_id))
      .sendMsg(`白痴发动了装傻技能`);
    return true;
  }
}

export default new Idiot("./plugins/xiu-plugin/data/gangrenous/game.db");
