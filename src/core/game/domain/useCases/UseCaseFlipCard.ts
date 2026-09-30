import { Card } from "../entities/Card";
import { Game } from "../entities/Game";
import { Player } from "../entities/Player";
import { StateCard } from "../entities/StateCard";
import { v4 as uuidv4 } from "uuid";

export class UseCaseFlipCard {
  execute(game: Game, cardId: string, playerId: string): Game | undefined {
    if (this.canClick(game, cardId, playerId)) {
      const cards = this.flipCard(game.cards, cardId);

      const players = this.checkMatchPlayers(game.players);

      return {
        id: uuidv4(),
        name: game.name,
        level: game.level,
        version: game.version + 1,
        cards: cards,
        players: players,
      } as Game;
    } else {
      return undefined;
    }
  }

  private logCanClickVariables(
    game: Game,
    cardId: string,
    playerId: string,
  ): void {
    const existsPlayerId = game.players.some((p) => p.id === playerId);

    const playerHasTurn = game.players.some(
      (p) => p.id === playerId && p.turn === true,
    );

    const isCurrentPlayerWithMoves = game.players.some(
      (p) => p.id === playerId && p.turn === true && p.remainMoves > 0,
    );

    const targetCard = game.cards.find((c) => c.id === cardId);
    const isTargetCardFaceDown = targetCard?.state === StateCard.FaceDown;

    console.log(`[UseCaseFlipCard][canClick] existsPlayerId:`, existsPlayerId);
    console.log(`[UseCaseFlipCard][canClick] playerHasTurn:`, playerHasTurn);
    console.log(
      `[UseCaseFlipCard][canClick] isCurrentPlayerWithMoves:`,
      isCurrentPlayerWithMoves,
    );
    console.log(`[UseCaseFlipCard][canClick] targetCard:`, targetCard);
    console.log(
      `[UseCaseFlipCard][canClick] isTargetCardFaceDown:`,
      isTargetCardFaceDown,
    );
  }

  canClick(game: Game, cardId: string, playerId: string): boolean {
    this.logCanClickVariables(game, cardId, playerId);

    return (
      game.players.some(
        (p) => p.id === playerId && p.turn === true && p.remainMoves > 0,
      ) && game.cards.find((c) => c.id === cardId)?.state === StateCard.FaceDown
    );
  }

  flipCard(cards: Card[], cardId: string): Card[] {
    const card = cards.find((c) => c.id === cardId);
    if (!card || card.state !== StateCard.FaceDown)
      throw new Error("Invalid card flip");

    const newCards = cards.map((c) =>
      c.id === cardId ? new Card(c.id, c.value, c.imgUrl, StateCard.FaceUp) : c,
    );

    return newCards;
  }

  checkMatchPlayers(players: Player[]): Player[] {
    const newPlayers = players.map((p) => {
      if (p.turn) {
        return new Player(
          p.id,
          p.name,
          p.order,
          p.remainMoves - 1,
          p.totalMoves + 1,
          p.points,
          true,
          p.jokers,
        );
      } else {
        return p;
      }
    });

    return newPlayers;
  }
}
