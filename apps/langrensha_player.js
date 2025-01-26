import GameData from "../lib/GameData.js";
import plugin from "../../../lib/plugins/plugin.js";
import gameData from "../lib/GameData.js";

export class LangrengshaPlayer extends plugin {
  constructor() {
    super({
      /** 功能名称 */
      name: "1",
      event: "message",
      /** 优先级，数字越小等级越高 */
      rule: [
        { reg: "#狼人杀帮助", fnc: "showHelp" },
        { reg: "#开启本群狼人杀", fnc: "groupinit" },
        { reg: "#加入游戏|#join", fnc: "joinGame" },
        { reg: "#分配职业", fnc: "chooseRole" },
        { reg: "#退出游戏|#leave", fnc: "leaveGame" },
        { reg: "#正式开始", fnc: "startGame" },
        { reg: "#玩家列表|#list", fnc: "showPlayerList" },
        { reg: "#查看状态|#status", fnc: "showGameStatus" },
      ],
    });
  }
  async showHelp(e) {
    this.e.reply("狼人杀规则");
    return true;
  }

  async groupinit(e) {
    this.e.reply("初始化游戏");
    await GameData.groupInit(e.group_id);
    return true;
  }
  async joinGame(e) {
    this.e.reply([segment.at(e.user_id), "加入游戏"]);
    await GameData.addOrUpdateUserRole(e.group_id, e.user_id);
    return true;
  }
  async chooseRole(e) {
    //待重写为自动分配
    //只取数字部分
    let user_select = e.msg.match(/\d+/g);
    if (!user_select || user_select.length === 0) {
      e.reply("请提供有效的角色序号。");
      return false;
    }
    const selectedIndex = parseInt(user_select[0], 10);

    const werewolfRoles = {
      villager: [
        "村民",
        "预言家",
        "女巫",
        "猎人",
        "守卫",
        "长老",
        "白痴",
        "骑士",
        "吹笛者",
      ], //序号对应00-09
      werewolf: ["普通狼人", "狼王", "白狼王", "隐狼", "狼美人", "恶灵骑士"], //序号对应10-15
      thirdParty: ["丘比特", "纵火犯", "小女孩", "盗贼"], //序号对应20-23
      other: ["警长"], //序号对应30
    };

    let role = null;

    if (selectedIndex >= 0 && selectedIndex <= 9) {
      role = werewolfRoles.villager[selectedIndex];
    } else if (selectedIndex >= 10 && selectedIndex <= 15) {
      role = werewolfRoles.werewolf[selectedIndex - 10];
    } else if (selectedIndex >= 20 && selectedIndex <= 23) {
      role = werewolfRoles.thirdParty[selectedIndex - 20];
    } else if (selectedIndex === 30) {
      role = werewolfRoles.other[0];
    }
    if (!role) {
      e.reply("无效的角色序号，请重新选择。");
      return false;
    }
    try {
      await GameData.addOrUpdateUserRole(e.group_id, e.user_id, role);
      e.reply([segment.at(e.user_id), `选择了 ${role} 角色`]);
      return true;
    } catch (error) {
      console.error("更新角色失败:", error);
      e.reply(`更新角色失败: ${error.message}`);
      return false;
    }
  }

  async showPlayerList(e) {
    this.e.reply("玩家列表读取中，请稍后...");
    let players = await GameData.getAllRoles(e.group_id);
    // let playerList = players.map(player => {
    //   this.e.reply( `${player.user_id}：${player.role}`)
    // })

    const playerList = players.map((player, index) => {
      logger.mark(player.user_id, player.role, index + 1);
      return [segment.at(player.user_id), `，序号为${index + 1}\r\n`];
    });

    e.reply([`群组 ${e.group_id} 的玩家信息：\n`].concat(...playerList));
    e.reply(
      "请先【私聊】派蒙发送【#我的角色】查看自己的角色\r\n如果大家都准备好了请发 【#正式开始】",
    );
    return true;
  }

  async startGame(e) {
    let langrenuid = gameData.getUserIdsByRole(e.group_id, "普通狼人");
    e.reply(
      "天黑请闭眼！\r\n请【狼人】私聊我选择要杀害的玩家序号\r\n如【#击杀1】",
    );
  }
}
