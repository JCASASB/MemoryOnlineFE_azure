import { Card } from "@core/game/domain/entities/Card";
import { Player } from "@core/game/domain/entities/Player";
import { StateCard } from "@core/game/domain/entities/StateCard";

export const card = (
  id: string,
  value: number,
  state: StateCard = StateCard.FaceDown,
): Card => new Card(id, value, `img_${value}`, state);

export const player = (
  id: string,
  turn: boolean,
  remainMoves = 2,
  totalMoves = 0,
  points = 0,
): Player => new Player(id, id, 0, remainMoves, totalMoves, points, turn);
