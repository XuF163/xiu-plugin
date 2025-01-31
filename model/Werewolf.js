import { GameData } from "../../../plugins/xiu-plugin/lib/GameData.js";

class Werewolf extends GameData {
  constructor(dbPath) {
    super(dbPath);
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

  async wolfKill(e) {
    console.log(`当前用户ID: ${e.user_id}`);
    const groupId = await GameData.getGroupIdByUserId(e.user_id);
    const role = await GameData.getRole(groupId, e.user_id);
    console.log(`当前用户角色: ${role}`);
    //检查是否为狼人
    if (await GameData.isWolf(e.user_id)) {
      //检查是否有击杀二字并取序号
      const match = e.msg.match(/击杀\s*(\d+)/);
      if (match) {
        const targetId = parseInt(match[1], 10); // 将提取的序号转换为整数
        // 获取当前群组的所有玩家
        const players = await GameData.getAllRoles(groupId);
        // 检查目标玩家是否存在
        const targetPlayer = players.find(
          (player) => player.player_index === targetId,
        );
        if (targetPlayer) {
          console.log(`狼人 ${e.user_id} 选择了击杀 ${targetId} 号玩家`);
          await GameData.addKill(groupId, targetPlayer.user_id);
          e.reply(`你击杀了${targetId}, 请等待天亮`);
          Bot[e.self_id]
            .pickGroup(GameData.getGroupIdByUserId(e.user_id))
            .sendMsg(`狼人选择了击杀 ${targetId} 号玩家`);
          // TODO: 在这里添加击杀逻辑
          return true;
        } else {
          this.e.reply(`目标玩家 ${targetId} 不存在`);
          return false;
        }
      } else {
        this.e.reply("请按照【#击杀 目标序号】的格式发送指令");
        return false;
      }
    } else {
      this.e.reply("你不是狼人");
      return false;
    }
  }
}

export default new Werewolf("./plugins/xiu-plugin/data/gangrenous/game.db");
