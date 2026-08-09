import { Game } from "../entities/Game";
import { Card } from "../entities/Card";

import { v4 as uuidv4 } from "uuid";

export class UseCaseCreateGame {
  execute(level: number, gameName: string): Game {
    const cards = this.initializeCards(level);

    return new Game(uuidv4(), gameName, level, 0, cards, []);
  }

  private initializeCards(level: number): Card[] {
    const deck: Card[] = [];
    const usedValues = new Set<number>();

    // Number of pairs depends on game level.
    for (let i = 0; i < level; i++) {
      let value = 0;
      do {
        value = Math.floor(Math.random() * level) + 1;
      } while (usedValues.has(value));

      usedValues.add(value);
      const image = `img_${value}`;

      deck.push(new Card(uuidv4(), value, image));
      deck.push(new Card(uuidv4(), value, image));
    }

    // Shuffle using a Fisher-Yates pass for uniform randomness.
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    return deck;
  }
}
