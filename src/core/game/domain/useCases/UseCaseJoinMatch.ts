import { Game } from "../entities/Game";
import { Joker } from "../entities/Joker";
import { JokerType } from "../entities/JokerType";
import { Player } from "../entities/Player";

import { v4 as uuidv4 } from "uuid";
import { StateCard } from "../entities/StateCard";

export class UseCaseJoinMatch {
  private existsPlayerInGame(game: Game, playerId: string): boolean {
    return game.players.some((p) => p.id === playerId);
  }

  private isFinished(game: Game): boolean {
    return game.cards.every((card) => card.state === StateCard.Matched);
  }

  private getNewPlayer(
    playerName: string,
    playerId: string,
    playersInGame: Player[],
  ): Player {
    return new Player(
      playerId,
      playerName,
      playersInGame.length,
      2,
      0,
      0,
      playersInGame.length === 0,
      [new Joker(uuidv4(), "extracard", JokerType.ExtraCard, 1)],
    );
  }

  execute(game: Game, playerName: string, playerId: string): Game {
    if (this.existsPlayerInGame(game, playerId) || this.isFinished(game)) {
      throw new Error("Player already in the game or game is finished");
    }

    const player = this.getNewPlayer(playerName, playerId, game.players);

    const allPlayers = [...game.players, player];

    return {
      id: uuidv4(),
      name: game.name,
      level: game.level,
      version: game.version + 1,
      cards: game.cards,
      players: allPlayers,
    } as Game;
  }
}
