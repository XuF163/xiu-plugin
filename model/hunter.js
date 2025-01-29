import GameData from "../../../plugins/xiu-plugin/lib/GameData.js";



class HunterGameData extends GameData {
    constructor(dbPath) {
        super(dbPath);
    }

    async hunterShoot(groupId, userId, targetId) {
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

            // 开枪逻辑
            await this.addKill(groupId, targetPlayer.user_id);
            logger.mark(`猎人 ${userId} 开枪射击了 ${targetPlayer.user_id}`);
            return { success: true, message: `你开枪射击了 ${targetPlayer.user_id}`, targetPlayer: targetPlayer};
        } catch (err) {
            logger.error("Failed to hunter shoot:", err.message);
             return { success: false, message: "开枪失败" };
        }
    }
}

export default new HunterGameData(
    "./plugins/xiu-plugin/data/gangrenous/game.db",
);
