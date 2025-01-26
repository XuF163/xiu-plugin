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
        { reg: "#正式开始", fnc: "startGame" },
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

  async startGame(e) {
    let langrenuid = GameData.getUserIdsByRole(e.group_id, "普通狼人");
    e.reply(
      "天黑请闭眼！\r\n请【狼人】私聊我选择要杀害的玩家序号\r\n如【#击杀1】\r\n请【预言家】私聊我查验玩家身份\r\n如【#查验1】\r\n请【魔法师】私聊我救人或使用毒药\r\n如【#解药】",
    );
    //倒计时两分钟
    setTimeout(async () => {
      e.reply("天亮请睁眼！");
      // 获取 kill_queue
      const killQueue = await GameData.getKillList(e.group_id);
      console.log(`killQueue: ${killQueue}`);

      if (killQueue && killQueue.length > 0) {
        let killListMessage = "昨晚被击杀的玩家：\r\n";
        for (const userId of killQueue) {
          const user = await GameData.getRole(e.group_id, userId);
          killListMessage += `${user} \r\n`;
          await GameData.removeRole(e.group_id, userId);
        }
        e.reply(killListMessage);
      } else {
        e.reply("昨晚是平安夜！");
      }
      // 清空 kill_queue
      await GameData.resetKillList(e.group_id);
      await GameData.resetGame(e.group_id);
    }, 120000);
  }
}
