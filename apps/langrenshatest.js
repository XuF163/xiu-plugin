// langrenshatest.js

// lrs.js
import GameData from "../lib/GameData.js";
import plugin from "../../../lib/plugins/plugin.js";

export class lrs extends plugin {
  constructor() {
    super({
      /** 功能名称 */
      name: "1",
      event: "message",
      /** 优先级，数字越小等级越高 */
      rule: [{ reg: "狼人杀数据测试", fnc: "ma" }],
    });
  }

  async ma(e) {
    console.log("用户id检查", e.user_id);
    console.log("群组id", e.group_id);
    try {
      this.e.reply(e.isGroup ? "群" : "私聊");
      // 直接使用导入的单例实例 gameData
      await GameData.addRole("group123", "user1", "狼人1");
      await GameData.addRole("group123", "user2", "村民2");
      await GameData.addRole("group456", "user3", "预言家3");

      const role1 = await GameData.getRole("group123", "user1");
      console.log("user1 role in group123:", role1);

      const allRoles = await GameData.getAllRoles("group123");
      console.log("all roles in group123:", allRoles);

      await GameData.removeRole("group123", "user1");
      const role2 = await GameData.getRole("group123", "user1");
      console.log("user1 role in group123 after remove:", role2);

      // await GameData.removeAllRoles('group123')
      const allRoles2 = await GameData.getAllRoles("group123");
      console.log("all roles in group123 after remove all:", allRoles2);
    } catch (error) {
      console.error("Error during operations:", error);
    }
    // } finally {
    //   console.log('2333')
    // }
  }
}

//
// import GameData from '../lib/GameData.js';
// export class lrs extends plugin {
//   constructor () {
//     super({
//       /** 功能名称 */
//       name: '1',
//
//       event: 'message',
//       /** 优先级，数字越小等级越高 */
//
//       rule: [
//         { reg: '狼人杀数据测试', fnc: 'ma' }
//       ]
//     })
//   }
//
//   async ma () {
//     const gameData = new GameData('./plugins/xiu-plugin/data/gangrenous/game.db')
//
//     try {
//       await gameData.addRole('group123', 'user1', '狼人')
//       await gameData.addRole('group123', 'user2', '村民')
//       await gameData.addRole('group456', 'user3', '预言家')
//
//       const role1 = await gameData.getRole('group123', 'user1')
//       console.log('user1 role in group123:', role1)
//
//       const allRoles = await gameData.getAllRoles('group123')
//       console.log('all roles in group123:', allRoles)
//
//       await gameData.removeRole('group123', 'user1')
//       const role2 = await gameData.getRole('group123', 'user1')
//       console.log('user1 role in group123 after remove:', role2)
//
//       await gameData.removeAllRoles('group123')
//       const allRoles2 = await gameData.getAllRoles('group123')
//       console.log('all roles in group123 after remove all:', allRoles2)
//     } catch (error) {
//       console.error('Error during operations:', error)
//     }
//     // } finally {
//     //   console.log('2333')
//     // }
//   }
// }
