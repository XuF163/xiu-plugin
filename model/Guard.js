// GuardGameData.js
import { GameData } from "../../../plugins/xiu-plugin/lib/GameData.js";

class Guard extends GameData {
  constructor(dbPath) {
    super(dbPath);
  }

  async setGuardProtect(groupId, userId) {
    const game = await this.getGame(groupId);
    if (!game) return;
    game.guardProtect = userId;
    await this.setGame(groupId, game);
  }

  async getGuardProtect(groupId) {
    const game = await this.getGame(groupId);
    if (!game) return null;
    return game.guardProtect;
  }

  async resetGuardProtect(groupId) {
    const game = await this.getGame(groupId);
    if (!game) return;
    game.guardProtect = null;
    await this.setGame(groupId, game);
  }
}

export default new Guard("./plugins/xiu-plugin/data/gangrenous/game.db");
