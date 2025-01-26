import GameData from "../lib/GameData.js";
import plugin from "../../../lib/plugins/plugin.js";

export class LabgrenshaPlayer extends plugin {
  constructor() {
    super({
      /** 功能名称 */
      name: "1",
      event: "message",
      /** 优先级，数字越小等级越高 */
      rule: [
        { reg: "#帮助|#help", fnc: "showHelp" },
        { reg: "#加入游戏|#join", fnc: "joinGame" },
        { reg: "#退出游戏|#leave", fnc: "leaveGame" },
        { reg: "#玩家列表|#list", fnc: "showPlayerList" },
        { reg: "#查看状态|#status", fnc: "showGameStatus" },
      ],
    });
  }
}
