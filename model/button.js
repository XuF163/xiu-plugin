class xiubutton {
  xiuhelp() {
    return segment.button(
      [
        { text: "#正式开始", input: `#正式开始` },

      ],
    );
  }


   // { reg: "", fnc: "startGame" },
   //      // 白天指令
   //      { reg: "#发言 (.+)", fnc: "playerSpeak" }, // 使用正则捕获发言内容
   //      { reg: "#投票放逐 (.+)", fnc: "playerVote" }, // 使用正则捕获投票对象
   //      { reg: "#跳过|#skip", fnc: "playerSkipVote" },
   //      { reg: "#查看投票结果|#votes", fnc: "showVoteStatus" },
   //
   //      // 守卫
   //      { reg: "#守护 (.+)", fnc: "guardProtect" },
   //      // 白痴
   //      { reg: "#装傻", fnc: "idiotActDumb" },
}
export default new xiubutton();
