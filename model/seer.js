import GameData from "../../../plugins/xiu-plugin/lib/GameData.js";

class SeerGameData extends GameData {
  constructor(dbPath) {
    super(dbPath);
  }

  async seerCheck(groupId, userId, targetId) {
    try {
      // 获取当前群组的所有玩家
      const players = await this.getAllRoles(groupId);
      // 检查目标玩家是否存在
      const targetPlayer = players.find(
        (player) => player.player_index === targetId,
      );
      if (!targetPlayer) {
        return { success: false, message: `目标玩家 ${targetId} 不存在` };
      }

      const targetRole = await this.getRole(groupId, targetPlayer.user_id);
      let result = "好人";
      if (targetRole.includes("狼")) {
        result = "狼人";
      }
      logger.mark(
        `预言家 ${userId} 查验了 ${targetPlayer.user_id}, 身份是 ${result}`,
      );
      return {
        success: true,
        message: `[${targetPlayer.user_id}] 的身份是 ${result}`,
        targetPlayer: targetPlayer,
      };
    } catch (err) {
      logger.error("Failed to seer check:", err.message);
      return { success: false, message: "查验失败" };
    }
  }
}

export default new SeerGameData("./plugins/xiu-plugin/data/gangrenous/game.db");
