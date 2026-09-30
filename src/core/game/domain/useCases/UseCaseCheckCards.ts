import { Card } from "../entities/Card";
import { Game } from "../entities/Game";
import { Player } from "../entities/Player";
import { StateCard } from "../entities/StateCard";
import { v4 as uuidv4 } from "uuid";

export class UseCaseCheckCards {
  execute(game: Game): Game | undefined {
    const cardsRevealedAndNotMatched = this.getCardsWithStateFaceUp(game);

    if (cardsRevealedAndNotMatched.length === 2) {
      const cards = this.checkMatch(game.cards, cardsRevealedAndNotMatched);

      const revealedIdCards = this.getCardsRevealedAndNotMatched(game.cards);

      const players = this.checkMatchPlayers(game.players, revealedIdCards);

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

  getCardsRevealedAndNotMatched(cards: Card[]): [string, number][] {
    return cards
      .filter((c) => c.state === StateCard.FaceUp)
      .map((c) => [c.id, c.value]);
  }

  checkMatch(cards: Card[], revealedIdCards: string[]): Card[] {
    let newCards = [];

    const isMatch =
      cards.find((c) => c.id === revealedIdCards[0])?.value ===
      cards.find((c) => c.id === revealedIdCards[1])?.value;

    newCards = cards.map((c) => {
      if (c.id === revealedIdCards[0] || c.id === revealedIdCards[1]) {
        if (isMatch) {
          return new Card(c.id, c.value, c.imgUrl, StateCard.Matched);
        } else {
          return new Card(c.id, c.value, c.imgUrl, StateCard.FaceDown);
        }
      } else {
        return c;
      }
    });

    return newCards;
  }

  getCardsWithStateFaceUp(game: Game): string[] {
    return game.cards
      .filter((c) => c.state === StateCard.FaceUp)
      .map((c) => c.id);
  }

  checkMatchPlayers(
    players: Player[],
    revealedIdCards: [string, number][],
  ): Player[] {
    if (revealedIdCards.length === 2) {
      const isMatch = revealedIdCards[0][1] === revealedIdCards[1][1];

      const newPlayers = players.map((p) => {
        if (isMatch) {
          if (p.turn) {
            return new Player(
              p.id,
              p.name,
              p.order,
              2,
              p.totalMoves,
              p.points + 1,
              true,
              p.jokers,
            );
          } else {
            return p;
          }
        }
        //not a match, so change the turn to the other player
        else {
          if (p.turn) {
            return new Player(
              p.id,
              p.name,
              p.order,
              2,
              p.totalMoves,
              p.points,
              false,
              p.jokers,
            );
          } else {
            return new Player(
              p.id,
              p.name,
              p.order,
              p.remainMoves,
              p.totalMoves,
              p.points,
              true,
              p.jokers,
            );
          }
        }
      });

      return newPlayers;
    } else {
      return players;
    }
  }
}
