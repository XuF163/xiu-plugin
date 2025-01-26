import GameData from "../lib/GameData.js";
import plugin from "../../../lib/plugins/plugin.js";

export class LabgrenshaGame extends plugin {
  constructor() {
    super({
      /** 功能名称 */
      name: "1",
      event: "message",
      /** 优先级，数字越小等级越高 */
      rule: [
        // 白天指令
        { reg: "#发言 (.+)", fnc: "playerSpeak" }, // 使用正则捕获发言内容
        { reg: "#投票 (.+)", fnc: "playerVote" }, // 使用正则捕获投票对象
        { reg: "#跳过|#skip", fnc: "playerSkipVote" },
        { reg: "#查看投票|#votes", fnc: "showVoteStatus" },

        // 守卫
        { reg: "#守护 (.+)", fnc: "guardProtect" },
        // 白痴
        { reg: "#装傻", fnc: "idiotActDumb" },
      ],
    });
  }
}
