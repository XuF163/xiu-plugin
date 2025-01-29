export class bainian extends plugin {
  constructor() {
    super({
      name: "文字链测试",
      dsc: "",
      event: "message",
      priority: 5000,
      rule: [
        {
          /** 命令正则匹配 */
          reg: "^#123",
          /** 执行方法 */
          fnc: "test",
          permission: "master",
        },
        { reg: "^#领取我的新年祝福", fnc: "bainian" },
      ],
    });
  }

  async test() {
    let msg1 =
      "･ᴗ･✨除夕快乐！祝你在蛇年里，财源滚滚，幸福美满！像小蛇一样灵活，生活充满惊喜哦！(≧▽≦)/❤\r\n️";
    //   let msg = `[a](mqqapi://aio/inlinecmd?command=${encodeURIComponent('标记')}&reply=false&enter=true)\r\n`
    let _msg = `[新年快乐](mqqapi://aio/inlinecmd?command=${encodeURIComponent("新年快乐")}&reply=false&enter=true)`;
    this.e.reply([
      segment.image(
        "https://img.kookapp.cn/assets/2025-01/28/yb8LWALYt20cw09i.png",
      ),
      msg1,
      _msg,
    ]);
  }

  async bainian() {
    const text = [
      "金蛇狂舞辞旧岁，骏马奔腾迎新春。愿君如灵蛇般睿智敏捷，洞悉机遇，把握良机；如骏马般意气风发，驰骋千里，成就辉煌！",
      "蛇盘玉柱，福满乾坤。愿你在新的一年里，如灵蛇般吐故纳新，不断突破自我；如青松般坚韧不拔，勇攀人生高峰！",
      "龙蛇飞动，笔走龙蛇。愿你在蛇年才思泉涌，学业进步，事业有成，书写属于自己的精彩篇章！",
      "灵蛇献瑞，紫气东来。愿你新的一年，如灵蛇般灵动洒脱，活出精彩人生；如朝阳般充满希望，拥抱美好未来！",
      "小蛇扭扭，快乐悠悠。愿你在新的一年里，像小蛇一样活泼可爱，健康快乐成长！",
      "蛇年画蛇，妙笔生花。愿你在新的一年里，像小画家一样充满想象力，画出五彩斑斓的童年！",
      "灵蛇吐信，智慧开启。愿你在新的一年里，像小博士一样聪明伶俐，学习进步，天天向上！",
      "金蛇送福，快乐常驻。愿你在新的一年里，像小太阳一样温暖明亮，照亮身边的每一个人！",
      "蛇年吉祥，万事如意！愿幸福如蛇般缠绕你左右，快乐如蛇般与你形影不离！",
      "金蛇狂舞，福满人间！愿新的一年，烦恼如蛇般溜走，好运如蛇般常伴！",
      "灵蛇献瑞，紫气东来！愿新的一年，事业如蛇般腾飞，生活如蛇般精彩！",
      "蛇年行大运，万事皆顺心！愿新的一年，梦想如蛇般灵动，未来如蛇般辉煌！",
      "祝你在蛇年里，财源滚滚，幸福美满！像小蛇一样灵活，生活充满惊喜哦！",
    ];
    const biaoqing = [
      "(≧▽≦)/",
      "❤(◕‿◕✿)",
      "٩(◕‿◕｡)۶",
      "☆*:.｡.o(≧▽≦)o.｡.:*☆",
      "(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧",
      "ヽ(✿ﾟ▽ﾟ)ノ",
      "(｡♥‿♥｡)",
      "(★ω★)/",
      "(づ｡◕‿‿◕｡)づ",
      "(ﾉ´ヮ`)ﾉ*: ･ﾟ",
    ];
    const random = Math.floor(Math.random() * text.length);
    const random2 = Math.floor(Math.random() * biaoqing.length);
    const msg = text[random] + biaoqing[random2];
    let _msg = `[新年快乐](mqqapi://aio/inlinecmd?command=${encodeURIComponent("新年快乐")}&reply=false&enter=true)`;
    let jixu = `[新年快乐](mqqapi://aio/inlinecmd?command=${encodeURIComponent("新年快乐")}&reply=false&enter=true)`;
    //this.e.reply([msg,segment.button([{text:"接",callback:"#领取我的新年祝福"}])])
    this.e.reply([msg, _msg, jixu]);
  }
}
