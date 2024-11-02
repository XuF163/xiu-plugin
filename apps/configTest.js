
import Config from '../../../plugins/xiu-plugin/lib/config.js'

export class configTest extends plugin {
  constructor () {
    super({
      /** 功能名称 */
      name: '1',

      event: 'message',
      /** 优先级，数字越小等级越高 */

      rule: [
        { reg: 'asdfg', fnc: 'tst'}
      ]
    })
  }

  /**
   * updateCopyPlugin
   * @returns {Promise<boolean>}
   */
  async tst () {
    console.log(`Config.testid`)
      await this.e.reply(Config.testid)

  }
}

