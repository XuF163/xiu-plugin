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
        { reg: "#投票放逐 (.+)", fnc: "playerVote" }, // 使用正则捕获投票对象
        { reg: "#跳过|#skip", fnc: "playerSkipVote" },
        { reg: "#查看投票结果|#votes", fnc: "showVoteStatus" },

        // 守卫
        { reg: "#守护 (.+)", fnc: "guardProtect" },
        // 白痴
        { reg: "#装傻", fnc: "idiotActDumb" },
      ],
    });
  }

  async startGame(e) {
    let langrenuid = await GameData.getUserIdsByRole(e.group_id, "普通狼人");
    e.reply(
      "天黑请闭眼！\r\n夜晚时长【2】分钟\r\n请【狼人】私聊我选择要杀害的玩家序号\r\n如【#击杀1】\r\n请【预言家】私聊我查验玩家身份\r\n如【#查验1】\r\n请【魔法师】私聊我救人或使用毒药\r\n如【#解药】",
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
        e.reply(
          "【已经是白天了】下面进入讨论和投票环节，请通过【#投票放逐 序号】投票，【#跳过】跳过投票,【#查看投票结果】查看当前投票状态",
        );
      } else {
        e.reply("昨晚是平安夜！");
      }
      // 清空 kill_queue
      await GameData.resetKillList(e.group_id);
      await GameData.resetGame(e.group_id);
    }, 120000);
  }

  async playerVote(e) {
    const groupId = e.group_id;
    const userId = e.user_id;
    const voteTargetMatch = e.msg.match(/#投票放逐\s*(\d+)/);
    if (!voteTargetMatch) {
      this.e.reply("请使用【#投票放逐 目标序号】的格式发送指令");
      return false;
    }

    const voteTargetId = parseInt(voteTargetMatch[1], 10);
    const players = await GameData.getAllRoles(groupId);
    const targetPlayer = players.find(
      (player) => player.player_index === voteTargetId,
    );
    if (!targetPlayer) {
      this.e.reply(`目标玩家 ${voteTargetId} 不存在`);
      return false;
    }
    await GameData.addVote(groupId, userId, voteTargetId);
    this.e.reply([segment.at(userId), `投票给了${voteTargetId}号玩家`]);
    logger.mark(`${userId} 在群组 ${groupId} 投票给了 ${voteTargetId}`);
    return true;
  }

  async playerSkipVote(e) {
    const groupId = e.group_id;
    const userId = e.user_id;
    await GameData.addVote(groupId, userId, "skip");
    this.e.reply([segment.at(userId), `选择跳过投票`]);
    logger.mark(`${userId} 在群组 ${groupId} 选择跳过投票`);
    return true;
  }
  async showVoteStatus(e) {
    const groupId = e.group_id;
    const votes = await GameData.getVotes(groupId);
    if (!votes || votes.length === 0) {
      this.e.reply("当前还没有玩家投票");
      return false;
    }
    const voteCounts = {};
    for (const vote of votes) {
      if (voteCounts[vote.target_id]) {
        voteCounts[vote.target_id]++;
      } else {
        voteCounts[vote.target_id] = 1;
      }
    }
    const players = await GameData.getAllRoles(groupId);
    const playerMap = {};
    for (const player of players) {
      playerMap[player.user_id] = player;
    }
    let voteStatusMessage = "当前投票状态：\n";
    for (const vote of votes) {
      const voter = playerMap[vote.user_id];
      const target =
        vote.target_id === "skip" ? "跳过" : playerMap[vote.target_id];
      voteStatusMessage += `${voter.name} 投票给了：${target === "跳过" ? "跳过" : target.name}\n`;
    }
    let maxVotes = 0;
    let banishedPlayer = null;
    for (const target in voteCounts) {
      if (target !== "skip" && voteCounts[target] > maxVotes) {
        maxVotes = voteCounts[target];
        banishedPlayer = target;
      }
    }
    if (banishedPlayer) {
      const banishedUser = playerMap[banishedPlayer];
      if (banishedUser) {
        voteStatusMessage += `\n白天投票放逐：${banishedUser.name}`;
      }
    } else {
      voteStatusMessage += "\n白天投票无人被放逐";
    }
    this.e.reply(voteStatusMessage);
    return true;
  }
}
