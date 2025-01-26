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
}
