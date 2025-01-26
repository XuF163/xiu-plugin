import GameData from "../lib/GameData.js";
import plugin from "../../../lib/plugins/plugin.js";

export class LabgrenshaPrivate extends plugin {
  constructor() {
    super({
      /** 功能名称 */
      name: "1",
      event: "message",
      /** 优先级，数字越小等级越高 */
      rule: [
        { reg: "#我的角色", fnc: "showMyRole" },
        // 夜晚指令（私聊）
        { reg: "#击杀 (.+)", fnc: "wolfKill" },
        { reg: "#查验 (.+)", fnc: "seerCheck" },
        { reg: "#解药 (.+)", fnc: "witchSave" },
        { reg: "#毒药 (.+)", fnc: "witchPoison" },
        { reg: "#不使用|#noskill", fnc: "witchNoSkill" },
        { reg: "#开枪 (.+)", fnc: "hunterShoot" },
        // 守卫
        { reg: "#守护 (.+)", fnc: "guardProtect" },
        // 白痴
        { reg: "#装傻", fnc: "idiotActDumb" },
      ],
    });
  }

  async showMyRole(e) {
    const role = await GameData.getPrivateRole(e.user_id);
    if (e.isGroup) {
      this.e.reply("私聊派蒙查看你的角色喵");
      return false;
    }
    if (role) {
      this.e.reply(`你的角色是${role}`);
    } else {
      this.e.reply("根本不是人");
    }
    return true;
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

  async seerCheck(e) {
    if (!e.isGroup) {
      e.reply("请在群聊中使用查验技能");
      return true;
    }
    console.log(`当前用户ID: ${e.user_id}`);
    const groupId = await GameData.getGroupIdByUserId(e.user_id);
    const role = await GameData.getRole(groupId, e.user_id);
    console.log(`当前用户角色: ${role}`);

    if (role !== "预言家") {
      this.e.reply("你不是预言家，无法使用查验技能。");
      return false;
    }
    const match = e.msg.match(/查验\s*(\d+)/);
    if (!match) {
      this.e.reply("请使用【#查验 目标序号】格式发送指令");
      return false;
    }
    const targetId = parseInt(match[1], 10); // 将提取的序号转换为整数
    // 获取当前群组的所有玩家
    const players = await GameData.getAllRoles(groupId);
    // 检查目标玩家是否存在
    const targetPlayer = players.find(
      (player) => player.player_index === targetId,
    );
    if (!targetPlayer) {
      this.e.reply(`目标玩家 ${targetId} 不存在`);
      return false;
    }

    const targetRole = await GameData.getRole(groupId, targetPlayer.user_id);
    let result = "好人";
    if (targetRole.includes("狼")) {
      result = "狼人";
    }
    logger.mark(
      `预言家 ${e.user_id} 查验了 ${targetPlayer.user_id}, 身份是 ${result}`,
    );
    this.e.reply(`[${targetPlayer.user_id}] 的身份是 ${result}`);
    Bot[e.self_id]
      .pickGroup(GameData.getGroupIdByUserId(e.user_id))
      .sendMsg(`预言家选择查验了一名玩家`);
    return true;
  }

  async witchSave(e) {
    console.log(`当前用户ID: ${e.user_id}`);
    const groupId = await GameData.getGroupIdByUserId(e.user_id);
    const role = await GameData.getRole(groupId, e.user_id);
    console.log(`当前用户角色: ${role}`);

    if (role !== "魔法师") {
      this.e.reply("你不是魔法师，无法使用解药。");
      return false;
    }

    // 检查是否已经使用过解药
    if (await GameData.hasUsedPotion(groupId, "save")) {
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
    const players = await GameData.getAllRoles(groupId);
    // 检查目标玩家是否存在
    const targetPlayer = players.find(
      (player) => player.player_index === targetId,
    );
    if (!targetPlayer) {
      this.e.reply(`目标玩家 ${targetId} 不存在`);
      return false;
    }

    // 使用解药逻辑
    await GameData.usePotion(groupId, "save", targetPlayer.user_id);
    logger.mark(`魔法师 ${e.user_id} 使用解药救了 ${targetPlayer.user_id}`);
    this.e.reply(`你使用了解药，救了 ${targetPlayer.user_id}`);
    Bot[e.self_id]
      .pickGroup(GameData.getGroupIdByUserId(e.user_id))
      .sendMsg(`魔法师使用了救药`);
    return true;
  }

  async witchPoison(e) {
    console.log(`当前用户ID: ${e.user_id}`);
    const groupId = await GameData.getGroupIdByUserId(e.user_id);
    const role = await GameData.getRole(groupId, e.user_id);
    console.log(`当前用户角色: ${role}`);

    if (role !== "魔法师") {
      this.e.reply("你不是魔法师，无法使用毒药。");
      return false;
    }

    // 检查是否已经使用过毒药
    if (await GameData.hasUsedPotion(groupId, "poison")) {
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
    const players = await GameData.getAllRoles(groupId);
    // 检查目标玩家是否存在
    const targetPlayer = players.find(
      (player) => player.player_index === targetId,
    );
    if (!targetPlayer) {
      this.e.reply(`目标玩家 ${targetId} 不存在`);
      return false;
    }

    // 使用毒药逻辑
    await GameData.usePotion(groupId, "poison", targetPlayer.user_id);
    logger.mark(`魔法师 ${e.user_id} 使用毒药毒了 ${targetPlayer.user_id}`);
    await GameData.usePotion(groupId, "poison", targetPlayer.user_id);
    this.e.reply(`你使用了毒药，毒了 ${targetPlayer.user_id}`);
    Bot[e.self_id]
      .pickGroup(GameData.getGroupIdByUserId(e.user_id))
      .sendMsg(`魔法师使用了毒药`);
    return true;
  }
}
