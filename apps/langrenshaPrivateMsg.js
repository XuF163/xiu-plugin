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
    if (role) {
      this.e.reply(`你的角色是${role}`);
    } else {
      this.e.reply("根本不是人");
    }
    return true;
  }
  async wolfKill(e) {
    //检查是否为狼人
    if (GameData.isWolf(e.group_id, e.user_id)) {
      //检查是否有击杀二字并取序号
      const match = e.msg.match(/击杀\s*(\d+)/);
      if (match) {
        const targetId = parseInt(match[1], 10); // 将提取的序号转换为整数
        console.log(`狼人 ${e.user_id} 选择了击杀 ${targetId} 号玩家`);
        return true;
      }
    } else {
      this.e.reply("你不是狼人");
      return false;
    }
  }
}
