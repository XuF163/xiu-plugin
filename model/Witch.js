// WitchGameData.js
import GameData from "../../../plugins/xiu-plugin/lib/GameData.js";

class WitchGameData extends GameData {
  constructor(dbPath) {
    super(dbPath);
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

  async witchSave(e) {
    console.log(`当前用户ID: ${e.user_id}`);
    const groupId = await WerewolfGameData.getGroupIdByUserId(e.user_id);
    const role = await WerewolfGameData.getRole(groupId, e.user_id);
    console.log(`当前用户角色: ${role}`);

    if (role !== "魔法师") {
      this.e.reply("你不是魔法师，无法使用解药。");
      return false;
    }

    // 检查是否已经使用过解药
    if (await WitchGameData.hasUsedPotion(groupId, "save")) {
      this.e.reply("你今晚已经使用过解药了。");
      return false;
    }

    const match = e.msg.match(/解药\s*(\d+)/);
    if (!match) {
      this.e.reply("请使用【#解药 目标序号】的格式发送指令");
      return false;
    }
    const targetId = parseInt(match[1], 10); // 将提取的序号转换为整数
    // 获取当前群组的所有玩家
    const players = await WerewolfGameData.getAllRoles(groupId);
    // 检查目标玩家是否存在
    const targetPlayer = players.find(
      (player) => player.player_index === targetId,
    );
    if (!targetPlayer) {
      this.e.reply(`目标玩家 ${targetId} 不存在`);
      return false;
    }

    // 使用解药逻辑
    await WitchGameData.usePotion(groupId, "save", targetPlayer.user_id);
    logger.mark(`魔法师 ${e.user_id} 使用解药救了 ${targetPlayer.user_id}`);
    this.e.reply(`你使用了解药，救了 ${targetPlayer.user_id}`);
    Bot[e.self_id]
      .pickGroup(WerewolfGameData.getGroupIdByUserId(e.user_id))
      .sendMsg(`魔法师使用了救药`);
    return true;
  }

  async witchPoison(e) {
    console.log(`当前用户ID: ${e.user_id}`);
    const groupId = await WerewolfGameData.getGroupIdByUserId(e.user_id);
    const role = await WerewolfGameData.getRole(groupId, e.user_id);
    console.log(`当前用户角色: ${role}`);

    if (role !== "魔法师") {
      this.e.reply("你不是魔法师，无法使用毒药。");
      return false;
    }

    // 检查是否已经使用过毒药
    if (await WitchGameData.hasUsedPotion(groupId, "poison")) {
      this.e.reply("你今晚已经使用过毒药了。");
      return false;
    }

    const match = e.msg.match(/毒药\s*(\d+)/);
    if (!match) {
      this.e.reply("请使用【#毒药 目标序号】的格式发送指令");
      return false;
    }
    const targetId = parseInt(match[1], 10); // 将提取的序号转换为整数
    // 获取当前群组的所有玩家
    const players = await WerewolfGameData.getAllRoles(groupId);
    // 检查目标玩家是否存在
    const targetPlayer = players.find(
      (player) => player.player_index === targetId,
    );
    if (!targetPlayer) {
      this.e.reply(`目标玩家 ${targetId} 不存在`);
      return false;
    }

    // 使用毒药逻辑
    await this.usePotion(groupId, "poison", targetPlayer.user_id);
    logger.mark(`魔法师 ${e.user_id} 使用毒药毒了 ${targetPlayer.user_id}`);
    await this.usePotion(groupId, "poison", targetPlayer.user_id);
    this.e.reply(`你使用了毒药，毒了 ${targetPlayer.user_id}`);
    Bot[e.self_id]
      .pickGroup(WerewolfGameData.getGroupIdByUserId(e.user_id))
      .sendMsg(`魔法师使用了毒药`);
    return true;
  }
  async witchNoSkill(e) {
    console.log(`当前用户ID: ${e.user_id}`);
    const groupId = await WerewolfGameData.getGroupIdByUserId(e.user_id);
    const role = await WerewolfGameData.getRole(groupId, e.user_id);
    console.log(`当前用户角色: ${role}`);

    if (role !== "魔法师") {
      this.e.reply("你不是魔法师，无法使用技能。");
      return false;
    }

    // 检查是否已经使用过毒药
    if (await this.hasUsedPotion(groupId, "noSkill")) {
      this.e.reply("你今晚已经使用过技能了。");
      return false;
    }

    // 使用技能逻辑
    await this.usePotion(groupId, "noSkill", e.user_id);
    logger.mark(`魔法师 ${e.user_id} 使用了技能`);
    this.e.reply(`你选择了不使用技能`);
    Bot[e.self_id]
      .pickGroup(this.getGroupIdByUserId(e.user_id))
      .sendMsg(`魔法师选择了不使用技能`);
    return true;
  }
}

export default new WitchGameData(
  "./plugins/xiu-plugin/data/gangrenous/game.db",
);
